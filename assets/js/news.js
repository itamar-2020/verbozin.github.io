// assets/js/news.js
(() => {
  let BASE_API = '';
  const sanitize = s => (s || '').replace(/<\/?[^>]+>/g,'').trim();
  function setBaseApi(url){ BASE_API = url || ''; }

  async function getNews(topic='geral', limit=12) {
    const p = new URLSearchParams({ topic, limit });
    return await Fetcher.fetchJSON(`/api/news?${p.toString()}`, { cacheTtlMs: 3*60*1000, baseApi: BASE_API });
  }

  function dedup(items){
    const seen = new Set(), out=[];
    for (const it of items || []) {
      const key = (it.url || it.title || '').toLowerCase();
      if (seen.has(key)) continue; seen.add(key);
      out.push({ ...it, title: sanitize(it.title), source: sanitize(it.source) });
    }
    return out;
  }

  function render(list, items){
    list.innerHTML = '';
    dedup(items).forEach(it => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = it.url?.startsWith('http') ? it.url : '#';
      a.rel = 'noopener noreferrer';
      a.target = '_blank';
      a.textContent = it.title || it.source || 'Notícia';
      li.appendChild(a);
      list.appendChild(li);
    });
    list.setAttribute('aria-busy','false');
  }

  function init(topic, baseApi){
    if (baseApi) setBaseApi(baseApi);
    const list = document.getElementById('news-list');
    if (!list) return;
    list.setAttribute('aria-busy','true');
    getNews(topic).then(d => render(list, d)).catch(() => {
      list.innerHTML = '<li>Não foi possível carregar agora.</li>';
      list.setAttribute('aria-busy','false');
    });
  }

  window.AppNews = { init, setBaseApi };
})();