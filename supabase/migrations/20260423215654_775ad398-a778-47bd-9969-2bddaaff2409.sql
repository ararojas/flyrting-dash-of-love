CREATE TABLE public.conversation_reads (
  user_id UUID NOT NULL,
  conversation_id UUID NOT NULL,
  last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, conversation_id)
);

ALTER TABLE public.conversation_reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reads_own_select" ON public.conversation_reads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "reads_own_insert" ON public.conversation_reads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reads_own_update" ON public.conversation_reads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reads_own_delete" ON public.conversation_reads
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_conversation_reads_conv ON public.conversation_reads(conversation_id);