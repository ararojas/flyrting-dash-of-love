import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Clock, Plane, Sparkles, Loader2, User as UserIcon } from "lucide-react";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useApp } from "@/lib/app-state";
import { mockChat } from "@/lib/mock-data";
import { getMessages, sendMessage as sendMessageFn, markConversationRead, type Message } from "@/lib/social.functions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { toast } from "sonner";

type DisplayMessage = { id: string; senderId: string; content: string };

function fromMock(): DisplayMessage[] {
  return mockChat.map((m) => ({ id: m.id, senderId: m.senderId, content: m.text }));
}

function fromDb(m: Message): DisplayMessage {
  return { id: m.id, senderId: m.senderId, content: m.content };
}

export function ChatScreen() {
  const { setScreen, activeChatId, activeChatPartner } = useApp();
  const { user } = useAuth();

  const isDemo = activeChatId?.startsWith("demo-") ?? false;

  const [messages, setMessages] = useState<DisplayMessage[]>(isDemo ? fromMock() : []);
  const [loadingMessages, setLoadingMessages] = useState(!isDemo);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showExtendPopup, setShowExtendPopup] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const partner = activeChatPartner;
  const conversationId = activeChatId;

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load messages from DB (real conversations only)
  useEffect(() => {
    if (isDemo || !conversationId) return;
    let cancelled = false;
    (async () => {
      setLoadingMessages(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;
        const result = await getMessages({ data: { token, conversationId } });
        if (!cancelled) {
          if (result.error) toast.error(result.error);
          else setMessages(result.messages.map(fromDb));
        }
        // Mark as read on open
        await markConversationRead({ data: { token, conversationId } });
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    })();
    return () => { cancelled = true; };
  }, [conversationId, isDemo]);

  // Realtime subscription (real conversations only)
  useEffect(() => {
    if (isDemo || !conversationId) return;

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as {
            id: string;
            conversation_id: string;
            sender_id: string;
            content: string;
            created_at: string;
          };
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, { id: newMsg.id, senderId: newMsg.sender_id, content: newMsg.content }];
          });
          // Mark as read whenever a partner message arrives while we're in the chat
          if (newMsg.sender_id !== user?.id) {
            supabase.auth.getSession().then(({ data: { session } }) => {
              const token = session?.access_token;
              if (token) markConversationRead({ data: { token, conversationId } });
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, isDemo]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!partner?.boardingTime) return;
    const boardingMs = new Date(partner.boardingTime).getTime();
    const msUntilWarning = boardingMs - Date.now() - 30 * 60 * 1000;
    if (msUntilWarning <= 0) {
      setShowExtendPopup(true);
      return;
    }
    const timer = setTimeout(() => setShowExtendPopup(true), msUntilWarning);
    return () => clearTimeout(timer);
  }, [partner?.boardingTime]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");

    if (isDemo) {
      setMessages((prev) => [
        ...prev,
        { id: `msg-${Date.now()}`, senderId: "me", content: text },
      ]);
      return;
    }

    if (!conversationId) return;
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, senderId: user?.id ?? "me", content: text }]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { toast.error("Not signed in"); return; }

      const result = await sendMessageFn({ data: { token, conversationId, content: text } });
      if (result.error) {
        toast.error(result.error);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } else if (result.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? fromDb(result.message!) : m))
        );
      }
    } catch {
      toast.error("Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const partnerPhoto = partner?.selfieDataUrl ?? partner?.avatarUrl;
  const partnerBoardingDate = partner?.boardingTime ? new Date(partner.boardingTime) : null;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-midnight">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-midnight/90 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setScreen("matches")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>

          {partnerPhoto ? (
            <img
              src={partnerPhoto}
              alt={partner?.displayName ?? ""}
              className="h-10 w-10 rounded-full object-cover border-2 border-coral"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-card border-2 border-coral flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold truncate">
                {partner?.displayName ?? "Traveller"}
              </span>
              {partner?.nationality && (
                <span className="text-sm shrink-0">
                  {partner.nationality.slice(0, 2)}
                </span>
              )}
              {(partner?.coincidences ?? 0) > 0 && (
                <span className="flex items-center gap-0.5 text-[10px] bg-fate/20 text-fate rounded-full px-1.5 py-0.5 shrink-0">
                  <Sparkles className="h-2.5 w-2.5" />
                  {partner!.coincidences}× fate
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Plane className="h-3 w-3" />
              <span className="truncate">
                {partner?.destinationAirport ?? "—"}
                {partner?.gate ? ` · Gate ${partner.gate}` : ""}
              </span>
            </div>
          </div>

          {partnerBoardingDate && (
            <CountdownTimer targetTime={partnerBoardingDate} variant="clock" size="sm" />
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loadingMessages && (
          <div className="flex justify-center pt-8">
            <Loader2 className="h-6 w-6 text-coral animate-spin" />
          </div>
        )}

        {!loadingMessages && messages.length === 0 && (
          <div className="flex flex-col items-center text-center pt-12 px-6">
            <p className="text-sm text-muted-foreground">
              Say hello — you only have{" "}
              {partnerBoardingDate ? "until they board" : "limited time"}!
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === "me" || msg.senderId === user?.id;
          const isTemp = msg.id.startsWith("temp-");
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isTemp ? 0.6 : 1, y: 0 }}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  isMe
                    ? "bg-coral text-coral-foreground rounded-br-md"
                    : "bg-card text-foreground rounded-bl-md border border-border"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Extend date popup */}
      {showExtendPopup && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-2 rounded-2xl bg-card border border-gold/30 p-4 glow-gold"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-gold" />
            <span className="font-display font-bold text-gold">Time is running out!</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            {partner?.displayName ?? "They"} boards in less than 30 minutes. Want to extend your date?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => { setShowExtendPopup(false); setScreen("extend-flight"); }}
              className="flex-1 rounded-xl bg-gradient-sunset py-2.5 text-sm font-semibold text-coral-foreground glow-coral"
            >
              Extend Date ✈️
            </button>
            <button
              onClick={() => setShowExtendPopup(false)}
              className="rounded-xl bg-muted px-4 py-2.5 text-sm text-muted-foreground"
            >
              Maybe later
            </button>
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="border-t border-border bg-midnight/90 backdrop-blur-xl px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Say something spontaneous…"
            className="flex-1 rounded-xl bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="h-11 w-11 rounded-xl bg-coral flex items-center justify-center text-coral-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>

        <button
          onClick={() => setScreen("post-date")}
          className="mt-2 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Rate this date →
        </button>
      </div>
    </div>
  );
}
