import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel } from "@/components/cc/StatCard";
import { FilterableComplaints } from "@/components/cc/ComplaintList";
import { useComplaints } from "@/lib/data";
import { useMe } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/complaints/")({
  head: () => ({ meta: [{ title: "Complaints — CampusCare" }, { name: "description", content: "Search and filter complaints." }] }),
  component: () => {
    const { data = [], isLoading } = useComplaints();
    const { data: me } = useMe();
    return (
      <>
        <PageHeader
          title="Complaints"
          subtitle="Search by ID, student, title, hostel or category"
          actions={me?.role !== "staff" && <Button asChild><Link to="/complaints/new"><Plus className="mr-1 h-4 w-4" /> Raise Complaint</Link></Button>}
        />
        <Panel>{isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : <FilterableComplaints rows={data} showStudent={me?.role !== "student"} />}</Panel>
      </>
    );
  },
});
