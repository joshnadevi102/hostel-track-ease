import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Role } from "./constants";

export interface Me {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  hostel_id: string | null;
  hostel_name: string | null;
  room_number: string | null;
  role: Role;
}

const ROLE_RANK: Role[] = ["admin", "warden", "volunteer", "staff", "student"];

export async function fetchMe(): Promise<Me | null> {
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return null;
  await supabase.rpc("ensure_profile");
  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("*, hostel:hostels(name)").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
  ]);
  const roleList = (roles ?? []).map((r) => r.role);
  const role = ROLE_RANK.find((r) => roleList.includes(r)) ?? "student";
  return {
    id: user.id,
    email: user.email ?? "",
    name: profile?.name || user.email || "User",
    phone: profile?.phone ?? null,
    hostel_id: profile?.hostel_id ?? null,
    hostel_name: (profile?.hostel as { name: string } | null)?.name ?? null,
    room_number: profile?.room_number ?? null,
    role,
  };
}

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: fetchMe, staleTime: 60_000 });
}

export function useSignOut() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
}

export const isManager = (r?: Role) => r === "admin" || r === "warden" || r === "volunteer";
