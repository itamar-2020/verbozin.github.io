// cloudflare-worker/worker.js
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const headers = {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,OPTIONS',
      'access-control-allow-headers': 'Content-Type'
    };
    if (req.method === 'OPTIONS') return new Response('', { headers });

    if (url.pathname === '/api/weather') {
      const q = url.searchParams.get('q');
      const lang = url.searchParams.get('lang') || 'pt';
      if (!q) return new Response(JSON.stringify({ error: 'Missing q' }), { status: 400, headers: { ...headers, 'content-type':'application/json' } });
      const r = await fetch(`https://api.weatherapi.com/v1/current.json?key=${env.WEATHER_API_KEY}&q=${encodeURIComponent(q)}&lang=${lang}`);
      return new Response(await r.text(), { status: r.status, headers: { ...headers, 'content-type':'application/json' }});
    }

    if (url.pathname === '/api/currency') {
      const base = (url.searchParams.get('base') || 'USD,EUR').split(',');
      const out = { base: base.join(','), rates: {}, timestamp: Math.floor(Date.now()/1000) };
      for (const code of base) {
        const r = await fetch(`https://v6.exchangerate-api.com/v6/${env.EXCHANGE_API_KEY}/latest/${code}`);
        const j = await r.json();
        const brl = j?.conversion_rates?.BRL;
        if (typeof brl === 'number') out.rates[code] = brl;
      }
      return new Response(JSON.stringify(out), { headers: { ...headers, 'content-type':'application/json' }});
    }

    if (url.pathname === '/api/news') {
      const topic = url.searchParams.get('topic') || 'geral';
      const limit = Number(url.searchParams.get('limit') || 12);
      const r = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(topic)}&lang=pt&country=br&max=${limit}&apikey=${env.GNEWS_API_KEY}`);
      const j = await r.json();
      const items = (j?.articles || []).map(a => ({
        title: a?.title, url: a?.url, source: a?.source?.name, publishedAt: a?.publishedAt
      }));
      return new Response(JSON.stringify(items), { headers: { ...headers, 'content-type':'application/json' }});
    }

    return new Response('Not found', { status: 404, headers });
  }
};