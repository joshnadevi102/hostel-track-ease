import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, Panel } from "@/components/cc/StatCard";
import { useMe } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/constants";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — CampusCare" }, { name: "description", content: "Your CampusCare profile." }] }),
  component: Profile,
});

function Profile() {
  const { data: me } = useMe();
  const qc = useQueryClient();
  const [f, setF] = useState({ name: "", phone: "", room: "" });
  useEffect(() => {
    if (me) setF({ name: me.name, phone: me.phone ?? "", room: me.room_number ?? "" });
  }, [me]);
  if (!me) return null;
  const save = async () => {
    if (f.name.trim().length < 2) return void toast.error("Enter your name");
    const { error } = await supabase
      .from("profiles")
      .update({ name: f.name.trim().slice(0, 80), phone: f.phone.trim().slice(0, 20) || null, room_number: f.room.trim().slice(0, 20) || null })
      .eq("id", me.id);
    if (error) return void toast.error(error.message);
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["me"] });
  };
  return (
    <>
      <PageHeader title="Profile" subtitle={`${ROLE_LABEL[me.role]} · ${me.email}`} />
      <Panel className="max-w-xl">
        <div className="space-y-4">
          <div className="space-y-2"><Label>Name</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="space-y-2"><Label>Phone</Label><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
          <div className="space-y-2"><Label>Hostel</Label><Input value={me.hostel_name ?? "Not set (ask an admin)"} disabled /></div>
          <div className="space-y-2"><Label>Room number</Label><Input value={f.room} onChange={(e) => setF({ ...f, room: e.target.value })} /></div>
          <Button onClick={save}>Save changes</Button>
        </div>
      </Panel>
    </>
  );
}
