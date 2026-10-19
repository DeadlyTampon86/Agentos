CREATE TABLE public.reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'client',
  title text NOT NULL,
  message text NOT NULL,
  channel text NOT NULL DEFAULT 'sms',
  recipient text NOT NULL DEFAULT 'agent',
  recipient_name text,
  to_phone text,
  to_email text,
  client_consent boolean NOT NULL DEFAULT false,
  send_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  last_error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminders TO authenticated;
GRANT ALL ON public.reminders TO service_role;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reminders select" ON public.reminders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own reminders insert" ON public.reminders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND (recipient = 'agent' OR client_consent = true));
CREATE POLICY "own reminders update" ON public.reminders FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own reminders delete" ON public.reminders FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX reminders_due_idx ON public.reminders (status, send_at);