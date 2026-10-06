import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PRIORITIES, PRIORITY_LABEL, STATUSES, STATUS_LABEL } from "@/lib/constants";
import { useCategories, useHostels, type ComplaintRow } from "@/lib/data";
import { PriorityBadge, StatusBadge } from "./badges";

export interface Filters {
  q: string;
  status: string;
  priority: string;
  category: string;
  hostel: string;
  from: string;
  to: string;
}
export const EMPTY_FILTERS: Filters = { q: "", status: "all", priority: "all", category: "all", hostel: "all", from: "", to: "" };

export function applyFilters(rows: ComplaintRow[], f: Filters) {
  const q = f.q.trim().toLowerCase();
  return rows.filter((c) => {
    if (f.status !== "all" && c.status !== f.status) return false;
    if (f.priority !== "all" && c.priority !== f.priority) return false;
    if (f.category !== "all" && c.category_id !== f.category) return false;
    if (f.hostel !== "all" && c.hostel_id !== f.hostel) return false;
    if (f.from && c.created_at < f.from) return false;
    if (f.to && c.created_at.slice(0, 10) > f.to) return false;
    if (q) {
      const hay = [c.complaint_number, c.title, c.student?.name, c.hostel?.name, c.category?.name].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function FilterBar({ value, onChange, showHostel = true, showDates = false }: { value: Filters; onChange: (f: Filters) => void; showHostel?: boolean; showDates?: boolean }) {
  const { data: cats } = useCategories();
  const { data: hostels } = useHostels();
  const set = (k: keyof Filters) => (v: string) => onChange({ ...value, [k]: v });
  const dirty = JSON.stringify(value) !== JSON.stringify(EMPTY_FILTERS);
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by ID, student, title, hostel or category…" value={value.q} onChange={(e) => set("q")(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <FilterSelect label="Status" value={value.status} onChange={set("status")} options={STATUSES.map((s) => [s, STATUS_LABEL[s]])} />
        <FilterSelect label="Priority" value={value.priority} onChange={set("priority")} options={PRIORITIES.map((p) => [p, PRIORITY_LABEL[p]])} />
        <FilterSelect label="Category" value={value.category} onChange={set("category")} options={(cats ?? []).map((c) => [c.id, c.name])} />
        {showHostel && <FilterSelect label="Hostel" value={value.hostel} onChange={set("hostel")} options={(hostels ?? []).map((h) => [h.id, h.name])} />}
        {showDates && (
          <>
            <Input type="date" className="sm:w-40" value={value.from} onChange={(e) => set("from")(e.target.value)} aria-label="From date" />
            <Input type="date" className="sm:w-40" value={value.to} onChange={(e) => set("to")(e.target.value)} aria-label="To date" />
          </>
        )}
        {dirty && (
          <Button variant="ghost" size="sm" onClick={() => onChange(EMPTY_FILTERS)} className="h-9">
            <X className="mr-1 h-4 w-4" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[][] }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 sm:w-40">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label.toLowerCase()}</SelectItem>
        {options.map(([v, l]) => (
          <SelectItem key={v} value={v!}>{l}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function ComplaintTable({ rows, showStudent = true }: { rows: ComplaintRow[]; showStudent?: boolean }) {
  if (!rows.length)
    return <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">No complaints found.</div>;
  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="py-2 pr-3 font-medium">ID</th>
              <th className="py-2 pr-3 font-medium">Complaint</th>
              {showStudent && <th className="py-2 pr-3 font-medium">Student</th>}
              <th className="py-2 pr-3 font-medium">Hostel</th>
              <th className="py-2 pr-3 font-medium">Priority</th>
              <th className="py-2 pr-3 font-medium">Status</th>
              <th className="py-2 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="py-3 pr-3 font-mono text-xs text-muted-foreground">{c.complaint_number}</td>
                <td className="py-3 pr-3">
                  <Link to="/complaints/$id" params={{ id: c.id }} className="font-medium hover:text-primary">{c.title}</Link>
                  <div className="text-xs text-muted-foreground">{c.category?.name ?? "Uncategorised"}</div>
                </td>
                {showStudent && <td className="py-3 pr-3">{c.student?.name ?? "—"}</td>}
                <td className="py-3 pr-3 text-muted-foreground">{c.hostel?.name}{c.room_number ? ` · ${c.room_number}` : ""}</td>
                <td className="py-3 pr-3"><PriorityBadge priority={c.priority} /></td>
                <td className="py-3 pr-3"><StatusBadge status={c.status} /></td>
                <td className="py-3 text-muted-foreground">{format(new Date(c.created_at), "d MMM yyyy")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile */}
      <div className="space-y-2 md:hidden">
        {rows.map((c) => (
          <Link key={c.id} to="/complaints/$id" params={{ id: c.id }} className="block rounded-xl border p-3 hover:bg-muted/50">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.complaint_number} · {c.category?.name} · {c.hostel?.name}</p>
              </div>
              <PriorityBadge priority={c.priority} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <StatusBadge status={c.status} />
              <span className="text-xs text-muted-foreground">{format(new Date(c.created_at), "d MMM")}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

export function FilterableComplaints({ rows, showHostel = true, showStudent = true }: { rows: ComplaintRow[]; showHostel?: boolean; showStudent?: boolean }) {
  const [f, setF] = useState<Filters>(EMPTY_FILTERS);
  const filtered = useMemo(() => applyFilters(rows, f), [rows, f]);
  return (
    <div className="space-y-4">
      <FilterBar value={f} onChange={setF} showHostel={showHostel} showDates />
      <p className="text-xs text-muted-foreground">{filtered.length} of {rows.length} complaints</p>
      <ComplaintTable rows={filtered} showStudent={showStudent} />
    </div>
  );
}
