import { Airport } from "@/types";

export const AIRPORTS: Airport[] = [
  {
    code: "EBB",
    name: "Entebbe International Airport",
    city: "Entebbe / Kampala",
    country: "Uganda",
    countryCode: "UG",
    timezone: "Africa/Kampala",
  },
  {
    code: "NBO",
    name: "Jomo Kenyatta International Airport",
    city: "Nairobi",
    country: "Kenya",
    countryCode: "KE",
    timezone: "Africa/Nairobi",
  },
  {
    code: "KGL",
    name: "Kigali International Airport",
    city: "Kigali",
    country: "Rwanda",
    countryCode: "RW",
    timezone: "Africa/Kigali",
  },
  {
    code: "DAR",
    name: "Julius Nyerere International Airport",
    city: "Dar es Salaam",
    country: "Tanzania",
    countryCode: "TZ",
    timezone: "Africa/Dar_es_Salaam",
  },
  {
    code: "ADD",
    name: "Addis Ababa Bole International Airport",
    city: "Addis Ababa",
    country: "Ethiopia",
    countryCode: "ET",
    timezone: "Africa/Addis_Ababa",
  },
  {
    code: "JNB",
    name: "O.R. Tambo International Airport",
    city: "Johannesburg",
    country: "South Africa",
    countryCode: "ZA",
    timezone: "Africa/Johannesburg",
  },
  {
    code: "CAI",
    name: "Cairo International Airport",
    city: "Cairo",
    country: "Egypt",
    countryCode: "EG",
    timezone: "Africa/Cairo",
  },
  {
    code: "DXB",
    name: "Dubai International Airport",
    city: "Dubai",
    country: "United Arab Emirates",
    countryCode: "AE",
    timezone: "Asia/Dubai",
  },
  {
    code: "DOH",
    name: "Hamad International Airport",
    city: "Doha",
    country: "Qatar",
    countryCode: "QA",
    timezone: "Asia/Qatar",
  },
  {
    code: "IST",
    name: "Istanbul Airport",
    city: "Istanbul",
    country: "Turkey",
    countryCode: "TR",
    timezone: "Europe/Istanbul",
  },
  {
    code: "LHR",
    name: "London Heathrow Airport",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    timezone: "Europe/London",
  },
  {
    code: "LGW",
    name: "London Gatwick Airport",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    timezone: "Europe/London",
  },
  {
    code: "AMS",
    name: "Amsterdam Airport Schiphol",
    city: "Amsterdam",
    country: "Netherlands",
    countryCode: "NL",
    timezone: "Europe/Amsterdam",
  },
  {
    code: "CDG",
    name: "Charles de Gaulle Airport",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    timezone: "Europe/Paris",
  },
  {
    code: "FRA",
    name: "Frankfurt Airport",
    city: "Frankfurt",
    country: "Germany",
    countryCode: "DE",
    timezone: "Europe/Berlin",
  },
  {
    code: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    country: "United States",
    countryCode: "US",
    timezone: "America/New_York",
  },
  {
    code: "IAD",
    name: "Washington Dulles International Airport",
    city: "Washington, D.C.",
    country: "United States",
    countryCode: "US",
    timezone: "America/New_York",
  },
  {
    code: "ORD",
    name: "O'Hare International Airport",
    city: "Chicago",
    country: "United States",
    countryCode: "US",
    timezone: "America/Chicago",
  },
  {
    code: "YYZ",
    name: "Toronto Pearson International Airport",
    city: "Toronto",
    country: "Canada",
    countryCode: "CA",
    timezone: "America/Toronto",
  },
  {
    code: "BOM",
    name: "Chhatrapati Shivaji Maharaj International Airport",
    city: "Mumbai",
    country: "India",
    countryCode: "IN",
    timezone: "Asia/Kolkata",
  },
  {
    code: "CAN",
    name: "Guangzhou Baiyun International Airport",
    city: "Guangzhou",
    country: "China",
    countryCode: "CN",
    timezone: "Asia/Shanghai",
  },
  {
    code: "SIN",
    name: "Singapore Changi Airport",
    city: "Singapore",
    country: "Singapore",
    countryCode: "SG",
    timezone: "Asia/Singapore",
  },
  {
    code: "BKK",
    name: "Suvarnabhumi Airport",
    city: "Bangkok",
    country: "Thailand",
    countryCode: "TH",
    timezone: "Asia/Bangkok",
  },
  {
    code: "SYD",
    name: "Sydney Kingsford Smith Airport",
    city: "Sydney",
    country: "Australia",
    countryCode: "AU",
    timezone: "Australia/Sydney",
  },
];

export function searchAirports(query: string): Airport[] {
  if (!query || query.trim().length === 0) return AIRPORTS.slice(0, 6);
  const q = query.toLowerCase().trim();
  return AIRPORTS.filter(
    (a) =>
      a.code.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q)
  );
}

export function getAirportByCode(code: string): Airport | undefined {
  return AIRPORTS.find((a) => a.code.toUpperCase() === code.toUpperCase());
}
