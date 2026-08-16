(() => {
  const previews = document.querySelectorAll('[data-file-preview]');
  previews.forEach(preview => {
    const input = document.querySelector(preview.dataset.filePreview);
    if(!input) return;
    input.addEventListener('change',()=>{
      preview.innerHTML='';
      [...input.files].slice(0,8).forEach(file=>{
        if(!file.type.startsWith('image/')) return;
        const img=document.createElement('img'); img.alt=file.name; img.src=URL.createObjectURL(file); preview.appendChild(img);
      });
    });
  });

  document.querySelectorAll('form[data-local-form]').forEach(form=>{
    form.addEventListener('submit', e=>{
      e.preventDefault();
      const data=new FormData(form); const obj={};
      for(const [k,v] of data.entries()){
        if(v instanceof File){ if(v.name) (obj[k]??=[]).push(v.name); }
        else if(obj[k]) obj[k]=Array.isArray(obj[k])?[...obj[k],v]:[obj[k],v]; else obj[k]=v;
      }
      obj.submittedAt=new Date().toISOString(); obj.form=form.dataset.localForm;
      const key='zaCollectiblesSubmissions'; const existing=JSON.parse(localStorage.getItem(key)||'[]'); existing.push(obj); localStorage.setItem(key,JSON.stringify(existing));
      const status=form.querySelector('.form-status');
      if(status) status.textContent='Your enquiry has been prepared and saved in this browser. Use “Download summary” to keep a copy.';
      const dl=form.querySelector('[data-download-summary]');
      if(dl){ dl.hidden=false; dl.onclick=()=>{
        const lines=[]; Object.entries(obj).forEach(([k,v])=>lines.push(`${k}: ${Array.isArray(v)?v.join(', '):v}`));
        const blob=new Blob([lines.join('\n')],{type:'text/plain'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`ZA-Collectibles-${form.dataset.localForm}-enquiry.txt`; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
      }; }
    });
  });
})();
