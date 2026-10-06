import { useEffect, useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Bell, BarChart3, Building2, FilePlus2, LayoutDashboard, ListChecks, LogOut, Menu, QrCode, Settings, Tags, User, Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe, useSignOut } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Logo } from "./Logo";

type NavItem = { to: string; label: string; icon: typeof Bell; roles?: string[] };
const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/complaints", label: "Complaints", icon: ListChecks },
  { to: "/complaints/new", label: "Raise Complaint", icon: FilePlus2, roles: ["student", "volunteer", "warden", "admin"] },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/reports", label: "Reports", icon: BarChart3, roles: ["warden", "admin"] },
  { to: "/admin/users", label: "Users", icon: Users, roles: ["admin"] },
  { to: "/admin/hostels", label: "Hostels", icon: Building2, roles: ["admin"] },
  { to: "/admin/categories", label: "Categories & Teams", icon: Tags, roles: ["admin"] },
  { to: "/admin/qr", label: "QR Codes", icon: QrCode, roles: ["admin"] },
  { to: "/admin/settings", label: "Settings", icon: Settings, roles: ["admin"] },
  { to: "/profile", label: "Profile", icon: User },
];

export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: ["notifications"],
    enabled: !!userId,
    queryFn: async () =>
      (await supabase.from("notifications").select("*").order("created_at", { ascending: false }).limit(50)).data ?? [],
  });
}

function NavLinks({ role, onNavigate }: { role: string; onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="space-y-1">
      {NAV.filter((n) => !n.roles || n.roles.includes(role)).map((n) => {
        const active = path === n.to || (n.to === "/complaints" && path.startsWith("/complaints/") && path !== "/complaints/new");
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-muted",
            )}
          >
            <n.icon className="h-4 w-4" />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

function NotificationBell({ userId }: { userId: string }) {
  const { data } = useNotifications(userId);
  const qc = useQueryClient();
  const unread = (data ?? []).filter((n) => !n.is_read).length;
  const markAll = async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
    qc.invalidateQueries({ queryKey: ["notifications"] });
  };
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <p className="font-semibold">Notifications</p>
          {unread > 0 && <button onClick={markAll} className="text-xs font-medium text-primary">Mark all read</button>}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {(data ?? []).slice(0, 8).map((n) => (
            <Link
              key={n.id}
              to={n.complaint_id ? "/complaints/$id" : "/notifications"}
              params={{ id: n.complaint_id ?? "" }}
              className={cn("block border-b px-4 py-3 text-sm last:border-0 hover:bg-muted", !n.is_read && "bg-primary/5")}
            >
              <p className="font-medium">{n.title}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(n.created_at))} ago</p>
            </Link>
          ))}
          {!data?.length && <p className="p-6 text-center text-sm text-muted-foreground">You're all caught up.</p>}
        </div>
        <Link to="/notifications" className="block border-t px-4 py-2 text-center text-xs font-medium text-primary">View all</Link>
      </PopoverContent>
    </Popover>
  );
}

export function AppShell() {
  const { data: me, isLoading } = useMe();
  const signOut = useSignOut();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  // Realtime: notifications + complaint changes
  useEffect(() => {
    if (!me?.id) return;
    const ch = supabase
      .channel(`cc-${me.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${me.id}` }, (p) => {
        qc.invalidateQueries({ queryKey: ["notifications"] });
        const n = p.new as { title: string; message: string };
        toast(n.title, { description: n.message });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "complaints" }, (p) => {
        qc.invalidateQueries({ queryKey: ["complaints"] });
        const id = (p.new as { id?: string })?.id;
        if (id) qc.invalidateQueries({ queryKey: ["complaint", id] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [me?.id, qc]);

  if (isLoading || !me) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">Loading CampusCare…</div>;
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <Logo to="/dashboard" />
      <NavLinks role={me.role} onNavigate={() => setOpen(false)} />
      <div className="mt-auto rounded-xl bg-surface p-3">
        <p className="truncate text-sm font-semibold">{me.name}</p>
        <p className="text-xs text-muted-foreground">{ROLE_LABEL[me.role]}{me.hostel_name ? ` · ${me.hostel_name}` : ""}</p>
        <Button variant="outline" size="sm" className="mt-3 w-full" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r bg-sidebar lg:block">{sidebar}</aside>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 bg-sidebar p-0">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          {sidebar}
        </SheetContent>
      </Sheet>
      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/85 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="lg:hidden"><Logo to="/dashboard" /></div>
            <p className="hidden text-sm text-muted-foreground lg:block">
              Welcome back, <span className="font-semibold text-foreground">{me.name.split(" (")[0]}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground sm:inline">{ROLE_LABEL[me.role]}</span>
            <NotificationBell userId={me.id} />
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 pb-24 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
