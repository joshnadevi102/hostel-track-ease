import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Panel } from "@/components/cc/StatCard";
import { FilterableComplaints } from "@/components/cc/ComplaintList";
import { useComplaints } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CampusCare" }] }),
  component: () => {
    const { data } = useComplaints();
    return (<><PageHeader title="Dashboard" subtitle="Your complaints at a glance" /><Panel><FilterableComplaints rows={data ?? []} /></Panel></>);
  },
});
