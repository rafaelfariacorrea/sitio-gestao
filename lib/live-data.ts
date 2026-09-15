export type WeatherSnapshot = {
  temperature: number | null;
  rainProbability: number | null;
  windSpeed: number | null;
  weatherCode: number | null;
  fetchedAt: string;
  error?: string;
};

export type MarketQuote = {
  product: string;
  value: number | null;
  unit: string;
  source: string;
  fetchedAt: string;
};

const CONAB_URL = "https://pentahoportaldeinformacoes.conab.gov.br/pentaho/api/repos/%3Ahome%3APROHORT%3AprecoDia.wcdf/generatedContent?userid=pentaho&password=password";
const SOURCE = "Conab / Prohort — média das praças disponíveis";

export async function fetchWeather(latitude: number, longitude: number): Promise<WeatherSnapshot> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,rain&hourly=precipitation_probability&forecast_days=1&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("weather request failed");
    const data = await response.json();
    return {
      temperature: typeof data.current?.temperature_2m === "number" ? data.current.temperature_2m : null,
      windSpeed: typeof data.current?.wind_speed_10m === "number" ? data.current.wind_speed_10m : null,
      rainProbability: typeof data.hourly?.precipitation_probability?.[0] === "number" ? data.hourly.precipitation_probability[0] : null,
      weatherCode: typeof data.current?.weather_code === "number" ? data.current.weather_code : null,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return { temperature: null, rainProbability: null, windSpeed: null, weatherCode: null, fetchedAt: new Date().toISOString(), error: "Clima indisponível sem conexão" };
  }
}

function parseAverage(text: string, productLabel: string) {
  const normalized = text.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ");
  const start = normalized.indexOf(productLabel);
  if (start < 0) return null;
  const tail = normalized.slice(start + productLabel.length, start + productLabel.length + 1800);
  const values = (tail.match(/\d+(?:[.,]\d{1,2})/g) ?? [])
    .map((value) => Number(value.replace(",", ".")))
    .filter((value) => Number.isFinite(value) && value > 0 && value < 1000)
    .slice(0, 43);
  if (!values.length) return null;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

export async function fetchMarketQuotes(): Promise<MarketQuote[]> {
  const fetchedAt = new Date().toISOString();
  try {
    const response = await fetch(CONAB_URL);
    if (!response.ok) throw new Error("market request failed");
    const text = await response.text();
    return [
      { product: "Banana", value: parseAverage(text, "BANANA NANICA (KG)"), unit: "kg", source: SOURCE, fetchedAt },
      { product: "Batata-doce", value: parseAverage(text, "BATATA DOCE (KG)"), unit: "kg", source: SOURCE, fetchedAt },
      { product: "Abobrinha verde", value: parseAverage(text, "ABOBRINHA (KG)"), unit: "kg", source: SOURCE, fetchedAt },
    ];
  } catch {
    return [
      { product: "Banana", value: null, unit: "kg", source: "Conab / Prohort — toque em atualizar quando houver rede", fetchedAt },
      { product: "Batata-doce", value: null, unit: "kg", source: "Conab / Prohort — toque em atualizar quando houver rede", fetchedAt },
      { product: "Abobrinha verde", value: null, unit: "kg", source: "Conab / Prohort — toque em atualizar quando houver rede", fetchedAt },
    ];
  }
}

export function weatherLabel(code: number | null) {
  if (code === null) return "Condição indisponível";
  if (code === 0) return "Céu limpo";
  if (code <= 3) return "Parcialmente nublado";
  if (code <= 48) return "Neblina";
  if (code <= 67) return "Chuva";
  if (code <= 77) return "Neve / granizo";
  if (code <= 82) return "Pancadas de chuva";
  return "Trovoada";
}
