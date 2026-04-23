import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function userClient(token: string) {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}

// ─── Types returned by these functions ──────────────────────────────────────

export interface AirportMatch {
  userId: string;
  displayName: string | null;
  selfieDataUrl: string | null;
  avatarUrl: string | null;
  age: number | null;
  gender: string | null;
  interestedIn: string | null;
  nationality: string | null;
  zodiac: string | null;
  arrivalHabit: string | null;
  travelStyle: string | null;
  bio: string | null;
  hobbies: string | null;
  boardingTime: string;        // ISO string
  destinationAirport: string;
  gate: string | null;
  coincidences: number;
}

export interface ConversationSummary {
  conversationId: string;
  partner: {
    userId: string;
    displayName: string | null;
    selfieDataUrl: string | null;
    avatarUrl: string | null;
    nationality: string | null;
    boardingTime: string | null;
    destinationAirport: string | null;
    gate: string | null;
    bio: string | null;
  };
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

// ─── Get all users currently at the same airport ────────────────────────────

export const getAirportMatches = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string().min(1), sessionId: z.string().uuid() }).parse(input)
  )
  .handler(async ({ data }): Promise<{ error: string | null; matches: AirportMatch[] }> => {
    const client = userClient(data.token);
    const { data: { user }, error: authErr } = await client.auth.getUser();
    if (authErr || !user) return { error: "Unauthorized", matches: [] };

    // Get caller's session to find their airport
    const { data: mySession } = await client
      .from("sessions")
      .select("departure_airport")
      .eq("id", data.sessionId)
      .eq("user_id", user.id)
      .single();

    if (!mySession) return { error: "Session not found", matches: [] };

    const airport = mySession.departure_airport;

    // Find other active sessions at the same airport with boarding time in the future
    const { data: otherSessions, error: sessErr } = await client
      .from("sessions")
      .select(`
        id,
        user_id,
        boarding_time,
        destination_airport,
        gate,
        profiles!sessions_user_id_fkey (
          id,
          display_name,
          selfie_data_url,
          avatar_url,
          age,
          gender,
          interested_in,
          nationality,
          zodiac,
          arrival_habit,
          travel_style,
          bio,
          hobbies
        )
      `)
      .eq("departure_airport", airport)
      .eq("is_active", true as never)
      .neq("user_id", user.id)
      .gt("boarding_time", new Date().toISOString());

    if (sessErr) return { error: sessErr.message, matches: [] };
    if (!otherSessions?.length) return { error: null, matches: [] };

    // Count coincidences per candidate (airports they've both visited)
    const candidateIds = otherSessions.map((s) => s.user_id);

    const { data: visits } = await client
      .from("airport_visits")
      .select("airport_code")
      .eq("user_id", user.id);

    const myAirports = new Set((visits ?? []).map((v) => v.airport_code));

    const coincidenceMap: Record<string, number> = {};
    for (const candidateId of candidateIds) {
      const { data: theirVisits } = await client
        .from("airport_visits")
        .select("airport_code")
        .eq("user_id", candidateId);

      const shared = (theirVisits ?? []).filter((v) => myAirports.has(v.airport_code)).length;
      coincidenceMap[candidateId] = shared;
    }

    const matches: AirportMatch[] = otherSessions.map((session) => {
      const profile = Array.isArray(session.profiles) ? session.profiles[0] : session.profiles;
      return {
        userId: session.user_id,
        displayName: profile?.display_name ?? null,
        selfieDataUrl: profile?.selfie_data_url ?? null,
        avatarUrl: profile?.avatar_url ?? null,
        age: profile?.age ?? null,
        gender: profile?.gender ?? null,
        interestedIn: profile?.interested_in ?? null,
        nationality: profile?.nationality ?? null,
        zodiac: profile?.zodiac ?? null,
        arrivalHabit: profile?.arrival_habit ?? null,
        travelStyle: profile?.travel_style ?? null,
        bio: profile?.bio ?? null,
        hobbies: profile?.hobbies ?? null,
        boardingTime: session.boarding_time,
        destinationAirport: session.destination_airport,
        gate: session.gate ?? null,
        coincidences: coincidenceMap[session.user_id] ?? 0,
      };
    });

    return { error: null, matches };
  });

// ─── Open (or get existing) a conversation with another user ────────────────

export const openConversation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({ token: z.string().min(1), targetUserId: z.string().uuid() })
      .parse(input)
  )
  .handler(async ({ data }): Promise<{ error: string | null; conversationId: string | null }> => {
    const client = userClient(data.token);
    const { data: { user }, error: authErr } = await client.auth.getUser();
    if (authErr || !user) return { error: "Unauthorized", conversationId: null };

    if (user.id === data.targetUserId) {
      return { error: "Cannot open conversation with yourself", conversationId: null };
    }

    // Check if a conversation already exists between the two users
    const { data: existing } = await client
      .from("conversations")
      .select("id")
      .or(
        `and(user1_id.eq.${user.id},user2_id.eq.${data.targetUserId}),` +
        `and(user1_id.eq.${data.targetUserId},user2_id.eq.${user.id})`
      )
      .limit(1)
      .maybeSingle();

    if (existing) return { error: null, conversationId: existing.id };

    // Create a new conversation
    const { data: created, error: createErr } = await client
      .from("conversations")
      .insert({ user1_id: user.id, user2_id: data.targetUserId } as never)
      .select("id")
      .single();

    if (createErr) return { error: createErr.message, conversationId: null };
    return { error: null, conversationId: created.id };
  });

// ─── Get all conversations for the current user ─────────────────────────────

export const getConversations = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string().min(1) }).parse(input)
  )
  .handler(async ({ data }): Promise<{ error: string | null; conversations: ConversationSummary[] }> => {
    const client = userClient(data.token);
    const { data: { user }, error: authErr } = await client.auth.getUser();
    if (authErr || !user) return { error: "Unauthorized", conversations: [] };

    const { data: convos, error: convErr } = await client
      .from("conversations")
      .select("id, user1_id, user2_id, created_at")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (convErr) return { error: convErr.message, conversations: [] };
    if (!convos?.length) return { error: null, conversations: [] };

    // For each conversation, get partner profile + last message
    const result: ConversationSummary[] = [];

    for (const convo of convos) {
      const partnerId = convo.user1_id === user.id ? convo.user2_id : convo.user1_id;

      const [{ data: profile }, { data: lastMsg }] = await Promise.all([
        client
          .from("profiles")
          .select(
            "id, display_name, selfie_data_url, avatar_url, nationality, bio"
          )
          .eq("id", partnerId)
          .maybeSingle(),
        client
          .from("messages")
          .select("content, created_at")
          .eq("conversation_id", convo.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      // Get partner's active session for boarding time
      const { data: partnerSession } = await client
        .from("sessions")
        .select("boarding_time, destination_airport, gate")
        .eq("user_id", partnerId)
        .eq("is_active", true as never)
        .limit(1)
        .maybeSingle();

      // Compute unread count: messages from partner after my last_read_at
      const { data: readRow } = await client
        .from("conversation_reads")
        .select("last_read_at")
        .eq("user_id", user.id)
        .eq("conversation_id", convo.id)
        .maybeSingle();

      const lastReadAt = (readRow as { last_read_at?: string } | null)?.last_read_at
        ?? "1970-01-01T00:00:00Z";

      const { count: unreadCount } = await client
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", convo.id)
        .eq("sender_id", partnerId)
        .gt("created_at", lastReadAt);

      result.push({
        conversationId: convo.id,
        partner: {
          userId: partnerId,
          displayName: profile?.display_name ?? null,
          selfieDataUrl: profile?.selfie_data_url ?? null,
          avatarUrl: profile?.avatar_url ?? null,
          nationality: profile?.nationality ?? null,
          bio: profile?.bio ?? null,
          boardingTime: partnerSession?.boarding_time ?? null,
          destinationAirport: partnerSession?.destination_airport ?? null,
          gate: partnerSession?.gate ?? null,
        },
        lastMessage: lastMsg?.content ?? null,
        lastMessageAt: lastMsg?.created_at ?? null,
        unreadCount: unreadCount ?? 0,
      });
    }

    return { error: null, conversations: result };
  });

// ─── Get messages for a conversation ────────────────────────────────────────

export const getMessages = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({ token: z.string().min(1), conversationId: z.string().uuid() })
      .parse(input)
  )
  .handler(async ({ data }): Promise<{ error: string | null; messages: Message[] }> => {
    const client = userClient(data.token);
    const { data: { user }, error: authErr } = await client.auth.getUser();
    if (authErr || !user) return { error: "Unauthorized", messages: [] };

    const { data: msgs, error } = await client
      .from("messages")
      .select("id, conversation_id, sender_id, content, created_at")
      .eq("conversation_id", data.conversationId)
      .order("created_at", { ascending: true });

    if (error) return { error: error.message, messages: [] };

    return {
      error: null,
      messages: (msgs ?? []).map((m) => ({
        id: m.id,
        conversationId: m.conversation_id,
        senderId: m.sender_id,
        content: m.content,
        createdAt: m.created_at ?? new Date().toISOString(),
      })),
    };
  });

// ─── Send a message ──────────────────────────────────────────────────────────

export const sendMessage = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        token: z.string().min(1),
        conversationId: z.string().uuid(),
        content: z.string().min(1).max(2000),
      })
      .parse(input)
  )
  .handler(async ({ data }): Promise<{ error: string | null; message: Message | null }> => {
    const client = userClient(data.token);
    const { data: { user }, error: authErr } = await client.auth.getUser();
    if (authErr || !user) return { error: "Unauthorized", message: null };

    const { data: msg, error } = await client
      .from("messages")
      .insert({
        conversation_id: data.conversationId,
        sender_id: user.id,
        content: data.content,
      } as never)
      .select("id, conversation_id, sender_id, content, created_at")
      .single();

    if (error) return { error: error.message, message: null };

    return {
      error: null,
      message: {
        id: msg.id,
        conversationId: msg.conversation_id,
        senderId: msg.sender_id,
        content: msg.content,
        createdAt: msg.created_at ?? new Date().toISOString(),
      },
    };
  });

// ─── Submit post-date rating ─────────────────────────────────────────────────

// ─── Mark a conversation as read for the current user ───────────────────────

export const markConversationRead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({ token: z.string().min(1), conversationId: z.string().uuid() })
      .parse(input)
  )
  .handler(async ({ data }): Promise<{ error: string | null }> => {
    const client = userClient(data.token);
    const { data: { user }, error: authErr } = await client.auth.getUser();
    if (authErr || !user) return { error: "Unauthorized" };

    const { error } = await client
      .from("conversation_reads")
      .upsert(
        {
          user_id: user.id,
          conversation_id: data.conversationId,
          last_read_at: new Date().toISOString(),
        } as never,
        { onConflict: "user_id,conversation_id" }
      );

    return { error: error?.message ?? null };
  });

// ─── Total unread messages across all conversations for current user ───────

export const getUnreadTotal = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ token: z.string().min(1) }).parse(input)
  )
  .handler(async ({ data }): Promise<{ total: number }> => {
    const client = userClient(data.token);
    const { data: { user }, error: authErr } = await client.auth.getUser();
    if (authErr || !user) return { total: 0 };

    // Fetch conversations user belongs to
    const { data: convos } = await client
      .from("conversations")
      .select("id, user1_id, user2_id")
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

    if (!convos?.length) return { total: 0 };

    // Fetch all read records at once
    const convoIds = convos.map((c) => c.id);
    const { data: reads } = await client
      .from("conversation_reads")
      .select("conversation_id, last_read_at")
      .eq("user_id", user.id)
      .in("conversation_id", convoIds);

    const readMap = new Map<string, string>();
    (reads ?? []).forEach((r) => {
      readMap.set(
        (r as { conversation_id: string }).conversation_id,
        (r as { last_read_at: string }).last_read_at
      );
    });

    let total = 0;
    for (const convo of convos) {
      const partnerId = convo.user1_id === user.id ? convo.user2_id : convo.user1_id;
      const lastReadAt = readMap.get(convo.id) ?? "1970-01-01T00:00:00Z";
      const { count } = await client
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("conversation_id", convo.id)
        .eq("sender_id", partnerId)
        .gt("created_at", lastReadAt);
      total += count ?? 0;
    }

    return { total };
  });

export const submitRating = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        token: z.string().min(1),
        conversationId: z.string().uuid(),
        stars: z.number().int().min(1).max(5),
      })
      .parse(input)
  )
  .handler(
    async ({
      data,
    }): Promise<{
      error: string | null;
      matched: boolean;
      partnerPhone: string | null;
    }> => {
      const client = userClient(data.token);
      const { data: { user }, error: authErr } = await client.auth.getUser();
      if (authErr || !user)
        return { error: "Unauthorized", matched: false, partnerPhone: null };

      // Get conversation to find partner
      const { data: convo } = await client
        .from("conversations")
        .select("user1_id, user2_id")
        .eq("id", data.conversationId)
        .single();

      if (!convo) return { error: "Conversation not found", matched: false, partnerPhone: null };

      const partnerId =
        convo.user1_id === user.id ? convo.user2_id : convo.user1_id;

      // Upsert the rating (in case they rate twice)
      const { error: ratingErr } = await client
        .from("ratings")
        .upsert(
          {
            conversation_id: data.conversationId,
            rater_id: user.id,
            ratee_id: partnerId,
            stars: data.stars,
          } as never,
          { onConflict: "conversation_id,rater_id" }
        );

      if (ratingErr) return { error: ratingErr.message, matched: false, partnerPhone: null };

      // Check if partner also rated ≥ 4 stars (mutual positive date)
      if (data.stars >= 4) {
        const { data: partnerRating } = await client
          .from("ratings")
          .select("stars")
          .eq("conversation_id", data.conversationId)
          .eq("rater_id", partnerId)
          .maybeSingle();

        if (partnerRating && partnerRating.stars >= 4) {
          // Both rated positively → reveal phone number
          const { data: partnerProfile } = await client
            .from("profiles")
            .select("phone_number")
            .eq("id", partnerId)
            .maybeSingle();

          return {
            error: null,
            matched: true,
            partnerPhone: (partnerProfile as { phone_number?: string | null } | null)?.phone_number ?? null,
          };
        }
      }

      return { error: null, matched: false, partnerPhone: null };
    }
  );
