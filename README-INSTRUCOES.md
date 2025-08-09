# Verbo Zin – Upgrade rápido (2025-08-09)

Este pacote adiciona 3 widgets (Clima, Cotações BRL, Notícias) ao site estático (GitHub Pages) **sem expor chaves**, via proxy serverless (Cloudflare Workers).

## Como aplicar

1. Copie a pasta `assets/js` inteira para o repositório na raiz.
2. No `index.html`, antes de fechar `</body>`, adicione:

```html
<link rel="preload" href="assets/js/fetcher.js" as="script">
<script src="assets/js/fetcher.js" defer></script>
<script src="assets/js/weather.js" defer></script>
<script src="assets/js/currency.js" defer></script>
<script src="assets/js/news.js" defer></script>
<script>
  window.addEventListener('DOMContentLoaded', () => {
    const BASE_API = ''; // deixe vazio se mapeou domínio do Worker para o mesmo host; se usar subdomínio, ex.: 'https://api.seu-worker.workers.dev'
    window.AppWeather.init({ city: 'Fortaleza, BR', lang: 'pt', baseApi: BASE_API });
    window.AppCurrency.init(['USD','EUR'], BASE_API);
    window.AppNews.init('geral', BASE_API);
  });
</script>
```

3. Insira blocos onde quiser mostrar os widgets (ex.: logo abaixo do conteúdo principal):

```html
<section id="status" aria-live="polite">
  <div id="weather" class="card" role="region" aria-label="Clima atual">
    <h2>Clima</h2>
    <p id="weather-text">Carregando…</p>
  </div>
  <div id="fx" class="card" role="region" aria-label="Cotações">
    <h2>Cotações</h2>
    <ul id="fx-list" aria-busy="true"></ul>
  </div>
  <div id="news" class="card" role="region" aria-label="Notícias">
    <h2>Notícias</h2>
    <ul id="news-list" aria-busy="true"></ul>
  </div>
</section>
```

4. **Deploy do Proxy (Cloudflare Workers):**
   - Crie um Worker e cole o conteúdo de `cloudflare-worker/worker.js`.
   - Em *Settings → Variables and Secrets*, adicione as secrets:
     - `WEATHER_API_KEY` (WeatherAPI)
     - `EXCHANGE_API_KEY` (ExchangeRate-API)
     - `GNEWS_API_KEY` (GNews)
   - Em *Triggers → Routes*, crie uma rota do tipo `https://SEU-DOMINIO/*` (se usar Pages custom domain) **OU** use o subdomínio `https://SEU-NOME.workers.dev`.
   - Se o Worker estiver em subdomínio diferente, defina `BASE_API` no script de inicialização (acima) com a URL do Worker.

5. Segurança e A11y
   - Os scripts usam `aria-live`, `aria-busy` e abrem links com `rel="noopener noreferrer"`.
   - As requisições têm timeout, retry exponencial e SWR (cache em memória).

---

Qualquer dúvida, me chame que eu ajusto para Netlify/Vercel se preferir.
