import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { GraduationCap, HandHelping, ShieldCheck, Wrench, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/cc/Logo";
import { useHostels } from "@/lib/data";
import { DEMO_PASSWORD, ensureDemoData } from "@/lib/demo.functions";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { redirect?: string; mode?: "signup" } => ({
    redirect: typeof s["redirect"] === "string" ? s["redirect"] : undefined,
    mode: s["mode"] === "signup" ? "signup" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — CampusCare" },
      { name: "description", content: "Sign in or create your CampusCare account to report and track hostel complaints." },
      { property: "og:title", content: "Sign in — CampusCare" },
      { property: "og:description", content: "Sign in or create your CampusCare account." },
    ],
  }),
  component: AuthPage,
});

const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  room: z.string().trim().max(20),
});

const DEMOS = [
  { role: "Student", email: "student@campuscare.demo", icon: GraduationCap },
  { role: "Volunteer", email: "volunteer@campuscare.demo", icon: HandHelping },
  { role: "Warden", email: "warden@campuscare.demo", icon: ShieldCheck },
  { role: "Staff", email: "staff@campuscare.demo", icon: Wrench },
  { role: "Admin", email: "admin@campuscare.demo", icon: Crown },
];

function safeRedirect(r?: string) {
  if (!r) return "/dashboard";
  try {
    const u = new URL(r, window.location.origin);
    if (u.origin !== window.location.origin) return "/dashboard";
    return u.pathname + u.search;
  } catch {
    return "/dashboard";
  }
}

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: hostels } = useHostels();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [su, setSu] = useState({ name: "", email: "", password: "", hostel: "", room: "" });

  const done = async () => {
    qc.clear();
    navigate({ to: safeRedirect(search.redirect) as "/dashboard" });
  };

  const signIn = async (email: string, password: string) => {
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    await done();
  };

  const demo = async (email: string) => {
    setBusy(true);
    try {
      await ensureDemoData();
      await signIn(email, DEMO_PASSWORD);
    } catch (e) {
      toast.error("Could not prepare demo accounts");
      setBusy(false);
    }
  };

  const signUp = async () => {
    const p = signupSchema.safeParse(su);
    if (!p.success) return toast.error(p.error.issues[0]?.message ?? "Invalid input");
    if (!su.hostel) return toast.error("Select your hostel");
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: p.data.email,
      password: p.data.password,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: { name: p.data.name, hostel_id: su.hostel, room_number: p.data.room },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (data.session) return done();
    setSent(true);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-hero p-10 lg:flex">
        <Logo />
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight">Report → Track → Resolve</h2>
          <p className="mt-3 max-w-md text-muted-foreground">Because your comfort matters. One place for every hostel issue, from leaking taps to Wi-Fi outages.</p>
        </div>
        <p className="text-xs text-muted-foreground">© CampusCare</p>
      </div>
      <div className="flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden"><Logo /></div>
          <Tabs defaultValue={search.mode === "signup" ? "signup" : "login"}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4 pt-4">
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); signIn(login.email, login.password); }}>
                <div className="space-y-2"><Label htmlFor="le">Email</Label><Input id="le" type="email" required value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="lp">Password</Label><Input id="lp" type="password" required value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} /></div>
                <Button type="submit" className="w-full" disabled={busy}>Login</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="pt-4">
              {sent ? (
                <div className="rounded-xl border bg-accent p-4 text-sm text-accent-foreground">Check your email to confirm your account, then come back and log in.</div>
              ) : (
                <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); signUp(); }}>
                  <div className="space-y-2"><Label>Full name</Label><Input value={su.name} onChange={(e) => setSu({ ...su, name: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input type="email" value={su.email} onChange={(e) => setSu({ ...su, email: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Password</Label><Input type="password" value={su.password} onChange={(e) => setSu({ ...su, password: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Hostel</Label>
                      <Select value={su.hostel} onValueChange={(v) => setSu({ ...su, hostel: v })}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{(hostels ?? []).map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Room no.</Label><Input value={su.room} onChange={(e) => setSu({ ...su, room: e.target.value })} /></div>
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>Create student account</Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <div className="rounded-2xl border bg-card p-4 shadow-card">
            <p className="text-sm font-semibold">Try a demo account</p>
            <p className="mb-3 text-xs text-muted-foreground">Demo data — one click signs you in with that role.</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DEMOS.map((d) => (
                <Button key={d.role} variant="outline" size="sm" disabled={busy} onClick={() => demo(d.email)} className="justify-start">
                  <d.icon className="mr-2 h-4 w-4 text-primary" /> {d.role}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
