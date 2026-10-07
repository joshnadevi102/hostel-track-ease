import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, ClipboardList, Clock, Hourglass, Lock, Plus, ShieldQuestion, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, StatCard, StatGrid } from "@/components/cc/StatCard";
import { ComplaintTable, FilterableComplaints } from "@/components/cc/ComplaintList";
import { useComplaints, type ComplaintRow } from "@/lib/data";
import { useMe } from "@/lib/auth";
import { OPEN_STATUSES } from "@/lib/constants";
import { AdminAnalytics } from "@/components/cc/Analytics";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CampusCare" }, { name: "description", content: "Your CampusCare dashboard." }] }),
  component: Dashboard,
});

const count = (r: ComplaintRow[], f: (c: ComplaintRow) => boolean) => r.filter(f).length;

function Dashboard() {
  const { data: me } = useMe();
  const { data = [], isLoading } = useComplaints();
  if (!me || isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  const raise = (
    <Button asChild><Link to="/complaints/new"><Plus className="mr-1 h-4 w-4" /> Raise Complaint</Link></Button>
  );

  if (me.role === "student") {
    return (
      <div className="space-y-6">
        <PageHeader title="My Dashboard" subtitle={`${me.hostel_name ?? "No hostel"}${me.room_number ? ` · Room ${me.room_number}` : ""}`} actions={raise} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <StatCard label="Total" value={data.length} icon={ClipboardList} />
          <StatCard label="Pending" value={count(data, (c) => ["submitted", "verified", "assigned"].includes(c.status))} icon={Hourglass} tone="text-st-assigned bg-st-assigned/10" />
          <StatCard label="In Progress" value={count(data, (c) => c.status === "in_progress")} icon={Wrench} tone="text-st-progress bg-st-progress/15" />
          <StatCard label="Resolved" value={count(data, (c) => c.status === "resolved")} icon={CheckCircle2} tone="text-st-resolved bg-st-resolved/10" />
          <StatCard label="Closed" value={count(data, (c) => c.status === "closed")} icon={Lock} tone="text-st-closed bg-st-closed/10" />
        </div>
        <Panel title="My complaints"><FilterableComplaints rows={data} showHostel={false} showStudent={false} /></Panel>
      </div>
    );
  }

  if (me.role === "staff") {
    const mine = data.filter((c) => c.assigned_to === me.id);
    return (
      <div className="space-y-6">
        <PageHeader title="My Work" subtitle="Complaints assigned to you" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="To start" value={count(mine, (c) => c.status === "assigned")} icon={Hourglass} />
          <StatCard label="In progress" value={count(mine, (c) => c.status === "in_progress")} icon={Wrench} tone="text-st-progress bg-st-progress/15" />
          <StatCard label="Resolved" value={count(mine, (c) => c.status === "resolved")} icon={CheckCircle2} tone="text-st-resolved bg-st-resolved/10" />
          <StatCard label="Closed" value={count(mine, (c) => c.status === "closed")} icon={Lock} tone="text-st-closed bg-st-closed/10" />
        </div>
        <Panel title="Active work"><ComplaintTable rows={mine.filter((c) => c.status === "assigned" || c.status === "in_progress")} /></Panel>
        <Panel title="All assigned"><FilterableComplaints rows={mine} /></Panel>
      </div>
    );
  }

  if (me.role === "volunteer") {
    return (
      <div className="space-y-6">
        <PageHeader title="Volunteer Dashboard" subtitle={me.hostel_name ?? "All hostels"} actions={raise} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Pending verification" value={count(data, (c) => c.status === "submitted")} icon={ShieldQuestion} tone="text-st-submitted bg-st-submitted/10" />
          <StatCard label="To assign" value={count(data, (c) => c.status === "verified")} icon={ClipboardList} tone="text-st-verified bg-st-verified/10" />
          <StatCard label="In progress" value={count(data, (c) => c.status === "in_progress" || c.status === "assigned")} icon={Wrench} tone="text-st-progress bg-st-progress/15" />
          <StatCard label="Recently completed" value={count(data, (c) => c.status === "resolved" || c.status === "closed")} icon={CheckCircle2} tone="text-st-resolved bg-st-resolved/10" />
        </div>
        <Panel title="Needs your attention"><ComplaintTable rows={data.filter((c) => c.status === "submitted" || c.status === "verified")} /></Panel>
        <Panel title="All hostel complaints"><FilterableComplaints rows={data} showHostel={false} /></Panel>
      </div>
    );
  }

  const stats = (
    <StatGrid>
      <StatCard label="Total" value={data.length} icon={ClipboardList} />
      <StatCard label="Pending verification" value={count(data, (c) => c.status === "submitted")} icon={ShieldQuestion} tone="text-st-submitted bg-st-submitted/10" />
      <StatCard label="High priority" value={count(data, (c) => c.priority === "high" && OPEN_STATUSES.includes(c.status))} icon={AlertTriangle} tone="text-pr-high bg-pr-high/10" />
      <StatCard label="In progress" value={count(data, (c) => c.status === "in_progress")} icon={Clock} tone="text-st-progress bg-st-progress/15" />
      <StatCard label="Resolved" value={count(data, (c) => c.status === "resolved")} icon={CheckCircle2} tone="text-st-resolved bg-st-resolved/10" />
      <StatCard label="Closed" value={count(data, (c) => c.status === "closed")} icon={Lock} tone="text-st-closed bg-st-closed/10" />
    </StatGrid>
  );

  if (me.role === "warden") {
    return (
      <div className="space-y-6">
        <PageHeader title="Warden Dashboard" subtitle={me.hostel_name ?? "All hostels"} actions={raise} />
        {stats}
        <Panel title="Awaiting your verification of resolution"><ComplaintTable rows={data.filter((c) => c.status === "resolved")} /></Panel>
        <Panel title="All complaints"><FilterableComplaints rows={data} /></Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Management Dashboard" subtitle="Overview across all hostels" actions={<Button variant="outline" asChild><Link to="/reports">Full reports</Link></Button>} />
      <AdminAnalytics rows={data} />
    </div>
  );
}
