const weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude=-15.79&longitude=-47.88&current=temperature_2m,wind_speed_10m,rain&hourly=precipitation_probability&forecast_days=1&timezone=auto";
const marketUrl = "https://pentahoportaldeinformacoes.conab.gov.br/pentaho/api/repos/%3Ahome%3APROHORT%3AprecoDia.wcdf/generatedContent?userid=pentaho&password=password";

const weather = await fetch(weatherUrl);
console.log(`weather_status=${weather.status}`);
const weatherData = await weather.json();
console.log(`weather_current=${JSON.stringify(weatherData.current ?? null)}`);

const market = await fetch(marketUrl);
console.log(`market_status=${market.status}`);
const marketText = await market.text();
console.log(`market_bytes=${marketText.length}`);
console.log(`market_has_banana=${/BANANA/i.test(marketText)}`);
console.log(`market_has_sweet_potato=${/BATATA\s+DOCE/i.test(marketText)}`);
console.log(`market_has_zucchini=${/ABOBRINHA/i.test(marketText)}`);
