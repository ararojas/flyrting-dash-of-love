import { motion } from "framer-motion";
import { Heart, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { useState } from "react";

export function WelcomeScreen() {
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogle = async () => {
    setSigningIn(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Could not sign in with Google. Try again.");
        setSigningIn(false);
        return;
      }
      // result.redirected → browser will redirect; otherwise auth listener takes over.
    } catch (e) {
      toast.error("Sign-in failed. Try again.");
      setSigningIn(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 bg-gradient-midnight">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="relative mb-8"
        >
          <div className="h-24 w-24 rounded-full bg-gradient-sunset flex items-center justify-center glow-coral">
            <Plane className="h-12 w-12 text-coral-foreground" strokeWidth={1.5} />
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1"
          >
            <Heart className="h-8 w-8 fill-coral text-coral" />
          </motion.div>
        </motion.div>

        <h1 className="font-display text-5xl font-bold tracking-tight">
          <span className="text-gradient-coral">Flyrting</span>
        </h1>
        <p className="mt-3 text-lg text-muted-foreground font-display italic">
          Love at first flight
        </p>
        <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
          Meet incredible people at your airport gate.
          Every connection has a countdown — make the most of it.
        </p>

        <div className="mt-10 flex w-full flex-col gap-3">
          <Button
            variant="coral"
            size="lg"
            className="w-full text-base py-6 rounded-xl gap-3"
            onClick={handleGoogle}
            disabled={signingIn}
          >
            <GoogleIcon />
            {signingIn ? "Connecting…" : "Continue with Google"}
          </Button>
        </div>

        <p className="mt-8 text-xs text-muted-foreground/60">
          Only works at airports • Location services required
        </p>
      </motion.div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFFFFF" d="M21.35 11.1H12v3.2h5.35c-.23 1.5-1.7 4.4-5.35 4.4-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.7 4.43 14.55 3.5 12 3.5 6.98 3.5 2.9 7.58 2.9 12.6S6.98 21.7 12 21.7c6.92 0 9.5-4.85 9.5-7.34 0-.5-.05-.86-.15-1.26z"/>
    </svg>
  );
}
