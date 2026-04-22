import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, User as UserIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/app-state";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ZODIAC_SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const NATIONALITIES = ["American", "Brazilian", "British", "Chinese", "Dutch", "French", "German", "Indian", "Italian", "Japanese", "Mexican", "Nigerian", "Spanish", "Other"];

interface ProfileScreenProps {
  /** When true, this is the first-time onboarding profile creation (after Google sign-in). */
  isOnboarding?: boolean;
}

export function ProfileScreen({ isOnboarding = false }: ProfileScreenProps) {
  const { setScreen } = useApp();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [interestedIn, setInterestedIn] = useState("");
  const [nationality, setNationality] = useState("");
  const [zodiac, setZodiac] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [arrivalHabit, setArrivalHabit] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [bio, setBio] = useState("");
  const [favoriteDestination, setFavoriteDestination] = useState("");
  const [funAnswer, setFunAnswer] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        toast.error("Could not load your profile");
      } else if (data) {
        setDisplayName(data.display_name ?? "");
        setAge(data.age ? String(data.age) : "");
        setGender(data.gender ?? "");
        setInterestedIn(data.interested_in ?? "");
        setNationality(data.nationality ?? "");
        setZodiac(data.zodiac ?? "");
        setTravelStyle(data.travel_style ?? "");
        setArrivalHabit(data.arrival_habit ?? "");
        setHobbies(data.hobbies ?? "");
        setBio(data.bio ?? "");
        setFavoriteDestination(data.favorite_destination ?? "");
        setFunAnswer(data.fun_answer ?? "");
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const canSave = displayName && age && gender && interestedIn && nationality;

  const handleSave = async () => {
    if (!user || !canSave) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        age: Number(age),
        gender,
        interested_in: interestedIn,
        nationality,
        zodiac: zodiac || null,
        travel_style: travelStyle || null,
        arrival_habit: arrivalHabit || null,
        hobbies: hobbies || null,
        bio: bio || null,
        favorite_destination: favoriteDestination || null,
        fun_answer: funAnswer || null,
        profile_completed: true,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Could not save profile");
      return;
    }
    toast.success(isOnboarding ? "Profile created!" : "Profile updated");
    setScreen(isOnboarding ? "boarding-pass" : "matches");
  };

  const Chip = ({ label, value, selected, onSelect }: { label: string; value: string; selected: string; onSelect: (v: string) => void }) => (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
        selected === value ? "bg-coral text-coral-foreground glow-coral" : "bg-input text-muted-foreground hover:bg-accent"
      }`}
    >
      {label}
    </button>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-midnight">
        <Loader2 className="h-8 w-8 text-coral animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-midnight px-6 py-6">
      <div className="flex items-center gap-3 mb-6">
        {!isOnboarding && (
          <button onClick={() => setScreen("matches")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex items-center gap-2 text-coral">
          <UserIcon className="h-6 w-6" />
          <h1 className="font-display text-2xl font-bold text-foreground">
            {isOnboarding ? "Create Your Profile" : "Edit Profile"}
          </h1>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Display name</p>
          <input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="What should people call you?"
            className="w-full rounded-xl bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Age</p>
            <input
              value={age}
              onChange={e => setAge(e.target.value)}
              type="number"
              min={18}
              placeholder="28"
              className="w-full rounded-xl bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral"
            />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Nationality</p>
            <select
              value={nationality}
              onChange={e => setNationality(e.target.value)}
              className="w-full rounded-xl bg-input px-3 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-coral"
            >
              <option value="">Choose…</option>
              {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Your gender</p>
          <div className="grid grid-cols-3 gap-2">
            {["Woman", "Man", "Non-binary"].map(g => (
              <Chip key={g} label={g} value={g} selected={gender} onSelect={setGender} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Match preference</p>
          <div className="grid grid-cols-3 gap-2">
            {["Women", "Men", "Everyone"].map(i => (
              <Chip key={i} label={i} value={i} selected={interestedIn} onSelect={setInterestedIn} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Zodiac</p>
          <div className="grid grid-cols-4 gap-2">
            {ZODIAC_SIGNS.map(z => (
              <Chip key={z} label={z} value={z} selected={zodiac} onSelect={setZodiac} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Travel style</p>
          <div className="grid grid-cols-2 gap-2">
            {["Spontaneous", "Planned", "Luxury", "Backpacker"].map(s => (
              <Chip key={s} label={s} value={s} selected={travelStyle} onSelect={setTravelStyle} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wider">Arrival habit</p>
          <div className="grid grid-cols-1 gap-2">
            {["3 hours early", "Right on time", "Running through the terminal"].map(h => (
              <Chip key={h} label={h} value={h} selected={arrivalHabit} onSelect={setArrivalHabit} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Hobbies & interests</p>
          <input
            value={hobbies}
            onChange={e => setHobbies(e.target.value)}
            placeholder="surfing, jazz, ramen, photography…"
            className="w-full rounded-xl bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral"
          />
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">About you</p>
          <Textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="A short, honest sentence or two."
            rows={3}
            className="rounded-xl bg-input border-0 focus-visible:ring-2 focus-visible:ring-coral"
          />
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Dream destination</p>
          <input
            value={favoriteDestination}
            onChange={e => setFavoriteDestination(e.target.value)}
            placeholder="Where would you fly tomorrow?"
            className="w-full rounded-xl bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-coral"
          />
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wider">Window or aisle… and why?</p>
          <Textarea
            value={funAnswer}
            onChange={e => setFunAnswer(e.target.value)}
            placeholder="Defend your seat choice 😏"
            rows={2}
            className="rounded-xl bg-input border-0 focus-visible:ring-2 focus-visible:ring-coral"
          />
        </div>
      </motion.div>

      <div className="mt-8 pb-4">
        <Button
          variant="coral"
          size="lg"
          className="w-full rounded-xl py-6"
          disabled={!canSave || saving}
          onClick={handleSave}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isOnboarding ? "Create profile" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}