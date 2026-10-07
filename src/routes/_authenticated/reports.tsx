import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/cc/StatCard";
import { AdminAnalytics } from "@/components/cc/Analytics";
import { useComplaints } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports — CampusCare" }, { name: "description", content: "Complaint analytics and reports." }] }),
  component: () => {
    const { data = [] } = useComplaints();
    return (
      <>
        <PageHeader title="Reports & Analytics" subtitle="Filter, analyse and export complaint data" />
        <AdminAnalytics rows={data} />
      </>
    );
  },
});
