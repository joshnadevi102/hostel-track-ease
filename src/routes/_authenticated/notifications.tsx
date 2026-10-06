import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/cc/StatCard";
import { useNotifications } from "@/components/cc/AppShell";
import { useMe } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — CampusCare" }] }),
  component: () => {
    const { data: me } = useMe();
    const { data } = useNotifications(me?.id);
    return (<><PageHeader title="Notifications" /><Panel>{(data ?? []).map((n) => (<div key={n.id} className="border-b py-3 last:border-0"><p className="font-medium">{n.title}</p><p className="text-sm text-muted-foreground">{n.message}</p></div>))}</Panel></>);
  },
});
