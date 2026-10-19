CREATE TABLE public.outreach_sends (
  recipient_id text PRIMARY KEY,
  to_email text NOT NULL,
  status text NOT NULL DEFAULT 'sending',
  gmail_message_id text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.outreach_sends TO service_role;
ALTER TABLE public.outreach_sends ENABLE ROW LEVEL SECURITY;