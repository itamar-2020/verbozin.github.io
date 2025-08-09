// assets/js/currency.js
(() => {
  let BASE_API = '';
  function setBaseApi(url){ BASE_API = url || ''; }

  async function getQuotes(bases=['USD','EUR']) {
    const q = encodeURIComponent(bases.join(','));
    return await Fetcher.fetchJSON(`/api/currency?base=${q}`, { cacheTtlMs: 10*60*1000, baseApi: BASE_API });
  }

  function normalizeToBRL(rates) {
    const out = [];
    for (const [code, rate] of Object.entries(rates || {})) {
      const brlPerUnit = rate >= 0.01 ? rate : (rate ? 1/rate : NaN);
      out.push({ code, brlPerUnit });
    }
    return out;
  }

  function render(list, arr){
    list.innerHTML = '';
    arr.forEach(({code, brlPerUnit}) => {
      const li = document.createElement('li');
      li.textContent = `${code}/BRL: ${brlPerUnit.toFixed(2)}`;
      list.appendChild(li);
    });
    list.setAttribute('aria-busy','false');
  }

  function init(bases, baseApi){
    if (baseApi) setBaseApi(baseApi);
    const list = document.getElementById('fx-list');
    if (!list) return;
    list.setAttribute('aria-busy','true');
    getQuotes(bases).then(d => render(list, normalizeToBRL(d?.rates)))
      .catch(() => { list.innerHTML = '<li>Falha ao carregar.</li>'; list.setAttribute('aria-busy','false'); });
  }

  window.AppCurrency = { init, setBaseApi };
})();