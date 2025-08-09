// assets/js/weather.js
(() => {
  let BASE_API = '';

  function setBaseApi(url){ BASE_API = url || ''; }

  async function getWeather(city, lang='pt') {
    const params = new URLSearchParams({ q: city, lang });
    return await Fetcher.fetchJSON(`/api/weather?${params.toString()}`, { cacheTtlMs: 5*60*1000, baseApi: BASE_API });
  }

  function render(el, data){
    const t = Math.round(data?.current?.temp_c ?? NaN);
    const f = Math.round(data?.current?.feelslike_c ?? NaN);
    const w = Math.round(data?.current?.wind_kph ?? NaN);
    const h = Math.round(data?.current?.humidity ?? NaN);
    const cond = data?.current?.condition?.text || 'Tempo';
    el.textContent = `${cond}: ${t}°C (sensação ${f}°C), vento ${w} km/h, umidade ${h}%`;
    el.parentElement?.setAttribute('aria-busy','false');
  }

  function init({ city, lang, baseApi }) {
    if (baseApi) setBaseApi(baseApi);
    const el = document.getElementById('weather-text');
    if (!el) return;
    el.parentElement?.setAttribute('aria-busy','true');
    getWeather(city, lang).then(d => render(el, d)).catch(() => {
      el.textContent = 'Não foi possível carregar o clima agora.';
      el.parentElement?.setAttribute('aria-busy','false');
    });
  }

  window.AppWeather = { init, setBaseApi };
})();