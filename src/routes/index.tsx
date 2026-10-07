import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle, BarChart3, Bell, Camera, Clock, Filter, GraduationCap, HandHelping, History, QrCode, ShieldCheck, Crown, Zap, Wrench, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/cc/Logo";
import { STATUSES, STATUS_DOT, STATUS_LABEL } from "@/lib/constants";
import { cn } from "@/lib/utils";
import hero from "@/assets/hero.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CampusCare — Report → Track → Resolve hostel complaints" },
      { name: "description", content: "A centralized hostel complaint management system that makes reporting, tracking and resolving campus issues simple, transparent and efficient." },
      { property: "og:title", content: "CampusCare — Hostel Complaint Management" },
      { property: "og:description", content: "Report → Track → Resolve. Because your comfort matters." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: Zap, t: "Priority Management", d: "High, medium and low priorities so urgent issues come first." },
  { icon: QrCode, t: "QR Code Reporting", d: "Scan a QR in your hostel and the location fills itself in." },
  { icon: Camera, t: "Image Upload", d: "Attach photos of the problem and of the completed fix." },
  { icon: Bell, t: "Notifications", d: "Get notified at every step of your complaint." },
  { icon: Filter, t: "Search & Filters", d: "Find any complaint by ID, student, hostel or category." },
  { icon: BarChart3, t: "Analytics Dashboard", d: "Trends by category, hostel and resolution time." },
  { icon: History, t: "Complaint History", d: "Every status change recorded on a clear timeline." },
  { icon: Clock, t: "Real-time Updates", d: "Status changes appear instantly, no refresh needed." },
];
const ROLES = [
  { icon: GraduationCap, t: "Students", d: "Raise complaints, upload photos and track progress." },
  { icon: HandHelping, t: "Volunteers", d: "Verify issues on site and route them to the right team." },
  { icon: ShieldCheck, t: "Wardens", d: "Assign work, monitor progress and close resolved issues." },
  { icon: Wrench, t: "Staff", d: "Start work, upload fix photos and mark issues resolved." },
  { icon: Crown, t: "Management", d: "Oversee every hostel with analytics and reports." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <div className="flex gap-2">
            <Button variant="ghost" asChild><Link to="/auth">Login</Link></Button>
            <Button asChild><Link to="/auth" search={{ mode: "signup" }}>Get Started</Link></Button>
          </div>
        </div>
      </header>

      <section className="bg-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <span className="inline-block rounded-full bg-card px-3 py-1 text-xs font-semibold text-primary shadow-card">Hostel Complaint Management</span>
            <h1 className="mt-4 text-5xl font-extrabold tracking-tight md:text-6xl">Campus<span className="text-brand">Care</span></h1>
            <p className="mt-3 text-2xl font-bold">Report → Track → Resolve</p>
            <p className="mt-1 text-lg font-medium text-brand-green">Because your comfort matters.</p>
            <p className="mt-4 max-w-lg text-muted-foreground">A centralized hostel complaint management system that makes reporting, tracking and resolving campus issues simple, transparent and efficient.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild><Link to="/auth" search={{ mode: "signup" }}>Get Started <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
              <Button size="lg" variant="outline" asChild><Link to="/auth">Login</Link></Button>
            </div>
          </div>
          <img src={hero} alt="Student reporting a hostel issue on their phone" width={1200} height={960} className="w-full" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold">The Problem</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {["Complaints get lost in registers and WhatsApp groups.", "Students never know if anyone is working on their issue.", "Management has no data on recurring problems."].map((p) => (
            <div key={p} className="flex gap-3 rounded-2xl border bg-card p-5 shadow-card">
              <AlertTriangle className="h-5 w-5 shrink-0 text-pr-high" /><p className="text-sm">{p}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold">How CampusCare Works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[["1", "Report", "Students raise a complaint with category, location and a photo."], ["2", "Track", "Volunteers verify, wardens assign, staff fix — every step visible."], ["3", "Resolve", "Staff upload the fix, the warden verifies and closes it."]].map(([n, t, d]) => (
              <div key={n} className="rounded-2xl border bg-card p-6 shadow-card">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand font-bold text-primary-foreground">{n}</span>
                <h3 className="mt-4 text-lg font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold">Key Features</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.t} className="rounded-2xl border bg-card p-5 shadow-card">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-primary"><f.icon className="h-5 w-5" /></span>
              <h3 className="mt-3 font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold">Who Uses CampusCare?</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {ROLES.map((r) => (
              <div key={r.t} className="rounded-2xl border bg-card p-5 shadow-card">
                <r.icon className="h-6 w-6 text-brand-purple" />
                <h3 className="mt-3 font-semibold">{r.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold">Simple Workflow</h2>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {STATUSES.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className={cn("rounded-full px-4 py-2 text-sm font-semibold text-primary-foreground", STATUS_DOT[s])}>{STATUS_LABEL[s]}</span>
              {i < STATUSES.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-3xl bg-brand p-10 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold">Make your hostel a better place to live</h2>
          <p className="mt-2 opacity-90">Try it now with a one-click demo account.</p>
          <Button size="lg" variant="secondary" className="mt-6" asChild><Link to="/auth">Try CampusCare</Link></Button>
        </div>
      </section>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">© CampusCare · Report → Track → Resolve</footer>
    </div>
  );
}
