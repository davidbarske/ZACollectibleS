
(() => {
  const path = location.pathname.split('/').pop() || 'index.html';
  const nav = [
    ['assess.html','Assess'],
    ['vault.html','The Vault'],
    ['disciplines.html','Disciplines'],
    ['method.html','Method'],
    ['registry.html','Registry']
  ];

  const current = (href) => path === href ? ' aria-current="page"' : '';
  const header = `
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header" id="siteHeader">
      <div class="header-inner">
        <a class="brand" href="index.html" aria-label="ZA Collectibles home">
          <img src="assets/brand/emblem.png" alt="">
          <span class="brand-text"><strong>ZA Collectibles</strong><span>Curated Treasures</span></span>
        </a>
        <nav class="nav" aria-label="Primary">
          ${nav.map(([h,l])=>`<a href="${h}"${current(h)}>${l}</a>`).join('')}
          <a class="header-cta" href="specialist.html"${current('specialist.html')}>Specialist Review</a>
        </nav>
        <button class="menu-button" id="menuButton" aria-controls="mobilePanel" aria-expanded="false">Menu</button>
      </div>
    </header>
    <nav class="mobile-panel" id="mobilePanel" aria-label="Mobile">
      ${nav.map(([h,l])=>`<a href="${h}"${current(h)}>${l}</a>`).join('')}
      <a href="specialist.html"${current('specialist.html')}>Specialist Review</a>
    </nav>`;
  const footer = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <img src="assets/brand/za-collectibles-logo.png" alt="ZA Collectibles — Curated Treasures">
            <p>Structured collectible intelligence for uncertain objects, selective acquisition and progressively stronger evidence.</p>
          </div>
          <div>
            <p class="eyebrow">Explore</p>
            <nav class="footer-nav">
              <a href="assess.html">Assess What I Have</a>
              <a href="vault.html">The Vault</a>
              <a href="disciplines.html">Disciplines</a>
              <a href="registry.html">Registry</a>
            </nav>
          </div>
          <div>
            <p class="eyebrow">Method</p>
            <nav class="footer-nav">
              <a href="method.html">How assessment works</a>
              <a href="specialist.html">Specialist Review</a>
              <a href="docs/ZA_Collectibles_Website_Design_and_Architecture_v1.pdf">Design specification</a>
              <a href="admin.html">Prototype admin</a>
            </nav>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© <span data-year></span> ZA Collectibles. Draft prototype.</span>
          <span>Loose-coin authenticity cannot be guaranteed from ordinary consumer photographs alone. A gemstone grading certificate is not a valuation.</span>
        </div>
      </div>
    </footer>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>`;

  document.querySelectorAll('[data-site-header]').forEach(el => el.innerHTML = header);
  document.querySelectorAll('[data-site-footer]').forEach(el => el.innerHTML = footer);
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  const siteHeader = document.getElementById('siteHeader');
  const menuButton = document.getElementById('menuButton');
  const mobilePanel = document.getElementById('mobilePanel');
  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      const open = mobilePanel.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });
  }
  const onScroll = () => siteHeader?.classList.toggle('scrolled', window.scrollY > 20);
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});

  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); }});
  }, {threshold:.12}) : null;
  document.querySelectorAll('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('visible'));

  document.querySelectorAll('[data-open-dialog]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-open-dialog');
      document.getElementById(id)?.showModal();
    });
  });
  document.querySelectorAll('[data-close-dialog]').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('dialog')?.close());
  });
  document.querySelectorAll('dialog').forEach(d => {
    d.addEventListener('click', e => {
      const r = d.getBoundingClientRect();
      if(e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
    });
  });

  window.ZA = window.ZA || {};
  window.ZA.toast = (message, ms=3400) => {
    const t = document.getElementById('toast');
    if(!t) return;
    t.textContent = message;
    t.classList.add('show');
    clearTimeout(window.__zaToast);
    window.__zaToast = setTimeout(()=>t.classList.remove('show'), ms);
  };
  window.ZA.getRegistry = () => {
    try { return JSON.parse(localStorage.getItem('zaRegistry') || '[]'); }
    catch { return []; }
  };
  window.ZA.saveRegistry = items => localStorage.setItem('zaRegistry', JSON.stringify(items));
  window.ZA.upsertRecord = record => {
    const items = window.ZA.getRegistry();
    const i = items.findIndex(x => x.id === record.id);
    if(i >= 0) items[i] = record; else items.unshift(record);
    window.ZA.saveRegistry(items.slice(0,50));
  };

  document.querySelectorAll('[data-prototype-form]').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      window.ZA.toast('Prototype only — this form is not connected to a live backend.');
      form.closest('dialog')?.close();
    });
  });
})();
