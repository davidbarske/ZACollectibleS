(() => {
  const root=document.documentElement;
  const body=document.body;
  const updateScrollState=()=>{
    body.classList.toggle('scrolled',window.scrollY>42);
    document.querySelectorAll('[data-cinematic]').forEach(hero=>{
      const rect=hero.getBoundingClientRect();
      const progress=Math.max(0,Math.min(1,-rect.top/(Math.max(1,hero.offsetHeight*.72))));
      hero.style.setProperty('--local-progress',progress.toFixed(3));
    });
  };
  let scrollTick=false;
  window.addEventListener('scroll',()=>{if(!scrollTick){scrollTick=true;requestAnimationFrame(()=>{updateScrollState();scrollTick=false;});}},{passive:true});
  updateScrollState();

  if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    root.classList.add('js-reveal');
    const revealTargets=[...document.querySelectorAll('main>section:not(:first-child),.transformation-case,.team-profile,.auction-results-grid article')];
    const pageSignature=body.classList.contains('presentation-root')?'reveal-wipe':body.classList.contains('knowledge-root')||body.classList.contains('coin-article-root')||body.classList.contains('presentation-article-root')||body.classList.contains('provenance-article-root')?'reveal-scale':body.classList.contains('auction-root')?'reveal-left':null;
    revealTargets.forEach((el,index)=>{
      el.classList.add('reveal-pending');
      el.classList.add(pageSignature||(index%2?'reveal-right':'reveal-left'));
    });
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.remove('reveal-pending');entry.target.classList.add('reveal-visible');observer.unobserve(entry.target);}
    }),{threshold:.08,rootMargin:'0px 0px -5% 0px'});
    revealTargets.forEach(el=>observer.observe(el));
  }

  const toggle = document.querySelector('.mobile-toggle');
  const mobile = document.querySelector('.mobile-nav');
  if(toggle && mobile){
    const setMenu = open => {
      mobile.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    };
    toggle.addEventListener('click',()=>setMenu(!mobile.classList.contains('open')));
    mobile.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
    document.addEventListener('keydown',e=>{if(e.key==='Escape') setMenu(false);});
    window.addEventListener('resize',()=>{if(window.innerWidth>900) setMenu(false);});
  }

  document.querySelectorAll('.faq-btn').forEach(btn=>btn.addEventListener('click',()=>btn.closest('.faq-item').classList.toggle('open')));

  const lightbox=document.querySelector('.lightbox');
  if(lightbox){
    const img=lightbox.querySelector('img');
    const toolbar=document.createElement('div'); toolbar.className='lightbox-toolbar';
    const download=document.createElement('a'); download.className='lightbox-download'; download.textContent='Download Image';
    const caption=document.createElement('div'); caption.className='lightbox-caption';
    toolbar.append(download); lightbox.append(toolbar,caption);
    document.querySelectorAll('[data-lightbox]').forEach(a=>a.addEventListener('click',e=>{
      e.preventDefault();
      const source=a.getAttribute('href')||a.dataset.lightbox;
      const sourceImg=a.querySelector('img');
      const alt=a.dataset.alt||(sourceImg&&sourceImg.alt)||'ZA Collectibles image';
      const ext=(source.split('.').pop()||'webp').split(/[?#]/)[0];
      const descriptiveName=`ZA-Collectibles-${alt.replace(/&/g,' and ').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'')}.${ext}`;
      const filename=a.dataset.downloadName||descriptiveName;
      img.src=source; img.alt=alt; caption.textContent=alt; download.href=source; download.download=filename;
      lightbox.classList.add('open');
    }));
    lightbox.addEventListener('click',e=>{if(e.target===lightbox||e.target.tagName==='BUTTON') lightbox.classList.remove('open');});
    document.addEventListener('keydown',e=>{if(e.key==='Escape') lightbox.classList.remove('open');});
  }

  const network=document.querySelector('#intelligence-network');
  if(network && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    const ctx=network.getContext('2d'); let nodes=[]; let raf;
    const resize=()=>{const dpr=Math.min(window.devicePixelRatio||1,2);network.width=network.clientWidth*dpr;network.height=network.clientHeight*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);nodes=Array.from({length:34},()=>({x:Math.random()*network.clientWidth,y:Math.random()*network.clientHeight,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,r:Math.random()*1.4+.7}));};
    const draw=()=>{const w=network.clientWidth,h=network.clientHeight;ctx.clearRect(0,0,w,h);nodes.forEach((n,i)=>{n.x+=n.vx;n.y+=n.vy;if(n.x<0||n.x>w)n.vx*=-1;if(n.y<0||n.y>h)n.vy*=-1;ctx.beginPath();ctx.fillStyle='rgba(112,225,210,.75)';ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.fill();for(let j=i+1;j<nodes.length;j++){const m=nodes[j],dx=n.x-m.x,dy=n.y-m.y,d=Math.hypot(dx,dy);if(d<160){ctx.beginPath();ctx.strokeStyle=`rgba(94,214,198,${.17*(1-d/160)})`;ctx.lineWidth=.7;ctx.moveTo(n.x,n.y);ctx.lineTo(m.x,m.y);ctx.stroke();}}});raf=requestAnimationFrame(draw);};
    resize();draw();window.addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAnimationFrame(raf);else draw();});
  }

  document.querySelectorAll('[data-filter-target]').forEach(bar=>{
    const target=document.querySelector(bar.dataset.filterTarget);
    if(!target) return;
    bar.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{
      bar.querySelectorAll('button').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
      const f=btn.dataset.filter;
      target.querySelectorAll('[data-category]').forEach(item=>item.style.display=(f==='all'||item.dataset.category===f)?'block':'none');
    }));
  });

  document.querySelectorAll('[data-copy]').forEach(btn=>btn.addEventListener('click',async()=>{
    const selector=btn.dataset.copy; const el=document.querySelector(selector); if(!el) return;
    const text=el.value||el.innerText; try{await navigator.clipboard.writeText(text); const old=btn.textContent; btn.textContent='Copied'; setTimeout(()=>btn.textContent=old,1500);}catch(e){}
  }));
})();
