import selfieSofia from "@/assets/selfie-sofia.jpg";
import selfieKai from "@/assets/selfie-kai.jpg";
import selfieAmara from "@/assets/selfie-amara.jpg";
import selfieLucas from "@/assets/selfie-lucas.jpg";
import selfieElise from "@/assets/selfie-elise.jpg";
import selfieMarco from "@/assets/selfie-marco.jpg";

export interface MatchProfile {
  id: string;
  name: string;
  age: number;
  gender: "woman" | "man";
  interestedIn: "women" | "men" | "everyone";
  nationality: string;
  nationalityFlag: string;
  photo: string;
  boardingTime: Date;
  destination: string;
  gate: string;
  compatibility: number; // 0-100 percentage
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
    gender: "woman",
    nationality: "Italian",
    nationalityFlag: "🇮🇹",
    interestedIn: "everyone",
    photo: selfieSofia,
    boardingTime: addMinutes(95),
    destination: "Barcelona",
    gate: "B14",
    compatibility: 96,
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
    gender: "man",
    nationality: "Japanese",
    nationalityFlag: "🇯🇵",
    interestedIn: "women",
    photo: selfieKai,
    boardingTime: addMinutes(45),
    destination: "London",
    gate: "C7",
    compatibility: 84,
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
    gender: "woman",
    nationality: "Nigerian",
    nationalityFlag: "🇳🇬",
    interestedIn: "men",
    photo: selfieAmara,
    boardingTime: addMinutes(120),
    destination: "Paris",
    gate: "A22",
    compatibility: 91,
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
    gender: "man",
    nationality: "Brazilian",
    nationalityFlag: "🇧🇷",
    interestedIn: "women",
    photo: selfieLucas,
    boardingTime: addMinutes(70),
    destination: "Barcelona",
    gate: "B14",
    compatibility: 78,
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
    gender: "woman",
    nationality: "French",
    nationalityFlag: "🇫🇷",
    interestedIn: "everyone",
    photo: selfieElise,
    boardingTime: addMinutes(55),
    destination: "Tokyo",
    gate: "D3",
    compatibility: 94,
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
    gender: "man",
    nationality: "Spanish",
    nationalityFlag: "🇪🇸",
    interestedIn: "women",
    photo: selfieMarco,
    boardingTime: addMinutes(150),
    destination: "New York",
    gate: "E11",
    compatibility: 82,
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
