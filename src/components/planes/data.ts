// Small reference tables for the Planes page.

export const AIRLINES: Record<string, string> = {
  AAL: "American", ACA: "Air Canada", AFR: "Air France", AIC: "Air India", ANA: "All Nippon",
  ASA: "Alaska", AUA: "Austrian", AZU: "Azul", BAW: "British Airways", BEL: "Brussels",
  CAL: "China Airlines", CCA: "Air China", CES: "China Eastern", CFG: "Condor", CLX: "Cargolux",
  CPA: "Cathay Pacific", CSN: "China Southern", DAL: "Delta", DHK: "DHL", DLH: "Lufthansa",
  EDV: "Endeavor", EIN: "Aer Lingus", EJA: "NetJets", EJU: "easyJet Europe", ENY: "Envoy",
  ETD: "Etihad", ETH: "Ethiopian", EVA: "EVA Air", EWG: "Eurowings", EXS: "Jet2",
  EZY: "easyJet", FDX: "FedEx", FFT: "Frontier", FIN: "Finnair", GLO: "Gol",
  IBE: "Iberia", ICE: "Icelandair", JAL: "Japan Airlines", JBU: "JetBlue", KAL: "Korean Air",
  KLM: "KLM", LOG: "Loganair", LOT: "LOT Polish", MSR: "EgyptAir", NAX: "Norwegian",
  NKS: "Spirit", NOZ: "Norwegian", PGT: "Pegasus", QFA: "Qantas", QTR: "Qatar Airways",
  RAM: "Royal Air Maroc", RPA: "Republic", RUK: "Ryanair UK", RYR: "Ryanair", SAS: "SAS",
  SHT: "BA Shuttle", SIA: "Singapore Airlines", SKW: "SkyWest", SVA: "Saudia", SWA: "Southwest",
  SWR: "Swiss", TAM: "LATAM Brasil", TAP: "TAP Portugal", THA: "Thai", THY: "Turkish",
  TOM: "TUI", TRA: "Transavia", TVF: "Transavia France", UAE: "Emirates", UAL: "United",
  UPS: "UPS", VIR: "Virgin Atlantic", VLG: "Vueling", VOZ: "Virgin Australia", WJA: "WestJet",
  WUK: "Wizz Air UK", WZZ: "Wizz Air", WMT: "Wizz Air Malta",
};

export function airlineOf(callsign?: string): string | null {
  if (!callsign || !/^[A-Z]{3}\d/.test(callsign)) return null;
  return AIRLINES[callsign.slice(0, 3)] ?? null;
}

export interface Airport {
  code: string;
  name: string;
  lat: number;
  lon: number;
}

export const AIRPORT_GROUPS: { group: string; airports: Airport[] }[] = [
  {
    group: "UK & Ireland",
    airports: [
      { code: "MAN", name: "Manchester", lat: 53.354, lon: -2.275 },
      { code: "LHR", name: "London Heathrow", lat: 51.47, lon: -0.454 },
      { code: "LGW", name: "London Gatwick", lat: 51.148, lon: -0.19 },
      { code: "STN", name: "London Stansted", lat: 51.885, lon: 0.235 },
      { code: "LPL", name: "Liverpool", lat: 53.334, lon: -2.85 },
      { code: "BHX", name: "Birmingham", lat: 52.454, lon: -1.748 },
      { code: "EDI", name: "Edinburgh", lat: 55.95, lon: -3.373 },
      { code: "GLA", name: "Glasgow", lat: 55.872, lon: -4.433 },
      { code: "DUB", name: "Dublin", lat: 53.421, lon: -6.27 },
    ],
  },
  {
    group: "Europe",
    airports: [
      { code: "AMS", name: "Amsterdam", lat: 52.309, lon: 4.764 },
      { code: "CDG", name: "Paris CDG", lat: 49.01, lon: 2.548 },
      { code: "FRA", name: "Frankfurt", lat: 50.038, lon: 8.562 },
      { code: "MAD", name: "Madrid", lat: 40.472, lon: -3.561 },
      { code: "BCN", name: "Barcelona", lat: 41.297, lon: 2.079 },
      { code: "FCO", name: "Rome", lat: 41.8, lon: 12.239 },
      { code: "IST", name: "Istanbul", lat: 41.262, lon: 28.742 },
    ],
  },
  {
    group: "Americas",
    airports: [
      { code: "JFK", name: "New York JFK", lat: 40.641, lon: -73.778 },
      { code: "ATL", name: "Atlanta", lat: 33.641, lon: -84.427 },
      { code: "ORD", name: "Chicago O'Hare", lat: 41.974, lon: -87.907 },
      { code: "DFW", name: "Dallas Fort Worth", lat: 32.9, lon: -97.04 },
      { code: "LAX", name: "Los Angeles", lat: 33.942, lon: -118.409 },
      { code: "MIA", name: "Miami", lat: 25.795, lon: -80.287 },
      { code: "YYZ", name: "Toronto", lat: 43.677, lon: -79.625 },
      { code: "GRU", name: "Sao Paulo", lat: -23.435, lon: -46.473 },
    ],
  },
  {
    group: "Middle East, Asia, Pacific",
    airports: [
      { code: "DXB", name: "Dubai", lat: 25.253, lon: 55.365 },
      { code: "AUH", name: "Abu Dhabi", lat: 24.433, lon: 54.651 },
      { code: "DOH", name: "Doha", lat: 25.273, lon: 51.608 },
      { code: "SIN", name: "Singapore", lat: 1.364, lon: 103.991 },
      { code: "HKG", name: "Hong Kong", lat: 22.308, lon: 113.918 },
      { code: "HND", name: "Tokyo Haneda", lat: 35.549, lon: 139.78 },
      { code: "SYD", name: "Sydney", lat: -33.946, lon: 151.177 },
      { code: "JNB", name: "Johannesburg", lat: -26.134, lon: 28.242 },
    ],
  },
];
