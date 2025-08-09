// assets/js/fetcher.js
(() => {
  const memoryCache = new Map();

  async function fetchJSON(url, {
    method='GET',
    headers={},
    body,
    timeoutMs=8000,
    retries=2,
    retryBaseMs=400,
    cacheTtlMs=60000,
    revalidateIfStale=true,
    baseApi=''
  } = {}) {
    const fullUrl = url.startsWith('/api/') && baseApi ? baseApi.replace(/\/$/,'') + url : url;
    const key = `${method}:${fullUrl}:${body?JSON.stringify(body):''}`;
    const cached = memoryCache.get(key);
    const fresh = cached && (Date.now() - cached.ts) < cacheTtlMs;

    if (cached && !fresh && revalidateIfStale) {
      revalidate().catch(()=>{});
      return cached.data;
    }
    if (cached && fresh) return cached.data;
    return revalidate();

    async function revalidate() {
      let attempt = 0, lastErr;
      while (attempt <= retries) {
        try {
          const ctrl = new AbortController();
          const id = setTimeout(()=>ctrl.abort(), timeoutMs);
          const res = await fetch(fullUrl, {
            method,
            headers: { ...(body?{'content-type':'application/json'}:{}), ...headers },
            body: body ? JSON.stringify(body) : undefined,
            signal: ctrl.signal
          });
          clearTimeout(id);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          memoryCache.set(key, { ts: Date.now(), data });
          return data;
        } catch (e) {
          lastErr = e;
          if (attempt === retries) break;
          await new Promise(r => setTimeout(r, retryBaseMs * (2 ** attempt)));
          attempt++;
        }
      }
      throw lastErr;
    }
  }

  window.Fetcher = { fetchJSON };
})();