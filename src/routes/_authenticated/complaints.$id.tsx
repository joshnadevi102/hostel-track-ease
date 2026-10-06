import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/cc/StatCard";
import { ActivityTimeline, StatusStepper } from "@/components/cc/Timeline";
import { useComplaint } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/complaints/$id")({
  head: () => ({ meta: [{ title: "Complaint — CampusCare" }] }),
  component: () => {
    const { id } = Route.useParams();
    const { data } = useComplaint(id);
    const c = data?.complaint;
    if (!c) return <p className="text-sm text-muted-foreground">Loading…</p>;
    return (<div className="space-y-4"><PageHeader title={c.title} subtitle={c.complaint_number} /><Panel><StatusStepper status={c.status} /></Panel><Panel title="Activity"><ActivityTimeline items={data.history} /></Panel></div>);
  },
});
