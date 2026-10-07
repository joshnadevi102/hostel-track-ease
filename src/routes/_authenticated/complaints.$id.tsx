import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, Panel } from "@/components/cc/StatCard";
import { PriorityBadge, StatusBadge } from "@/components/cc/badges";
import { ActivityTimeline, StatusStepper } from "@/components/cc/Timeline";
import { errMsg, uploadComplaintImage, useAssignees, useComplaint, useTeams, type ComplaintRow } from "@/lib/data";
import { useMe, type Me } from "@/lib/auth";
import { NEXT_ACTION, PRIORITIES, PRIORITY_LABEL, ROLE_LABEL, type Priority } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/complaints/$id")({
  head: () => ({ meta: [{ title: "Complaint details — CampusCare" }, { name: "description", content: "Complaint status and timeline." }] }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const { data, isLoading } = useComplaint(id);
  const { data: me } = useMe();
  if (isLoading || !me) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const c = data?.complaint;
  if (!c) return <p className="text-sm text-muted-foreground">Complaint not found or you don't have access.</p>;
  const imgs = data.images;
  const reported = imgs.filter((i) => i.image_type === "complaint" || i.image_type === "before" || i.image_type === "verification");
  const after = imgs.filter((i) => i.image_type === "after");

  return (
    <div className="space-y-6">
      <Link to="/complaints" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="mr-1 h-4 w-4" /> All complaints</Link>
      <PageHeader title={c.title} subtitle={`${c.complaint_number} · ${c.category?.name ?? "Uncategorised"}`} actions={<><PriorityBadge priority={c.priority} /><StatusBadge status={c.status} /></>} />
      <Panel title="Status"><StatusStepper status={c.status} /></Panel>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Details">
            <p className="whitespace-pre-wrap text-sm">{c.description}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <Info k="Student" v={c.student?.name} />
              <Info k="Hostel" v={c.hostel?.name} />
              <Info k="Room / Location" v={[c.room_number, c.location_name].filter(Boolean).join(" · ") || "—"} />
              <Info k="Created" v={format(new Date(c.created_at), "d MMM yyyy, h:mm a")} />
              <Info k="Updated" v={format(new Date(c.updated_at), "d MMM yyyy, h:mm a")} />
              <Info k="Assigned to" v={[c.assignee?.name, c.team?.name].filter(Boolean).join(" · ") || "Not assigned"} />
            </dl>
            {c.verification_notes && <Note label="Verification notes" text={c.verification_notes} />}
            {c.resolution_notes && <Note label="Resolution notes" text={c.resolution_notes} />}
          </Panel>
          <Panel title="Images">
            <div className="grid gap-4 sm:grid-cols-2">
              <Gallery label="Complaint / before" items={reported} />
              <Gallery label="Resolution / after" items={after} />
            </div>
          </Panel>
        </div>
        <div className="space-y-6">
          <Actions c={c} me={me} />
          <Panel title="Activity"><ActivityTimeline items={data.history} /></Panel>
        </div>
      </div>
    </div>
  );
}

function Info({ k, v }: { k: string; v?: string | null | undefined }) {
  return (<div><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium">{v || "—"}</dd></div>);
}
function Note({ label, text }: { label: string; text: string }) {
  return (<div className="mt-4 rounded-xl bg-surface p-3 text-sm"><p className="text-xs font-semibold text-muted-foreground">{label}</p><p>{text}</p></div>);
}
function Gallery({ label, items }: { label: string; items: { id: string; url: string }[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-muted-foreground">{label}</p>
      {items.length ? (
        <div className="grid grid-cols-2 gap-2">
          {items.map((i) => (
            <a key={i.id} href={i.url} target="_blank" rel="noreferrer"><img src={i.url} alt={label} loading="lazy" className="aspect-square w-full rounded-xl object-cover" /></a>
          ))}
        </div>
      ) : <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">No images</div>}
    </div>
  );
}

function Actions({ c, me }: { c: ComplaintRow; me: Me }) {
  const qc = useQueryClient();
  const { data: people = [] } = useAssignees();
  const { data: teams = [] } = useTeams();
  const [note, setNote] = useState("");
  const [assignee, setAssignee] = useState(c.assigned_to ?? "");
  const [team, setTeam] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const sameHostel = !me.hostel_id || me.hostel_id === c.hostel_id;
  const isMgr = me.role === "admin" || ((me.role === "warden" || me.role === "volunteer") && sameHostel);
  const isWarden = me.role === "admin" || (me.role === "warden" && sameHostel);
  const isAssignee = c.assigned_to === me.id;
  const next = NEXT_ACTION[c.status];

  const can =
    next &&
    ((next.to === "verified" && isMgr) ||
      (next.to === "assigned" && isMgr) ||
      ((next.to === "in_progress" || next.to === "resolved") && (isWarden || isAssignee)) ||
      (next.to === "closed" && isWarden));
  const canReassign = isMgr && (c.status === "assigned" || c.status === "in_progress");

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["complaint", c.id] });
    qc.invalidateQueries({ queryKey: ["complaints"] });
  };

  const run = async (fn: () => Promise<void>, ok: string) => {
    setBusy(true);
    try {
      await fn();
      toast.success(ok);
      setNote("");
      setFile(null);
      refresh();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const advance = (to = next!.to) =>
    run(async () => {
      if (to === "assigned" && !assignee) throw new Error("Choose a person to assign");
      if (file) {
        const type = to === "resolved" ? "after" : to === "verified" ? "verification" : "before";
        await uploadComplaintImage(me.id, c.id, file, type);
      }
      const args: { _complaint_id: string; _new_status: typeof to; _note?: string; _assigned_to?: string; _team_id?: string } = { _complaint_id: c.id, _new_status: to };
      if (note.trim()) args._note = note.trim();
      if (to === "assigned") args._assigned_to = assignee;
      if (to === "assigned" && team) args._team_id = team;
      const { error } = await supabase.rpc("update_complaint_status", args);
      if (error) throw error;
    }, "Complaint updated");

  const setPriority = (p: Priority) =>
    run(async () => {
      const { error } = await supabase.rpc("set_complaint_priority", { _complaint_id: c.id, _priority: p });
      if (error) throw error;
    }, "Priority updated");

  const addNote = () =>
    run(async () => {
      if (file) await uploadComplaintImage(me.id, c.id, file, c.status === "in_progress" ? "after" : "verification");
      if (note.trim()) {
        const { error } = await supabase.rpc("add_complaint_note", { _complaint_id: c.id, _note: note.trim() });
        if (error) throw error;
      }
    }, "Saved");

  if (me.role === "student" && !isAssignee) {
    return (
      <Panel title="Need help?">
        <p className="text-sm text-muted-foreground">
          {c.status === "closed" ? "This complaint is closed. Thanks for helping us improve your hostel." : "We'll notify you as soon as the status changes."}
        </p>
      </Panel>
    );
  }

  const showAssign = (next?.to === "assigned" && can) || canReassign;

  return (
    <Panel title="Actions">
      <div className="space-y-4">
        {isMgr && c.status !== "closed" && (
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={c.priority} onValueChange={(v) => setPriority(v as Priority)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{PRIORITY_LABEL[p]}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
        {showAssign && (
          <>
            <div className="space-y-2">
              <Label>Assign to person</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger><SelectValue placeholder="Select staff / volunteer" /></SelectTrigger>
                <SelectContent>
                  {people.map((p) => <SelectItem key={p.id + p.role} value={p.id}>{p.name} · {ROLE_LABEL[p.role]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Team (optional)</Label>
              <Select value={team} onValueChange={setTeam}>
                <SelectTrigger><SelectValue placeholder="Select team" /></SelectTrigger>
                <SelectContent>{teams.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </>
        )}
        {c.status !== "closed" && (
          <>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder={next?.to === "resolved" ? "What was fixed?" : "Add a note…"} maxLength={1000} />
            </div>
            <div className="space-y-2">
              <Label>{next?.to === "resolved" ? "Resolution (after) photo" : "Supporting photo"}</Label>
              <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
          </>
        )}
        <div className="flex flex-col gap-2">
          {can && <Button disabled={busy} onClick={() => advance()}>{next!.label}</Button>}
          {canReassign && <Button variant="outline" disabled={busy} onClick={() => advance("assigned")}>Reassign</Button>}
          {c.status !== "closed" && <Button variant="ghost" disabled={busy || (!note.trim() && !file)} onClick={addNote}>Save note / photo only</Button>}
          {!can && !canReassign && c.status !== "closed" && <p className="text-xs text-muted-foreground">Waiting on another role to take the next step.</p>}
          {c.status === "closed" && <p className="text-sm text-muted-foreground">This complaint is closed.</p>}
        </div>
      </div>
    </Panel>
  );
}
