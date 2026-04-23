-- Add phone number to profiles for post-date exchange
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- ============================================================
-- SESSIONS: boarding pass verification records
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  flight_number TEXT NOT NULL,
  departure_airport TEXT NOT NULL,    -- IATA e.g. "CDG"
  destination_airport TEXT NOT NULL,  -- IATA e.g. "BCN"
  boarding_time TIMESTAMPTZ NOT NULL,
  departure_time TIMESTAMPTZ,
  passenger_name TEXT,
  gate TEXT,
  is_active BOOLEAN DEFAULT true,
  location_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_own_all" ON public.sessions
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- AIRPORT VISITS: for coincidence / fate detection
-- ============================================================
CREATE TABLE IF NOT EXISTS public.airport_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  airport_code TEXT NOT NULL,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  visited_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.airport_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "visits_own_all" ON public.airport_visits
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- CONVERSATIONS: one per pair of users (order-independent)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure exactly one conversation per pair regardless of who initiated
CREATE UNIQUE INDEX IF NOT EXISTS conversations_user_pair
  ON public.conversations (
    LEAST(user1_id::TEXT, user2_id::TEXT),
    GREATEST(user1_id::TEXT, user2_id::TEXT)
  );

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_participant_select" ON public.conversations
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "conversations_participant_insert" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- ============================================================
-- MESSAGES: chat messages within a conversation
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Participants can read messages in their conversations
CREATE POLICY "messages_participant_select" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

-- Participants can send messages in their conversations
CREATE POLICY "messages_participant_insert" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (c.user1_id = auth.uid() OR c.user2_id = auth.uid())
    )
  );

-- Enable Realtime for live chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- ============================================================
-- RATINGS: post-date feedback (one per rater per conversation)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ratee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (conversation_id, rater_id)
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ratings_rater_all" ON public.ratings
  FOR ALL USING (auth.uid() = rater_id);

CREATE POLICY "ratings_ratee_read" ON public.ratings
  FOR SELECT USING (auth.uid() = ratee_id);
