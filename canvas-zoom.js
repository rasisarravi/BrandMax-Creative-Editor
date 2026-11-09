/* View-only canvas magnification. Artwork coordinates and exports never change. */
(() => {
  'use strict';
  const views = new Map();
  const waitingFrames = new Set();
  const visibilityObserver = new ResizeObserver(() => mount());
  const clamp = value => Math.max(.25, Math.min(3, value));
  function mount() {
    waitingFrames.forEach(frame => {
      if (!frame.isConnected || frame.clientWidth) {
        visibilityObserver.unobserve(frame);
        waitingFrames.delete(frame);
      }
    });
    document.querySelectorAll('.blank-canvas-shell').forEach(shell => {
      if (shell.dataset.zoomMounted) return;
      const frame = shell.querySelector('.blank-design-frame');
      if (!frame) return;
      if (!frame.clientWidth) {
        if (!waitingFrames.has(frame)) { waitingFrames.add(frame); visibilityObserver.observe(frame); }
        return;
      }
      shell.dataset.zoomMounted = 'true';
      const id = frame.dataset.blankOutput;
      const baseWidth = frame.clientWidth, baseHeight = frame.clientHeight;
      const viewport = document.createElement('div'); viewport.className = 'canvas-zoom-viewport';
      viewport.style.height = `${Math.min(640, baseHeight + 48)}px`;
      const surface = document.createElement('div'); surface.className = 'canvas-zoom-surface';
      shell.append(viewport); viewport.append(surface); surface.append(frame);
      frame.style.width = `${baseWidth}px`; frame.style.height = `${baseHeight}px`;
      frame.style.minHeight = '0'; frame.style.maxWidth = 'none'; frame.style.margin = '0';
      frame.style.position = 'absolute'; frame.style.transformOrigin = 'top left';
      const controls = document.createElement('div'); controls.className = 'canvas-view-controls';
      controls.setAttribute('role', 'group'); controls.setAttribute('aria-label', 'Canvas view zoom');
      controls.innerHTML = '<button type="button" data-view-zoom="out" aria-label="Zoom out">−</button><output aria-live="polite"></output><button type="button" data-view-zoom="in" aria-label="Zoom in">+</button><button type="button" data-view-zoom="fit">Fit</button><button type="button" data-view-zoom="actual" title="View at original editor size">100%</button>';
      shell.append(controls);
      let zoom = views.get(id) || Math.min(1, (viewport.clientWidth - 48) / baseWidth, (viewport.clientHeight - 48) / baseHeight);
      function apply(next, anchor) {
        const oldZoom = zoom;
        const oldLeft = Number.parseFloat(frame.style.left) || 0, oldTop = Number.parseFloat(frame.style.top) || 0;
        const point = anchor || { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 };
        const artX = (viewport.scrollLeft + point.x - oldLeft) / oldZoom;
        const artY = (viewport.scrollTop + point.y - oldTop) / oldZoom;
        zoom = clamp(next); views.set(id, zoom);
        const width = Math.max(viewport.clientWidth, baseWidth * zoom + 48);
        const height = Math.max(viewport.clientHeight, baseHeight * zoom + 48);
        const left = (width - baseWidth * zoom) / 2, top = (height - baseHeight * zoom) / 2;
        surface.style.width = `${width}px`; surface.style.height = `${height}px`;
        frame.style.left = `${left}px`; frame.style.top = `${top}px`;
        frame.style.transform = `scale(${zoom})`;
        frame.dataset.viewZoom = String(zoom);
        controls.querySelector('output').textContent = `${Math.round(zoom * 100)}%`;
        controls.querySelector('[data-view-zoom="out"]').disabled = zoom <= .25;
        controls.querySelector('[data-view-zoom="in"]').disabled = zoom >= 3;
        viewport.scrollLeft = left + artX * zoom - point.x;
        viewport.scrollTop = top + artY * zoom - point.y;
      }
      controls.addEventListener('click', event => {
        const action = event.target.closest('[data-view-zoom]')?.dataset.viewZoom;
        if (!action) return;
        if (action === 'fit') apply(Math.min(1, (viewport.clientWidth - 48) / baseWidth, (viewport.clientHeight - 48) / baseHeight));
        else if (action === 'actual') apply(1);
        else apply(zoom + (action === 'in' ? .25 : -.25));
      });
      viewport.addEventListener('wheel', event => {
        if (!event.ctrlKey && !event.metaKey) return;
        event.preventDefault();
        const rect = viewport.getBoundingClientRect();
        apply(zoom * Math.exp(-event.deltaY * .005), {x:event.clientX - rect.left,y:event.clientY - rect.top});
      }, { passive:false });
      apply(zoom);
    });
  }
  window.BrandMaxCanvasZoom = Object.freeze({ mount });
})();
