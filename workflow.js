(() => {
  const campaign = document.querySelector('#workflowCampaign');
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
  const exactMallOverlays = window.BrandMaxMallOverlays || {};

  const outputs = {
    'banner-card': { title: 'Banner Card', meta: '531 x 792px', width: '375px', ratio: '531 / 792', canvasWidth: 531, canvasHeight: 792, overlay: exactMallOverlays['banner-card'] || 'Template/Shopee%20Mall%20tag%20Overlay/Mall%20BAU%20Template_Mall_BAU_26-29mei_Banner%20Card_01%20copy.png' },
    'pop-up-banner': { title: 'Pop Up Banner', meta: '580 x 720px', width: '390px', ratio: '580 / 720', canvasWidth: 580, canvasHeight: 720, designBox: { x: 36, y: 30, width: 507, height: 654 }, mallTag: exactMallOverlays['popup-tag'] || 'Template/Pop%20Up%20Banner/Blank/Pop-Up-template-shopee-mall-tag.png', cta: exactMallOverlays['popup-cta'] || 'Template/Pop%20Up%20Banner/Blank/Pop-Up-template-CTA.png' },
    'skinny-banner': { title: 'Skinny Banner', meta: '1200 x 360px', width: '720px', ratio: '1200 / 360', canvasWidth: 1200, canvasHeight: 360, designBox: { x: 46, y: 39, width: 1108, height: 280 }, overlay: 'Template/Skinny%20Banner/Blank/skinny-blank-overlay.png' }
  };
  const blankUploads = new Map();
  const blankEdits = new Map();
  const canvasOverlayCache = new Map();
  let reviewedOutputId = null;
  const selectedOutputs = () => outputChecks.filter((input) => input.checked).map((input) => input.value);
  const editFor = (id) => blankEdits.get(id) || { scale: 0, x: 0, y: 0 };
  const setEdit = (id, edit) => blankEdits.set(id, edit);
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
    reviewStatus.innerHTML = `<p>${message}</p>`;
  }

  function createBlankArtworkCanvas(id, includeOverlay = true) {
    const upload = blankUploads.get(id);
    const item = outputs[id];
    if (!upload || !item) return Promise.resolve(null);
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
      return Promise.all([waitForVisibleImage(visibleDesign, upload.url), overlays]).then(([design, [mallTag, cta]]) => {
        const canvas = document.createElement('canvas');
        canvas.width = item.canvasWidth;
        canvas.height = item.canvasHeight;
        const context = canvas.getContext('2d');
        const box = item.designBox;
        const baseScale = Math.max(box.width / design.naturalWidth, box.height / design.naturalHeight);
        const scale = baseScale * (1 + editFor(id).scale / 100);
        const width = design.naturalWidth * scale;
        const height = design.naturalHeight * scale;
        const edit = editFor(id);
        const x = box.x + (box.width - width) / 2 + edit.x / (frame?.clientWidth || canvas.width) * canvas.width;
        const y = box.y + (box.height - height) / 2 + edit.y / (frame?.clientHeight || canvas.height) * canvas.height;
        context.save();
        // The supplied Blank Pop Up guide contains a rounded design boundary.
        // It is a clip only: all space outside the uploaded artwork stays
        // transparent in the final PNG.
        roundedRectPath(context, box.x, box.y, box.width, box.height, 30);
        context.clip();
        context.drawImage(design, x, y, width, height);
        context.restore();
        if (item.overlay && mallTag) {
          context.drawImage(mallTag, 0, 0, canvas.width, canvas.height);
        } else if (mallTag && cta) {
          context.drawImage(mallTag, 129, 10, 323, 52);
          context.drawImage(cta, 90, 644, 399, 66);
        }
        return canvas;
      });
    }
    /* Use the images already rendered inside the selected preview. This keeps
       review and export aligned with what the user sees, including the overlay. */
    const images = includeOverlay
      ? Promise.all([waitForVisibleImage(visibleDesign, upload.url), loadOriginalOverlayForCanvas(item, visibleOverlay)])
      : Promise.all([waitForVisibleImage(visibleDesign, upload.url)]);
    return images.then(([design, overlay]) => {
      const canvas = document.createElement('canvas');
      canvas.width = item.canvasWidth;
      canvas.height = item.canvasHeight;
      const context = canvas.getContext('2d');
      const baseScale = Math.max(canvas.width / design.naturalWidth, canvas.height / design.naturalHeight);
      const scale = baseScale * (1 + editFor(id).scale / 100);
      const width = design.naturalWidth * scale;
      const height = design.naturalHeight * scale;
      const edit = editFor(id);
      const x = (canvas.width - width) / 2 + edit.x / (frame?.clientWidth || canvas.width) * canvas.width;
      const y = (canvas.height - height) / 2 + edit.y / (frame?.clientHeight || canvas.height) * canvas.height;
      context.drawImage(design, x, y, width, height);
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
      findings.push('Replace the bright near-white background with a stronger KV colour or add contrast so the banner does not blend into the Shopee interface.');
      findings.push('Reduce the product grid to 2–3 SKUs and enlarge each product image so the products are clearly visible.');
      findings.push('Increase the SKU name and price font size so shoppers can read the product details at a glance.');
    }
    if (contrast < 39) findings.push('Increase contrast between the promo message, product image, and background to improve readability.');
    if (saturationRatio < .09) findings.push('Add a clearer brand or KV colour to strengthen the visual hierarchy.');
    if (edgeRatio < .055) findings.push('Increase the product image size or contrast so the main product is easier to recognise at a glance.');
    if (edgeRatio > .19 && contrast < 56) findings.push('Increase the promo message font size and contrast to improve readability.');
    if (!findings.length) findings.push('Increase separation between the brand logo, promo message, and product image to make the reading order clearer.');
    return findings;
  }

  function displayReview(canvas, item) {
    reviewPreview.innerHTML = '';
    const image = new Image();
    image.alt = `Reviewed ${item.title}`;
    image.src = canvas.toDataURL('image/png');
    reviewPreview.append(image);
    reviewStatus.innerHTML = `<p><b>Visual suggestions for ${item.title}</b></p><ul>${visualSuggestions(canvas, item).map((finding) => `<li>${finding}</li>`).join('')}</ul>`;
  }

  async function reviewBlankOutput(id) {
    const item = outputs[id];
    if (!item || !blankUploads.has(id)) {
      showReview('Upload a design for one of the selected outputs to receive visual suggestions.');
      return;
    }
    showReview(`Analysing the rendered ${item.title}…`);
    try {
      const canvas = await createBlankArtworkCanvas(id);
      if (canvas) displayReview(canvas, item);
    } catch {
      showReview('The selected image could not be analysed. Try uploading a PNG, JPG, or WebP design again.');
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
    // Pop Up Banner is explicitly a transparent PNG output. Its fixed canvas
    // is always 580 × 720, and it must never take the generic JPEG fallback.
    if (item.designBox) {
      if (png.size <= EXPORT_MAX_BYTES) return { blob: png, extension: 'png' };
      const designCanvas = await createBlankArtworkCanvas(id, false);
      const [mallTag, cta] = await Promise.all([loadImage(item.mallTag), loadImage(item.cta)]);
      let best = { blob: png, extension: 'png' };
      let bestUnderTarget = null;
      // PNG itself has no quality setting. Apply only a light compression pass
      // to the uploaded artwork; the later indexed-PNG step chooses an adaptive
      // palette instead of the visibly harsh uniform posterisation used before.
      const qualitySteps = [0.94];
      for (const quality of qualitySteps) {
        const designJpeg = await canvasToBlob(designCanvas, 'image/jpeg', quality);
        const softenedDesign = await imageFromBlob(designJpeg);
        const composed = document.createElement('canvas');
        composed.width = item.canvasWidth;
        composed.height = item.canvasHeight;
        const context = composed.getContext('2d');
        const box = item.designBox;
        context.save();
        roundedRectPath(context, box.x, box.y, box.width, box.height, 30);
        context.clip();
        context.drawImage(softenedDesign, 0, 0, composed.width, composed.height);
        context.restore();
        context.drawImage(mallTag, 129, 10, 323, 52);
        context.drawImage(cta, 90, 644, 399, 66);
        // Retain detail by selecting the richest indexed PNG below the budget,
        // instead of accepting the first (often very small) compressed file.
        for (const ditherStrength of [0, 4, 8, 12, 16]) {
          const candidate = (await indexedPngBlob(composed, ditherStrength)) || await canvasToBlob(composed, 'image/png');
          if (candidate.size < best.blob.size) best = { blob: candidate, extension: 'png' };
          if (candidate.size <= EXPORT_TARGET_BYTES && (!bestUnderTarget || candidate.size > bestUnderTarget.blob.size)) {
            bestUnderTarget = { blob: candidate, extension: 'png' };
          }
        }
      }
      return bestUnderTarget || best;
    }
    if (png.size <= EXPORT_MAX_BYTES) return { blob: png, extension: 'png' };

    /* Match Banner Generator’s quality strategy: compress only the uploaded
       design, then redraw the original official tag PNG sharply on top. */
    const designCanvas = await createBlankArtworkCanvas(id, false);
    const frame = document.querySelector(`[data-blank-output="${id}"]`);
    const officialOverlay = item.designBox
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
      if (item.designBox) {
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
    if (!upload) return;
    try {
      const file = await createUnderLimitBlankFile(id);
      // Pop Up stays transparent PNG and prioritises the supplied artwork's
      // colour quality if a browser PNG encoder cannot reach 250KB exactly.
      const maxBytes = outputs[id].title === 'Skinny Banner' ? 700 * 1000 : outputs[id].title === 'Banner Card' ? 500 * 1000 : EXPORT_MAX_BYTES;
      const isTransparentPopUp = Boolean(outputs[id].mallTag);
      if (!file || (!isTransparentPopUp && file.blob.size > maxBytes)) {
        throw new Error('Cannot meet export limit');
      }
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file.blob);
      link.download = `${id}.${file.extension}`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 30000);
    } catch {
      showReview('The export could not be prepared under 250KB. Try using a less detailed design image.');
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

  function renderBlankPreviews() {
    blankStack.innerHTML = '';
    selectedOutputs().forEach((id) => {
      const item = outputs[id];
      const edit = editFor(id);
      const block = document.createElement('article');
      block.className = 'preview-block blank-preview-block';
      const upload = blankUploads.get(id);
      const isBounded = Boolean(item.designBox);
      const isPopup = Boolean(item.mallTag);
      const boxStyle = isBounded ? `--design-x:${item.designBox.x / item.canvasWidth * 100}%;--design-y:${item.designBox.y / item.canvasHeight * 100}%;--design-w:${item.designBox.width / item.canvasWidth * 100}%;--design-h:${item.designBox.height / item.canvasHeight * 100}%;` : '';
      const popupOverlays = isPopup ? `<img class="blank-popup-tag" src="${item.mallTag}" alt="Mandatory Shopee Mall tag overlay" /><img class="blank-popup-cta" src="${item.cta}" alt="Mandatory CTA overlay" />` : `<img class="blank-mall-tag" src="${item.overlay}" alt="Mandatory Shopee Mall tag overlay" />`;
      const uploadInfo = isBounded ? `Upload your design<br /><b>${item.designBox.width} × ${item.designBox.height}px</b>` : `Upload a ${item.title} design`;
      const designPreview = isBounded
        ? `<div class="blank-popup-design-mask"><img class="blank-design-preview" alt="Uploaded ${item.title} preview" ${upload ? `src="${upload.url}"` : 'hidden'} /></div>`
        : `<img class="blank-design-preview" alt="Uploaded ${item.title} preview" ${upload ? `src="${upload.url}"` : 'hidden'} />`;
      block.innerHTML = `<div class="preview-heading"><div><h2 class="preview-title">${item.title}</h2><p class="preview-meta">${item.meta}</p></div><div class="preview-actions"><label class="zoom-control"><span>Image size</span><input type="range" min="0" max="50" step="1" value="${edit.scale}" /><span class="zoom-value">${edit.scale}%</span></label></div></div><div class="canvas-shell blank-canvas-shell"><div class="blank-design-frame ${upload ? 'has-image' : ''} ${isBounded ? 'blank-popup-frame' : ''}" data-blank-output="${id}" style="aspect-ratio:${item.ratio};--blank-preview-width:${item.width};${boxStyle}"><div class="blank-image-placeholder" ${upload ? 'hidden' : ''}><span>YOUR DESIGN</span><small>${uploadInfo}</small>${upload ? '' : '<label class="blank-placeholder-upload">Upload Design<input type="file" accept="image/png,image/jpeg,image/webp" /></label>'}</div>${designPreview}${popupOverlays}</div></div><div class="preview-footer">${upload ? '<label class="blank-canvas-upload">Replace design<input type="file" accept="image/png,image/jpeg,image/webp" /></label>' : '<span></span>'}<button type="button" class="download-button blank-download" ${upload ? '' : 'disabled'}>Download</button></div>`;
      const input = block.querySelector('input[type="file"]');
      const slider = block.querySelector('input[type="range"]');
      const value = block.querySelector('.zoom-value');
      const frame = block.querySelector('.blank-design-frame');
      const image = block.querySelector('.blank-design-preview');
      const apply = () => {
        const next = clampPosition(frame, edit, item);
        image.style.transform = `translate(${next.x}px, ${next.y}px) scale(${1 + next.scale / 100})`;
        setEdit(id, next);
      };
      input.addEventListener('change', () => {
        const nextFile = input.files[0];
        if (!nextFile) return;
        const previous = blankUploads.get(id);
        if (previous) URL.revokeObjectURL(previous.url);
        blankUploads.set(id, { file: nextFile, url: URL.createObjectURL(nextFile) });
        blankEdits.delete(id);
        reviewedOutputId = id;
        renderBlankPreviews();
        requestAnimationFrame(() => reviewBlankOutput(id));
      });
      block.querySelector('.blank-download').addEventListener('click', () => downloadBlankOutput(id));
      slider.addEventListener('input', () => {
        edit.scale = Number(slider.value);
        value.textContent = `${edit.scale}%`;
        apply();
      });
      let drag = null;
      frame.addEventListener('pointerdown', (event) => {
        if (!upload) return;
        drag = { x: event.clientX, y: event.clientY, startX: edit.x, startY: edit.y };
        frame.setPointerCapture(event.pointerId);
        frame.classList.add('is-dragging');
      });
      frame.addEventListener('pointermove', (event) => {
        if (!drag) return;
        edit.x = drag.startX + event.clientX - drag.x;
        edit.y = drag.startY + event.clientY - drag.y;
        apply();
      });
      const stopDrag = () => { drag = null; frame.classList.remove('is-dragging'); };
      frame.addEventListener('pointerup', stopDrag);
      frame.addEventListener('pointercancel', stopDrag);
      blankStack.append(block);
      requestAnimationFrame(apply);
    });
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
  }

  function syncCampaign() {
    template.value = campaign.value === 'campaign' ? '9.9 Paying Seller' : 'Mall BAU';
    template.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function syncTemplate() {
    const blank = templateMode.value === 'blank';
    document.documentElement.classList.toggle('blank-mode', blank);
    blankCard.hidden = !blank;
    if (!blank) showReview('Generate a banner, then select Refresh suggestions to analyse its rendered preview.');
  }

  campaign.addEventListener('change', syncCampaign);
  templateMode.addEventListener('change', syncTemplate);
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
  download.addEventListener('click', () => {
    if (templateMode.value !== 'blank') return originalDownload.click();
    if (!selectedOutputs().some((id) => blankUploads.has(id))) { reviewStatus.textContent = 'Upload at least one finished design before downloading.'; return; }
    selectedOutputs().filter((id) => blankUploads.has(id)).forEach((id) => downloadBlankOutput(id));
  });
  document.querySelector('#startReview').addEventListener('click', () => {
    if (templateMode.value === 'blank') return reviewBlankOutput(reviewedOutputId || selectedOutputs().find((id) => blankUploads.has(id)));
    const previewCanvas = document.querySelector('canvas.asset-canvas');
    if (!previewCanvas) return showReview('Generate a banner preview before requesting visual suggestions.');
    const item = Object.values(outputs).find((output) => output.title === previewCanvas.closest('.preview-block')?.querySelector('.preview-title')?.textContent) || { title: 'banner', canvasWidth: previewCanvas.width, canvasHeight: previewCanvas.height };
    const copiedCanvas = document.createElement('canvas');
    copiedCanvas.width = previewCanvas.width; copiedCanvas.height = previewCanvas.height;
    copiedCanvas.getContext('2d').drawImage(previewCanvas, 0, 0);
    displayReview(copiedCanvas, item);
  });
  syncOutputs();
  syncTemplate();
})();
