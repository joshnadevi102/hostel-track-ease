import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, Panel } from "@/components/cc/StatCard";
import { useMe } from "@/lib/auth";
import { errMsg, uploadComplaintImage, useCategories, useHostels } from "@/lib/data";
import { PRIORITIES, PRIORITY_LABEL, type Priority } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/complaints/new")({
  validateSearch: (s: Record<string, unknown>): { qr?: string | undefined } => ({ qr: typeof s["qr"] === "string" ? s["qr"] : undefined }),
  head: () => ({ meta: [{ title: "Raise Complaint — CampusCare" }, { name: "description", content: "Report a hostel problem." }] }),
  component: NewComplaint,
});

const schema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().trim().min(5, "Please describe the problem").max(2000),
  room: z.string().trim().max(20),
});

function NewComplaint() {
  const { qr } = Route.useSearch();
  const { data: me } = useMe();
  const { data: hostels } = useHostels();
  const { data: cats } = useCategories();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [f, setF] = useState({ category: "", hostel: "", room: "", location: "", title: "", description: "", priority: "medium" as Priority });

  useEffect(() => {
    if (me && !f.hostel) setF((p) => ({ ...p, hostel: me.hostel_id ?? "", room: me.room_number ?? "" }));
  }, [me]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!qr) return;
    supabase.from("qr_locations").select("*").eq("qr_code", qr).maybeSingle().then(({ data }) => {
      if (data) setF((p) => ({ ...p, hostel: data.hostel_id, room: data.room_number ?? p.room, location: data.location_name }));
    });
  }, [qr]);

  const submit = async () => {
    if (!me) return;
    const p = schema.safeParse(f);
    if (!p.success) return void toast.error(p.error.issues[0]?.message ?? "Invalid input");
    if (!f.category || !f.hostel) return void toast.error("Select a category and hostel");
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("complaints")
        .insert({
          student_id: me.id,
          hostel_id: f.hostel,
          category_id: f.category,
          title: p.data.title,
          description: p.data.description,
          room_number: p.data.room || null,
          location_name: f.location || null,
          priority: f.priority,
          status: "submitted",
        })
        .select("id")
        .single();
      if (error) throw error;
      if (file) await uploadComplaintImage(me.id, data.id, file, "complaint");
      qc.invalidateQueries({ queryKey: ["complaints"] });
      toast.success("Complaint submitted successfully");
      navigate({ to: "/complaints/$id", params: { id: data.id } });
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Raise Complaint" subtitle="Tell us what's wrong — we'll take it from here." />
      <Panel className="max-w-3xl">
        {f.location && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm text-accent-foreground">
            <MapPin className="h-4 w-4" /> Location from QR code: <b>{f.location}</b>
          </div>
        )}
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>{(cats ?? []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={f.priority} onValueChange={(v) => setF({ ...f, priority: v as Priority })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{PRIORITY_LABEL[p]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Hostel</Label>
            <Select value={f.hostel} onValueChange={(v) => setF({ ...f, hostel: v })}>
              <SelectTrigger><SelectValue placeholder="Select hostel" /></SelectTrigger>
              <SelectContent>{(hostels ?? []).map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Room number / location</Label>
            <Input value={f.room} onChange={(e) => setF({ ...f, room: e.target.value })} placeholder="e.g. 112" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Title</Label>
            <Input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Water purifier not working" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Description</Label>
            <Textarea rows={4} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Describe the problem…" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Photo (optional, max 5 MB)</Label>
            <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            {file && <img src={URL.createObjectURL(file)} alt="Preview" className="mt-2 h-32 rounded-xl object-cover" />}
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={busy} className="w-full sm:w-auto">{busy ? "Submitting…" : "Submit complaint"}</Button>
          </div>
        </form>
      </Panel>
    </>
  );
}
