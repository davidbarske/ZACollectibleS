(() => {
  const form = document.getElementById('evidenceForm');
  if (!form) return;
  const rank = { snapshot: 0, quick: 1, structured: 2 };
  let mode = 'snapshot';
  let files = [];
  const modeInput = document.getElementById('captureMode');
  const category = document.getElementById('itemCategory');
  const purpose = document.getElementById('purpose');
  const context = document.getElementById('ownerContext');
  const measurements = document.getElementById('measurements');
  const marks = document.getElementById('marks');
  const fileInput = document.getElementById('evidenceFiles');
  const list = document.getElementById('evidenceFilesList');
  const state = document.getElementById('captureState');
  const payoff = document.getElementById('evidencePayoff');

  const escapeHtml = (value = '') => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function setMode(next) {
    mode = next;
    modeInput.value = next;
    document.querySelectorAll('[data-mode]').forEach(button => {
      const active = button.dataset.mode === next;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    document.querySelectorAll('[data-min-mode]').forEach(field => field.classList.toggle('hidden', rank[next] < rank[field.dataset.minMode]));
    updateState();
  }

  function updateFiles() {
    list.innerHTML = files.map(file => `<span><b>${escapeHtml(file.name)}</b><small>${Math.max(1, Math.round(file.size / 1024))} KB</small></span>`).join('');
    updateState();
  }

  function updateState() {
    const checks = [
      [Boolean(category.value), 'Collectible type selected'],
      [files.length > 0, 'At least one photograph or document'],
      [files.length > 1, 'More than one view or evidence source'],
      [Boolean(purpose.value), 'Decision context selected']
    ];
    if (rank[mode] >= 1) checks.push([Boolean(context?.value.trim()), 'Owner context recorded']);
    if (rank[mode] >= 2) checks.push([Boolean(measurements?.value.trim() || marks?.value.trim()), 'Measurement or identifying mark recorded']);
    state.innerHTML = checks.map(([done, label]) => `<div class="state-row ${done ? 'done' : ''}"><i></i><span>${label}</span></div>`).join('');

    if (!category.value) payoff.textContent = 'Choose a collectible type and add one photograph. The system will identify the next useful capture.';
    else if (!files.length) payoff.textContent = 'Add one clear broad photograph in diffuse light. Do not crop out the object’s edges.';
    else if (files.length === 1) payoff.textContent = category.value.includes('Coins') ? 'Add the reverse and a sharp edge photograph. The edge often carries the highest information gain.' : 'Add one close detail of marks, surface, construction or certificate information.';
    else if (!purpose.value) payoff.textContent = 'Choose the decision this assessment must support. Value ranges change with purpose.';
    else payoff.textContent = 'The evidence packet is ready for provisional review. Physical inspection or specialist escalation may still be required.';
  }

  document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode)));
  fileInput.addEventListener('change', () => { files = [...fileInput.files]; updateFiles(); });
  form.addEventListener('input', updateState);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const output = document.getElementById('assessmentOutput');
    const panel = document.getElementById('summaryPanel');
    const title = document.getElementById('workingTitle').value.trim() || 'Untitled collectible enquiry';
    const observed = [category.value || 'Collectible type unresolved', `${files.length} evidence file${files.length === 1 ? '' : 's'} selected`, purpose.value || 'Decision context not yet selected'];
    const missing = [];
    if (!files.length) missing.push('No photograph or document selected');
    if (files.length < 2) missing.push('Second view or close detail not yet supplied');
    if (!context?.value.trim()) missing.push('Owner context not yet recorded');
    if (!measurements?.value.trim() && !marks?.value.trim()) missing.push('Measurements or identifying marks not yet recorded');
    panel.innerHTML = `<div class="summary-head"><div><span>${escapeHtml(mode.toUpperCase())} CAPTURE</span><h3>${escapeHtml(title)}</h3></div><b>Early-stage record</b></div><div class="summary-columns"><div><h4>Observed</h4><ul>${observed.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul></div><div><h4>Still unresolved</h4><ul>${(missing.length ? missing : ['No obvious capture gap. Specialist analysis remains necessary.']).map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul></div><div><h4>Next action</h4><p>${escapeHtml(payoff.textContent)}</p></div></div>`;
    output.hidden = false;
    output.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.getElementById('copySummary').addEventListener('click', async event => {
    try { await navigator.clipboard.writeText(document.getElementById('summaryPanel').innerText); event.currentTarget.textContent = 'Copied'; setTimeout(() => event.currentTarget.textContent = 'Copy summary', 1400); } catch (_) {}
  });
  setMode('snapshot');
})();
