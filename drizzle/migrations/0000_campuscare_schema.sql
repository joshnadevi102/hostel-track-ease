
CREATE TYPE public.app_role AS ENUM ('student','volunteer','warden','staff','admin');
CREATE TYPE public.complaint_status AS ENUM ('submitted','verified','assigned','in_progress','resolved','closed');
CREATE TYPE public.complaint_priority AS ENUM ('high','medium','low');

CREATE TABLE public.hostels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  location text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  name text NOT NULL DEFAULT '',
  email text,
  phone text,
  hostel_id uuid REFERENCES public.hostels(id) ON DELETE SET NULL,
  room_number text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.team_members (
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (team_id, user_id)
);
CREATE SEQUENCE public.complaint_number_seq START 1001;
CREATE TABLE public.complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_number text NOT NULL UNIQUE DEFAULT ('CC-' || nextval('public.complaint_number_seq')),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  hostel_id uuid NOT NULL REFERENCES public.hostels(id),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  title text NOT NULL CHECK (char_length(title) BETWEEN 3 AND 150),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 2000),
  room_number text,
  location_name text,
  priority public.complaint_priority NOT NULL DEFAULT 'medium',
  status public.complaint_status NOT NULL DEFAULT 'submitted',
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  verification_notes text,
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  closed_at timestamptz
);
CREATE INDEX ON public.complaints (hostel_id);
CREATE INDEX ON public.complaints (student_id);
CREATE INDEX ON public.complaints (assigned_to);
CREATE TABLE public.complaint_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_type text NOT NULL DEFAULT 'complaint' CHECK (image_type IN ('complaint','verification','before','after')),
  uploaded_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.complaint_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id uuid NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  old_status public.complaint_status,
  new_status public.complaint_status,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  complaint_id uuid REFERENCES public.complaints(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.notifications (user_id, created_at DESC);
CREATE TABLE public.qr_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
  location_name text NOT NULL,
  room_number text,
  qr_code text NOT NULL UNIQUE DEFAULT substr(md5(random()::text), 1, 10),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.app_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  campus_name text NOT NULL DEFAULT 'CampusCare University',
  support_email text NOT NULL DEFAULT 'support@campuscare.edu',
  high_priority_sla_hours int NOT NULL DEFAULT 24,
  allow_student_priority boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.app_settings (id) VALUES (1);

-- Grants
GRANT SELECT ON public.hostels, public.categories, public.qr_locations, public.app_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hostels, public.categories, public.profiles, public.user_roles, public.teams, public.team_members, public.complaints, public.complaint_images, public.complaint_history, public.notifications, public.qr_locations, public.app_settings TO authenticated;
GRANT ALL ON public.hostels, public.categories, public.profiles, public.user_roles, public.teams, public.team_members, public.complaints, public.complaint_images, public.complaint_history, public.notifications, public.qr_locations, public.app_settings TO service_role;
GRANT USAGE ON SEQUENCE public.complaint_number_seq TO authenticated, service_role;

ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Helper functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE OR REPLACE FUNCTION public.is_staff_user(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role <> 'student')
$$;
CREATE OR REPLACE FUNCTION public.user_hostel(_user_id uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT hostel_id FROM public.profiles WHERE id = _user_id
$$;
CREATE OR REPLACE FUNCTION public.can_view_complaint(_user_id uuid, _complaint_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.complaints c
    WHERE c.id = _complaint_id AND (
      c.student_id = _user_id
      OR c.assigned_to = _user_id
      OR public.has_role(_user_id, 'admin')
      OR ((public.has_role(_user_id, 'warden') OR public.has_role(_user_id, 'volunteer'))
          AND (public.user_hostel(_user_id) IS NULL OR c.hostel_id = public.user_hostel(_user_id)))
    )
  )
$$;

-- Policies: reference data
CREATE POLICY "read hostels" ON public.hostels FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin hostels" ON public.hostels FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "read categories" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin categories" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "read qr" ON public.qr_locations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin qr" ON public.qr_locations FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "read settings" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin settings" ON public.app_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "read teams" ON public.teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin teams" ON public.teams FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "read team members" ON public.team_members FOR SELECT TO authenticated USING (public.is_staff_user(auth.uid()));
CREATE POLICY "admin team members" ON public.team_members FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Profiles
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff_user(auth.uid()));
CREATE POLICY "student sees assignee" ON public.profiles FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.complaints c WHERE c.student_id = auth.uid() AND c.assigned_to = profiles.id)
);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "admin profiles" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Roles
CREATE POLICY "read own role" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff_user(auth.uid()));
CREATE POLICY "admin roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Complaints
CREATE POLICY "view complaints" ON public.complaints FOR SELECT TO authenticated USING (
  student_id = auth.uid() OR assigned_to = auth.uid() OR public.has_role(auth.uid(),'admin')
  OR ((public.has_role(auth.uid(),'warden') OR public.has_role(auth.uid(),'volunteer'))
      AND (public.user_hostel(auth.uid()) IS NULL OR hostel_id = public.user_hostel(auth.uid())))
);
CREATE POLICY "student create" ON public.complaints FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid() AND status = 'submitted');
CREATE POLICY "admin delete" ON public.complaints FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Images / history
CREATE POLICY "view images" ON public.complaint_images FOR SELECT TO authenticated USING (public.can_view_complaint(auth.uid(), complaint_id));
CREATE POLICY "add images" ON public.complaint_images FOR INSERT TO authenticated WITH CHECK (uploaded_by = auth.uid() AND public.can_view_complaint(auth.uid(), complaint_id));
CREATE POLICY "view history" ON public.complaint_history FOR SELECT TO authenticated USING (public.can_view_complaint(auth.uid(), complaint_id));

-- Notifications
CREATE POLICY "own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own notifications update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "own notifications delete" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Notify helper
CREATE OR REPLACE FUNCTION public.notify(_user uuid, _complaint uuid, _title text, _msg text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.notifications (user_id, complaint_id, title, message)
  SELECT _user, _complaint, _title, _msg WHERE _user IS NOT NULL;
$$;
REVOKE EXECUTE ON FUNCTION public.notify(uuid, uuid, text, text) FROM PUBLIC, anon, authenticated;

-- On complaint insert: history + notifications
CREATE OR REPLACE FUNCTION public.on_complaint_created()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE r record;
BEGIN
  INSERT INTO public.complaint_history (complaint_id, user_id, old_status, new_status, note)
  VALUES (NEW.id, NEW.student_id, NULL, 'submitted', 'Complaint submitted');
  PERFORM public.notify(NEW.student_id, NEW.id, 'Complaint submitted',
    'Your complaint ' || NEW.complaint_number || ' "' || NEW.title || '" was submitted successfully.');
  FOR r IN SELECT p.id FROM public.profiles p JOIN public.user_roles ur ON ur.user_id = p.id
    WHERE ur.role IN ('warden','volunteer') AND (p.hostel_id IS NULL OR p.hostel_id = NEW.hostel_id)
  LOOP
    PERFORM public.notify(r.id, NEW.id, 'New complaint to verify', NEW.complaint_number || ': ' || NEW.title);
  END LOOP;
  RETURN NEW;
END $$;
CREATE TRIGGER complaint_created AFTER INSERT ON public.complaints FOR EACH ROW EXECUTE FUNCTION public.on_complaint_created();

-- Status transition RPC
CREATE OR REPLACE FUNCTION public.update_complaint_status(
  _complaint_id uuid, _new_status public.complaint_status, _note text DEFAULT NULL,
  _assigned_to uuid DEFAULT NULL, _team_id uuid DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  c public.complaints; uid uuid := auth.uid();
  is_admin boolean; is_warden boolean; is_vol boolean; same_hostel boolean;
  expected public.complaint_status; label text;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
  SELECT * INTO c FROM public.complaints WHERE id = _complaint_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Complaint not found'; END IF;
  is_admin := public.has_role(uid,'admin');
  same_hostel := public.user_hostel(uid) IS NULL OR public.user_hostel(uid) = c.hostel_id;
  is_warden := public.has_role(uid,'warden') AND same_hostel;
  is_vol := public.has_role(uid,'volunteer') AND same_hostel;

  expected := CASE _new_status
    WHEN 'verified' THEN 'submitted' WHEN 'assigned' THEN 'verified'
    WHEN 'in_progress' THEN 'assigned' WHEN 'resolved' THEN 'in_progress'
    WHEN 'closed' THEN 'resolved' ELSE NULL END;
  -- allow reassignment while assigned/in progress
  IF _new_status = 'assigned' AND c.status IN ('assigned','in_progress') THEN expected := c.status; END IF;
  IF expected IS NULL OR c.status <> expected THEN
    RAISE EXCEPTION 'Invalid transition from % to %', c.status, _new_status;
  END IF;

  IF _new_status IN ('verified','assigned') AND NOT (is_admin OR is_warden OR is_vol) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF _new_status IN ('in_progress','resolved') AND NOT (is_admin OR is_warden OR c.assigned_to = uid) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  IF _new_status = 'closed' AND NOT (is_admin OR is_warden) THEN RAISE EXCEPTION 'Only wardens can close complaints'; END IF;
  IF _new_status = 'assigned' AND _assigned_to IS NULL THEN RAISE EXCEPTION 'Choose a person to assign'; END IF;

  UPDATE public.complaints SET
    status = CASE WHEN _new_status = 'assigned' AND c.status = 'in_progress' THEN 'in_progress'::public.complaint_status ELSE _new_status END,
    assigned_to = COALESCE(_assigned_to, assigned_to),
    assigned_team_id = CASE WHEN _new_status = 'assigned' THEN _team_id ELSE assigned_team_id END,
    verification_notes = CASE WHEN _new_status = 'verified' THEN COALESCE(_note, verification_notes) ELSE verification_notes END,
    resolution_notes = CASE WHEN _new_status = 'resolved' THEN COALESCE(_note, resolution_notes) ELSE resolution_notes END,
    resolved_at = CASE WHEN _new_status = 'resolved' THEN now() ELSE resolved_at END,
    closed_at = CASE WHEN _new_status = 'closed' THEN now() ELSE closed_at END,
    updated_at = now()
  WHERE id = _complaint_id;

  label := CASE _new_status WHEN 'verified' THEN 'verified' WHEN 'assigned' THEN 'assigned'
    WHEN 'in_progress' THEN 'in progress' WHEN 'resolved' THEN 'resolved' ELSE 'closed' END;

  INSERT INTO public.complaint_history (complaint_id, user_id, old_status, new_status, note)
  VALUES (_complaint_id, uid, c.status, _new_status, _note);

  PERFORM public.notify(c.student_id, c.id, 'Complaint ' || label,
    c.complaint_number || ' "' || c.title || '" is now ' || label || '.');
  IF _new_status = 'assigned' AND _assigned_to IS NOT NULL THEN
    PERFORM public.notify(_assigned_to, c.id, 'New work assigned', c.complaint_number || ': ' || c.title);
  END IF;
  IF _new_status = 'resolved' THEN
    PERFORM public.notify(p.id, c.id, 'Resolution needs verification', c.complaint_number || ': ' || c.title)
    FROM public.profiles p JOIN public.user_roles ur ON ur.user_id = p.id
    WHERE ur.role = 'warden' AND (p.hostel_id IS NULL OR p.hostel_id = c.hostel_id);
  END IF;
END $$;
REVOKE EXECUTE ON FUNCTION public.update_complaint_status FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_complaint_status TO authenticated;

CREATE OR REPLACE FUNCTION public.set_complaint_priority(_complaint_id uuid, _priority public.complaint_priority)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.complaints; uid uuid := auth.uid();
BEGIN
  SELECT * INTO c FROM public.complaints WHERE id = _complaint_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Complaint not found'; END IF;
  IF NOT (public.has_role(uid,'admin') OR ((public.has_role(uid,'warden') OR public.has_role(uid,'volunteer'))
     AND (public.user_hostel(uid) IS NULL OR public.user_hostel(uid) = c.hostel_id))) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;
  UPDATE public.complaints SET priority = _priority, updated_at = now() WHERE id = _complaint_id;
  INSERT INTO public.complaint_history (complaint_id, user_id, old_status, new_status, note)
  VALUES (_complaint_id, uid, c.status, c.status, 'Priority set to ' || _priority);
END $$;
REVOKE EXECUTE ON FUNCTION public.set_complaint_priority FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_complaint_priority TO authenticated;

CREATE OR REPLACE FUNCTION public.add_complaint_note(_complaint_id uuid, _note text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.complaints; uid uuid := auth.uid();
BEGIN
  IF NOT public.is_staff_user(uid) OR NOT public.can_view_complaint(uid, _complaint_id) THEN RAISE EXCEPTION 'Not allowed'; END IF;
  SELECT * INTO c FROM public.complaints WHERE id = _complaint_id;
  INSERT INTO public.complaint_history (complaint_id, user_id, old_status, new_status, note)
  VALUES (_complaint_id, uid, c.status, c.status, left(_note, 1000));
END $$;
REVOKE EXECUTE ON FUNCTION public.add_complaint_note FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_complaint_note TO authenticated;

-- Ensure profile on first login (student by default)
CREATE OR REPLACE FUNCTION public.ensure_profile()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid(); meta jsonb; em text;
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = uid) THEN RETURN; END IF;
  SELECT raw_user_meta_data, email INTO meta, em FROM auth.users WHERE id = uid;
  INSERT INTO public.profiles (id, name, email, room_number, hostel_id)
  VALUES (uid, COALESCE(meta->>'name', meta->>'full_name', split_part(em,'@',1)), em,
          meta->>'room_number', NULLIF(meta->>'hostel_id','')::uuid);
  INSERT INTO public.user_roles (user_id, role) VALUES (uid, 'student');
END $$;
REVOKE EXECUTE ON FUNCTION public.ensure_profile FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_profile TO authenticated;

CREATE OR REPLACE FUNCTION public.set_user_role(_user_id uuid, _role public.app_role)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Not allowed'; END IF;
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  INSERT INTO public.user_roles (user_id, role) VALUES (_user_id, _role);
END $$;
REVOKE EXECUTE ON FUNCTION public.set_user_role FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.set_user_role TO authenticated;

-- Seed reference data
INSERT INTO public.hostels (name, location) VALUES
 ('Aravali Boys Hostel','North Campus, Block A'),
 ('Nilgiri Girls Hostel','South Campus, Block C'),
 ('Himalaya Hostel','East Campus, Block B');
INSERT INTO public.categories (name, description) VALUES
 ('Water / Plumbing','Leaks, taps, purifiers, water supply'),
 ('Electricity','Power, switches, lights, sockets'),
 ('Wi-Fi / Internet','Connectivity and network issues'),
 ('Cleaning','Housekeeping and hygiene'),
 ('Food / Mess','Mess food quality and service'),
 ('Room Maintenance','Doors, windows, walls, locks'),
 ('Bathroom','Toilets, showers, drainage'),
 ('Furniture','Beds, tables, chairs, cupboards'),
 ('Security','Safety and security concerns'),
 ('Other','Anything else');
INSERT INTO public.teams (name, description) VALUES
 ('Plumbing Team','Water and bathroom repairs'),
 ('Electrical Team','Electrical repairs'),
 ('IT Support','Wi-Fi and network'),
 ('Housekeeping','Cleaning services'),
 ('Mess Committee','Food and mess issues'),
 ('Maintenance Team','Furniture and room repairs');
INSERT INTO public.qr_locations (hostel_id, location_name, room_number, qr_code)
SELECT id, 'Ground Floor Water Purifier', NULL, 'aravali-gf-wp' FROM public.hostels WHERE name = 'Aravali Boys Hostel';
INSERT INTO public.qr_locations (hostel_id, location_name, room_number, qr_code)
SELECT id, 'Room 204', '204', 'nilgiri-204' FROM public.hostels WHERE name = 'Nilgiri Girls Hostel';

-- Storage policies
CREATE POLICY "complaint images public read" ON storage.objects FOR SELECT USING (bucket_id = 'complaint-images');
CREATE POLICY "complaint images upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'complaint-images' AND (storage.foldername(name))[1] = auth.uid()::text);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
