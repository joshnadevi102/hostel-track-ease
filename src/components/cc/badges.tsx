import { cn } from "@/lib/utils";
import { PRIORITY_CLASS, PRIORITY_LABEL, STATUS_CLASS, STATUS_DOT, STATUS_LABEL, type Priority, type Status } from "@/lib/constants";

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold", STATUS_CLASS[status], className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[status])} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-semibold", PRIORITY_CLASS[priority])}>
      {PRIORITY_LABEL[priority]}
    </span>
  );
}
