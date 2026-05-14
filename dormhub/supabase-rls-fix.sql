-- Fix for: infinite recursion detected in policy for relation "profiles"
-- Paste this into Supabase SQL Editor and click Run.

CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

DROP POLICY IF EXISTS "Admins read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins manage rooms" ON rooms;
DROP POLICY IF EXISTS "Admins manage tenants" ON tenants;
DROP POLICY IF EXISTS "Admins manage payments" ON payments;
DROP POLICY IF EXISTS "Staff manages maintenance" ON maintenance_requests;
DROP POLICY IF EXISTS "Staff manages visitor logs" ON visitor_logs;

CREATE POLICY "Admins read all profiles"
  ON profiles FOR SELECT USING (public.current_user_role() = 'admin');

CREATE POLICY "Admins manage rooms"
  ON rooms FOR ALL USING (public.current_user_role() = 'admin');

CREATE POLICY "Admins manage tenants"
  ON tenants FOR ALL USING (public.current_user_role() IN ('admin','staff'));

CREATE POLICY "Admins manage payments"
  ON payments FOR ALL USING (public.current_user_role() = 'admin');

CREATE POLICY "Staff manages maintenance"
  ON maintenance_requests FOR ALL USING (public.current_user_role() IN ('admin','staff'));

CREATE POLICY "Staff manages visitor logs"
  ON visitor_logs FOR ALL USING (public.current_user_role() IN ('admin','staff'));
