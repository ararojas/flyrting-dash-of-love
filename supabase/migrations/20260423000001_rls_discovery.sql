-- Allow any authenticated user to read active sessions (needed for match discovery)
-- Users at the same airport need to find each other
CREATE POLICY "sessions_discover_active" ON public.sessions
  FOR SELECT USING (is_active = true AND auth.role() = 'authenticated');

-- Allow any authenticated user to read airport visit history
-- Needed for coincidence ("fate") detection between users
CREATE POLICY "visits_discover" ON public.airport_visits
  FOR SELECT USING (auth.role() = 'authenticated');
