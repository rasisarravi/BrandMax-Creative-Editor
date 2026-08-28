const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
let scale = 1;

function readImage(input, apply) {
  const file = input.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  apply(url);
}

$$('.section-title').forEach((button) => button.addEventListener('click', () => {
  const section = button.closest('.section');
  section.classList.toggle('active');
}));

$('#brand-name').addEventListener('input', (e) => $('#banner-title').textContent = e.target.value || 'Brand name');
$$('.ksp').forEach((input, i) => input.addEventListener('input', (e) => $(i ? '#ksp-two' : '#ksp-one').textContent = e.target.value));
$('#kv-color').addEventListener('input', (e) => { $('#banner').style.background = e.target.value; $('#color-value').textContent = e.target.value.toUpperCase(); });
$('#sku-color').addEventListener('input', (e) => $('#product-card').style.background = e.target.value);

$('#brand-logo').addEventListener('change', function () { readImage(this, (url) => {
  $('#logo-preview').innerHTML = `<img src="${url}" alt="Brand logo">`;
  $('#banner-logo').innerHTML = `<img src="${url}" alt="Brand logo">`;
}); });
$('#remove-logo').addEventListener('click', () => { $('#logo-preview').textContent = 'B'; $('#banner-logo').textContent = 'B'; $('#brand-logo').value = ''; });
$('#sku-image').addEventListener('change', function () { readImage(this, (url) => { $('#product-image').src = url; $('#product-image').style.display = 'block'; $('#product-placeholder').style.display = 'none'; }); });
$('#kv-image').addEventListener('change', function () { readImage(this, (url) => { $('#banner').style.background = `linear-gradient(90deg, #00000030, #00000000), url(${url}) center/cover`; }); });

$('#campaign').addEventListener('change', (e) => $('#campaign-badge').style.display = e.target.value === 'campaign' ? 'block' : 'none');
$('#canvas-mode').addEventListener('change', (e) => {
  const blank = e.target.value === 'blank';
  $('#design-panel').classList.toggle('disabled', blank);
  $('#banner').classList.toggle('blank-banner', blank);
  if (blank) {
    $('#banner').style.background = '#fff';
    $('#banner').innerHTML = '<label class="blank-upload">Drop your finished design here<input id="blank-file" type="file" accept="image/*" /></label>';
    $('#blank-file').addEventListener('change', function () { readImage(this, (url) => $('#banner').style.background = `url(${url}) center/contain no-repeat #fff`); });
  } else location.reload();
});
$('#output').addEventListener('change', (e) => $('#canvas-meta').textContent = `${e.target.options[e.target.selectedIndex].text} · Shopee Mall BAU`);
function setZoom() { $('#banner').style.transform = `scale(${scale})`; $('#zoom-label').textContent = `${Math.round(scale * 100)}%`; }
$('#zoom-in').addEventListener('click', () => { scale = Math.min(1.16, scale + .08); setZoom(); });
$('#zoom-out').addEventListener('click', () => { scale = Math.max(.72, scale - .08); setZoom(); });
$('#export').addEventListener('click', () => { const toast = $('#toast'); toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2400); });
