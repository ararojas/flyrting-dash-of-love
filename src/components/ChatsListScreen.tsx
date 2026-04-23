import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MessageCircle, Plane, Heart, Loader2, User as UserIcon } from "lucide-react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useApp, type ChatPartner } from "@/lib/app-state";
import { getConversations, type ConversationSummary } from "@/lib/social.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ChatsListScreen() {
  const { setScreen, openChat } = useApp();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;
        const result = await getConversations({ data: { token } });
        if (!cancelled) {
          if (result.error) toast.error(result.error);
          else setConversations(result.conversations);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleOpen = (convo: ConversationSummary) => {
    const partner: ChatPartner = {
      userId: convo.partner.userId,
      displayName: convo.partner.displayName,
      selfieDataUrl: convo.partner.selfieDataUrl,
      avatarUrl: convo.partner.avatarUrl,
      nationality: convo.partner.nationality,
      boardingTime: convo.partner.boardingTime,
      destinationAirport: convo.partner.destinationAirport,
      gate: convo.partner.gate,
      coincidences: 0,
      bio: convo.partner.bio,
    };
    openChat(convo.conversationId, partner);
  };

  return (
    <div className="min-h-screen bg-gradient-midnight px-4 pb-8">
      <div className="sticky top-0 z-10 bg-midnight/80 backdrop-blur-xl pt-6 pb-4 px-2 flex items-center gap-3">
        <button onClick={() => setScreen("matches")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-coral">
          <MessageCircle className="h-5 w-5" />
          <h1 className="font-display text-2xl font-bold text-foreground">Your chats</h1>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center pt-16">
          <Loader2 className="h-6 w-6 text-coral animate-spin" />
        </div>
      )}

      {!loading && conversations.length === 0 && (
        <div className="flex flex-col items-center text-center mt-16 px-6">
          <div className="h-16 w-16 rounded-full bg-card border border-border flex items-center justify-center mb-4">
            <Heart className="h-7 w-7 text-coral/60" />
          </div>
          <p className="text-sm font-medium text-foreground">No chats yet</p>
          <p className="text-xs text-muted-foreground mt-1.5 max-w-[260px]">
            Tap on someone in the grid to start a conversation.
          </p>
          <button
            onClick={() => setScreen("matches")}
            className="mt-5 rounded-xl bg-coral text-coral-foreground px-4 py-2 text-sm font-semibold glow-coral"
          >
            Browse Flyrting
          </button>
        </div>
      )}

      <div className="mt-2 space-y-2">
        {conversations.map((convo, i) => {
          const p = convo.partner;
          const photo = p.selfieDataUrl ?? p.avatarUrl;
          const boardingDate = p.boardingTime ? new Date(p.boardingTime) : null;

          return (
            <motion.button
              key={convo.conversationId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleOpen(convo)}
              className="w-full flex items-center gap-3 rounded-2xl bg-card border border-border p-3 text-left hover:border-coral/40 transition-colors"
            >
              {photo ? (
                <img
                  src={photo}
                  alt={p.displayName ?? ""}
                  className="h-14 w-14 rounded-full object-cover border-2 border-coral/40 shrink-0"
                />
              ) : (
                <div className="h-14 w-14 rounded-full bg-muted border-2 border-coral/40 flex items-center justify-center shrink-0">
                  <UserIcon className="h-6 w-6 text-muted-foreground/50" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-foreground truncate">
                    {p.displayName ?? "Traveller"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                  <Plane className="h-3 w-3 shrink-0" />
                  <span className="truncate">
                    {p.destinationAirport ?? "—"}
                    {p.gate ? ` · Gate ${p.gate}` : ""}
                  </span>
                </div>
                {convo.lastMessage ? (
                  <p className="text-xs text-muted-foreground/80 truncate mt-1 italic">
                    {convo.lastMessage}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground/50 mt-1 italic">
                    No messages yet — say hi!
                  </p>
                )}
              </div>
              {boardingDate && (
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Boards in</span>
                  <CountdownTimer targetTime={boardingDate} variant="clock" size="sm" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
