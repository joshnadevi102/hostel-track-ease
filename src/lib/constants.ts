import type { Database } from "@/integrations/supabase/types";

export type Role = Database["public"]["Enums"]["app_role"];
export type Status = Database["public"]["Enums"]["complaint_status"];
export type Priority = Database["public"]["Enums"]["complaint_priority"];

export const STATUSES: Status[] = ["submitted", "verified", "assigned", "in_progress", "resolved", "closed"];

export const STATUS_LABEL: Record<Status, string> = {
  submitted: "Submitted",
  verified: "Verified",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

// Tailwind classes built from design tokens
export const STATUS_CLASS: Record<Status, string> = {
  submitted: "bg-st-submitted/12 text-st-submitted border-st-submitted/30",
  verified: "bg-st-verified/12 text-st-verified border-st-verified/30",
  assigned: "bg-st-assigned/12 text-st-assigned border-st-assigned/30",
  in_progress: "bg-st-progress/15 text-st-assigned border-st-progress/40",
  resolved: "bg-st-resolved/12 text-st-resolved border-st-resolved/30",
  closed: "bg-st-closed/12 text-st-closed border-st-closed/30",
};
export const STATUS_DOT: Record<Status, string> = {
  submitted: "bg-st-submitted",
  verified: "bg-st-verified",
  assigned: "bg-st-assigned",
  in_progress: "bg-st-progress",
  resolved: "bg-st-resolved",
  closed: "bg-st-closed",
};

export const PRIORITIES: Priority[] = ["high", "medium", "low"];
export const PRIORITY_LABEL: Record<Priority, string> = { high: "High", medium: "Medium", low: "Low" };
export const PRIORITY_CLASS: Record<Priority, string> = {
  high: "bg-pr-high/12 text-pr-high border-pr-high/30",
  medium: "bg-pr-medium/12 text-pr-medium border-pr-medium/30",
  low: "bg-pr-low/12 text-pr-low border-pr-low/30",
};

export const ROLE_LABEL: Record<Role, string> = {
  student: "Student",
  volunteer: "Volunteer",
  warden: "Warden",
  staff: "Staff",
  admin: "Admin",
};

export const NEXT_ACTION: Partial<Record<Status, { to: Status; label: string }>> = {
  submitted: { to: "verified", label: "Verify complaint" },
  verified: { to: "assigned", label: "Assign complaint" },
  assigned: { to: "in_progress", label: "Start work" },
  in_progress: { to: "resolved", label: "Mark resolved" },
  resolved: { to: "closed", label: "Verify & close" },
};

export const OPEN_STATUSES: Status[] = ["submitted", "verified", "assigned", "in_progress"];
