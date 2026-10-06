import { Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { STATUSES, STATUS_DOT, STATUS_LABEL, type Status } from "@/lib/constants";

export function StatusStepper({ status }: { status: Status }) {
  const idx = STATUSES.indexOf(status);
  return (
    <ol className="grid grid-cols-6 gap-1">
      {STATUSES.map((s, i) => {
        const done = i < idx;
        const current = i === idx;
        return (
          <li key={s} className="flex flex-col items-center text-center">
            <div className="flex w-full items-center">
              <div className={cn("h-1 flex-1 rounded", i === 0 ? "invisible" : i <= idx ? STATUS_DOT[s] : "bg-border")} />
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold",
                  done && cn(STATUS_DOT[s], "border-transparent text-primary-foreground"),
                  current && cn(STATUS_DOT[s], "border-card text-primary-foreground ring-4 ring-primary/20"),
                  !done && !current && "border-border bg-card text-muted-foreground",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <div className={cn("h-1 flex-1 rounded", i === STATUSES.length - 1 ? "invisible" : i < idx ? STATUS_DOT[STATUSES[i + 1]] : "bg-border")} />
            </div>
            <span className={cn("mt-2 text-[10px] font-medium leading-tight sm:text-xs", current ? "text-foreground" : "text-muted-foreground")}>
              {STATUS_LABEL[s]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

const EVENT_TEXT: Record<Status, string> = {
  submitted: "Complaint submitted",
  verified: "Verified",
  assigned: "Assigned",
  in_progress: "Work started",
  resolved: "Resolution uploaded",
  closed: "Warden verified & complaint closed",
};

export function ActivityTimeline({
  items,
}: {
  items: Array<{ id: string; old_status: Status | null; new_status: Status | null; note: string | null; created_at: string; user: { name: string } | null }>;
}) {
  if (!items.length) return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  return (
    <ol className="relative space-y-5 border-l-2 border-border pl-5">
      {items.map((h) => {
        const changed = h.new_status && h.old_status !== h.new_status;
        const title = changed ? EVENT_TEXT[h.new_status!] : h.new_status && h.old_status === "in_progress" && h.new_status === "in_progress" ? "Update" : "Note added";
        return (
          <li key={h.id} className="relative">
            <span className={cn("absolute -left-[27px] top-1 h-3 w-3 rounded-full ring-4 ring-card", h.new_status ? STATUS_DOT[h.new_status] : "bg-muted-foreground")} />
            <p className="text-sm font-semibold">{title}</p>
            {h.note && <p className="text-sm text-muted-foreground">{h.note}</p>}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {h.user?.name ?? "System"} · {format(new Date(h.created_at), "d MMM yyyy, h:mm a")}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
