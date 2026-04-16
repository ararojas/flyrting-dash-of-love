// Server-only helpers for AI matching logic

export interface MatchInput {
  user: {
    name: string;
    age: number;
    gender: string;
    interests: string;
    arrivalHabit: string;
    travelStyle: string;
    zodiac: string;
    destination: string;
  };
  candidate: {
    name: string;
    age: number;
    gender: string;
    nationality: string;
    arrivalHabit: string;
    travelStyle: string;
    zodiac: string;
    destination: string;
    bio: string;
    coincidences: number;
  };
  preferences: {
    nationality: string;
    destination: string;
    ageRange: string;
    genderPref: string;
  };
}

export interface MatchResult {
  candidateName: string;
  compatibility: number;
  reason: string;
}

export function buildMatchPrompt(inputs: MatchInput[]): string {
  const candidateDescriptions = inputs.map((input, i) => {
    return `Candidate ${i + 1} (${input.candidate.name}):
- Age: ${input.candidate.age}, Gender: ${input.candidate.gender}, Nationality: ${input.candidate.nationality}
- Travel style: ${input.candidate.travelStyle}, Arrival habit: ${input.candidate.arrivalHabit}
- Zodiac: ${input.candidate.zodiac}, Destination: ${input.candidate.destination}
- Bio: ${input.candidate.bio}
- Times crossed paths before: ${input.candidate.coincidences}`;
  }).join("\n\n");

  const user = inputs[0].user;
  const prefs = inputs[0].preferences;

  return `You are a travel dating compatibility AI for "Flyrting", an airport dating app.

The user's profile:
- Age: ${user.age}, Gender: ${user.gender}, Interested in: ${user.interests}
- Travel style: ${user.travelStyle}, Arrival habit: ${user.arrivalHabit}
- Zodiac: ${user.zodiac}, Destination: ${user.destination}

User preferences:
- Nationality preference: ${prefs.nationality}
- Destination preference: ${prefs.destination}
- Age range preference: ${prefs.ageRange}
- Gender preference: ${prefs.genderPref}

Candidates at the airport:

${candidateDescriptions}

For each candidate, return a compatibility percentage (0-100) and a short one-sentence romantic/playful reason.
Consider: travel style compatibility, zodiac chemistry, shared destinations, coincidence factor (fate!), age gap preference, and overall vibe match.
Candidates who have crossed paths before should get a significant boost.`;
}
