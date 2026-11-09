/* Font variants are deliberately family-specific. Google CSS responses were
   checked on 2026-11-09; upstream source may list styles not yet served by the
   public API (for example Lato). All font markup stays in this document.
   https://developers.google.com/fonts/docs/css2 */
(() => {
  'use strict';
  const range = (first, last) => Array.from({length:(last-first)/100+1},(_,i)=>first+i*100);
  const catalog = new Map();
  const register = (family, normal, italic = normal) => catalog.set(family, {normal:[...normal],italic:[...italic]});
  // The bundled static Shopee font declares OS/2.usWeightClass = 900.
  register('ShopeeFont',[900],[]);
  register('Roboto',range(100,900));
  register('Open Sans',range(300,800));
  register('Lato',[100,300,400,700,900]);
  register('Montserrat',range(100,900));
  register('Poppins',range(100,900));
  register('Inter',range(100,900));
  register('Nunito Sans',range(200,900));
  register('Oswald',range(200,700),[]);
  register('Raleway',range(100,900));
  register('DM Sans',range(100,900));
  register('Manrope',range(200,800),[]);
  register('Noto Sans',range(100,900));
  register('Merriweather',range(300,900));
  register('Playfair Display',range(400,900));
  const families = Object.freeze([...catalog.keys()]);
  const labels = {100:'Thin',200:'Extra Light',300:'Light',400:'Regular',500:'Medium',600:'Semi Bold',700:'Bold',800:'Extra Bold',900:'Black',1000:'Extra Black'};
  const loaded = new Map(), discoveries = new Map();
  const cleanFamily = name => String(name || 'ShopeeFont').trim();
  const validFamily = name => /^[A-Za-z][A-Za-z0-9 ]{1,48}$/.test(name);
  const weights = (family, italic = false) => [...(catalog.get(cleanFamily(family))?.[italic?'italic':'normal'] || [])];
  const supportsItalic = family => weights(family,true).length>0;
  function nearest(family, requested = 400, italic = false) {
    const number = Math.max(100,Math.min(1000,Number(requested)||400));
    const available = weights(family,italic);
    if (!available.length) return number;
    return available.reduce((best,value)=>Math.abs(value-number)<Math.abs(best-number)?value:best,available[0]);
  }
  const style = layer => layer?.italic && supportsItalic(layer.font)?'italic':'normal';
  const weight = layer => nearest(layer?.font,layer?.fontWeight ?? (layer?.bold?700:400),style(layer)==='italic');
  const label = value => labels[Number(value)] || String(value);
  function apiUrl(family, variant) {
    return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g,'+')}:${variant}&display=swap`;
  }
  function parseWeights(css, italic) {
    const found = new Set();
    for (const match of css.matchAll(/@font-face\s*\{([^}]+)\}/g)) {
      const face=match[1];
      if ((/font-style:\s*italic/.test(face))!==italic) continue;
      const declared=face.match(/font-weight:\s*(\d+)(?:\s+(\d+))?\s*;/);
      if (!declared) continue;
      const low=Number(declared[1]),high=Number(declared[2]||declared[1]);
      found.add(low); found.add(high);
      for(let value=Math.ceil(low/100)*100;value<=high;value+=100)found.add(value);
    }
    return [...found].sort((a,b)=>a-b);
  }
  async function discover(name) {
    const family=cleanFamily(name);
    if(catalog.has(family))return catalog.get(family);
    if(!validFamily(family))throw new Error('Enter a valid Google Fonts family name.');
    if(discoveries.has(family))return discoveries.get(family);
    const task=(async()=>{
      // A combined request returns only styles the family really has. Unlike
      // probing italic alone, it succeeds for regular-only families as well.
      const tuples=[0,1].flatMap(italic=>range(100,1000).map(value=>`${italic},${value}`)).join(';');
      const url=apiUrl(family,`ital,wght@${tuples}`)+'&text=BrandMax';
      const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);
      let css='';
      try {
        const response=await fetch(url,{signal:controller.signal});
        if(response.ok)css=await response.text();
      } finally {clearTimeout(timer);}
      const variants=[parseWeights(css,false),parseWeights(css,true)];
      if(!variants[0].length)throw new Error(`“${family}” could not be found in Google Fonts.`);
      register(family,variants[0],variants[1]);
      document.dispatchEvent(new CustomEvent('brandmax:font-catalog',{detail:{family}}));
      return catalog.get(family);
    })();
    discoveries.set(family,task);
    try{return await task;}catch(error){discoveries.delete(family);throw error;}
  }
  async function load(name, requested = 400, italic = false) {
    const family=cleanFamily(name);
    if(!validFamily(family))throw new Error('Enter a valid Google Fonts family name.');
    if(!catalog.has(family))await discover(family);
    const actualItalic=Boolean(italic)&&supportsItalic(family);
    const actualWeight=nearest(family,requested,actualItalic);
    const key=`${family}|${actualWeight}|${actualItalic?'italic':'normal'}`;
    if(loaded.has(key))return loaded.get(key);
    const task=(async()=>{
      if(family!=='ShopeeFont'){
        await new Promise((resolve,reject)=>{
          const link=document.createElement('link');
          link.rel='stylesheet'; link.dataset.brandmaxFont=key;
          link.href=apiUrl(family,actualItalic?`ital,wght@1,${actualWeight}`:`wght@${actualWeight}`);
          const timer=setTimeout(()=>{link.remove();reject(new Error(`Font loading timed out: ${family}`));},15000);
          link.onload=()=>{clearTimeout(timer);resolve();};
          link.onerror=()=>{clearTimeout(timer);link.remove();reject(new Error(`Unable to load ${family}. Check your connection.`));};
          document.head.append(link);
        });
      }
      const result=await document.fonts.load(`${actualItalic?'italic ':''}${actualWeight} 16px "${family}"`);
      if(!result.length)throw new Error(`The requested ${family} style did not load.`);
      document.dispatchEvent(new CustomEvent('brandmax:font-loaded',{detail:{family,weight:actualWeight,italic:actualItalic}}));
      return {family,weight:actualWeight,italic:actualItalic};
    })();
    loaded.set(key,task);
    // Successful loads stay cached; a later user retry after a network failure
    // must not be trapped by an already-rejected promise.
    try{return await task;}catch(error){if(loaded.get(key)===task)loaded.delete(key);throw error;}
  }
  window.BrandMaxFonts=Object.freeze({families,weights,supportsItalic,nearest,weight,style,label,load,discover,isKnown:family=>catalog.has(cleanFamily(family))});
})();
