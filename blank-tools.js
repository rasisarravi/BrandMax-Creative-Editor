/* Blank-canvas drawing tools. Layers sit below the mandatory Shopee artwork
   and are composited into the same canvas used by preview and PNG export. */
(() => {
  'use strict';
  const sizes = {
    'banner-card': [531, 792],
    'pop-up-banner': [580, 720],
    'skinny-banner': [1200, 360],
    'floating-icon': [360, 360],
  };
  const names = {
    'banner-card': 'Banner Card',
    'pop-up-banner': 'Pop-up Banner',
    'skinny-banner': 'Skinny Banner',
    'floating-icon': 'Floating Icon',
  };
  const layerMap = new Map();
  const toolbar = document.querySelector('#blankDesignTools');
  const targetSelect = document.querySelector('#blankToolTarget');
  const properties = document.querySelector('#blankToolProperties');
  const imageInput = document.querySelector('#blankToolImage');
  let tool = 'select';
  let activeOutput = 'banner-card';
  let selected = null;
  let selectedIds = new Set();
  let clipboard = null;
  let groupSequence = 0;
  let sequence = 0;
  let textEdit = null;
  let groupScope = null;
  const observedFrames = new Set();
  const layoutObserver = new ResizeObserver(entries => {
    for (const {target:frame} of entries) {
      if (frame.isConnected && frame.clientWidth>0 && frame.clientHeight>0) refreshFramePresentation(frame);
    }
  });
  const toolDefaults = {
    text: { type:'text', text:'Add text', fill:'#222222', opacity:1, font:'ShopeeFont', fontWeight:900, fontSize:36, bold:true, align:'center', letterSpacing:0, lineSpacing:0 },
    rectangle: { type:'rectangle', fill:'#EE4D2D', stroke:'#FFFFFF', strokeWidth:0, radius:18, opacity:1 },
    ellipse: { type:'ellipse', fill:'#EE4D2D', stroke:'#FFFFFF', strokeWidth:0, opacity:1 },
    star: { type:'star', fill:'#EE4D2D', stroke:'#FFFFFF', strokeWidth:0, points:5, opacity:1 },
    line: { type:'line', stroke:'#222222', strokeWidth:4, lineStyle:'solid', opacity:1 },
  };
  const layersFor = id => layerMap.get(id) || [];
  const hasLayers = id => layersFor(id).length > 0;
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[char]);
  const selectedLayer = () => selected && layersFor(selected.output).find(layer => layer.id === selected.layerId);
  const selectedLayers = () => selected ? layersFor(selected.output).filter(layer => selectedIds.has(layer.id)) : [];
  const propertyLayers = () => selected ? selectedLayers() : [toolDefaults[tool]].filter(Boolean);
  const fontNames = window.BrandMaxFonts.families;
  const requestedFonts = new Set();
  const pendingFontFits = new WeakMap();
  const fontWeight = layer => window.BrandMaxFonts.weight(layer);
  function loadLayerFont(layer) {
    const family=layer.font||'ShopeeFont',weight=fontWeight(layer),key=`${family}|${weight}|${Boolean(layer.italic)}`;
    if(requestedFonts.has(key)) return;
    requestedFonts.add(key);
    window.BrandMaxFonts.load(family,weight,layer.italic).catch(error=>console.warn(error.message));
  }
  function finishFontEdit(list) {
    const output=selected?.output;
    const jobs=list.map(layer=>{
      const token={};pendingFontFits.set(layer,token);
      return window.BrandMaxFonts.load(layer.font,fontWeight(layer),layer.italic).catch(()=>{}).then(()=>{
        if(pendingFontFits.get(layer)!==token || (output&&!layersFor(output).includes(layer)))return false;
        pendingFontFits.delete(layer);if(output)fitTextGeometry(layer);return true;
      });
    });
    Promise.all(jobs).then(changed=>{if(output&&changed.some(Boolean)){renderOutput(output);announceEdit();}});
  }
  function weightField(list) {
    let options=window.BrandMaxFonts.weights(list[0].font);
    for(const layer of list.slice(1)) options=options.filter(weight=>window.BrandMaxFonts.weights(layer.font).includes(weight));
    const values=list.map(fontWeight),common=values.every(value=>value===values[0])?values[0]:null;
    return `<label>Font weight<select data-layer-field="fontWeight" ${options.length?'':'disabled'}>${!options.length?'<option>Choose a shared font family first</option>':common===null?'<option value="" selected disabled>Mixed</option>':''}${options.map(weight=>`<option value="${weight}" ${weight===common?'selected':''}>${window.BrandMaxFonts.label(weight)} · ${weight}</option>`).join('')}</select></label>`;
  }
  document.addEventListener('brandmax:font-loaded',()=>{
    for(const frame of observedFrames) if(frame.isConnected&&frame.clientWidth>0)refreshFramePresentation(frame);
  });
  document.addEventListener('brandmax:font-catalog',()=>updateProperties());
  const imageFromUrl = url => new Promise((resolve, reject) => {
    const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = url;
  });
  function announceEdit() {
    document.dispatchEvent(new Event('brandmax:edited'));
    window.BrandMaxHomepagePreview?.refresh();
  }
  function chooseTool(next) {
    tool = next;
    toolbar.querySelectorAll('[data-blank-tool]').forEach(button => button.classList.toggle('is-active', button.dataset.blankTool === tool));
    document.querySelectorAll('.blank-design-frame').forEach(frame => frame.classList.toggle('is-design-tool', tool !== 'select'));
    updateProperties();
  }
  function selectedOutputIds() {
    return [...document.querySelectorAll('#workflowOutputMenu input:checked')].map(input => input.value).filter(id => sizes[id]);
  }
  function syncTarget() {
    const ids = selectedOutputIds();
    if (!ids.includes(activeOutput)) activeOutput = ids[0] || 'banner-card';
    targetSelect.replaceChildren(...ids.map(id => {
      const option = document.createElement('option'); option.value = id; option.textContent = names[id]; return option;
    }));
    targetSelect.value = activeOutput;
  }
  function pointInFrame(frame, event, bounded = false) {
    const bounds = frame.getBoundingClientRect();
    const [width, height] = sizes[frame.dataset.blankOutput];
    const x = (event.clientX - bounds.left) / bounds.width * width;
    const y = (event.clientY - bounds.top) / bounds.height * height;
    return {
      x: bounded ? clamp(x, 0, width) : x,
      y: bounded ? clamp(y, 0, height) : y,
    };
  }
  function editablePoint(frame, point) {
    const id = frame.dataset.blankOutput;
    if (id === 'floating-icon') {
      if (Math.hypot(point.x - 180, point.y - 190) > 160) return false;
      const logo = frame.querySelector('.blank-floating-logo');
      if (logo) {
        const bounds = frame.getBoundingClientRect(), box = logo.getBoundingClientRect();
        const x = bounds.left + point.x / 360 * bounds.width, y = bounds.top + point.y / 360 * bounds.height;
        if (x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) return false;
      }
      return true;
    }
    if (id === 'pop-up-banner' || id === 'skinny-banner') {
      const [x,y,w,h] = id === 'pop-up-banner' ? [36,30,507,654] : [46,39,1108,280];
      if (point.x < x || point.x > x+w || point.y < y || point.y > y+h) return false;
      const cx = clamp(point.x,x+30,x+w-30), cy = clamp(point.y,y+30,y+h-30);
      if (Math.hypot(point.x-cx,point.y-cy)>30) return false;
      if (id === 'pop-up-banner' && ((point.x>=129 && point.x<=452 && point.y<=62) || (point.x>=90 && point.x<=489 && point.y>=644))) return false;
      return true;
    }
    return true;
  }
  function cropImageLayer(frame, layer) {
    if (!window.BrandMaxImageCrop || !layer.src) return;
    finishInlineText(); selectLayer(frame.dataset.blankOutput, layer);
    window.BrandMaxImageCrop.open({src:layer.src, crop:layer.crop, onApply(next) {
      const previous = layer.crop || {x:0,y:0,w:1,h:1};
      const wholeWidth = layer.w/previous.w, wholeHeight = layer.h/previous.h;
      layer.x += (next.x-previous.x)*wholeWidth; layer.y += (next.y-previous.y)*wholeHeight;
      layer.w = next.w*wholeWidth; layer.h = next.h*wholeHeight; layer.crop = {...next};
      renderOutput(frame.dataset.blankOutput); updateProperties(); announceEdit();
    }});
  }
  function starPoints(width, height, count = 5) {
    const cx = width / 2, cy = height / 2;
    count = clamp(Math.round(count) || 5, 3, 16);
    return Array.from({ length: count * 2 }, (_, index) => {
      const radius = (index % 2 ? .23 : .48) * Math.min(width, height);
      const angle = -Math.PI / 2 + index * Math.PI / count;
      return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
    });
  }
  function polygonPoints(layer) {
    if (layer.type === 'triangle') return [[layer.w / 2, 0], [layer.w, layer.h], [0, layer.h]];
    return starPoints(layer.w, layer.h, layer.points);
  }
  function roundedPolygon(layer) {
    const points = polygonPoints(layer), radius = Math.max(0, layer.radius || 0);
    const corners = points.map((p,i) => {
      const prev = points[(i+points.length-1)%points.length], next = points[(i+1)%points.length];
      const offset = q => { const d = Math.hypot(q[0]-p[0],q[1]-p[1]); const t = Math.min(radius,d/2)/d; return [p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]; };
      return {p, a:offset(prev), b:offset(next)};
    });
    return corners.map((c,i) => `${i ? 'L' : 'M'}${c.a.join(' ')} Q${c.p.join(' ')} ${c.b.join(' ')}`).join(' ')+' Z';
  }
  function selectLayers(id, ids) {
    if (textEdit && (textEdit.output !== id || !ids.includes(textEdit.layer.id))) finishInlineText();
    const previous = selected?.output;
    if (groupScope && (groupScope.output!==id || !ids.length || ids.some(layerId=>layersFor(id).find(layer=>layer.id===layerId)?.group!==groupScope.group))) groupScope=null;
    activeOutput = id;
    targetSelect.value = id;
    selectedIds = new Set(ids);
    selected = ids.length ? { output: id, layerId: ids[0] } : null;
    if (previous && previous !== id) renderOutput(previous);
    renderOutput(id);
    updateProperties();
  }
  function memberIds(id, layer) {
    if(groupScope?.output===id && groupScope.group===layer.group) return [layer.id];
    return layer.group ? layersFor(id).filter(item => item.group === layer.group).map(item => item.id) : [layer.id];
  }
  function enterGroup(frame,layer) {
    if(!layer.group) return;
    groupScope={output:frame.dataset.blankOutput,group:layer.group};
    if(selected?.output!==groupScope.output || selectedIds.size!==1 || !selectedIds.has(layer.id)) selectLayer(groupScope.output,layer);
  }
  function exitGroup() {
    if(!groupScope) return;
    finishInlineText();
    const scope=groupScope;groupScope=null;
    selectLayers(scope.output,layersFor(scope.output).filter(layer=>layer.group===scope.group).map(layer=>layer.id));
  }
  function groupControl() {return groupScope?'<button type="button" class="blank-exit-group" data-exit-group aria-label="Exit group editing">← Whole group</button>':'';}
  function positionGroupScope(frame) {
    const id=frame.dataset.blankOutput;
    let outline=frame.querySelector('.blank-group-scope-outline');
    const list=groupScope?.output===id?layersFor(id).filter(layer=>layer.group===groupScope.group):[];
    if(!list.length) {outline?.remove();return;}
    if(!outline) {outline=document.createElement('div');outline.className='blank-group-scope-outline';frame.append(outline);}
    const bounds=boundsFor(list),[w,h]=sizes[id];
    Object.assign(outline.style,{left:`${bounds.x/w*100}%`,top:`${bounds.y/h*100}%`,width:`${bounds.w/w*100}%`,height:`${bounds.h/h*100}%`});
  }
  function guide(frame, axis, visible) {
    let line = frame.querySelector(`.blank-center-guide[data-axis="${axis}"]`);
    if (!line && visible) {
      line = document.createElement('div'); line.className = 'blank-center-guide'; line.dataset.axis = axis; frame.append(line);
    }
    if (line) line.hidden = !visible;
  }
  function boundsFor(layers) {
    const x = Math.min(...layers.map(layer => layer.x)), y = Math.min(...layers.map(layer => layer.y));
    return { x, y, w: Math.max(...layers.map(layer => layer.x + layer.w)) - x, h: Math.max(...layers.map(layer => layer.y + layer.h)) - y };
  }
  function linePoints(layer) {
    return [{x:layer.x+(layer.flip ? layer.w : 0),y:layer.y}, {x:layer.x+(layer.flip ? 0 : layer.w),y:layer.y+layer.h}];
  }
  function setLinePoints(layer, a, b) {
    layer.x = Math.min(a.x,b.x); layer.y = Math.min(a.y,b.y);
    layer.w = Math.abs(b.x-a.x); layer.h = Math.abs(b.y-a.y);
    layer.flip = (b.x<a.x)!==(b.y<a.y);
  }
  function lineDash(layer) {
    const weight = Math.max(1,layer.strokeWidth ?? 4);
    return ({dotted:[.01,weight*2.5],dashed:[weight*4,weight*2.5],'dash-dot':[weight*4,weight*2.5,.01,weight*2.5]})[layer.lineStyle] || [];
  }
  function lineStyleField(value) {
    return `<label>Line style<select data-layer-field="lineStyle">${value===null?'<option value="" selected disabled>Mixed</option>':''}${[['solid','Solid'],['dashed','Dashed'],['dotted','Dotted'],['dash-dot','Dash-dot']].map(([id,label])=>`<option value="${id}" ${id===value?'selected':''}>${label}</option>`).join('')}</select></label>`;
  }
  function syncTextGeometryFields(layer) {
    if (selectedLayer() !== layer) return;
    for (const key of ['w', 'h']) {
      const field = properties.querySelector(`[data-layer-field="${key}"]`);
      if (field && document.activeElement !== field) field.value = String(Math.round(layer[key]));
    }
  }
  function fitTextGeometry(layer) {
    if (layer.type !== 'text') return;
    const probe = document.createElement('span');
    Object.assign(probe.style, {
      position: 'fixed', left: '-100000px', top: '0', visibility: 'hidden',
      whiteSpace: 'pre', display: 'block', width: 'max-content',
      fontFamily: `"${layer.font || 'ShopeeFont'}", Arial, sans-serif`,
      fontSize: `${layer.fontSize}px`, fontWeight: String(fontWeight(layer)),
      fontStyle: layer.italic ? 'italic' : 'normal',
      letterSpacing: `${layer.letterSpacing || 0}px`,
      lineHeight: `${Math.max(1, layer.fontSize * 1.15 + (layer.lineSpacing || 0))}px`,
    });
    probe.textContent = layer.text || ' ';
    document.body.append(probe);
    layer.w = Math.max(24, probe.getBoundingClientRect().width + 2);
    layer.h = Math.max(layer.fontSize * 1.15, probe.getBoundingClientRect().height + 2);
    probe.remove(); syncTextGeometryFields(layer);
  }
  function finishInlineText(cancel = false) {
    if (!textEdit) return;
    const edit = textEdit;
    textEdit = null;
    if (cancel) Object.assign(edit.layer, edit.original);
    else edit.layer.text = edit.content.innerText.replace(/\r/g, '');
    edit.content.contentEditable = 'false';
    edit.node.classList.remove('is-text-editing');
    edit.content.textContent = edit.layer.text;
    applyNode(edit.node, edit.layer, edit.frame);
    positionSelection(edit.frame);
    syncTextGeometryFields(edit.layer);
    if (!cancel && ['text', 'w', 'h'].some(key => edit.layer[key] !== edit.original[key])) announceEdit();
    // Do not rebuild the properties panel on blur: the user may be clicking
    // one of its fields, and replacing that field would swallow the click.
  }
  function beginInlineText(frame, layer) {
    const content = frame.querySelector(`[data-layer-id="${layer.id}"] .blank-layer-text`);
    if (!content || content.isContentEditable) return;
    finishInlineText();
    const node = content.parentElement;
    textEdit = { frame, node, content, layer, output: frame.dataset.blankOutput, original: { text: layer.text, w: layer.w, h: layer.h } };
    node.classList.add('is-text-editing');
    content.contentEditable = 'true';
    content.spellcheck = false;
    content.onpointerdown = event => { if (content.isContentEditable) event.stopPropagation(); };
    content.ondblclick = event => { if (content.isContentEditable) event.stopPropagation(); };
    content.onkeydown = event => {
      event.stopPropagation();
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        const selection = window.getSelection(), range = document.createRange();
        range.selectNodeContents(content); selection.removeAllRanges(); selection.addRange(range);
      } else if (event.key === 'Escape') {
        event.preventDefault(); finishInlineText(true); node.focus();
      }
    };
    content.onpaste = event => {
      event.preventDefault(); event.stopPropagation();
      document.execCommand('insertText', false, event.clipboardData.getData('text/plain'));
    };
    content.oninput = () => {
      if (textEdit?.content !== content) return;
      layer.text = content.innerText.replace(/\r/g, '');
      const scale = frame.clientWidth / sizes[frame.dataset.blankOutput][0];
      layer.w = Math.max(24, content.scrollWidth / scale + 2);
      layer.h = Math.max(layer.fontSize * 1.15, content.scrollHeight / scale + 2);
      applyNode(node, layer, frame);
      positionSelection(frame);
      syncTextGeometryFields(layer);
    };
    content.onblur = () => { if (textEdit?.content === content) finishInlineText(); };
    content.focus({ preventScroll: true });
    const selection = window.getSelection(), range = document.createRange();
    range.selectNodeContents(content); selection.removeAllRanges(); selection.addRange(range);
  }
  function startObjectMove(frame, layer, event) {
    if (event.button !== 0) return;
    event.stopPropagation(); event.preventDefault();
    finishInlineText();
    const id = frame.dataset.blankOutput;
    if (event.shiftKey) selectLayers(id, [...new Set([...(selected?.output === id ? selectedIds : []), ...memberIds(id, layer)])]);
    else if (selected?.output !== id || !selectedIds.has(layer.id)) selectLayers(id, memberIds(id, layer));
    frame.querySelector(`[data-layer-id="${layer.id}"]`)?.focus({ preventScroll: true });
    const start = pointInFrame(frame, event);
    const originals = selectedLayers().map(item => ({ item, x: item.x, y: item.y }));
    const bounds = boundsFor(originals.map(entry => entry.item));
    let changed = false;
    const moving = moveEvent => {
      if (moveEvent.pointerId !== event.pointerId) return;
      if (!changed && Math.hypot(moveEvent.clientX - event.clientX, moveEvent.clientY - event.clientY) < 3) return;
      const current = pointInFrame(frame, moveEvent);
      let dx = current.x - start.x, dy = current.y - start.y;
      const [width, height] = sizes[id];
      const snapX = Math.abs(bounds.x + dx + bounds.w / 2 - width / 2) < 8;
      const snapY = Math.abs(bounds.y + dy + bounds.h / 2 - height / 2) < 8;
      if (snapX) dx = width / 2 - bounds.w / 2 - bounds.x;
      if (snapY) dy = height / 2 - bounds.h / 2 - bounds.y;
      guide(frame, 'x', snapX); guide(frame, 'y', snapY);
      originals.forEach(entry => {
        entry.item.x = entry.x + dx; entry.item.y = entry.y + dy;
        const element = frame.querySelector(`[data-layer-id="${entry.item.id}"]`);
        if (element) applyNode(element, entry.item, frame);
      });
      changed = true; positionSelection(frame);
    };
    const finish = finishEvent => {
      if (finishEvent.pointerId !== event.pointerId) return;
      window.removeEventListener('pointermove', moving);
      window.removeEventListener('pointerup', finish);
      window.removeEventListener('pointercancel', finish);
      guide(frame, 'x', false); guide(frame, 'y', false);
      if (changed) { announceEdit(); renderOutput(id); updateProperties(); }
    };
    window.addEventListener('pointermove', moving);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
  }
  function resizeHandle(frame, layer, direction) {
    const handle = document.createElement('span');
    handle.className = 'blank-transform-handle'; handle.dataset.direction = direction;
    handle.setAttribute('role', 'button'); handle.setAttribute('aria-label', `Resize ${direction}`);
    handle.addEventListener('pointerdown', event => {
      event.preventDefault(); event.stopPropagation();
      finishInlineText();
      const list = layer ? [layer] : selectedLayers();
      const start = pointInFrame(frame, event), original = boundsFor(list);
      const originals = list.map(item=>({item,before:{...item}}));
      const proportional = original.w>0 && original.h>0 && direction.length===2 && (list.length>1 || ['image','rectangle','ellipse','star','triangle'].includes(list[0].type));
      let changed = false;
      const move = moveEvent => {
        if (moveEvent.pointerId!==event.pointerId) return;
        const now = pointInFrame(frame, moveEvent), dx = now.x-start.x, dy = now.y-start.y;
        let w = original.w===0?0:Math.max(12,original.w+(direction.includes('w')?-dx:direction.includes('e')?dx:0));
        let h = original.h===0?0:Math.max(12,original.h+(direction.includes('n')?-dy:direction.includes('s')?dy:0));
        if (proportional) {
          // Project the dragged corner onto the original diagonal; the opposite
          // corner stays fixed and photos never squash under corner resizing.
          const sx = direction.includes('w')?-1:1, sy = direction.includes('n')?-1:1;
          const scale = Math.max(12/Math.max(1,Math.min(original.w,original.h)),1+(dx*sx*original.w+dy*sy*original.h)/(original.w**2+original.h**2));
          w = original.w*scale; h = original.h*scale;
        }
        const x = direction.includes('w')?original.x+original.w-w:original.x;
        const y = direction.includes('n')?original.y+original.h-h:original.y;
        const sx = original.w?w/original.w:1, sy = original.h?h/original.h:1;
        const scale = original.w===0?sy:original.h===0?sx:Math.min(sx,sy);
        for (const {item,before} of originals) {
          item.x=x+(before.x-original.x)*sx; item.y=y+(before.y-original.y)*sy;
          item.w=before.w*sx; item.h=before.h*sy;
          if (list.length>1) for (const key of ['fontSize','letterSpacing','lineSpacing','radius','strokeWidth']) {
            if (Number.isFinite(before[key])) item[key]=before[key]*scale;
          }
          const node = frame.querySelector(`[data-layer-id="${item.id}"]`);
          if (node) applyNode(node,item,frame);
        }
        changed = Math.abs(dx)+Math.abs(dy)>.01;
        positionSelection(frame);
      };
      const finish = finishEvent => { if (finishEvent.pointerId!==event.pointerId) return; window.removeEventListener('pointermove',move); window.removeEventListener('pointerup',finish); window.removeEventListener('pointercancel',finish); renderOutput(frame.dataset.blankOutput); updateProperties(); if(changed) announceEdit(); };
      window.addEventListener('pointermove',move); window.addEventListener('pointerup',finish); window.addEventListener('pointercancel',finish);
    });
    return handle;
  }
  function lineAnchor(frame, layer, index) {
    const handle = document.createElement('span'); handle.className='blank-line-anchor'; handle.dataset.endpoint=String(index);
    handle.setAttribute('role','button'); handle.setAttribute('aria-label',index?'Move line end':'Move line start');
    handle.addEventListener('pointerdown',event=>{
      if(event.button!==0) return;
      event.preventDefault(); event.stopPropagation();
      const ends=linePoints(layer), fixed=ends[1-index]; let changed=false;
      const move=ev=>{
        if(ev.pointerId!==event.pointerId) return;
        let point=pointInFrame(frame,ev);
        if(ev.shiftKey) {const angle=Math.round(Math.atan2(point.y-fixed.y,point.x-fixed.x)/(Math.PI/4))*Math.PI/4,length=Math.hypot(point.x-fixed.x,point.y-fixed.y);point={x:fixed.x+Math.cos(angle)*length,y:fixed.y+Math.sin(angle)*length};}
        setLinePoints(layer,index?fixed:point,index?point:fixed);
        applyNode(frame.querySelector(`[data-layer-id="${layer.id}"]`),layer,frame); positionSelection(frame); changed=true;
      };
      const finish=ev=>{if(ev.pointerId!==event.pointerId)return;window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',finish);window.removeEventListener('pointercancel',finish);renderOutput(frame.dataset.blankOutput);updateProperties();if(changed)announceEdit();};
      window.addEventListener('pointermove',move);window.addEventListener('pointerup',finish);window.addEventListener('pointercancel',finish);
    });
    return handle;
  }
  function positionSelection(frame) {
    positionGroupScope(frame);
    const box = frame.querySelector('.blank-selection-overlay');
    if (!box || selected?.output !== frame.dataset.blankOutput || !selectedIds.size) return;
    const picked = selectedLayers(); if (!picked.length) return;
    const bounds = boundsFor(picked), [width,height] = sizes[selected.output];
    box.style.left = `${bounds.x/width*100}%`; box.style.top = `${bounds.y/height*100}%`;
    box.style.width = `${bounds.w/width*100}%`; box.style.height = `${bounds.h/height*100}%`;
    if (picked.length===1 && picked[0].type==='line') {
      linePoints(picked[0]).forEach((point,index)=>{const handle=box.querySelector(`[data-endpoint="${index}"]`);if(handle){handle.style.left=`${(point.x-bounds.x)/width*frame.clientWidth}px`;handle.style.top=`${(point.y-bounds.y)/height*frame.clientHeight}px`;}});
    }
  }
  function makeNode(layer, frame) {
    const node = document.createElement('div');
    node.className = 'blank-custom-layer';
    node.blankLayer = layer;
    node.dataset.layerId = layer.id;
    node.dataset.layerType = layer.type;
    node.tabIndex = 0;
    node.setAttribute('role', 'button');
    node.setAttribute('aria-label', `${layer.type} on ${names[frame.dataset.blankOutput]}`);
    if (layer.type === 'text') {
      loadLayerFont(layer);
      const content = document.createElement('span'); content.className = 'blank-layer-text'; content.textContent = layer.text; node.append(content);
    }
    if (layer.type === 'sticker') {
      const shape = document.createElement('span'); shape.className = 'blank-sticker-shape';
      const content = document.createElement('span'); content.className = 'blank-layer-text'; content.textContent = layer.text;
      node.append(shape,content);
    }
    if (layer.type === 'image') {
      const image = document.createElement('img'); image.src = layer.src; image.alt = ''; node.append(image);
    }
    if (['triangle','star','line'].includes(layer.type)) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('preserveAspectRatio', 'none');
      const part = document.createElementNS('http://www.w3.org/2000/svg', layer.type === 'line' ? 'line' : 'path');
      svg.append(part); node.append(svg);
      if (layer.type==='line') {
        const hit=document.createElementNS('http://www.w3.org/2000/svg','line'); hit.classList.add('blank-line-hit'); svg.append(hit);
      }
    }
    if (selected?.output === frame.dataset.blankOutput && selectedIds.has(layer.id)) node.classList.add('is-selected');
    applyNode(node, layer, frame);
    node.addEventListener('dblclick', event => {
      event.stopPropagation();
      if (!editablePoint(frame,pointInFrame(frame,event))) return;
      enterGroup(frame,layer);
      if (layer.type === 'text' || layer.type === 'sticker') beginInlineText(frame, layer);
      else if (layer.type === 'image') cropImageLayer(frame, layer);
    });
    node.addEventListener('contextmenu', event => {
      event.preventDefault();
      if (!selectedIds.has(layer.id) || selected?.output !== frame.dataset.blankOutput) selectLayers(frame.dataset.blankOutput, memberIds(frame.dataset.blankOutput, layer));
      showContextMenu(event.clientX, event.clientY);
    });
    node.addEventListener('pointerdown', event => {
      if (tool !== 'select') return;
      if (!editablePoint(frame,pointInFrame(frame,event))) { event.stopPropagation(); return; }
      if (event.target.isContentEditable) { event.stopPropagation(); return; }
      if(layer.group && event.detail>1) {
        event.stopPropagation();event.preventDefault();enterGroup(frame,layer);
        if(['text','sticker'].includes(layer.type)) beginInlineText(frame,layer);
        return;
      }
      if ((layer.type === 'text' || layer.type === 'sticker') && event.detail > 1) {
        event.stopPropagation(); event.preventDefault();
        if (selected?.output !== frame.dataset.blankOutput || !selectedIds.has(layer.id)) selectLayers(frame.dataset.blankOutput,[layer.id]);
        beginInlineText(frame, layer); return;
      }
      startObjectMove(frame, layer, event);
    });
    node.addEventListener('keydown', event => {
      if (event.target.isContentEditable) return;
      if (event.key === 'Enter' && ['text', 'sticker'].includes(layer.type)) { event.preventDefault(); beginInlineText(frame, layer); }
      else if (event.key === ' ') { event.preventDefault(); selectLayers(frame.dataset.blankOutput, memberIds(frame.dataset.blankOutput, layer)); }
    });
    return node;
  }
  function applyNode(node, layer, frame) {
    const [width, height] = sizes[frame.dataset.blankOutput];
    const zoom=frame.getBoundingClientRect().width/width || 1;
    const padding=layer.type==='line'?Math.max((layer.strokeWidth ?? 4)/2+1,10/zoom):0;
    const box={x:layer.x-padding,y:layer.y-padding,w:layer.w+padding*2,h:layer.h+padding*2};
    node.style.left = `${box.x / width * 100}%`;
    node.style.top = `${box.y / height * 100}%`;
    node.style.width = `${box.w / width * 100}%`;
    node.style.height = `${box.h / height * 100}%`;
    node.style.clipPath = `inset(${Math.max(0,-box.y/box.h*100)}% ${Math.max(0,(box.x+box.w-width)/box.w*100)}% ${Math.max(0,(box.y+box.h-height)/box.h*100)}% ${Math.max(0,-box.x/box.w*100)}%)`;
    node.style.opacity = String(layer.opacity ?? 1);
    if (layer.type === 'image') {
      const image = node.querySelector('img'), crop = layer.crop || {x:0,y:0,w:1,h:1};
      Object.assign(image.style, {position:'absolute', left:`${-crop.x/crop.w*100}%`, top:`${-crop.y/crop.h*100}%`, width:`${100/crop.w}%`, height:`${100/crop.h}%`, objectFit:'fill'});
      node.style.overflow = 'hidden';
    }
    if (layer.type === 'rectangle' || layer.type === 'ellipse') {
      node.style.background = layer.fill;
      node.style.border = `${(layer.strokeWidth || 0) * frame.clientWidth / width}px solid ${layer.stroke}`;
      node.style.borderRadius = layer.type === 'ellipse' ? '50%' : `${(layer.radius || 0) * frame.clientWidth / width}px`;
    }
    if (layer.type === 'text') {
      const content = node.querySelector('.blank-layer-text');
      loadLayerFont(layer);
      if (content && !content.isContentEditable) content.textContent = layer.text;
      node.style.color = layer.fill;
      node.style.fontFamily = `"${layer.font || 'ShopeeFont'}", Arial, sans-serif`;
      node.style.fontSize = `${layer.fontSize * frame.clientWidth / width}px`;
      node.style.fontWeight = String(fontWeight(layer));
      node.style.fontStyle = layer.italic ? 'italic' : 'normal';
      node.style.textDecoration = layer.underline ? 'underline' : 'none';
      node.style.letterSpacing = `${(layer.letterSpacing || 0) * frame.clientWidth / width}px`;
      node.style.lineHeight = `${(layer.fontSize * 1.15 + (layer.lineSpacing || 0)) * frame.clientWidth / width}px`;
      node.style.justifyContent = layer.align || 'center';
      node.style.textAlign = layer.align === 'flex-start' ? 'left' : layer.align === 'flex-end' ? 'right' : 'center';
    }
    if (layer.type === 'sticker') {
      const shape = node.querySelector('.blank-sticker-shape'), content = node.querySelector('.blank-layer-text');
      if (content && !content.isContentEditable) content.textContent = layer.text;
      shape.style.background = layer.fill || '#EE4D2D';
      shape.style.borderRadius = layer.variant === 'circle' ? '50%' : layer.variant === 'box' ? '12%' : '0';
      shape.style.clipPath = layer.variant === 'burst' ? `polygon(${starPoints(100,100,12).map(([x,y]) => `${x}% ${y}%`).join(',')})` : 'none';
      content.style.color = layer.textColor || '#FFFFFF';
      content.style.fontSize = `${(layer.fontSize || 28) * frame.clientWidth / width}px`;
      content.style.fontFamily = 'ShopeeFont, Arial, sans-serif';
    }
    if (['triangle','star','line'].includes(layer.type)) {
      const svg = node.querySelector('svg');
      const part = svg?.firstElementChild;
      if (svg && part) {
        svg.setAttribute('viewBox', `0 0 ${Math.max(1,layer.w)} ${Math.max(1,layer.h)}`);
        if (layer.type === 'line') {
          // Extra room around the stroke prevents diagonal endpoints being
          // sliced into wedges, without stretching the SVG coordinate system.
          svg.setAttribute('viewBox',`${-padding} ${-padding} ${box.w} ${box.h}`);
          for (const segment of svg.children) {
            segment.setAttribute('x1',layer.flip?String(layer.w):'0'); segment.setAttribute('y1','0');
            segment.setAttribute('x2',layer.flip?'0':String(layer.w)); segment.setAttribute('y2',String(layer.h));
            segment.setAttribute('stroke-linecap','round');
          }
          part.setAttribute('stroke', layer.stroke);
          part.setAttribute('stroke-width', String(layer.strokeWidth ?? 4));
          part.setAttribute('stroke-dasharray',lineDash(layer).join(' ')||'none');
          const hit=svg.lastElementChild; hit.setAttribute('stroke','transparent'); hit.setAttribute('stroke-width',String(Math.max((layer.strokeWidth ?? 4)+8/zoom,20/zoom)));
        } else {
          part.setAttribute('d', roundedPolygon(layer));
          part.setAttribute('fill', layer.fill);
          part.setAttribute('stroke', layer.strokeWidth ? layer.stroke : 'none');
          part.setAttribute('stroke-width', String(layer.strokeWidth || 0));
        }
      }
    }
  }
  function renderOutput(id) {
    const frame = document.querySelector(`[data-blank-output="${id}"]`);
    if (!frame) return;
    let stack = frame.querySelector('.blank-custom-layer-stack');
    if (!stack) {
      stack = document.createElement('div'); stack.className = 'blank-custom-layer-stack';
      frame.insertBefore(stack, frame.querySelector('.blank-mall-tag,.blank-popup-tag,.blank-floating-logo'));
    }
    // Keep text nodes alive when selecting or updating properties. Replacing
    // them between clicks breaks double-click, caret selection and IME input.
    const existing = new Map([...stack.querySelectorAll('.blank-custom-layer')].map(node => [node.dataset.layerId, node]));
    const list = layersFor(id);
    for (const [index, layer] of list.entries()) {
      let node = existing.get(layer.id);
      if (!node || node.blankLayer !== layer) { node?.remove(); node = makeNode(layer, frame); }
      existing.delete(layer.id);
      if (stack.children[index] !== node) stack.insertBefore(node, stack.children[index] || null);
      node.classList.toggle('is-selected', selected?.output === id && selectedIds.has(layer.id));
      applyNode(node, layer, frame);
    }
    existing.forEach(node => node.remove());
    stack.querySelectorAll('.blank-group-bounds').forEach(node => node.remove());
    frame.querySelector('.blank-selection-overlay')?.remove();
    positionGroupScope(frame);
    if (selected?.output === id && selectedIds.size) {
      const box = document.createElement('div'); box.className = 'blank-selection-overlay';
      if (selectedIds.size === 1) {
        const layer = selectedLayer();
        if (['text', 'sticker'].includes(layer.type)) {
          for (const edge of ['top', 'right', 'bottom', 'left']) {
            const grip = document.createElement('span'); grip.className = `blank-text-drag-edge ${edge}`;
            grip.addEventListener('pointerdown', event => startObjectMove(frame, layer, event)); box.append(grip);
          }
          const move = document.createElement('button'); move.type = 'button'; move.className = 'blank-text-move-handle';
          move.setAttribute('aria-label', 'Move text object'); move.title = 'Drag to move text';
          move.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M3 12h18M8 7l4-4 4 4M8 17l4 4 4-4M7 8l-4 4 4 4M17 8l4 4-4 4"/></svg>';
          move.addEventListener('pointerdown', event => startObjectMove(frame, layer, event)); box.append(move);
        }
        if (layer.type==='line') {box.classList.add('is-line');box.append(lineAnchor(frame,layer,0),lineAnchor(frame,layer,1));}
        else for (const direction of ['nw','n','ne','e','se','s','sw','w']) box.append(resizeHandle(frame,layer,direction));
      } else {
        box.classList.add('is-group');
        const bounds=boundsFor(selectedLayers());
        const directions=bounds.w===0?['n','s']:bounds.h===0?['w','e']:['nw','n','ne','e','se','s','sw','w'];
        for(const direction of directions)box.append(resizeHandle(frame,null,direction));
      }
      frame.append(box); positionSelection(frame);
    }
    frame.classList.toggle('has-custom-layers', hasLayers(id));
    frame.classList.toggle('is-design-tool', tool !== 'select');
    const download = frame.closest('.blank-preview-block')?.querySelector('.blank-download');
    if (download) download.disabled = !hasLayers(id) && !frame.classList.contains('has-image');
  }
  function selectLayer(id, layer) {
    selectLayers(id, [layer.id]);
  }
  function startMarquee(frame, event) {
    const id = frame.dataset.blankOutput, start = pointInFrame(frame, event), [width, height] = sizes[id];
    const marquee = document.createElement('div'); marquee.className = 'blank-selection-marquee'; frame.append(marquee);
    frame.setPointerCapture(event.pointerId);
    let moved = false;
    const move = moveEvent => {
      moved = true; const current = pointInFrame(frame, moveEvent);
      marquee.style.left = `${Math.min(start.x,current.x)/width*100}%`;
      marquee.style.top = `${Math.min(start.y,current.y)/height*100}%`;
      marquee.style.width = `${Math.abs(current.x-start.x)/width*100}%`;
      marquee.style.height = `${Math.abs(current.y-start.y)/height*100}%`;
    };
    const finish = finishEvent => {
      frame.removeEventListener('pointermove', move); frame.removeEventListener('pointerup', finish); frame.removeEventListener('pointercancel', finish); marquee.remove();
      if (!moved) { selectLayers(id, []); return; }
      const end = pointInFrame(frame, finishEvent), left = Math.min(start.x,end.x), right = Math.max(start.x,end.x), top = Math.min(start.y,end.y), bottom = Math.max(start.y,end.y);
      const ids = new Set(layersFor(id).filter(layer => layer.x < right && layer.x+layer.w > left && layer.y < bottom && layer.y+layer.h > top).flatMap(layer => memberIds(id, layer)));
      selectLayers(id, event.shiftKey && selected?.output === id ? [...selectedIds,...ids] : [...ids]);
    };
    frame.addEventListener('pointermove', move); frame.addEventListener('pointerup', finish); frame.addEventListener('pointercancel', finish);
  }
  function startDrawing(frame, event) {
    if (!document.documentElement.classList.contains('blank-mode')) return;
    const id = frame.dataset.blankOutput;
    if (event.target.closest('.blank-floating-logo') || !editablePoint(frame, pointInFrame(frame,event))) return;
    activeOutput = id; targetSelect.value = id;
    if (tool === 'select') {
      if (!event.target.closest('.blank-custom-layer') && !event.altKey) {
        if (hasLayers(id)) { event.preventDefault(); startMarquee(frame,event); }
        else selectLayers(id,[]);
      }
      return;
    }
    if (event.target.closest('.blank-floating-logo')) return;
    event.preventDefault();
    const start = pointInFrame(frame, event);
    if (tool === 'text') {
      const [width, height] = sizes[id];
      const layer = { ...toolDefaults.text, id:`layer-${++sequence}`, x:clamp(start.x,0,width-180), y:clamp(start.y,0,height-56), w:Math.min(220,width), h:56 };
      layerMap.set(id, [...layersFor(id), layer]);
      selectLayer(id, layer); chooseTool('select'); announceEdit();
      beginInlineText(frame,layer);
      return;
    }
    const layer = { ...toolDefaults[tool], id:`layer-${++sequence}`, type:tool, x:start.x, y:start.y, w:1, h:1, flip:false };
    layerMap.set(id, [...layersFor(id), layer]);
    frame.setPointerCapture(event.pointerId);
    renderOutput(id);
    let moved = false, lastPointer=event;
    const move = moveEvent => {
      moved = true;
      lastPointer=moveEvent;
      let current = pointInFrame(frame, moveEvent);
      if(layer.type==='line') {
        if(moveEvent.shiftKey){const dx=current.x-start.x,dy=current.y-start.y,length=Math.hypot(dx,dy),angle=Math.round(Math.atan2(dy,dx)/(Math.PI/4))*Math.PI/4;current={x:start.x+Math.cos(angle)*length,y:start.y+Math.sin(angle)*length};}
        setLinePoints(layer,start,current);
      }
      else {
        if(moveEvent.shiftKey){const dx=current.x-start.x,dy=current.y-start.y,side=Math.max(Math.abs(dx),Math.abs(dy));current={x:start.x+(Math.sign(dx)||1)*side,y:start.y+(Math.sign(dy)||1)*side};}
        layer.x = Math.min(start.x, current.x); layer.y = Math.min(start.y, current.y);
        layer.w = Math.max(2, Math.abs(current.x - start.x)); layer.h = Math.max(2, Math.abs(current.y - start.y));
      }
      const node = frame.querySelector(`[data-layer-id="${layer.id}"]`);
      if (node) applyNode(node, layer, frame);
    };
    const finish = () => {
      frame.removeEventListener('pointermove', move);
      frame.removeEventListener('pointerup', finish);
      frame.removeEventListener('pointercancel', finish);
      document.removeEventListener('keydown',shiftChange);document.removeEventListener('keyup',shiftChange);
      if (!moved || (layer.type === 'line' ? Math.hypot(layer.w, layer.h) < 12 : layer.w < 12 || layer.h < 12)) {
        const [width, height] = sizes[id];
        layer.x = clamp(start.x - 60, 0, width - 120);
        layer.y = clamp(start.y - 36, 0, height - 72);
        layer.w = Math.min(120,width); layer.h = tool === 'line' ? 48 : 72;
      }
      selectLayer(id, layer); chooseTool('select'); announceEdit();
    };
    frame.addEventListener('pointermove', move);
    frame.addEventListener('pointerup', finish);
    frame.addEventListener('pointercancel', finish);
    const shiftChange=keyEvent=>{if(keyEvent.key==='Shift'&&moved)move({clientX:lastPointer.clientX,clientY:lastPointer.clientY,shiftKey:keyEvent.type==='keydown'});};
    document.addEventListener('keydown',shiftChange);document.addEventListener('keyup',shiftChange);
  }
  function refreshFramePresentation(frame) {
    for(const node of frame.querySelectorAll('.blank-custom-layer')) if(node.blankLayer) applyNode(node,node.blankLayer,frame);
    positionSelection(frame);
  }
  function mount() {
    syncTarget();
    for(const frame of observedFrames) if(!frame.isConnected){layoutObserver.unobserve(frame);observedFrames.delete(frame);}
    document.querySelectorAll('.blank-design-frame').forEach(frame => {
      if (!frame.dataset.blankToolsAttached) {
        frame.dataset.blankToolsAttached = 'true';
        frame.addEventListener('pointerdown', event => startDrawing(frame, event));
      }
      if(!observedFrames.has(frame)){observedFrames.add(frame);layoutObserver.observe(frame);}
      renderOutput(frame.dataset.blankOutput);
    });
    updateProperties();
  }
  function updateProperties() {
    const activeLayer = selectedLayer();
    const isDefault = !activeLayer && Boolean(toolDefaults[tool]);
    const layer = activeLayer || (isDefault ? toolDefaults[tool] : null);
    if (!layer) { properties.innerHTML = `<p class="editor-tool-empty">Select an object to edit its properties, or choose a tool to add one.</p>`; return; }
    if (selectedIds.size > 1) { renderMultiProperties(); return; }
    const numeric = (label, field, value, min = 0, max = 2000) => `<label>${label}<input type="number" data-layer-field="${field}" value="${Math.round(value)}" min="${min}" max="${max}" /></label>`;
    const color = (name, field, value) => `<label>${name}<span class="editor-hex-color"><input type="text" aria-label="${name} hex" data-layer-field="${field}" value="${escapeHtml(value || '#000000')}" maxlength="7" spellcheck="false" /><input type="color" aria-label="${name} picker" data-layer-color="${field}" value="${escapeHtml(value || '#000000')}" /></span></label>`;
    const fill = layer.type !== 'image' && layer.type !== 'line' ? color(layer.type === 'text' ? 'Text colour' : 'Fill colour', 'fill', layer.fill) : '';
    const stroke = ['rectangle','ellipse','triangle','star','line'].includes(layer.type) ? color(layer.type === 'line' ? 'Line colour' : 'Stroke colour', 'stroke', layer.stroke) : '';
    const customFont = layer.font && !fontNames.includes(layer.font);
    const font = `<label>Font family<select data-layer-field="font">${fontNames.map(name => `<option value="${name}" ${name === (layer.font || 'ShopeeFont') ? 'selected' : ''}>${name}</option>`).join('')}<option value="custom" ${customFont ? 'selected' : ''}>More Google Fonts…</option></select></label>${customFont ? `<label>Google Fonts family<input type="text" data-layer-field="customFont" value="${escapeHtml(layer.font)}" placeholder="e.g. Nunito Sans" /></label>` : ''}`;
    const alignIcon = value => { const x = value === 'flex-start' ? [2,2,2] : value === 'flex-end' ? [2,7,4] : [2,4.5,3]; return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 5h20 M${x[1]} 10h15 M${x[2]} 15h18 M2 20h20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`; };
    const align = `<div class="editor-icon-field"><span>Alignment</span><div class="editor-icon-group" role="group" aria-label="Text alignment">${[['flex-start','Left'],['center','Centre'],['flex-end','Right']].map(([value,label]) => `<button type="button" data-layer-align="${value}" class="${(layer.align || 'center') === value ? 'is-active' : ''}" aria-label="${label} align" title="${label}" aria-pressed="${(layer.align || 'center') === value}">${alignIcon(value)}</button>`).join('')}</div></div>`;
    const styles = `<div class="editor-icon-field"><span>Style</span><div class="editor-icon-group" role="group" aria-label="Text style">${[['bold','B','Bold'],['italic','I','Italic'],['underline','U','Underline']].map(([value,icon,label]) => {const active=value==='bold'?fontWeight(layer)>=600:Boolean(layer[value]);return `<button type="button" data-layer-style="${value}" ${value==='bold'&&window.BrandMaxFonts.weights(layer.font).length<2?'disabled':''} class="${active ? 'is-active' : ''}" aria-label="${label}" title="${label}" aria-pressed="${active}">${icon}</button>`;}).join('')}</div></div>`;
    const textSettings = layer.type === 'text' ? `${isDefault ? '' : '<p class="editor-tools-hint">Double-click the text on the banner to type.</p>'}${font}${weightField([layer])}<div class="editor-property-row">${numeric('Font size','fontSize',layer.fontSize,8,200)}${color('Text colour','fill',layer.fill)}</div>${styles}${align}<div class="editor-property-row">${numeric('Horizontal spacing','letterSpacing',layer.letterSpacing || 0,-50,200)}${numeric('Vertical spacing','lineSpacing',layer.lineSpacing || 0,-50,200)}</div>` : '';
    const stickerSettings = layer.type === 'sticker' ? `<label>Sticker text<input type="text" data-layer-field="text" value="${escapeHtml(layer.text)}" /></label><div class="editor-property-row">${color('Shape colour','fill',layer.fill)}${color('Text colour','textColor',layer.textColor)}</div>` : '';
    const appearance = layer.type === 'rectangle' ? `<div class="editor-property-row">${numeric('Corner radius','radius',layer.radius,0,150)}${numeric('Stroke width','strokeWidth',layer.strokeWidth,0,40)}</div>` : layer.type === 'star' ? `<div class="editor-property-row">${numeric('Corner radius','radius',layer.radius || 0,0,150)}${numeric('Star points','points',layer.points || 5,3,16)}${numeric('Stroke width','strokeWidth',layer.strokeWidth,0,40)}</div>` : layer.type === 'line' ? `<div class="editor-property-row">${numeric('Line weight (px)','strokeWidth',layer.strokeWidth ?? 4,1,100)}${lineStyleField(layer.lineStyle || 'solid')}</div>` : layer.type === 'ellipse' ? `<div class="editor-property-row">${numeric('Stroke width','strokeWidth',layer.strokeWidth,0,40)}</div>` : '';
    const geometry = isDefault ? '' : `<div class="editor-property-row">${numeric('X','x',layer.x,-2000)}${numeric('Y','y',layer.y,-2000)}</div><div class="editor-property-row">${numeric('Width','w',layer.w,layer.type==='line'?0:12)}${numeric('Height','h',layer.h,layer.type==='line'?0:12)}</div>`;
    properties.innerHTML = `${groupControl()}<strong>${escapeHtml(layer.type === 'sticker' ? 'Sticker' : layer.type[0].toUpperCase() + layer.type.slice(1))} · ${escapeHtml(names[selected?.output || activeOutput])}${isDefault ? ' defaults' : ''}</strong>${isDefault ? '<p class="editor-tool-empty">Set the appearance here, then click or drag on the canvas to add it.</p>' : ''}${textSettings}${stickerSettings}${layer.type !== 'text' && layer.type !== 'sticker' ? `<div class="editor-property-row">${fill}${stroke}</div>` : ''}${appearance}${geometry}<label>Opacity · ${Math.round((layer.opacity ?? 1) * 100)}%<input type="range" data-layer-field="opacity" min="0" max="100" value="${Math.round((layer.opacity ?? 1) * 100)}" /></label>`;
  }
  function renderMultiProperties() {
    const list = selectedLayers();
    const all = type => list.every(layer => layer.type === type);
    const shapes = list.every(layer => ['rectangle','ellipse','star','triangle'].includes(layer.type));
    const common = (field, fallback) => {
      const values = list.map(layer => layer[field] ?? fallback);
      return values.every(value => value === values[0]) ? values[0] : null;
    };
    const number = (label, field, fallback = 0, min = 0, max = 2000) => `<label>${label}<input type="number" data-layer-field="${field}" value="${common(field,fallback) ?? ''}" placeholder="Mixed" min="${min}" max="${max}" /></label>`;
    const color = (label, field, fallback = '#000000') => `<label>${label}<span class="editor-hex-color"><input type="text" aria-label="${label} hex" data-layer-field="${field}" value="${common(field,fallback) || ''}" placeholder="Mixed" maxlength="7" spellcheck="false" /><input type="color" aria-label="${label} picker" data-layer-color="${field}" value="${common(field,fallback) || list[0][field] || fallback}" /></span></label>`;
    const alignPaths = {
      left:'M4 3v18 M8 6h12v4H8z M8 14h8v4H8z',
      center:'M12 2v20 M4 6h16v4H4z M7 14h10v4H7z',
      right:'M20 3v18 M4 6h12v4H4z M8 14h8v4H8z',
      top:'M3 4h18 M6 8h4v12H6z M14 8h4v8h-4z',
      middle:'M2 12h20 M6 4h4v16H6z M14 7h4v10h-4z',
      bottom:'M3 20h18 M6 4h4v12H6z M14 8h4v8h-4z',
    };
    const alignment = `<div class="editor-icon-field"><span>Align objects</span><div class="editor-object-alignment" role="group" aria-label="Align selected objects">${Object.entries(alignPaths).map(([action,path])=>`<button type="button" data-object-align="${action}" title="Align ${action}" aria-label="Align objects ${action}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg></button>`).join('')}</div></div>`;
    let shared = '';
    if (all('text')) {
      const family = common('font','ShopeeFont');
      shared = `<label>Font family<select data-layer-field="font">${family === null ? '<option value="" selected disabled>Mixed</option>' : ''}${fontNames.map(name=>`<option value="${name}" ${name===family?'selected':''}>${name}</option>`).join('')}<option value="custom" ${family && !fontNames.includes(family)?'selected':''}>More Google Fonts…</option></select></label>${family && !fontNames.includes(family)?`<label>Google Fonts family<input type="text" data-layer-field="customFont" value="${escapeHtml(family)}" /></label>`:''}
        ${weightField(list)}<div class="editor-property-row">${number('Font size','fontSize',36,8,200)}${color('Text colour','fill','#222222')}</div>
        <div class="editor-icon-field"><span>Style</span><div class="editor-icon-group" role="group" aria-label="Text style">${[['bold','B','Bold'],['italic','I','Italic'],['underline','U','Underline']].map(([field,icon,label])=>`<button type="button" data-layer-style="${field}" aria-label="${label}" aria-pressed="${common(field,false)===null?'mixed':common(field,false)}" class="${common(field,false)===true?'is-active':''}">${icon}</button>`).join('')}</div></div>
        <div class="editor-icon-field"><span>Text alignment</span><div class="editor-icon-group" role="group" aria-label="Text alignment">${[['flex-start','Left',2],['center','Centre',4.5],['flex-end','Right',7]].map(([value,label,x])=>`<button type="button" data-layer-align="${value}" aria-label="${label} align" aria-pressed="${common('align','center')===value}" class="${common('align','center')===value?'is-active':''}"><svg viewBox="0 0 24 24"><path d="M2 5h20 M${x} 10h15 M2 15h20 M${x} 20h15" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>`).join('')}</div></div>
        <div class="editor-property-row">${number('Horizontal spacing','letterSpacing',0,-50,200)}${number('Vertical spacing','lineSpacing',0,-50,200)}</div>`;
    } else if (shapes) {
      shared = `<div class="editor-property-row">${color('Fill colour','fill','#EE4D2D')}${color('Stroke colour','stroke','#FFFFFF')}</div><div class="editor-property-row">${number('Stroke width','strokeWidth',0,0,40)}${list.every(layer=>['rectangle','star','triangle'].includes(layer.type))?number('Corner radius','radius',0,0,150):''}${all('star')?number('Star points','points',5,3,16):''}</div>`;
    } else if (all('line')) {
      shared = `${color('Line colour','stroke','#222222')}<div class="editor-property-row">${number('Line weight (px)','strokeWidth',4,1,100)}${lineStyleField(common('lineStyle','solid'))}</div>`;
    }
    const category = all('text') ? 'text objects' : shapes ? 'shapes' : all('image') ? 'images' : all('line') ? 'lines' : 'objects';
    properties.innerHTML = `${groupControl()}<strong>${list.length} ${category} selected</strong>${alignment}${shared?'<div class="editor-property-divider"></div><span class="editor-bulk-label">Edit all selected</span>':''}${shared}<label>Opacity · ${common('opacity',1)===null?'Mixed':Math.round(common('opacity',1)*100)+'%'}<input type="range" data-layer-field="opacity" min="0" max="100" value="${Math.round((common('opacity',1) ?? 1)*100)}" /></label>`;
  }
  function alignSelection(action) {
    const list = selectedLayers();
    if (list.length < 2) return;
    finishInlineText();
    const bounds = boundsFor(list);
    for (const layer of list) {
      if (action === 'left') layer.x = bounds.x;
      if (action === 'center') layer.x = bounds.x + (bounds.w-layer.w)/2;
      if (action === 'right') layer.x = bounds.x + bounds.w-layer.w;
      if (action === 'top') layer.y = bounds.y;
      if (action === 'middle') layer.y = bounds.y + (bounds.h-layer.h)/2;
      if (action === 'bottom') layer.y = bounds.y + bounds.h-layer.h;
    }
    renderOutput(selected.output); updateProperties(); announceEdit();
  }
  function copySelection() {
    if (!selected) return;
    clipboard = { source:selected.output, layers:selectedLayers().map(({src,...layer}) => ({...layer})) };
  }
  function pasteSelection(target = activeOutput) {
    if (!clipboard?.layers?.length || !sizes[target]) return;
    const [sw,sh] = sizes[clipboard.source], [tw,th] = sizes[target];
    const scale = Math.min(tw/sw,th/sh), ox = (tw-sw*scale)/2, oy = (th-sh*scale)/2, groups = new Map();
    const pasted = clipboard.layers.map(layer => {
      let group = null;
      if (layer.group) { if (!groups.has(layer.group)) groups.set(layer.group,`group-${++groupSequence}`); group = groups.get(layer.group); }
      return {...layer, id:`layer-${++sequence}`, group, x:clamp(layer.x*scale+ox+10,0,tw-12), y:clamp(layer.y*scale+oy+10,0,th-12), w:clamp(layer.w*scale,layer.type==='line'?0:12,tw), h:clamp(layer.h*scale,layer.type==='line'?0:12,th), fontSize:layer.fontSize ? Math.max(8,layer.fontSize*scale) : undefined, src:layer.file instanceof Blob ? URL.createObjectURL(layer.file) : undefined};
    });
    layerMap.set(target,[...layersFor(target),...pasted]); selectLayers(target,pasted.map(layer => layer.id)); announceEdit();
  }
  function groupSelection() {
    const layers = selectedLayers(); if (layers.length < 2) return;
    const group = `group-${++groupSequence}`; layers.forEach(layer => layer.group = group);
    renderOutput(selected.output); announceEdit();
  }
  function ungroupSelection() {
    const groups = new Set(selectedLayers().map(layer => layer.group).filter(Boolean)); if (!groups.size) return;
    layersFor(selected.output).forEach(layer => { if (groups.has(layer.group)) delete layer.group; });
    renderOutput(selected.output); announceEdit();
  }
  function arrange(action) {
    if (!selectedIds.size) return;
    const id = selected.output, list = [...layersFor(id)];
    if (action === 'front' || action === 'back') {
      const moving = list.filter(layer => selectedIds.has(layer.id)), remaining = list.filter(layer => !selectedIds.has(layer.id));
      layerMap.set(id,action === 'front' ? [...remaining,...moving] : [...moving,...remaining]);
    } else {
      const forward = action === 'forward', indices = [...list.keys()]; if (forward) indices.reverse();
      indices.forEach(index => { const next = index + (forward ? 1 : -1); if (next >= 0 && next < list.length && selectedIds.has(list[index].id) && !selectedIds.has(list[next].id)) [list[index],list[next]] = [list[next],list[index]]; });
      layerMap.set(id,list);
    }
    renderOutput(id); announceEdit();
  }
  function deleteSelection() {
    if (!selectedIds.size) return;
    const id = selected.output;
    layersFor(id).filter(layer => selectedIds.has(layer.id)).forEach(layer => { if (layer.src?.startsWith('blob:')) URL.revokeObjectURL(layer.src); });
    layerMap.set(id,layersFor(id).filter(layer => !selectedIds.has(layer.id)));
    selectLayers(id,[]); announceEdit();
  }
  function runAction(action) {
    if (action === 'copy') copySelection();
    else if (action === 'paste') pasteSelection();
    else if (action === 'duplicate') { copySelection(); pasteSelection(); }
    else if (action === 'group') groupSelection();
    else if (action === 'ungroup') ungroupSelection();
    else if (['front','forward','backward','back'].includes(action)) arrange(action);
  }
  function showContextMenu(x,y) {
    document.querySelector('.blank-layer-context')?.remove();
    const menu = document.createElement('div'); menu.className = 'blank-layer-context'; menu.setAttribute('role','menu');
    menu.innerHTML = [['copy','Copy ⌘C'],['paste','Paste ⌘V'],['duplicate','Duplicate ⌘D'],['group','Group ⌘G'],['ungroup','Ungroup ⌘⇧G'],['front','Bring to front ⌘⇧]'],['forward','Bring forward ⌘]'],['backward','Send backward ⌘['],['back','Send to back ⌘⇧['],['delete','Delete']].map(([action,label]) => `<button type="button" data-layer-action="${action}">${label}</button>`).join('');
    document.body.append(menu); menu.style.left = `${Math.max(8,Math.min(x,innerWidth-menu.offsetWidth-8))}px`; menu.style.top = `${Math.max(8,Math.min(y,innerHeight-menu.offsetHeight-8))}px`;
    const close = event => { if (!menu.contains(event.target)) { menu.remove(); document.removeEventListener('pointerdown',close); } };
    setTimeout(() => document.addEventListener('pointerdown',close),0);
  }
  function paintPath(context, layer) {
    if (layer.type === 'rectangle') {
      context.beginPath();
      context.roundRect(layer.x, layer.y, layer.w, layer.h, clamp(layer.radius || 0, 0, Math.min(layer.w,layer.h)/2));
    } else if (layer.type === 'ellipse') {
      context.beginPath(); context.ellipse(layer.x + layer.w/2, layer.y + layer.h/2, layer.w/2, layer.h/2, 0, 0, Math.PI*2);
    } else if (layer.type === 'triangle' || layer.type === 'star') {
      const points = polygonPoints(layer);
      context.beginPath(); context.moveTo(layer.x + points[0][0], layer.y + points[0][1]);
      points.slice(1).forEach(point => context.lineTo(layer.x + point[0], layer.y + point[1])); context.closePath();
    }
  }
  function drawTextLine(context, line, x, y, maxWidth, spacing, underline, fontSize) {
    const chars = [...line], widths = chars.map(char => context.measureText(char).width);
    const total = widths.reduce((sum,value) => sum+value,0) + Math.max(0,chars.length-1)*spacing;
    const scale = total > maxWidth ? maxWidth/total : 1;
    const align = context.textAlign;
    let pen = align === 'left' ? x : align === 'right' ? x-total*scale : x-total*scale/2;
    context.save(); context.textAlign = 'left';
    chars.forEach((char,index) => { context.fillText(char,pen,y); pen += (widths[index]+spacing)*scale; });
    if (underline) { const thickness = Math.max(1,fontSize/18); context.fillRect(align === 'left' ? x : align === 'right' ? x-total*scale : x-total*scale/2,y+fontSize*.45,total*scale,thickness); }
    context.restore();
  }
  async function draw(context, id) {
    const layers = layersFor(id);
    if (!layers.length) return;
    const [width, height] = sizes[id];
    context.save();
    if (id === 'banner-card') { context.beginPath(); context.rect(0,0,width,height); context.clip(); }
    else if (id === 'skinny-banner' || id === 'pop-up-banner') {
      const box = id === 'skinny-banner' ? [46,39,1108,280] : [36,30,507,654];
      context.beginPath(); context.roundRect(...box, 30); context.clip();
    } else if (id === 'floating-icon') {
      context.beginPath(); context.arc(180,190,160,0,Math.PI*2); context.clip();
    }
    for (const layer of layers) {
      context.save(); context.globalAlpha = layer.opacity ?? 1;
      if (layer.type === 'image' && layer.src) {
        try {
          const image = await imageFromUrl(layer.src), crop = layer.crop || {x:0,y:0,w:1,h:1};
          context.drawImage(image, crop.x*image.naturalWidth, crop.y*image.naturalHeight, crop.w*image.naturalWidth, crop.h*image.naturalHeight, layer.x, layer.y, layer.w, layer.h);
        } catch (error) { console.warn('Blank layer image could not render', error); }
      } else if (layer.type === 'text') {
        context.fillStyle = layer.fill;
        const family = layer.font || 'ShopeeFont';
        try { await window.BrandMaxFonts.load(family,fontWeight(layer),layer.italic); } catch (error) { console.warn('Font could not load',error); }
        context.font = `${layer.italic ? 'italic ' : ''}${fontWeight(layer)} ${layer.fontSize}px "${family}", Arial, sans-serif`;
        context.textAlign = layer.align === 'flex-start' ? 'left' : layer.align === 'flex-end' ? 'right' : 'center';
        context.textBaseline = 'middle';
        const lines = String(layer.text).split('\n').slice(0, 20);
        const lineHeight = layer.fontSize * 1.15 + (layer.lineSpacing || 0);
        const firstY = layer.y + layer.h/2 - (lines.length-1)*lineHeight/2;
        const textX = layer.align === 'flex-start' ? layer.x : layer.align === 'flex-end' ? layer.x+layer.w : layer.x+layer.w/2;
        lines.forEach((line,index) => drawTextLine(context,line,textX,firstY+index*lineHeight,layer.w,layer.letterSpacing || 0,layer.underline,layer.fontSize));
      } else if (layer.type === 'sticker') {
        context.fillStyle = layer.fill || '#EE4D2D';
        if (layer.variant === 'burst') {
          const points = starPoints(layer.w,layer.h,12); context.beginPath();
          context.moveTo(layer.x+points[0][0],layer.y+points[0][1]);
          points.slice(1).forEach(([x,y]) => context.lineTo(layer.x+x,layer.y+y)); context.closePath();
        } else if (layer.variant === 'circle') { context.beginPath(); context.ellipse(layer.x+layer.w/2,layer.y+layer.h/2,layer.w/2,layer.h/2,0,0,Math.PI*2); }
        else { context.beginPath(); context.roundRect(layer.x,layer.y,layer.w,layer.h,Math.min(layer.w,layer.h)*.12); }
        context.fill();
        context.fillStyle = layer.textColor || '#FFFFFF'; context.font = `700 ${layer.fontSize || 28}px ShopeeFont, Arial, sans-serif`; context.textBaseline = 'middle'; context.textAlign = 'center';
        context.fillText(layer.text,layer.x+layer.w/2,layer.y+layer.h/2,layer.w*.78);
      } else if (layer.type === 'line') {
        context.strokeStyle = layer.stroke; context.lineWidth = layer.strokeWidth ?? 4; context.lineCap = 'round';
        context.setLineDash(lineDash(layer));
        context.beginPath(); context.moveTo(layer.flip ? layer.x+layer.w : layer.x,layer.y);
        context.lineTo(layer.flip ? layer.x : layer.x+layer.w,layer.y+layer.h); context.stroke();
      } else {
        if (layer.type === 'star' || layer.type === 'triangle') {
          context.translate(layer.x,layer.y);
          const path = new Path2D(roundedPolygon(layer));
          context.fillStyle = layer.fill; context.fill(path);
          if (layer.strokeWidth) { context.strokeStyle = layer.stroke; context.lineWidth = layer.strokeWidth; context.stroke(path); }
          context.restore(); continue;
        }
        paintPath(context, layer);
        context.fillStyle = layer.fill; context.fill();
        if (layer.strokeWidth) { context.strokeStyle = layer.stroke; context.lineWidth = layer.strokeWidth; context.stroke(); }
      }
      context.restore();
    }
    context.restore();
  }
  function reset() {
    textEdit = null; groupScope=null;
    for (const list of layerMap.values()) for (const layer of list) if (layer.src?.startsWith('blob:')) URL.revokeObjectURL(layer.src);
    layerMap.clear(); selected = null; selectedIds.clear(); chooseTool('select'); mount();
  }
  function snapshot() {
    return { layers:[...layerMap].map(([id,list]) => [id,list.map(({src,...layer}) => ({...layer}))]) };
  }
  function restore(saved = {}) {
    reset();
    for (const [id,list] of saved.layers || []) {
      if (!sizes[id] || !Array.isArray(list)) continue;
      const safe = list.filter(layer => layer && typeof layer === 'object' && ['rectangle','ellipse','triangle','star','line','text','image','sticker'].includes(layer.type)).map(layer => ({...layer, src:layer.file instanceof Blob ? URL.createObjectURL(layer.file) : undefined}));
      layerMap.set(id,safe);
      for (const layer of safe) {
        sequence = Math.max(sequence, Number(String(layer.id).replace('layer-','')) || 0);
        groupSequence = Math.max(groupSequence, Number(String(layer.group).replace('group-','')) || 0);
      }
    }
    mount();
  }
  function shouldBlockArtworkDrag(event) { return tool !== 'select' || Boolean(event.target.closest('.blank-custom-layer')) || (hasLayers(event.currentTarget?.dataset?.blankOutput || activeOutput) && !event.altKey); }
  toolbar.addEventListener('click', event => {
    const button = event.target.closest('[data-blank-tool]');
    if (button) {
      finishInlineText();
      toolbar.querySelector('.editor-shape-menu')?.removeAttribute('open');
      const previous = selected?.output;
      selected = null; selectedIds.clear(); groupScope=null;
      if (previous) renderOutput(previous);
      chooseTool(button.dataset.blankTool);
    }
  });
  toolbar.querySelector('.editor-shape-menu')?.addEventListener('toggle', event => {
    if (!event.target.open) return;
    const rect = event.target.getBoundingClientRect(), menu = event.target.querySelector('.editor-shape-popout');
    menu.style.left = `${rect.right + 12}px`; menu.style.top = `${Math.min(rect.top, innerHeight - 190)}px`;
  });
  targetSelect.addEventListener('change', () => {
    finishInlineText();
    const previous = selected?.output;
    activeOutput = targetSelect.value; selected = null; selectedIds.clear(); groupScope=null;
    if (previous) renderOutput(previous);
    updateProperties(); document.querySelector(`[data-blank-output="${activeOutput}"]`)?.scrollIntoView({block:'nearest',behavior:'smooth'});
  });
  properties.addEventListener('click', event => {
    if(event.target.closest('[data-exit-group]')){exitGroup();return;}
    const objectAlign = event.target.closest('[data-object-align]')?.dataset.objectAlign;
    if (objectAlign) { alignSelection(objectAlign); return; }
    const align = event.target.closest('[data-layer-align]')?.dataset.layerAlign;
    const style = event.target.closest('[data-layer-style]')?.dataset.layerStyle;
    const list = propertyLayers();
    if (list.length && (align || style)) {
      const nextStyle = style ? !list.every(layer => style==='bold'?fontWeight(layer)>=600:layer[style]) : false;
      list.forEach(layer => {
        if (align) layer.align = align;
        if (style) { layer[style] = nextStyle; if(style==='bold')layer.fontWeight=window.BrandMaxFonts.nearest(layer.font,nextStyle?700:400); loadLayerFont(layer); if (selected) fitTextGeometry(layer); }
      });
      if (selected) { renderOutput(selected.output); if(!['bold','italic'].includes(style))announceEdit(); }
      if(['bold','italic'].includes(style))finishFontEdit(list);
      updateProperties(); return;
    }
    const action = event.target.closest('[data-layer-action]')?.dataset.layerAction;
    if (action) runAction(action);
  });
  document.addEventListener('click', event => {
    const action = event.target.closest('.blank-layer-context [data-layer-action]')?.dataset.layerAction;
    if (action) { if (action === 'delete') deleteSelection(); else runAction(action); document.querySelector('.blank-layer-context')?.remove(); }
  });
  properties.addEventListener('change', event => {
    if (event.target.dataset.layerField === 'customFont') {
      const family = event.target.value.trim(), list = propertyLayers();
      if (list.length && /^[A-Za-z][A-Za-z0-9 ]{1,48}$/.test(family)) {
        list.forEach(layer => { layer.font = family; layer.fontWeight=fontWeight(layer); layer.bold=layer.fontWeight>=600;loadLayerFont(layer); if (selected) fitTextGeometry(layer); });
        if (selected) renderOutput(selected.output);
        finishFontEdit(list);
        updateProperties();
      }
      return;
    }
    const color = event.target.dataset.layerColor;
    if (color) {
      const field = properties.querySelector(`[data-layer-field="${color}"]`);
      if (field) { field.value = event.target.value.toUpperCase(); applyPropertyField(field); }
    }
    else applyPropertyField(event.target);
  });
  function applyPropertyField(target) {
    const field = target.dataset.layerField;
    const list = propertyLayers();
    if (!field || !list.length || target.value === '' || field === 'customFont') return;
    let value = target.value;
    if (['fill','stroke','textColor'].includes(field)) {
      value = target.value.startsWith('#') ? target.value : `#${target.value}`;
      if (!/^#[0-9a-fA-F]{6}$/.test(value)) return;
      value = value.toUpperCase();
      const picker = properties.querySelector(`[data-layer-color="${field}"]`);
      if (picker) picker.value = value;
    } else if (field === 'font') {
      value = value === 'custom' ? 'Nunito Sans' : value;
    } else if (field === 'lineStyle') {
      if (!['solid','dotted','dashed','dash-dot'].includes(value)) return;
    } else if (field !== 'text') {
      value = Number(value); if (!Number.isFinite(value)) return;
      if (field === 'opacity') value /= 100;
      else if (field === 'points') value = clamp(Math.round(value),3,16);
      else if (['w','h'].includes(field)) value = Math.max(list.every(layer=>layer.type==='line')?0:12,value);
      else if (field==='strokeWidth' && list.every(layer=>layer.type==='line')) value = clamp(value,1,100);
      else if (!['x','y','letterSpacing','lineSpacing'].includes(field)) value = Math.max(0,value);
    }
    for (const layer of list) {
      layer[field] = value;
      if(['font','fontWeight'].includes(field)) {layer.fontWeight=fontWeight(layer);layer.bold=layer.fontWeight>=600;loadLayerFont(layer);}
      if (field === 'stroke' && !layer.strokeWidth) {
        layer.strokeWidth = 2;
        const widthField = properties.querySelector('[data-layer-field="strokeWidth"]');
        if (widthField) widthField.value = '2';
      }
      if (selected && ['font', 'fontWeight', 'fontSize', 'letterSpacing', 'lineSpacing'].includes(field)) fitTextGeometry(layer);
    }
    if (field === 'opacity') target.closest('label').firstChild.textContent = `Opacity · ${target.value}%`;
    if (selected) {
      renderOutput(selected.output); if(!['font','fontWeight'].includes(field))announceEdit();
    }
    if(['font','fontWeight'].includes(field))finishFontEdit(list);
    if (['font','fontWeight'].includes(field)) updateProperties();
  }
  properties.addEventListener('input', event => {
    const color = event.target.dataset.layerColor;
    if (color) {
      const field = properties.querySelector(`[data-layer-field="${color}"]`);
      if (field) { field.value = event.target.value.toUpperCase(); applyPropertyField(field); }
    } else applyPropertyField(event.target);
  });
  imageInput.addEventListener('change', async () => {
    const file = imageInput.files?.[0]; if (!file) return;
    const id = activeOutput, [width,height] = sizes[id];
    const src = URL.createObjectURL(file);
    try {
      const image = await imageFromUrl(src);
      const scale = Math.min(width*.55/image.naturalWidth, height*.55/image.naturalHeight, 1);
      const w = image.naturalWidth*scale, h = image.naturalHeight*scale;
      const layer = {id:`layer-${++sequence}`,type:'image',x:(width-w)/2,y:(height-h)/2,w,h,opacity:1,file,src};
      layerMap.set(id,[...layersFor(id),layer]);
      selectLayer(id,layer); chooseTool('select'); announceEdit();
    } catch (error) { URL.revokeObjectURL(src); console.warn('Image could not be added',error); }
    imageInput.value = '';
  });
  document.addEventListener('keydown', event => {
    if (!document.documentElement.classList.contains('blank-mode') || event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    const mod = event.metaKey || event.ctrlKey, key = event.key.toLowerCase();
    if(event.key==='Escape'&&groupScope){event.preventDefault();exitGroup();}
    else if (mod && key === 'c' && selectedIds.size) { event.preventDefault(); copySelection(); }
    else if (mod && key === 'v') { event.preventDefault(); pasteSelection(); }
    else if (mod && key === 'd' && selectedIds.size) { event.preventDefault(); copySelection(); pasteSelection(); }
    else if (mod && key === 'g') { event.preventDefault(); if (event.shiftKey) ungroupSelection(); else groupSelection(); }
    else if (mod && (event.key === '[' || event.key === ']')) { event.preventDefault(); arrange(event.key === ']' ? (event.shiftKey ? 'front' : 'forward') : (event.shiftKey ? 'back' : 'backward')); }
    else if (!mod && ['Delete','Backspace'].includes(event.key) && selectedIds.size) { event.preventDefault(); deleteSelection(); }
  });
  document.addEventListener('pointerdown', event => {
    if (event.target.closest('.blank-design-frame, #blankPropertiesPanel, #blankDesignTools, .blank-layer-context, .canvas-view-controls')) return;
    finishInlineText();
    if (selected) { const id = selected.output; selected = null; selectedIds.clear(); groupScope=null; renderOutput(id); updateProperties(); }
  });
  window.BrandMaxDesignTools = Object.freeze({mount,draw,reset,restore,snapshot,hasLayers,shouldBlockArtworkDrag});
  mount();
})();
