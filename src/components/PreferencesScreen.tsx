import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-state";

export function PreferencesScreen() {
  const { setScreen, preferences, setPreferences } = useApp();
  const [nationality, setNationality] = useState(preferences.nationality);
  const [destination, setDestination] = useState(preferences.destination);
  const [ageRange, setAgeRange] = useState(preferences.ageRange);
  const [genderPref, setGenderPref] = useState(preferences.genderPref);

  const handleSubmit = () => {
    setPreferences({ nationality, destination, ageRange, genderPref });
    setScreen("matches");
  };

  const Option = ({ label, value, selected, onSelect }: { label: string; value: string; selected: string; onSelect: (v: string) => void }) => (
    <button
      onClick={() => onSelect(value)}
      className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
        selected === value ? "bg-coral text-coral-foreground glow-coral" : "bg-input text-muted-foreground hover:bg-accent"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex min-h-screen flex-col px-6 py-8 bg-gradient-midnight">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 text-coral mb-2">
          <SlidersHorizontal className="h-7 w-7" />
        </div>
        <h1 className="font-display text-3xl font-bold">Your Preferences</h1>
        <p className="text-muted-foreground mt-1 mb-8">Who catches your eye at the gate?</p>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Nationality</p>
            <div className="flex flex-wrap gap-2">
              <Option label="Any" value="any" selected={nationality} onSelect={setNationality} />
              <Option label="Same as mine" value="same" selected={nationality} onSelect={setNationality} />
              <Option label="Different" value="different" selected={nationality} onSelect={setNationality} />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Destination</p>
            <div className="flex flex-wrap gap-2">
              <Option label="Any" value="any" selected={destination} onSelect={setDestination} />
              <Option label="Same flight" value="same" selected={destination} onSelect={setDestination} />
              <Option label="Different" value="different" selected={destination} onSelect={setDestination} />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Age range</p>
            <div className="flex flex-wrap gap-2">
              <Option label="Any" value="any" selected={ageRange} onSelect={setAgeRange} />
              <Option label="±3 years" value="3" selected={ageRange} onSelect={setAgeRange} />
              <Option label="±5 years" value="5" selected={ageRange} onSelect={setAgeRange} />
              <Option label="±10 years" value="10" selected={ageRange} onSelect={setAgeRange} />
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-2">Show me</p>
            <div className="flex flex-wrap gap-2">
              <Option label="Everyone" value="everyone" selected={genderPref} onSelect={setGenderPref} />
              <Option label="Women" value="women" selected={genderPref} onSelect={setGenderPref} />
              <Option label="Men" value="men" selected={genderPref} onSelect={setGenderPref} />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-auto pt-8">
        <Button variant="coral" size="lg" className="w-full rounded-xl py-6" onClick={handleSubmit}>
          See Matches <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
