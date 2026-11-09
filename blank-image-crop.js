/* Reversible image cropping. Integration:
   BrandMaxImageCrop.open({ src, crop: {x,y,w,h}, onApply(crop) {} })
   Coordinates are fractions of the original image, not canvas pixels.
   The original image is never changed. Cancel/Escape does not call onApply. */
(() => {
  'use strict';
  let current = null;
  const limit = (value, min, max) => Math.max(min, Math.min(max, value));
  const number = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  function normalise(value = {}) {
    const x = limit(number(value.x, 0), 0, .9999);
    const y = limit(number(value.y, 0), 0, .9999);
    return { x, y, w: limit(number(value.w, 1), .0001, 1 - x), h: limit(number(value.h, 1), .0001, 1 - y) };
  }
  function close() {
    if (!current) return;
    const session = current; current = null;
    session.observer?.disconnect();
    session.dialog.close(); session.dialog.remove();
    if (session.focusBefore?.isConnected) session.focusBefore.focus({ preventScroll: true });
  }
  async function open({ src, crop, onApply } = {}) {
    if (!src) throw new Error('An image source is required for cropping.');
    close();
    const dialog = document.createElement('dialog');
    dialog.className = 'blank-image-crop-dialog';
    dialog.setAttribute('aria-labelledby', 'blankCropTitle');
    dialog.setAttribute('aria-describedby', 'blankCropHelp');
    dialog.innerHTML = `
      <div class="blank-crop-header">
        <div><h2 id="blankCropTitle">Crop image</h2><p id="blankCropHelp">Drag a corner or edge to crop freely. Drag inside to reposition.</p></div>
        <button type="button" class="blank-crop-close" data-crop-action="cancel" aria-label="Close crop editor">×</button>
      </div>
      <div class="blank-crop-toolbar">
        <button type="button" data-crop-action="redraw" aria-pressed="false">Draw a new crop</button>
        <button type="button" data-crop-action="reset">Reset crop</button>
        <span class="blank-crop-dimensions" aria-live="polite"></span>
      </div>
      <div class="blank-crop-stage">
        <div class="blank-crop-loading" role="status">Loading image…</div>
        <div class="blank-crop-surface" hidden>
          <img alt="Original image for cropping" draggable="false" />
          <div class="blank-crop-selection" tabindex="0" role="group" aria-label="Crop selection. Use arrow keys to move; Shift moves faster.">
            <div class="blank-crop-grid" aria-hidden="true"></div>
          </div>
        </div>
      </div>
      <div class="blank-crop-error" role="alert" hidden></div>
      <div class="blank-crop-footer">
        <span>The original image is kept. You can crop it again later.</span>
        <button type="button" data-crop-action="cancel">Cancel</button>
        <button type="button" class="blank-crop-apply" data-crop-action="apply" disabled>Apply crop</button>
      </div>`;
    const surface = dialog.querySelector('.blank-crop-surface');
    const stage = dialog.querySelector('.blank-crop-stage');
    const image = surface.querySelector('img');
    const selection = dialog.querySelector('.blank-crop-selection');
    const applyButton = dialog.querySelector('[data-crop-action="apply"]');
    const redraw = dialog.querySelector('[data-crop-action="redraw"]');
    const session = { dialog, focusBefore: document.activeElement, crop: normalise(crop), drawing: false, ready: false };
    current = session;
    document.body.append(dialog);
    dialog.showModal();
    dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
    // Keep editor shortcuts and outside-click selection handlers out of this dialog.
    dialog.addEventListener('keydown', event => event.stopPropagation());
    dialog.addEventListener('pointerdown', event => event.stopPropagation());
    dialog.addEventListener('click', event => {
      const action = event.target.closest('[data-crop-action]')?.dataset.cropAction;
      if (action === 'cancel') close();
      if (!session.ready || current !== session) return;
      if (action === 'reset') { session.crop = {x:0,y:0,w:1,h:1}; setDrawing(false); update(); }
      if (action === 'redraw') setDrawing(!session.drawing);
      if (action === 'apply') {
        const result = { ...session.crop };
        try { onApply?.(result); close(); }
        catch (error) { const warning = dialog.querySelector('.blank-crop-error'); warning.hidden = false; warning.textContent = 'The crop could not be applied. Please try again.'; console.warn('Image crop could not apply', error); }
      }
    });
    function setDrawing(value) {
      session.drawing = value;
      surface.classList.toggle('is-drawing', value);
      redraw.setAttribute('aria-pressed', String(value));
    }
    function update() {
      const value = session.crop;
      selection.style.left = `${value.x*100}%`; selection.style.top = `${value.y*100}%`;
      selection.style.width = `${value.w*100}%`; selection.style.height = `${value.h*100}%`;
      dialog.querySelector('.blank-crop-dimensions').textContent = `${Math.round(value.w*image.naturalWidth)} × ${Math.round(value.h*image.naturalHeight)} px`;
    }
    function resize() {
      if (!session.ready || !surface.isConnected) return;
      const availableWidth = Math.max(120, stage.clientWidth-36);
      const availableHeight = Math.max(100, stage.clientHeight-36);
      const scale = Math.min(availableWidth/image.naturalWidth, availableHeight/image.naturalHeight, 1);
      surface.style.width = `${image.naturalWidth*scale}px`;
      surface.style.height = `${image.naturalHeight*scale}px`;
    }
    for (const direction of ['nw','n','ne','e','se','s','sw','w']) {
      const handle = document.createElement('span');
      handle.className = 'blank-crop-handle'; handle.dataset.cropDirection = direction;
      handle.setAttribute('aria-hidden', 'true'); selection.append(handle);
    }
    surface.addEventListener('pointerdown', event => {
      if (!session.ready || event.button !== 0) return;
      event.preventDefault(); event.stopPropagation();
      const bounds = surface.getBoundingClientRect();
      const point = e => ({x:limit((e.clientX-bounds.left)/bounds.width,0,1),y:limit((e.clientY-bounds.top)/bounds.height,0,1)});
      const start = point(event), original = { ...session.crop };
      const direction = event.target.closest('[data-crop-direction]')?.dataset.cropDirection;
      const mode = session.drawing ? 'draw' : direction ? 'resize' : event.target.closest('.blank-crop-selection') ? 'move' : 'draw';
      const minW = Math.min(1, Math.max(1/image.naturalWidth, 8/bounds.width));
      const minH = Math.min(1, Math.max(1/image.naturalHeight, 8/bounds.height));
      let changed = false;
      selection.focus({preventScroll:true});
      surface.setPointerCapture(event.pointerId);
      function move(moveEvent) {
        if (moveEvent.pointerId !== event.pointerId) return;
        const next = point(moveEvent), dx = next.x-start.x, dy = next.y-start.y;
        if (mode === 'move') {
          session.crop = {...original,x:limit(original.x+dx,0,1-original.w),y:limit(original.y+dy,0,1-original.h)};
        } else if (mode === 'draw') {
          let left = Math.min(start.x,next.x), top = Math.min(start.y,next.y);
          const width = Math.max(minW,Math.abs(next.x-start.x)), height = Math.max(minH,Math.abs(next.y-start.y));
          left = Math.min(left,1-width); top = Math.min(top,1-height);
          session.crop = {x:left,y:top,w:width,h:height};
        } else {
          let left = original.x, right = original.x+original.w, top = original.y, bottom = original.y+original.h;
          if (direction.includes('w')) left = limit(original.x+dx,0,right-minW);
          if (direction.includes('e')) right = limit(original.x+original.w+dx,left+minW,1);
          if (direction.includes('n')) top = limit(original.y+dy,0,bottom-minH);
          if (direction.includes('s')) bottom = limit(original.y+original.h+dy,top+minH,1);
          session.crop = {x:left,y:top,w:right-left,h:bottom-top};
        }
        changed = true; update();
      }
      function finish(finishEvent) {
        if (finishEvent.pointerId !== event.pointerId) return;
        surface.removeEventListener('pointermove',move); surface.removeEventListener('pointerup',finish); surface.removeEventListener('pointercancel',finish);
        if (surface.hasPointerCapture(event.pointerId)) surface.releasePointerCapture(event.pointerId);
        if (changed) setDrawing(false);
      }
      surface.addEventListener('pointermove',move); surface.addEventListener('pointerup',finish); surface.addEventListener('pointercancel',finish);
    });
    selection.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return;
      event.preventDefault(); event.stopPropagation();
      const value=session.crop, amount=event.shiftKey?10:1;
      if (event.key==='ArrowLeft') value.x=limit(value.x-amount/image.naturalWidth,0,1-value.w);
      if (event.key==='ArrowRight') value.x=limit(value.x+amount/image.naturalWidth,0,1-value.w);
      if (event.key==='ArrowUp') value.y=limit(value.y-amount/image.naturalHeight,0,1-value.h);
      if (event.key==='ArrowDown') value.y=limit(value.y+amount/image.naturalHeight,0,1-value.h);
      update();
    });
    try {
      await new Promise((resolve,reject) => { image.onload=resolve; image.onerror=reject; image.src=src; });
      if (current !== session) return;
      session.ready=true; surface.hidden=false; dialog.querySelector('.blank-crop-loading').hidden=true;
      applyButton.disabled=false;
      session.observer=new ResizeObserver(resize); session.observer.observe(stage);
      resize(); update(); selection.focus({preventScroll:true});
    } catch (error) {
      if (current !== session) return;
      dialog.querySelector('.blank-crop-loading').hidden=true;
      const warning=dialog.querySelector('.blank-crop-error'); warning.hidden=false; warning.textContent='This image could not be opened. Please upload it again.';
    }
  }
  window.BrandMaxImageCrop=Object.freeze({open,close,normalise});
})();
