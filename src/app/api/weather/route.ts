import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Open-Meteo — completely free, no API key ever needed
// Geocoding via Open-Meteo's own geocoding API

async function geocode(city: string) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`,
    { next: { revalidate: 86400 } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  const r = data.results?.[0];
  if (!r) return null;
  return { lat: r.latitude, lon: r.longitude, name: r.name, country: r.country, timezone: r.timezone };
}

async function getWeather(lat: number, lon: number, timezone: string) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude",  lat.toString());
  url.searchParams.set("longitude", lon.toString());
  url.searchParams.set("timezone",  timezone);
  url.searchParams.set("current", [
    "temperature_2m","relative_humidity_2m","apparent_temperature",
    "is_day","precipitation","rain","weather_code","cloud_cover",
    "surface_pressure","wind_speed_10m","wind_direction_10m","wind_gusts_10m",
    "uv_index","visibility"
  ].join(","));
  url.searchParams.set("hourly", [
    "temperature_2m","precipitation_probability","weather_code","wind_speed_10m"
  ].join(","));
  url.searchParams.set("daily", [
    "weather_code","temperature_2m_max","temperature_2m_min",
    "precipitation_sum","precipitation_probability_max",
    "wind_speed_10m_max","uv_index_max","sunrise","sunset"
  ].join(","));
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("wind_speed_unit", "mph");

  const res = await fetch(url.toString(), { next: { revalidate: 900 } });
  if (!res.ok) return null;
  return res.json();
}

async function getAirQuality(lat: number, lon: number) {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,ozone,european_aqi,us_aqi&timezone=auto`;
  try {
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

// WMO weather code to description + emoji
export function weatherCodeInfo(code: number): { label: string; emoji: string } {
  if (code === 0)  return { label: "Clear sky",          emoji: "☀️" };
  if (code === 1)  return { label: "Mainly clear",       emoji: "🌤️" };
  if (code === 2)  return { label: "Partly cloudy",      emoji: "⛅" };
  if (code === 3)  return { label: "Overcast",           emoji: "☁️" };
  if (code <= 49)  return { label: "Foggy",              emoji: "🌫️" };
  if (code <= 57)  return { label: "Drizzle",            emoji: "🌦️" };
  if (code <= 67)  return { label: "Rain",               emoji: "🌧️" };
  if (code <= 77)  return { label: "Snow",               emoji: "❄️" };
  if (code <= 82)  return { label: "Rain showers",       emoji: "🌦️" };
  if (code <= 86)  return { label: "Snow showers",       emoji: "🌨️" };
  if (code <= 99)  return { label: "Thunderstorm",       emoji: "⛈️" };
  return { label: "Unknown", emoji: "🌡️" };
}

function getAQILabel(aqi: number): { label: string; color: string } {
  if (aqi <= 20)  return { label: "Good",        color: "#10b981" };
  if (aqi <= 40)  return { label: "Fair",        color: "#84cc16" };
  if (aqi <= 60)  return { label: "Moderate",    color: "#f59e0b" };
  if (aqi <= 80)  return { label: "Poor",        color: "#f97316" };
  if (aqi <= 100) return { label: "Very Poor",   color: "#ef4444" };
  return                  { label: "Hazardous",  color: "#7f1d1d" };
}

function getWindDir(deg: number): string {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") ?? "London";
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");

  let location: { lat: number; lon: number; name: string; country: string; timezone: string } | null = null;

  if (latParam && lonParam) {
    location = { lat: parseFloat(latParam), lon: parseFloat(lonParam), name: city, country: "", timezone: "auto" };
  } else {
    location = await geocode(city);
  }

  if (!location) {
    return NextResponse.json({ error: `Could not find location: ${city}` }, { status: 404 });
  }

  const [weather, airQuality] = await Promise.all([
    getWeather(location.lat, location.lon, location.timezone),
    getAirQuality(location.lat, location.lon),
  ]);

  if (!weather) {
    return NextResponse.json({ error: "Weather data unavailable" }, { status: 502 });
  }

  const c = weather.current;
  const d = weather.daily;
  const h = weather.hourly;

  // Build 24h hourly forecast
  const now = new Date();
  const hourly = (h.time as string[]).map((t: string, i: number) => ({
    time: t,
    temp: h.temperature_2m[i],
    precip: h.precipitation_probability[i],
    code: h.weather_code[i],
    wind: h.wind_speed_10m[i],
  })).filter((x: { time: string }) => new Date(x.time) >= now).slice(0, 24);

  // Build 7-day forecast
  const daily = (d.time as string[]).map((t: string, i: number) => ({
    date: t,
    code: d.weather_code[i],
    maxTemp: d.temperature_2m_max[i],
    minTemp: d.temperature_2m_min[i],
    precip: d.precipitation_sum[i],
    precipProb: d.precipitation_probability_max[i],
    windMax: d.wind_speed_10m_max[i],
    uvMax: d.uv_index_max[i],
    sunrise: d.sunrise[i],
    sunset: d.sunset[i],
    ...weatherCodeInfo(d.weather_code[i]),
  }));

  const aqi = airQuality?.current?.european_aqi ?? null;

  return NextResponse.json({
    location: { ...location },
    current: {
      temp:        c.temperature_2m,
      feelsLike:   c.apparent_temperature,
      humidity:    c.relative_humidity_2m,
      precip:      c.precipitation,
      code:        c.weather_code,
      ...weatherCodeInfo(c.weather_code),
      cloudCover:  c.cloud_cover,
      pressure:    c.surface_pressure,
      windSpeed:   c.wind_speed_10m,
      windDir:     getWindDir(c.wind_direction_10m),
      windDeg:     c.wind_direction_10m,
      windGusts:   c.wind_gusts_10m,
      uvIndex:     c.uv_index,
      visibility:  c.visibility,
      isDay:       c.is_day,
    },
    hourly,
    daily,
    airQuality: aqi !== null ? {
      aqi,
      pm25:  airQuality?.current?.pm2_5,
      pm10:  airQuality?.current?.pm10,
      no2:   airQuality?.current?.nitrogen_dioxide,
      o3:    airQuality?.current?.ozone,
      ...getAQILabel(aqi),
    } : null,
    timestamp: Date.now(),
  });
}
