import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Phone, Star, Loader2, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-state";
import { submitRating } from "@/lib/social.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function PostDateScreen() {
  const { setScreen, activeChatId, activeChatPartner } = useApp();
  const partner = activeChatPartner;
  const conversationId = activeChatId;

  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ matched: boolean; partnerPhone: string | null } | null>(null);

  const handleSubmit = async () => {
    if (!rating || !conversationId) return;
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) { toast.error("Not signed in"); return; }

      const res = await submitRating({ data: { token, conversationId, stars: rating } });
      if (res.error) {
        toast.error(res.error);
      } else {
        setResult({ matched: res.matched, partnerPhone: res.partnerPhone });
      }
    } catch {
      toast.error("Failed to submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  const photo = partner?.selfieDataUrl ?? partner?.avatarUrl;
  const name = partner?.displayName ?? "your date";

  // ── Mutual match screen ────────────────────────────────────────────────────
  if (result?.matched) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-gradient-midnight">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="flex flex-col items-center text-center"
        >
          <div className="relative mb-6">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-24 w-24 rounded-full bg-timer/20 flex items-center justify-center"
            >
              <Phone className="h-12 w-12 text-timer" />
            </motion.div>
          </div>
          <h1 className="font-display text-3xl font-bold">It's a match! 💕</h1>
          <p className="text-muted-foreground mt-2">
            Both of you had a great time!
          </p>
          {result.partnerPhone ? (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                Here's {partner?.displayName ?? "their"} number:
              </p>
              <p className="mt-2 font-display text-2xl font-bold text-gold">
                {result.partnerPhone}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {partner?.displayName ?? "They"} also received your number
              </p>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground max-w-[260px]">
              They haven't added their phone number to their profile yet —
              ask them directly!
            </p>
          )}
          <Button variant="coral" className="mt-8 rounded-xl" onClick={() => setScreen("matches")}>
            Back to Matches
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── Waiting screen (rated positively but partner hasn't yet) ──────────────
  if (result && !result.matched) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-gradient-midnight">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center max-w-sm"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="h-20 w-20 rounded-full bg-coral/20 flex items-center justify-center mb-6"
          >
            <Heart className="h-10 w-10 text-coral" />
          </motion.div>
          <h1 className="font-display text-2xl font-bold">Rating submitted!</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            If {name} rates positively too, you'll both get each other's
            number automatically.
          </p>
          <Button variant="coral" className="mt-8 rounded-xl" onClick={() => setScreen("matches")}>
            Back to Matches
          </Button>
        </motion.div>
      </div>
    );
  }

  // ── Rating screen ──────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-gradient-midnight">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="h-24 w-24 rounded-full object-cover border-2 border-coral mb-4"
          />
        ) : (
          <div className="h-24 w-24 rounded-full bg-card border-2 border-coral flex items-center justify-center mb-4">
            <UserIcon className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}

        <h1 className="font-display text-3xl font-bold">How was your date?</h1>
        <p className="text-muted-foreground mt-2">Rate your time with {name}</p>

        <div className="flex gap-2 mt-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onClick={() => setRating(i)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-10 w-10 ${
                  i <= rating ? "fill-gold text-gold" : "text-muted-foreground/30"
                }`}
              />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 w-full">
            <p className="text-sm text-muted-foreground mb-4">
              {rating >= 4
                ? "✨ Amazing! If they feel the same, we'll exchange numbers"
                : rating >= 3
                ? "Nice! Thanks for the feedback"
                : "We'll keep looking for your perfect match"}
            </p>
            <Button
              variant="coral"
              size="lg"
              className="w-full rounded-xl py-6"
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</>
              ) : (
                <><Heart className="h-4 w-4 mr-2" /> Submit Rating</>
              )}
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
