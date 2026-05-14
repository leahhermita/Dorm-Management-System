-- =============================================
-- DORMHUB - SUPABASE DATABASE SETUP
-- Paste this whole file into Supabase SQL Editor, then click Run.
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS profiles (
  id           UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email        TEXT,
  full_name    TEXT NOT NULL,
  phone        TEXT,
  role         TEXT NOT NULL DEFAULT 'student'
                 CHECK (role IN ('admin','student','staff')),
  avatar_url   TEXT,
  course       TEXT,
  year_level   INT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
  id           SERIAL PRIMARY KEY,
  room_number  TEXT UNIQUE NOT NULL,
  floor        INT,
  type         TEXT,
  capacity     INT NOT NULL DEFAULT 1,
  price        NUMERIC(10,2) NOT NULL,
  status       TEXT DEFAULT 'vacant'
                 CHECK (status IN ('vacant','occupied','maintenance')),
  amenities    TEXT[],
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenants (
  id             SERIAL PRIMARY KEY,
  user_id        UUID REFERENCES profiles(id) ON DELETE SET NULL,
  room_id        INT REFERENCES rooms(id) ON DELETE SET NULL,
  full_name      TEXT,
  email          TEXT,
  phone          TEXT,
  course         TEXT,
  year_level     INT,
  profile_color  TEXT DEFAULT '#6ee7b7',
  move_in_date   DATE,
  move_out_date  DATE,
  contract_url   TEXT,
  id_url         TEXT,
  status         TEXT DEFAULT 'active'
                   CHECK (status IN ('active','inactive','pending')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id             SERIAL PRIMARY KEY,
  tenant_id      INT REFERENCES tenants(id) ON DELETE CASCADE,
  amount         NUMERIC(10,2) NOT NULL,
  month_year     TEXT NOT NULL,
  due_date       DATE,
  payment_date   DATE,
  method         TEXT,
  status         TEXT DEFAULT 'pending'
                   CHECK (status IN ('pending','paid','overdue')),
  receipt_url    TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_requests (
  id           SERIAL PRIMARY KEY,
  tenant_id    INT REFERENCES tenants(id) ON DELETE CASCADE,
  room_id      INT REFERENCES rooms(id),
  issue        TEXT NOT NULL,
  description  TEXT,
  image_url    TEXT,
  priority     TEXT DEFAULT 'medium'
                 CHECK (priority IN ('low','medium','high')),
  status       TEXT DEFAULT 'pending'
                 CHECK (status IN ('pending','in-progress','resolved','cancelled')),
  assigned_to  UUID REFERENCES profiles(id),
  resolved_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visitor_logs (
  id             SERIAL PRIMARY KEY,
  visitor_name   TEXT NOT NULL,
  visitor_phone  TEXT,
  room_id        INT REFERENCES rooms(id),
  tenant_id      INT REFERENCES tenants(id),
  purpose        TEXT,
  time_in        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  time_out       TIMESTAMPTZ,
  status         TEXT DEFAULT 'inside'
                   CHECK (status IN ('inside','checked-out')),
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type       TEXT,
  message    TEXT NOT NULL,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS course TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS year_level INT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS profile_color TEXT DEFAULT '#6ee7b7';

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

DROP POLICY IF EXISTS "Users read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view rooms" ON rooms;
DROP POLICY IF EXISTS "Admins manage rooms" ON rooms;
DROP POLICY IF EXISTS "Admins manage tenants" ON tenants;
DROP POLICY IF EXISTS "Tenant views own record" ON tenants;
DROP POLICY IF EXISTS "Tenant views own payments" ON payments;
DROP POLICY IF EXISTS "Admins manage payments" ON payments;
DROP POLICY IF EXISTS "Tenant creates own requests" ON maintenance_requests;
DROP POLICY IF EXISTS "Tenant views own requests" ON maintenance_requests;
DROP POLICY IF EXISTS "Staff manages maintenance" ON maintenance_requests;
DROP POLICY IF EXISTS "Staff manages visitor logs" ON visitor_logs;
DROP POLICY IF EXISTS "Users view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users update own notifications" ON notifications;

CREATE POLICY "Users read own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins read all profiles"
  ON profiles FOR SELECT USING (public.current_user_role() = 'admin');

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view rooms"
  ON rooms FOR SELECT USING (true);

CREATE POLICY "Admins manage rooms"
  ON rooms FOR ALL USING (public.current_user_role() = 'admin');

CREATE POLICY "Admins manage tenants"
  ON tenants FOR ALL USING (public.current_user_role() IN ('admin','staff'));

CREATE POLICY "Tenant views own record"
  ON tenants FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Tenant views own payments"
  ON payments FOR SELECT USING (
    tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins manage payments"
  ON payments FOR ALL USING (public.current_user_role() = 'admin');

CREATE POLICY "Tenant creates own requests"
  ON maintenance_requests FOR INSERT WITH CHECK (
    tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid())
  );

CREATE POLICY "Tenant views own requests"
  ON maintenance_requests FOR SELECT USING (
    tenant_id IN (SELECT id FROM tenants WHERE user_id = auth.uid())
  );

CREATE POLICY "Staff manages maintenance"
  ON maintenance_requests FOR ALL USING (public.current_user_role() IN ('admin','staff'));

CREATE POLICY "Staff manages visitor logs"
  ON visitor_logs FOR ALL USING (public.current_user_role() IN ('admin','staff'));

CREATE POLICY "Users view own notifications"
  ON notifications FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications"
  ON notifications FOR UPDATE USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE INDEX IF NOT EXISTS idx_tenants_room ON tenants(room_id);
CREATE INDEX IF NOT EXISTS idx_tenants_user ON tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_due ON payments(due_date);
CREATE INDEX IF NOT EXISTS idx_maint_tenant ON maintenance_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maint_status ON maintenance_requests(status);
CREATE INDEX IF NOT EXISTS idx_visitor_time ON visitor_logs(time_in);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
