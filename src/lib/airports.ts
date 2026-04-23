export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
}

export const AIRPORTS: Airport[] = [
  { code: "CDG", name: "Charles de Gaulle", city: "Paris", country: "France", lat: 49.0097, lon: 2.5479 },
  { code: "ORY", name: "Orly", city: "Paris", country: "France", lat: 48.7262, lon: 2.3652 },
  { code: "LHR", name: "Heathrow", city: "London", country: "UK", lat: 51.477, lon: -0.4613 },
  { code: "LGW", name: "Gatwick", city: "London", country: "UK", lat: 51.1537, lon: -0.1821 },
  { code: "STN", name: "Stansted", city: "London", country: "UK", lat: 51.885, lon: 0.235 },
  { code: "FRA", name: "Frankfurt", city: "Frankfurt", country: "Germany", lat: 50.0379, lon: 8.5622 },
  { code: "MUC", name: "Munich", city: "Munich", country: "Germany", lat: 48.3538, lon: 11.7861 },
  { code: "TXL", name: "Tegel", city: "Berlin", country: "Germany", lat: 52.5597, lon: 13.2877 },
  { code: "BER", name: "Brandenburg", city: "Berlin", country: "Germany", lat: 52.3667, lon: 13.5033 },
  { code: "AMS", name: "Schiphol", city: "Amsterdam", country: "Netherlands", lat: 52.3105, lon: 4.7683 },
  { code: "MAD", name: "Barajas", city: "Madrid", country: "Spain", lat: 40.4939, lon: -3.5669 },
  { code: "BCN", name: "El Prat", city: "Barcelona", country: "Spain", lat: 41.2974, lon: 2.0833 },
  { code: "FCO", name: "Fiumicino", city: "Rome", country: "Italy", lat: 41.8003, lon: 12.2389 },
  { code: "MXP", name: "Malpensa", city: "Milan", country: "Italy", lat: 45.6306, lon: 8.7281 },
  { code: "ZRH", name: "Zürich", city: "Zurich", country: "Switzerland", lat: 47.4582, lon: 8.5555 },
  { code: "VIE", name: "Vienna", city: "Vienna", country: "Austria", lat: 48.1102, lon: 16.5697 },
  { code: "BRU", name: "Brussels", city: "Brussels", country: "Belgium", lat: 50.9010, lon: 4.4844 },
  { code: "LIS", name: "Humberto Delgado", city: "Lisbon", country: "Portugal", lat: 38.7756, lon: -9.1354 },
  { code: "OSL", name: "Gardermoen", city: "Oslo", country: "Norway", lat: 60.1976, lon: 11.1004 },
  { code: "ARN", name: "Arlanda", city: "Stockholm", country: "Sweden", lat: 59.6498, lon: 17.9238 },
  { code: "CPH", name: "Copenhagen", city: "Copenhagen", country: "Denmark", lat: 55.6180, lon: 12.6508 },
  { code: "HEL", name: "Helsinki-Vantaa", city: "Helsinki", country: "Finland", lat: 60.3172, lon: 24.9633 },
  { code: "IST", name: "İstanbul", city: "Istanbul", country: "Turkey", lat: 41.2754, lon: 28.7519 },
  { code: "SAW", name: "Sabiha Gökçen", city: "Istanbul", country: "Turkey", lat: 40.8985, lon: 29.3092 },
  { code: "ATH", name: "Eleftherios Venizelos", city: "Athens", country: "Greece", lat: 37.9364, lon: 23.9445 },
  { code: "WAW", name: "Chopin", city: "Warsaw", country: "Poland", lat: 52.1657, lon: 20.9671 },
  { code: "PRG", name: "Václav Havel", city: "Prague", country: "Czech Republic", lat: 50.1008, lon: 14.2600 },
  { code: "BUD", name: "Budapest", city: "Budapest", country: "Hungary", lat: 47.4369, lon: 19.2556 },
  { code: "JFK", name: "John F. Kennedy", city: "New York", country: "USA", lat: 40.6413, lon: -73.7781 },
  { code: "EWR", name: "Newark Liberty", city: "New York", country: "USA", lat: 40.6895, lon: -74.1745 },
  { code: "LGA", name: "LaGuardia", city: "New York", country: "USA", lat: 40.7769, lon: -73.8740 },
  { code: "LAX", name: "Los Angeles", city: "Los Angeles", country: "USA", lat: 33.9416, lon: -118.4085 },
  { code: "ORD", name: "O'Hare", city: "Chicago", country: "USA", lat: 41.9742, lon: -87.9073 },
  { code: "MDW", name: "Midway", city: "Chicago", country: "USA", lat: 41.7868, lon: -87.7522 },
  { code: "DFW", name: "Dallas/Fort Worth", city: "Dallas", country: "USA", lat: 32.8998, lon: -97.0403 },
  { code: "ATL", name: "Hartsfield-Jackson", city: "Atlanta", country: "USA", lat: 33.6407, lon: -84.4277 },
  { code: "MIA", name: "Miami", city: "Miami", country: "USA", lat: 25.7959, lon: -80.2870 },
  { code: "SFO", name: "San Francisco", city: "San Francisco", country: "USA", lat: 37.6213, lon: -122.379 },
  { code: "SEA", name: "Seattle-Tacoma", city: "Seattle", country: "USA", lat: 47.4502, lon: -122.3088 },
  { code: "BOS", name: "Logan", city: "Boston", country: "USA", lat: 42.3656, lon: -71.0096 },
  { code: "DEN", name: "Denver", city: "Denver", country: "USA", lat: 39.8561, lon: -104.6737 },
  { code: "LAS", name: "Harry Reid", city: "Las Vegas", country: "USA", lat: 36.0840, lon: -115.1537 },
  { code: "PHX", name: "Phoenix Sky Harbor", city: "Phoenix", country: "USA", lat: 33.4373, lon: -112.0078 },
  { code: "IAH", name: "George Bush", city: "Houston", country: "USA", lat: 29.9902, lon: -95.3368 },
  { code: "YYZ", name: "Pearson", city: "Toronto", country: "Canada", lat: 43.6777, lon: -79.6248 },
  { code: "YVR", name: "Vancouver", city: "Vancouver", country: "Canada", lat: 49.1967, lon: -123.1815 },
  { code: "YUL", name: "Trudeau", city: "Montreal", country: "Canada", lat: 45.4706, lon: -73.7408 },
  { code: "MEX", name: "Benito Juárez", city: "Mexico City", country: "Mexico", lat: 19.4363, lon: -99.0721 },
  { code: "GRU", name: "Guarulhos", city: "São Paulo", country: "Brazil", lat: -23.4356, lon: -46.4731 },
  { code: "GIG", name: "Galeão", city: "Rio de Janeiro", country: "Brazil", lat: -22.8099, lon: -43.2505 },
  { code: "EZE", name: "Ezeiza", city: "Buenos Aires", country: "Argentina", lat: -34.8222, lon: -58.5358 },
  { code: "SCL", name: "Arturo Merino Benítez", city: "Santiago", country: "Chile", lat: -33.3930, lon: -70.7858 },
  { code: "BOG", name: "El Dorado", city: "Bogotá", country: "Colombia", lat: 4.7016, lon: -74.1469 },
  { code: "LIM", name: "Jorge Chávez", city: "Lima", country: "Peru", lat: -12.0219, lon: -77.1143 },
  { code: "DXB", name: "Dubai", city: "Dubai", country: "UAE", lat: 25.2532, lon: 55.3657 },
  { code: "AUH", name: "Abu Dhabi", city: "Abu Dhabi", country: "UAE", lat: 24.4330, lon: 54.6511 },
  { code: "DOH", name: "Hamad", city: "Doha", country: "Qatar", lat: 25.2609, lon: 51.6138 },
  { code: "RUH", name: "King Khalid", city: "Riyadh", country: "Saudi Arabia", lat: 24.9576, lon: 46.6988 },
  { code: "JED", name: "King Abdulaziz", city: "Jeddah", country: "Saudi Arabia", lat: 21.6796, lon: 39.1565 },
  { code: "CAI", name: "Cairo", city: "Cairo", country: "Egypt", lat: 30.1219, lon: 31.4056 },
  { code: "NBO", name: "Jomo Kenyatta", city: "Nairobi", country: "Kenya", lat: -1.3192, lon: 36.9275 },
  { code: "JNB", name: "O.R. Tambo", city: "Johannesburg", country: "South Africa", lat: -26.1367, lon: 28.2411 },
  { code: "CPT", name: "Cape Town", city: "Cape Town", country: "South Africa", lat: -33.9648, lon: 18.6017 },
  { code: "LOS", name: "Murtala Muhammed", city: "Lagos", country: "Nigeria", lat: 6.5774, lon: 3.3212 },
  { code: "ACC", name: "Kotoka", city: "Accra", country: "Ghana", lat: 5.6052, lon: -0.1668 },
  { code: "CMN", name: "Mohammed V", city: "Casablanca", country: "Morocco", lat: 33.3675, lon: -7.5898 },
  { code: "BOM", name: "Chhatrapati Shivaji", city: "Mumbai", country: "India", lat: 19.0896, lon: 72.8656 },
  { code: "DEL", name: "Indira Gandhi", city: "Delhi", country: "India", lat: 28.5562, lon: 77.1000 },
  { code: "BLR", name: "Kempegowda", city: "Bangalore", country: "India", lat: 13.1986, lon: 77.7066 },
  { code: "SIN", name: "Changi", city: "Singapore", country: "Singapore", lat: 1.3644, lon: 103.9915 },
  { code: "HKG", name: "Hong Kong", city: "Hong Kong", country: "China", lat: 22.3080, lon: 113.9185 },
  { code: "PVG", name: "Pudong", city: "Shanghai", country: "China", lat: 31.1443, lon: 121.8083 },
  { code: "SHA", name: "Hongqiao", city: "Shanghai", country: "China", lat: 31.1979, lon: 121.3362 },
  { code: "PEK", name: "Capital", city: "Beijing", country: "China", lat: 40.0799, lon: 116.5844 },
  { code: "PKX", name: "Daxing", city: "Beijing", country: "China", lat: 39.5097, lon: 116.4105 },
  { code: "CAN", name: "Baiyun", city: "Guangzhou", country: "China", lat: 23.3924, lon: 113.2988 },
  { code: "NRT", name: "Narita", city: "Tokyo", country: "Japan", lat: 35.7648, lon: 140.3864 },
  { code: "HND", name: "Haneda", city: "Tokyo", country: "Japan", lat: 35.5494, lon: 139.7798 },
  { code: "KIX", name: "Kansai", city: "Osaka", country: "Japan", lat: 34.4347, lon: 135.2440 },
  { code: "ICN", name: "Incheon", city: "Seoul", country: "South Korea", lat: 37.4691, lon: 126.4510 },
  { code: "GMP", name: "Gimpo", city: "Seoul", country: "South Korea", lat: 37.5586, lon: 126.7906 },
  { code: "BKK", name: "Suvarnabhumi", city: "Bangkok", country: "Thailand", lat: 13.6900, lon: 100.7501 },
  { code: "DMK", name: "Don Mueang", city: "Bangkok", country: "Thailand", lat: 13.9126, lon: 100.6067 },
  { code: "KUL", name: "KLIA", city: "Kuala Lumpur", country: "Malaysia", lat: 2.7456, lon: 101.7099 },
  { code: "CGK", name: "Soekarno-Hatta", city: "Jakarta", country: "Indonesia", lat: -6.1275, lon: 106.6537 },
  { code: "MNL", name: "Ninoy Aquino", city: "Manila", country: "Philippines", lat: 14.5086, lon: 121.0197 },
  { code: "SYD", name: "Kingsford Smith", city: "Sydney", country: "Australia", lat: -33.9399, lon: 151.1753 },
  { code: "MEL", name: "Melbourne", city: "Melbourne", country: "Australia", lat: -37.6690, lon: 144.8410 },
  { code: "BNE", name: "Brisbane", city: "Brisbane", country: "Australia", lat: -27.3842, lon: 153.1175 },
  { code: "AKL", name: "Auckland", city: "Auckland", country: "New Zealand", lat: -37.0082, lon: 174.7850 },
];

function degreesToRadians(deg: number): number {
  return deg * (Math.PI / 180);
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Returns the nearest airport within radiusKm, or null if none found. */
export function findNearestAirport(lat: number, lon: number, radiusKm = 15): Airport | null {
  let nearest: Airport | null = null;
  let minDist = Infinity;
  for (const airport of AIRPORTS) {
    const dist = distanceKm(lat, lon, airport.lat, airport.lon);
    if (dist < minDist && dist <= radiusKm) {
      minDist = dist;
      nearest = airport;
    }
  }
  return nearest;
}

/** Look up an airport by IATA code (case-insensitive). */
export function getAirportByCode(code: string): Airport | undefined {
  return AIRPORTS.find((a) => a.code === code.toUpperCase());
}
