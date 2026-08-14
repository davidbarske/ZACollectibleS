
(() => {
  const root = document.querySelector('[data-vault-app]');
  if(!root) return;

  const cards = [...document.querySelectorAll('[data-discipline]')];
  const buttons = [...document.querySelectorAll('[data-filter]')];
  buttons.forEach(btn => btn.addEventListener('click',()=>{
    buttons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    cards.forEach(c => c.classList.toggle('hidden', f !== 'all' && c.dataset.discipline !== f));
  }));

  document.querySelectorAll('[data-acquisition-title]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const title = btn.dataset.acquisitionTitle;
      const target = document.getElementById('acquisitionObject');
      if(target) target.value = title;
      const label = document.getElementById('acquisitionObjectLabel');
      if(label) label.textContent = title;
    });
  });
})();
