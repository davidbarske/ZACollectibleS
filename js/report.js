
(() => {
  const root = document.querySelector('[data-report-app]');
  if(!root) return;

  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const records = window.ZA?.getRegistry?.() || [];
  let record = records.find(r => r.id === id);

  if(!record){
    try { record = JSON.parse(sessionStorage.getItem('zaLastRecord') || 'null'); } catch {}
  }
  if(!record){
    record = {
      id:'ZAC-DEMO-001',
      title:'Demonstration assessment record',
      category:'coin',
      captureMode:'snapshot',
      valuationPurpose:'collector',
      createdAt:new Date().toISOString(),
      revision:1,
      status:'Early-Stage Assessment',
      confidence:{identification:48,authenticity:31,condition:42,value:28},
      observed:['One broad object image supplied','Coin assessment lane selected','Collector market context selected'],
      inferred:['Probable numismatic object; definitive identification not connected in this prototype'],
      missing:['Reverse image not yet visible','Edge detail not yet visible','Weight and diameter not recorded'],
      nextAction:'Add clear front, reverse and edge photographs before deeper assessment.',
      prototype:true
    };
  }

  const $ = id => document.getElementById(id);
  const purposeLabels = {
    collector:'Collector market range', dealer:'Dealer purchase range', liquidation:'Liquidation range',
    insurance:'Insurance replacement support', auction:'Auction estimate', estate:'Estate or probate reference'
  };

  $('reportId').textContent = record.id;
  $('reportTitle').textContent = record.title;
  $('reportStatus').textContent = record.status;
  $('reportRevision').textContent = `Revision ${record.revision || 1}`;
  $('reportDate').textContent = new Intl.DateTimeFormat('en-ZA',{dateStyle:'long'}).format(new Date(record.createdAt));
  $('reportPurpose').textContent = purposeLabels[record.valuationPurpose] || record.valuationPurpose || 'Not selected';
  $('reportRange').textContent = record.prototype ? 'Range engine not connected' : (record.valueRange || 'Provisional band pending');
  $('reportConclusion').textContent = record.prototype
    ? 'This page demonstrates the report architecture. It does not identify, authenticate, grade or value the submitted object.'
    : (record.conclusion || 'Provisional assessment available.');

  renderConfidence(record.confidence || {});
  renderList('observedList', record.observed || []);
  renderList('inferredList', record.inferred || []);
  renderList('missingList', record.missing || []);
  $('nextActionText').textContent = record.nextAction || 'Add the evidence most likely to reduce current uncertainty.';

  const cat = record.category === 'gemstone' ? 'Gemmology' : 'Numismatics';
  $('reportCategory').textContent = cat;
  $('reportMode').textContent = titleCase(record.captureMode || 'snapshot') + ' Capture';

  function renderConfidence(c){
    const map = [
      ['identification','Identification'],
      ['authenticity','Authenticity'],
      ['condition','Condition'],
      ['value','Value']
    ];
    $('reportConfidence').innerHTML = map.map(([key,label]) => {
      const v = Number(c[key] || 0);
      return `<div class="conf-report">
        <strong>${v}%</strong><small>${label}</small>
        <div class="meter" style="margin-top:11px;background:#ddd7cb"><i style="width:${v}%"></i></div>
      </div>`;
    }).join('');
  }
  function renderList(target, items){
    $(target).innerHTML = items.map(x=>`<li>${escapeHtml(String(x))}</li>`).join('');
  }
  function escapeHtml(s=''){
    return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
  function titleCase(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

  document.querySelector('[data-print-report]')?.addEventListener('click',()=>window.print());
})();
