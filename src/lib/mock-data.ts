export interface MatchProfile {
  id: string;
  name: string;
  age: number;
  nationality: string;
  nationalityFlag: string;
  photo: string;
  boardingTime: Date;
  destination: string;
  gate: string;
  starRating: number;
  coincidences: number;
  travelStyle: string;
  arrivalHabit: string;
  zodiac: string;
  bio: string;
}

const now = new Date();
const addMinutes = (mins: number) => new Date(now.getTime() + mins * 60000);

export const mockMatches: MatchProfile[] = [
  {
    id: "1",
    name: "Sofia",
    age: 27,
    nationality: "Italian",
    nationalityFlag: "🇮🇹",
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
    boardingTime: addMinutes(95),
    destination: "Barcelona",
    gate: "B14",
    starRating: 4.8,
    coincidences: 3,
    travelStyle: "Spontaneous explorer",
    arrivalHabit: "Fashionably late",
    zodiac: "Leo",
    bio: "Architecture lover who always finds the best espresso at every airport.",
  },
  {
    id: "2",
    name: "Kai",
    age: 31,
    nationality: "Japanese",
    nationalityFlag: "🇯🇵",
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
    boardingTime: addMinutes(45),
    destination: "London",
    gate: "C7",
    starRating: 4.2,
    coincidences: 0,
    travelStyle: "Cultural deep-diver",
    arrivalHabit: "3 hours early",
    zodiac: "Virgo",
    bio: "Photographer chasing golden hours in every timezone.",
  },
  {
    id: "3",
    name: "Amara",
    age: 25,
    nationality: "Nigerian",
    nationalityFlag: "🇳🇬",
    photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face",
    boardingTime: addMinutes(120),
    destination: "Paris",
    gate: "A22",
    starRating: 4.5,
    coincidences: 1,
    travelStyle: "Foodie adventurer",
    arrivalHabit: "Right on time",
    zodiac: "Sagittarius",
    bio: "Finding the soul of a city through its street food.",
  },
  {
    id: "4",
    name: "Lucas",
    age: 29,
    nationality: "Brazilian",
    nationalityFlag: "🇧🇷",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    boardingTime: addMinutes(70),
    destination: "Barcelona",
    gate: "B14",
    starRating: 3.9,
    coincidences: 2,
    travelStyle: "Beach hopper",
    arrivalHabit: "Cutting it close",
    zodiac: "Pisces",
    bio: "DJ who collects vinyl from every city. Your next favorite song is my carry-on.",
  },
  {
    id: "5",
    name: "Elise",
    age: 26,
    nationality: "French",
    nationalityFlag: "🇫🇷",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
    boardingTime: addMinutes(55),
    destination: "Tokyo",
    gate: "D3",
    starRating: 4.7,
    coincidences: 0,
    travelStyle: "Minimalist nomad",
    arrivalHabit: "Early bird",
    zodiac: "Aquarius",
    bio: "Writer. One carry-on, infinite stories.",
  },
  {
    id: "6",
    name: "Marco",
    age: 33,
    nationality: "Spanish",
    nationalityFlag: "🇪🇸",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
    boardingTime: addMinutes(150),
    destination: "New York",
    gate: "E11",
    starRating: 4.1,
    coincidences: 0,
    travelStyle: "Business + pleasure",
    arrivalHabit: "Lounge regular",
    zodiac: "Capricorn",
    bio: "Architect by day, salsa dancer by layover.",
  },
];

export interface FlightOption {
  airline: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  destination: string;
  price: number;
  currency: string;
}

export const mockFlights: FlightOption[] = [
  { airline: "Vueling", flightNumber: "VY1234", departure: "18:45", arrival: "20:30", destination: "Barcelona", price: 89, currency: "€" },
  { airline: "Ryanair", flightNumber: "FR5678", departure: "21:10", arrival: "23:00", destination: "Barcelona", price: 45, currency: "€" },
  { airline: "Iberia", flightNumber: "IB9012", departure: "Tomorrow 08:00", arrival: "Tomorrow 09:45", destination: "Barcelona", price: 120, currency: "€" },
  { airline: "EasyJet", flightNumber: "U26789", departure: "Tomorrow 14:30", arrival: "Tomorrow 16:15", destination: "Barcelona", price: 67, currency: "€" },
];

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

export const mockChat: ChatMessage[] = [
  { id: "c1", senderId: "1", text: "Hey! I noticed we're both heading to Barcelona ✈️", timestamp: addMinutes(-25) },
  { id: "c2", senderId: "me", text: "Yes! Have you been before? It's my first time", timestamp: addMinutes(-23) },
  { id: "c3", senderId: "1", text: "Many times! I can share my favorite spots. Want to grab a coffee at the gate?", timestamp: addMinutes(-20) },
  { id: "c4", senderId: "me", text: "I'd love that! I'm at gate B14, where are you?", timestamp: addMinutes(-18) },
  { id: "c5", senderId: "1", text: "Same gate! Look for the girl with the red scarf 😊", timestamp: addMinutes(-15) },
];
