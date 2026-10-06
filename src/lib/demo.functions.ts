import { createServerFn } from "@tanstack/react-start";

// Creates the fixed set of demo accounts (idempotent) and seeds sample complaints once.
// Only these predefined accounts can be created here; no user input is accepted.
export const DEMO_PASSWORD = "CampusCare@123";
const DEMO = [
  { email: "student@campuscare.demo", name: "Rahul Sharma (Demo Student)", role: "student", room: "112", phone: "9876500001" },
  { email: "volunteer@campuscare.demo", name: "Priya Nair (Demo Volunteer)", role: "volunteer", room: null, phone: "9876500002" },
  { email: "warden@campuscare.demo", name: "Dr. Anil Kumar (Demo Warden)", role: "warden", room: null, phone: "9876500003" },
  { email: "staff@campuscare.demo", name: "Ramesh Patil (Demo Staff)", role: "staff", room: null, phone: "9876500004" },
  { email: "admin@campuscare.demo", name: "Meera Iyer (Demo Admin)", role: "admin", room: null, phone: "9876500005" },
] as const;

export const ensureDemoData = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");

  const { data: hostel } = await db.from("hostels").select("id").eq("name", "Aravali Boys Hostel").single();
  if (!hostel) throw new Error("Hostel missing");

  const { data: existing } = await db.auth.admin.listUsers({ page: 1, perPage: 500 });
  const ids: Record<string, string> = {};
  for (const d of DEMO) {
    let user = existing?.users.find((u) => u.email === d.email);
    if (!user) {
      const { data, error } = await db.auth.admin.createUser({
        email: d.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { name: d.name },
      });
      if (error) throw new Error(error.message);
      user = data.user;
    }
    ids[d.role] = user.id;
    const { data: prof } = await db.from("profiles").select("id").eq("id", user.id).maybeSingle();
    if (!prof) {
      await db.from("profiles").insert({
        id: user.id,
        name: d.name,
        email: d.email,
        phone: d.phone,
        room_number: d.room,
        hostel_id: d.role === "admin" || d.role === "staff" ? null : hostel.id,
      });
      await db.from("user_roles").insert({ user_id: user.id, role: d.role });
    }
  }

  const { count } = await db.from("complaints").select("id", { count: "exact", head: true });
  if ((count ?? 0) > 0) return { ok: true };

  const { data: cats } = await db.from("categories").select("id,name");
  const cat = (n: string) => cats?.find((c) => c.name === n)?.id ?? null;
  const day = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

  const samples = [
    { title: "Water purifier not working", cat: "Water / Plumbing", pr: "high", st: "closed", loc: "Ground Floor Water Purifier", ago: 12 },
    { title: "Bathroom tap leaking", cat: "Bathroom", pr: "medium", st: "resolved", loc: "2nd Floor Bathroom", ago: 6 },
    { title: "Wi-Fi not working in 1st floor", cat: "Wi-Fi / Internet", pr: "high", st: "in_progress", loc: "1st Floor Corridor", ago: 3 },
    { title: "Room fan not working", cat: "Electricity", pr: "medium", st: "assigned", loc: null, ago: 2 },
    { title: "Mess food quality is poor", cat: "Food / Mess", pr: "low", st: "verified", loc: "Mess Hall", ago: 1 },
    { title: "Sparking from switch board", cat: "Electricity", pr: "high", st: "submitted", loc: null, ago: 0 },
  ] as const;
  const order = ["submitted", "verified", "assigned", "in_progress", "resolved", "closed"] as const;

  for (const s of samples) {
    const idx = order.indexOf(s.st);
    const created = day(s.ago);
    const { data: c, error } = await db
      .from("complaints")
      .insert({
        student_id: ids.student,
        hostel_id: hostel.id,
        category_id: cat(s.cat),
        title: s.title,
        description: `[Demo data] ${s.title}. Please look into this at the earliest.`,
        room_number: "112",
        location_name: s.loc,
        priority: s.pr,
        status: s.st,
        created_at: created,
        assigned_to: idx >= 2 ? ids.staff : null,
        verification_notes: idx >= 1 ? "Checked on site, issue confirmed." : null,
        resolution_notes: idx >= 4 ? "Repaired and tested." : null,
        resolved_at: idx >= 4 ? day(Math.max(s.ago - 1, 0)) : null,
        closed_at: idx >= 5 ? day(Math.max(s.ago - 2, 0)) : null,
      })
      .select("id")
      .single();
    if (error || !c) continue;
    const actors = [ids.volunteer, ids.warden, ids.staff, ids.staff, ids.warden];
    const notes = ["Verified on site", "Assigned to Ramesh Patil", "Work started", "Repaired and tested", "Resolution verified by warden"];
    const rows = [];
    for (let i = 1; i <= idx; i++) {
      rows.push({
        complaint_id: c.id,
        user_id: actors[i - 1],
        old_status: order[i - 1],
        new_status: order[i],
        note: notes[i - 1],
        created_at: new Date(new Date(created).getTime() + i * 3600000 * 6).toISOString(),
      });
    }
    if (rows.length) await db.from("complaint_history").insert(rows);
    await db.from("complaint_history").update({ created_at: created }).eq("complaint_id", c.id).eq("new_status", "submitted").is("old_status", null);
  }
  return { ok: true };
});
