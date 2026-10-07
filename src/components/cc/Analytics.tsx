import { useMemo, useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle2, ClipboardList, Lock, Timer, FolderOpen } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { OPEN_STATUSES, STATUSES, STATUS_LABEL } from "@/lib/constants";
import type { ComplaintRow } from "@/lib/data";
import { applyFilters, ComplaintTable, EMPTY_FILTERS, FilterBar, type Filters } from "./ComplaintList";
import { Panel, StatCard, StatGrid } from "./StatCard";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const STATUS_COLORS = ["var(--st-submitted)", "var(--st-verified)", "var(--st-assigned)", "var(--st-progress)", "var(--st-resolved)", "var(--st-closed)"];

function group(rows: ComplaintRow[], key: (c: ComplaintRow) => string) {
  const m = new Map<string, number>();
  rows.forEach((c) => m.set(key(c), (m.get(key(c)) ?? 0) + 1));
  return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

export function AdminAnalytics({ rows }: { rows: ComplaintRow[] }) {
  const [f, setF] = useState<Filters>(EMPTY_FILTERS);
  const data = useMemo(() => applyFilters(rows, f), [rows, f]);

  const resolved = data.filter((c) => c.resolved_at);
  const avgHrs = resolved.length
    ? resolved.reduce((s, c) => s + (new Date(c.resolved_at!).getTime() - new Date(c.created_at).getTime()), 0) / resolved.length / 36e5
    : 0;

  const byCat = group(data, (c) => c.category?.name ?? "Other");
  const byHostel = group(data, (c) => c.hostel?.name ?? "—");
  const byStatus = STATUSES.map((s) => ({ name: STATUS_LABEL[s], value: data.filter((c) => c.status === s).length }));
  const overTime = group([...data].reverse(), (c) => format(new Date(c.created_at), "d MMM")).sort(
    (a, b) => new Date(a.name + " 2026").getTime() - new Date(b.name + " 2026").getTime(),
  );

  const exportCsv = () => {
    const head = ["ID", "Title", "Student", "Hostel", "Category", "Priority", "Status", "Created", "Resolved", "Closed"];
    const lines = data.map((c) =>
      [c.complaint_number, c.title, c.student?.name, c.hostel?.name, c.category?.name, c.priority, c.status, c.created_at, c.resolved_at, c.closed_at]
        .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `campuscare-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <Panel title="Filter analytics" action={<Button size="sm" variant="outline" onClick={exportCsv}>Export CSV</Button>}>
        <FilterBar value={f} onChange={setF} showDates />
      </Panel>
      <StatGrid>
        <StatCard label="Total complaints" value={data.length} icon={ClipboardList} />
        <StatCard label="Open" value={data.filter((c) => OPEN_STATUSES.includes(c.status)).length} icon={FolderOpen} tone="text-st-submitted bg-st-submitted/10" />
        <StatCard label="Resolved" value={data.filter((c) => c.status === "resolved").length} icon={CheckCircle2} tone="text-st-resolved bg-st-resolved/10" />
        <StatCard label="Closed" value={data.filter((c) => c.status === "closed").length} icon={Lock} tone="text-st-closed bg-st-closed/10" />
        <StatCard label="High priority" value={data.filter((c) => c.priority === "high").length} icon={AlertTriangle} tone="text-pr-high bg-pr-high/10" />
        <StatCard label="Avg resolution" value={`${avgHrs.toFixed(1)}h`} icon={Timer} tone="text-brand-purple bg-brand-purple/10" />
      </StatGrid>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Complaints by category">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={byCat} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} fontSize={12} />
              <YAxis type="category" dataKey="name" width={110} fontSize={11} />
              <Tooltip />
              <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Complaints by status">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byStatus.filter((s) => s.value)} dataKey="value" nameKey="name" innerRadius={55} outerRadius={95} label>
                {byStatus.filter((s) => s.value).map((s) => (
                  <Cell key={s.name} fill={STATUS_COLORS[byStatus.findIndex((b) => b.name === s.name)]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Complaints by hostel">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byHostel}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {byHostel.map((h, i) => <Cell key={h.name} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Complaints over time">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={overTime}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="var(--chart-3)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>
      <Panel title="Complaints in this report"><ComplaintTable rows={data} /></Panel>
    </div>
  );
}
