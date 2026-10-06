import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Priority, Status } from "./constants";

export const COMPLAINT_SELECT =
  "*, hostel:hostels(id,name), category:categories(id,name), student:profiles!complaints_student_id_fkey(id,name,email,room_number), assignee:profiles!complaints_assigned_to_fkey(id,name), team:teams(id,name)";

export interface ComplaintRow {
  id: string;
  complaint_number: string;
  title: string;
  description: string;
  room_number: string | null;
  location_name: string | null;
  priority: Priority;
  status: Status;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  verification_notes: string | null;
  resolution_notes: string | null;
  student_id: string;
  assigned_to: string | null;
  hostel_id: string;
  category_id: string | null;
  hostel: { id: string; name: string } | null;
  category: { id: string; name: string } | null;
  student: { id: string; name: string; email: string | null; room_number: string | null } | null;
  assignee: { id: string; name: string } | null;
  team: { id: string; name: string } | null;
}

export async function fetchComplaints(): Promise<ComplaintRow[]> {
  const { data, error } = await supabase
    .from("complaints")
    .select(COMPLAINT_SELECT)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) throw error;
  return (data ?? []) as unknown as ComplaintRow[];
}

export function useComplaints() {
  return useQuery({ queryKey: ["complaints"], queryFn: fetchComplaints });
}

export function useComplaint(id: string) {
  return useQuery({
    queryKey: ["complaint", id],
    queryFn: async () => {
      const [c, imgs, hist] = await Promise.all([
        supabase.from("complaints").select(COMPLAINT_SELECT).eq("id", id).maybeSingle(),
        supabase.from("complaint_images").select("*").eq("complaint_id", id).order("created_at"),
        supabase
          .from("complaint_history")
          .select("*, user:profiles(name)")
          .eq("complaint_id", id)
          .order("created_at"),
      ]);
      if (c.error) throw c.error;
      const paths = (imgs.data ?? []).map((i) => i.image_url);
      let urls: Record<string, string> = {};
      if (paths.length) {
        const { data } = await supabase.storage.from("complaint-images").createSignedUrls(paths, 3600);
        urls = Object.fromEntries((data ?? []).map((d) => [d.path ?? "", d.signedUrl ?? ""]));
      }
      return {
        complaint: c.data as unknown as ComplaintRow | null,
        images: (imgs.data ?? []).map((i) => ({ ...i, url: urls[i.image_url] ?? "" })),
        history: (hist.data ?? []) as Array<{
          id: string;
          old_status: Status | null;
          new_status: Status | null;
          note: string | null;
          created_at: string;
          user: { name: string } | null;
        }>,
      };
    },
  });
}

export function useHostels() {
  return useQuery({
    queryKey: ["hostels"],
    queryFn: async () => (await supabase.from("hostels").select("*").order("name")).data ?? [],
  });
}
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("name")).data ?? [],
  });
}
export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: async () => (await supabase.from("teams").select("*").order("name")).data ?? [],
  });
}
export function useAssignees() {
  return useQuery({
    queryKey: ["assignees"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role, profile:profiles(id,name,hostel_id)")
        .in("role", ["staff", "volunteer", "warden"]);
      return (data ?? [])
        .filter((r) => r.profile)
        .map((r) => ({ role: r.role, ...(r.profile as { id: string; name: string; hostel_id: string | null }) }));
    },
  });
}

export async function uploadComplaintImage(
  userId: string,
  complaintId: string,
  file: File,
  type: "complaint" | "verification" | "before" | "after",
) {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5 MB");
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${complaintId}/${type}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("complaint-images").upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { error: e2 } = await supabase
    .from("complaint_images")
    .insert({ complaint_id: complaintId, image_url: path, image_type: type, uploaded_by: userId });
  if (e2) throw e2;
}

export function errMsg(e: unknown) {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: string }).message);
  return "Something went wrong";
}
