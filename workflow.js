(() => {
  const template = document.querySelector('#templateSelect');
  const templateMode = document.querySelector('#workflowCanvas');
  const outputToggle = document.querySelector('#workflowOutputToggle');
  const outputMenu = document.querySelector('#workflowOutputMenu');
  const outputSummary = document.querySelector('#workflowOutputSummary');
  const outputChecks = [...outputMenu.querySelectorAll('input[type="checkbox"]')];
  const blankCard = document.querySelector('#blankCanvasCard');
  const blankStack = document.querySelector('#blankPreviewStack');
  const download = document.querySelector('#workflowDownload');
  const originalDownload = document.querySelector('#downloadAllButton');
  const reviewPreview = document.querySelector('#reviewPreview');
  const reviewStatus = document.querySelector('#reviewStatus');
  const reviewerHeading = document.querySelector('.review-panel > h2:first-of-type');
  const reviewerBox = document.querySelector('.review-panel > .review-box');
  const reviewerGuidelines = document.querySelector('#bmOpenGuidelines');
  const reviewButton = document.querySelector('#startReview');
  const exactMallOverlays = window.BrandMaxMallOverlays || {};
  // Reviewer is no longer an editor feature. Retain the old nodes only as
  // inert compatibility anchors for older project files and integrations.
  [reviewerHeading, reviewerBox, reviewerGuidelines, reviewPreview].forEach(node => { if (node) node.hidden = true; });
  if (reviewButton) reviewButton.disabled = true;
  document.querySelector('.review-panel')?.setAttribute('aria-label', 'Canvas properties and design preview');

  const outputs = {
    'banner-card': { title: 'Banner Card', meta: '531 x 792px', width: '375px', ratio: '531 / 792', canvasWidth: 531, canvasHeight: 792, overlay: exactMallOverlays['banner-card'] || 'Template/Shopee%20Mall%20tag%20Overlay/Mall%20BAU%20Template_Mall_BAU_26-29mei_Banner%20Card_01%20copy.png' },
    'pop-up-banner': { title: 'Pop Up Banner', meta: '580 x 720px', width: '390px', ratio: '580 / 720', canvasWidth: 580, canvasHeight: 720, designBox: { x: 36, y: 30, width: 507, height: 654 }, mallTag: exactMallOverlays['popup-tag'] || 'Template/Pop%20Up%20Banner/Blank/Pop-Up-template-shopee-mall-tag.png', cta: exactMallOverlays['popup-cta'] || 'Template/Pop%20Up%20Banner/Blank/Pop-Up-template-CTA.png' },
    'skinny-banner': { title: 'Skinny Banner', meta: '1200 x 360px', width: '720px', ratio: '1200 / 360', canvasWidth: 1200, canvasHeight: 360, designBox: { x: 46, y: 39, width: 1108, height: 280 }, overlay: exactMallOverlays['skinny-blank'] || 'assets/overlays/skinny-blank-overlay.png' },
    'floating-icon': { title: 'Floating Icon', meta: '360 x 360px', width: '360px', ratio: '1 / 1', canvasWidth: 360, canvasHeight: 360, designBox: { x: 20, y: 30, width: 320, height: 320 }, overlay: exactMallOverlays['floating-horizontal'] || 'assets/overlays/floating-horizontal-overlay.png' }
  };
  const blankUploads = new Map();
  const blankEdits = new Map();
  const imageLayoutCallbacks = new WeakMap();
  const imageLayoutObserver = new ResizeObserver(entries => entries.forEach(({target}) => imageLayoutCallbacks.get(target)?.()));
  const canvasOverlayCache = new Map();
  let reviewedOutputId = null;
  let reviewGeneration = 0;
  let floatingBlankLogoRatio = 'horizontal';
  let floatingBlankLogo = null;
  let floatingBlankLogoScale = 100;
  const blankHistory = { past: [], future: [], current: null, restoring: false };
  const blobHistoryIds = new WeakMap();
  let nextBlobHistoryId = 0;
  const selectedOutputs = () => outputChecks.filter((input) => input.checked).map((input) => input.value);
  const editFor = (id) => blankEdits.get(id) || { scale: 0, x: 0, y: 0 };
  const setEdit = (id, edit) => blankEdits.set(id, edit);
  const cropFor = (edit) => {
    const crop = edit?.crop || {};
    const x = Math.max(0, Math.min(.99, Number(crop.x) || 0));
    const y = Math.max(0, Math.min(.99, Number(crop.y) || 0));
    return { x, y, w: Math.max(.01, Math.min(1 - x, Number(crop.w) || 1)), h: Math.max(.01, Math.min(1 - y, Number(crop.h) || 1)) };
  };
  const loadImage = (src) => new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = src; });
  const roundedRectPath = (context, x, y, width, height, radius) => {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + width - r, y);
    context.quadraticCurveTo(x + width, y, x + width, y + r);
    context.lineTo(x + width, y + height - r);
    context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    context.lineTo(x + r, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - r);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
  };

  async function loadOriginalOverlayForCanvas(item, visibleOverlay) {
    if (canvasOverlayCache.has(item.overlay)) return canvasOverlayCache.get(item.overlay);
    try {
      /* Fetch the supplied PNG and use its own binary data. The asset is not
         recreated or altered; this simply makes the exact official overlay
         safe for canvas-based review and PNG export. */
      const response = await fetch(item.overlay);
      if (!response.ok) throw new Error('Overlay unavailable');
      const overlayData = await response.blob();
      const overlayUrl = URL.createObjectURL(overlayData);
      const overlay = await loadImage(overlayUrl);
      canvasOverlayCache.set(item.overlay, overlay);
      return overlay;
    } catch {
      if (visibleOverlay?.complete && visibleOverlay.naturalWidth) return visibleOverlay;
      return loadImage(item.overlay);
    }
  }

  function showReview(message) {
    // Export errors remain visible even though the reviewer was removed.
    let status = blankCard.querySelector('.blank-operation-status');
    if (!status) {
      status = document.createElement('p'); status.className = 'blank-operation-status';
      status.setAttribute('role', 'status'); blankCard.prepend(status);
    }
    status.textContent = message;
  }

  function createBlankArtworkCanvas(id, includeOverlay = true) {
    const upload = blankUploads.get(id);
    const item = outputs[id];
    if (!item || (!upload && !window.BrandMaxDesignTools?.hasLayers(id))) return Promise.resolve(null);
    const frame = document.querySelector(`[data-blank-output="${id}"]`);
    const visibleDesign = frame?.querySelector('.blank-design-preview');
    const visibleOverlay = frame?.querySelector('.blank-mall-tag');
    const waitForVisibleImage = (image, fallbackSource) => {
      if (image?.complete && image.naturalWidth) return Promise.resolve(image);
      if (!image) return loadImage(fallbackSource);
      return new Promise((resolve, reject) => {
        image.addEventListener('load', () => resolve(image), { once: true });
        image.addEventListener('error', () => reject(new Error('Image unavailable')), { once: true });
      });
    };
    if (item.designBox) {
      const overlays = includeOverlay
        ? (item.overlay
          ? Promise.all([loadImage(item.overlay), Promise.resolve(null)])
          : Promise.all([loadImage(item.mallTag), loadImage(item.cta)]))
        : Promise.resolve([]);
      const logoSource = item.title === 'Floating Icon' ? floatingBlankLogo?.url : '';
      return Promise.all([upload ? waitForVisibleImage(visibleDesign, upload.url) : Promise.resolve(null), overlays, logoSource ? loadImage(logoSource) : Promise.resolve(null)]).then(async ([design, [mallTag, cta], logo]) => {
        const canvas = document.createElement('canvas');
        canvas.width = item.canvasWidth;
        canvas.height = item.canvasHeight;
        const context = canvas.getContext('2d');
        if (id === 'skinny-banner') {
          // The supplied guide is immutable; its transparent center reveals
          // artwork, while this base makes every exported Skinny pixel opaque.
          context.fillStyle = '#F1F1F1';
          context.fillRect(0, 0, canvas.width, canvas.height);
        }
        const box = item.designBox;
        if (design) {
          const crop = cropFor(editFor(id));
          const sourceWidth = design.naturalWidth * crop.w, sourceHeight = design.naturalHeight * crop.h;
          const baseScale = Math.max(box.width / sourceWidth, box.height / sourceHeight);
          const scale = baseScale * (1 + editFor(id).scale / 100);
          const width = sourceWidth * scale;
          const height = sourceHeight * scale;
          const edit = editFor(id);
          const x = box.x + (box.width - width) / 2 + edit.x / (frame?.clientWidth || canvas.width) * canvas.width;
          const y = box.y + (box.height - height) / 2 + edit.y / (frame?.clientHeight || canvas.height) * canvas.height;
          context.save();
          // The fixed overlay supplies the visible rounded boundary. The clip
          // prevents user artwork from crossing into its surrounding chrome.
          if (item.title === 'Floating Icon') {
            context.beginPath();
            context.arc(180, 190, 160, 0, Math.PI * 2);
          } else {
            roundedRectPath(context, box.x, box.y, box.width, box.height, 30);
          }
          context.clip();
          context.drawImage(design, design.naturalWidth * crop.x, design.naturalHeight * crop.y, sourceWidth, sourceHeight, x, y, width, height);
          context.restore();
        }
        await window.BrandMaxDesignTools?.draw(context, id);
        if (item.overlay && mallTag) {
          context.drawImage(mallTag, 0, 0, canvas.width, canvas.height);
        } else if (mallTag && cta) {
          context.drawImage(mallTag, 129, 10, 323, 52);
          context.drawImage(cta, 90, 644, 399, 66);
        }
        if (item.title === 'Floating Icon' && logo) {
          const logoBox = floatingBlankLogoRatio === 'square'
            ? { x: 132, y: 20, width: 96, height: 80 }
            : { x: 61, y: 20, width: 238, height: 80 };
          const logoScale = Math.min(logoBox.width / logo.naturalWidth, logoBox.height / logo.naturalHeight) * 0.84 * (floatingBlankLogoScale / 100);
          const logoWidth = logo.naturalWidth * logoScale;
          const logoHeight = logo.naturalHeight * logoScale;
          context.drawImage(logo, logoBox.x + (logoBox.width - logoWidth) / 2, logoBox.y + (logoBox.height - logoHeight) / 2, logoWidth, logoHeight);
        }
        return canvas;
      });
    }
    /* Use the images already rendered inside the selected preview. This keeps
       review and export aligned with what the user sees, including the overlay. */
    const images = includeOverlay
      ? Promise.all([upload ? waitForVisibleImage(visibleDesign, upload.url) : Promise.resolve(null), loadOriginalOverlayForCanvas(item, visibleOverlay)])
      : Promise.all([upload ? waitForVisibleImage(visibleDesign, upload.url) : Promise.resolve(null)]);
    return images.then(async ([design, overlay]) => {
      const canvas = document.createElement('canvas');
      canvas.width = item.canvasWidth;
      canvas.height = item.canvasHeight;
      const context = canvas.getContext('2d');
      if (design) {
        const crop = cropFor(editFor(id));
        const sourceWidth = design.naturalWidth * crop.w, sourceHeight = design.naturalHeight * crop.h;
        const baseScale = Math.max(canvas.width / sourceWidth, canvas.height / sourceHeight);
        const scale = baseScale * (1 + editFor(id).scale / 100);
        const width = sourceWidth * scale;
        const height = sourceHeight * scale;
        const edit = editFor(id);
        const x = (canvas.width - width) / 2 + edit.x / (frame?.clientWidth || canvas.width) * canvas.width;
        const y = (canvas.height - height) / 2 + edit.y / (frame?.clientHeight || canvas.height) * canvas.height;
        context.drawImage(design, design.naturalWidth * crop.x, design.naturalHeight * crop.y, sourceWidth, sourceHeight, x, y, width, height);
      }
      await window.BrandMaxDesignTools?.draw(context, id);
      if (overlay) context.drawImage(overlay, 0, 0, canvas.width, canvas.height);
      return canvas;
    });
  }

  function visualSuggestions(canvas, item) {
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    const stride = Math.max(4, Math.floor(Math.sqrt((canvas.width * canvas.height) / 18000)) * 4);
    let samples = 0, lightAreas = 0, lowContrastLight = 0, saturated = 0, luminanceTotal = 0, luminanceSquared = 0, edges = 0;
    let previousLuminance = null;
    for (let i = 0; i < data.length; i += stride) {
      const red = data[i], green = data[i + 1], blue = data[i + 2];
      const highest = Math.max(red, green, blue), lowest = Math.min(red, green, blue);
      const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
      samples += 1;
      luminanceTotal += luminance;
      luminanceSquared += luminance * luminance;
      if (red > 242 && green > 242 && blue > 242) lightAreas += 1;
      if (Math.abs(red - 241) < 14 && Math.abs(green - 241) < 14 && Math.abs(blue - 241) < 14) lowContrastLight += 1;
      if (highest - lowest > 72) saturated += 1;
      if (previousLuminance !== null && Math.abs(luminance - previousLuminance) > 45) edges += 1;
      previousLuminance = luminance;
    }
    const lightRatio = lightAreas / samples;
    const lowContrastLightRatio = lowContrastLight / samples;
    const saturationRatio = saturated / samples;
    const contrast = Math.sqrt(Math.max(0, luminanceSquared / samples - (luminanceTotal / samples) ** 2));
    const edgeRatio = edges / samples;
    const findings = [];
    if (lightRatio > .5 || lowContrastLightRatio > .16) {
      findings.push('Replace the bright near-white background with a stronger Message Background colour or add contrast so the banner does not blend into the Shopee interface.');
      findings.push('Reduce the product grid to 2–3 SKUs and enlarge each product image so the products are clearly visible.');
      findings.push('Increase the SKU name and price font size so shoppers can read the product details at a glance.');
    }
    if (contrast < 39) findings.push('Increase contrast between the promo message, product image, and background to improve readability.');
    if (saturationRatio < .09) findings.push('Add a clearer brand or Message Background colour to strengthen the visual hierarchy.');
    if (edgeRatio < .055) findings.push('Increase the product image size or contrast so the main product is easier to recognise at a glance.');
    if (edgeRatio > .19 && contrast < 56) findings.push('Increase the promo message font size and contrast to improve readability.');
    if (!findings.length) findings.push('Increase separation between the brand logo, promo message, and product image to make the reading order clearer.');
    return findings;
  }

  function displayReview(canvas, item) {
    if (templateMode.value !== 'blank') return;
    reviewPreview.innerHTML = '';
    const image = new Image();
    image.alt = `Reviewed ${item.title}`;
    image.src = canvas.toDataURL('image/png');
    reviewPreview.append(image);
    reviewPreview.hidden = false;
    reviewStatus.innerHTML = `<p><b>Visual suggestions for ${item.title}</b></p><ul>${visualSuggestions(canvas, item).map((finding) => `<li>${finding}</li>`).join('')}</ul>`;
  }

  async function reviewBlankOutput(id) {
    if (templateMode.value !== 'blank') return;
    const generation = reviewGeneration;
    const item = outputs[id];
    if (!item || (!blankUploads.has(id) && !window.BrandMaxDesignTools?.hasLayers(id))) {
      showReview('Upload a design or add an element to receive visual suggestions.');
      return;
    }
    showReview(`Analysing the rendered ${item.title}…`);
    try {
      const canvas = await createBlankArtworkCanvas(id);
      if (generation === reviewGeneration && templateMode.value === 'blank' && canvas) displayReview(canvas, item);
    } catch {
      if (generation === reviewGeneration && templateMode.value === 'blank') {
        showReview('The selected image could not be analysed. Try uploading a PNG, JPG, or WebP design again.');
      }
    }
  }

  const EXPORT_TARGET_BYTES = 248 * 1000;
  const EXPORT_MAX_BYTES = 250 * 1000;
  const canvasToBlob = (canvas, type, quality) => new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Unable to encode export.')), type, quality);
  });
  const imageFromBlob = async (blob) => {
    const url = URL.createObjectURL(blob);
    try { return await loadImage(url); } finally { URL.revokeObjectURL(url); }
  };
  const pngCrcTable = (() => {
    const table = new Uint32Array(256);
    for (let index = 0; index < 256; index += 1) {
      let value = index;
      for (let bit = 0; bit < 8; bit += 1) value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
      table[index] = value >>> 0;
    }
    return table;
  })();
  const pngChunk = (type, data) => {
    const name = new TextEncoder().encode(type);
    const bytes = new Uint8Array(12 + data.length);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, data.length);
    bytes.set(name, 4);
    bytes.set(data, 8);
    let crc = 0xffffffff;
    for (let index = 4; index < 8 + data.length; index += 1) crc = pngCrcTable[(crc ^ bytes[index]) & 255] ^ (crc >>> 8);
    view.setUint32(8 + data.length, (crc ^ 0xffffffff) >>> 0);
    return bytes;
  };
  const createPalette = (pixels, maxColors = 256) => {
    const histogram = new Map();
    for (let index = 0; index < pixels.length; index += 4) {
      const alpha = pixels[index + 3];
      const key = alpha === 0 ? 0 : (((pixels[index] >> 3) << 15) | ((pixels[index + 1] >> 3) << 10) | ((pixels[index + 2] >> 3) << 5) | (alpha >> 4));
      const current = histogram.get(key) || { r: 0, g: 0, b: 0, a: 0, count: 0 };
      current.r += pixels[index]; current.g += pixels[index + 1]; current.b += pixels[index + 2]; current.a += alpha; current.count += 1;
      histogram.set(key, current);
    }
    const colours = [...histogram.values()].map((colour) => ({
      r: colour.r / colour.count, g: colour.g / colour.count, b: colour.b / colour.count, a: colour.a / colour.count, count: colour.count,
    }));
    const boxes = [{ colours }];
    while (boxes.length < maxColors) {
      boxes.sort((left, right) => {
        const range = (box) => Math.max(...['r', 'g', 'b', 'a'].map((channel) => Math.max(...box.colours.map((c) => c[channel])) - Math.min(...box.colours.map((c) => c[channel]))));
        return range(right) * right.colours.length - range(left) * left.colours.length;
      });
      const box = boxes.shift();
      if (!box || box.colours.length < 2) { if (box) boxes.push(box); break; }
      const channels = ['r', 'g', 'b', 'a'];
      const channel = channels.reduce((best, next) => {
        const span = (name) => Math.max(...box.colours.map((c) => c[name])) - Math.min(...box.colours.map((c) => c[name]));
        return span(next) > span(best) ? next : best;
      }, 'r');
      box.colours.sort((left, right) => left[channel] - right[channel]);
      let total = box.colours.reduce((sum, colour) => sum + colour.count, 0), running = 0, split = 1;
      for (; split < box.colours.length; split += 1) { running += box.colours[split - 1].count; if (running >= total / 2) break; }
      boxes.push({ colours: box.colours.slice(0, split) }, { colours: box.colours.slice(split) });
    }
    return boxes.map((box) => {
      const total = box.colours.reduce((sum, colour) => sum + colour.count, 0) || 1;
      return ['r', 'g', 'b', 'a'].reduce((result, channel) => ({ ...result, [channel]: Math.round(box.colours.reduce((sum, colour) => sum + colour[channel] * colour.count, 0) / total) }), {});
    });
  };
  const indexedPngBlob = async (canvas, ditherStrength = 0) => {
    if (!('CompressionStream' in window)) return null;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const image = context.getImageData(0, 0, canvas.width, canvas.height);
    const palette = createPalette(image.data);
    const cache = new Map();
    const nearest = (r, g, b, a) => {
      const key = a === 0 ? 0 : (((r >> 3) << 15) | ((g >> 3) << 10) | ((b >> 3) << 5) | (a >> 4));
      if (cache.has(key)) return cache.get(key);
      let result = 0, distance = Infinity;
      palette.forEach((colour, index) => {
        const next = (r - colour.r) ** 2 + (g - colour.g) ** 2 + (b - colour.b) ** 2 + 2 * (a - colour.a) ** 2;
        if (next < distance) { distance = next; result = index; }
      });
      cache.set(key, result);
      return result;
    };
    const scanlines = new Uint8Array((canvas.width + 1) * canvas.height);
    const bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
    for (let y = 0; y < canvas.height; y += 1) {
      const line = y * (canvas.width + 1); scanlines[line] = 0;
      for (let x = 0; x < canvas.width; x += 1) {
        const pixel = (y * canvas.width + x) * 4;
        const alphaValue = image.data[pixel + 3];
        const offset = alphaValue && ditherStrength ? ((bayer[y % 4][x % 4] - 7.5) / 7.5) * ditherStrength : 0;
        scanlines[line + x + 1] = nearest(
          Math.max(0, Math.min(255, image.data[pixel] + offset)),
          Math.max(0, Math.min(255, image.data[pixel + 1] + offset)),
          Math.max(0, Math.min(255, image.data[pixel + 2] + offset)),
          alphaValue,
        );
      }
    }
    const compressed = new Uint8Array(await new Response(new Blob([scanlines]).stream().pipeThrough(new CompressionStream('deflate'))).arrayBuffer());
    const header = new Uint8Array(13); const view = new DataView(header.buffer);
    view.setUint32(0, canvas.width); view.setUint32(4, canvas.height); header[8] = 8; header[9] = 3;
    const colours = new Uint8Array(palette.length * 3); const alpha = new Uint8Array(palette.length);
    palette.forEach((colour, index) => { colours.set([colour.r, colour.g, colour.b], index * 3); alpha[index] = colour.a; });
    return new Blob([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), pngChunk('IHDR', header), pngChunk('PLTE', colours), pngChunk('tRNS', alpha), pngChunk('IDAT', compressed), pngChunk('IEND', new Uint8Array())], { type: 'image/png' });
  };

  async function createUnderLimitBlankFile(id) {
    const item = outputs[id];
    const fullCanvas = await createBlankArtworkCanvas(id);
    const png = await canvasToBlob(fullCanvas, 'image/png');
    if (item.title === 'Skinny Banner') return { blob: png, extension: 'png' };
    if (item.title === 'Floating Icon') {
      const indexed = png.size <= EXPORT_MAX_BYTES ? png : await indexedPngBlob(fullCanvas, 0);
      return { blob: indexed || png, extension: 'png' };
    }
    // Pop Up Banner is explicitly a transparent PNG output. Its fixed canvas
    // is always 580 × 720, and it must never take the generic JPEG fallback.
    if (item.designBox && item.mallTag) {
      return window.BrandMaxPopupExport.encode(fullCanvas, EXPORT_MAX_BYTES);
    }
    if (png.size <= EXPORT_MAX_BYTES) return { blob: png, extension: 'png' };

    /* Match Banner Generator’s quality strategy: compress only the uploaded
       design, then redraw the original official tag PNG sharply on top. */
    const designCanvas = await createBlankArtworkCanvas(id, false);
    const frame = document.querySelector(`[data-blank-output="${id}"]`);
    const officialOverlay = item.mallTag
      ? await Promise.all([loadImage(item.mallTag), loadImage(item.cta)])
      : await loadOriginalOverlayForCanvas(item, frame?.querySelector('.blank-mall-tag'));
    let best = null;
    let low = 0.22;
    let high = 0.95;
    for (let attempt = 0; attempt < 9; attempt += 1) {
      const quality = (low + high) / 2;
      const designJpeg = await canvasToBlob(designCanvas, 'image/jpeg', quality);
      const softenedDesign = await imageFromBlob(designJpeg);
      const composed = document.createElement('canvas');
      composed.width = item.canvasWidth;
      composed.height = item.canvasHeight;
      const context = composed.getContext('2d');
      context.drawImage(softenedDesign, 0, 0, composed.width, composed.height);
      if (item.mallTag) {
        context.drawImage(officialOverlay[0], 129, 10, 323, 52);
        context.drawImage(officialOverlay[1], 90, 644, 399, 66);
      } else {
        context.drawImage(officialOverlay, 0, 0, composed.width, composed.height);
      }
      const candidate = await canvasToBlob(composed, 'image/png');
      if (!best || candidate.size < best.blob.size) best = { blob: candidate, extension: 'png' };
      if (candidate.size <= EXPORT_TARGET_BYTES) { best = { blob: candidate, extension: 'png' }; low = quality; } else high = quality;
    }
    if (best?.blob.size <= EXPORT_MAX_BYTES) return best;

    /* A JPG is only a last resort for unusually detailed source artwork. */
    let fallback = null;
    low = 0.02; high = 0.92;
    for (let attempt = 0; attempt < 9; attempt += 1) {
      const quality = (low + high) / 2;
      const candidate = await canvasToBlob(fullCanvas, 'image/jpeg', quality);
      if (!fallback || candidate.size < fallback.blob.size) fallback = { blob: candidate, extension: 'jpg' };
      if (candidate.size <= EXPORT_TARGET_BYTES) { fallback = { blob: candidate, extension: 'jpg' }; low = quality; } else high = quality;
    }
    return fallback;
  }

  async function downloadBlankOutput(id) {
    const upload = blankUploads.get(id);
    if (!upload && !window.BrandMaxDesignTools?.hasLayers(id)) return;
    try {
      const file = await createUnderLimitBlankFile(id);
      // Pop-up PNGs retain transparency and native dimensions, with only the
      // minimum colour reduction needed to stay strictly below 250 KB.
      const maxBytes = outputs[id].title === 'Banner Card' ? 500 * 1000 : EXPORT_MAX_BYTES;
      const isTransparentPng = Boolean(outputs[id].mallTag) || outputs[id].title === 'Floating Icon';
      // Skinny must remain a full-quality, opaque PNG even when detailed
      // uploaded artwork makes the file larger than the older 700 KB cap.
      const isOpaqueSkinnyPng = id === 'skinny-banner' && file?.extension === 'png';
      if (!file || (id === 'pop-up-banner' && file.blob.size >= EXPORT_MAX_BYTES)
        || (!isTransparentPng && !isOpaqueSkinnyPng && file.blob.size > maxBytes)) {
        throw new Error('Cannot meet export limit');
      }
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file.blob);
      link.download = `${id}.${file.extension}`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 30000);
    } catch (error) {
      console.error('Blank banner download failed', error);
      showReview(error?.name === 'SecurityError'
        ? 'This image cannot be saved from the current page. Please re-upload the design and try again.'
        : 'The export could not be prepared. Try using a less detailed design image.');
    }
  }

  function clampPosition(frame, edit, item) {
    const editableWidth = item.designBox
      ? frame.clientWidth * item.designBox.width / item.canvasWidth
      : frame.clientWidth;
    const editableHeight = item.designBox
      ? frame.clientHeight * item.designBox.height / item.canvasHeight
      : frame.clientHeight;
    const overflowX = Math.max(0, editableWidth * (edit.scale / 100) / 2);
    const overflowY = Math.max(0, editableHeight * (edit.scale / 100) / 2);
    edit.x = Math.max(-overflowX, Math.min(overflowX, edit.x));
    edit.y = Math.max(-overflowY, Math.min(overflowY, edit.y));
    return edit;
  }

  // Editor-only guidance: never paint this layer into a banner or phone export.
  function createBannerCardSafeArea() {
    const guide = document.createElement('div');
    guide.className = 'banner-card-safe-area';
    guide.setAttribute('aria-label', 'Bottom 70 pixels may be covered by the image carousel dots');
    guide.innerHTML = '<span>70px safe area · carousel dots</span>';
    return guide;
  }

  const standardSafeAreas = new Map();
  const standardSafeAreaObserver = new ResizeObserver(() => {
    standardSafeAreas.forEach(({ position }) => position());
  });
  function mountStandardSafeAreas() {
    standardSafeAreas.forEach(({ guide }, canvas) => {
      if (canvas.isConnected) return;
      standardSafeAreaObserver.unobserve(canvas);
      guide.remove();
      standardSafeAreas.delete(canvas);
    });
    document.querySelectorAll('#previewList canvas.asset-canvas[data-output="banner-card"]').forEach(canvas => {
      if (standardSafeAreas.has(canvas)) return;
      const shell = canvas.closest('.canvas-shell');
      if (!shell) return;
      const guide = createBannerCardSafeArea();
      guide.classList.add('banner-card-safe-area-standard');
      const position = () => {
        // The canvas uses object-fit:contain: account for letterboxing inside
        // its CSS box, rather than stretching the guide across the checkerboard.
        const width = canvas.clientWidth, height = canvas.clientHeight;
        const scale = Math.min(width / 531, height / 792);
        const artWidth = 531 * scale, artHeight = 792 * scale;
        Object.assign(guide.style, {
          left: `${canvas.offsetLeft + (width - artWidth) / 2}px`,
          top: `${canvas.offsetTop + (height - artHeight) / 2 + 722 * scale}px`,
          width: `${artWidth}px`, height: `${70 * scale}px`,
        });
      };
      standardSafeAreas.set(canvas, { guide, position });
      shell.append(guide);
      standardSafeAreaObserver.observe(canvas);
      position();
    });
  }

  function renderBlankPreviews() {
    blankStack.querySelectorAll('.blank-design-frame').forEach(frame => imageLayoutObserver.unobserve(frame));
    blankStack.innerHTML = '';
    selectedOutputs().forEach((id) => {
      const item = outputs[id];
      const edit = editFor(id);
      const block = document.createElement('article');
      block.className = 'preview-block blank-preview-block';
      const upload = blankUploads.get(id);
      const isBounded = Boolean(item.designBox);
      const isPopup = Boolean(item.mallTag);
      const isFloating = id === 'floating-icon';
      // The selected overlay is already resolved to the embedded deployment
      // asset (and updated when the logo ratio changes). Keep the on-screen
      // guide on that same source as the export canvas.
      const overlaySrc = item.overlay;
      const boxStyle = isBounded ? `--design-x:${item.designBox.x / item.canvasWidth * 100}%;--design-y:${item.designBox.y / item.canvasHeight * 100}%;--design-w:${item.designBox.width / item.canvasWidth * 100}%;--design-h:${item.designBox.height / item.canvasHeight * 100}%;` : '';
      const popupOverlays = isPopup ? `<img class="blank-popup-tag" src="${item.mallTag}" alt="Mandatory Shopee Mall tag overlay" /><img class="blank-popup-cta" src="${item.cta}" alt="Mandatory CTA overlay" />` : `<img class="blank-mall-tag" src="${overlaySrc}" alt="Mandatory ${item.title} overlay" />`;
      const floatingLogoBox = floatingBlankLogoRatio === 'square'
        ? { x: 132, y: 20, width: 96, height: 80 }
        : { x: 61, y: 20, width: 238, height: 80 };
      const floatingLogoStyle = `--floating-logo-x:${floatingLogoBox.x / item.canvasWidth * 100}%;--floating-logo-y:${floatingLogoBox.y / item.canvasHeight * 100}%;--floating-logo-w:${floatingLogoBox.width / item.canvasWidth * 100}%;--floating-logo-h:${floatingLogoBox.height / item.canvasHeight * 100}%;`;
      const floatingLogoMarkup = isFloating ? `<div class="blank-floating-logo" style="${floatingLogoStyle}">${floatingBlankLogo ? `<img src="${floatingBlankLogo.url}" alt="Uploaded brand logo" style="transform:scale(${floatingBlankLogoScale / 100})" />` : ''}<label>${floatingBlankLogo ? 'Replace logo' : 'Upload logo'}<input data-upload="logo" type="file" accept="image/png,image/jpeg,image/webp" /></label></div>` : '';
      // Always state the editable design-area size. Banner Card fills its
      // whole output; Pop Up and Skinny use their smaller upload areas.
      const uploadArea = item.designBox || {
        width: item.canvasWidth,
        height: item.canvasHeight,
      };
      const uploadInfo = `Upload your design<br /><b>${uploadArea.width} × ${uploadArea.height}px</b>`;
      const designPreview = isBounded
        ? `<div class="blank-popup-design-mask"><img class="blank-design-preview" alt="Uploaded ${item.title} preview" ${upload ? `src="${upload.url}"` : 'hidden'} /></div>`
        : `<div class="blank-base-art-clip"><img class="blank-design-preview" alt="Uploaded ${item.title} preview" ${upload ? `src="${upload.url}"` : 'hidden'} /></div>`;
      block.innerHTML = `<div class="preview-heading"><div><h2 class="preview-title">${item.title}</h2><p class="preview-meta">${item.meta}</p></div><div class="preview-actions">${isFloating ? `<label class="zoom-control floating-ratio-control"><span>Logo ratio</span><select class="floating-blank-ratio"><option value="horizontal">Horizontal</option><option value="square">1:1</option></select></label><label class="zoom-control"><span>Logo size</span><input data-control="logo-scale" type="range" min="60" max="300" step="1" value="${floatingBlankLogoScale}" /><span class="floating-logo-scale-value">${floatingBlankLogoScale}%</span></label>` : ''}<label class="zoom-control"><span>Image size</span><input data-control="design-scale" type="range" min="0" max="300" step="1" value="${edit.scale}" /><span class="zoom-value">${edit.scale}%</span></label></div></div><div class="canvas-shell blank-canvas-shell"><div class="blank-design-frame ${upload ? 'has-image' : ''} ${isBounded ? 'blank-popup-frame' : ''}" data-blank-output="${id}" style="aspect-ratio:${item.ratio};--blank-preview-width:${item.width};${boxStyle}"><div class="blank-image-placeholder" ${upload ? 'hidden' : ''}><div class="blank-placeholder-content"><div class="blank-placeholder-copy"><span>YOUR DESIGN</span><small>${uploadInfo}</small></div>${upload ? '' : '<label class="blank-placeholder-upload">Upload Design<input data-upload="design" type="file" accept="image/png,image/jpeg,image/webp" /></label>'}</div></div>${designPreview}${popupOverlays}${floatingLogoMarkup}</div></div><div class="preview-footer">${upload ? '<label class="blank-canvas-upload">Replace design<input data-upload="design" type="file" accept="image/png,image/jpeg,image/webp" /></label>' : '<span></span>'}<button type="button" class="preview-button blank-homepage-preview">Preview</button><button type="button" class="download-button blank-download" ${upload || window.BrandMaxDesignTools?.hasLayers(id) ? '' : 'disabled'}>Download</button></div>`;
      if (!upload && window.BrandMaxDesignTools?.hasLayers(id)) {
        const label = document.createElement('label');
        label.className = 'blank-canvas-upload';
        label.innerHTML = 'Upload design<input data-upload="design" type="file" accept="image/png,image/jpeg,image/webp" />';
        block.querySelector('.preview-footer > span')?.replaceWith(label);
      }
      const designInputs = [...block.querySelectorAll('input[data-upload="design"]')];
      const logoInput = block.querySelector('input[data-upload="logo"]');
      const slider = block.querySelector('input[data-control="design-scale"]');
      const logoSlider = block.querySelector('input[data-control="logo-scale"]');
      const value = block.querySelector('.zoom-value');
      const frame = block.querySelector('.blank-design-frame');
      const image = block.querySelector('.blank-design-preview');
      if (id === 'banner-card') frame.append(createBannerCardSafeArea());
      if (upload) {
        const actions = document.createElement('div');
        actions.className = 'blank-design-upload-actions';
        const replace = block.querySelector('.blank-canvas-upload');
        replace.replaceWith(actions);
        actions.append(replace);
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'blank-remove-design';
        remove.textContent = 'Remove design';
        remove.setAttribute('aria-label', `Remove ${item.title} uploaded design`);
        remove.addEventListener('click', () => {
          const previous = blankUploads.get(id);
          blankUploads.delete(id);
          blankEdits.delete(id);
          // History stores the original File, not its temporary URL. Undo
          // reconstructs a fresh URL; custom objects and the logo stay intact.
          if (previous) URL.revokeObjectURL(previous.url);
          renderBlankPreviews();
          document.dispatchEvent(new Event('brandmax:edited'));
        });
        actions.append(remove);
      }
      const ratioSelect = block.querySelector('.floating-blank-ratio');
      if (ratioSelect) {
        ratioSelect.value = floatingBlankLogoRatio;
        ratioSelect.addEventListener('change', () => {
          floatingBlankLogoRatio = ratioSelect.value;
          outputs['floating-icon'].overlay = floatingBlankLogoRatio === 'square'
            ? (exactMallOverlays['floating-square'] || 'assets/overlays/floating-square-overlay.png')
            : (exactMallOverlays['floating-horizontal'] || 'assets/overlays/floating-horizontal-overlay.png');
          renderBlankPreviews();
          document.dispatchEvent(new Event('brandmax:edited'));
        });
      }
      if (logoInput) {
        logoInput.addEventListener('change', () => {
          const nextFile = logoInput.files[0];
          if (!nextFile) return;
          if (floatingBlankLogo) URL.revokeObjectURL(floatingBlankLogo.url);
          floatingBlankLogo = { file: nextFile, url: URL.createObjectURL(nextFile) };
          renderBlankPreviews();
          document.dispatchEvent(new Event('brandmax:edited'));
        });
      }
      if (logoSlider) {
        logoSlider.addEventListener('input', () => {
          floatingBlankLogoScale = Number(logoSlider.value);
          block.querySelector('.floating-logo-scale-value').textContent = `${floatingBlankLogoScale}%`;
          const logoImage = block.querySelector('.blank-floating-logo img');
          if (logoImage) logoImage.style.transform = `scale(${floatingBlankLogoScale / 100})`;
          document.dispatchEvent(new Event('brandmax:edited'));
        });
      }
      const apply = () => {
        const next = clampPosition(frame, edit, item);
        const crop = cropFor(next), box = item.designBox;
        const areaWidth = box ? frame.clientWidth * box.width / item.canvasWidth : frame.clientWidth;
        const areaHeight = box ? frame.clientHeight * box.height / item.canvasHeight : frame.clientHeight;
        if (image.naturalWidth && image.naturalHeight) {
          const scale = Math.max(areaWidth / (image.naturalWidth * crop.w), areaHeight / (image.naturalHeight * crop.h)) * (1 + next.scale / 100);
          const fullWidth = image.naturalWidth * scale, fullHeight = image.naturalHeight * scale;
          const x = (areaWidth - fullWidth * crop.w) / 2 - fullWidth * crop.x + next.x;
          const y = (areaHeight - fullHeight * crop.h) / 2 - fullHeight * crop.y + next.y;
          Object.assign(image.style, { position:'absolute', inset:'auto', left:'0', top:'0', width:`${fullWidth}px`, height:`${fullHeight}px`, objectFit:'fill', transformOrigin:'top left', transform:`translate(${x}px, ${y}px)` });
        }
        setEdit(id, next);
      };
      image.addEventListener('load', apply);
      imageLayoutCallbacks.set(frame, apply);
      imageLayoutObserver.observe(frame);
      const isEditablePoint = event => {
        const rect = frame.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width * item.canvasWidth;
        const y = (event.clientY - rect.top) / rect.height * item.canvasHeight;
        const inRect = box => x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height;
        if (isFloating) {
          if (Math.hypot(x - 180, y - 190) > 160 || inRect(floatingLogoBox)) return false;
        } else if (item.designBox) {
          const box = item.designBox;
          if (!inRect(box)) return false;
          const cx = Math.max(box.x + 30, Math.min(box.x + box.width - 30, x));
          const cy = Math.max(box.y + 30, Math.min(box.y + box.height - 30, y));
          if (Math.hypot(x - cx, y - cy) > 30) return false;
          if (isPopup && (inRect({x:129,y:10,width:323,height:52}) || inRect({x:90,y:644,width:399,height:66}))) return false;
        }
        return x >= 0 && y >= 0 && x <= item.canvasWidth && y <= item.canvasHeight;
      };
      frame.addEventListener('dblclick', event => {
        if (!upload || event.target.closest('.blank-custom-layer,.blank-floating-logo') || !isEditablePoint(event)) return;
        event.preventDefault(); event.stopPropagation();
        window.BrandMaxImageCrop?.open({ src:upload.url, crop:cropFor(edit), onApply:crop => {
          if (blankUploads.get(id) !== upload) return;
          setEdit(id, { scale:0, x:0, y:0, crop:cropFor({crop}) });
          renderBlankPreviews(); document.dispatchEvent(new Event('brandmax:edited'));
        } });
      });
      designInputs.forEach(input => input.addEventListener('change', () => {
        const nextFile = input.files[0];
        if (!nextFile) return;
        const previous = blankUploads.get(id);
        if (previous) URL.revokeObjectURL(previous.url);
        blankUploads.set(id, { file: nextFile, url: URL.createObjectURL(nextFile) });
        blankEdits.delete(id);
        reviewedOutputId = id;
        renderBlankPreviews();
        document.dispatchEvent(new Event('brandmax:edited'));
      }));
      block.querySelector('.blank-download').addEventListener('click', () => downloadBlankOutput(id));
      block.querySelector('.blank-homepage-preview').addEventListener('click', () => window.BrandMaxHomepagePreview?.preview(id));
      slider.addEventListener('input', () => {
        edit.scale = Number(slider.value);
        value.textContent = `${edit.scale}%`;
        apply();
        document.dispatchEvent(new Event('brandmax:edited'));
      });
      let drag = null;
      frame.addEventListener('pointerdown', (event) => {
        // Logo upload is a separate action. Do not turn its click into a
        // design-drag gesture before the browser can open the file picker.
        if (event.target.closest('.blank-floating-logo') || !isEditablePoint(event)) return;
        if (window.BrandMaxDesignTools?.shouldBlockArtworkDrag(event)) return;
        if (!upload) return;
        drag = { x: event.clientX, y: event.clientY, startX: edit.x, startY: edit.y };
        frame.setPointerCapture(event.pointerId);
        frame.classList.add('is-dragging');
      });
      frame.addEventListener('pointermove', (event) => {
        if (!drag) return;
        const viewScale = frame.getBoundingClientRect().width / frame.clientWidth || 1;
        edit.x = drag.startX + (event.clientX - drag.x) / viewScale;
        edit.y = drag.startY + (event.clientY - drag.y) / viewScale;
        apply();
      });
      const stopDrag = () => { if (drag && (edit.x !== drag.startX || edit.y !== drag.startY)) document.dispatchEvent(new Event('brandmax:edited')); drag = null; frame.classList.remove('is-dragging'); };
      frame.addEventListener('pointerup', stopDrag);
      frame.addEventListener('pointercancel', stopDrag);
      blankStack.append(block);
      requestAnimationFrame(apply);
    });
    window.BrandMaxCanvasZoom?.mount();
    window.BrandMaxDesignTools?.mount();
    window.BrandMaxHomepagePreview?.refresh();
  }

  function syncOutputs() {
    const selected = selectedOutputs();
    if (!selected.length) { outputChecks[0].checked = true; return syncOutputs(); }
    document.querySelectorAll('#outputButtons button[data-output]').forEach((button) => {
      const active = selected.includes(button.dataset.output);
      if ((button.getAttribute('aria-selected') === 'true') !== active) button.click();
    });
    outputSummary.textContent = selected.length === 1 ? outputs[selected[0]].title : `${selected.length} outputs selected`;
    renderBlankPreviews();
    window.BrandMaxHomepagePreview?.updateSelected(selected);
  }

  window.BrandMaxHomepagePreview?.setBlankRenderer((id) => createBlankArtworkCanvas(id));

  function syncTemplate() {
    const blank = templateMode.value === 'blank';
    document.documentElement.classList.toggle('blank-mode', blank);
    blankCard.hidden = !blank;
    reviewGeneration += 1;
    reviewerHeading.hidden = true;
    reviewerBox.hidden = true;
    reviewerGuidelines.hidden = true;
    reviewButton.disabled = true;
    reviewPreview.replaceChildren();
    reviewPreview.hidden = true;
    reviewedOutputId = null;
    reviewStatus.replaceChildren();
    window.BrandMaxHomepagePreview?.refresh();
  }

  function clearBlankArtwork() {
    blankUploads.forEach((upload) => URL.revokeObjectURL(upload.url));
    blankUploads.clear();
    blankEdits.clear();
    window.BrandMaxDesignTools?.reset();
    if (floatingBlankLogo) URL.revokeObjectURL(floatingBlankLogo.url);
    floatingBlankLogo = null;
    floatingBlankLogoRatio = 'horizontal';
    floatingBlankLogoScale = 100;
    reviewedOutputId = null;
    outputs['floating-icon'].overlay = exactMallOverlays['floating-horizontal'] || 'assets/overlays/floating-horizontal-overlay.png';
  }

  function snapshotBlankState() {
    return {
      uploads: [...blankUploads].map(([id, upload]) => [id, upload.file]),
      edits: [...blankEdits].map(([id, edit]) => [id, { ...edit }]),
      logoFile: floatingBlankLogo?.file || null,
      logoRatio: floatingBlankLogoRatio,
      logoScale: floatingBlankLogoScale,
      tools: window.BrandMaxDesignTools?.snapshot() || {},
    };
  }
  function blankFingerprint(value) {
    if (value instanceof Blob) {
      if (!blobHistoryIds.has(value)) blobHistoryIds.set(value, ++nextBlobHistoryId);
      return `file:${blobHistoryIds.get(value)}`;
    }
    if (Array.isArray(value)) return `[${value.map(blankFingerprint).join(',')}]`;
    if (value && typeof value === 'object') return `{${Object.keys(value).sort().map(key => `${key}:${blankFingerprint(value[key])}`).join(',')}}`;
    return JSON.stringify(value);
  }
  function updateBlankHistoryButtons() {
    document.dispatchEvent(new Event('brandmax:blank-history-updated'));
  }
  function resetBlankHistory() {
    blankHistory.past = [];
    blankHistory.future = [];
    blankHistory.current = snapshotBlankState();
    updateBlankHistoryButtons();
  }
  function recordBlankHistory(event) {
    if (templateMode.value !== 'blank' || blankHistory.restoring || event?.detail?.source === 'standard' || event?.detail?.source === 'blank-history') return;
    const next = snapshotBlankState();
    if (!blankHistory.current) { blankHistory.current = next; return; }
    if (blankFingerprint(next) === blankFingerprint(blankHistory.current)) return;
    blankHistory.past.push(blankHistory.current);
    if (blankHistory.past.length > 80) blankHistory.past.shift();
    blankHistory.current = next;
    blankHistory.future = [];
    updateBlankHistoryButtons();
  }
  function applyBlankState(saved = {}) {
    clearBlankArtwork();
    for (const [id, file] of saved.uploads || []) {
      if (outputs[id] && file instanceof Blob) blankUploads.set(id, { file, url: URL.createObjectURL(file) });
    }
    for (const [id, edit] of saved.edits || []) {
      if (outputs[id] && edit && typeof edit === 'object') {
        blankEdits.set(id, { scale: Number(edit.scale) || 0, x: Number(edit.x) || 0, y: Number(edit.y) || 0, ...(edit.crop ? {crop:cropFor(edit)} : {}) });
      }
    }
    floatingBlankLogoRatio = saved.logoRatio === 'square' ? 'square' : 'horizontal';
    floatingBlankLogoScale = Number(saved.logoScale) || 100;
    if (saved.logoFile instanceof Blob) floatingBlankLogo = { file: saved.logoFile, url: URL.createObjectURL(saved.logoFile) };
    window.BrandMaxDesignTools?.restore(saved.tools || {});
    outputs['floating-icon'].overlay = floatingBlankLogoRatio === 'square'
      ? (exactMallOverlays['floating-square'] || 'assets/overlays/floating-square-overlay.png')
      : (exactMallOverlays['floating-horizontal'] || 'assets/overlays/floating-horizontal-overlay.png');
    renderBlankPreviews();
  }
  function travelBlankHistory(direction) {
    const source = direction === 'undo' ? blankHistory.past : blankHistory.future;
    const destination = direction === 'undo' ? blankHistory.future : blankHistory.past;
    if (!source.length) return;
    destination.push(blankHistory.current || snapshotBlankState());
    const saved = source.pop();
    blankHistory.restoring = true;
    try { applyBlankState(saved); blankHistory.current = snapshotBlankState(); }
    finally { blankHistory.restoring = false; }
    updateBlankHistoryButtons();
    document.dispatchEvent(new CustomEvent('brandmax:edited', { detail: { source: 'blank-history' } }));
  }

  // Keep Blank artwork in browser-local projects without persisting temporary
  // blob: URLs. IndexedDB can store the original File/Blob objects directly.
  window.BrandMaxBlankState = Object.freeze({
    renderCanvas(id) { return createBlankArtworkCanvas(id); },
    snapshot: snapshotBlankState,
    restore(saved = {}) {
      applyBlankState(saved);
      resetBlankHistory();
    },
    reset() {
      clearBlankArtwork();
      renderBlankPreviews();
      resetBlankHistory();
    },
    canUndo() { return blankHistory.past.length > 0; },
    canRedo() { return blankHistory.future.length > 0; },
    undo() { travelBlankHistory('undo'); },
    redo() { travelBlankHistory('redo'); },
  });
  document.addEventListener('brandmax:edited', recordBlankHistory);

  templateMode.addEventListener('change', () => {
    if (templateMode.value !== 'blank') {
      // Reopening a Blank project may leave the Standard selector on the
      // chosen design already. Dispatch even in that case so the editor
      // controls and selected output stay in sync.
      if (template.value !== templateMode.value) template.value = templateMode.value;
      template.dispatchEvent(new Event('change', { bubbles: true }));
    }
    syncTemplate();
    updateBlankHistoryButtons();
  });
  template.addEventListener('change', () => {
    if (templateMode.value !== 'blank' && ['Design 1', 'Design 2', 'Design 3'].includes(template.value)) {
      templateMode.value = template.value;
    }
  });
  outputToggle.addEventListener('click', () => {
    const open = outputMenu.hidden;
    outputMenu.hidden = !open;
    outputToggle.setAttribute('aria-expanded', String(open));
  });
  outputChecks.forEach((input) => input.addEventListener('change', syncOutputs));
  outputMenu.addEventListener('click', (event) => event.stopPropagation());
  outputMenu.addEventListener('pointerdown', (event) => event.stopPropagation());
  document.addEventListener('pointerdown', (event) => {
    if (!event.target.closest('.workflow-output-menu')) { outputMenu.hidden = true; outputToggle.setAttribute('aria-expanded', 'false'); }
  });
  download.addEventListener('click', async () => {
    // The top action must invoke the Standard export directly. Forwarding the
    // click to the secondary button can lose the user-initiated download
    // gesture in browsers, leaving Download All with no visible result.
    if (templateMode.value !== 'blank') {
      if (typeof window.downloadAll === 'function') {
        const label = download.textContent;
        download.disabled = true;
        download.textContent = 'Preparing...';
        try {
          const didStartDownloads = await window.downloadAll();
          if (!didStartDownloads) {
            download.textContent = 'Download failed';
            window.setTimeout(() => { download.textContent = label; }, 2200);
          }
          return didStartDownloads;
        } finally {
          download.disabled = false;
          if (download.textContent === 'Preparing...') download.textContent = label;
        }
      }
      return originalDownload.click();
    }
    if (!selectedOutputs().some((id) => blankUploads.has(id) || window.BrandMaxDesignTools?.hasLayers(id))) { showReview('Add artwork or a design element before downloading.'); return; }
    selectedOutputs().filter((id) => blankUploads.has(id) || window.BrandMaxDesignTools?.hasLayers(id)).forEach((id) => downloadBlankOutput(id));
  });
  syncOutputs();
  syncTemplate();
  resetBlankHistory();
  const standardPreviewList = document.querySelector('#previewList');
  if (standardPreviewList) {
    new MutationObserver(mountStandardSafeAreas).observe(standardPreviewList, { childList: true, subtree: true });
    mountStandardSafeAreas();
  }
})();
