
(() => {
  const root = document.querySelector('[data-registry-app]');
  if(!root) return;
  const list = document.getElementById('registryList');
  const empty = document.getElementById('registryEmpty');
  const records = window.ZA?.getRegistry?.() || [];

  if(!records.length){
    empty.classList.remove('hidden');
    list.innerHTML = sampleCard();
  } else {
    empty.classList.add('hidden');
    list.innerHTML = records.map(card).join('');
  }

  function card(r){
    const img = r.category === 'gemstone' ? 'assets/images/gemmology-detail.webp' : 'assets/images/numismatics-detail.webp';
    const date = new Intl.DateTimeFormat('en-ZA',{dateStyle:'medium'}).format(new Date(r.createdAt));
    return `<article class="registry-card">
      <div class="registry-thumb"><img src="${img}" alt=""></div>
      <div>
        <h3>${escapeHtml(r.title || 'Untitled record')}</h3>
        <div class="registry-meta">${escapeHtml(r.id)} · ${r.category==='gemstone'?'Gemmology':'Numismatics'} · ${date} · Revision ${r.revision||1}</div>
        <div style="margin-top:8px"><span class="chip gold">${escapeHtml(r.status || 'Provisional')}</span></div>
      </div>
      <div class="registry-actions">
        <a class="btn btn-dark" href="report.html?id=${encodeURIComponent(r.id)}">View report</a>
      </div>
    </article>`;
  }
  function sampleCard(){
    return `<article class="registry-card" aria-label="Example registry record">
      <div class="registry-thumb"><img src="assets/images/numismatics-detail.webp" alt=""></div>
      <div>
        <h3>Example registry record</h3>
        <div class="registry-meta">Create an assessment to populate your browser-based prototype Registry.</div>
        <div style="margin-top:8px"><span class="chip muted">Demonstration</span></div>
      </div>
      <div class="registry-actions"><a class="btn btn-quiet" href="assess.html">Create record</a></div>
    </article>`;
  }
  function escapeHtml(s=''){
    return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

  document.getElementById('clearRegistry')?.addEventListener('click',()=>{
    localStorage.removeItem('zaRegistry');
    location.reload();
  });
})();
