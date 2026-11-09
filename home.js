/* BrandMax Creative workspace: template selection, guides, and local projects. */
(() => {
  'use strict';
  const store = window.BrandMaxProjectStore;
  const templates = [
    { id: 'Design 1', name: 'Design 1', description: 'Top message panel', image: 'assets/output-guides/banner-card.png', sample: 'assets/template-previews/design-1.png' },
    { id: 'Design 2', name: 'Design 2', description: 'Bottom message panel', image: 'assets/output-guides/banner-card.png', sample: 'assets/template-previews/design-2.png' },
    { id: 'Design 3', name: 'Design 3', description: 'Rounded message panel', image: 'assets/output-guides/banner-card.png', sample: 'assets/template-previews/design-3.png' },
    { id: 'Blank', name: 'Blank canvas', description: 'Keep the fixed Shopee Mall elements; add your artwork', image: 'assets/overlays/banner-card.png' },
  ];
  const formats = [
    { id: 'banner-card', name: 'Banner Card', size: '531 × 792 px', image: 'assets/output-guides/banner-card.png' },
    { id: 'pop-up-banner', name: 'Pop-up Banner', size: '580 × 720 px', image: 'assets/output-guides/popup.png' },
    { id: 'skinny-banner', name: 'Skinny Banner', size: '1200 × 360 px', image: 'assets/output-guides/skinny.png' },
    { id: 'floating-icon', name: 'Floating Icon', size: '360 × 360 px', image: 'assets/output-guides/floating.png' },
  ];
  const guides = [
    { id: 'bau', name: 'BAU', file: 'Guideline/Creative Guideline Brand Max 2026 - BAU (1).pdf' },
    { id: 'campaign', name: 'Campaign', file: 'Guideline/Creative Guideline Brand Max 2026 - CAMPAIGN.pdf' },
  ];
  const icons = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    projects: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m4 18 5-5 3 3 3-4 5 6"/>',
    guidelines: '<path d="M3 5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7m4 4v6m4-6v6"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .8-1.5 1.3-1.5 2.5M12 17h.01"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>',
    duplicate: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    rename: '<path d="M12 20h9M4 20l4.5-1 10-10a2 2 0 0 0-3-3l-10 10z"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  };
  const icon = (id) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[id]}</svg>`;
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const defaultEditorState = snapshotContext(state);
  const imageCache = new Map();
  const ui = { view: 'home', step: 1, template: 'Design 1', selected: new Set(['banner-card', 'pop-up-banner']), guideline: 'bau',
    projectId: null, projectName: 'Untitled project', folderId: null, search: '', listView: false, saveTimer: null, saveChain: Promise.resolve(), dirty: false, hasSaved: false, changeVersion: 0 };

  const shell = document.createElement('div');
  shell.id = 'homeShell';
  shell.innerHTML = `<aside class="bm-sidebar" aria-label="Main navigation"><button class="bm-logo-button" type="button" data-view="home" aria-label="BrandMax Creative home"><img src="assets/branding/home/brandmax-light.png" alt="BrandMax Creative" /></button><nav class="bm-nav">
    <button type="button" data-view="home">${icon('home')}<span>Home</span></button>
    <button type="button" data-view="projects">${icon('projects')}<span>Your Projects</span></button>
    <button type="button" data-view="guidelines">${icon('guidelines')}<span>Design Guidelines</span></button>
    <button type="button" data-view="trash">${icon('trash')}<span>Trash</span></button>
    <button type="button" data-view="help">${icon('help')}<span>Help</span></button></nav>
    <p class="bm-sidebar-note">Create once. Adapt for every placement.</p></aside>
    <div class="bm-main-wrap"><header class="bm-site-header"><div class="bm-header-actions"><img src="assets/branding/home/shopee-light.png" alt="Shopee" /><button type="button" class="bm-home-theme" aria-label="Switch to dark mode" title="Switch to dark mode"></button></div></header><main class="bm-main" id="bmMain"></main><div class="bm-toast" id="bmToast" role="status" aria-live="polite" hidden></div></div>`;
  document.body.prepend(shell);
  const main = shell.querySelector('#bmMain');
  const toast = shell.querySelector('#bmToast');
  const homeTheme = shell.querySelector('.bm-home-theme');
  function syncHomeTheme() {
    const dark = document.documentElement.getAttribute('data-theme') !== 'light';
    const brandmaxLogo = dark ? 'assets/branding/home/brandmax-dark.png' : 'assets/branding/home/brandmax-light.png';
    const shopeeLogo = dark ? 'assets/branding/home/shopee-dark.png' : 'assets/branding/home/shopee-light.png';
    shell.querySelector('.bm-logo-button img').src = window.BrandMaxResolveAsset?.(brandmaxLogo) || brandmaxLogo;
    shell.querySelector('.bm-header-actions img').src = window.BrandMaxResolveAsset?.(shopeeLogo) || shopeeLogo;
    homeTheme.innerHTML = icon(dark ? 'moon' : 'sun');
    homeTheme.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
    homeTheme.title = `Switch to ${dark ? 'light' : 'dark'} mode`;
    homeTheme.setAttribute('aria-pressed', String(dark));
  }
  homeTheme.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') !== 'light';
    applyTheme(isLight);
    try { localStorage.setItem('shopeeMallTheme', isLight ? 'light' : 'dark'); } catch (_) {}
    syncHomeTheme();
  });
  syncHomeTheme();
  const modal = document.createElement('div');
  modal.className = 'bm-modal-backdrop'; modal.hidden = true; document.body.append(modal);
  const editorBar = document.querySelector('.workflow-topbar');
  const editorThemeButton = document.querySelector('#themeToggle');
  const backButton = document.createElement('button');
  backButton.type = 'button'; backButton.className = 'bm-editor-back'; backButton.textContent = '← Projects';
  editorBar.querySelector('.workflow-brand').after(editorThemeButton);
  editorThemeButton.after(backButton);
  const editorName = document.createElement('button');
  editorName.type = 'button'; editorName.className = 'bm-editor-name'; editorName.title = 'Rename project';
  const saveButton = document.createElement('button');
  saveButton.type = 'button'; saveButton.className = 'bm-editor-save'; saveButton.textContent = 'Save project';
  editorBar.insertBefore(editorName, document.querySelector('#workflowDownload'));
  editorBar.insertBefore(saveButton, document.querySelector('#workflowDownload'));

  function notify(message, error = false) {
    toast.textContent = message; toast.classList.toggle('is-error', error); toast.hidden = false;
    clearTimeout(notify.timer); notify.timer = setTimeout(() => { toast.hidden = true; }, 4500);
  }
  function askUser({ title, message = '', value, choices, selectedValue = '', action = 'Save', danger = false }) {
    return new Promise(resolve => {
      const input = value !== undefined;
      const select = Array.isArray(choices);
      modal.innerHTML = `<form class="bm-modal" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}"><h2>${escapeHtml(title)}</h2>${message ? `<p>${escapeHtml(message)}</p>` : ''}${input ? `<label>Name<input name="answer" type="text" maxlength="100" value="${escapeHtml(value)}" required /></label>` : ''}${select ? `<label>Destination<select name="answer">${choices.map(item => `<option value="${escapeHtml(item.value)}" ${item.value === selectedValue ? 'selected' : ''}>${escapeHtml(item.label)}</option>`).join('')}</select></label>` : ''}<div class="bm-modal-actions"><button type="button" class="bm-secondary" data-cancel>Cancel</button><button type="submit" class="${danger ? 'bm-modal-danger' : 'bm-primary'}">${escapeHtml(action)}</button></div></form>`;
      modal.hidden = false;
      const form = modal.querySelector('form');
      const finish = result => { modal.hidden = true; modal.innerHTML = ''; document.removeEventListener('keydown', onKey); modal.removeEventListener('click', onBackdrop); resolve(result); };
      const onKey = event => { if (event.key === 'Escape') finish(null); };
      const onBackdrop = event => { if (event.target === modal) finish(null); };
      document.addEventListener('keydown', onKey); modal.addEventListener('click', onBackdrop);
      modal.querySelector('[data-cancel]').addEventListener('click', () => finish(null));
      form.addEventListener('submit', event => { event.preventDefault(); const answer = input ? form.elements.answer.value.trim() : select ? form.elements.answer.value : true; if (input && !answer) return; finish(answer); });
      requestAnimationFrame(() => (input || select ? form.elements.answer : form.querySelector('[type="submit"]')).focus());
    });
  }
  const templateImage = id => templates.find(item => item.id === id)?.image || 'assets/output-guides/banner-card.png';
  const sampleRegions = {
    'Design 1': { x: 0, y: 348, width: 509, height: 412 },
    'Design 2': { x: 0, y: 184, width: 509, height: 386 },
    'Design 3': { x: 0, y: 200, width: 509, height: 380 },
  };
  const previewImageCache = new Map();
  function loadPreviewImage(source) {
    if (!previewImageCache.has(source)) previewImageCache.set(source, new Promise((resolve, reject) => {
      const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error(`Preview image unavailable: ${source.slice(0, 80)}`));
      image.src = window.BrandMaxResolveAsset?.(source) || source;
    }));
    return previewImageCache.get(source);
  }
  function roundPreviewRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r); ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height); ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  function drawGenericBrand(ctx, template) {
    // Keep the complete photographed sample composition, but replace its
    // category-specific sample logo with a neutral brand example.
    if (template === 'Design 2') {
      const gradient = ctx.createLinearGradient(0, 100, 0, 180);
      gradient.addColorStop(0, '#00314c'); gradient.addColorStop(1, '#003a55');
      ctx.fillStyle = gradient; ctx.fillRect(147, 102, 218, 72);
      ctx.fillStyle = '#fff';
    } else {
      ctx.fillStyle = '#fff'; roundPreviewRect(ctx, 110, 87, 289, 98, 17); ctx.fill();
      ctx.fillStyle = template === 'Design 1' ? '#ee8f00' : '#57585a';
    }
    const markColor = ctx.fillStyle;
    ctx.save(); ctx.translate(template === 'Design 2' ? 168 : 142, 113);
    ctx.strokeStyle = markColor; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 36); ctx.lineTo(0, 2); ctx.lineTo(18, 2); ctx.quadraticCurveTo(33, 2, 33, 16); ctx.quadraticCurveTo(33, 27, 19, 27); ctx.lineTo(0, 27); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = template === 'Design 2' ? '#fff' : '#3f4145';
    ctx.font = '600 24px Arial, sans-serif'; ctx.textBaseline = 'middle';
    ctx.fillText('YOUR BRAND', template === 'Design 2' ? 213 : 190, 137);
  }
  function samplePhoto(image, template, outputId, context) {
    const box = getLayout(outputMeta[outputId], context).product;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(box.width); canvas.height = Math.round(box.height);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = context.skuBackgroundColor || '#f3f3f3'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const crop = sampleRegions[template];
    const scale = template === 'Design 1'
      ? Math.min(canvas.width / crop.width, canvas.height / crop.height)
      : Math.max(canvas.width / crop.width, canvas.height / crop.height);
    const width = crop.width * scale, height = crop.height * scale;
    ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
    return canvas;
  }
  const genericBrandLogo = (color) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="132" viewBox="0 0 480 132"><path d="M28 91V35h30c24 0 35 24 12 37 22 17 9 36-15 36H28" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><text x="108" y="90" fill="${color}" font-family="Arial,sans-serif" font-size="43" font-weight="700">YOUR BRAND</text></svg>`)}`;
  function sampleContext(template) {
    const context = snapshotContext(defaultEditorState);
    context.template = template;
    if (typeof DESIGN_TEMPLATE_DEFAULTS !== 'undefined' && DESIGN_TEMPLATE_DEFAULTS[template]) Object.assign(context, DESIGN_TEMPLATE_DEFAULTS[template]);
    context.ksp = 'EXCLUSIVE LAUNCH\nDISCOUNT 20%';
    context.hideLogoContainer = template === 'Design 2';
    context.brandLogoUrl = genericBrandLogo(template === 'Design 2' ? '#ffffff' : '#454545');
    context.previewLocalAssets = window.BrandMaxPreviewLocalAssets || {};
    context.exportLocalAssets = window.BrandMaxExportLocalAssets || {};
    return context;
  }
  const formatNames = ids => (ids || []).map(id => formats.find(item => item.id === id)?.name || id).join(', ');
  const projectSummary = project => formatNames(project.data?.selectedOutputs || [...(project.data?.standard?.outputs || [])]) || 'No formats selected';
  const dateLabel = timestamp => new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(timestamp || Date.now()));

  function renderHome() {
    const first = ui.step === 1;
    main.dataset.page = 'home';
    main.scrollTop = 0;
    main.innerHTML = `<section class="bm-welcome"><p class="bm-eyebrow">Welcome to Shopee BrandMax Creative</p><h1>${first ? 'Choose your design template' : 'Choose your banner formats'}</h1><p class="bm-subtitle">${first ? 'Choose a layout for your campaign. You can change it in the editor.' : 'Select every placement you need. You can add formats later.'}</p><div class="bm-steps" aria-label="Creation steps"><span class="${first ? 'is-current' : 'is-done'}">1 · Template</span><span class="${first ? '' : 'is-current'}">2 · Formats</span></div></section>
    <section class="bm-selection-panel" aria-label="${first ? 'Design templates' : 'Banner formats'}">${first ? `<div class="bm-template-grid">${templates.map(item => `<button type="button" class="bm-template-card ${ui.template === item.id ? 'is-selected' : ''}" data-template="${item.id}" aria-pressed="${ui.template === item.id}"><span class="bm-template-visual ${item.id === 'Blank' ? 'is-blank' : ''}"><img src="${item.image}" alt="${item.name} layout preview" /></span><strong>${item.name}</strong><small>${item.description}</small><span class="bm-card-check" aria-hidden="true">✓</span></button>`).join('')}</div><div class="bm-selection-actions"><button type="button" class="bm-primary" data-action="next">Continue to formats <span aria-hidden="true">→</span></button></div>` : `<p class="bm-panel-intro">Each preview shows the full placement. The design adapts to the selected format.</p><div class="bm-format-grid">${formats.map(item => `<button type="button" class="bm-format-card ${ui.selected.has(item.id) ? 'is-selected' : ''}" data-format="${item.id}" aria-pressed="${ui.selected.has(item.id)}"><span class="bm-card-check" aria-hidden="true">✓</span><span class="bm-format-image"><img src="${item.image}" data-format-preview="${item.id}" alt="${item.name} ${ui.template} full preview" /></span><strong>${item.name}</strong><small>${item.size}</small></button>`).join('')}</div><div class="bm-selection-actions"><button type="button" class="bm-secondary" data-action="previous">← Change template</button><button type="button" class="bm-primary" data-action="start" ${ui.selected.size ? '' : 'disabled'}>Start designing <span aria-hidden="true">→</span></button></div>`}</section>`;
    if (first) renderTemplatePreviews();
    else renderFormatPreviews();
  }
  function renderTemplatePreviews() {
    for (const item of templates) {
      const card = [...main.querySelectorAll('[data-template]')].find(element => element.dataset.template === item.id);
      const image = card?.querySelector('.bm-template-visual img');
      if (!image) continue;
      const canvas = document.createElement('canvas');
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `${item.name} generic layout preview`);
      const render = item.id === 'Blank' ? drawBlankFormatPreview('banner-card', canvas) : loadPreviewImage(item.sample).then(sample => {
        canvas.width = sample.naturalWidth; canvas.height = sample.naturalHeight;
        const ctx = canvas.getContext('2d'); ctx.drawImage(sample, 0, 0); drawGenericBrand(ctx, item.id);
      });
      render.then(() => { if (image.isConnected) image.replaceWith(canvas); })
        .catch(error => console.warn(`Could not render ${item.name} template preview`, error));
    }
  }
  async function drawBlankFormatPreview(outputId, canvas) {
    const format = formats.find(item => item.id === outputId);
    const [width, height] = format.size.match(/\d+/g).map(Number);
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    const overlays = window.BrandMaxMallOverlays || {};
    const sourceFor = key => overlays[key] || ({ 'banner-card':'assets/overlays/banner-card.png', 'skinny-blank':'assets/overlays/skinny-blank-overlay.png', 'floating-horizontal':'assets/overlays/floating-horizontal-overlay.png' })[key];
    ctx.fillStyle = '#f8f0f1';
    if (outputId === 'banner-card') {
      roundPreviewRect(ctx, 0, 0, width, height, 16); ctx.fill();
      ctx.drawImage(await loadPreviewImage(sourceFor('banner-card')), 0, 0, width, height);
    } else if (outputId === 'pop-up-banner') {
      roundPreviewRect(ctx, 36, 30, 507, 654, 30); ctx.fill();
      ctx.drawImage(await loadPreviewImage(sourceFor('popup-tag')), 129, 10, 323, 52);
      ctx.drawImage(await loadPreviewImage(sourceFor('popup-cta')), 90, 644, 399, 66);
    } else if (outputId === 'skinny-banner') {
      ctx.fillStyle = '#f1f1f1'; ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#f8f0f1'; roundPreviewRect(ctx, 46, 39, 1108, 280, 30); ctx.fill();
      ctx.drawImage(await loadPreviewImage(sourceFor('skinny-blank')), 0, 0, width, height);
    } else if (outputId === 'floating-icon') {
      ctx.fillStyle = '#f8f0f1'; ctx.beginPath(); ctx.arc(180, 190, 160, 0, 2 * Math.PI); ctx.fill();
      ctx.drawImage(await loadPreviewImage(sourceFor('floating-horizontal')), 0, 0, width, height);
    }
    ctx.fillStyle = '#9b9294'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = `700 ${outputId === 'skinny-banner' ? 41 : outputId === 'floating-icon' ? 24 : 30}px Arial,sans-serif`;
    ctx.fillText('YOUR DESIGN', width / 2, outputId === 'floating-icon' ? 220 : height / 2);
  }
  function renderFormatPreviews() {
    const template = ui.template;
    for (const item of formats) {
      const image = main.querySelector(`[data-format-preview="${item.id}"]`);
      if (!image) continue;
      const canvas = document.createElement('canvas');
      canvas.setAttribute('role', 'img');
      canvas.setAttribute('aria-label', `${item.name} ${template} full preview`);
      const render = template === 'Blank' ? drawBlankFormatPreview(item.id, canvas) : loadPreviewImage(templates.find(choice => choice.id === template).sample).then(sample => {
        const context = sampleContext(template);
        return drawOutput(item.id, canvas, { context, photoOverride: samplePhoto(sample, template, item.id, context) });
      });
      render.then(() => { if (image.isConnected) image.replaceWith(canvas); })
        .catch(error => console.warn(`Could not render ${item.name} choice preview`, error));
    }
  }

  function projectCard(project) {
    return `<article class="bm-project-card" draggable="true" data-project-drag="${project.id}"><button type="button" class="bm-project-image" data-action="open-project" data-id="${project.id}"><img src="${project.preview || templateImage(project.data?.template)}" alt="${escapeHtml(project.name)} preview" draggable="false" /></button><div class="bm-project-details"><div class="bm-project-info"><h2><button type="button" class="bm-inline-name" data-rename-name="project" data-id="${project.id}" title="Click to rename project">${escapeHtml(project.name)}</button></h2><time>${dateLabel(project.updatedAt)}</time><p>${escapeHtml(projectSummary(project))}</p></div><div class="bm-project-actions"><div class="bm-project-quick"><button type="button" data-action="download-project" data-id="${project.id}">Download backup</button><button type="button" class="bm-favorite ${project.favorite ? 'is-favorite' : ''}" data-action="favorite-project" data-id="${project.id}" aria-label="${project.favorite ? 'Remove' : 'Add'} ${escapeHtml(project.name)} ${project.favorite ? 'from' : 'to'} Favorites" aria-pressed="${Boolean(project.favorite)}" title="${project.favorite ? 'Remove from' : 'Add to'} Favorites">${icon('star')}</button><button type="button" data-action="duplicate-project" data-id="${project.id}" aria-label="Duplicate ${escapeHtml(project.name)}">${icon('duplicate')}</button><button type="button" data-action="trash-project" data-id="${project.id}" aria-label="Move ${escapeHtml(project.name)} to Trash">${icon('trash')}</button></div><button type="button" class="bm-open-project" data-action="open-project" data-id="${project.id}">Open project</button></div></div></article>`;
  }
  function folderCard(folder, count) {
    const label = `${count} project${count === 1 ? '' : 's'}`;
    return `<article class="bm-project-card bm-folder-project-card" data-folder-drop="${folder.id}"><button type="button" class="bm-project-image bm-folder-cover" data-action="open-folder" data-id="${folder.id}" aria-label="Open ${escapeHtml(folder.name)} folder">${icon('guidelines')}<span>${label}</span></button><div class="bm-project-details"><div class="bm-project-info"><h2><button type="button" class="bm-inline-name" data-rename-name="folder" data-id="${folder.id}" title="Click to rename folder">${escapeHtml(folder.name)}</button></h2><time>Updated ${dateLabel(folder.updatedAt)}</time><p>${label} inside this folder</p></div><div class="bm-project-actions"><div class="bm-project-quick"><button type="button" class="bm-favorite ${folder.favorite ? 'is-favorite' : ''}" data-action="favorite-folder" data-id="${folder.id}" aria-label="${folder.favorite ? 'Remove' : 'Add'} ${escapeHtml(folder.name)} ${folder.favorite ? 'from' : 'to'} Favorites" aria-pressed="${Boolean(folder.favorite)}" title="${folder.favorite ? 'Remove from' : 'Add to'} Favorites">${icon('star')}</button><button type="button" data-action="delete-folder" data-id="${folder.id}" aria-label="Delete ${escapeHtml(folder.name)} folder">${icon('trash')}</button></div><button type="button" class="bm-open-project" data-action="open-folder" data-id="${folder.id}">Open folder</button></div></div></article>`;
  }
  async function renderProjects() {
    const [projects, folders, usage] = await Promise.all([store.list(), store.listFolders(), store.usage().catch(() => ({}))]);
    if (ui.view !== 'projects') return;
    let folder = folders.find(item => item.id === ui.folderId);
    if (ui.folderId && !folder) { ui.folderId = null; folder = null; }
    const query = ui.search.trim().toLowerCase();
    const folderIds = new Set(folders.map(item => item.id));
    const shown = projects.filter(project => folder ? project.folderId === folder.id : !project.folderId || !folderIds.has(project.folderId))
      .filter(project => !query || `${project.name} ${projectSummary(project)}`.toLowerCase().includes(query))
      .sort((a,b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)) || (b.updatedAt || 0) - (a.updatedAt || 0));
    const shownFolders = folder ? [] : folders.filter(item => !query || item.name.toLowerCase().includes(query))
      .sort((a,b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite)) || a.name.localeCompare(b.name));
    const storage = usage.usage == null ? '' : ` Using ${(usage.usage / 1048576).toFixed(1)} MB of browser storage.`;
    main.innerHTML = `<section class="bm-library-header"><div><p class="bm-eyebrow">Your workspace</p><h1>${folder ? escapeHtml(folder.name) : 'Your Projects'}</h1><p>${folder ? 'Projects in this folder.' : 'Pick up where you left off, or start a new campaign.'}</p></div><div class="bm-library-actions">${folder ? '' : '<button type="button" class="bm-secondary" data-action="new-folder">+ New folder</button>'}<button type="button" class="bm-primary" data-action="new-project">+ New project</button></div></section>
      <div class="bm-library-tools"><label class="bm-search"><span aria-hidden="true">⌕</span><input id="bmSearch" type="search" placeholder="${folder ? 'Search this folder' : 'Search folders and projects'}" value="${escapeHtml(ui.search)}" aria-label="Search ${folder ? 'this folder' : 'folders and projects'}" /></label><div class="bm-view-toggle" role="group" aria-label="Project view"><button type="button" data-action="list-view" class="${ui.listView ? 'is-active' : ''}" aria-label="List view">☰</button><button type="button" data-action="grid-view" class="${ui.listView ? '' : 'is-active'}" aria-label="Grid view">▦</button></div></div>
      <p class="bm-storage-note">Drag a project onto a folder card to move it. Projects save here after your first edit; clearing site data can remove them. Download a backup to keep a copy.${storage}</p>
      ${folder ? `<div class="bm-breadcrumb"><button type="button" data-action="all-projects" data-folder-drop="">All projects</button><span aria-hidden="true">›</span><button type="button" class="bm-inline-name" data-rename-name="folder" data-id="${folder.id}" title="Click to rename folder">${escapeHtml(folder.name)}</button><button type="button" data-action="delete-folder" data-id="${folder.id}">Delete folder</button></div>` : ''}
      <div class="bm-project-grid ${ui.listView ? 'is-list' : ''}">${shownFolders.map(item => folderCard(item, projects.filter(project => project.folderId === item.id).length)).join('')}${shown.map(projectCard).join('')}</div>${shown.length || shownFolders.length ? '' : `<div class="bm-empty"><h2>${query ? 'No matching items' : folder ? 'This folder is empty' : 'No projects yet'}</h2><p>${query ? 'Try a different search.' : folder ? 'Create a project here, or move an existing project into this folder.' : 'Choose a template on Home to create your first project.'}</p><button type="button" class="bm-primary" data-action="new-project">Create a project</button></div>`}
      <input type="file" id="bmImportFile" accept=".json,application/json" hidden /><button type="button" class="bm-import-button" data-action="import-project">Import a project backup</button>`;
    // Earlier versions stored 180 px JPEGs. Rebuild their full-resolution
    // previews from the saved editable project, then migrate the preview only.
    for (const project of shown) {
      if (!project.preview || /^data:image\/jpeg[;,]/i.test(project.preview)) {
        refreshProjectPreview(project).catch(error => console.warn('Could not refresh project preview', error));
      }
    }
  }
  async function refreshProjectPreview(project) {
    const image = [...main.querySelectorAll('.bm-project-image[data-id] img')]
      .find(element => element.closest('[data-id]')?.dataset.id === project.id);
    if (!image) return;
    const data = project.data || {};
    const selected = Array.isArray(data.selectedOutputs) ? data.selectedOutputs
      : [...(data.standard?.outputs || ['banner-card'])];
    const mode = data.mode === 'blank' ? 'blank' : 'standard';
    const context = { ...(data.standard || defaultEditorState), previewLocalAssets: window.BrandMaxPreviewLocalAssets || {}, exportLocalAssets: window.BrandMaxExportLocalAssets || {} };
    const canvas = await projectPreviewCanvas(mode, data.blank || {}, selected, context);
    if (!image.isConnected || ui.view !== 'projects') return;
    canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', `${project.name} preview`);
    image.replaceWith(canvas);
    try { await store.upgradePreview(project.id, project.updatedAt, canvas.toDataURL('image/webp', .92)); }
    catch (error) { console.warn('Could not cache refreshed project preview', error); }
  }
  async function renderTrash() {
    const projects = await store.list({ onlyTrashed: true }); if (ui.view !== 'trash') return;
    main.innerHTML = `<section class="bm-library-header"><div><p class="bm-eyebrow">Recover or remove</p><h1>Trash</h1><p>Deleted projects stay here until you remove them permanently.</p></div><div class="bm-library-actions"><button type="button" class="bm-trash-delete-all" data-action="delete-all-trash" ${projects.length ? '' : 'disabled'} aria-label="Permanently delete all projects in Trash">Delete All</button></div></section><div class="bm-trash-list">${projects.map(project => `<article class="bm-trash-card"><img src="${project.preview || templateImage(project.data?.template)}" alt="" /><div><h2>${escapeHtml(project.name)}</h2><p>Deleted ${dateLabel(project.deletedAt)}</p></div><button type="button" data-action="restore-project" data-id="${project.id}">Restore</button><button type="button" class="bm-danger" data-action="delete-project" data-id="${project.id}">Delete permanently</button></article>`).join('')}</div>${projects.length ? '' : '<div class="bm-empty"><h2>Trash is empty</h2><p>Projects you delete will appear here.</p></div>'}`;
  }
  async function renderGuidelines() {
    const guide = guides.find(item => item.id === ui.guideline) || guides[0];
    main.innerHTML = `<section class="bm-library-header"><div><p class="bm-eyebrow">Design reference</p><h1>Design Guidelines</h1><p>Loading ${guide.name} PDF…</p></div></section>`;
    const resolved = await (window.BrandMaxLoadGuidelinePdf?.(guide.file) || window.BrandMaxResolveGuidelinePdf?.(guide.file) || guide.file);
    if (ui.view !== 'guidelines' || ui.guideline !== guide.id) return;
    const url = resolved.startsWith('blob:') || resolved.startsWith('data:') ? resolved : encodeURI(resolved);
    main.innerHTML = `<section class="bm-library-header"><div><p class="bm-eyebrow">Design reference</p><h1>Design Guidelines</h1><p>Read the original PDFs page by page. Scroll in the viewer to continue.</p></div></section><div class="bm-guide-tabs" role="tablist" aria-label="Guideline type">${guides.map(item => `<button type="button" role="tab" data-guide="${item.id}" aria-selected="${guide.id === item.id}" class="${guide.id === item.id ? 'is-active' : ''}">${item.name}</button>`).join('')}</div><section class="bm-document-panel"><div class="bm-document-toolbar"><strong>${guide.name} creative guideline</strong><a class="bm-open-pdf" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Open PDF ↗</a></div><div class="bm-document-frame"><iframe src="${escapeHtml(url)}#view=FitH" title="${guide.name} creative guideline PDF"></iframe></div></section>`;
  }
  function renderHelp() {
    main.innerHTML = `<section class="bm-library-header"><div><p class="bm-eyebrow">Make the most of BrandMax</p><h1>Help &amp; tips</h1><p>Everything you need to build, preview, and save a campaign.</p></div></section>
      <div class="bm-help-grid">
        <article><span>01 · START</span><h2>Choose your layout</h2><p>Pick Design 1–3 or Blank canvas, then select every banner format you need. You can change the template or add formats from the editor later.</p></article>
        <article><span>02 · ADD CONTENT</span><h2>Upload once, adapt everywhere</h2><p>Add your brand logo and SKU image in the left panel, then write a short key selling point (KSP). The same SKU image is used across all selected formats.</p></article>
        <article><span>03 · FINE-TUNE</span><h2>Check each placement</h2><p>Use the Logo, KSP, and SKU controls above a banner to adjust its layout and zoom. Logo size applies to every format; the banner previews show exactly what will download.</p></article>
        <article><span>04 · BLANK CANVAS</span><h2>Upload or build your design</h2><p>Upload artwork for each placement, or add shapes, text, lines, and images. Drag to select several objects, double-click text to edit, and right-click an object to change its layer order. Copy objects between banner formats from the Design Tools panel. The fixed Shopee Mall elements stay on top.</p></article>
        <article><span>05 · PREVIEW &amp; EXPORT</span><h2>See it in context</h2><p>Switch between Homepage and Pop-up preview where available. Scroll inside the phone to choose the visible area, then download its PNG. Download one banner from its card or use Download All.</p></article>
        <article><span>06 · SAVE &amp; ORGANISE</span><h2>Keep a backup</h2><p>Projects save in this browser after your first edit. Use folders to organise them, duplicate a project to explore a new idea, or restore one from Trash. Download a backup before clearing browser data.</p></article>
      </div>
      <section class="bm-help-callout"><h2>Tips for cleaner banners</h2><ul><li>Use a high-resolution PNG with a transparent background for the brand logo or product cutout.</li><li>Keep the KSP concise and readable; check it at phone size, especially on the Skinny Banner.</li><li>Leave space around the fixed Shopee Mall tag and the Pop-up call-to-action. Avoid placing important details at the artwork edges.</li><li>Open the BAU or Campaign PDF under Design Guidelines for placement rules and examples.</li></ul></section>
      <section class="bm-help-faq" aria-label="Common questions"><h2>Common questions</h2><details><summary>Why does my artwork look different across formats?</summary><p>Each placement has its own aspect ratio. Review every selected banner and adjust its controls before downloading.</p></details><details><summary>Will my projects appear on another computer?</summary><p>No. Projects are stored in this browser, not in an account. Download a project backup and import it on another device.</p></details><details><summary>Why is Download unavailable?</summary><p>A Blank canvas placement needs uploaded artwork or a design-tool element before downloading. Check that the format is selected and its preview has finished rendering.</p></details></section>`;
  }
  async function renderView() {
    shell.querySelectorAll('.bm-nav button').forEach(button => { const active = button.dataset.view === ui.view; button.classList.toggle('is-active', active); button.setAttribute('aria-current', active ? 'page' : 'false'); });
    main.dataset.page = ui.view;
    main.setAttribute('aria-busy', 'true');
    if (ui.view === 'home') renderHome();
    if (ui.view === 'projects') await renderProjects();
    if (ui.view === 'trash') await renderTrash();
    if (ui.view === 'guidelines') await renderGuidelines();
    if (ui.view === 'help') renderHelp();
    main.setAttribute('aria-busy', 'false');
  }
  async function navigate(view) {
    if (ui.view === 'editor') { clearTimeout(ui.saveTimer); if (ui.dirty) { try { await saveCurrent({ silent: true }); } catch (error) { notify(`Could not save this project: ${error.message}`, true); return; } } }
    ui.view = view; document.documentElement.classList.add('home-active'); shell.hidden = false; syncHomeTheme(); window.scrollTo(0, 0); main.scrollTop = 0; await renderView();
  }

  function blobToDataUrl(blob) { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(reader.error || new Error('Image could not be read.')); reader.readAsDataURL(blob); }); }
  async function persistable(value) {
    if (typeof value === 'string' && value.startsWith('blob:')) {
      if (!imageCache.has(value)) imageCache.set(value, fetch(value).then(response => response.blob()).then(blobToDataUrl));
      return imageCache.get(value);
    }
    if (value instanceof Set) return new Set(await Promise.all([...value].map(persistable)));
    if (Array.isArray(value)) return Promise.all(value.map(persistable));
    if (value && typeof value === 'object' && !(value instanceof Blob)) { const result = {}; for (const [key, item] of Object.entries(value)) result[key] = await persistable(item); return result; }
    return value;
  }
  function coverPreview(ctx, image, box) {
    const scale = Math.max(box.width / image.naturalWidth, box.height / image.naturalHeight);
    const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
    ctx.drawImage(image, box.x + (box.width - width) / 2, box.y + (box.height - height) / 2, width, height);
  }
  async function projectPreviewCanvas(mode, blank, selected, context) {
    const uploads = blank.uploads || [];
    if (mode === 'blank') {
      const toolLayers = blank.tools?.layers || [];
      const editedId = selected.find(id => uploads.some(entry => entry[0] === id) || toolLayers.some(entry => entry[0] === id && entry[1]?.length));
      const rendered = await window.BrandMaxBlankState?.renderCanvas(editedId || selected[0] || 'banner-card');
      if (rendered) return rendered;
    }
    const chosenUpload = selected.map(id => uploads.find(entry => entry[0] === id && entry[1] instanceof Blob))
      .find(Boolean) || uploads.find(entry => entry[1] instanceof Blob);
    const outputId = mode === 'blank' && chosenUpload ? chosenUpload[0] : selected[0] || 'banner-card';
    const canvas = document.createElement('canvas');
    if (mode !== 'blank') {
      await drawOutput(outputId, canvas, { context });
      return canvas;
    }
    if (!chosenUpload) { await drawBlankFormatPreview(outputId, canvas); return canvas; }
    const format = formats.find(item => item.id === outputId) || formats[0];
    const [width, height] = format.size.match(/\d+/g).map(Number);
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    const url = URL.createObjectURL(chosenUpload[1]);
    try {
      const design = await loadPreviewImage(url);
      const overlays = window.BrandMaxMallOverlays || {};
      if (outputId === 'banner-card') {
        coverPreview(ctx, design, { x: 0, y: 0, width, height });
        ctx.drawImage(await loadPreviewImage(overlays['banner-card'] || 'assets/overlays/banner-card.png'), 0, 0, width, height);
      } else {
        const box = outputId === 'pop-up-banner' ? { x: 36, y: 30, width: 507, height: 654 }
          : outputId === 'skinny-banner' ? { x: 46, y: 39, width: 1108, height: 280 }
          : { x: 20, y: 30, width: 320, height: 320 };
        ctx.save();
        if (outputId === 'floating-icon') { ctx.beginPath(); ctx.arc(180, 190, 160, 0, 2 * Math.PI); }
        else roundPreviewRect(ctx, box.x, box.y, box.width, box.height, 30);
        ctx.clip(); coverPreview(ctx, design, box); ctx.restore();
        if (outputId === 'pop-up-banner') {
          ctx.drawImage(await loadPreviewImage(overlays['popup-tag']), 129, 10, 323, 52);
          ctx.drawImage(await loadPreviewImage(overlays['popup-cta']), 90, 644, 399, 66);
        } else {
          const overlay = outputId === 'skinny-banner' ? overlays['skinny-blank'] || 'assets/overlays/skinny-blank-overlay.png'
            : overlays['floating-horizontal'] || 'assets/overlays/floating-horizontal-overlay.png';
          ctx.drawImage(await loadPreviewImage(overlay), 0, 0, width, height);
        }
      }
      return canvas;
    } finally { URL.revokeObjectURL(url); previewImageCache.delete(url); }
  }
  async function thumbnail(template, mode, blank, selected, context) {
    try {
      const canvas = await projectPreviewCanvas(mode, blank, selected, { ...context,
        previewLocalAssets: window.BrandMaxPreviewLocalAssets || {}, exportLocalAssets: window.BrandMaxExportLocalAssets || {} });
      return canvas.toDataURL('image/webp', .92);
    } catch (error) {
      console.warn('Project thumbnail could not be rendered', error);
      return templateImage(template);
    }
  }
  async function saveCurrent(options = {}) {
    if (!ui.projectId) return;
    if (!ui.dirty && !options.force) return;
    const id = ui.projectId, name = ui.projectName, folderId = ui.folderId;
    const savedVersion = ui.changeVersion;
    const context = snapshotContext(state);
    const mode = document.querySelector('#workflowCanvas').value === 'blank' ? 'blank' : 'standard';
    const selected = [...document.querySelectorAll('#workflowOutputMenu input:checked')].map(input => input.value);
    const blank = window.BrandMaxBlankState?.snapshot() || {};
    saveButton.textContent = 'Saving…';
    ui.saveChain = ui.saveChain.catch(() => {}).then(async () => {
      const preview = await thumbnail(context.template, mode, blank, selected, context);
      const data = { template: mode === 'blank' ? 'Blank' : context.template, mode, selectedOutputs: selected, standard: await persistable(context), blank };
      const record = await store.save({ id, name, data, folderId, preview });
      if (ui.projectId === id) {
        ui.hasSaved = true;
        if (ui.changeVersion === savedVersion) ui.dirty = false;
        saveButton.textContent = ui.dirty ? 'Unsaved changes' : 'Saved';
        if (!options.silent) notify('Project saved.');
      }
      return record;
    });
    return ui.saveChain;
  }
  function scheduleSave(event) {
    if (ui.view !== 'editor' || !ui.projectId) return;
    // Browsing an asset library or choosing which canvas to edit is not a
    // design change, so it must not create an otherwise untouched project.
    if (event?.target?.closest?.('#bgSearchInput, #bgCollectionSelect, #blankToolTarget, #blankToolImage')) return;
    ui.dirty = true; ui.changeVersion += 1;
    saveButton.textContent = 'Unsaved changes'; clearTimeout(ui.saveTimer);
    ui.saveTimer = setTimeout(() => saveCurrent({ silent: true }).catch(error => { saveButton.textContent = 'Save failed'; notify(`Project could not be saved: ${error.message}`, true); }), 1200);
  }
  function setSelectedOutputs(ids) {
    const checks = [...document.querySelectorAll('#workflowOutputMenu input[type="checkbox"]')]; const wanted = new Set(ids.length ? ids : ['banner-card']);
    checks.forEach(input => { input.checked = wanted.has(input.value); }); checks[0].dispatchEvent(new Event('change', { bubbles: true }));
  }
  function showEditor() {
    ui.view = 'editor'; shell.hidden = true; document.documentElement.classList.remove('home-active');
    document.querySelectorAll('.editor-accordion').forEach(section => { section.open = section.id === 'designToolsAccordion' && document.documentElement.classList.contains('blank-mode'); });
    editorName.textContent = ui.projectName; saveButton.textContent = ui.hasSaved ? 'Saved' : 'Save project'; window.scrollTo(0,0);
    requestAnimationFrame(() => { renderPreviews(); window.BrandMaxHomepagePreview?.refresh(); });
  }
  async function startProject() {
    if (!ui.selected.size) { notify('Choose at least one banner format.', true); return; }
    exitRowEditing(); restoreContext(state, defaultEditorState); window.BrandMaxBlankState?.reset();
    // Apply the chosen template's starting palette only for a brand-new
    // project. Subsequent switches inside the editor must retain the user's
    // design choices instead of replacing them with another preset.
    if (ui.template !== 'Blank' && DESIGN_TEMPLATE_DEFAULTS[ui.template]) {
      Object.assign(state, DESIGN_TEMPLATE_DEFAULTS[ui.template]);
      state.hideLogoContainer = ui.template === 'Design 2';
      const hsv = rgbToHsv(hexToRgb(state.kvColor));
      state.hue = hsv.h; state.saturation = hsv.s; state.value = hsv.v;
    }
    state.outputs = new Set(ui.selected); syncEditorFieldsFromContext();
    const select = document.querySelector('#templateSelect');
    if (ui.template !== 'Blank') { select.value = ui.template; select.dispatchEvent(new Event('change', { bubbles: true })); }
    const mode = document.querySelector('#workflowCanvas'); mode.value = ui.template === 'Blank' ? 'blank' : ui.template; mode.dispatchEvent(new Event('change', { bubbles: true }));
    setSelectedOutputs([...ui.selected]);
    ui.projectId = crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`; ui.projectName = 'Untitled project';
    ui.dirty = false; ui.hasSaved = false; ui.changeVersion = 0;
    showEditor();
  }
  async function openProject(id) {
    const record = await store.get(id); if (!record || record.deletedAt) throw new Error('Project not found.');
    exitRowEditing(); restoreContext(state, record.data?.standard || defaultEditorState);
    if (!templates.some(item => item.id === state.template)) state.template = 'Design 1';
    const mode = record.data?.mode === 'blank' ? 'blank' : state.template;
    document.querySelector('#templateSelect').value = state.template;
    const canvas = document.querySelector('#workflowCanvas'); canvas.value = mode; canvas.dispatchEvent(new Event('change', { bubbles: true }));
    syncEditorFieldsFromContext();
    setSelectedOutputs(record.data?.selectedOutputs || [...state.outputs]); window.BrandMaxBlankState?.restore(record.data?.blank || {});
    ui.projectId = record.id; ui.projectName = record.name; ui.folderId = record.folderId || null;
    ui.dirty = false; ui.hasSaved = true; ui.changeVersion = 0; showEditor();
  }
  async function renameCurrentProject() {
    if (!ui.projectId) return;
    const name = await askUser({ title:'Rename project', value:ui.projectName, action:'Rename' }); if (!name) return;
    ui.projectName = name; editorName.textContent = name; await saveCurrent({ force: true });
  }
  async function downloadBackup(id) {
    const record = await store.get(id); if (!record) throw new Error('Project not found.');
    const data = structuredClone(record.data || {});
    if (data.blank) {
      data.blank.uploads = await Promise.all((data.blank.uploads || []).map(async ([key,file]) => [key,{name:file.name || 'design.png',type:file.type,dataUrl:await blobToDataUrl(file)}]));
      if (data.blank.logoFile) { const file=data.blank.logoFile; data.blank.logoFile={name:file.name || 'logo.png',type:file.type,dataUrl:await blobToDataUrl(file)}; }
      if (data.blank.tools?.layers) data.blank.tools.layers = await Promise.all(data.blank.tools.layers.map(async ([id,layers]) => [id, await Promise.all(layers.map(async layer => layer.file instanceof Blob ? {...layer,file:{name:layer.file.name || 'layer.png',type:layer.file.type,dataUrl:await blobToDataUrl(layer.file)}} : layer))]));
    }
    if (data.standard?.outputs instanceof Set) data.standard.outputs = [...data.standard.outputs];
    const backup = { kind:'brandmax-creative-project',version:1,name:record.name,preview:record.preview,data };
    const file = new Blob([JSON.stringify(backup)], { type:'application/json' }); const link = document.createElement('a');
    link.href = URL.createObjectURL(file); link.download = `${record.name.replace(/[^a-z0-9 _-]/gi,'').trim() || 'brandmax-project'}.brandmax.json`;
    document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(link.href),30000);
  }
  async function importBackup(file) {
    const backup = JSON.parse(await file.text());
    if (backup.kind !== 'brandmax-creative-project' || backup.version !== 1 || !backup.data) throw new Error('This is not a BrandMax project backup.');
    const data = backup.data;
    if (data.standard && Array.isArray(data.standard.outputs)) data.standard.outputs = new Set(data.standard.outputs);
    if (data.blank) {
      data.blank.uploads = await Promise.all((data.blank.uploads || []).map(async ([key,upload]) => [key,new File([await (await fetch(upload.dataUrl)).blob()],upload.name || 'design.png',{type:upload.type || 'image/png'})]));
      if (data.blank.logoFile) { const upload=data.blank.logoFile; data.blank.logoFile=new File([await (await fetch(upload.dataUrl)).blob()],upload.name || 'logo.png',{type:upload.type || 'image/png'}); }
      if (data.blank.tools?.layers) data.blank.tools.layers = await Promise.all(data.blank.tools.layers.map(async ([id,layers]) => [id, await Promise.all(layers.map(async layer => layer.file?.dataUrl ? {...layer,file:new File([await (await fetch(layer.file.dataUrl)).blob()],layer.file.name || 'layer.png',{type:layer.file.type || 'image/png'})} : layer))]));
    }
    const safePreview = typeof backup.preview === 'string' && /^data:image\/(?:png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(backup.preview) ? backup.preview : templateImage(data.template);
    await store.save({ name:backup.name || 'Imported project',data,folderId:ui.folderId,preview:safePreview }); notify('Project imported.'); renderProjects();
  }

  function beginInlineRename(button) {
    const oldName = button.textContent.trim();
    const input = document.createElement('input');
    input.type = 'text'; input.className = 'bm-inline-name-input'; input.maxLength = 100;
    input.value = oldName; input.setAttribute('aria-label', `Rename ${button.dataset.renameName}`);
    button.replaceWith(input); input.focus(); input.select();
    let cancelled = false;
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') { event.preventDefault(); input.blur(); }
      if (event.key === 'Escape') { cancelled = true; input.blur(); }
    });
    input.addEventListener('blur', async () => {
      const name = input.value.trim();
      if (cancelled || !name || name === oldName) { input.replaceWith(button); return; }
      try {
        if (button.dataset.renameName === 'folder') await store.renameFolder(button.dataset.id, name);
        else await store.rename(button.dataset.id, name);
        await renderProjects();
      } catch (error) { input.replaceWith(button); notify(`Could not rename: ${error.message}`, true); }
    }, { once: true });
  }

  let draggedProjectId = null;
  function clearDropTargets() {
    shell.querySelectorAll('.is-drop-target, .is-dragging').forEach(element => element.classList.remove('is-drop-target', 'is-dragging'));
  }
  shell.addEventListener('dragstart', event => {
    const card = event.target.closest('[data-project-drag]');
    if (!card || ui.view !== 'projects') return;
    draggedProjectId = card.dataset.projectDrag;
    card.classList.add('is-dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggedProjectId);
  });
  shell.addEventListener('dragover', event => {
    const target = event.target.closest('[data-folder-drop]');
    if (!draggedProjectId || !target || ui.view !== 'projects') return;
    event.preventDefault(); event.dataTransfer.dropEffect = 'move';
    shell.querySelectorAll('.is-drop-target').forEach(element => { if (element !== target) element.classList.remove('is-drop-target'); });
    target.classList.add('is-drop-target');
  });
  shell.addEventListener('drop', async event => {
    const target = event.target.closest('[data-folder-drop]');
    if (!draggedProjectId || !target) return;
    event.preventDefault();
    const id = draggedProjectId, destination = target.dataset.folderDrop || null;
    draggedProjectId = null; clearDropTargets();
    try {
      const project = await store.get(id);
      if (!project || project.deletedAt) throw new Error('Project is no longer available.');
      if (destination && !(await store.listFolders()).some(folder => folder.id === destination)) throw new Error('Folder is no longer available.');
      if ((project.folderId || null) !== destination) {
        await store.moveToFolder(id, destination);
        notify(destination ? 'Project moved to folder.' : 'Project moved to All projects.');
        await renderProjects();
      }
    } catch (error) { notify(`Could not move project: ${error.message}`, true); }
  });
  shell.addEventListener('dragend', () => { draggedProjectId = null; clearDropTargets(); });

  shell.addEventListener('click', async event => {
    const nameButton = event.target.closest('[data-rename-name]');
    if (nameButton) { beginInlineRename(nameButton); return; }
    const view = event.target.closest('[data-view]');
    if (view) { if (view.dataset.view === 'home') { ui.folderId=null; ui.step=1; } if (view.dataset.view === 'projects') { ui.folderId=null; ui.search=''; } navigate(view.dataset.view).catch(error=>notify(error.message,true)); return; }
    const choice = event.target.closest('[data-template]'); if (choice) { ui.template=choice.dataset.template; renderHome(); return; }
    const format = event.target.closest('[data-format]'); if (format) { const id=format.dataset.format; ui.selected.has(id)?ui.selected.delete(id):ui.selected.add(id); renderHome(); return; }
    const guide = event.target.closest('[data-guide]'); if (guide) { ui.guideline=guide.dataset.guide; renderGuidelines().catch(error => notify(`Could not load the PDF: ${error.message}`, true)); return; }
    const button = event.target.closest('[data-action]'); if (!button) return;
    const action=button.dataset.action, id=button.dataset.id;
    try {
      if (action==='next') { ui.step=2; renderHome(); }
      else if (action==='previous') { ui.step=1; renderHome(); }
      else if (action==='start') await startProject();
      else if (action==='new-project') { ui.step=1; await navigate('home'); }
      else if (action==='new-folder') { const name=await askUser({title:'Create folder',value:'',action:'Create folder'}); if(name){await store.createFolder(name);renderProjects();} }
      else if (action==='open-folder') { ui.folderId=id; ui.search=''; renderProjects(); }
      else if (action==='all-projects') { ui.folderId=null; renderProjects(); }
      else if (action==='delete-folder') { const target=(await store.listFolders()).find(item=>item.id===id); if(target && await askUser({title:`Delete “${target.name}”?`,message:'Projects inside this folder will move to All projects. The folder itself will be deleted.',action:'Delete folder',danger:true})){await store.deleteFolder(id);ui.folderId=null;renderProjects();} }
      else if (action==='open-project') await openProject(id);
      else if (action==='favorite-folder') { const target=(await store.listFolders()).find(item=>item.id===id); if(target){await store.setFolderFavorite(id,!target.favorite);renderProjects();} }
      else if (action==='favorite-project') { const target=await store.get(id); if(target){await store.setFavorite(id,!target.favorite);renderProjects();} }
      else if (action==='duplicate-project') { await store.duplicate(id); notify('Project duplicated.'); renderProjects(); }
      else if (action==='trash-project') { const target=await store.get(id); if(target && await askUser({title:`Move “${target.name}” to Trash?`,message:'You can restore this project from Trash later.',action:'Move to Trash',danger:true})){await store.trash(id);notify('Project moved to Trash.');renderProjects();} }
      else if (action==='restore-project') { await store.restore(id);notify('Project restored.');renderTrash(); }
      else if (action==='delete-project') { if(await askUser({title:'Permanently delete project?',message:'This removes the project and artwork. It cannot be undone.',action:'Delete permanently',danger:true})){await store.permanentDeleteTrashed([id]);renderTrash();} }
      else if (action==='delete-all-trash') {
        const trashed = await store.list({ onlyTrashed: true });
        if (!trashed.length) { await renderTrash(); return; }
        const names = trashed.slice(0, 3).map(project => `“${project.name}”`).join(', ');
        const remaining = trashed.length > 3 ? ` and ${trashed.length - 3} more` : '';
        const confirmed = await askUser({ title: `Delete all ${trashed.length} projects in Trash?`, message: `Permanently delete ${names}${remaining} and their artwork? This cannot be undone. Projects outside Trash and folders are not affected.`, action: 'Delete All', danger: true });
        if (confirmed) {
          const deleted = await store.permanentDeleteTrashed(trashed.map(project => project.id));
          notify(`${deleted} project${deleted === 1 ? '' : 's'} permanently deleted.`);
          await renderTrash();
        }
      }
      else if (action==='download-project') await downloadBackup(id);
      else if (action==='import-project') main.querySelector('#bmImportFile')?.click();
      else if (action==='list-view') { ui.listView=true; renderProjects(); }
      else if (action==='grid-view') { ui.listView=false; renderProjects(); }
    } catch (error) { notify(error.message || 'Something went wrong.',true); }
  });
  shell.addEventListener('change', async event => {
    if (event.target.id==='bmImportFile' && event.target.files[0]) { try { await importBackup(event.target.files[0]); } catch(error){notify(`Import failed: ${error.message}`,true);} }
  });
  shell.addEventListener('input', event => {
    if (event.target.id==='bmSearch') { ui.search=event.target.value;const cursor=event.target.selectionStart;renderProjects().then(()=>{const field=main.querySelector('#bmSearch');field?.focus();field?.setSelectionRange(cursor,cursor);}); }
  });
  backButton.addEventListener('click',()=>navigate('projects'));
  document.querySelector('#bmOpenGuidelines')?.addEventListener('click', event => { event.preventDefault();navigate('guidelines').catch(error=>notify(error.message,true)); });
  editorName.addEventListener('click',()=>renameCurrentProject().catch(error=>notify(error.message,true)));
  saveButton.addEventListener('click',()=>saveCurrent({ force: true }).catch(error=>notify(error.message,true)));
  document.querySelector('.app-shell').addEventListener('input',scheduleSave,true);
  document.querySelector('.app-shell').addEventListener('change',scheduleSave,true);
  document.addEventListener('brandmax:edited', scheduleSave);
  editorBar.addEventListener('change',scheduleSave,true);
  renderView().catch(error=>notify(`Could not open the workspace: ${error.message}`,true));
})();
