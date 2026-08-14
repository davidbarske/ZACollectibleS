
(() => {
  const root = document.querySelector('[data-assess-app]');
  if(!root) return;

  const modeButtons = [...document.querySelectorAll('[data-mode]')];
  const modeInput = document.getElementById('captureMode');
  const category = document.getElementById('category');
  const coinFields = document.getElementById('coinFields');
  const gemFields = document.getElementById('gemFields');
  const quickFields = document.querySelectorAll('[data-min-mode="quick"]');
  const structuredFields = document.querySelectorAll('[data-min-mode="structured"]');
  const dropzone = document.getElementById('dropzone');
  const filesInput = document.getElementById('evidenceFiles');
  const fileList = document.getElementById('fileList');
  const payoff = document.getElementById('evidencePayoff');
  const checklist = document.getElementById('captureChecklist');
  const form = document.getElementById('assessmentForm');

  const rank = {snapshot:0, quick:1, structured:2};
  let mode = 'snapshot';
  let selectedFiles = [];

  function applyMode(next){
    mode = next;
    modeInput.value = next;
    modeButtons.forEach(b => b.classList.toggle('active', b.dataset.mode === next));
    document.querySelectorAll('[data-min-mode]').forEach(el => {
      el.classList.toggle('hidden', rank[mode] < rank[el.dataset.minMode]);
    });
    updateCategory();
  }

  function updateCategory(){
    const val = category.value;
    coinFields.classList.toggle('hidden', val !== 'coin' || rank[mode] < rank[coinFields.dataset.minMode]);
    gemFields.classList.toggle('hidden', val !== 'gemstone' || rank[mode] < rank[gemFields.dataset.minMode]);
    // Preserve per-field mode thresholds inside the visible category container.
    document.querySelectorAll('#coinFields [data-min-mode], #gemFields [data-min-mode]').forEach(el => {
      el.classList.toggle('hidden', rank[mode] < rank[el.dataset.minMode]);
    });
    updatePayoff();
    updateChecklist();
  }

  function updatePayoff(){
    const cat = category.value;
    const messages = {
      coin: mode === 'snapshot'
        ? 'A front and back image usually creates the first useful identification layer. An edge photo is often the highest-value next capture.'
        : mode === 'quick'
          ? 'Adding an edge image and one scale reference can materially narrow candidate identification and reveal alteration or damage concerns.'
          : 'Weight, diameter, thickness and edge evidence can materially tighten identification, condition and value confidence.',
      gemstone: mode === 'snapshot'
        ? 'A readable certificate plus one stone photograph creates the first useful evidence packet.'
        : mode === 'quick'
          ? 'A clear report number and side view can help separate certificate extraction from physical item consistency.'
          : 'Certificate file, report number, inscription and multiple stone views create the strongest basis for consistency checking.'
    };
    payoff.textContent = messages[cat] || 'Choose a discipline to see which additional evidence is most likely to improve the assessment.';
  }

  function updateChecklist(){
    const cat = category.value;
    const hasFile = selectedFiles.length > 0;
    const hasTwo = selectedFiles.length > 1;
    const purpose = !!document.getElementById('valuationPurpose')?.value;
    const notes = !!document.getElementById('ownerNotes')?.value.trim();

    let rows = [];
    if(cat === 'coin'){
      rows = [
        [hasFile,'At least one clear coin image'],
        [hasTwo,'A second view or reverse image'],
        [notes,'Owner note or known context'],
        [purpose,'Valuation context selected']
      ];
      if(mode === 'structured'){
        rows.splice(2,0,
          [!!document.getElementById('weight')?.value,'Weight recorded'],
          [!!document.getElementById('diameter')?.value,'Diameter recorded']
        );
      }
    } else if(cat === 'gemstone'){
      rows = [
        [hasFile,'Certificate or stone image'],
        [!!document.getElementById('reportNumber')?.value,'Report number recorded'],
        [purpose,'Valuation context selected'],
        [notes,'Owner note or use case']
      ];
      if(mode === 'structured'){
        rows.splice(2,0,[selectedFiles.length > 1,'Stone and document evidence both present']);
      }
    } else {
      rows = [[hasFile,'At least one evidence file'],[purpose,'Valuation context selected']];
    }
    checklist.innerHTML = rows.map(([done,label]) =>
      `<div class="capture-check ${done?'done':''}"><i aria-hidden="true"></i><span>${label}</span></div>`
    ).join('');
  }

  function renderFiles(){
    fileList.innerHTML = selectedFiles.length ? selectedFiles.map(f =>
      `<div class="file-row"><span>${escapeHtml(f.name)}</span><span>${formatBytes(f.size)}</span></div>`
    ).join('') : '';
    updateChecklist();
  }

  function escapeHtml(s=''){
    return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }
  function formatBytes(bytes){
    if(bytes < 1024) return `${bytes} B`;
    if(bytes < 1024*1024) return `${Math.round(bytes/1024)} KB`;
    return `${(bytes/(1024*1024)).toFixed(1)} MB`;
  }

  modeButtons.forEach(b => b.addEventListener('click', () => applyMode(b.dataset.mode)));
  category.addEventListener('change', updateCategory);
  form.addEventListener('input', updateChecklist);

  filesInput.addEventListener('change', () => {
    selectedFiles = [...filesInput.files];
    renderFiles();
  });
  ['dragenter','dragover'].forEach(ev => dropzone.addEventListener(ev, e => {
    e.preventDefault(); dropzone.classList.add('drag');
  }));
  ['dragleave','drop'].forEach(ev => dropzone.addEventListener(ev, e => {
    e.preventDefault(); dropzone.classList.remove('drag');
  }));
  dropzone.addEventListener('drop', e => {
    if(e.dataTransfer?.files?.length){
      selectedFiles = [...e.dataTransfer.files];
      renderFiles();
    }
  });

  function completenessScore(data){
    let score = 20;
    score += Math.min(selectedFiles.length,4)*10;
    if(data.category) score += 10;
    if(data.ownerNotes) score += 5;
    if(data.valuationPurpose) score += 10;
    if(mode === 'quick') score += 10;
    if(mode === 'structured') score += 18;
    if(data.category === 'coin'){
      if(data.weight) score += 6;
      if(data.diameter) score += 6;
      if(data.thickness) score += 4;
    } else if(data.category === 'gemstone'){
      if(data.reportNumber) score += 8;
      if(data.carat) score += 5;
      if(data.dimensions) score += 5;
    }
    return Math.max(20,Math.min(92,score));
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    if(!selectedFiles.length){
      window.ZA?.toast('Add at least one image or document to create a draft evidence packet.');
      filesInput.focus();
      return;
    }
    if(!category.value){
      window.ZA?.toast('Choose Numismatics or Gemmology.');
      category.focus();
      return;
    }
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    const score = completenessScore(data);
    const now = new Date();
    const id = `ZAC-${now.getFullYear()}-${String(Date.now()).slice(-6)}`;

    const record = {
      id,
      title: data.workingTitle || (data.category === 'coin' ? 'Unidentified loose coin' : 'Certificate-backed gemstone'),
      category: data.category,
      captureMode: mode,
      valuationPurpose: data.valuationPurpose || 'collector',
      ownerNotes: data.ownerNotes || '',
      createdAt: now.toISOString(),
      revision: 1,
      status: score < 55 ? 'Early-Stage Assessment' : 'Provisional Assessment',
      confidence: {
        identification: Math.max(25,Math.min(88,score-4)),
        authenticity: Math.max(18,Math.min(78,score-15)),
        condition: Math.max(20,Math.min(84,score-8)),
        value: Math.max(15,Math.min(75,score-18))
      },
      files: selectedFiles.map(f => ({name:f.name,size:f.size,type:f.type})),
      observed: [
        `${selectedFiles.length} evidence file${selectedFiles.length===1?'':'s'} supplied`,
        data.category === 'coin' ? 'Coin assessment lane selected' : 'Gemstone assessment lane selected',
        data.valuationPurpose ? `Valuation context: ${labelPurpose(data.valuationPurpose)}` : 'Valuation context not yet selected'
      ],
      inferred: data.category === 'coin'
        ? ['Candidate identification requires image analysis engine connection','Visible condition can be triaged after model processing']
        : ['Certificate fields require extraction engine connection','Photo-to-certificate consistency requires model processing'],
      missing: buildMissing(data),
      nextAction: nextAction(data),
      prototype: true
    };
    window.ZA.upsertRecord(record);
    sessionStorage.setItem('zaLastRecord', JSON.stringify(record));
    location.href = `report.html?id=${encodeURIComponent(id)}`;
  });

  function labelPurpose(v){
    const labels = {
      collector:'Collector market range', dealer:'Dealer purchase range', liquidation:'Liquidation range',
      insurance:'Insurance replacement support', auction:'Auction estimate', estate:'Estate or probate reference'
    };
    return labels[v] || v;
  }

  function buildMissing(data){
    const arr = [];
    if(data.category === 'coin'){
      if(selectedFiles.length < 2) arr.push('Reverse or second view not yet visible');
      if(!data.weight) arr.push('Weight not recorded');
      if(!data.diameter) arr.push('Diameter not recorded');
      if(mode !== 'structured') arr.push('Edge detail not explicitly captured');
    } else {
      if(!data.reportNumber) arr.push('Certificate report number not recorded');
      if(selectedFiles.length < 2) arr.push('Separate stone and certificate evidence may still be required');
      if(!data.carat) arr.push('Carat weight not recorded');
    }
    if(!data.valuationPurpose) arr.push('Valuation purpose not selected');
    return arr.length ? arr : ['No obvious capture gap in the prototype form; specialist analysis still required.'];
  }

  function nextAction(data){
    if(data.category === 'coin'){
      if(selectedFiles.length < 2) return 'Add a reverse image and a clear edge photograph in diffuse light.';
      if(!data.weight || !data.diameter) return 'Record weight and diameter. These measurements can materially narrow candidate identification.';
      return 'Run the coin identification and condition-risk modules, then review the candidate record.';
    }
    if(!data.reportNumber) return 'Add the certificate report number so document verification can be separated from stone-to-report consistency.';
    if(selectedFiles.length < 2) return 'Add a clear stone photograph alongside the certificate evidence.';
    return 'Run certificate extraction and photo-to-certificate consistency checking before valuation ranging.';
  }

  applyMode('snapshot');
  updateCategory();
  renderFiles();
})();
