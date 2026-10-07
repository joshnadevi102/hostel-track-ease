import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/cc/StatCard";
import { useNotifications } from "@/components/cc/AppShell";
import { useMe } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — CampusCare" }, { name: "description", content: "Your complaint updates." }] }),
  component: Notifications,
});

function Notifications() {
  const { data: me } = useMe();
  const { data = [] } = useNotifications(me?.id);
  const qc = useQueryClient();
  const markAll = async () => {
    if (!me) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", me.id).eq("is_read", false);
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };
  const markOne = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };
  return (
    <>
      <PageHeader title="Notifications" subtitle="Updates arrive here instantly" actions={<Button variant="outline" onClick={markAll}>Mark all read</Button>} />
      <Panel>
        {!data.length && <div className="py-10 text-center text-sm text-muted-foreground"><Bell className="mx-auto mb-2 h-6 w-6" />No notifications yet.</div>}
        {data.map((n) => (
          <div key={n.id} className={cn("flex items-start justify-between gap-3 border-b py-3 last:border-0", !n.is_read && "font-medium")}>
            <div className="flex gap-3">
              <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.is_read ? "bg-border" : "bg-primary")} />
              <div>
                <p className="text-sm">{n.title}</p>
                <p className="text-sm font-normal text-muted-foreground">{n.message}</p>
                <p className="text-xs font-normal text-muted-foreground">{formatDistanceToNow(new Date(n.created_at))} ago</p>
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              {n.complaint_id && <Button size="sm" variant="ghost" asChild><Link to="/complaints/$id" params={{ id: n.complaint_id }} onClick={() => markOne(n.id)}>Open</Link></Button>}
              {!n.is_read && <Button size="sm" variant="ghost" onClick={() => markOne(n.id)}>Mark read</Button>}
            </div>
          </div>
        ))}
      </Panel>
    </>
  );
}
