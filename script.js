const DEFAULT_SKU_IMAGE = "";
const FONT_NAME = "ShopeeFontBlack";
const FONT_URL = "assets/fonts/shopee-font-black.ttf";
const OVERLAY_BASE = "assets/overlays/";
const OVERLAY_NO_CONTAINER_BASE = "assets/overlays-no-logo-container/";
const NEW_ARRIVAL_OVERLAY_BASE = "assets/new-arrival/overlays/";
const NEW_ARRIVAL_OVERLAY_NO_CONTAINER_BASE =
  "assets/new-arrival/overlays-no-logo-container/";
const PAYING_SELLER_OVERLAY_BASE = "assets/paying-seller/overlays/";
const PAYING_SELLER_OVERLAY_NO_CONTAINER_BASE =
  "assets/paying-seller/overlays-no-logo-container/";
const PAYING_SELLER_99_OVERLAY_BASE = "assets/paying-seller-99/overlays/";
const PAYING_SELLER_99_OVERLAY_NO_CONTAINER_BASE =
  "assets/paying-seller-99/overlays-no-logo-container/";
// "Inverse Logo" off (default) = colored/branded; on = plain white. Both the
// Shopee icon and New Arrival badge always swap between one of these two —
// unlike the Shopee Mall tag below, neither has a "leave the baked-in
// overlay art untouched" state, since the overlay's own baked-in versions
// don't match either the colored or the white variant on their own.
const ORANGE_SHOPEE_LOGO_URL = "assets/logos/Shopee-Logo-Vertical-Orange-icon.png";
const SHOPEE_LOGO_WHITE_URL = "assets/logos/shopee-logo-white.png";
const NEW_ARRIVAL_LOGO_COLOR_URL = "assets/logos/New-Arrival-Logo-Color.png";
const NEW_ARRIVAL_LOGO_WHITE_URL = "assets/logos/new-arrival-logo-white.png";
// Neutral starter graphic shown in the brand logo box before a real logo is
// uploaded (single editor default, and any bulk row without its own logo) —
// replaces the old hard-coded "cottonseeds" placeholder text so nothing that
// looks like a real/external brand shows before the user uploads their own.
// Package the supplied placeholder as a data URL too: this keeps the canvas
// export origin-clean when BrandMax is opened directly as a local file.
const BRAND_LOGO_PLACEHOLDER_URL =
  window.BrandMaxMallOverlays?.["brand-logo-placeholder"] ||
  "assets/logos/brand-logo-placeholder.png";
// Every Paying Seller template's background is a fixed campaign image (not
// a flat KV color), and each design only has artwork for these two formats.
const PAYING_SELLER_TEMPLATE = "8.8 Paying Seller";
// 9.9 reuses the exact same working-file layout as 8.8 (measured directly
// off both sets of design files — the logo box, KSP box, and KV/product
// split all land at identical coordinates at every canvas resolution), just
// re-skinned with its own campaign artwork and badge, so it shares
// payingSellerLayouts below rather than needing its own copy.
const PAYING_SELLER_99_TEMPLATE = "9.9 Paying Seller";
const PAYING_SELLER_OUTPUTS = new Set(["banner-card"]);
// Mall BAU / Mall BAU New Arrival's own 5 formats — needed as an explicit
// Set (not just "everything else in outputMeta") once Shopee Live FS added
// its own single-output entry to outputMeta, so that output doesn't
// accidentally show up as an allowed/selectable option for every other
// template's bulk rows too (see allowedOutputsForTemplate).
const MALL_BAU_OUTPUTS = new Set([
  "banner-card",
  "pop-up-banner",
  "skinny-banner",
  "floating-icon",
]);
// Every "X Paying Seller" template uses a fixed campaign background image
// baked into its overlay art instead of a flat, user-controlled KV area.
const PAYING_SELLER_TEMPLATES = new Set([PAYING_SELLER_TEMPLATE, PAYING_SELLER_99_TEMPLATE]);
function isPayingSellerTemplate(template) {
  return PAYING_SELLER_TEMPLATES.has(template);
}
// KV Color / KV Image only ever apply to the flat-background templates
// (Mall BAU, Mall BAU New Arrival) — every Paying Seller template keeps its
// own fixed campaign background regardless of this setting.
function templateUsesFlatKv(template) {
  return !isPayingSellerTemplate(template) && template !== SHOPEE_LIVE_FS_TEMPLATE;
}

// "Shopee Live Flash Sale" is a fixed-layout, single-output (1200x750,
// transparent PNG) template built for a live-shopping card design: one hero
// SKU plus two secondary SKUs, each with their own discount %, a brand logo
// + name, a live time badge, and a sliced/promo price pair. Unlike every
// other template here, it doesn't share the generic KV/logo/KSP layout
// model at all — see drawShopeeLiveFs, createShopeeLiveFsPreviewBlock, and
// SHOPEE_LIVE_FS_LAYOUT for its own dedicated (and much simpler, since
// there's only ever one output) rendering + editing path.
const SHOPEE_LIVE_FS_TEMPLATE = "Shopee Live Flash Sale";
const SHOPEE_LIVE_FS_OUTPUT_ID = "shopee-live-fs";
const SHOPEE_LIVE_FS_OUTPUTS = new Set([SHOPEE_LIVE_FS_OUTPUT_ID]);
const SHOPEE_LIVE_FS_OVERLAY_URL = "assets/shopee-live-fs/overlay.png";
function isShopeeLiveFsTemplate(template) {
  return template === SHOPEE_LIVE_FS_TEMPLATE;
}
// Every box below is measured directly off the design's own guide/overlay
// PNGs (Template Guide/Flash-Sale-Card-Template-Guide.png +
// -Overlay.png) at their native 1200x750 resolution — same "measure off the
// real files" approach used for payingSellerLayouts above.
const SHOPEE_LIVE_FS_LAYOUT = {
  time: { x: 420, y: 16, width: 359, height: 54, color: "#FFF200", maxSize: 34, minSize: 14 },
  productName: { x: 440, y: 84, width: 700, height: 64, color: "#000000", maxSize: 30, minSize: 16 },
  slicedPrice: { x: 440, y: 196, width: 260, height: 28, color: "#B3B3B3", size: 20 },
  promoPrice: { x: 440, y: 226, width: 300, height: 50, color: "#EE4D2D", size: 34 },
  // pillRadius/pillFill/pillBorder describe the small rounded badge card each
  // % sits on top of (measured off the guide's own badge shape — pillFill is
  // basically the same off-white as the page background, distinguished by
  // its border rather than a stark white/background contrast) — see
  // drawPctBadge, which draws this explicitly so it survives on top of the
  // SKU 2/3 photo instead of relying on the overlay art underneath it (that
  // baked-in badge gets painted over the moment an opaque photo covers it,
  // since pct2/pct3's box sits inside sku2Image/sku3Image's own box).
  pct1: {
    x: 277,
    y: 113,
    width: 105,
    height: 48,
    color: "#EE4D2D",
    size: 26,
    pillRadius: 10,
    pillFill: "#F9ECEA",
    pillBorder: "rgba(0, 0, 0, 0.12)",
  },
  productImage1: { x: 60, y: 189, width: 333, height: 337, radius: 16 },
  brandLogo: { x: 77, y: 543, width: 63, height: 62 },
  brandName: { x: 150, y: 549, width: 230, height: 50, color: "#1A1A1A", size: 20 },
  sku2Image: { x: 520, y: 363, width: 260, height: 260, radius: 16 },
  pct2: {
    x: 712,
    y: 363,
    width: 67,
    height: 30,
    color: "#EE4D2D",
    size: 17,
    pillRadius: 8,
    pillFill: "#F9ECEA",
    pillBorder: "rgba(0, 0, 0, 0.12)",
  },
  sku3Image: { x: 821, y: 363, width: 260, height: 259, radius: 16 },
  pct3: {
    x: 1013,
    y: 363,
    width: 67,
    height: 30,
    color: "#EE4D2D",
    size: 17,
    pillRadius: 8,
    pillFill: "#F9ECEA",
    pillBorder: "rgba(0, 0, 0, 0.12)",
  },
};
// In-browser background removal (WASM/ONNX, runs entirely client-side — no
// server, no upload). Loaded on demand from jsDelivr's ESM CDN build so the
// project keeps its zero-build-step, no-local-dependency setup.
const BACKGROUND_REMOVAL_MODULE_URL =
  "https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm";
// esm.sh is tried if jsDelivr's bundle fails to load or run — the package has
// a WASM peer dependency (onnxruntime-web) that not every CDN bundler
// resolves the same way, so a second source improves the odds this works on
// a given network/browser without any code changes needed.
const BACKGROUND_REMOVAL_FALLBACK_MODULE_URL =
  "https://esm.sh/@imgly/background-removal@1.7.0";
const EXPORT_MAX_BYTES = 250 * 1000;
const EXPORT_TARGET_BYTES = 248 * 1000;
const EXPORT_TYPE = "image/png";
const EXPORT_EXTENSION = "png";
const LOSSY_EXPORT_FORMATS = [
  { type: "image/jpeg", extension: "jpg", label: "JPG", minQuality: 0.01, maxQuality: 0.95 },
];
const DETAIL_LIMIT_SCALES = [
  0.95, 0.9, 0.85, 0.78, 0.72, 0.6, 0.5, 0.42, 0.35, 0.28, 0.22, 0.16, 0.1, 0.06,
];
const SIZE_LIMITED_OUTPUTS = new Set(["banner-card", "pop-up-banner", "floating-icon"]);
const EXTERNAL_SHOPEE_LOGO_OUTPUTS = new Set(["ig-story", "fb-post"]);
const SKU_ZOOM_MIN = 0.1;
const SKU_ZOOM_MAX = 3;
const SKU_ZOOM_DEFAULT = 1;
const LOGO_ZOOM_MIN = 0.5;
const LOGO_ZOOM_MAX = 3;
const LOGO_ZOOM_DEFAULT = 1;
// Absolute last-resort floor auto-fit will shrink to before giving up (not
// the same as a format's own layout.ksp.minSize, which is a curated "design
// intent" range used only for the manual override slider). Shared by
// drawFittedText's default path and the slider's initial-value estimate so
// the two can't silently drift apart.
const KSP_AUTOFIT_MIN_SIZE = 10;
const KSP_MAX_CHARACTERS = 50;
const SKU_BACKGROUND_BASE = "assets/sku-backgrounds/";
const SKU_BACKGROUND_COLLECTION_BASE = `${SKU_BACKGROUND_BASE}collections/`;
const BACKGROUND_COLLECTION_ALL = "all";
const BACKGROUND_CUSTOM_COLLECTION = "Custom";
const BACKGROUND_PAGE_SIZE = 8;
const BACKGROUND_NEW_ASSET_EXTENSION = "jpg";
const BACKGROUND_COLLECTION_ORDER = [
  BACKGROUND_CUSTOM_COLLECTION,
  "Product Studio",
  "Beauty",
  "Fashion Studio",
  "Electronics",
  "Home Appliance",
  "Furniture",
];
const BULK_ROWS_PAGE_SIZE = 10;
function skuBackground(id, label, collection, keywords = [], extension = "png", base = SKU_BACKGROUND_BASE) {
  return {
    id,
    label,
    collection,
    keywords,
    src: `${base}${id}.${extension}`,
  };
}
const SKU_BACKGROUNDS = [
  skuBackground("beauty", "Beauty", "Beauty", ["beauty", "clean", "soft", "product"]),
  skuBackground("beauty-2", "Beauty 2", "Beauty", ["beauty", "pink", "soft", "product"]),
  skuBackground("beauty-3", "Beauty 3", "Beauty", ["beauty", "premium", "soft", "product"]),
  skuBackground("beauty-flat-lay-1", "Beauty Flat Lay 1", "Beauty", ["beauty", "flat lay", "silk"]),
  skuBackground("beauty-flat-lay-2", "Beauty Flat Lay 2", "Beauty", ["beauty", "flat lay", "soft"]),
  skuBackground("generic-flat-lay", "Generic Flat Lay", "Product Studio", ["generic", "flat lay", "clean"]),
  skuBackground("generic-podium", "Generic Podium", "Product Studio", ["generic", "podium", "studio", "clean"]),
  skuBackground("groceries", "Groceries", "Product Studio", ["grocery", "groceries", "fresh"]),
  skuBackground("home-living", "Home & Living", "Furniture", ["home", "living", "furniture"]),
  skuBackground("home-living-2", "Home & Living 2", "Furniture", ["home", "living", "furniture"]),
  skuBackground("beauty-4", "Beauty 4", "Beauty", ["beauty", "simple", "clean"]),
  skuBackground("beauty-5", "Beauty 5", "Beauty", ["beauty", "warm", "clean"]),
  skuBackground("premium-beauty", "Premium Beauty", "Beauty", ["beauty", "premium", "luxury"]),
  skuBackground(
    "stone-wall",
    "Stone Wall",
    "Product Studio",
    ["stone", "wall", "neutral", "grey", "studio", "floor", "clean"],
    BACKGROUND_NEW_ASSET_EXTENSION,
    SKU_BACKGROUND_COLLECTION_BASE,
  ),
  skuBackground(
    "round-podium",
    "Round Podium",
    "Product Studio",
    ["round", "podium", "beige", "studio", "minimal", "clean"],
    BACKGROUND_NEW_ASSET_EXTENSION,
    SKU_BACKGROUND_COLLECTION_BASE,
  ),
  skuBackground(
    "blue-stage",
    "Blue Stage",
    "Electronics",
    ["blue", "stage", "podium", "electronics", "tech", "clean"],
    BACKGROUND_NEW_ASSET_EXTENSION,
    SKU_BACKGROUND_COLLECTION_BASE,
  ),
  skuBackground(
    "warm-glow",
    "Warm Glow",
    "Beauty",
    ["warm", "glow", "beige", "beauty", "soft", "clean"],
    BACKGROUND_NEW_ASSET_EXTENSION,
    SKU_BACKGROUND_COLLECTION_BASE,
  ),
  skuBackground(
    "wood-floor",
    "Wood Floor",
    "Furniture",
    ["wood", "floor", "home", "furniture", "room", "clean"],
    BACKGROUND_NEW_ASSET_EXTENSION,
    SKU_BACKGROUND_COLLECTION_BASE,
  ),
  skuBackground(
    "leaf-podium",
    "Leaf Podium",
    "Beauty",
    ["leaf", "podium", "green", "natural", "beauty", "fresh"],
    BACKGROUND_NEW_ASSET_EXTENSION,
    SKU_BACKGROUND_COLLECTION_BASE,
  ),
  skuBackground(
    "leaf-table",
    "Leaf Table",
    "Furniture",
    ["leaf", "table", "green", "natural", "wood", "home"],
    BACKGROUND_NEW_ASSET_EXTENSION,
    SKU_BACKGROUND_COLLECTION_BASE,
  ),
  skuBackground(
    "ribbed-blocks",
    "Ribbed Blocks",
    "Furniture",
    ["ribbed", "blocks", "furniture", "wood", "interior", "neutral"],
    BACKGROUND_NEW_ASSET_EXTENSION,
    SKU_BACKGROUND_COLLECTION_BASE,
  ),
  skuBackground(
    "wood-table",
    "Wood Table",
    "Furniture",
    ["wood", "table", "furniture", "home", "neutral", "clean"],
    BACKGROUND_NEW_ASSET_EXTENSION,
    SKU_BACKGROUND_COLLECTION_BASE,
  ),
  skuBackground(
    "orange-table",
    "Orange Table",
    "Fashion Studio",
    ["orange", "table", "fashion", "studio", "wood", "bold"],
    BACKGROUND_NEW_ASSET_EXTENSION,
    SKU_BACKGROUND_COLLECTION_BASE,
  ),
  skuBackground(
    "plant-room",
    "Plant Room",
    "Furniture",
    ["plant", "room", "wood", "home", "furniture", "clean"],
    BACKGROUND_NEW_ASSET_EXTENSION,
    SKU_BACKGROUND_COLLECTION_BASE,
  ),
  skuBackground(
    "pastel-podium",
    "Pastel Podium",
    "Beauty",
    ["pastel", "podium", "blue", "beauty", "soft", "clean"],
    BACKGROUND_NEW_ASSET_EXTENSION,
    SKU_BACKGROUND_COLLECTION_BASE,
  ),
  skuBackground(
    "color-arch",
    "Color Arch",
    "Fashion Studio",
    ["color", "arch", "fashion", "studio", "orange", "teal"],
    BACKGROUND_NEW_ASSET_EXTENSION,
    SKU_BACKGROUND_COLLECTION_BASE,
  ),
  skuBackground(
    "green-counter",
    "Green Counter",
    "Home Appliance",
    ["green", "counter", "home", "appliance", "interior", "table"],
    BACKGROUND_NEW_ASSET_EXTENSION,
    SKU_BACKGROUND_COLLECTION_BASE,
  ),
  skuBackground(
    "brown-table",
    "Brown Table",
    "Furniture",
    ["brown", "table", "wood", "furniture", "premium", "clean"],
    BACKGROUND_NEW_ASSET_EXTENSION,
    SKU_BACKGROUND_COLLECTION_BASE,
  ),
  skuBackground(
    "white-studio",
    "White Studio",
    "Product Studio",
    ["white", "studio", "clean", "minimal", "neutral", "shadow"],
    BACKGROUND_NEW_ASSET_EXTENSION,
    SKU_BACKGROUND_COLLECTION_BASE,
  ),
];

const outputMeta = {
  "category-banner": {
    title: "Category Banner",
    width: 1200,
    height: 360,
    overlay: `${OVERLAY_BASE}category-banner.png`,
    overlayNoContainer: `${OVERLAY_NO_CONTAINER_BASE}category-banner.png`,
    newArrivalOverlay: `${NEW_ARRIVAL_OVERLAY_BASE}category-banner.png`,
    newArrivalOverlayNoContainer: `${NEW_ARRIVAL_OVERLAY_NO_CONTAINER_BASE}category-banner.png`,
    payingSellerOverlay: `${PAYING_SELLER_OVERLAY_BASE}category-banner.png`,
    payingSellerOverlayNoContainer: `${PAYING_SELLER_OVERLAY_NO_CONTAINER_BASE}category-banner.png`,
    paying99Overlay: `${PAYING_SELLER_99_OVERLAY_BASE}category-banner.png`,
    paying99OverlayNoContainer: `${PAYING_SELLER_99_OVERLAY_NO_CONTAINER_BASE}category-banner.png`,
  },
  "top-module-banner": {
    title: "Top Module Banner",
    width: 1125,
    height: 156,
    overlay: `${OVERLAY_BASE}top-module-banner.png`,
    overlayNoContainer: `${OVERLAY_NO_CONTAINER_BASE}top-module-banner.png`,
    newArrivalOverlay: `${NEW_ARRIVAL_OVERLAY_BASE}top-module-banner.png`,
    newArrivalOverlayNoContainer: `${NEW_ARRIVAL_OVERLAY_NO_CONTAINER_BASE}top-module-banner.png`,
  },
  "ig-story": {
    title: "IG Story",
    width: 1080,
    height: 1920,
    overlay: `${OVERLAY_BASE}ig-story.png`,
    overlayNoContainer: `${OVERLAY_NO_CONTAINER_BASE}ig-story.png`,
    newArrivalOverlay: `${NEW_ARRIVAL_OVERLAY_BASE}ig-story.png`,
    newArrivalOverlayNoContainer: `${NEW_ARRIVAL_OVERLAY_NO_CONTAINER_BASE}ig-story.png`,
  },
  "fb-post": {
    title: "FB Post",
    width: 1200,
    height: 630,
    overlay: `${OVERLAY_BASE}fb-post.png`,
    overlayNoContainer: `${OVERLAY_NO_CONTAINER_BASE}fb-post.png`,
    newArrivalOverlay: `${NEW_ARRIVAL_OVERLAY_BASE}fb-post.png`,
    newArrivalOverlayNoContainer: `${NEW_ARRIVAL_OVERLAY_NO_CONTAINER_BASE}fb-post.png`,
  },
  "banner-card": {
    title: "Banner Card",
    width: 531,
    height: 792,
    overlay: `${OVERLAY_BASE}banner-card.png`,
    overlayNoContainer: `${OVERLAY_NO_CONTAINER_BASE}banner-card.png`,
    newArrivalOverlay: `${NEW_ARRIVAL_OVERLAY_BASE}banner-card.png`,
    newArrivalOverlayNoContainer: `${NEW_ARRIVAL_OVERLAY_NO_CONTAINER_BASE}banner-card.png`,
    payingSellerOverlay: `${PAYING_SELLER_OVERLAY_BASE}banner-card.png`,
    payingSellerOverlayNoContainer: `${PAYING_SELLER_OVERLAY_NO_CONTAINER_BASE}banner-card.png`,
    paying99Overlay: `${PAYING_SELLER_99_OVERLAY_BASE}banner-card.png`,
    paying99OverlayNoContainer: `${PAYING_SELLER_99_OVERLAY_NO_CONTAINER_BASE}banner-card.png`,
  },
  "pop-up-banner": {
    title: "Pop Up Banner",
    width: 580,
    height: 720,
    overlay: window.BrandMaxMallOverlays?.["popup-standard"] || "Template/Pop%20Up%20Banner/Standard/Pop-Up-template-Overlay.png",
  },
  "skinny-banner": {
    title: "Skinny Banner",
    width: 1200,
    height: 360,
    // Keep the original supplied template art, encoded locally so canvas
    // exports also work when the tool is opened directly from file://.
    overlay: window.BrandMaxMallOverlays?.["skinny-standard"] || "Template/Skinny%20Banner/Standard/skinny-standard-guide-overlay.png",
  },
  "floating-icon": {
    title: "Floating Icon",
    width: 360,
    height: 360,
    overlay: window.BrandMaxMallOverlays?.["floating-horizontal"] || "Template/Floating%20Icon/Floating-Icon-Overlay-Horizontal-Logo.png",
  },
  // Its own single, fixed-size, transparent-PNG output — never resized or
  // compressed like the internal-platform formats above (not in
  // SIZE_LIMITED_OUTPUTS), same treatment as IG Story / FB Post.
  [SHOPEE_LIVE_FS_OUTPUT_ID]: {
    title: "Shopee Live Flash Sale",
    width: 1200,
    height: 750,
    overlay: SHOPEE_LIVE_FS_OVERLAY_URL,
  },
};

const newArrivalLogoBoxes = {
  "Category Banner": { x: 99.2, y: 117.5, width: 294.4, height: 97.5, radius: 18 },
  "Top Module Banner": { x: 361.5, y: 14.2, width: 198.7, height: 65.9, radius: 12 },
  "IG Story": { x: 282.9, y: 467.2, width: 514.5, height: 170.2, radius: 30 },
  "FB Post": { x: 122.4, y: 264, width: 373.6, height: 124, radius: 23 },
  "Banner Card": { x: 128.8, y: 162.1, width: 274.1, height: 91.3, radius: 17 },
};

const newArrivalKspBoxes = {
  "Category Banner": { x: 50, y: 240, width: 400, height: 90, maxSize: 42, minSize: 22 },
  "Top Module Banner": { x: 332, y: 90, width: 258, height: 58, maxSize: 25, minSize: 14 },
  "IG Story": { x: 135, y: 675, width: 810, height: 150, maxSize: 68, minSize: 34 },
  "FB Post": { x: 72, y: 420, width: 474, height: 110, maxSize: 50, minSize: 28 },
  "Banner Card": { x: 70, y: 270, width: 392, height: 90, maxSize: 42, minSize: 24 },
};

// Full per-format layout override shared by every Paying Seller template
// (8.8, 9.9, ...) — its KV/product split and logo/KSP positions differ from
// Mall BAU (the badge and campaign artwork take up more room), measured
// directly off each template's own design files at each format's canvas
// resolution. 9.9 reuses these exact same coordinates (confirmed by
// measuring its design files too — same working file, re-skinned artwork).
// Only Category Banner and Banner Card have artwork, matching the two
// outputs every Paying Seller template allows.
const payingSellerLayouts = {
  "Category Banner": {
    kv: { x: 0, y: 0, width: 581, height: 360 },
    product: { x: 581, y: 0, width: 1200 - 581, height: 360 },
    logo: { x: 126, y: 79, width: 322, height: 107, radius: 19 },
    // Widened from the original 320 (x: 126) so two KSP phrases have room to
    // land on two lines instead of wrapping to three. x shifted to 57 so the
    // wider box keeps the same horizontal center as the logo box above it
    // (~287px) rather than growing off-center.
    ksp: { x: 57, y: 205, width: 460, height: 125, maxSize: 58.67, minSize: 34 },
    productAlign: [0.62, 0.58],
  },
  "Banner Card": {
    kv: { x: 0, y: 0, width: 531, height: 381 },
    product: { x: 0, y: 381, width: 531, height: 792 - 381 },
    logo: { x: 115, y: 100, width: 300, height: 100, radius: 18 },
    // Same fix as Category Banner: widened from 314 (x: 110), re-centered on
    // the logo box's horizontal center (~265px) at x: 65.
    ksp: { x: 65, y: 222, width: 400, height: 100, maxSize: 42, minSize: 24 },
    productAlign: [0.5, 0.42],
  },
};

const externalShopeeLogoBoxes = {
  "ig-story": { x: 61, y: 180, width: 114, height: 128 },
  "fb-post": { x: 41, y: 39, width: 66, height: 74 },
};

const externalShopeeLogoClearBoxes = {
  "ig-story": { x: 50, y: 168, width: 138, height: 154 },
  "fb-post": { x: 34, y: 31, width: 82, height: 92 },
};

// Where the "NEW ARRIVAL" badge sits within the Mall BAU New Arrival overlay,
// measured directly off the overlay art at each format's canvas resolution.
// Unlike the Shopee icon swap (IG Story / FB Post only), this applies to
// every output format since the New Arrival badge appears on all of them.
const newArrivalLogoColorBoxes = {
  "category-banner": { x: 101, y: 40, width: 291, height: 53 },
  "top-module-banner": { x: 28, y: 55, width: 244, height: 45 },
  "ig-story": { x: 273, y: 350, width: 534, height: 93 },
  "fb-post": { x: 125, y: 166, width: 368, height: 65 },
  "banner-card": { x: 100, y: 84, width: 331, height: 59 },
};

const newArrivalLogoColorClearBoxes = {
  "category-banner": { x: 93, y: 32, width: 307, height: 69 },
  "top-module-banner": { x: 18, y: 45, width: 264, height: 65 },
  "ig-story": { x: 263, y: 340, width: 554, height: 113 },
  "fb-post": { x: 117, y: 158, width: 384, height: 81 },
  "banner-card": { x: 94, y: 78, width: 343, height: 71 },
};

// Where the baked-in "Shopee Mall | 100% ORI" tag sits within the Mall BAU /
// Mall BAU New Arrival overlay art, measured directly off the overlay files
// (each design file is authored ~4.17x the app's own output resolution, so
// these are already converted down to each format's own coordinate space).
// Same position in both Mall BAU and New Arrival — only the badge differs
// between those two templates, not the tag. Not defined for 8.8 Paying
// Seller: its tag is part of a non-flat campaign background image, not a
// separate element sitting on a flat color, so it isn't safe to mask the
// same way.
const shopeeMallTagBoxes = {
  "category-banner": { x: 883, y: 41, width: 317, height: 50 },
  "top-module-banner": { x: 1009, y: 14, width: 116, height: 52 },
  "fb-post": { x: 793, y: 43, width: 407, height: 65 },
  "ig-story": { x: 597, y: 222, width: 483, height: 77 },
  "banner-card": { x: 87, y: 0, width: 358, height: 57 },
};

// Padded a little beyond the tag's own bounds (clamped to the canvas) so the
// clear-then-redraw trick fully covers its rounded corners.
const shopeeMallTagClearBoxes = {
  "category-banner": { x: 867, y: 25, width: 333, height: 82 },
  "top-module-banner": { x: 995, y: 0, width: 130, height: 80 },
  "fb-post": { x: 777, y: 27, width: 423, height: 97 },
  "ig-story": { x: 581, y: 206, width: 499, height: 109 },
  "banner-card": { x: 71, y: 0, width: 390, height: 73 },
};

// "Inverse" tag artwork (Shopee text in red instead of a solid red pill),
// used only for Banner Card and IG Story when Inverse Logo is on — matches
// the same "Inverse Logo" toggle that already swaps in colored logo variants
// for light KV colors elsewhere.
const SHOPEE_MALL_TAG_INVERSE_URLS = {
  "banner-card": "assets/logos/shopee-mall-tag-banner-card-inverse.png",
  "ig-story": "assets/logos/shopee-mall-tag-ig-story-inverse.png",
};

const state = {
  template: "Mall BAU",
  brandLogoUrl: "",
  // The pristine, never-background-removed / never-touched-up logo — same
  // idea as originalSkuImageUrl below, set whenever a genuinely new logo is
  // uploaded or loaded, left untouched by Remove Background/Touch Up saves,
  // so the Touch Up Restore brush can always bring back the real original.
  originalBrandLogoUrl: "",
  brandLogoLabel: "Upload",
  hideLogoContainer: false,
  // "Inverse Logo" toggle. false (default, unchecked) = colored/branded
  // Shopee icon + New Arrival badge, and the Shopee Mall tag's baked-in
  // default (red pill, white text). true (checked) = plain white icon +
  // badge variants, and the Mall tag's inverse (red text) artwork. See
  // drawOutput's shopeeIconUrl/newArrivalBadgeUrl/shouldUseInverseShopeeMallTag.
  useOrangeShopeeLogo: false,
  skuImageUrl: DEFAULT_SKU_IMAGE,
  // The pristine, never-background-removed / never-touched-up photo — set
  // whenever a genuinely new image is uploaded or loaded by link, but left
  // untouched by Remove Background or Touch Up saves. Lets the Touch Up
  // Restore brush bring back pixels from the true original at any time,
  // even ones Remove Background fully erased, not only ones it left
  // translucent.
  originalSkuImageUrl: DEFAULT_SKU_IMAGE,
  skuImageLabel: "Upload",
  skuLink: "",
  // Populated when the SKU Image field is given a Shopee product page URL
  // (see isShopeeProductPageUrl/fetchShopeeProductImageCandidates) instead of
  // a direct image hash/link — every image candidate found for that product,
  // shown as a "Select SKU Image" gallery so the user picks which one
  // actually becomes skuImageUrl. Empty whenever the field was loaded the
  // normal way (upload, or a direct hash/link) instead.
  skuImageCandidates: [],
  ksp: "EXCLUSIVE LAUNCH DISKON 25%",
  kspColor: "#FFFFFF",
  kvColor: "#EE4D2D",
  // "color" (default) fills the KV area with kvColor, same as before. "image"
  // draws kvImageUrl instead, cover-fit and editable per output via the "KV"
  // layer switch (drag position + zoom), same mechanics as the SKU
  // Background layer. Only Mall BAU / Mall BAU New Arrival ever read this —
  // every Paying Seller template keeps its fixed campaign background image
  // regardless of this value (see templateUsesFlatKv).
  kvMode: "color",
  kvImageUrl: "",
  kvImageLabel: "Upload",
  kvImagePositions: {},
  kvImageZooms: {},
  outputs: new Set(["banner-card"]),
  floatingLogoRatio: "horizontal",
  skuPositions: {},
  skuZooms: {},
  // Brand logo has no drag/position — only a per-output zoom multiplier,
  // cropped by its rounded-rect box (like SKU zoom, just no repositioning).
  logoZooms: {},
  // Per-output manual font size override for the KSP text. Unset (no key
  // for that output) means "keep auto-fit" — the existing behavior of
  // shrinking from maxSize until the text fits its box. Once set, it skips
  // auto-fit entirely, letting the user force a specific size so wrapping
  // lands exactly where they want (e.g. two phrases landing on two lines
  // instead of the auto-fit algorithm choosing a different break point).
  kspFontSizes: {},
  // Per-output vertical-only offset (raw pixels from the format's designed
  // KSP position) set by dragging the KSP box on the canvas. Horizontal
  // position is never touched — the text always stays centered on the same
  // horizontal center drawFittedText already uses, only its y shifts.
  kspOffsets: {},
  // Per-output manual line-break override, set by double-clicking a banner's
  // KSP text and pressing Enter while editing it directly on that canvas.
  // Holds the exact text WITH the "\n" the user forced in, only for that one
  // output — every other output keeps auto-wrapping the shared `ksp` text on
  // its own. Typing/deleting actual characters (not just moving where a line
  // breaks) always writes straight to the shared `ksp` field instead, so
  // wording stays in sync everywhere; see commitKspTextChange. An override
  // here is dropped the moment the shared wording it was based on changes
  // elsewhere, since a stale line-break position over new words would no
  // longer make sense.
  kspManualBreaksByOutput: {},
  // On/off: hides the baked-in "Shopee Mall | 100% ORI" tag across every
  // output by painting over it with the flat KV color (no new template
  // needed — see shopeeMallTagClearBoxes). Only applies to Mall BAU / Mall
  // BAU New Arrival, whose tag sits on a flat KV-colored area; 8.8 Paying
  // Seller's tag is baked into a non-flat campaign background image and
  // isn't affected by this toggle.
  hideShopeeMallTag: false,
  skuBackgroundIndex: -1, // -1 = "None"; 0..N-1 indexes into SKU_BACKGROUNDS
  skuBackgroundPositions: {},
  skuBackgroundZooms: {},
  // Flat fill behind the product area when SKU Background is "None" (and a
  // transparent-background SKU photo doesn't cover it). Matches the previous
  // hardcoded look by default; only editable while no scene is selected.
  skuBackgroundColor: "#FFF3F6",
  // Per-output, UI-only: which layer (sku or background) the canvas drag +
  // zoom slider currently controls. Every render "context" (the single
  // editor's `state`, or a bulk row acting as its own context) carries its
  // own copy of this so they never interfere with each other.
  activeLayerByOutput: {},
  hue: 10,
  saturation: 0.81,
  value: 0.93,

  // --- Shopee Live Flash Sale (see SHOPEE_LIVE_FS_LAYOUT/drawShopeeLiveFs) ---
  // Everything below is only ever read/drawn when template is "Shopee Live
  // Flash Sale" — harmless leftover state on any other template. All of the
  // text fields are edited by double-clicking them directly on the canvas
  // (see openFieldEditor) — none has a sidebar input of its own.
  // brandNameRaw is shared with the bulk-row list-label field of the same
  // name (see createBulkRowsFromCsv): for every other template it's an
  // editor-only identifier, but here it's also the actual rendered Brand
  // Name text.
  brandNameRaw: "",
  liveTime: "PK. 08.00 WIB",
  skuName1: "Product Name Here",
  skuPriceBefore1: "Rp217.800",
  skuPriceAfter1: "Rp72.000",
  skuPct1: "-67%",
  skuPct2: "-30%",
  skuPct3: "-12%",
  // SKU 2 / SKU 3 each get their own image + pristine-original + drag/zoom
  // state — same shape as the skuImageUrl/originalSkuImageUrl/skuPositions/
  // skuZooms fields SKU 1 reuses directly (it's this template's "hero" SKU).
  sku2ImageUrl: "",
  originalSku2ImageUrl: "",
  sku2ImageLabel: "Upload",
  sku2Positions: {},
  sku2Zooms: {},
  sku3ImageUrl: "",
  originalSku3ImageUrl: "",
  sku3ImageLabel: "Upload",
  sku3Positions: {},
  sku3Zooms: {},
};

const els = {
  templateSelect: document.querySelector("#templateSelect"),
  templateLabel: document.querySelector("#templateLabel"),
  brandLogoInput: document.querySelector("#brandLogoInput"),
  brandFileName: document.querySelector("#brandFileName"),
  floatingIconConfigRow: document.querySelector("#floatingIconConfigRow"),
  floatingLogoRatio: document.querySelector("#floatingLogoRatio"),
  floatingLogoZoom: document.querySelector("#floatingLogoZoom"),
  floatingLogoZoomValue: document.querySelector("#floatingLogoZoomValue"),
  floatingDesignZoom: document.querySelector("#floatingDesignZoom"),
  floatingDesignZoomValue: document.querySelector("#floatingDesignZoomValue"),
  logoContainerToggle: document.querySelector("#logoContainerToggle"),
  logoContainerToggleRow: document.querySelector("#logoContainerToggleRow"),
  shopeeLogoToggle: document.querySelector("#shopeeLogoToggle"),
  inverseLogoRow: document.querySelector("#inverseLogoRow"),
  shopeeMallLogoToggle: document.querySelector("#shopeeMallLogoToggle"),
  shopeeMallLogoRow: document.querySelector("#shopeeMallLogoRow"),
  skuImageFieldLabel: document.querySelector("#skuImageFieldLabel"),
  kspHintRow: document.querySelector("#kspHintRow"),
  kspColorFieldRow: document.querySelector("#kspColorFieldRow"),
  outputRow: document.querySelector("#outputRow"),
  skuImageInput: document.querySelector("#skuImageInput"),
  skuFileName: document.querySelector("#skuFileName"),
  skuLink: document.querySelector("#skuLink"),
  loadSkuLinkButton: document.querySelector("#loadSkuLinkButton"),
  skuImageGalleryRow: document.querySelector("#skuImageGalleryRow"),
  skuImageGallery: document.querySelector("#skuImageGallery"),
  skuImageGalleryError: document.querySelector("#skuImageGalleryError"),
  removeBgButton: document.querySelector("#removeBgButton"),
  removeBgError: document.querySelector("#removeBgError"),
  editSkuButton: document.querySelector("#editSkuButton"),
  removeLogoBgButton: document.querySelector("#removeLogoBgButton"),
  removeLogoBgError: document.querySelector("#removeLogoBgError"),
  editLogoButton: document.querySelector("#editLogoButton"),
  // --- Shopee Live FS only: SKU 2 / SKU 3 image upload + Remove BG/Touch Up
  // (SKU 1 reuses the fields/buttons above directly — it's this template's
  // hero SKU). See EDIT_TARGETS and shopeeLiveFsPanel.
  shopeeLiveFsPanel: document.querySelector("#shopeeLiveFsPanel"),
  sku2ImageInput: document.querySelector("#sku2ImageInput"),
  sku2FileName: document.querySelector("#sku2FileName"),
  removeBg2Button: document.querySelector("#removeBg2Button"),
  removeBg2Error: document.querySelector("#removeBg2Error"),
  editSku2Button: document.querySelector("#editSku2Button"),
  sku3ImageInput: document.querySelector("#sku3ImageInput"),
  sku3FileName: document.querySelector("#sku3FileName"),
  removeBg3Button: document.querySelector("#removeBg3Button"),
  removeBg3Error: document.querySelector("#removeBg3Error"),
  editSku3Button: document.querySelector("#editSku3Button"),
  editSkuTitle: document.querySelector("#editSkuTitle"),
  editSkuOverlay: document.querySelector("#editSkuOverlay"),
  editSkuCloseButton: document.querySelector("#editSkuCloseButton"),
  editSkuEraseButton: document.querySelector("#editSkuEraseButton"),
  editSkuRestoreButton: document.querySelector("#editSkuRestoreButton"),
  editSkuBrushSize: document.querySelector("#editSkuBrushSize"),
  editSkuResetButton: document.querySelector("#editSkuResetButton"),
  editSkuCanvas: document.querySelector("#editSkuCanvas"),
  editSkuCancelButton: document.querySelector("#editSkuCancelButton"),
  editSkuSaveButton: document.querySelector("#editSkuSaveButton"),
  editSkuBrushCursor: document.querySelector("#editSkuBrushCursor"),
  editSkuBackdropButtons: document.querySelectorAll("#editSkuOverlay button[data-backdrop]"),
  editSkuCanvasWrap: document.querySelector("#editSkuCanvasWrap"),
  bgSearchInput: document.querySelector("#bgSearchInput"),
  bgCollectionSelect: document.querySelector("#bgCollectionSelect"),
  bgUploadInput: document.querySelector("#bgUploadInput"),
  bgThumbGrid: document.querySelector("#bgThumbGrid"),
  bgPrevButton: document.querySelector("#bgPrevButton"),
  bgNextButton: document.querySelector("#bgNextButton"),
  bgResultsLabel: document.querySelector("#bgResultsLabel"),
  skuBackgroundRow: document.querySelector("#skuBackgroundRow"),
  skuBgColorRow: document.querySelector("#skuBgColorRow"),
  skuBgColorInput: document.querySelector("#skuBgColorInput"),
  skuBgColorHex: document.querySelector("#skuBgColorHex"),
  skuBgColorDot: document.querySelector("#skuBgColorDot"),
  skuBgColorHint: document.querySelector("#skuBgColorHint"),
  kspColorInput: document.querySelector("#kspColorInput"),
  kspColorHex: document.querySelector("#kspColorHex"),
  kspColorDot: document.querySelector("#kspColorDot"),
  nativeColor: document.querySelector("#nativeColor"),
  hexInput: document.querySelector("#hexInput"),
  hueRange: document.querySelector("#hueRange"),
  colorDot: document.querySelector("#colorDot"),
  colorCanvas: document.querySelector("#colorCanvas"),
  swatchGrid: document.querySelector("#swatchGrid"),
  colorPicker: document.querySelector("#colorPicker"),
  kvColorRow: document.querySelector("#kvColorRow"),
  kvColorHint: document.querySelector("#kvColorHint"),
  kvModeToggle: document.querySelector("#kvModeToggle"),
  kvImagePanel: document.querySelector("#kvImagePanel"),
  kvImageInput: document.querySelector("#kvImageInput"),
  kvImageFileName: document.querySelector("#kvImageFileName"),
  outputButtons: document.querySelector("#outputButtons"),
  downloadAllButton: document.querySelector("#downloadAllButton"),
  undoButton: document.querySelector("#undoButton"),
  redoButton: document.querySelector("#redoButton"),
  previewList: document.querySelector("#previewList"),
  statusPill: document.querySelector("#statusPill"),
  stageBanner: document.querySelector("#stageBanner"),
  stageBannerText: document.querySelector("#stageBannerText"),
  stageBannerExit: document.querySelector("#stageBannerExit"),
  themeToggle: document.querySelector("#themeToggle"),
  brandLogo: document.querySelector("#brandLogo"),
  bulkPanel: document.querySelector("#bulkPanel"),
  bulkCsvInput: document.querySelector("#bulkCsvInput"),
  bulkCsvFileName: document.querySelector("#bulkCsvFileName"),
  bulkTemplateButton: document.querySelector("#bulkTemplateButton"),
  bulkCsvHint: document.querySelector("#bulkCsvHint"),
  bulkDefaultsRow: document.querySelector("#bulkDefaultsRow"),
  bulkRemoveBgAllButton: document.querySelector("#bulkRemoveBgAllButton"),
  bulkRemoveBgAllProgress: document.querySelector("#bulkRemoveBgAllProgress"),
  bulkDefaultOutputs: document.querySelector("#bulkDefaultOutputs"),
  bulkRows: document.querySelector("#bulkRows"),
  bulkRowsPager: document.querySelector("#bulkRowsPager"),
  bulkRowsPrevButton: document.querySelector("#bulkRowsPrevButton"),
  bulkRowsNextButton: document.querySelector("#bulkRowsNextButton"),
  bulkRowsPageLabel: document.querySelector("#bulkRowsPageLabel"),
  bulkEmptyState: document.querySelector("#bulkEmptyState"),
  bulkSummary: document.querySelector("#bulkSummary"),
  bulkGenerateButton: document.querySelector("#bulkGenerateButton"),
};

const swatches = [
  "#EE4D2D",
  "#D0011B",
  "#113366",
  "#0053DE",
  "#26AA99",
  "#FFBB00",
];

const imageCache = new Map();
const imageContentBounds = new WeakMap();
const zipEncoder = new TextEncoder();
// Off-DOM canvas used only to measure text — lets the KSP font-size slider
// start at whatever size auto-fit would currently render, instead of a
// hardcoded guess, without needing a real preview canvas to already exist.
const measureCanvas = document.createElement("canvas");
const measureCtx = measureCanvas.getContext("2d");
let fontReady;
let renderVersion = 0;
let skuDrag = null;
// null = the main editor is showing/editing the single-brand `state`.
// When set, it's a bulk-CSV row object — the same shared render pipeline
// (createPreviewBlock/drawOutput/downloadCanvas) and every sidebar field
// then read/write that row instead, so it becomes a full editor for that
// row without any separate/duplicated UI.
let activeRow = null;
let backgroundRemovalModulePromise = null;
let bgRemovalRunning = false;
// Non-null only while the Touch Up modal is open. Holds the editing canvas,
// the untouched baseline image the Restore brush copies from, and the
// current tool/brush settings for the in-progress session.
let editSkuState = null;
// Persists across modal opens within the session (not saved) — "checker" is
// the original look; "light"/"dark" are solid backdrops that make it easier
// to spot leftover/under-erased background bits a checkerboard can hide.
let editSkuBackdrop = "checker";
// Non-null only while a KSP inline text editor (opened by double-clicking a
// banner's KSP text) is open. Only one can be open at a time, same as the
// Touch Up modal — see openKspEditor/closeKspEditor.
let kspEditState = null;
let backgroundPickerState = {
  query: "",
  collection: BACKGROUND_COLLECTION_ALL,
  page: 0,
};
let customBackgroundSeq = 0;
const customBackgroundObjectUrls = new Set();

function editingContext() {
  return activeRow || state;
}

function editingOutputs() {
  return activeRow
    ? BULK_OUTPUT_IDS.filter((outputId) => activeRow.outputs.has(outputId))
    : selectedOutputs();
}

// ---------------------------------------------------------------------------
// Undo / redo.
//
// One history stack per editing context (the single editor's `state`, and
// each bulk row that's been opened for preview/edit — keyed by object
// identity via a WeakMap, so switching rows never mixes up their trails).
// Every discrete edit is one undo step: a color pick, a toggle, a template
// swap, an image upload/Remove Background run/Touch Up save, one drag
// gesture start-to-release, or one slider adjustment start-to-release.
// Continuous interactions commit once at the *start* of the gesture (see
// commitHistoryStart/commitHistoryEnd below) so a whole drag or slider drag
// counts as a single step instead of one per intermediate tick.
// ---------------------------------------------------------------------------
const historyStore = new WeakMap();

// The fields that make up a context's undoable edit state. Deliberately a
// fixed allowlist (not the whole context object) so snapshots stay small and
// can't choke on anything a bulk row might carry that isn't plain edit data
// (cached fetch/resolve bookkeeping, etc.).
const HISTORY_FIELDS = [
  "template",
  "brandLogoUrl",
  "originalBrandLogoUrl",
  "brandLogoLabel",
  "hideLogoContainer",
  "useOrangeShopeeLogo",
  "hideShopeeMallTag",
  "skuImageUrl",
  "originalSkuImageUrl",
  "skuImageLabel",
  "ksp",
  "kspColor",
  "kvColor",
  "kvMode",
  "kvImageUrl",
  "kvImageLabel",
  "kvImagePositions",
  "kvImageZooms",
  "outputs",
  "floatingLogoRatio",
  "skuPositions",
  "skuZooms",
  "logoZooms",
  "kspFontSizes",
  "kspOffsets",
  "kspManualBreaksByOutput",
  "skuBackgroundIndex",
  "skuBackgroundPositions",
  "skuBackgroundZooms",
  "skuBackgroundColor",
  "activeLayerByOutput",
  "hue",
  "saturation",
  "value",
  "brandNameRaw",
  "liveTime",
  "skuName1",
  "skuPriceBefore1",
  "skuPriceAfter1",
  "skuPct1",
  "skuPct2",
  "skuPct3",
  "sku2ImageUrl",
  "originalSku2ImageUrl",
  "sku2ImageLabel",
  "sku2Positions",
  "sku2Zooms",
  "sku3ImageUrl",
  "originalSku3ImageUrl",
  "sku3ImageLabel",
  "sku3Positions",
  "sku3Zooms",
];
const HISTORY_LIMIT = 60;

function getHistory(context) {
  let entry = historyStore.get(context);
  if (!entry) {
    entry = { past: [], future: [], pending: null };
    historyStore.set(context, entry);
  }
  return entry;
}

function snapshotContext(context) {
  const snap = {};
  HISTORY_FIELDS.forEach((key) => {
    snap[key] = structuredClone(context[key]);
  });
  return snap;
}

function restoreContext(context, snap) {
  HISTORY_FIELDS.forEach((key) => {
    if (key in snap) context[key] = structuredClone(snap[key]);
  });
}

// Cheap deep-equality so a gesture that opened-and-closed without actually
// changing anything (e.g. clicking a slider without moving it) doesn't add a
// no-op undo step. Every field here is plain JSON-safe data except Sets
// (`outputs`), normalized to a sorted array first.
function snapshotsEqual(a, b) {
  const normalize = (snap) => {
    const copy = {};
    HISTORY_FIELDS.forEach((key) => {
      const value = snap[key];
      copy[key] = value instanceof Set ? Array.from(value).sort() : value;
    });
    return JSON.stringify(copy);
  };
  return normalize(a) === normalize(b);
}

// Guards restoreContext() calls (inside undo/redo) from being mistaken for a
// fresh user edit by anything that happens to call commitHistoryStart/End
// afterward (e.g. re-syncing the sidebar can re-trigger element listeners).
let restoringHistory = false;

// Call right before a discrete edit begins (a click, a toggle, the first
// pointermove of a drag, the first tick of a slider, focusing a text field).
// Safe to call repeatedly for the same in-progress gesture — only the first
// call opens a pending "before" snapshot; commitHistoryEnd() closes it.
function commitHistoryStart(context) {
  if (restoringHistory) return;
  const history = getHistory(context);
  if (history.pending) return;
  history.pending = snapshotContext(context);
}

// Call when a gesture ends (pointerup, blur/change, or right after a
// synchronous mutation). Pushes the pending "before" snapshot onto the undo
// stack only if the context actually changed, and always clears redo.
function commitHistoryEnd(context) {
  if (restoringHistory) return;
  const history = getHistory(context);
  if (!history.pending) return;
  const before = history.pending;
  history.pending = null;
  if (snapshotsEqual(before, snapshotContext(context))) return;
  history.past.push(before);
  if (history.past.length > HISTORY_LIMIT) history.past.shift();
  history.future = [];
  updateUndoRedoButtons();
}

function undo() {
  const context = editingContext();
  const history = getHistory(context);
  history.pending = null;
  if (!history.past.length) return;
  const current = snapshotContext(context);
  const previous = history.past.pop();
  history.future.push(current);
  restoringHistory = true;
  restoreContext(context, previous);
  restoringHistory = false;
  afterHistoryRestore();
}

function redo() {
  const context = editingContext();
  const history = getHistory(context);
  history.pending = null;
  if (!history.future.length) return;
  const current = snapshotContext(context);
  const next = history.future.pop();
  history.past.push(current);
  restoringHistory = true;
  restoreContext(context, next);
  restoringHistory = false;
  afterHistoryRestore();
}

function afterHistoryRestore() {
  // `ksp` is the only KSP field tracked by undo/redo (see HISTORY_FIELDS);
  // a bulk row's `kspRaw` (used only for its list label/editing banner) is
  // a separate mirror that commitKspTextChange keeps in sync while typing,
  // but undo/redo restores `ksp` directly without going through that path —
  // so it needs the same mirroring here, or the row list would keep showing
  // pre-undo wording even though every canvas already reverted correctly.
  if (activeRow) activeRow.kspRaw = activeRow.ksp;
  syncEditorFieldsFromContext();
  renderPreviews();
  if (activeRow) renderBulkRows();
  updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
  const history = getHistory(editingContext());
  if (els.undoButton) els.undoButton.disabled = history.past.length === 0;
  if (els.redoButton) els.redoButton.disabled = history.future.length === 0;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

function rgbToHsv({ r, g, b }) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let h = 0;

  if (delta !== 0) {
    if (max === red) h = 60 * (((green - blue) / delta) % 6);
    else if (max === green) h = 60 * ((blue - red) / delta + 2);
    else h = 60 * ((red - green) / delta + 4);
  }

  return {
    h: h < 0 ? h + 360 : h,
    s: max === 0 ? 0 : delta / max,
    v: max,
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

function isHex(value) {
  return /^#[0-9A-F]{6}$/i.test(value);
}

function toCssRgb(hex) {
  const { r, g, b } = hexToRgb(hex);
  return `rgb(${r}, ${g}, ${b})`;
}

function titleCaseFileName(fileName) {
  if (!fileName) return "Upload";
  return fileName.length > 24 ? `${fileName.slice(0, 21)}...` : fileName;
}

// A logo's "brand color" for auto-KV-Color purposes (see below) is the most
// common color among its non-neutral pixels — a logo is usually a colored
// mark on a white or transparent background, sometimes with black text, so
// skipping near-white, near-transparent, and low-saturation (grayscale-ish)
// pixels leaves mostly the actual brand color behind. Near-black pixels are
// tracked separately rather than simply discarded: they're skipped when
// picking the main COLORED mark (so a colorful logo's black outline/text
// doesn't dilute its real color), but if the logo turns out to have no real
// color at all, a genuinely black wordmark/logo should still set the KV
// Color to black rather than being left with no answer — see the fallback
// below. Kept separate from the DOM/canvas-dependent loader below so it can
// be tested directly against a plain pixel array.
const DOMINANT_COLOR_ALPHA_MIN = 200; // ignore translucent antialiasing/edge pixels
const DOMINANT_COLOR_NEAR_WHITE = 235;
const DOMINANT_COLOR_NEAR_BLACK = 25;
const DOMINANT_COLOR_MIN_CHANNEL_RANGE = 18; // max-channel minus min-channel; a rough saturation proxy
const DOMINANT_COLOR_BUCKET_SIZE = 16; // quantization step so near-identical shades count together
const DOMINANT_COLOR_MIN_COLORED_FRACTION = 0.03; // below this, there's no real colored brand mark to go on
const DOMINANT_COLOR_MIN_BLACK_FRACTION = 0.03; // below this, any black is just incidental (e.g. thin text), not the logo itself

function dominantColorFromPixels(pixels) {
  const coloredBuckets = new Map();
  let consideredCount = 0;
  let coloredCount = 0;
  let blackCount = 0;
  let blackSumR = 0;
  let blackSumG = 0;
  let blackSumB = 0;
  let whiteCount = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    const alpha = pixels[i + 3];
    if (alpha < DOMINANT_COLOR_ALPHA_MIN) continue;
    consideredCount++;

    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    if (min >= DOMINANT_COLOR_NEAR_WHITE) {
      whiteCount++;
      continue;
    }
    if (max <= DOMINANT_COLOR_NEAR_BLACK) {
      blackCount++;
      blackSumR += r;
      blackSumG += g;
      blackSumB += b;
      continue;
    }
    if (max - min < DOMINANT_COLOR_MIN_CHANNEL_RANGE) continue; // mid-gray — neither a color nor black/white

    coloredCount++;
    const key = `${Math.round(r / DOMINANT_COLOR_BUCKET_SIZE)},${Math.round(
      g / DOMINANT_COLOR_BUCKET_SIZE
    )},${Math.round(b / DOMINANT_COLOR_BUCKET_SIZE)}`;
    const bucket = coloredBuckets.get(key);
    if (bucket) {
      bucket.count++;
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
    } else {
      coloredBuckets.set(key, { count: 1, r, g, b });
    }
  }

  if (consideredCount === 0) return null;

  // 1) A genuine colored mark wins first, if there's enough of one.
  if (coloredCount / consideredCount >= DOMINANT_COLOR_MIN_COLORED_FRACTION) {
    let winner = null;
    for (const bucket of coloredBuckets.values()) {
      if (!winner || bucket.count > winner.count) winner = bucket;
    }
    if (winner) {
      return rgbToHex({
        r: Math.round(winner.r / winner.count),
        g: Math.round(winner.g / winner.count),
        b: Math.round(winner.b / winner.count),
      });
    }
  }

  // 2) No real color found. If black is genuinely the logo itself (not just
  // a thin outline/text on top of an otherwise white/transparent mark —
  // hence also requiring it to outnumber white among the pixels that were
  // actually counted), treat black as the brand color instead of leaving
  // the KV Color untouched.
  if (
    blackCount / consideredCount >= DOMINANT_COLOR_MIN_BLACK_FRACTION &&
    blackCount > whiteCount
  ) {
    return rgbToHex({
      r: Math.round(blackSumR / blackCount),
      g: Math.round(blackSumG / blackCount),
      b: Math.round(blackSumB / blackCount),
    });
  }

  return null;
}

// Loads a logo image and extracts its dominant brand color (see
// dominantColorFromPixels above) for CSV Bulk Generate's auto KV Color
// feature. Resolves to null (leave the KV Color alone) if the image can't
// be loaded, can't be read back from canvas (e.g. a cross-origin logo
// without CORS headers — shouldn't happen here since bulk logos are always
// fetched to a same-origin blob URL first, but this stays defensive), or is
// so close to entirely white/transparent (or an indistinct gray) that
// there's nothing — colored or black — to reasonably call a brand color.
async function extractDominantLogoColor(imageUrl) {
  if (!imageUrl) return null;
  const image = await loadImage(imageUrl);
  if (!image || !image.naturalWidth || !image.naturalHeight) return null;

  const maxDim = 120;
  const scale = Math.min(1, maxDim / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, width, height);

  try {
    const pixels = ctx.getImageData(0, 0, width, height).data;
    return dominantColorFromPixels(pixels);
  } catch (error) {
    console.warn("Dominant logo color extraction failed:", error);
    return null;
  }
}

function normalizedKsp(value) {
  return value.slice(0, KSP_MAX_CHARACTERS);
}

// Same length cap as normalizedKsp, but for the in-canvas KSP editor's raw
// value, which can contain literal "\n" characters (from pressing Enter to
// force a line break) that don't count against the limit — only the actual
// letters/digits/etc. do. Trims from wherever the plain-character count
// would exceed the cap, keeping any "\n" up to that point intact.
function clampKspEditorText(value) {
  let plainCount = 0;
  let result = "";
  for (const char of value) {
    if (char !== "\n") {
      if (plainCount >= KSP_MAX_CHARACTERS) break;
      plainCount += 1;
    }
    result += char;
  }
  return result;
}

function normalizeKspPlainText(value) {
  return value
    .replace(/[ \t]*\n[ \t]*/g, " ")
    .replace(/[ \t]{2,}/g, " ");
}

// Applies an edit made directly on one banner's canvas. Actual wording
// (adding/removing characters) always writes to the shared `ksp` field so
// every banner picks it up; a manually-forced line break (a "\n" from
// pressing Enter while editing) is instead kept as a per-output override —
// see kspManualBreaksByOutput's own comment on the state object. Any other
// output's override that no longer matches the new wording gets dropped,
// since a stale line-break position over changed words wouldn't make sense.
function commitKspTextChange(outputId, rawValue, context = state) {
  const clamped = clampKspEditorText(rawValue);
  const plainText = normalizeKspPlainText(clamped);

  context.ksp = plainText;
  if (clamped.includes("\n")) {
    context.kspManualBreaksByOutput[outputId] = clamped;
  } else {
    delete context.kspManualBreaksByOutput[outputId];
  }

  Object.keys(context.kspManualBreaksByOutput).forEach((otherOutputId) => {
    if (otherOutputId === outputId) return;
    const override = context.kspManualBreaksByOutput[otherOutputId];
    if (normalizeKspPlainText(override) !== plainText) {
      delete context.kspManualBreaksByOutput[otherOutputId];
    }
  });

  if (activeRow) activeRow.kspRaw = plainText;

  return clamped;
}

function setStatus(message) {
  els.statusPill.textContent = message;
}

function ensureFont() {
  if (fontReady) return fontReady;

  if (!("FontFace" in window)) {
    fontReady = Promise.resolve();
    return fontReady;
  }

  const face = new FontFace(FONT_NAME, `url("${FONT_URL}")`);
  fontReady = face
    .load()
    .then((loadedFace) => {
      document.fonts.add(loadedFace);
      return document.fonts.load(`44pt ${FONT_NAME}`);
    })
    .catch(() => undefined);

  return fontReady;
}

function loadImage(src) {
  if (!src) return Promise.resolve(null);
  if (imageCache.has(src)) return imageCache.get(src);

  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    if (/^https?:\/\//i.test(src)) image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });

  imageCache.set(src, promise);
  return promise;
}

function getImageCandidates(value) {
  const input = value.trim();
  if (!input) return [];
  if (/^(data|blob):/i.test(input)) return [input];
  if (input.startsWith("//")) return [`https:${input}`];

  try {
    const url = new URL(input);
    const fileMatch = url.pathname.match(/\/file\/([^/?#]+)/);
    const candidates = [url.href];
    if (fileMatch?.[1]) {
      const hash = fileMatch[1];
      candidates.push(
        `https://down-id.img.susercontent.com/file/${hash}`,
        `https://cf.shopee.co.id/file/${hash}`,
      );
    }
    return [...new Set(candidates)];
  } catch {
    const hash = input
      .replace(/^["']|["']$/g, "")
      .replace(/^\/?file\//i, "")
      .split(/[?#\s]/)[0]
      .trim();

    if (!hash) return [];

    return [
      `https://down-id.img.susercontent.com/file/${hash}`,
      `https://cf.shopee.co.id/file/${hash}`,
      `https://down-id.img.susercontent.com/file/${hash}_tn`,
      `https://cf.shopee.co.id/file/${hash}_tn`,
    ];
  }
}

// ---------------------------------------------------------------------------
// Shopee product URL → SKU image candidates. Pasting a hash/direct image
// link (the normal path above) still works exactly as before; this adds a
// second thing the SKU Image field understands: a full Shopee product page
// URL (e.g. https://shopee.co.id/<slug>-i.<shopid>.<itemid>), which is
// resolved into every product photo available for that listing so the user
// can pick one via the "Select SKU Image" gallery instead of hunting down a
// single image hash by hand.
//
// IMPORTANT — why this is a stub right now: Shopee's product-data API
// (shopee.co.id/api/v4/...) does not allow this. Verified by hand before
// writing this code: fetching the product page returns only a client-side
// app shell with no data in it (the real content loads via that API call
// after the page runs in a full browser), and calling that API directly
// returns nothing — it rejects unauthenticated, non-browser requests
// outright, on top of not sending CORS headers for other origins. That's
// different from the image hosts the hash/link path above already talks to
// (cf.shopee.co.id, *.susercontent.com), which DO serve files cross-origin.
// This tool is a static page with no backend of its own, so it has no way
// around that block — a real fetch needs to happen through something with
// proper access (an internal Shopee API/service, or a small backend that
// has it), which is outside what a client-side-only page can do by itself.
//
// PRODUCT_IMAGE_RESOLVER_ENDPOINT is the single seam for that: point it at
// a real endpoint later (one that accepts ?url=<product URL> and returns
// { images: ["https://...", ...] }, using direct, already-cross-origin-
// friendly image URLs) and this whole feature — detection, the gallery UI,
// selection — starts working with no other code changes needed anywhere.
const PRODUCT_IMAGE_RESOLVER_ENDPOINT = ""; // e.g. "https://your-backend.example.com/api/resolve-product-images"

function isShopeeProductPageUrl(value) {
  const trimmed = (value || "").trim();
  if (!/^https?:\/\//i.test(trimmed)) return false;
  let url;
  try {
    url = new URL(trimmed);
  } catch {
    return false;
  }
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  // Only the main marketplace site itself — not the CDN/image hosts
  // (cf.shopee.co.id, *.susercontent.com) the hash/link path already covers.
  if (!/^shopee\.[a-z.]+$/.test(host)) return false;
  // Standard Shopee product URL shape: .../<slug>-i.<shopid>.<itemid>
  return /-i\.\d+\.\d+(?:[/?#]|$)/.test(url.pathname);
}

async function fetchShopeeProductImageCandidates(productUrl) {
  if (!PRODUCT_IMAGE_RESOLVER_ENDPOINT) {
    throw new Error(
      "Product URL lookup isn't connected to a backend yet — paste a direct image hash/link, or upload the photo instead.",
    );
  }
  const response = await fetch(
    `${PRODUCT_IMAGE_RESOLVER_ENDPOINT}?url=${encodeURIComponent(productUrl)}`,
  );
  if (!response.ok) throw new Error(`Product image lookup failed (${response.status}).`);
  const data = await response.json();
  if (!Array.isArray(data?.images) || !data.images.length) {
    throw new Error("No images were found for that product.");
  }
  return data.images;
}

function imageLabelFromSource(value) {
  const trimmed = value.trim();
  if (!trimmed) return "Linked image";
  const clean = trimmed.split(/[?#\s]/)[0];
  const lastPart = clean.split("/").filter(Boolean).pop() || "Linked image";
  return titleCaseFileName(lastPart);
}

async function fetchImageObjectUrl(src) {
  if (/^(data|blob):/i.test(src)) return src;

  const response = await fetch(src, {
    mode: "cors",
    credentials: "omit",
  });

  if (!response.ok) throw new Error(`Image request failed with ${response.status}.`);

  const blob = await response.blob();
  if (!blob.type.startsWith("image/")) throw new Error("The link did not return an image.");

  const objectUrl = URL.createObjectURL(blob);
  const image = await loadImage(objectUrl);
  if (!image) {
    URL.revokeObjectURL(objectUrl);
    throw new Error("The image could not be opened.");
  }

  return objectUrl;
}

function setSkuImageUrl(url, labelText) {
  const context = editingContext();
  // The previous blob URL (if any) is deliberately left alive so undo can
  // restore it — see the comment in removeBackgroundFromImage for why.
  context.skuImageUrl = url;
  // A freshly loaded image is a new "pristine" original — see the field's
  // own comment on the state object for what this is used for.
  context.originalSkuImageUrl = url;
  context.skuImageLabel = labelText || "Linked image";
  context.skuPositions = {};
  context.skuZooms = {};
  els.skuFileName.textContent = context.skuImageLabel;
}

// "Select SKU Image" gallery — only ever populated after a Shopee product
// URL resolves to multiple candidate photos (see fetchShopeeProductImageCandidates
// above); empty/hidden for the normal upload or direct hash/link paths.
// Re-run whenever the editor's context changes (row switch, template
// switch) so each context's own gallery state — or lack of one — shows
// correctly, same pattern as every other per-context sidebar control.
function renderSkuImageGallery(context) {
  if (!els.skuImageGalleryRow || !els.skuImageGallery) return;
  const candidates = context.skuImageCandidates || [];
  els.skuImageGalleryRow.hidden = candidates.length === 0;
  els.skuImageGallery.innerHTML = "";
  if (!candidates.length) return;

  candidates.forEach((url, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "sku-image-gallery-item";
    const isSelected = url === context.skuImageUrl;
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("role", "option");
    button.setAttribute("aria-selected", String(isSelected));
    button.setAttribute("aria-label", `Product image ${index + 1}`);

    const img = document.createElement("img");
    img.src = url;
    img.alt = "";
    img.loading = "lazy";
    button.append(img);

    button.addEventListener("click", () => selectSkuImageCandidate(context, url));
    els.skuImageGallery.append(button);
  });
}

async function selectSkuImageCandidate(context, url) {
  if (els.skuImageGalleryError) els.skuImageGalleryError.hidden = true;
  commitHistoryStart(context);
  try {
    const objectUrl = await fetchImageObjectUrl(url);
    setSkuImageUrl(objectUrl, "Product image");
    syncRemoveBgAvailability(context);
    renderSkuImageGallery(context);
    if (editingContext() === context) await renderPreviews();
    if (activeRow === context) renderBulkRows();
  } catch (error) {
    console.error("Selecting product image failed", error);
    if (els.skuImageGalleryError) {
      els.skuImageGalleryError.textContent = "That image couldn't be loaded — try another one.";
      els.skuImageGalleryError.hidden = false;
    }
  } finally {
    commitHistoryEnd(context);
  }
}

// Loads the background-removal engine on first use only (it's a ~1MB JS
// module plus a lazily-fetched ONNX model, so nothing downloads until the
// user actually clicks the button). Cached so repeat clicks reuse the same
// module instead of re-importing.
function loadBackgroundRemovalModule() {
  if (!backgroundRemovalModulePromise) {
    backgroundRemovalModulePromise = import(BACKGROUND_REMOVAL_MODULE_URL).catch((primaryError) => {
      console.warn("Background removal: primary CDN failed, trying fallback.", primaryError);
      return import(BACKGROUND_REMOVAL_FALLBACK_MODULE_URL).catch((fallbackError) => {
        backgroundRemovalModulePromise = null;
        throw fallbackError;
      });
    });
  }
  return backgroundRemovalModulePromise;
}

// CDN bundlers (jsDelivr's +esm, esm.sh) don't always reshape a package's
// default export identically — depending on the bundler, the callable
// function can end up as the module namespace itself, `.default`, or a
// double-wrapped `.default.default` (common CJS/ESM interop artifact). Try
// every shape actually seen in the wild instead of assuming one.
function resolveRemoveBackgroundFn(module) {
  const candidates = [
    module,
    module?.default,
    module?.default?.default,
    module?.removeBackground,
    module?.default?.removeBackground,
  ];
  return candidates.find((candidate) => typeof candidate === "function") || null;
}

// Two-threshold ("hysteresis") opacity check instead of one flat cutoff. A
// pixel only needs to clear the LOW bar if it's directly attached (4-conn)
// to a pixel that clears the stricter HIGH bar on its own; otherwise it
// needs to clear HIGH by itself. This keeps bright/white highlight or
// reflection areas on the product — which the model often scores with
// lower confidence, since they look similar to a plain light background —
// as long as they're physically attached to the product's solid, high-
// confidence body, while still dropping truly disconnected low-confidence
// noise out in the background.
const BG_REMOVAL_ALPHA_HIGH = 160;
const BG_REMOVAL_ALPHA_LOW = 18;

// A pixel also counts as "low confidence but includable" (see isLow above)
// if its own color is simply nothing like the photo's real background —
// regardless of what alpha the AI model assigned it. This is what keeps a
// product's own plain white surface (e.g. the unprinted plastic edge of a
// pouch/sachet) from being mistaken for background just because the model
// scored it with low confidence: a plain white product surface photographed
// against a colored or dark backdrop looks nothing like that backdrop, so
// it clears this bar even when the AI itself wasn't sure. Genuine
// background — which, by definition, DOES look like the sampled backdrop
// color — never clears it, so this can't resurrect real background.
const BACKGROUND_COLOR_DISTANCE_THRESHOLD = 90;

// How many consecutive pixels a chain can extend through purely on faint,
// non-zero AI alpha (i.e. a pixel that clears BG_REMOVAL_ALPHA_LOW but isn't
// itself a HIGH-confidence pixel and isn't color-rescued either) before it
// needs to touch a HIGH-confidence or color-rescued pixel again to keep
// going. A real anti-aliased product edge is normally only a pixel or two
// wide, so this stays generous enough not to clip that, while cutting off a
// soft ambient shadow or rim-glow around a product — which the AI model
// often scores with a faint but nonzero alpha across a much longer, gradual
// fade — well before that chain can reach all the way out into open
// background. Reaching a HIGH-confidence or color-rescued pixel resets the
// budget, so a large color-rescued surface (a much stronger signal than
// leftover alpha noise) is unaffected and can still extend as far as it
// needs to.
const WEAK_ALPHA_CHAIN_LIMIT = 6;

// A pixel that was already transparent in the SOURCE image passed to the AI
// model (e.g. an area the user erased by hand with Touch Up before running
// Remove Background) can never be treated as opaque, no matter how the
// model's own alpha mask scores it. Without this, a manually-erased region
// can come back in two ways: the model itself may score a flattened
// transparent area with real confidence (some decoders flatten transparent
// pixels to solid black, which can look like a plausible foreground
// object), or this cleanup pass's own hole-filling (step 2 below) may treat
// it as an accidental gap to patch. Either way the user's own edit would
// otherwise get silently overwritten — usually as a solid black patch,
// since a fully transparent source pixel's RGB is commonly stored as zero.
const SOURCE_ALPHA_MIN = 10;

// A hole (see step 2 below) is only "fillable" if it doesn't touch the
// image border, takes up no more than this fraction of the whole image,
// and doesn't overlap any pixel that was already transparent in the source
// (see SOURCE_ALPHA_MIN above) — otherwise it's not an accidental AI gap,
// it's something the user deliberately erased, and must stay removed.
// TEMPORARILY set to 0 (hole-fill fully off) as a diagnostic: this is the
// most direct way to tell whether the wheel-spoke gaps that were still
// showing up filled are actually coming from this step at all, or whether
// the AI model itself is scoring that area with high confidence directly
// (in which case no hole-fill threshold, however small, would ever have
// fixed it). Trading away the packaging-gap-bridging use case entirely for
// this test, per explicit priority on the wheel case over that one.
const HOLE_MAX_FRACTION = 0;

// When picking which disconnected piece of the mask is the actual product
// (see step 4), the piece that occupies the most pixels within this central
// region of the image wins over a merely-larger piece elsewhere — product
// photos are normally centered, so a stray leftover chunk (a background
// prop, promotional text, a second product) that happens to cover more
// total area shouldn't win just on size. Using overlap with a region
// rather than a single center pixel avoids a false miss when the exact
// center pixel lands on a thin gap between two nearby shapes.
const CENTRAL_REGION_FRACTION = 0.5;
// The winning piece's overlap with that central region still has to clear
// this floor, so a tiny sliver of a huge off-center shape poking into the
// middle doesn't win by default when nothing is genuinely centered.
const MIN_CENTRAL_OVERLAP_FRACTION = 0.01;

// Radius (in pixels) of the softening pass applied to the final cutout
// edge, so the boundary is a gentle gradient rather than a hard, jagged
// binary line.
const FEATHER_RADIUS = 2;

// Separable box blur (horizontal pass then vertical pass, each an O(width)
// or O(height) sliding-window sum) — used only to feather the final binary
// keep-mask, not for any of the region-selection logic above it.
function boxBlurMask(mask, width, height, radius) {
  const windowSize = radius * 2 + 1;
  const temp = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * width;
    let sum = 0;
    for (let x = -radius; x <= radius; x++) {
      sum += mask[rowStart + Math.min(width - 1, Math.max(0, x))];
    }
    for (let x = 0; x < width; x++) {
      temp[rowStart + x] = sum / windowSize;
      const addX = Math.min(width - 1, x + radius + 1);
      const removeX = Math.max(0, x - radius);
      sum += mask[rowStart + addX] - mask[rowStart + removeX];
    }
  }
  const out = new Float32Array(width * height);
  for (let x = 0; x < width; x++) {
    let sum = 0;
    for (let y = -radius; y <= radius; y++) {
      sum += temp[Math.min(height - 1, Math.max(0, y)) * width + x];
    }
    for (let y = 0; y < height; y++) {
      out[y * width + x] = sum / windowSize;
      const addY = Math.min(height - 1, y + radius + 1);
      const removeY = Math.max(0, y - radius);
      sum += temp[addY * width + x] - temp[removeY * width + x];
    }
  }
  return out;
}

// Estimates the photo's true background color by taking the per-channel
// median (via a cheap 0-255 histogram, since color channels only span that
// range) over a thin strip around the image's outer edge — border pixels in
// a product photo are almost always real background, not the product
// itself. Median (rather than average) keeps a few product pixels that
// happen to touch the border from skewing the estimate. Returns null if
// every border pixel was already transparent (fully erased), in which case
// the color-distance signal above is simply skipped rather than guessed at.
function estimateBorderBackgroundColor(sourcePixels, width, height) {
  const thickness = Math.max(2, Math.round(Math.min(width, height) * 0.02));
  const histR = new Uint32Array(256);
  const histG = new Uint32Array(256);
  const histB = new Uint32Array(256);
  let count = 0;

  const addPixel = (x, y) => {
    const idx = (y * width + x) * 4;
    if (sourcePixels[idx + 3] < SOURCE_ALPHA_MIN) return;
    histR[sourcePixels[idx]]++;
    histG[sourcePixels[idx + 1]]++;
    histB[sourcePixels[idx + 2]]++;
    count++;
  };

  for (let y = 0; y < Math.min(thickness, height); y++) {
    for (let x = 0; x < width; x++) {
      addPixel(x, y);
      addPixel(x, height - 1 - y);
    }
  }
  for (let x = 0; x < Math.min(thickness, width); x++) {
    for (let y = thickness; y < height - thickness; y++) {
      addPixel(x, y);
      addPixel(width - 1 - x, y);
    }
  }

  if (count === 0) return null;

  const medianOf = (hist) => {
    const half = count / 2;
    let running = 0;
    for (let v = 0; v < 256; v++) {
      running += hist[v];
      if (running >= half) return v;
    }
    return 255;
  };

  return { r: medianOf(histR), g: medianOf(histG), b: medianOf(histB) };
}

// Cleans up a raw background-removal result: turns the model's alpha mask
// into a binary cutout with a light feather at the edge (no jagged hard
// line, no stray translucent halos far from the actual product), fills in
// any fully enclosed holes accidentally cut out of the middle of the
// product, and discards every disconnected island except the one most
// likely to be the actual product — which strips out stray leftover bits
// like promotional text or background props the model failed to remove,
// without needing to identify what they are.
// The final image's colors always come from the original, unprocessed
// photo (never the model's own output), so cleanup can't introduce any
// color shift or edge fringing of its own — it only ever decides alpha.
async function cleanupBackgroundRemovalResult(resultBlob, sourceBlob) {
  const [resultBitmap, sourceBitmap] = await Promise.all([
    createImageBitmap(resultBlob),
    createImageBitmap(sourceBlob),
  ]);

  const width = resultBitmap.width;
  const height = resultBitmap.height;
  const pixelCount = width * height;

  const resultCanvas = document.createElement("canvas");
  resultCanvas.width = width;
  resultCanvas.height = height;
  const resultCtx = resultCanvas.getContext("2d", { willReadFrequently: true });
  resultCtx.drawImage(resultBitmap, 0, 0, width, height);
  const resultPixels = resultCtx.getImageData(0, 0, width, height).data;

  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = width;
  sourceCanvas.height = height;
  const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
  // Scaled to the result's own resolution so pixel coordinates line up
  // exactly even if the model resized the image.
  sourceCtx.drawImage(sourceBitmap, 0, 0, width, height);
  const sourcePixels = sourceCtx.getImageData(0, 0, width, height).data;

  // 1) Hysteresis opacity per pixel, from the model's own alpha channel:
  // every HIGH-confidence pixel is opaque, and so is every LOW-confidence
  // pixel reachable from one through a chain of other LOW-confidence
  // pixels — this is what lets an attached white highlight survive even
  // though the model scored it less confidently than the rest of the
  // product. "Low confidence" also includes any pixel whose color simply
  // doesn't match the photo's real background (see
  // BACKGROUND_COLOR_DISTANCE_THRESHOLD above), which is what rescues a
  // product's own plain white surface even when the model was confident
  // (wrongly) that it was background. Either bar is gated on the SOURCE
  // pixel also being non-transparent, so a spot the user already erased in
  // Touch Up before running Remove Background can never be resurrected
  // here.
  const backgroundColor = estimateBorderBackgroundColor(sourcePixels, width, height);
  // Every real case the color-distance rescue below was built for — a
  // product's own white/light packaging, a bright highlight, a light jar
  // surface — is LIGHTER than the backdrop it's being confused with. A
  // soft ground shadow near a product is the opposite: it's a dimmed patch
  // that's DARKER than the surrounding backdrop, but can still measure as
  // "far" from the sampled background color in plain Euclidean distance,
  // which was wrongly enough to rescue it too. Requiring the rescued pixel
  // to be meaningfully lighter than the background (not just different
  // from it) keeps the legitimate rescues intact while disqualifying a
  // shadow on sight.
  const backgroundLuminance = backgroundColor
    ? 0.299 * backgroundColor.r + 0.587 * backgroundColor.g + 0.114 * backgroundColor.b
    : null;
  const BACKGROUND_COLOR_RESCUE_MIN_LUMINANCE_DELTA = 20;
  const isHigh = new Uint8Array(pixelCount);
  const isLow = new Uint8Array(pixelCount);
  // "Strong" evidence — a HIGH-confidence pixel, or a color-rescued one —
  // is trusted regardless of how far it sits from the nearest other strong
  // pixel. Everything else that only clears the LOW bar via faint AI alpha
  // is weaker evidence: real, but only trusted a short distance from strong
  // evidence (see WEAK_ALPHA_CHAIN_LIMIT above).
  const isStrong = new Uint8Array(pixelCount);
  for (let i = 0; i < pixelCount; i++) {
    const o = i * 4;
    const alpha = resultPixels[o + 3];
    const sourceAlpha = sourcePixels[o + 3];
    const sourceHasContent = sourceAlpha >= SOURCE_ALPHA_MIN;

    // Only ever ADDS an extra way to qualify as "includable" — if the
    // background color couldn't be estimated (e.g. every border pixel was
    // already erased), this stays false and isLow falls back to the plain
    // alpha check below, exactly like before this signal existed.
    let colorSuggestsProduct = false;
    if (backgroundColor) {
      const dr = sourcePixels[o] - backgroundColor.r;
      const dg = sourcePixels[o + 1] - backgroundColor.g;
      const db = sourcePixels[o + 2] - backgroundColor.b;
      const colorDistance = Math.sqrt(dr * dr + dg * dg + db * db);
      const pixelLuminance =
        0.299 * sourcePixels[o] + 0.587 * sourcePixels[o + 1] + 0.114 * sourcePixels[o + 2];
      colorSuggestsProduct =
        colorDistance >= BACKGROUND_COLOR_DISTANCE_THRESHOLD &&
        pixelLuminance - backgroundLuminance >= BACKGROUND_COLOR_RESCUE_MIN_LUMINANCE_DELTA;
    }

    const high = alpha >= BG_REMOVAL_ALPHA_HIGH && sourceHasContent;
    isHigh[i] = high ? 1 : 0;
    isLow[i] =
      (alpha >= BG_REMOVAL_ALPHA_LOW || colorSuggestsProduct) && sourceHasContent ? 1 : 0;
    isStrong[i] = high || (colorSuggestsProduct && sourceHasContent) ? 1 : 0;
  }

  const isOpaque = new Uint8Array(pixelCount);
  const hysteresisStackIdx = new Int32Array(pixelCount);
  const hysteresisStackBudget = new Int16Array(pixelCount);
  let hysteresisStackSize = 0;

  // `incomingBudget` is how many more weak-only (faint-alpha-only) steps
  // are still allowed before hitting strong evidence again. A strong pixel
  // always gets in and always hands out a fresh full budget to whatever it
  // reaches next; a weak-only pixel only gets in if it still had budget
  // left, and hands out one less than it received.
  const tryExpandOpaque = (idx, incomingBudget) => {
    if (!isLow[idx] || isOpaque[idx]) return;
    if (!isStrong[idx] && incomingBudget <= 0) return;
    isOpaque[idx] = 1;
    hysteresisStackIdx[hysteresisStackSize] = idx;
    hysteresisStackBudget[hysteresisStackSize] = isStrong[idx]
      ? WEAK_ALPHA_CHAIN_LIMIT
      : incomingBudget - 1;
    hysteresisStackSize++;
  };

  for (let i = 0; i < pixelCount; i++) {
    if (isHigh[i]) tryExpandOpaque(i, WEAK_ALPHA_CHAIN_LIMIT);
  }

  while (hysteresisStackSize > 0) {
    hysteresisStackSize--;
    const idx = hysteresisStackIdx[hysteresisStackSize];
    const budget = hysteresisStackBudget[hysteresisStackSize];
    const x = idx % width;
    const y = (idx / width) | 0;
    if (x > 0) tryExpandOpaque(idx - 1, budget);
    if (x < width - 1) tryExpandOpaque(idx + 1, budget);
    if (y > 0) tryExpandOpaque(idx - width, budget);
    if (y < height - 1) tryExpandOpaque(idx + width, budget);
  }

  // TEMPORARY DIAGNOSTIC (safe no-op unless explicitly enabled from the
  // console with `window.DEBUG_BG_REMOVAL_CLASSIFICATION = true`): prints a
  // thumbnail directly inside the devtools console output itself (the
  // classic `console.log('%c ', 'background: url(...)')` trick) so there's
  // no popup, tab, or page overlay for anything else to block or cover —
  // color-coding exactly why each pixel became opaque after the hysteresis
  // pass above, before any later step (hole-fill/component-selection/
  // feather) touches it: red = HIGH-confidence AI alpha, blue = color-
  // distance rescue, green = only included via the bounded weak-alpha
  // chain, black = excluded. This does not alter the real result in any way.
  if (typeof window !== "undefined" && window.DEBUG_BG_REMOVAL_CLASSIFICATION) {
    try {
      const debugCanvas = document.createElement("canvas");
      debugCanvas.width = width;
      debugCanvas.height = height;
      const debugCtx = debugCanvas.getContext("2d");
      const debugImageData = debugCtx.createImageData(width, height);
      const debugPixels = debugImageData.data;
      for (let i = 0; i < pixelCount; i++) {
        const o = i * 4;
        if (!isOpaque[i]) {
          debugPixels[o] = 0;
          debugPixels[o + 1] = 0;
          debugPixels[o + 2] = 0;
          debugPixels[o + 3] = 255;
        } else if (isHigh[i]) {
          debugPixels[o] = 220;
          debugPixels[o + 1] = 30;
          debugPixels[o + 2] = 30;
          debugPixels[o + 3] = 255;
        } else if (isStrong[i]) {
          debugPixels[o] = 40;
          debugPixels[o + 1] = 90;
          debugPixels[o + 2] = 230;
          debugPixels[o + 3] = 255;
        } else {
          debugPixels[o] = 40;
          debugPixels[o + 1] = 200;
          debugPixels[o + 2] = 60;
          debugPixels[o + 3] = 255;
        }
      }
      debugCtx.putImageData(debugImageData, 0, 0);

      // Downscale to a console-friendly thumbnail — the console-image
      // trick renders via CSS padding sized to the image, so a full-res
      // photo would blow up way past the visible console panel.
      const thumbMaxDim = 500;
      const thumbScale = Math.min(1, thumbMaxDim / Math.max(width, height));
      const thumbWidth = Math.max(1, Math.round(width * thumbScale));
      const thumbHeight = Math.max(1, Math.round(height * thumbScale));
      const thumbCanvas = document.createElement("canvas");
      thumbCanvas.width = thumbWidth;
      thumbCanvas.height = thumbHeight;
      const thumbCtx = thumbCanvas.getContext("2d");
      thumbCtx.drawImage(debugCanvas, 0, 0, thumbWidth, thumbHeight);
      const dataUrl = thumbCanvas.toDataURL("image/png");

      console.log(
        "[BG removal debug] red = HIGH confidence, blue = color-distance rescue, green = weak-alpha chain, black = excluded (image below, or right-click it in the console to Copy Image / Save Image As)"
      );
      console.log(
        "%c ",
        `font-size: 1px; padding: ${Math.round(thumbHeight / 2)}px ${Math.round(
          thumbWidth / 2
        )}px; background: url(${dataUrl}) no-repeat; background-size: ${thumbWidth}px ${thumbHeight}px; border: 1px solid #888;`
      );
      // Also expose the full-resolution version for anyone who wants to
      // inspect it more closely: run `window.__bgRemovalDebugUrl` in the
      // console, then open that string as a URL in a new tab manually.
      window.__bgRemovalDebugUrl = debugCanvas.toDataURL("image/png");
      console.log(
        "[BG removal debug] full-resolution data URL saved to window.__bgRemovalDebugUrl — copy it and paste into the address bar of a new tab to view full size"
      );
    } catch (debugError) {
      console.warn("BG removal debug overlay failed:", debugError);
    }
  }

  // 2) Label connected components of TRANSPARENT pixels only (4-connected),
  // tracking each component's pixel count and whether it touches the image
  // border. A transparent region that never touches the border is fully
  // enclosed by opaque pixels — a hole accidentally cut out of the middle
  // of the product — but it's only treated as "fillable" when it's small
  // relative to the whole image (see HOLE_MAX_FRACTION below).
  //
  // That size cap matters for a degenerate case: a product photo where the
  // subject bleeds to all four edges has no transparent pixel anywhere on
  // the border. Without the cap, the entire background would read as one
  // giant "enclosed hole" (nothing reaches the border to disprove it) and
  // get filled solid, silently undoing the cutout. Requiring holes to stay
  // small keeps genuine background — even background that happens not to
  // touch an edge — from ever being swallowed whole.
  const holeSizeLimit = pixelCount * HOLE_MAX_FRACTION;

  const transparentLabels = new Int32Array(pixelCount).fill(-1);
  const stack = new Int32Array(pixelCount);
  let stackSize = 0;
  const fillableHole = [];

  for (let start = 0; start < pixelCount; start++) {
    if (isOpaque[start] || transparentLabels[start] !== -1) continue;
    const label = fillableHole.length;
    let size = 0;
    let touchesBorder = false;
    let touchesSourceTransparency = false;
    stackSize = 0;
    stack[stackSize++] = start;
    transparentLabels[start] = label;
    while (stackSize > 0) {
      const idx = stack[--stackSize];
      size++;
      const x = idx % width;
      const y = (idx / width) | 0;
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) touchesBorder = true;
      if (sourcePixels[idx * 4 + 3] < SOURCE_ALPHA_MIN) touchesSourceTransparency = true;
      if (x > 0) {
        const n = idx - 1;
        if (!isOpaque[n] && transparentLabels[n] === -1) {
          transparentLabels[n] = label;
          stack[stackSize++] = n;
        }
      }
      if (x < width - 1) {
        const n = idx + 1;
        if (!isOpaque[n] && transparentLabels[n] === -1) {
          transparentLabels[n] = label;
          stack[stackSize++] = n;
        }
      }
      if (y > 0) {
        const n = idx - width;
        if (!isOpaque[n] && transparentLabels[n] === -1) {
          transparentLabels[n] = label;
          stack[stackSize++] = n;
        }
      }
      if (y < height - 1) {
        const n = idx + width;
        if (!isOpaque[n] && transparentLabels[n] === -1) {
          transparentLabels[n] = label;
          stack[stackSize++] = n;
        }
      }
    }
    fillableHole.push(!touchesBorder && size <= holeSizeLimit && !touchesSourceTransparency);
  }

  // 3) Treat only small, fully-enclosed holes as part of whatever solid
  // region surrounds them, so the connected-component pass below groups
  // them together with the product. Background too large to plausibly be
  // an accidental hole stays transparent instead.
  const isFilled = new Uint8Array(pixelCount);
  for (let i = 0; i < pixelCount; i++) {
    const label = transparentLabels[i];
    isFilled[i] = isOpaque[i] || (label !== -1 && fillableHole[label]) ? 1 : 0;
  }

  // 4) Connected-component labeling over the filled mask; track each
  // component's total pixel area (to find the largest, as a fallback) and
  // how many of its pixels fall inside the central region of the image
  // (the preferred pick — see CENTRAL_REGION_FRACTION above).
  const centralMinX = Math.round((width * (1 - CENTRAL_REGION_FRACTION)) / 2);
  const centralMaxX = width - centralMinX;
  const centralMinY = Math.round((height * (1 - CENTRAL_REGION_FRACTION)) / 2);
  const centralMaxY = height - centralMinY;

  const labels = new Int32Array(pixelCount).fill(-1);
  const componentSizes = [];
  const componentCentralOverlaps = [];
  let largestLabel = -1;
  let largestSize = 0;
  let nextLabel = 0;

  for (let start = 0; start < pixelCount; start++) {
    if (!isFilled[start] || labels[start] !== -1) continue;
    let size = 0;
    let centralOverlap = 0;
    stackSize = 0;
    stack[stackSize++] = start;
    labels[start] = nextLabel;
    while (stackSize > 0) {
      const idx = stack[--stackSize];
      size++;
      const x = idx % width;
      const y = (idx / width) | 0;
      if (x >= centralMinX && x < centralMaxX && y >= centralMinY && y < centralMaxY) {
        centralOverlap++;
      }
      if (x > 0) {
        const n = idx - 1;
        if (isFilled[n] && labels[n] === -1) {
          labels[n] = nextLabel;
          stack[stackSize++] = n;
        }
      }
      if (x < width - 1) {
        const n = idx + 1;
        if (isFilled[n] && labels[n] === -1) {
          labels[n] = nextLabel;
          stack[stackSize++] = n;
        }
      }
      if (y > 0) {
        const n = idx - width;
        if (isFilled[n] && labels[n] === -1) {
          labels[n] = nextLabel;
          stack[stackSize++] = n;
        }
      }
      if (y < height - 1) {
        const n = idx + width;
        if (isFilled[n] && labels[n] === -1) {
          labels[n] = nextLabel;
          stack[stackSize++] = n;
        }
      }
    }
    componentSizes[nextLabel] = size;
    componentCentralOverlaps[nextLabel] = centralOverlap;
    if (size > largestSize) {
      largestSize = size;
      largestLabel = nextLabel;
    }
    nextLabel++;
  }

  // Prefer whichever component covers the most pixels inside the central
  // region over the largest one overall, as long as that coverage clears a
  // sensible floor — the product in these photos is almost always
  // centered, so this correctly overrides "largest" when a bigger stray
  // leftover elsewhere (a second product, a promotional photo, leftover
  // text) would otherwise win just by covering more total area.
  let chosenLabel = largestLabel;
  let bestCentralOverlap = pixelCount * MIN_CENTRAL_OVERLAP_FRACTION;
  for (let label = 0; label < nextLabel; label++) {
    if (componentCentralOverlaps[label] > bestCentralOverlap) {
      bestCentralOverlap = componentCentralOverlaps[label];
      chosenLabel = label;
    }
  }

  // 5) Feather the chosen component's edge with a small blur so the cutout
  // boundary is a soft gradient instead of a hard, jagged binary line.
  const keepMask = new Float32Array(pixelCount);
  if (chosenLabel >= 0) {
    for (let i = 0; i < pixelCount; i++) {
      keepMask[i] = labels[i] === chosenLabel ? 1 : 0;
    }
  }
  const featheredAlpha = boxBlurMask(keepMask, width, height, FEATHER_RADIUS);

  // 6) Final image: the original photo's own colors everywhere, alpha from
  // the feathered mask above — no stray disconnected leftovers, no hard
  // pixel-perfect zigzag edge.
  const outImageData = resultCtx.createImageData(width, height);
  const outPixels = outImageData.data;
  for (let i = 0; i < pixelCount; i++) {
    const o = i * 4;
    outPixels[o] = sourcePixels[o];
    outPixels[o + 1] = sourcePixels[o + 1];
    outPixels[o + 2] = sourcePixels[o + 2];
    outPixels[o + 3] = Math.round(Math.min(1, Math.max(0, featheredAlpha[i])) * 255);
  }
  resultCtx.putImageData(outImageData, 0, 0);

  return new Promise((resolve, reject) => {
    resultCanvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Background removal cleanup could not encode the result."));
    }, "image/png");
  });
}

// Maps the two things Remove Background / Touch Up can operate on to the
// context fields and DOM elements each one reads/writes. Keeping this in one
// place is what lets both features stay truly generic instead of having a
// parallel copy-pasted "logo version" of every function.
const EDIT_TARGETS = {
  sku: {
    urlKey: "skuImageUrl",
    labelKey: "skuImageLabel",
    originalKey: "originalSkuImageUrl",
    fileNameEl: () => els.skuFileName,
    removeButton: () => els.removeBgButton,
    removeError: () => els.removeBgError,
    noImageMessage: "Add a SKU image first",
    editTitle: "Touch Up SKU Image",
  },
  logo: {
    urlKey: "brandLogoUrl",
    labelKey: "brandLogoLabel",
    originalKey: "originalBrandLogoUrl",
    fileNameEl: () => els.brandFileName,
    removeButton: () => els.removeLogoBgButton,
    removeError: () => els.removeLogoBgError,
    noImageMessage: "Add a brand logo first",
    editTitle: "Touch Up Brand Logo",
  },
  // Shopee Live FS only — SKU 2 / SKU 3 are plain secondary thumbnails (no
  // "hero" art direction), but otherwise go through the exact same Remove
  // Background/Touch Up code as sku/logo above.
  sku2: {
    urlKey: "sku2ImageUrl",
    labelKey: "sku2ImageLabel",
    originalKey: "originalSku2ImageUrl",
    fileNameEl: () => els.sku2FileName,
    removeButton: () => els.removeBg2Button,
    removeError: () => els.removeBg2Error,
    noImageMessage: "Add a SKU 2 image first",
    editTitle: "Touch Up SKU 2 Image",
  },
  sku3: {
    urlKey: "sku3ImageUrl",
    labelKey: "sku3ImageLabel",
    originalKey: "originalSku3ImageUrl",
    fileNameEl: () => els.sku3FileName,
    removeButton: () => els.removeBg3Button,
    removeError: () => els.removeBg3Error,
    noImageMessage: "Add a SKU 3 image first",
    editTitle: "Touch Up SKU 3 Image",
  },
};

// Runs in-browser background removal on the current context's SKU image or
// brand logo (per `target`) and swaps the result in. Unlike setSkuImageUrl,
// this intentionally keeps the existing skuPositions/skuZooms/logoZooms so an
// image the user already framed doesn't jump back to center just because its
// background changed.
// Runs the actual model + cleanup pass on one image and returns a new blob
// URL — pulled out of removeBackgroundFromImage below so removeBackground-
// FromAllBulkRows can reuse the exact same processing without any of that
// function's single-target UI concerns (sidebar button text/disabled state,
// editingContext() plumbing). onProgress mirrors the underlying model's own
// (key, current, total) callback shape.
async function removeBackgroundFromUrl(sourceUrl, onProgress) {
  const module = await loadBackgroundRemovalModule();
  const removeBackground = resolveRemoveBackgroundFn(module);
  if (!removeBackground) {
    console.error("Background removal module shape:", module);
    throw new Error("Could not find the background removal function in the loaded module.");
  }

  const sourceResponse = await fetch(sourceUrl);
  const sourceBlob = await sourceResponse.blob();

  const rawResultBlob = await removeBackground(sourceBlob, {
    output: { format: "image/png", quality: 1 },
    progress: onProgress,
  });

  // Post-process the model's raw cutout: binary (non-translucent) edges,
  // holes in the middle of the product filled back in, and every
  // disconnected leftover bit (stray promotional text, background props)
  // discarded except the single largest piece.
  const resultBlob = await cleanupBackgroundRemovalResult(rawResultBlob, sourceBlob);

  return URL.createObjectURL(resultBlob);
}

async function removeBackgroundFromImage(target = "sku") {
  if (bgRemovalRunning) return;

  const cfg = EDIT_TARGETS[target];
  const context = editingContext();
  if (!context[cfg.urlKey]) {
    setStatus(cfg.noImageMessage);
    window.setTimeout(() => setStatus("Ready"), 1800);
    return;
  }

  const button = cfg.removeButton();
  const errorEl = cfg.removeError();
  commitHistoryStart(context);
  bgRemovalRunning = true;
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = "Loading model...";
  if (errorEl) {
    errorEl.hidden = true;
    errorEl.textContent = "";
  }
  setStatus("Removing background (first run downloads a model, please wait)");

  try {
    const newUrl = await removeBackgroundFromUrl(context[cfg.urlKey], (key, current, total) => {
      if (!total) return;
      const percent = Math.round((current / total) * 100);
      button.textContent = `Removing background... ${percent}%`;
    });

    // The row/state this run started on always gets the result, even if the
    // user has since switched to editing something else (only one removal
    // job runs at a time, so a background row keeps its own data correctly).
    context[cfg.urlKey] = newUrl;
    context[cfg.labelKey] = context[cfg.labelKey]
      ? `${context[cfg.labelKey]} (BG removed)`
      : "Background removed";

    // The previous blob URL is deliberately left alive (not revoked) — undo
    // can restore it back to it, and a revoked blob: URL would fail to load.
    // Blob URLs are only ever released on page unload as a result; a
    // session's worth of image swaps is a small, acceptable amount of memory
    // to keep undo/redo correct.

    // But only touch what's currently on screen if that's still this same
    // context — otherwise we'd stomp the filename label/preview of whatever
    // the user switched to while this run was in flight.
    if (editingContext() === context) {
      cfg.fileNameEl().textContent = context[cfg.labelKey];
      await renderPreviews();
      setStatus("Background removed");
      window.setTimeout(() => setStatus("Ready"), 1600);
    }
  } catch (error) {
    console.error("Background removal failed", error);
    if (editingContext() === context) {
      setStatus("Background removal failed");
      window.setTimeout(() => setStatus("Ready"), 2400);
      if (errorEl) {
        const detail = error?.message || String(error);
        errorEl.textContent = `Background removal failed: ${detail}`;
        errorEl.hidden = false;
      }
    }
  } finally {
    commitHistoryEnd(context);
    bgRemovalRunning = false;
    button.disabled = !editingContext()[cfg.urlKey];
    button.textContent = originalLabel;
  }
}

// ---------------------------------------------------------------------------
// Bulk "Remove Background All" — runs Remove Background on every SKU image
// across every bulk row in one go (SKU 1 always; SKU 2/SKU 3 too for Shopee
// Live FS rows), one image at a time so it shares the same single-flight
// bgRemovalRunning guard the per-field buttons use elsewhere (running two
// removal jobs at once would just fight over the same loaded model for no
// speed benefit, since the model itself doesn't parallelize well in-browser).
// Brand logos are deliberately excluded — the user asked for "all SKU
// images", and logos already have their own per-row Remove Background button.
// ---------------------------------------------------------------------------
let bulkRemoveBgAllRunning = false;

function bulkSkuImageJobs() {
  const jobs = [];
  bulkState.rows.forEach((row) => {
    if (row.skuImageRaw || row.skuImageUrl) {
      jobs.push({ row, urlKey: "skuImageUrl", labelKey: "skuImageLabel" });
    }
    if (isShopeeLiveFsTemplate(row.template)) {
      if (row.sku2ImageRaw || row.sku2ImageUrl) {
        jobs.push({ row, urlKey: "sku2ImageUrl", labelKey: "sku2ImageLabel" });
      }
      if (row.sku3ImageRaw || row.sku3ImageUrl) {
        jobs.push({ row, urlKey: "sku3ImageUrl", labelKey: "sku3ImageLabel" });
      }
    }
  });
  return jobs;
}

function setBulkRemoveBgAllProgress(text) {
  if (!els.bulkRemoveBgAllProgress) return;
  els.bulkRemoveBgAllProgress.textContent = text;
  els.bulkRemoveBgAllProgress.hidden = !text;
}

async function removeBackgroundFromAllBulkRows() {
  if (bgRemovalRunning || bulkRemoveBgAllRunning) return;

  const jobs = bulkSkuImageJobs();
  if (!jobs.length) {
    setStatus("No SKU images to process");
    window.setTimeout(() => setStatus("Ready"), 1800);
    return;
  }

  bulkRemoveBgAllRunning = true;
  bgRemovalRunning = true;
  if (els.bulkRemoveBgAllButton) els.bulkRemoveBgAllButton.disabled = true;
  if (els.bulkGenerateButton) els.bulkGenerateButton.disabled = true;
  setBulkRemoveBgAllProgress(`Loading model... (0/${jobs.length})`);

  let failed = 0;
  try {
    // Bulk rows resolve their images lazily (on first preview/generate) — a
    // row that's never been opened yet won't have a real skuImageUrl to
    // process until this runs.
    for (const job of jobs) {
      try {
        await ensureBulkRowResolved(job.row);
      } catch {
        // Resolution failure is already surfaced on the row itself
        // (setBulkRowStatus in ensureBulkRowResolved's caller elsewhere) —
        // this particular job just gets skipped below since its urlKey
        // will still be empty.
      }
    }

    for (let i = 0; i < jobs.length; i += 1) {
      const { row, urlKey, labelKey } = jobs[i];
      const sourceUrl = row[urlKey];
      setBulkRemoveBgAllProgress(`Removing background... (${i + 1}/${jobs.length})`);
      if (!sourceUrl) continue;

      try {
        commitHistoryStart(row);
        const newUrl = await removeBackgroundFromUrl(sourceUrl, (key, current, total) => {
          if (!total) return;
          const percent = Math.round((current / total) * 100);
          setBulkRemoveBgAllProgress(`Removing background... (${i + 1}/${jobs.length}) ${percent}%`);
        });
        row[urlKey] = newUrl;
        row[labelKey] = row[labelKey] ? `${row[labelKey]} (BG removed)` : "Background removed";
      } catch (error) {
        console.error("Bulk remove background failed", row, urlKey, error);
        failed += 1;
      } finally {
        commitHistoryEnd(row);
      }
    }

    setBulkRemoveBgAllProgress(
      failed ? `Done — ${failed} of ${jobs.length} image(s) failed` : `Done — ${jobs.length} image(s) processed`,
    );
    // Refresh whatever's actually on screen right now — a row being
    // processed in the background doesn't rebuild the main editor/canvas
    // until this whole batch finishes, same "don't disturb what's open"
    // rule the per-field Remove Background button follows.
    if (activeRow) {
      syncEditorFieldsFromContext();
      await renderPreviews();
    }
    renderBulkRows();
  } finally {
    bulkRemoveBgAllRunning = false;
    bgRemovalRunning = false;
    if (els.bulkRemoveBgAllButton) els.bulkRemoveBgAllButton.disabled = false;
    renderBulkSummary();
    window.setTimeout(() => setBulkRemoveBgAllProgress(""), 3000);
  }
}

// ---------------------------------------------------------------------------
// Touch Up: manual erase/restore brush editor for the SKU image.
//
// Both AI background removal and plain photos can leave unwanted bits behind
// (or, on the flip side, eat into the product itself). This gives a manual
// brush-based fix: Erase clears pixels to transparent, Restore paints pixels
// back from an untouched baseline snapshot taken when the editor opened.
// Edits happen on the one shared, full-resolution SKU image — since every
// output preview draws its own crop/zoom from that same source, a save here
// updates every output at once, exactly like Remove Background does.
// ---------------------------------------------------------------------------

async function openEditSkuModal(target = "sku") {
  const cfg = EDIT_TARGETS[target];
  const context = editingContext();
  if (!context[cfg.urlKey]) {
    setStatus(cfg.noImageMessage);
    window.setTimeout(() => setStatus("Ready"), 1800);
    return;
  }

  const image = await loadImage(context[cfg.urlKey]);
  if (!image) {
    setStatus("Could not open image for editing");
    window.setTimeout(() => setStatus("Ready"), 1800);
    return;
  }

  // The Restore brush can bring back pixels from the very first, pristine
  // image this context ever had — not just whatever Remove Background or a
  // prior Touch Up session left behind — so it can undo a fully-erased spot,
  // not only one that was left translucent. Falls back to the current image
  // if no pristine original was ever recorded (e.g. an older bulk row).
  const restoreSourceImage =
    (await loadImage(context[cfg.originalKey])) || image;

  const canvas = els.editSkuCanvas;
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  // Pre-rendered once at the canvas's own resolution, so every brush stamp
  // afterward is a cheap direct sample instead of re-scaling the (possibly
  // differently-sized) original photo each time.
  const restoreCanvas = document.createElement("canvas");
  restoreCanvas.width = canvas.width;
  restoreCanvas.height = canvas.height;
  restoreCanvas.getContext("2d").drawImage(restoreSourceImage, 0, 0, canvas.width, canvas.height);

  editSkuState = {
    target,
    context,
    baselineImage: image,
    restoreCanvas,
    canvas,
    ctx,
    tool: "erase",
    brushSize: Number(els.editSkuBrushSize?.value) || 40,
    drawing: false,
    lastPoint: null,
  };

  if (els.editSkuTitle) els.editSkuTitle.textContent = cfg.editTitle;
  setEditSkuTool("erase");
  setEditSkuBackdrop(editSkuBackdrop);
  if (els.editSkuOverlay) els.editSkuOverlay.hidden = false;
}

// Swaps the canvas backdrop between the original checkerboard and a solid
// light/dark fill — a flat backdrop makes leftover or under-erased
// background bits much easier to spot than the checker pattern can.
function setEditSkuBackdrop(mode) {
  editSkuBackdrop = mode;
  if (els.editSkuCanvasWrap) {
    els.editSkuCanvasWrap.classList.toggle("is-backdrop-light", mode === "light");
    els.editSkuCanvasWrap.classList.toggle("is-backdrop-dark", mode === "dark");
  }
  els.editSkuBackdropButtons?.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.backdrop === mode);
  });
}

function closeEditSkuModal() {
  // Release any in-progress stroke's pointer capture explicitly (e.g. when
  // Escape closes the modal mid-drag) rather than relying on it to lapse on
  // its own once the canvas is hidden.
  if (editSkuState?.drawing && editSkuState.pointerId != null) {
    try {
      editSkuState.canvas.releasePointerCapture(editSkuState.pointerId);
    } catch {
      // Already released or invalid — nothing to clean up.
    }
  }
  if (els.editSkuOverlay) els.editSkuOverlay.hidden = true;
  hideEditSkuBrushCursor();
  editSkuState = null;
}

function setEditSkuTool(tool) {
  if (editSkuState) editSkuState.tool = tool;
  els.editSkuEraseButton?.classList.toggle("is-active", tool === "erase");
  els.editSkuRestoreButton?.classList.toggle("is-active", tool === "restore");
}

function editSkuPointFromEvent(event) {
  const canvas = editSkuState.canvas;
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) * canvas.width) / rect.width,
    y: ((event.clientY - rect.top) * canvas.height) / rect.height,
  };
}

// The canvas hides its native cursor (styles.css sets `cursor: none`) so
// this ring — sized and positioned from the real pointer event — can stand
// in for it, making the actual brush footprint visible before you click.
function updateEditSkuBrushCursor(event) {
  if (!editSkuState || !els.editSkuBrushCursor) return;
  const canvas = editSkuState.canvas;
  const canvasRect = canvas.getBoundingClientRect();
  const wrapRect = canvas.parentElement.getBoundingClientRect();
  const scale = canvasRect.width / canvas.width; // CSS px per canvas px
  const diameter = editSkuState.brushSize * scale;

  els.editSkuBrushCursor.style.width = `${diameter}px`;
  els.editSkuBrushCursor.style.height = `${diameter}px`;
  els.editSkuBrushCursor.style.left = `${event.clientX - wrapRect.left}px`;
  els.editSkuBrushCursor.style.top = `${event.clientY - wrapRect.top}px`;
  els.editSkuBrushCursor.style.display = "block";
}

function hideEditSkuBrushCursor() {
  if (els.editSkuBrushCursor) els.editSkuBrushCursor.style.display = "none";
}

// Fraction of the brush radius that stays fully solid before fading out to
// the edge — gives both brushes a soft edge instead of a hard circular cutout.
const BRUSH_FEATHER_START = 0.55;

function createBrushGradient(ctx, x, y, radius) {
  const gradient = ctx.createRadialGradient(x, y, radius * BRUSH_FEATHER_START, x, y, radius);
  gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
  return gradient;
}

// Stamps one brush dab at `point`.
//
// Erase: fills the brush circle with a soft radial gradient using
// "destination-out", so opacity is fully subtracted at the center and fades
// out toward the edge.
//
// Restore: builds a small offscreen patch containing the baseline image
// masked by that same gradient, then blends the patch onto the canvas. This
// replaces an earlier version that relied on `globalCompositeOperation:
// "copy"` inside a clipped region — that combination didn't reliably put
// pixels back in every browser. Compositing a small patch with plain
// "source-over" (the canvas default) instead works everywhere and gives
// Restore the same feathered edge as Erase.
function editSkuBrushStamp(point) {
  const { ctx, tool, restoreCanvas, canvas, brushSize } = editSkuState;
  const radius = brushSize / 2;

  if (tool === "erase") {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = createBrushGradient(ctx, point.x, point.y, radius);
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Reused across every restore stamp in this session (a fast drag can fire
  // many stamps per second) instead of allocating a new canvas each time.
  const size = Math.ceil(radius * 2);
  let patch = editSkuState.patchCanvas;
  if (!patch) {
    patch = document.createElement("canvas");
    editSkuState.patchCanvas = patch;
  }
  if (patch.width !== size || patch.height !== size) {
    patch.width = size;
    patch.height = size;
  }
  const patchCtx = patch.getContext("2d");
  // Reset from whatever the previous stamp left behind before reusing it.
  patchCtx.globalCompositeOperation = "source-over";
  patchCtx.clearRect(0, 0, size, size);

  patchCtx.fillStyle = createBrushGradient(patchCtx, radius, radius, radius);
  patchCtx.beginPath();
  patchCtx.arc(radius, radius, radius, 0, Math.PI * 2);
  patchCtx.fill();

  // Swap the gradient's flat color for the restore-source image (the
  // pristine original, pre-rendered onto restoreCanvas in openEditSkuModal)
  // while keeping its faded alpha shape ("source-in" keeps only what's
  // already covered by the gradient). Drawing the whole canvas offset like
  // this is safe — canvases silently clip anything outside their own small
  // bounds, so there's no need to clamp the source rectangle by hand.
  patchCtx.globalCompositeOperation = "source-in";
  patchCtx.drawImage(
    restoreCanvas,
    -(point.x - radius),
    -(point.y - radius),
    canvas.width,
    canvas.height,
  );

  ctx.drawImage(patch, point.x - radius, point.y - radius);
}

// Interpolates dabs between the last point and this one so fast strokes
// don't leave gaps between individual brush stamps. Denser than a hard
// brush would need, since overlapping feathered stamps show visible seams
// more easily if spaced too far apart.
function editSkuStrokeTo(point) {
  const last = editSkuState.lastPoint || point;
  const distance = Math.hypot(point.x - last.x, point.y - last.y);
  const step = Math.max(editSkuState.brushSize / 6, 2);
  const steps = Math.max(1, Math.ceil(distance / step));

  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    editSkuBrushStamp({
      x: last.x + (point.x - last.x) * t,
      y: last.y + (point.y - last.y) * t,
    });
  }

  editSkuState.lastPoint = point;
}

function resetEditSkuCanvas() {
  const { ctx, baselineImage, canvas } = editSkuState;
  ctx.save();
  ctx.globalCompositeOperation = "copy";
  ctx.drawImage(baselineImage, 0, 0, canvas.width, canvas.height);
  ctx.restore();
}

async function saveEditSkuCanvas() {
  if (!editSkuState) return;
  const { canvas, context, target } = editSkuState;
  const cfg = EDIT_TARGETS[target || "sku"];
  commitHistoryStart(context);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) {
    commitHistoryEnd(context);
    closeEditSkuModal();
    return;
  }

  const newUrl = URL.createObjectURL(blob);

  context[cfg.urlKey] = newUrl;
  context[cfg.labelKey] = context[cfg.labelKey]
    ? `${context[cfg.labelKey]} (touched up)`
    : "Touched up";

  // The previous blob URL is deliberately left alive (not revoked) so undo
  // can restore it — see the comment in removeBackgroundFromImage above.

  // Same "only touch what's on screen if it's still this context" guard used
  // by Remove Background — harmless here since the modal blocks all other
  // interaction, but keeps the two code paths consistent and safe if that
  // ever changes.
  if (editingContext() === context) {
    cfg.fileNameEl().textContent = context[cfg.labelKey];
    await renderPreviews();
  }

  commitHistoryEnd(context);
  closeEditSkuModal();
}

function endEditSkuStroke(event) {
  if (!editSkuState || (event?.pointerId && editSkuState.pointerId !== event.pointerId)) return;
  editSkuState.drawing = false;
  editSkuState.lastPoint = null;
}

async function loadSkuImageFromInput() {
  const source = els.skuLink.value.trim();
  const context = editingContext();

  // A Shopee product page URL takes a different path entirely — it doesn't
  // resolve to one image, it resolves to a gallery the user picks from (see
  // fetchShopeeProductImageCandidates for why that lookup is currently a
  // stub). Anything else (a hash, or a direct image link) keeps using the
  // original single-image flow below, unchanged.
  if (isShopeeProductPageUrl(source)) {
    if (els.skuImageGalleryError) els.skuImageGalleryError.hidden = true;
    const originalLabel = els.loadSkuLinkButton.textContent;
    els.loadSkuLinkButton.disabled = true;
    els.loadSkuLinkButton.textContent = "Looking up...";
    setStatus("Looking up product images");

    try {
      const images = await fetchShopeeProductImageCandidates(source);
      context.skuImageCandidates = images;
      renderSkuImageGallery(context);
      await selectSkuImageCandidate(context, images[0]);
      setStatus(`${images.length} image${images.length === 1 ? "" : "s"} found`);
      window.setTimeout(() => setStatus("Ready"), 1800);
    } catch (error) {
      console.error("Product image lookup failed", error);
      context.skuImageCandidates = [];
      renderSkuImageGallery(context);
      if (els.skuImageGalleryError) {
        els.skuImageGalleryError.textContent = error.message || "Product image lookup failed.";
        els.skuImageGalleryError.hidden = false;
      }
      setStatus("Product lookup failed");
      window.setTimeout(() => setStatus("Ready"), 2200);
    } finally {
      els.loadSkuLinkButton.disabled = false;
      els.loadSkuLinkButton.textContent = originalLabel;
    }
    return;
  }

  // Falling back to a direct hash/link abandons any gallery a previous
  // product-URL lookup left behind — it's being replaced by a single image
  // now, same as switching back from a product URL was always meant to.
  if (context.skuImageCandidates?.length) {
    context.skuImageCandidates = [];
    renderSkuImageGallery(context);
  }

  const candidates = getImageCandidates(source);

  if (!candidates.length) {
    setStatus("Add image link");
    window.setTimeout(() => setStatus("Ready"), 1800);
    return;
  }

  const originalLabel = els.loadSkuLinkButton.textContent;
  els.loadSkuLinkButton.disabled = true;
  els.loadSkuLinkButton.textContent = "Loading...";
  setStatus("Loading image");
  commitHistoryStart(context);

  try {
    let loadedUrl = "";
    let lastError = null;

    for (const candidate of candidates) {
      try {
        loadedUrl = await fetchImageObjectUrl(candidate);
        break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!loadedUrl) throw lastError || new Error("Image could not be loaded.");

    setSkuImageUrl(loadedUrl, imageLabelFromSource(source));
    syncRemoveBgAvailability(editingContext());
    await renderPreviews();
    setStatus("Image loaded");
    window.setTimeout(() => setStatus("Ready"), 1400);
  } catch (error) {
    console.error("Image link failed", error);
    setStatus("Image load failed");
    window.setTimeout(() => setStatus("Ready"), 2200);
  } finally {
    commitHistoryEnd(context);
    els.loadSkuLinkButton.disabled = false;
    els.loadSkuLinkButton.textContent = originalLabel;
  }
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function getCoverMetrics(image, width, height, zoom = SKU_ZOOM_DEFAULT) {
  // Base scale is the "cover" fit (fills the box completely at zoom 1).
  // Zoom can go below 1 to shrink the image smaller than the box, or above
  // 1 to zoom in further — it's a free multiplier on top of cover-fit, not
  // clamped to "must always cover the box".
  const scale =
    Math.max(width / image.naturalWidth, height / image.naturalHeight) *
    clamp(zoom, SKU_ZOOM_MIN, SKU_ZOOM_MAX);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  return { drawWidth, drawHeight };
}

// offsetX/offsetY are raw pixel shifts away from dead-center within the box
// (not a 0-1 alignment fraction), so dragging can move the image freely in
// any direction by any amount, regardless of its size relative to the box.
function drawCover(ctx, image, x, y, width, height, offsetX = 0, offsetY = 0, zoom = SKU_ZOOM_DEFAULT) {
  if (!image) return;
  const { drawWidth, drawHeight } = getCoverMetrics(image, width, height, zoom);
  const dx = x + (width - drawWidth) / 2 + offsetX;
  const dy = y + (height - drawHeight) / 2 + offsetY;
  ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
}

function drawContain(ctx, image, x, y, width, height, alignX = 0.5, alignY = 0.5) {
  if (!image) return;
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const dx = x + (width - drawWidth) * alignX;
  const dy = y + (height - drawHeight) * alignY;
  ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
}

function getImageContentBounds(image) {
  if (imageContentBounds.has(image)) return imageContentBounds.get(image);

  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const fallback = { x: 0, y: 0, width, height };

  if (!width || !height) return fallback;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  try {
    ctx.drawImage(image, 0, 0);
    const { data } = ctx.getImageData(0, 0, width, height);
    let alphaBounds = null;
    let contentBounds = null;
    let contentPixels = 0;

    const addPoint = (bounds, x, y) => {
      if (!bounds) return { minX: x, minY: y, maxX: x, maxY: y };
      return {
        minX: Math.min(bounds.minX, x),
        minY: Math.min(bounds.minY, y),
        maxX: Math.max(bounds.maxX, x),
        maxY: Math.max(bounds.maxY, y),
      };
    };

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4;
        const red = data[index];
        const green = data[index + 1];
        const blue = data[index + 2];
        const alpha = data[index + 3];

        if (alpha > 10) alphaBounds = addPoint(alphaBounds, x, y);

        const isWhiteSpace = red > 245 && green > 245 && blue > 245;
        if (alpha > 18 && !isWhiteSpace) {
          contentBounds = addPoint(contentBounds, x, y);
          contentPixels += 1;
        }
      }
    }

    const bounds = contentPixels > 12 ? contentBounds : alphaBounds;
    const result = bounds
      ? {
          x: bounds.minX,
          y: bounds.minY,
          width: bounds.maxX - bounds.minX + 1,
          height: bounds.maxY - bounds.minY + 1,
        }
      : fallback;

    imageContentBounds.set(image, result);
    return result;
  } catch {
    imageContentBounds.set(image, fallback);
    return fallback;
  }
}

function drawContainTrimmed(ctx, image, x, y, width, height, alignX = 0.5, alignY = 0.5) {
  if (!image) return;
  const source = getImageContentBounds(image);
  const scale = Math.min(width / source.width, height / source.height);
  const drawWidth = source.width * scale;
  const drawHeight = source.height * scale;
  const dx = x + (width - drawWidth) * alignX;
  const dy = y + (height - drawHeight) * alignY;

  ctx.drawImage(
    image,
    source.x,
    source.y,
    source.width,
    source.height,
    dx,
    dy,
    drawWidth,
    drawHeight,
  );
}

function drawStretch(ctx, image, x, y, width, height) {
  if (!image) return;
  ctx.drawImage(image, x, y, width, height);
}

function splitLongWord(ctx, word, maxWidth) {
  const parts = [];
  let current = "";

  Array.from(word).forEach((character) => {
    const next = `${current}${character}`;
    if (ctx.measureText(next).width <= maxWidth || !current) {
      current = next;
    } else {
      parts.push(current);
      current = character;
    }
  });

  if (current) parts.push(current);
  return parts;
}

// Manual line breaks (from the KSP textarea's "paragraph mode" — pressing
// Enter) are treated as hard breaks first, then each resulting paragraph is
// still auto-wrapped by width independently, same as before. A single-line
// KSP (no "\n") behaves exactly as it did previously.
function wrapText(ctx, text, maxWidth) {
  const paragraphs = text.split("\n");
  const lines = [];

  paragraphs.forEach((paragraph) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      lines.push("");
      return;
    }

    let current = "";
    words.forEach((word) => {
      const pieces =
        ctx.measureText(word).width > maxWidth ? splitLongWord(ctx, word, maxWidth) : [word];

      pieces.forEach((piece) => {
        const next = current ? `${current} ${piece}` : piece;
        if (ctx.measureText(next).width <= maxWidth || !current) {
          current = next;
        } else {
          lines.push(current);
          current = piece;
        }
      });
    });

    if (current) lines.push(current);
  });

  return lines;
}

// Shrinks from maxSize down to minSize (in steps of 2) until the wrapped
// text fits within boxHeight. Shared by drawFittedText's default auto-fit
// path and by the KSP slider's initial value (so the slider starts at
// whatever size is actually currently on screen, not a hardcoded guess).
function computeFittedTextSize(ctx, text, boxWidth, boxHeight, maxSize, minSize, lineHeight) {
  let size = maxSize;
  let lines = [];

  while (size >= minSize) {
    ctx.font = `900 ${size}px ${FONT_NAME}, Arial Black, sans-serif`;
    lines = wrapText(ctx, text, boxWidth);
    if (lines.length * size * lineHeight <= boxHeight) break;
    size -= 2;
  }

  return { size: Math.max(size, minSize), lines };
}

// Picks the size + wrapped lines drawFittedText will actually draw with,
// without drawing anything — factored out so the KSP inline editor overlay
// can call the exact same logic to size/position itself identically to the
// real render, instead of a separate approximation that can drift out of
// sync with it (see applyKspOverlayLayout).
function resolveFittedTextLayout(ctx, text, box, options = {}) {
  const {
    maxSize = 58.67,
    minSize = KSP_AUTOFIT_MIN_SIZE,
    lineHeight = 1.04,
    // When set (a manual per-output override), skips auto-fit entirely and
    // draws at exactly this size — lets the user force where lines break
    // instead of the auto-fit algorithm picking a size for them.
    fixedSize = null,
  } = options;

  let size;
  let lines;

  if (fixedSize) {
    size = fixedSize;
    ctx.font = `900 ${size}px ${FONT_NAME}, Arial Black, sans-serif`;
    lines = wrapText(ctx, text, box.width);
  } else {
    ({ size, lines } = computeFittedTextSize(ctx, text, box.width, box.height, maxSize, minSize, lineHeight));
  }

  return { size, lines, lineHeight };
}

function drawFittedText(ctx, text, box, options = {}) {
  const { color = "#FFFFFF", align = "center", baseline = "middle" } = options;
  const { size, lines, lineHeight } = resolveFittedTextLayout(ctx, text, box, options);

  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.font = `900 ${size}px ${FONT_NAME}, Arial Black, sans-serif`;

  const totalHeight = lines.length * size * lineHeight;
  let startY =
    baseline === "top"
      ? box.y + size / 2
      : box.y + box.height / 2 - totalHeight / 2 + size / 2;
  const x = align === "left" ? box.x : box.x + box.width / 2;

  lines.forEach((line, index) => {
    ctx.fillText(line, x, startY + index * size * lineHeight);
  });
}

function drawFallbackBrand(ctx, box) {
  ctx.fillStyle = "#72CBBB";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 ${Math.min(box.height * 0.42, box.width * 0.12)}px ${FONT_NAME}, Arial Black, sans-serif`;
  ctx.fillText("cottonseeds", box.x + box.width / 2, box.y + box.height / 2);
}

function drawBrandLogo(ctx, image, box, context = state, outputId = null, fallbackImage = null) {
  ctx.save();
  roundRect(ctx, box.x, box.y, box.width, box.height, box.radius);
  ctx.clip();
  // Keep the white logo panel as an independent editable-template layer.
  // The Hide White Logo Container toggle deliberately suppresses this fill.
  if (!context.hideLogoContainer) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(box.x, box.y, box.width, box.height);
  }

  // No real logo uploaded yet: show the neutral placeholder graphic in its
  // place (not zoomable/draggable — it's a starter visual, not real
  // content) instead of drawing anything logo-shaped from `image`. Suppressed
  // when the white container is hidden, same as the old text fallback was,
  // since there's no visible box left for a placeholder to sit inside.
  const resolvedImage = image || (!context.hideLogoContainer ? fallbackImage : null);
  if (resolvedImage) {
    const insetX = box.width * 0.06;
    const insetY = box.height * 0.1;
    const innerWidth = box.width - insetX * 2;
    const innerHeight = box.height - insetY * 2;
    // Zoom scales the contain-fit target box around its own center, then
    // the rounded-rect clip above crops anything beyond the visible box —
    // same "zoom in and crop" idea as SKU zoom, but with no drag/reposition,
    // since the logo always stays centered in its box. The placeholder
    // graphic always renders at the default zoom, ignoring any per-output
    // zoom saved for a real logo.
    const zoom = image && outputId ? getLogoZoom(outputId, context) : LOGO_ZOOM_DEFAULT;
    const zoomedWidth = innerWidth * zoom;
    const zoomedHeight = innerHeight * zoom;
    drawContainTrimmed(
      ctx,
      resolvedImage,
      box.x + insetX - (zoomedWidth - innerWidth) / 2,
      box.y + insetY - (zoomedHeight - innerHeight) / 2,
      zoomedWidth,
      zoomedHeight,
    );
  } else if (!context.hideLogoContainer) {
    drawFallbackBrand(ctx, box);
  }

  ctx.restore();
}

function drawFloatingIconLogo(ctx, image, box, context = state, outputId = null) {
  // Paint slightly underneath the frame. The red chrome is drawn afterwards,
  // so no white guide pixels can remain between KV and the outline.
  const fillBox = {
    x: box.x - 4,
    y: box.y - 4,
    width: box.width + 8,
    height: box.height + 8,
    radius: box.radius + 4,
  };
  const zoom = outputId ? getLogoZoom(outputId, context) : LOGO_ZOOM_DEFAULT;
  ctx.save();
  roundRect(ctx, fillBox.x, fillBox.y, fillBox.width, fillBox.height, fillBox.radius);
  ctx.clip();
  // In Standard Floating Icon, the logo panel is part of the KV treatment:
  // its fill follows the selected KV colour rather than retaining the guide's
  // white panel. Blank mode has its own DOM renderer and is unaffected.
  ctx.fillStyle = context.kvColor;
  ctx.fillRect(fillBox.x, fillBox.y, fillBox.width, fillBox.height);
  ctx.restore();
  if (!image) {
    return;
  }
  ctx.save();
  roundRect(ctx, box.x, box.y, box.width, box.height, box.radius);
  ctx.clip();
  drawContain(
    ctx,
    image,
    box.x - (box.width * zoom - box.width) / 2,
    box.y - (box.height * zoom - box.height) / 2,
    box.width * zoom,
    box.height * zoom,
  );
  ctx.restore();
}

function drawFloatingIconChrome(ctx, overlay) {
  if (!overlay) return;
  const mask = document.createElement("canvas");
  mask.width = overlay.naturalWidth || 360;
  mask.height = overlay.naturalHeight || 360;
  const maskContext = mask.getContext("2d", { willReadFrequently: true });
  maskContext.drawImage(overlay, 0, 0, mask.width, mask.height);
  const pixels = maskContext.getImageData(0, 0, mask.width, mask.height);
  for (let offset = 0; offset < pixels.data.length; offset += 4) {
    const x = (offset / 4) % mask.width;
    const y = Math.floor(offset / 4 / mask.width);
    const redChrome = pixels.data[offset] > 120 && pixels.data[offset + 1] < 115 && pixels.data[offset + 2] < 115;
    const closeButton = x >= 300 && y <= 68;
    if (!redChrome && !closeButton) pixels.data[offset + 3] = 0;
  }
  maskContext.putImageData(pixels, 0, 0);
  ctx.drawImage(mask, 0, 0, 360, 360);
}

// The supplied Pop Up and Skinny overlays also contain guide-colour pixels
// immediately outside the red pills. Repainting a rectangular source crop
// brings those pixels back after the editable artwork is drawn. Clip each
// crop to the pill itself so the mandatory chrome keeps its intended rounded
// corners in both the editor and downloaded PNG.
function drawRoundedOverlayCrop(ctx, image, x, y, width, height, radius) {
  if (!image) return;
  ctx.save();
  roundRect(ctx, x, y, width, height, radius);
  ctx.clip();
  ctx.drawImage(image, x, y, width, height, x, y, width, height);
  ctx.restore();
}

function drawRoundedOverlayImage(ctx, image, x, y, width, height, radius) {
  if (!image) return;
  ctx.save();
  roundRect(ctx, x, y, width, height, radius);
  ctx.clip();
  ctx.drawImage(image, x, y, width, height);
  ctx.restore();
}

function getLayout(format, context = state) {
  const { width: w, height: h } = format;

  if (isPayingSellerTemplate(context.template) && payingSellerLayouts[format.title]) {
    return payingSellerLayouts[format.title];
  }

  const newArrivalLogo = context.template === "Mall BAU New Arrival"
    ? newArrivalLogoBoxes[format.title]
    : null;
  const newArrivalKsp = context.template === "Mall BAU New Arrival"
    ? newArrivalKspBoxes[format.title]
    : null;

  if (format.title === "Pop Up Banner") {
    return {
      kv: { x: 36, y: 30, width: 508, height: 338 },
      product: { x: 36, y: 368, width: 508, height: 319 },
      logo: { x: 139, y: 109, width: 302, height: 100, radius: 18 },
      ksp: { x: 80, y: 246, width: 420, height: 92, maxSize: 42, minSize: 24 },
      productAlign: [0.5, 0.5],
    };
  }
  if (format.title === "Skinny Banner") {
    return {
      kv: { x: 45, y: 38, width: 568, height: 280 },
      product: { x: 613, y: 38, width: 543, height: 280 },
      logo: { x: 177, y: 103, width: 303, height: 101, radius: 18 },
      ksp: { x: 170, y: 214, width: 330, height: 80, maxSize: 42, minSize: 22 },
      productAlign: [0.5, 0.5],
    };
  }
  if (format.title === "Floating Icon") {
    const isSquareLogo = context.floatingLogoRatio === "square";
    return {
      // The supplied overlays define the fixed red ring and close button.
      // Only the circular design area and brand-logo panel are editable.
      product: { x: 20, y: 30, width: 320, height: 320 },
      logo: isSquareLogo
        ? { x: 132, y: 20, width: 96, height: 80, radius: 15 }
        : { x: 61, y: 20, width: 238, height: 80, radius: 15 },
      ksp: { x: 0, y: 0, width: 0, height: 0, maxSize: 1, minSize: 1 },
      productAlign: [0.5, 0.5],
    };
  }

  if (format.title === "Top Module Banner") {
    return {
      kv: { x: 0, y: 0, width: 720, height: h },
      product: { x: 720, y: 0, width: w - 720, height: h },
      logo:
        newArrivalLogo ||
        { x: 35.749, y: 35.248, width: 257.201, height: 85.504, radius: 15.199 },
      ksp:
        newArrivalKsp ||
        { x: 346, y: 28, width: 330, height: 100, maxSize: 58.67, minSize: 30 },
      productAlign: [0.5, 0.62],
    };
  }

  if (format.title === "Category Banner") {
    return {
      kv: { x: 0, y: 0, width: 500, height: h },
      product: { x: 500, y: 0, width: w - 500, height: h },
      logo:
        newArrivalLogo ||
        { x: 88.3, y: 78.903, width: 322.668, height: 107.268, radius: 19.068 },
      ksp:
        newArrivalKsp ||
        { x: 38, y: 202, width: 424, height: 120, maxSize: 58.67, minSize: 34 },
      productAlign: [0.62, 0.58],
    };
  }

  if (format.title === "IG Story") {
    return {
      kv: { x: 0, y: 0, width: w, height: 850 },
      product: { x: 0, y: 850, width: w, height: h - 850 },
      logo:
        newArrivalLogo ||
        { x: 255.742, y: 380.519, width: 568.516, height: 188.998, radius: 33.596 },
      ksp:
        newArrivalKsp ||
        { x: 135, y: 590, width: 810, height: 230, maxSize: 86, minSize: 42 },
      productAlign: [0.5, 0.45],
    };
  }

  if (format.title === "FB Post") {
    return {
      kv: { x: 0, y: 0, width: 607, height: h },
      product: { x: 607, y: 0, width: w - 607, height: h },
      logo:
        newArrivalLogo ||
        { x: 119.976, y: 196.548, width: 342.137, height: 144.934, radius: 23.803 },
      // Width widened from the original 344 (which left ~145px unused on
      // the right of the 607-wide KV column, forcing longer KSP text into
      // extra wrapped lines). x shifted left from 120 to 61 so the wider
      // box stays centered on the same horizontal center as the logo box
      // above it (~291px) instead of just growing rightward off-center.
      ksp:
        newArrivalKsp ||
        { x: 61, y: 394, width: 460, height: 150, maxSize: 58.67, minSize: 36 },
      productAlign: [0.56, 0.55],
    };
  }

  return {
    kv: { x: 0, y: 0, width: w, height: 414 },
    product: { x: 0, y: 414, width: w, height: h - 414 },
    logo:
      newArrivalLogo ||
      { x: 114.998, y: 91.451, width: 301.003, height: 100.066, radius: 17.787 },
    ksp:
      newArrivalKsp ||
      { x: 70, y: 239, width: 392, height: 128, maxSize: 58.67, minSize: 34 },
    productAlign: [0.5, 0.42],
  };
}

// Paints whatever should currently be showing in the KV area of `box` (a
// sub-region of layout.kv, or the full rect itself): the uploaded KV image
// (cover-fit, drag/zoom per output) when that mode is on, otherwise the flat
// KV color — same "clip to box, draw the full-rect content, let the clip
// reveal only the relevant crop" trick repaintBehindClearBox uses for the
// product area. No-ops entirely for Paying Seller templates, whose fixed
// campaign background (baked into the overlay) is drawn later and isn't
// something KV Color/Image ever controls.
function drawKvArea(ctx, box, outputId, layout, context, kvImage) {
  if (!templateUsesFlatKv(context.template)) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.width, box.height);
  ctx.clip();
  if (context.kvMode === "image" && kvImage) {
    const kvPosition = getKvImagePosition(outputId, context);
    const kvZoom = getKvImageZoom(outputId, context);
    drawCover(
      ctx,
      kvImage,
      layout.kv.x,
      layout.kv.y,
      layout.kv.width,
      layout.kv.height,
      kvPosition.x,
      kvPosition.y,
      kvZoom,
    );
  } else {
    ctx.fillStyle = context.kvColor;
    ctx.fillRect(layout.kv.x, layout.kv.y, layout.kv.width, layout.kv.height);
  }
  ctx.restore();
}

function drawBackground(ctx, format, outputId, context = state, kvImage = null) {
  const layout = getLayout(format, context);
  if (format.title === "Pop Up Banner") {
    ctx.clearRect(0, 0, format.width, format.height);
    ctx.save();
    roundRect(ctx, 36, 30, 508, 657, 30);
    ctx.clip();
    // Use the shared soft-pink SKU panel default, matching the other Mall BAU
    // outputs. Users can still choose a different colour in the editor.
    ctx.fillStyle = context.skuBackgroundColor || "#FFF3F6";
    ctx.fillRect(36, 30, 508, 657);
    drawKvArea(ctx, layout.kv, outputId, layout, context, kvImage);
    ctx.restore();
    return layout;
  }
  ctx.fillStyle = context.skuBackgroundColor || "#FFF3F6";
  ctx.fillRect(0, 0, format.width, format.height);
  drawKvArea(ctx, layout.kv, outputId, layout, context, kvImage);
  return layout;
}

// Positions are stored as raw pixel offsets from dead-center (not a 0-1
// alignment fraction), so an image can be dragged freely by any amount in
// any direction regardless of its size relative to the box. When nothing
// has been saved yet, fall back to a per-format default offset derived
// from the old art-directed alignment bias (productAlign), evaluated at
// the default zoom so the initial framing looks the same as before.
function getDefaultLayerOffset(image, layout, productAlign) {
  if (!image) return { x: 0, y: 0 };
  const { drawWidth, drawHeight } = getCoverMetrics(
    image,
    layout.product.width,
    layout.product.height,
    SKU_ZOOM_DEFAULT,
  );
  return {
    x: (layout.product.width - drawWidth) * (productAlign[0] - 0.5),
    y: (layout.product.height - drawHeight) * (productAlign[1] - 0.5),
  };
}

// `context` defaults to the single editor's global `state`, so every
// existing call site keeps working unchanged. A bulk row can also act as
// its own context (it has the same shaped skuPositions/skuZooms/ksp/etc.
// fields), which is what lets each row get independent drag/zoom editing
// without disturbing the single editor or any other row.
function getSkuPosition(outputId, layout = null, image = null, context = state) {
  const savedPosition = context.skuPositions[outputId];
  if (savedPosition) return savedPosition;

  const currentLayout = layout || getLayout(outputMeta[outputId], context);
  return getDefaultLayerOffset(image, currentLayout, currentLayout.productAlign);
}

function setSkuPosition(outputId, position, context = state) {
  context.skuPositions[outputId] = {
    x: Number.isFinite(position.x) ? position.x : 0,
    y: Number.isFinite(position.y) ? position.y : 0,
  };
}

function getSkuZoom(outputId, context = state) {
  return context.skuZooms[outputId] || SKU_ZOOM_DEFAULT;
}

function setSkuZoom(outputId, zoom, context = state) {
  context.skuZooms[outputId] = clamp(zoom, SKU_ZOOM_MIN, SKU_ZOOM_MAX);
}

function getLogoZoom(outputId, context = state) {
  return context.logoZooms[outputId] || LOGO_ZOOM_DEFAULT;
}

function setLogoZoom(outputId, zoom, context = state) {
  context.logoZooms[outputId] = clamp(zoom, LOGO_ZOOM_MIN, LOGO_ZOOM_MAX);
}

// Returns the manually-set KSP font size for this output, or null when it
// should keep using auto-fit (the default until the user touches the slider).
function getKspFontSize(outputId, context = state) {
  const saved = context.kspFontSizes[outputId];
  return Number.isFinite(saved) ? saved : null;
}

function setKspFontSize(outputId, size, layout, context = state) {
  context.kspFontSizes[outputId] = clamp(size, layout.ksp.minSize, layout.ksp.maxSize);
}

// Vertical-only drag offset for the KSP box, in raw pixels from the format's
// designed y position — no clamping, same "pixel for pixel, no limits"
// philosophy as SKU/background drag. Horizontal position is never touched:
// drawFittedText always centers on the box's own horizontal center, so the
// text stays anchored there regardless of this offset.
function getKspOffsetY(outputId, context = state) {
  return context.kspOffsets[outputId] || 0;
}

function setKspOffsetY(outputId, offsetY, context = state) {
  context.kspOffsets[outputId] = Number.isFinite(offsetY) ? offsetY : 0;
}

// The text actually rendered/edited for one specific output: that output's
// own manual line-break override if it has one (set by pressing Enter while
// editing directly on that banner's canvas — see commitKspTextChange), or
// the shared `ksp` text otherwise. Every output falls back to the shared
// text by default, so wording changes reach every banner at once; only a
// manually-forced line-break position stays local to the banner it was set
// on.
function getKspRenderText(outputId, context = state) {
  return context.kspManualBreaksByOutput?.[outputId] || context.ksp;
}

function hasSkuBackground(context = state) {
  return context.skuBackgroundIndex >= 0 && context.skuBackgroundIndex < SKU_BACKGROUNDS.length;
}

// Whether the "KV" layer switch option/drag/zoom should be reachable right
// now: the template supports a flat KV area at all (not a Paying Seller
// fixed campaign background), Image mode is on, and an image has actually
// been uploaded — same "only show once there's something to edit" rule
// hasSkuBackground() applies to the BG option.
function hasKvImage(context = state) {
  return templateUsesFlatKv(context.template) && context.kvMode === "image" && Boolean(context.kvImageUrl);
}

function getSkuBackgroundSrc(context = state) {
  if (!hasSkuBackground(context)) return "";
  const source = SKU_BACKGROUNDS[context.skuBackgroundIndex].src;
  // Local file URLs taint a canvas opened directly from file://. The phone
  // preview uses compact embedded equivalents only, keeping the editor and
  // final banner export on the original full-quality assets.
  return context.previewLocalAssets?.[source] || source;
}

function getSkuBackgroundLabel(context = state) {
  return hasSkuBackground(context) ? SKU_BACKGROUNDS[context.skuBackgroundIndex].label : "None";
}

// Selection cycles through "None" plus every background, wrapping in both
// directions: -1 (None), 0, 1, ... N-1, back to -1.
// index is -1 for "None", or 0..N-1 into SKU_BACKGROUNDS. Picked directly
// from a thumbnail click rather than stepping through with arrows.
function chooseSkuBackground(index, context = state) {
  context.skuBackgroundIndex = index;
  if (!hasSkuBackground(context)) resetActiveLayers(context);
}

function getSkuBackgroundPosition(outputId, layout = null, image = null, context = state) {
  const savedPosition = context.skuBackgroundPositions[outputId];
  if (savedPosition) return savedPosition;

  const currentLayout = layout || getLayout(outputMeta[outputId], context);
  return getDefaultLayerOffset(image, currentLayout, currentLayout.productAlign);
}

function setSkuBackgroundPosition(outputId, position, context = state) {
  context.skuBackgroundPositions[outputId] = {
    x: Number.isFinite(position.x) ? position.x : 0,
    y: Number.isFinite(position.y) ? position.y : 0,
  };
}

function getSkuBackgroundZoom(outputId, context = state) {
  return context.skuBackgroundZooms[outputId] || SKU_ZOOM_DEFAULT;
}

function setSkuBackgroundZoom(outputId, zoom, context = state) {
  context.skuBackgroundZooms[outputId] = clamp(zoom, SKU_ZOOM_MIN, SKU_ZOOM_MAX);
}

// KV Image position/zoom — same drag/zoom mechanics as the SKU Background
// layer above, but the image sits in `layout.kv` instead of `layout.product`,
// and centers by default (no art-directed alignment bias — it's a plain
// backdrop photo, not a product shot).
function getKvImagePosition(outputId, context = state) {
  return context.kvImagePositions[outputId] || { x: 0, y: 0 };
}

function setKvImagePosition(outputId, position, context = state) {
  context.kvImagePositions[outputId] = {
    x: Number.isFinite(position.x) ? position.x : 0,
    y: Number.isFinite(position.y) ? position.y : 0,
  };
}

function getKvImageZoom(outputId, context = state) {
  return context.kvImageZooms[outputId] || SKU_ZOOM_DEFAULT;
}

function setKvImageZoom(outputId, zoom, context = state) {
  context.kvImageZooms[outputId] = clamp(zoom, SKU_ZOOM_MIN, SKU_ZOOM_MAX);
}

// Registry so drag/zoom code can operate on "whichever layer is active"
// without branching everywhere. Both the SKU photo and the background are
// bound to whichever context is passed in — each row (or the single
// editor's `state`) carries its own independent copy of everything.
function getSkuLayers(context = state) {
  return {
    sku: {
      getImageUrl: () => context.skuImageUrl,
      getPosition: (outputId, layout, image) => getSkuPosition(outputId, layout, image, context),
      setPosition: (outputId, position) => setSkuPosition(outputId, position, context),
      getZoom: (outputId) => getSkuZoom(outputId, context),
      setZoom: (outputId, zoom) => setSkuZoom(outputId, zoom, context),
    },
    background: {
      getImageUrl: () => getSkuBackgroundSrc(context),
      getPosition: (outputId, layout, image) =>
        getSkuBackgroundPosition(outputId, layout, image, context),
      setPosition: (outputId, position) => setSkuBackgroundPosition(outputId, position, context),
      getZoom: (outputId) => getSkuBackgroundZoom(outputId, context),
      setZoom: (outputId, zoom) => setSkuBackgroundZoom(outputId, zoom, context),
    },
    kv: {
      getImageUrl: () => context.kvImageUrl,
      getPosition: (outputId) => getKvImagePosition(outputId, context),
      setPosition: (outputId, position) => setKvImagePosition(outputId, position, context),
      getZoom: (outputId) => getKvImageZoom(outputId, context),
      setZoom: (outputId, zoom) => setKvImageZoom(outputId, zoom, context),
    },
    // No drag — the logo always stays centered in its box, so getPosition/
    // setPosition/getImageUrl are unused stubs (bindSkuDrag never reaches
    // them for this layer; kept only so nothing crashes if something else
    // ever calls through this interface generically).
    logo: {
      getImageUrl: () => context.brandLogoUrl,
      getPosition: () => ({ x: 0, y: 0 }),
      setPosition: () => {},
      getZoom: (outputId) => getLogoZoom(outputId, context),
      setZoom: (outputId, zoom) => setLogoZoom(outputId, zoom, context),
    },
  };
}

// "ksp" is a valid active-layer key too, but isn't a draggable image layer —
// it's handled as a special case wherever the zoom control is built, so it
// deliberately has no entry in getSkuLayers(). "sku2"/"sku3" are Shopee Live
// FS only (see getShopeeLiveFsSkuLayers) — harmless additions here since
// every other template simply never sets/reads them.
const VALID_LAYER_KEYS = new Set(["logo", "ksp", "sku", "background", "kv", "sku2", "sku3"]);

function getActiveLayer(outputId, context = state) {
  const stored = context.activeLayerByOutput[outputId];
  return VALID_LAYER_KEYS.has(stored) ? stored : "sku";
}

function setActiveLayer(outputId, layerKey, context = state) {
  context.activeLayerByOutput[outputId] = VALID_LAYER_KEYS.has(layerKey) ? layerKey : "sku";
}

// Called when a background scene is deselected, since "background" stops
// being a valid choice for any card currently on it. Only touches outputs
// actually on "background" — a deliberate Logo or KSP selection has nothing
// to do with the background scene and shouldn't get bumped back to SKU
// just because the background was turned off.
function resetActiveLayers(context = state) {
  Object.keys(context.activeLayerByOutput).forEach((outputId) => {
    if (context.activeLayerByOutput[outputId] === "background") {
      context.activeLayerByOutput[outputId] = "sku";
    }
  });
}

// Same idea as resetActiveLayers above, but for the KV layer — called
// whenever KV Image mode/image stops being eligible (switched back to
// Color mode, image removed, or the template switched to a Paying Seller
// template that doesn't use KV at all), since "kv" stops being a valid
// choice for any card currently on it.
function resetKvActiveLayers(context = state) {
  Object.keys(context.activeLayerByOutput).forEach((outputId) => {
    if (context.activeLayerByOutput[outputId] === "kv") {
      context.activeLayerByOutput[outputId] = "sku";
    }
  });
}

function getOverlaySrc(format, context = state) {
  if (context.template === PAYING_SELLER_TEMPLATE) {
    // Only Category Banner and Banner Card have Paying Seller artwork; fall
    // back to the standard overlay for any other format (shouldn't normally
    // render since those outputs are disabled for this template).
    if (context.hideLogoContainer && format.payingSellerOverlayNoContainer) {
      return format.payingSellerOverlayNoContainer;
    }
    return format.payingSellerOverlay || format.overlay;
  }

  if (context.template === PAYING_SELLER_99_TEMPLATE) {
    if (context.hideLogoContainer && format.paying99OverlayNoContainer) {
      return format.paying99OverlayNoContainer;
    }
    return format.paying99Overlay || format.overlay;
  }

  if (context.template === "Mall BAU New Arrival") {
    if (context.hideLogoContainer && format.newArrivalOverlayNoContainer) {
      return format.newArrivalOverlayNoContainer;
    }
    return format.newArrivalOverlay;
  }

  if (context.hideLogoContainer && format.overlayNoContainer) return format.overlayNoContainer;
  return format.overlay;
}

// ---------------------------------------------------------------------------
// Shopee Live Flash Sale — its own dedicated render path (see
// SHOPEE_LIVE_FS_LAYOUT for box coordinates/colors). Doesn't go through
// drawBackground/getLayout at all: drawOutput branches straight here for
// SHOPEE_LIVE_FS_OUTPUT_ID. SKU 2 / SKU 3 get their own simple drag/zoom
// accessors below (centered by default, no art-directed alignment bias —
// they're plain thumbnail crops, not a "hero" shot); SKU 1 reuses the
// existing getSkuPosition/getSkuZoom directly since it's this template's
// hero SKU and those are already generic over outputId/context.
// ---------------------------------------------------------------------------

function getSku2Position(outputId, context = state) {
  return context.sku2Positions[outputId] || { x: 0, y: 0 };
}
function setSku2Position(outputId, position, context = state) {
  context.sku2Positions[outputId] = {
    x: Number.isFinite(position.x) ? position.x : 0,
    y: Number.isFinite(position.y) ? position.y : 0,
  };
}
function getSku2Zoom(outputId, context = state) {
  return context.sku2Zooms[outputId] || SKU_ZOOM_DEFAULT;
}
function setSku2Zoom(outputId, zoom, context = state) {
  context.sku2Zooms[outputId] = clamp(zoom, SKU_ZOOM_MIN, SKU_ZOOM_MAX);
}

function getSku3Position(outputId, context = state) {
  return context.sku3Positions[outputId] || { x: 0, y: 0 };
}
function setSku3Position(outputId, position, context = state) {
  context.sku3Positions[outputId] = {
    x: Number.isFinite(position.x) ? position.x : 0,
    y: Number.isFinite(position.y) ? position.y : 0,
  };
}
function getSku3Zoom(outputId, context = state) {
  return context.sku3Zooms[outputId] || SKU_ZOOM_DEFAULT;
}
function setSku3Zoom(outputId, zoom, context = state) {
  context.sku3Zooms[outputId] = clamp(zoom, SKU_ZOOM_MIN, SKU_ZOOM_MAX);
}

// Registry mirroring getSkuLayers() but for this template's three SKU slots
// specifically — used by bindShopeeLiveFsDrag/createShopeeLiveFsPreviewBlock
// so drag/zoom code can stay generic over "whichever SKU tab is active"
// instead of branching sku/sku2/sku3 everywhere.
function getShopeeLiveFsSkuLayers(context = state) {
  return {
    sku: {
      box: SHOPEE_LIVE_FS_LAYOUT.productImage1,
      getImageUrl: () => context.skuImageUrl,
      getPosition: (outputId) => getSkuPosition(outputId, null, null, context),
      setPosition: (outputId, position) => setSkuPosition(outputId, position, context),
      getZoom: (outputId) => getSkuZoom(outputId, context),
      setZoom: (outputId, zoom) => setSkuZoom(outputId, zoom, context),
    },
    sku2: {
      box: SHOPEE_LIVE_FS_LAYOUT.sku2Image,
      getImageUrl: () => context.sku2ImageUrl,
      getPosition: (outputId) => getSku2Position(outputId, context),
      setPosition: (outputId, position) => setSku2Position(outputId, position, context),
      getZoom: (outputId) => getSku2Zoom(outputId, context),
      setZoom: (outputId, zoom) => setSku2Zoom(outputId, zoom, context),
    },
    sku3: {
      box: SHOPEE_LIVE_FS_LAYOUT.sku3Image,
      getImageUrl: () => context.sku3ImageUrl,
      getPosition: (outputId) => getSku3Position(outputId, context),
      setPosition: (outputId, position) => setSku3Position(outputId, position, context),
      getZoom: (outputId) => getSku3Zoom(outputId, context),
      setZoom: (outputId, zoom) => setSku3Zoom(outputId, zoom, context),
    },
  };
}

// Picks the size + wrapped lines drawShopeeLiveFsText will actually draw
// with, without drawing anything — same "shared sizing" factoring as
// resolveFittedTextLayout/KSP above, so the field editor overlay (see
// openFieldEditor) can mirror the real render exactly instead of a second
// approximation that can drift out of sync with it.
function resolveShopeeLiveFsTextLayout(ctx, text, box, options = {}) {
  const { autoFit = false, maxSize, minSize, size } = options;
  let fontSize;
  let lines;
  if (autoFit) {
    ({ size: fontSize, lines } = computeFittedTextSize(ctx, text, box.width, box.height, maxSize, minSize, 1.08));
    ctx.font = `800 ${fontSize}px Arial, sans-serif`;
    lines = wrapText(ctx, text, box.width);
  } else {
    fontSize = size;
    ctx.font = `800 ${fontSize}px Arial, sans-serif`;
    lines = [text];
  }
  return { fontSize, lines };
}

// Draws one Shopee Live FS text field at its fixed box — left-aligned by
// default (matching the design), optionally centered or struck through.
// Unlike drawFittedText, most of these are single fixed sizes (the design
// doesn't auto-shrink a price or a percentage badge) — only productName
// auto-fits/wraps, since it's the one field long enough to need it. Skips
// drawing entirely while this exact field is open in the inline editor (see
// isFieldBeingEdited) — the textarea overlay sitting on top already shows
// the live text, so drawing it here too would double it up as a "shadow"
// underneath, same issue the KSP editor had.
function drawShopeeLiveFsText(ctx, text, box, options = {}) {
  const { color, align = "left", autoFit = false, maxSize, minSize, size, strikethrough = false, fieldKey, context } = options;
  if (fieldKey && context && isFieldBeingEdited(fieldKey, context)) return;
  if (!text) return;

  ctx.fillStyle = color;
  ctx.textAlign = align;

  const { fontSize, lines } = resolveShopeeLiveFsTextLayout(ctx, text, box, { autoFit, maxSize, minSize, size });
  const x = align === "center" ? box.x + box.width / 2 : box.x;

  if (lines.length === 1) {
    // Single-line fields (everything but the auto-fit/wrapped Product Name)
    // center on the *rendered glyphs* rather than canvas's own "middle"
    // textBaseline, which centers on the font's full ascent+descent em-box
    // instead — for text with no descenders (all-caps, digits, currency —
    // i.e. every one of these fields), that sits visibly above the actual
    // glyph shapes, most noticeably on the larger Time field.
    ctx.textBaseline = "alphabetic";
    const metrics = ctx.measureText(lines[0]);
    const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.72;
    const descent = metrics.actualBoundingBoxDescent || fontSize * 0.18;
    const y = box.y + box.height / 2 + (ascent - descent) / 2;
    ctx.fillText(lines[0], x, y);
    if (strikethrough) {
      const width = metrics.width;
      const lineX = align === "center" ? x - width / 2 : x;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1.5, fontSize * 0.07);
      ctx.beginPath();
      ctx.moveTo(lineX, y - ascent / 2);
      ctx.lineTo(lineX + width, y - ascent / 2);
      ctx.stroke();
      ctx.restore();
    }
    return;
  }

  ctx.textBaseline = "middle";
  const lineHeight = fontSize * 1.15;
  const totalHeight = lines.length * lineHeight;
  const startY = box.y + box.height / 2 - totalHeight / 2 + lineHeight / 2;
  lines.forEach((line, index) => {
    ctx.fillText(line, x, startY + index * lineHeight);
  });
}

// Draws one of the 3 discount-% badges: a small rounded "pill" card behind
// the text, then the text on top of it — unlike drawShopeeLiveFsText, this
// paints its own background rather than relying on the overlay art's baked-
// in version. Needed specifically because pct2/pct3's box sits inside
// sku2Image/sku3Image's own box (a badge parked on the corner of that
// photo, by design — see SHOPEE_LIVE_FS_LAYOUT's own comment): the SKU 2/3
// photo is opaque and drawn on top of the overlay, so it paints over
// whatever pill the overlay had there before this function's own call ever
// gets a chance to draw on top of *that*. pct1 never has this problem (its
// box sits above productImage1's, no overlap) but gets the same treatment
// here anyway for consistency and so it isn't silently relying on the
// overlay's own copy either.
function drawPctBadge(ctx, text, box, options = {}) {
  const { color, size, pillRadius = 8, pillFill = "#F9ECEA", pillBorder = "rgba(0, 0, 0, 0.12)", fieldKey, context } = options;
  if (fieldKey && context && isFieldBeingEdited(fieldKey, context)) return;
  if (!text) return;

  ctx.save();
  roundRect(ctx, box.x, box.y, box.width, box.height, pillRadius);
  ctx.fillStyle = pillFill;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = pillBorder;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.font = `800 ${size}px Arial, sans-serif`;
  // Optical centering on the rendered glyphs (see drawShopeeLiveFsText's own
  // comment on this) rather than canvas's "middle" baseline, which centers
  // on the font's full ascent+descent em-box instead.
  ctx.textBaseline = "alphabetic";
  const metrics = ctx.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent || size * 0.72;
  const descent = metrics.actualBoundingBoxDescent || size * 0.18;
  const y = box.y + box.height / 2 + (ascent - descent) / 2;
  ctx.fillText(text, box.x + box.width / 2, y);
}

async function drawShopeeLiveFs(ctx, format, context) {
  const L = SHOPEE_LIVE_FS_LAYOUT;
  const outputId = SHOPEE_LIVE_FS_OUTPUT_ID;
  const layers = getShopeeLiveFsSkuLayers(context);

  const [overlay, brandLogo, brandLogoPlaceholder, skuImage1, sku2Image, sku3Image] =
    await Promise.all([
      loadImage(SHOPEE_LIVE_FS_OVERLAY_URL),
      loadImage(context.brandLogoUrl),
      context.brandLogoUrl ? Promise.resolve(null) : loadImage(BRAND_LOGO_PLACEHOLDER_URL),
      loadImage(context.skuImageUrl),
      loadImage(context.sku2ImageUrl),
      loadImage(context.sku3ImageUrl),
    ]);

  // Overlay first — it's the full card chrome (frame, badges, buttons,
  // headers, and an opaque white fill standing in for each not-yet-uploaded
  // photo/logo), drawn before any photo so a transparent-background photo
  // drawn on top of it shows that white through its cut-out areas correctly.
  if (overlay) ctx.drawImage(overlay, 0, 0, format.width, format.height);

  // --- SKU 1 (hero) photo — this template has no SKU Background scene/color
  // option (unlike Mall BAU/Paying Seller), so it's just the photo, clipped
  // and drag/zoomable via the existing SKU accessors.
  const productBox = L.productImage1;
  ctx.save();
  roundRect(ctx, productBox.x, productBox.y, productBox.width, productBox.height, productBox.radius);
  ctx.clip();
  if (skuImage1) {
    const syntheticLayout = { product: productBox, productAlign: [0.5, 0.5] };
    const position = getSkuPosition(outputId, syntheticLayout, skuImage1, context);
    const zoom = getSkuZoom(outputId, context);
    drawCover(ctx, skuImage1, productBox.x, productBox.y, productBox.width, productBox.height, position.x, position.y, zoom);
  }
  ctx.restore();

  // --- SKU 2 / SKU 3 — plain cover-fit crops, each with their own drag/zoom.
  [layers.sku2, layers.sku3].forEach((layer) => {
    const image = layer.getImageUrl() ? (layer === layers.sku2 ? sku2Image : sku3Image) : null;
    if (!image) return;
    const { box } = layer;
    const position = layer.getPosition(outputId);
    const zoom = layer.getZoom(outputId);
    ctx.save();
    roundRect(ctx, box.x, box.y, box.width, box.height, box.radius);
    ctx.clip();
    drawCover(ctx, image, box.x, box.y, box.width, box.height, position.x, position.y, zoom);
    ctx.restore();
  });

  // --- Brand logo — always centered/cover-fit into its circle, no drag.
  const logoBox = L.brandLogo;
  ctx.save();
  ctx.beginPath();
  ctx.arc(logoBox.x + logoBox.width / 2, logoBox.y + logoBox.height / 2, Math.min(logoBox.width, logoBox.height) / 2, 0, Math.PI * 2);
  ctx.clip();
  drawCover(ctx, brandLogo || brandLogoPlaceholder, logoBox.x, logoBox.y, logoBox.width, logoBox.height);
  ctx.restore();

  // --- Text, all on top of everything else. Each carries its own fieldKey +
  // context so drawShopeeLiveFsText can skip it while it's the one currently
  // open in the inline editor (see isFieldBeingEdited/openFieldEditor).
  drawShopeeLiveFsText(ctx, context.liveTime, L.time, { color: L.time.color, align: "center", size: L.time.maxSize, fieldKey: "liveTime", context });
  drawShopeeLiveFsText(ctx, context.skuName1, L.productName, {
    color: L.productName.color,
    align: "left",
    autoFit: true,
    maxSize: L.productName.maxSize,
    minSize: L.productName.minSize,
    fieldKey: "skuName1",
    context,
  });
  drawShopeeLiveFsText(ctx, context.skuPriceBefore1, L.slicedPrice, {
    color: L.slicedPrice.color,
    align: "left",
    size: L.slicedPrice.size,
    strikethrough: true,
    fieldKey: "skuPriceBefore1",
    context,
  });
  drawShopeeLiveFsText(ctx, context.skuPriceAfter1, L.promoPrice, {
    color: L.promoPrice.color,
    align: "left",
    size: L.promoPrice.size,
    fieldKey: "skuPriceAfter1",
    context,
  });
  drawPctBadge(ctx, context.skuPct1, L.pct1, { color: L.pct1.color, size: L.pct1.size, pillRadius: L.pct1.pillRadius, pillFill: L.pct1.pillFill, pillBorder: L.pct1.pillBorder, fieldKey: "skuPct1", context });
  drawPctBadge(ctx, context.skuPct2, L.pct2, { color: L.pct2.color, size: L.pct2.size, pillRadius: L.pct2.pillRadius, pillFill: L.pct2.pillFill, pillBorder: L.pct2.pillBorder, fieldKey: "skuPct2", context });
  drawPctBadge(ctx, context.skuPct3, L.pct3, { color: L.pct3.color, size: L.pct3.size, pillRadius: L.pct3.pillRadius, pillFill: L.pct3.pillFill, pillBorder: L.pct3.pillBorder, fieldKey: "skuPct3", context });
  drawShopeeLiveFsText(ctx, context.brandNameRaw, L.brandName, {
    color: L.brandName.color,
    align: "left",
    fieldKey: "brandNameRaw",
    context,
    size: L.brandName.size,
  });
}

// Re-paints whatever should actually be showing behind a clear-then-redraw
// box (used to hide/swap the Shopee Mall tag and similar overlay elements)
// instead of a flat KV-color fill, which only looks right when the box sits
// entirely within the flat KV area. Several of these boxes (e.g. the tag on
// Category Banner / Top Module Banner / FB Post) actually sit over the
// product area, which can hold a background scene, an SKU photo, or neither
// — a flat kvColor fill there would leave a visibly wrong solid block
// instead of blending in. Clipping to `box` and replaying the same
// background/product drawing calls used earlier in drawOutput keeps this
// correct regardless of where the box falls.
function repaintBehindClearBox(ctx, box, outputId, format, layout, context, layers) {
  const { skuImage, backgroundImage, photoOverride, kvImage } = layers;
  ctx.save();
  ctx.beginPath();
  ctx.rect(box.x, box.y, box.width, box.height);
  ctx.clip();

  ctx.fillStyle = context.skuBackgroundColor || "#FFF3F6";
  ctx.fillRect(0, 0, format.width, format.height);
  drawKvArea(ctx, box, outputId, layout, context, kvImage);

  ctx.save();
  ctx.beginPath();
  ctx.rect(layout.product.x, layout.product.y, layout.product.width, layout.product.height);
  ctx.clip();
  if (photoOverride) {
    ctx.drawImage(
      photoOverride,
      layout.product.x,
      layout.product.y,
      layout.product.width,
      layout.product.height,
    );
  } else {
    if (backgroundImage) {
      const bgPosition = getSkuBackgroundPosition(outputId, layout, backgroundImage, context);
      const bgZoom = getSkuBackgroundZoom(outputId, context);
      drawCover(
        ctx,
        backgroundImage,
        layout.product.x,
        layout.product.y,
        layout.product.width,
        layout.product.height,
        bgPosition.x,
        bgPosition.y,
        bgZoom,
      );
    }
    if (skuImage) {
      const skuPosition = getSkuPosition(outputId, layout, skuImage, context);
      const skuZoom = getSkuZoom(outputId, context);
      drawCover(
        ctx,
        skuImage,
        layout.product.x,
        layout.product.y,
        layout.product.width,
        layout.product.height,
        skuPosition.x,
        skuPosition.y,
        skuZoom,
      );
    }
  }
  ctx.restore();
  ctx.restore();
}

async function drawOutput(outputId, canvas, options = {}) {
  const { scale = 1, photoOverride = null, context = state } = options;
  const format = outputMeta[outputId];
  const ctx = canvas.getContext("2d");
  canvas.width = Math.round(format.width * scale);
  canvas.height = Math.round(format.height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  await ensureFont();

  // Completely different layout model (see drawShopeeLiveFs) — bypasses the
  // rest of this function (KV/logo/KSP/background compositing) entirely.
  if (outputId === SHOPEE_LIVE_FS_OUTPUT_ID) {
    ctx.clearRect(0, 0, format.width, format.height);
    await drawShopeeLiveFs(ctx, format, context);
    return;
  }

  // "Inverse Logo" unchecked (default) = colored/branded Shopee icon + New
  // Arrival badge. Checked = their plain white counterparts instead. Both
  // always swap between one of these two — the overlay's own baked-in art
  // for these two elements doesn't match either variant on its own, so
  // there's no "leave it untouched" state here (unlike the Mall tag below).
  const shouldSwapShopeeIcon = EXTERNAL_SHOPEE_LOGO_OUTPUTS.has(outputId);
  const shopeeIconUrl = context.useOrangeShopeeLogo ? SHOPEE_LOGO_WHITE_URL : ORANGE_SHOPEE_LOGO_URL;
  // Applies on every format (not just IG Story / FB Post) since the New
  // Arrival badge shows up on all of them, unlike the Shopee icon swap.
  const shouldSwapNewArrivalBadge =
    context.template === "Mall BAU New Arrival" && Boolean(newArrivalLogoColorBoxes[outputId]);
  const newArrivalBadgeUrl = context.useOrangeShopeeLogo
    ? NEW_ARRIVAL_LOGO_WHITE_URL
    : NEW_ARRIVAL_LOGO_COLOR_URL;
  // The Shopee Mall tag mask/swap only applies to Mall BAU / Mall BAU New
  // Arrival — every Paying Seller template's tag is baked into a non-flat
  // campaign background image, so there's no safe flat-color clear for it there.
  const shopeeMallTagEligible =
    !isPayingSellerTemplate(context.template) && Boolean(shopeeMallTagBoxes[outputId]);
  const shouldHideShopeeMallTag = context.hideShopeeMallTag && shopeeMallTagEligible;
  // Unlike the icon/badge above, the tag's baked-in default (a solid red
  // pill, white text) IS the "off" look, so it only actively swaps when
  // Inverse Logo is checked — off leaves the overlay's own art untouched.
  const shouldUseInverseShopeeMallTag =
    !shouldHideShopeeMallTag &&
    context.useOrangeShopeeLogo &&
    shopeeMallTagEligible &&
    Boolean(SHOPEE_MALL_TAG_INVERSE_URLS[outputId]);
  const shouldLoadKvImage =
    templateUsesFlatKv(context.template) && context.kvMode === "image" && Boolean(context.kvImageUrl);
  const [
    brandLogo,
    skuImage,
    overlay,
    shopeeIcon,
    backgroundImage,
    newArrivalBadge,
    inverseShopeeMallTag,
    brandLogoPlaceholder,
    kvImage,
    popupMallTag,
  ] = await Promise.all([
    loadImage(context.brandLogoUrl),
    photoOverride ? Promise.resolve(null) : loadImage(context.skuImageUrl),
    loadImage(
      format.title === "Floating Icon"
        ? (context.floatingLogoRatio === "square"
          ? window.BrandMaxMallOverlays?.["floating-square"]
          : window.BrandMaxMallOverlays?.["floating-horizontal"])
        : getOverlaySrc(format, context),
    ),
    loadImage(shouldSwapShopeeIcon ? shopeeIconUrl : ""),
    photoOverride ? Promise.resolve(null) : loadImage(getSkuBackgroundSrc(context)),
    loadImage(shouldSwapNewArrivalBadge ? newArrivalBadgeUrl : ""),
    loadImage(shouldUseInverseShopeeMallTag ? SHOPEE_MALL_TAG_INVERSE_URLS[outputId] : ""),
    context.brandLogoUrl ? Promise.resolve(null) : loadImage(BRAND_LOGO_PLACEHOLDER_URL),
    shouldLoadKvImage ? loadImage(context.kvImageUrl) : Promise.resolve(null),
    loadImage(format.title === "Pop Up Banner" ? window.BrandMaxMallOverlays?.["popup-tag"] : ""),
  ]);

  ctx.clearRect(0, 0, format.width, format.height);
  if (format.title === "Floating Icon") {
    const layout = getLayout(format, context);
    const designBox = { x: 20, y: 30, width: 320, height: 320 };
    ctx.save();
    ctx.beginPath();
    // Exact inner area of the supplied circular red outline.
    ctx.arc(180, 190, 160, 0, Math.PI * 2);
    ctx.clip();
    // The selected background preset is below the SKU artwork. If none is
    // selected, retain the template's editable soft-pink fallback.
    ctx.fillStyle = context.skuBackgroundColor || "#FFF3F6";
    ctx.fillRect(designBox.x, designBox.y, designBox.width, designBox.height);
    if (backgroundImage) {
      const bgPosition = getSkuBackgroundPosition(outputId, layout, backgroundImage, context);
      drawCover(
        ctx,
        backgroundImage,
        designBox.x,
        designBox.y,
        designBox.width,
        designBox.height,
        bgPosition.x,
        bgPosition.y,
        getSkuBackgroundZoom(outputId, context),
      );
    }
    if (skuImage) {
      const skuPosition = getSkuPosition(outputId, layout, skuImage, context);
      drawCover(
        ctx,
        skuImage,
        designBox.x,
        designBox.y,
        designBox.width,
        designBox.height,
        skuPosition.x,
        skuPosition.y,
        getSkuZoom(outputId, context),
      );
    }
    ctx.restore();
    drawFloatingIconLogo(ctx, brandLogo, layout.logo, context, outputId);
    drawFloatingIconChrome(ctx, overlay);
    return;
  }
  const layout = drawBackground(ctx, format, outputId, context, kvImage);
  const isPopUpBanner = format.title === "Pop Up Banner";
  const isSkinnyBanner = format.title === "Skinny Banner";

  // These supplied overlays contain the fixed chrome. Restore the editable KV
  // shape afterwards, then redraw the original Mall tag above it.
  if (isPopUpBanner || isSkinnyBanner) {
    drawStretch(ctx, overlay, 0, 0, format.width, format.height);
    if (isSkinnyBanner) {
      // The editable left KV follows the supplied card's inner corner radius
      // without painting over the white outline or Mall tag.
      ctx.save();
      const { x, y, width, height } = layout.kv;
      const radius = 30;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width, y);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.clip();
      drawKvArea(ctx, layout.kv, outputId, layout, context, kvImage);
      ctx.restore();
    } else {
      ctx.save();
      roundRect(ctx, 36, 30, 508, 657, 30);
      ctx.clip();
      drawKvArea(ctx, layout.kv, outputId, layout, context, kvImage);
      ctx.restore();
    }
    if (popupMallTag && isPopUpBanner) drawRoundedOverlayImage(ctx, popupMallTag, 129, 10, 323, 52, 14);
    if (overlay && isSkinnyBanner) drawRoundedOverlayCrop(ctx, overlay, 392, 20, 416, 73, 16);
  }

  ctx.save();
  if (isPopUpBanner) {
    roundRect(ctx, 36, 30, 508, 657, 30);
    ctx.clip();
  }
  ctx.beginPath();
  if (isSkinnyBanner) {
    const { x, y, width, height } = layout.product;
    const radius = 30;
    ctx.moveTo(x, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
  } else {
    ctx.rect(layout.product.x, layout.product.y, layout.product.width, layout.product.height);
  }
  ctx.clip();
  if (isPopUpBanner && !photoOverride) {
    // Repaint the editable lower SKU area using the same soft-pink default
    // as the other standard formats.
    ctx.fillStyle = context.skuBackgroundColor || "#FFF3F6";
    ctx.fillRect(layout.product.x, layout.product.y, layout.product.width, layout.product.height);
  }
  if (photoOverride) {
    // Pre-rendered photo layer (possibly softened to shrink file size). Drawing it as a
    // single image here means it never gets re-encoded, so this pass stays lossless for
    // every non-photo pixel (overlay ribbon, logos, KSP text) that gets drawn afterwards.
    ctx.drawImage(
      photoOverride,
      layout.product.x,
      layout.product.y,
      layout.product.width,
      layout.product.height,
    );
  } else {
    if (backgroundImage) {
      // Drawn first so a transparent-background SKU photo shows it through;
      // an opaque SKU photo will simply cover it entirely.
      const bgPosition = getSkuBackgroundPosition(outputId, layout, backgroundImage, context);
      const bgZoom = getSkuBackgroundZoom(outputId, context);
      drawCover(
        ctx,
        backgroundImage,
        layout.product.x,
        layout.product.y,
        layout.product.width,
        layout.product.height,
        bgPosition.x,
        bgPosition.y,
        bgZoom,
      );
    }
    const skuPosition = getSkuPosition(outputId, layout, skuImage, context);
    const skuZoom = getSkuZoom(outputId, context);
    drawCover(
      ctx,
      skuImage,
      layout.product.x,
      layout.product.y,
      layout.product.width,
      layout.product.height,
      skuPosition.x,
      skuPosition.y,
      skuZoom,
    );
  }
  ctx.restore();

  if (isPopUpBanner && overlay) {
    // Keep the supplied CTA above the lower edge of the editable SKU area.
    drawRoundedOverlayCrop(ctx, overlay, 90, 644, 399, 66, 14);
  }
  if (isSkinnyBanner && overlay) {
    // SKU and its background remain below the mandatory Mall tag layer.
    drawRoundedOverlayCrop(ctx, overlay, 392, 20, 416, 73, 16);
  }

  // The overlay contains fixed elements from the working file, including the ribbon.
  if (!isPopUpBanner && !isSkinnyBanner) drawStretch(ctx, overlay, 0, 0, format.width, format.height);
  if (shouldSwapShopeeIcon && shopeeIcon) {
    const clearBox = externalShopeeLogoClearBoxes[outputId];
    const logoBox = externalShopeeLogoBoxes[outputId];
    drawKvArea(ctx, clearBox, outputId, layout, context, kvImage);
    // drawContain (not a stretch) keeps the asset's own aspect ratio intact,
    // fitting and centering it inside the box instead of distorting it.
    drawContain(ctx, shopeeIcon, logoBox.x, logoBox.y, logoBox.width, logoBox.height);
  }
  if (shouldSwapNewArrivalBadge && newArrivalBadge) {
    // Same clear-then-redraw technique as the Shopee icon swap above: the
    // baked-in "NEW ARRIVAL" badge doesn't match either variant on its own,
    // so we paint over it with whatever the KV area actually shows (flat
    // color or the uploaded KV image), then draw whichever variant applies
    // at the exact same spot — position/size never change, only the asset does.
    const naClearBox = newArrivalLogoColorClearBoxes[outputId];
    const naLogoBox = newArrivalLogoColorBoxes[outputId];
    drawKvArea(ctx, naClearBox, outputId, layout, context, kvImage);
    drawContain(
      ctx,
      newArrivalBadge,
      naLogoBox.x,
      naLogoBox.y,
      naLogoBox.width,
      naLogoBox.height,
    );
  }
  if (shouldHideShopeeMallTag) {
    const tagClearBox = shopeeMallTagClearBoxes[outputId];
    repaintBehindClearBox(ctx, tagClearBox, outputId, format, layout, context, {
      skuImage,
      backgroundImage,
      photoOverride,
      kvImage,
    });
  } else if (shouldUseInverseShopeeMallTag && inverseShopeeMallTag) {
    // Same clear-then-redraw idea as the logo swaps above, but the "clear"
    // repaints whatever should actually be behind the tag (KV color/image,
    // background scene, or SKU photo) rather than always assuming flat KV.
    const tagClearBox = shopeeMallTagClearBoxes[outputId];
    const tagBox = shopeeMallTagBoxes[outputId];
    repaintBehindClearBox(ctx, tagClearBox, outputId, format, layout, context, {
      skuImage,
      backgroundImage,
      photoOverride,
      kvImage,
    });
    drawContain(ctx, inverseShopeeMallTag, tagBox.x, tagBox.y, tagBox.width, tagBox.height);
  }

  drawBrandLogo(ctx, brandLogo, layout.logo, context, outputId, brandLogoPlaceholder);
  // Vertical-only drag offset — horizontal position is untouched, so the
  // text stays centered on the box's own horizontal center either way.
  const kspBox = { ...layout.ksp, y: layout.ksp.y + getKspOffsetY(outputId, context) };
  drawFittedText(ctx, getKspRenderText(outputId, context), kspBox, {
    color: context.kspColor,
    maxSize: layout.ksp.maxSize,
    minSize: KSP_AUTOFIT_MIN_SIZE,
    fixedSize: getKspFontSize(outputId, context),
  });
}

function canvasPointFromEvent(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
}

function pointInsideBox(point, box) {
  return (
    point.x >= box.x &&
    point.x <= box.x + box.width &&
    point.y >= box.y &&
    point.y <= box.y + box.height
  );
}

function layerAtCanvasPoint(outputId, layout, point, context = state) {
  const currentLayer = getActiveLayer(outputId, context);
  const kspBox = { ...layout.ksp, y: layout.ksp.y + getKspOffsetY(outputId, context) };

  if (pointInsideBox(point, kspBox) && getKspRenderText(outputId, context)?.trim()) return "ksp";
  if (pointInsideBox(point, layout.logo)) return "logo";
  if (hasKvImage(context) && pointInsideBox(point, layout.kv)) return "kv";
  if (pointInsideBox(point, layout.product)) {
    if (currentLayer === "background" && hasSkuBackground(context)) return "background";
    if (context.skuImageUrl) return "sku";
    if (hasSkuBackground(context)) return "background";
  }

  return null;
}

function updateLayerPositionFromDrag(outputId, layerKey, image, deltaX, deltaY, context = state) {
  const format = outputMeta[outputId];
  const layout = getLayout(format, context);
  const layer = getSkuLayers(context)[layerKey];
  const position = layer.getPosition(outputId, layout, image);

  // Pixel-for-pixel drag: the image moves exactly as far as the cursor,
  // with no clamping and no dependence on the image's size relative to
  // the box, so it can be repositioned freely at any zoom level.
  layer.setPosition(outputId, {
    x: position.x + deltaX,
    y: position.y + deltaY,
  });
}

function requestCanvasRedraw(outputId, canvas, context = state) {
  if (canvas.renderFrame) cancelAnimationFrame(canvas.renderFrame);
  canvas.renderFrame = requestAnimationFrame(() => {
    canvas.renderFrame = 0;
    drawOutput(outputId, canvas, { context });
  });
}

// Repaints every currently-visible preview canvas without touching the
// surrounding DOM — unlike renderPreviews(), which tears everything down and
// rebuilds it. Used while the KSP inline editor is open, so every other
// banner picks up a live wording change as you type without losing focus on
// the textarea overlay sitting on top of the canvas you're editing.
function redrawAllPreviewCanvases(context = editingContext()) {
  els.previewList.querySelectorAll("canvas.asset-canvas[data-output]").forEach((canvas) => {
    requestCanvasRedraw(canvas.dataset.output, canvas, context);
  });
}

// ---------------------------------------------------------------------------
// KSP inline editor: double-click a banner's own KSP text (only reachable
// while that card's Logo/KV/KSP/SKU/BG switch is set to KSP, same as its
// drag/font-size controls) to edit it directly on the canvas instead of a
// separate sidebar field. A plain textarea is positioned exactly over the
// rendered text box; typing updates the shared `ksp` text everywhere live,
// while pressing Enter to force a line break only affects the banner being
// edited — see commitKspTextChange for the split between the two.
// ---------------------------------------------------------------------------

// Removes the overlay DOM and closes its history session, but deliberately
// does NOT rebuild the preview list — used when double-clicking straight
// into another banner's KSP text, where openKspEditor is about to reuse the
// very canvas/shell a rebuild would just have thrown away.
function teardownKspEditor() {
  if (!kspEditState) return;
  const { outputId, context, textarea, counter, canvas } = kspEditState;
  // Cleared before removing the (currently focused) textarea — removing a
  // focused element fires its own "blur" synchronously, and that handler
  // re-enters this same function, so kspEditState must already read as
  // closed by the time that happens.
  kspEditState = null;
  textarea.remove();
  counter.remove();
  commitHistoryEnd(context);
  // Now that kspEditState no longer points at this output, the
  // isInlineEditingThis guard in drawOutput will let its own text draw
  // again — redraw it immediately so it doesn't stay blank until whatever
  // caller runs next happens to touch this canvas.
  requestCanvasRedraw(outputId, canvas, context);
}

function closeKspEditor() {
  if (!kspEditState) return;
  teardownKspEditor();
  // Rebuild cleanly now that editing has finished — picks up anything a
  // live canvas-only redraw doesn't (slider labels, the drag-cursor class,
  // bulk row list text), the same way closing Touch Up or finishing a
  // history-wrapped input does elsewhere.
  renderPreviews();
}

function openKspEditor(outputId, canvas, shell, context) {
  teardownKspEditor();

  const layout = getLayout(outputMeta[outputId], context);
  const kspBox = { ...layout.ksp, y: layout.ksp.y + getKspOffsetY(outputId, context) };
  const rect = canvas.getBoundingClientRect();
  const scaleX = rect.width / canvas.width;
  const scaleY = rect.height / canvas.height;
  const currentText = getKspRenderText(outputId, context);
  const getEditorDisplayText = (value) => {
    const { lines } = resolveFittedTextLayout(measureCtx, value, kspBox, {
      maxSize: layout.ksp.maxSize,
      minSize: KSP_AUTOFIT_MIN_SIZE,
      lineHeight: 1.04,
      fixedSize: getKspFontSize(outputId, context),
    });
    return (lines.length ? lines : [""]).join("\n");
  };
  const getEditorPlainOffset = (value, selectionIndex) =>
    value.slice(0, selectionIndex).replace(/\n/g, " ").length;
  const getEditorSelectionIndex = (value, plainOffset) => {
    let offset = 0;
    for (let index = 0; index < value.length; index += 1) {
      if (offset >= plainOffset) return index;
      offset += 1;
    }
    return value.length;
  };

  const textarea = document.createElement("textarea");
  textarea.className = "ksp-inline-editor";
  textarea.value = getEditorDisplayText(currentText);
  textarea.wrap = "off";
  textarea.spellcheck = false;
  textarea.setAttribute("aria-label", `${outputMeta[outputId].title} KSP text`);
  textarea.style.color = "transparent";
  textarea.style.caretColor = context.kspColor;
  textarea.style.webkitTextFillColor = "transparent";

  // The visible KSP text now remains canvas-rendered even while editing, so
  // it is pixel-identical to the final preview. The textarea sits over the
  // same designed KSP box only to collect input and show the caret/counter;
  // its own text is transparent so browser textarea wrapping can never
  // disagree with the canvas renderer.
  const applyOverlayLayout = () => {
    const { size, lines, lineHeight } = resolveFittedTextLayout(measureCtx, textarea.value, kspBox, {
      maxSize: layout.ksp.maxSize,
      minSize: KSP_AUTOFIT_MIN_SIZE,
      lineHeight: 1.04,
      fixedSize: getKspFontSize(outputId, context),
    });
    textarea.style.fontSize = `${size * scaleY}px`;
    textarea.style.lineHeight = `${size * lineHeight * scaleY}px`;

    const measuredLines = lines.length ? lines : [""];
    const contentHeight = measuredLines.length * size * lineHeight;
    const verticalPadding = Math.max(0, (kspBox.height - contentHeight) / 2);

    textarea.style.padding = `${verticalPadding * scaleY}px 0 0`;
    textarea.style.width = `${kspBox.width * scaleX}px`;
    textarea.style.height = `${kspBox.height * scaleY}px`;
    textarea.style.left = `${canvas.offsetLeft + kspBox.x * scaleX}px`;
    textarea.style.top = `${canvas.offsetTop + kspBox.y * scaleY}px`;
    textarea.scrollTop = 0;
  };
  applyOverlayLayout();

  const counter = document.createElement("span");
  counter.className = "ksp-inline-counter";
  const updateCounter = () => {
    const plainLength = normalizeKspPlainText(textarea.value).length;
    counter.textContent = `${plainLength}/${KSP_MAX_CHARACTERS}`;
  };
  updateCounter();
  // Anchored to the box's own top-right corner (not below it) so it stays
  // inside the canvas/shell bounds no matter where the box itself sits —
  // some formats have it close to the canvas edge.
  counter.style.left = `${canvas.offsetLeft + kspBox.x * scaleX + kspBox.width * scaleX}px`;
  counter.style.top = `${canvas.offsetTop + kspBox.y * scaleY}px`;
  counter.style.transform = "translate(-100%, -50%)";

  kspEditState = { outputId, context, textarea, counter, canvas };
  commitHistoryStart(context);
  // Repaint after the editor attaches so the active canvas keeps showing
  // the exact same renderer-backed text users will get in the final export.
  requestCanvasRedraw(outputId, canvas, context);

  textarea.addEventListener("input", () => {
    commitKspTextChange(outputId, textarea.value, context);
    applyOverlayLayout();
    updateCounter();
    redrawAllPreviewCanvases(context);
    if (activeRow) renderBulkRows();
  });

  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeKspEditor();
    }
    // Enter is left to the textarea's normal behavior (inserts a literal
    // "\n") — commitKspTextChange is what decides that's a per-output
    // manual break rather than shared wording.
  });

  textarea.addEventListener("blur", () => {
    // A blur triggered by clicking Undo/Redo (or anything else that already
    // closes/rebuilds this editor) would otherwise double-close it.
    if (kspEditState?.textarea === textarea) closeKspEditor();
  });

  shell.append(textarea, counter);
  textarea.focus();
  // Cursor at the end rather than select()-ing everything — a full
  // selection paints the browser's native highlight color behind every
  // word, which at this text's size reads like another rendering glitch.
  textarea.setSelectionRange(textarea.value.length, textarea.value.length);
  textarea.scrollTop = 0;
}

// Native `dblclick` isn't reliably synthesized from a double-tap on touch
// devices — iPadOS/iOS Safari in particular tends to treat a fast double-tap
// on a <canvas> as a zoom/no-op gesture rather than firing two clicks, so
// double-clicking straight into KSP or Shopee Live FS text never opened the
// editor there. This adds a manual double-tap detector (two touch pointerups,
// same finger, close together in time and position) that fires the exact
// same handler dblclick does, so both interactions reach the same place.
function bindDoubleActivate(canvas, handler) {
  const DOUBLE_TAP_MS = 350;
  const DOUBLE_TAP_RADIUS = 24; // px, in on-screen (not canvas-pixel) space
  let lastTap = null;

  canvas.addEventListener("dblclick", (event) => {
    // Touch-originated dblclick (where the browser did manage to synthesize
    // one) would otherwise double-fire alongside the manual detector below.
    if (event.pointerType === "touch") return;
    handler(event);
  });

  canvas.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "touch") return;
    const now = Date.now();
    const point = { x: event.clientX, y: event.clientY };
    if (
      lastTap &&
      now - lastTap.time <= DOUBLE_TAP_MS &&
      Math.hypot(point.x - lastTap.point.x, point.y - lastTap.point.y) <= DOUBLE_TAP_RADIUS
    ) {
      lastTap = null;
      handler(event);
    } else {
      lastTap = { time: now, point };
    }
  });
}

function bindKspInlineEditor(canvas, outputId, shell, context = state) {
  bindDoubleActivate(canvas, (event) => {
    const layout = getLayout(outputMeta[outputId], context);
    const kspBox = { ...layout.ksp, y: layout.ksp.y + getKspOffsetY(outputId, context) };
    const point = canvasPointFromEvent(canvas, event);
    if (!pointInsideBox(point, kspBox)) return;
    if (getActiveLayer(outputId, context) !== "ksp") setActiveLayer(outputId, "ksp", context);
    event.preventDefault();
    openKspEditor(outputId, canvas, shell, context);
  });
}

// ---------------------------------------------------------------------------
// Shopee Live FS inline text fields: every text element (Time, Product Name,
// Sliced/Promo Price, the three % badges, Brand Name) is edited by
// double-clicking it directly on the canvas, same double-click pattern as
// the KSP editor above — but simpler, since this template has exactly one
// output. There's no cross-output wording sync or per-output manual-break
// split to manage: what's typed here IS context[fieldKey], full stop, so one
// small generic editor covers all 8 fields instead of a bespoke one each.
// ---------------------------------------------------------------------------
const SHOPEE_LIVE_FS_TEXT_FIELDS = {
  liveTime: {
    box: SHOPEE_LIVE_FS_LAYOUT.time,
    align: "center",
    size: SHOPEE_LIVE_FS_LAYOUT.time.maxSize,
    color: SHOPEE_LIVE_FS_LAYOUT.time.color,
    ariaLabel: "Live time",
  },
  skuName1: {
    box: SHOPEE_LIVE_FS_LAYOUT.productName,
    align: "left",
    autoFit: true,
    maxSize: SHOPEE_LIVE_FS_LAYOUT.productName.maxSize,
    minSize: SHOPEE_LIVE_FS_LAYOUT.productName.minSize,
    color: SHOPEE_LIVE_FS_LAYOUT.productName.color,
    multiline: true,
    ariaLabel: "Product name",
  },
  skuPriceBefore1: {
    box: SHOPEE_LIVE_FS_LAYOUT.slicedPrice,
    align: "left",
    size: SHOPEE_LIVE_FS_LAYOUT.slicedPrice.size,
    color: SHOPEE_LIVE_FS_LAYOUT.slicedPrice.color,
    textDecoration: "line-through",
    ariaLabel: "Sliced price",
  },
  skuPriceAfter1: {
    box: SHOPEE_LIVE_FS_LAYOUT.promoPrice,
    align: "left",
    size: SHOPEE_LIVE_FS_LAYOUT.promoPrice.size,
    color: SHOPEE_LIVE_FS_LAYOUT.promoPrice.color,
    ariaLabel: "Promo price",
  },
  skuPct1: {
    box: SHOPEE_LIVE_FS_LAYOUT.pct1,
    align: "center",
    size: SHOPEE_LIVE_FS_LAYOUT.pct1.size,
    color: SHOPEE_LIVE_FS_LAYOUT.pct1.color,
    ariaLabel: "SKU 1 discount percentage",
  },
  skuPct2: {
    box: SHOPEE_LIVE_FS_LAYOUT.pct2,
    align: "center",
    size: SHOPEE_LIVE_FS_LAYOUT.pct2.size,
    color: SHOPEE_LIVE_FS_LAYOUT.pct2.color,
    ariaLabel: "SKU 2 discount percentage",
  },
  skuPct3: {
    box: SHOPEE_LIVE_FS_LAYOUT.pct3,
    align: "center",
    size: SHOPEE_LIVE_FS_LAYOUT.pct3.size,
    color: SHOPEE_LIVE_FS_LAYOUT.pct3.color,
    ariaLabel: "SKU 3 discount percentage",
  },
  brandNameRaw: {
    box: SHOPEE_LIVE_FS_LAYOUT.brandName,
    align: "left",
    size: SHOPEE_LIVE_FS_LAYOUT.brandName.size,
    color: SHOPEE_LIVE_FS_LAYOUT.brandName.color,
    ariaLabel: "Brand name",
  },
};

// Mirrors kspEditState — only one field editor (across any output/context)
// can be open at a time. See openFieldEditor/isFieldBeingEdited.
let fieldEditState = null;

function isFieldBeingEdited(fieldKey, context) {
  return Boolean(
    fieldEditState && fieldEditState.fieldKey === fieldKey && fieldEditState.context === context
  );
}

function teardownFieldEditor() {
  if (!fieldEditState) return;
  const { fieldKey, context, textarea, canvas } = fieldEditState;
  // Cleared before removing the (currently focused) textarea for the same
  // reason as teardownKspEditor: removing a focused element fires a
  // synchronous "blur" that re-enters this function.
  fieldEditState = null;
  textarea.remove();
  commitHistoryEnd(context);
  requestCanvasRedraw(SHOPEE_LIVE_FS_OUTPUT_ID, canvas, context);
}

function closeFieldEditor() {
  if (!fieldEditState) return;
  teardownFieldEditor();
  renderPreviews();
}

function openFieldEditor(fieldKey, canvas, shell, context) {
  // Defensive: this template never uses KSP, but a stale kspEditState could
  // theoretically be left over from a different context/template.
  teardownKspEditor();
  // Cheap teardown (no full rebuild) when hopping straight from one field
  // to another, same as openKspEditor reusing the same canvas.
  teardownFieldEditor();

  const field = SHOPEE_LIVE_FS_TEXT_FIELDS[fieldKey];
  const box = field.box;
  const rect = canvas.getBoundingClientRect();
  const scaleX = rect.width / canvas.width;
  const scaleY = rect.height / canvas.height;

  const textarea = document.createElement("textarea");
  textarea.className = "ksp-inline-editor shopee-live-fs-inline-editor";
  textarea.value = context[fieldKey] || "";
  textarea.spellcheck = false;
  textarea.setAttribute("aria-label", field.ariaLabel);
  textarea.style.color = field.color;
  textarea.style.textAlign = field.align === "center" ? "center" : "left";
  textarea.style.lineHeight = "1.15";
  textarea.style.textDecoration = field.textDecoration || "none";
  if (!field.multiline) {
    // Single-line fields (everything but Product Name) scroll horizontally
    // rather than wrap — matches how they're actually drawn (fixed size, no
    // auto-fit), and Enter closes the editor instead of inserting "\n".
    textarea.style.whiteSpace = "pre";
    textarea.style.overflowX = "auto";
    textarea.style.overflowY = "hidden";
  }

  // Same "hug the real rendered footprint" approach as the KSP editor's
  // applyOverlayLayout: sized and positioned to the text's own measured
  // width/height at its current size — not field.box's full allowed area —
  // recomputed on every keystroke so it stays visually identical to the real
  // render underneath it instead of a padded placeholder rectangle.
  const applyOverlayLayout = () => {
    const { fontSize, lines } = resolveShopeeLiveFsTextLayout(measureCtx, textarea.value || " ", box, {
      autoFit: field.autoFit,
      maxSize: field.maxSize,
      minSize: field.minSize,
      size: field.size,
    });
    textarea.style.fontSize = `${fontSize * scaleY}px`;
    textarea.style.paddingTop = "0px";

    // measureCtx.font is already set to this exact size/weight/family by
    // resolveShopeeLiveFsTextLayout above, so measuring here matches the
    // real draw pixel-for-pixel.
    const measuredLines = lines && lines.length ? lines : [textarea.value || " "];
    const lineHeightPx = fontSize * 1.15;
    const contentWidth = field.multiline
      ? Math.max(...measuredLines.map((line) => measureCtx.measureText(line || " ").width), fontSize * 0.6)
      : Math.max(measureCtx.measureText(textarea.value || " ").width, fontSize * 0.6);
    const contentHeight = (field.autoFit ? measuredLines.length : 1) * lineHeightPx;
    const paddingX = fontSize * 0.22;
    const paddingY = fontSize * 0.12;
    const boxWidthCanvas = Math.min(box.width, Math.max(contentWidth + paddingX * 2, fontSize));
    const boxHeightCanvas = Math.min(box.height, contentHeight + paddingY * 2);
    const centerY = box.y + box.height / 2;
    const anchorX = field.align === "center" ? box.x + box.width / 2 : box.x;
    const leftCanvas = field.align === "center" ? anchorX - boxWidthCanvas / 2 : anchorX;

    textarea.style.width = `${boxWidthCanvas * scaleX}px`;
    textarea.style.height = `${boxHeightCanvas * scaleY}px`;
    textarea.style.left = `${canvas.offsetLeft + leftCanvas * scaleX}px`;
    textarea.style.top = `${canvas.offsetTop + (centerY - boxHeightCanvas / 2) * scaleY}px`;
  };
  applyOverlayLayout();

  fieldEditState = { fieldKey, context, textarea, canvas };
  commitHistoryStart(context);
  // Blanks out this field immediately (see isFieldBeingEdited in
  // drawShopeeLiveFsText) so the last rendered frame doesn't show through
  // underneath the overlay until the first keystroke.
  requestCanvasRedraw(SHOPEE_LIVE_FS_OUTPUT_ID, canvas, context);

  textarea.addEventListener("input", () => {
    // Single-line fields can't contain a literal newline — Arial's fixed
    // size for them isn't wrapped/auto-fit, so a stray "\n" (e.g. pasted
    // in) would just silently vanish into an unrendered second line.
    if (!field.multiline && textarea.value.includes("\n")) {
      const withoutBreaks = textarea.value.replace(/\n/g, "");
      textarea.value = withoutBreaks;
    }
    context[fieldKey] = textarea.value;
    applyOverlayLayout();
    requestCanvasRedraw(SHOPEE_LIVE_FS_OUTPUT_ID, canvas, context);
    if (activeRow) renderBulkRows();
  });

  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeFieldEditor();
    } else if (event.key === "Enter" && !field.multiline) {
      event.preventDefault();
      closeFieldEditor();
    }
    // Product Name (multiline) leaves Enter to the textarea's normal
    // behavior — a literal "\n" that autoFit's own wrapText call already
    // treats as a forced paragraph break (see wrapText).
  });

  textarea.addEventListener("blur", () => {
    if (fieldEditState?.textarea === textarea) closeFieldEditor();
  });

  shell.append(textarea);
  textarea.focus();
  textarea.setSelectionRange(textarea.value.length, textarea.value.length);
}

function bindShopeeLiveFsFieldEditors(canvas, shell, context = state) {
  bindDoubleActivate(canvas, (event) => {
    const point = canvasPointFromEvent(canvas, event);
    const fieldKey = Object.keys(SHOPEE_LIVE_FS_TEXT_FIELDS).find((key) =>
      pointInsideBox(point, SHOPEE_LIVE_FS_TEXT_FIELDS[key].box)
    );
    if (!fieldKey) return;
    event.preventDefault();
    openFieldEditor(fieldKey, canvas, shell, context);
  });
}

// ---------------------------------------------------------------------------
// Shopee Live FS drag/zoom: unlike Mall BAU's layer switch (which exists
// because its SKU/Background/KV/Logo boxes literally overlap the same area
// of the canvas), this template's three SKU photo boxes never overlap each
// other on screen and there's no Background scene/color option here — so
// which one a drag targets is decided purely by where the pointer went
// down, no explicit "active layer" picker needed at all.
// ---------------------------------------------------------------------------
let shopeeLiveFsDrag = null;

function endShopeeLiveFsDrag(event) {
  if (!shopeeLiveFsDrag || (event?.pointerId && event.pointerId !== shopeeLiveFsDrag.pointerId)) return;
  const rerender = shopeeLiveFsDrag.onRerender;
  shopeeLiveFsDrag.canvas.classList.remove("is-dragging");
  commitHistoryEnd(shopeeLiveFsDrag.context);
  shopeeLiveFsDrag = null;
  setStatus("Ready");
  if (typeof rerender === "function") rerender();
}

function bindShopeeLiveFsDrag(canvas, context = state, onLayerSelected = null) {
  const outputId = SHOPEE_LIVE_FS_OUTPUT_ID;
  const L = SHOPEE_LIVE_FS_LAYOUT;
  // Stands in for the "layout" object the generic getSkuPosition helper
  // expects — same shape drawShopeeLiveFs itself builds for the exact same
  // reason (see its own comments).
  const syntheticLayout = { product: L.productImage1, productAlign: [0.5, 0.5] };

  canvas.addEventListener("pointerdown", async (event) => {
    if (event.button !== 0) return;
    const point = canvasPointFromEvent(canvas, event);

    let layerKey = null;
    if (pointInsideBox(point, L.productImage1)) {
      layerKey = "sku";
    } else if (pointInsideBox(point, L.sku2Image)) {
      layerKey = "sku2";
    } else if (pointInsideBox(point, L.sku3Image)) {
      layerKey = "sku3";
    }
    if (!layerKey) return;
    const currentLayer = getActiveLayer(outputId, context);
    const didSelectLayer = layerKey !== currentLayer;
    if (didSelectLayer) setActiveLayer(outputId, layerKey, context);

    const imageUrl = layerKey === "sku" ? context.skuImageUrl : getShopeeLiveFsSkuLayers(context)[layerKey].getImageUrl();
    const image = await loadImage(imageUrl);
    if (!image) {
      if (didSelectLayer && typeof onLayerSelected === "function") onLayerSelected();
      return;
    }

    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("is-dragging");
    commitHistoryStart(context);
    shopeeLiveFsDrag = {
      canvas,
      layerKey,
      context,
      pointerId: event.pointerId,
      image,
      lastPoint: point,
      onRerender: didSelectLayer ? onLayerSelected : null,
    };
    setStatus("Positioning");
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!shopeeLiveFsDrag || shopeeLiveFsDrag.canvas !== canvas || shopeeLiveFsDrag.pointerId !== event.pointerId) return;
    event.preventDefault();
    const point = canvasPointFromEvent(canvas, event);
    const deltaX = point.x - shopeeLiveFsDrag.lastPoint.x;
    const deltaY = point.y - shopeeLiveFsDrag.lastPoint.y;
    shopeeLiveFsDrag.lastPoint = point;

    const { layerKey, image } = shopeeLiveFsDrag;
    if (layerKey === "sku") {
      const position = getSkuPosition(outputId, syntheticLayout, image, context);
      setSkuPosition(outputId, { x: position.x + deltaX, y: position.y + deltaY }, context);
    } else {
      const layer = getShopeeLiveFsSkuLayers(context)[layerKey];
      const position = layer.getPosition(outputId);
      layer.setPosition(outputId, { x: position.x + deltaX, y: position.y + deltaY });
    }
    requestCanvasRedraw(outputId, canvas, context);
  });

  canvas.addEventListener("pointerup", endShopeeLiveFsDrag);
  canvas.addEventListener("pointercancel", endShopeeLiveFsDrag);
  canvas.addEventListener("lostpointercapture", endShopeeLiveFsDrag);
}

function endSkuDrag(event) {
  if (!skuDrag || (event?.pointerId && event.pointerId !== skuDrag.pointerId)) return;
  const rerender = skuDrag.onRerender;
  skuDrag.canvas.classList.remove("is-dragging");
  commitHistoryEnd(skuDrag.context);
  skuDrag = null;
  setStatus("Ready");
  if (typeof rerender === "function") rerender();
}

function bindSkuDrag(canvas, outputId, context = state, onLayerSelected = null) {
  canvas.addEventListener("pointerdown", async (event) => {
    if (event.button !== 0) return;

    const layout = getLayout(outputMeta[outputId], context);
    const point = canvasPointFromEvent(canvas, event);
    const currentLayerKey = getActiveLayer(outputId, context);
    const clickedLayerKey = layerAtCanvasPoint(outputId, layout, point, context);
    const layerKey = clickedLayerKey || currentLayerKey;
    const didSelectLayer = clickedLayerKey && clickedLayerKey !== currentLayerKey;
    if (didSelectLayer) setActiveLayer(outputId, clickedLayerKey, context);

    if (layerKey === "logo") {
      event.preventDefault();
      if (didSelectLayer && typeof onLayerSelected === "function") onLayerSelected();
      return;
    }

    // KSP has no image to load — it's a vertical-only text-box drag, hit
    // tested against its own box (which usually sits outside the product
    // rect), not the product area sku/background dragging uses. The box is
    // shifted by any existing drag offset first, so the hit test matches
    // where the text is actually rendered, not its un-dragged design position.
    if (layerKey === "ksp") {
      const kspHitBox = { ...layout.ksp, y: layout.ksp.y + getKspOffsetY(outputId, context) };
      if (!pointInsideBox(point, kspHitBox)) return;
      event.preventDefault();
      canvas.setPointerCapture(event.pointerId);
      canvas.classList.add("is-dragging");
      commitHistoryStart(context);
      skuDrag = {
        canvas,
        outputId,
        layerKey,
        context,
        pointerId: event.pointerId,
        image: null,
        lastPoint: point,
        onRerender: didSelectLayer ? onLayerSelected : null,
      };
      setStatus("Positioning");
      return;
    }

    // KV drags within the KV area (top/side band); SKU and Background both
    // drag within the product area — the two rects are different regions of
    // the canvas.
    const hitBox = layerKey === "kv" ? layout.kv : layout.product;
    if (!pointInsideBox(point, hitBox)) return;
    // Logo has no drag/reposition — only its zoom slider — so clicking the
    // product/KV area while it's the active layer does nothing.
    if (layerKey !== "sku" && layerKey !== "background" && layerKey !== "kv") return;
    const image = await loadImage(getSkuLayers(context)[layerKey].getImageUrl());
    if (!image) {
      if (didSelectLayer && typeof onLayerSelected === "function") onLayerSelected();
      return;
    }

    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add("is-dragging");
    commitHistoryStart(context);
    skuDrag = {
      canvas,
      outputId,
      layerKey,
      context,
      pointerId: event.pointerId,
      image,
      lastPoint: point,
      onRerender: didSelectLayer ? onLayerSelected : null,
    };
    setStatus("Positioning");
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!skuDrag || skuDrag.canvas !== canvas || skuDrag.pointerId !== event.pointerId) return;

    event.preventDefault();
    const point = canvasPointFromEvent(canvas, event);
    const deltaX = point.x - skuDrag.lastPoint.x;
    const deltaY = point.y - skuDrag.lastPoint.y;
    skuDrag.lastPoint = point;

    if (skuDrag.layerKey === "ksp") {
      setKspOffsetY(outputId, getKspOffsetY(outputId, skuDrag.context) + deltaY, skuDrag.context);
    } else {
      updateLayerPositionFromDrag(outputId, skuDrag.layerKey, skuDrag.image, deltaX, deltaY, skuDrag.context);
    }
    requestCanvasRedraw(outputId, canvas, skuDrag.context);
  });

  canvas.addEventListener("pointerup", endSkuDrag);
  canvas.addEventListener("pointercancel", endSkuDrag);
  canvas.addEventListener("lostpointercapture", endSkuDrag);
}

// Shopee Live FS's own preview card — deliberately not a branch inside
// createPreviewBlock below: that function's layer switch/zoom control are
// built entirely around getLayout()'s Mall-BAU-shaped box model (kv/product/
// logo/ksp), which this template never produces (see getLayout — there's no
// "Shopee Live Flash Sale" case in it at all). Still the same card shell
// (title, meta, layer switch, zoom slider, Download button, canvas) so it
// slots into the same preview list/bulk-row flow unchanged.
function createShopeeLiveFsPreviewBlock(context = state, onRerender = renderPreviews) {
  const outputId = SHOPEE_LIVE_FS_OUTPUT_ID;
  const format = outputMeta[outputId];
  const block = document.createElement("section");
  block.className = "preview-block";
  let canvas;

  const heading = document.createElement("div");
  heading.className = "preview-heading";

  const titleWrap = document.createElement("div");
  const title = document.createElement("h2");
  title.className = "preview-title";
  title.textContent = format.title;

  const meta = document.createElement("p");
  meta.className = "preview-meta";
  meta.textContent = `${format.width} x ${format.height}px`;
  titleWrap.append(title, meta);

  const actions = document.createElement("div");
  actions.className = "preview-actions";

  const activeLayerKey = getActiveLayer(outputId, context);
  // Falls back to "sku" (SKU 1) whenever the stored layer isn't one this
  // template actually has (e.g. it was last "ksp"/"kv"/"logo"/"background"
  // from a different template on the very same bulk row/context).
  const resolvedLayerKey = ["sku", "sku2", "sku3"].includes(activeLayerKey)
    ? activeLayerKey
    : "sku";

  const layerSwitch = document.createElement("div");
  layerSwitch.className = "layer-switch";
  layerSwitch.setAttribute("role", "group");
  layerSwitch.setAttribute("aria-label", `${format.title} edit target`);

  const layerOptions = [
    { key: "sku", label: "SKU 1" },
    { key: "sku2", label: "SKU 2" },
    { key: "sku3", label: "SKU 3" },
  ];

  layerOptions.forEach(({ key, label }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "layer-switch-btn";
    button.dataset.layer = key;
    button.textContent = label;
    const isActive = key === resolvedLayerKey;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    layerSwitch.append(button);
  });

  layerSwitch.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-layer]");
    if (!button || button.classList.contains("is-active")) return;
    setActiveLayer(outputId, button.dataset.layer, context);
    onRerender();
  });

  actions.append(layerSwitch);

  const fsLayers = getShopeeLiveFsSkuLayers(context);
  const zoomControl = document.createElement("label");
  zoomControl.className = "zoom-control";
  const zoomLabel = document.createElement("span");
  const zoomInput = document.createElement("input");
  zoomInput.type = "range";
  const zoomValue = document.createElement("span");
  zoomValue.className = "zoom-value";

  const layerNoun = resolvedLayerKey === "sku" ? "SKU 1"
    : resolvedLayerKey === "sku2" ? "SKU 2"
    : "SKU 3";
  const currentZoom = resolvedLayerKey === "sku"
    ? getSkuZoom(outputId, context)
    : fsLayers[resolvedLayerKey].getZoom(outputId);

  zoomLabel.textContent = `${layerNoun} Zoom`;
  zoomInput.min = String(SKU_ZOOM_MIN * 100);
  zoomInput.max = String(SKU_ZOOM_MAX * 100);
  zoomInput.step = "5";
  zoomInput.value = String(Math.round(currentZoom * 100));
  zoomInput.setAttribute("aria-label", `${format.title} ${layerNoun.toLowerCase()} zoom`);
  zoomValue.textContent = `${zoomInput.value}%`;
  zoomInput.addEventListener("pointerdown", () => commitHistoryStart(context));
  zoomInput.addEventListener("input", () => {
    const zoom = Number(zoomInput.value) / 100;
    if (resolvedLayerKey === "sku") setSkuZoom(outputId, zoom, context);
    else fsLayers[resolvedLayerKey].setZoom(outputId, zoom);
    zoomValue.textContent = `${zoomInput.value}%`;
    if (canvas) requestCanvasRedraw(outputId, canvas, context);
  });
  zoomInput.addEventListener("change", () => commitHistoryEnd(context));

  zoomControl.append(zoomLabel, zoomInput, zoomValue);

  const download = document.createElement("button");
  download.type = "button";
  download.className = "download-button";
  download.textContent = "Download";
  download.addEventListener("click", () => downloadCanvas(outputId, context));
  const preview = document.createElement("button");
  preview.type = "button";
  preview.className = "preview-button";
  preview.textContent = "Preview";
  preview.addEventListener("click", () => window.BrandMaxHomepagePreview?.preview(outputId));
  actions.append(zoomControl);

  heading.append(titleWrap, actions);

  const shell = document.createElement("div");
  shell.className = "canvas-shell";
  if (isFloatingIcon) shell.classList.add("floating-icon-shell");
  canvas = document.createElement("canvas");
  canvas.className = "asset-canvas";
  const activeLayerHasImage = resolvedLayerKey === "sku"
    ? Boolean(context.skuImageUrl)
    : Boolean(fsLayers[resolvedLayerKey].getImageUrl());
  if (activeLayerHasImage) canvas.classList.add("can-drag");
  canvas.dataset.output = outputId;
  canvas.setAttribute("aria-label", `${format.title} preview`);
  bindShopeeLiveFsDrag(canvas, context, onRerender);
  bindShopeeLiveFsFieldEditors(canvas, shell, context);
  shell.append(canvas);

  const footer = document.createElement("div");
  footer.className = "preview-footer";
  footer.append(preview, download);
  block.append(heading, shell, footer);
  return { block, canvas };
}

function createPreviewBlock(outputId, context = state, onRerender = renderPreviews) {
  const format = outputMeta[outputId];
  const layout = getLayout(format, context);
  const block = document.createElement("section");
  block.className = "preview-block";
  let canvas;

  const heading = document.createElement("div");
  heading.className = "preview-heading";

  const titleWrap = document.createElement("div");
  const title = document.createElement("h2");
  title.className = "preview-title";
  title.textContent = format.title;

  const meta = document.createElement("p");
  meta.className = "preview-meta";
  meta.textContent = `${format.width} x ${format.height}px`;
  titleWrap.append(title, meta);

  const actions = document.createElement("div");
  actions.className = "preview-actions";

  const activeLayerKey = getActiveLayer(outputId, context);
  const isFloatingIcon = format.title === "Floating Icon";
  const isBackgroundActive = activeLayerKey === "background";
  const isLogoActive = activeLayerKey === "logo";
  const isKspActive = activeLayerKey === "ksp";
  const isKvActive = activeLayerKey === "kv";
  const isDraggableLayer = activeLayerKey === "sku" || isBackgroundActive || isKspActive || isKvActive;
  // Logo/SKU/BG/KV all have a getZoom/setZoom pair via getSkuLayers(); KSP is
  // handled as its own special case below (its "zoom" is really a font
  // size, with different units/range), so it deliberately has no entry there.
  const activeLayer = isKspActive ? null : getSkuLayers(context)[activeLayerKey];

  // Always shown now — Logo and KSP always exist, so their own zoom/size
  // controls should always be reachable, not just when a background scene
  // is selected (which now only adds the extra BG option).
  const layerSwitch = document.createElement("div");
  layerSwitch.className = "layer-switch";
  layerSwitch.setAttribute("role", "group");
  layerSwitch.setAttribute("aria-label", `${format.title} edit target`);

  const layerOptions = [{ key: "logo", label: "Logo" }];
  // KV sits right after Logo, and only shows up once there's an uploaded KV
  // image to actually drag/zoom (Mall BAU / Mall BAU New Arrival only).
  if (!isFloatingIcon && hasKvImage(context)) layerOptions.push({ key: "kv", label: "KV" });
  if (!isFloatingIcon) layerOptions.push({ key: "ksp", label: "KSP" });
  layerOptions.push({ key: "sku", label: "SKU" });
  // Floating Icon's selected preset is an editable image layer too.
  if (hasSkuBackground(context)) layerOptions.push({ key: "background", label: "BG" });

  layerOptions.forEach(({ key, label }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "layer-switch-btn";
    button.dataset.layer = key;
    button.textContent = label;
    const isActive = key === activeLayerKey;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    layerSwitch.append(button);
  });

  layerSwitch.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-layer]");
    if (!button || button.classList.contains("is-active")) return;
    setActiveLayer(outputId, button.dataset.layer, context);
    onRerender();
  });

  if (isFloatingIcon) {
    const ratioControl = document.createElement("label");
    ratioControl.className = "zoom-control floating-preview-ratio";
    const ratioLabel = document.createElement("span");
    ratioLabel.textContent = "Logo ratio";
    const ratioSelect = document.createElement("select");
    ratioSelect.innerHTML = '<option value="horizontal">Horizontal</option><option value="square">1:1</option>';
    ratioSelect.value = context.floatingLogoRatio || "horizontal";
    ratioSelect.setAttribute("aria-label", "Floating Icon logo ratio");
    ratioSelect.addEventListener("change", () => {
      commitHistoryStart(context);
      context.floatingLogoRatio = ratioSelect.value;
      commitHistoryEnd(context);
      onRerender();
    });
    ratioControl.append(ratioLabel, ratioSelect);
    actions.append(ratioControl);
  }

  actions.append(layerSwitch);

  const zoomControl = document.createElement("label");
  zoomControl.className = "zoom-control";
  const zoomLabel = document.createElement("span");
  const zoomInput = document.createElement("input");
  zoomInput.type = "range";
  const zoomValue = document.createElement("span");
  zoomValue.className = "zoom-value";

  if (isKspActive) {
    const kspBox = layout.ksp;
    const savedSize = getKspFontSize(outputId, context);
    // No manual size set yet — start the slider at whatever auto-fit would
    // currently render, so grabbing it for the first time doesn't jump the
    // text to a different size than what's already on screen.
    const currentSize =
      savedSize ??
      computeFittedTextSize(
        measureCtx,
        getKspRenderText(outputId, context),
        kspBox.width,
        kspBox.height,
        kspBox.maxSize,
        KSP_AUTOFIT_MIN_SIZE,
        1.04,
      ).size;

    zoomLabel.textContent = "KSP Font Size";
    zoomInput.min = String(Math.round(kspBox.minSize));
    zoomInput.max = String(Math.round(kspBox.maxSize));
    zoomInput.step = "1";
    zoomInput.value = String(Math.round(currentSize));
    zoomInput.setAttribute("aria-label", `${format.title} KSP font size`);
    zoomValue.textContent = `${zoomInput.value}px`;
    zoomInput.addEventListener("pointerdown", () => commitHistoryStart(context));
    zoomInput.addEventListener("input", () => {
      setKspFontSize(outputId, Number(zoomInput.value), layout, context);
      zoomValue.textContent = `${zoomInput.value}px`;
      if (canvas) requestCanvasRedraw(outputId, canvas, context);
    });
    zoomInput.addEventListener("change", () => commitHistoryEnd(context));
  } else {
    const zoomMin = isLogoActive ? LOGO_ZOOM_MIN : SKU_ZOOM_MIN;
    const zoomMax = isLogoActive ? LOGO_ZOOM_MAX : SKU_ZOOM_MAX;
    const layerNoun = isLogoActive ? "Logo" : isBackgroundActive ? "Background" : isKvActive ? "KV" : "SKU";

    zoomLabel.textContent = `${layerNoun} Zoom`;
    zoomInput.min = String(zoomMin * 100);
    zoomInput.max = String(zoomMax * 100);
    zoomInput.step = "5";
    zoomInput.value = String(Math.round(activeLayer.getZoom(outputId) * 100));
    zoomInput.setAttribute("aria-label", `${format.title} ${layerNoun.toLowerCase()} zoom`);
    zoomValue.textContent = `${zoomInput.value}%`;
    zoomInput.addEventListener("pointerdown", () => commitHistoryStart(context));
    zoomInput.addEventListener("input", () => {
      activeLayer.setZoom(outputId, Number(zoomInput.value) / 100);
      zoomValue.textContent = `${zoomInput.value}%`;
      if (canvas) requestCanvasRedraw(outputId, canvas, context);
    });
    zoomInput.addEventListener("change", () => commitHistoryEnd(context));
  }

  zoomControl.append(zoomLabel, zoomInput, zoomValue);

  const download = document.createElement("button");
  download.type = "button";
  download.className = "download-button";
  download.textContent = "Download";
  download.addEventListener("click", () => downloadCanvas(outputId, context));
  actions.append(zoomControl);

  heading.append(titleWrap, actions);

  const shell = document.createElement("div");
  shell.className = "canvas-shell";
  canvas = document.createElement("canvas");
  canvas.className = "asset-canvas";
  if (isFloatingIcon) {
    // Standard uses the identical native preview size as Blank.
    canvas.style.width = "360px";
    canvas.style.height = "360px";
    canvas.style.maxWidth = "100%";
  }
  // SKU/BG/KV drag an image; KSP drags its own text box (vertical-only);
  // Logo has no drag at all — just its zoom slider.
  const activeLayerHasImage = isDraggableLayer
    ? isBackgroundActive
      ? hasSkuBackground(context)
      : isKvActive
        ? hasKvImage(context)
        : isKspActive
          ? Boolean(getKspRenderText(outputId, context)?.trim())
          : Boolean(context.skuImageUrl)
    : false;
  if (activeLayerHasImage) canvas.classList.add("can-drag");
  canvas.dataset.output = outputId;
  canvas.setAttribute("aria-label", `${format.title} preview`);
  bindSkuDrag(canvas, outputId, context, onRerender);
  bindKspInlineEditor(canvas, outputId, shell, context);
  shell.append(canvas);

  const footer = document.createElement("div");
  footer.className = "preview-footer";
  const preview = document.createElement("button");
  preview.type = "button";
  preview.className = "preview-button";
  preview.textContent = "Preview";
  preview.addEventListener("click", () => window.BrandMaxHomepagePreview?.preview(outputId));
  footer.append(preview, download);
  block.append(heading, shell, footer);
  return { block, canvas };
}

async function renderPreviews() {
  const currentVersion = ++renderVersion;
  els.previewList.innerHTML = "";
  const context = editingContext();
  syncFloatingIconControls(context);
  document.documentElement.style.setProperty("--kv", context.kvColor);
  els.templateLabel.textContent = context.template;
  const selected = editingOutputs();

  if (!selected.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = activeRow
      ? "Select at least one output above to preview this row."
      : "Select at least one output to preview.";
    els.previewList.append(empty);
    return;
  }

  setStatus("Rendering");
  const jobs = selected.map((outputId) => {
    const { block, canvas } = isShopeeLiveFsTemplate(context.template)
      ? createShopeeLiveFsPreviewBlock(context, renderPreviews)
      : createPreviewBlock(outputId, context, renderPreviews);
    els.previewList.append(block);
    return drawOutput(outputId, canvas, { context });
  });

  await Promise.allSettled(jobs);
  if (currentVersion === renderVersion) {
    setStatus("Ready");
    window.BrandMaxHomepagePreview?.refresh();
  }
}

function drawColorCanvas() {
  const canvas = els.colorCanvas;
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  const canvasWidth = Math.max(1, Math.round(rect.width * ratio));
  const canvasHeight = Math.max(1, Math.round(rect.height * ratio));

  if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
  }

  const { width, height } = canvas;
  const context = editingContext();
  const hueColor = rgbToHex(hsvToRgb(context.hue, 1, 1));
  const markerRadius = 7 * ratio;
  const markerOuterRadius = 8.5 * ratio;

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = hueColor;
  ctx.fillRect(0, 0, width, height);

  const whiteGradient = ctx.createLinearGradient(0, 0, width, 0);
  whiteGradient.addColorStop(0, "#FFFFFF");
  whiteGradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = whiteGradient;
  ctx.fillRect(0, 0, width, height);

  const blackGradient = ctx.createLinearGradient(0, 0, 0, height);
  blackGradient.addColorStop(0, "rgba(0,0,0,0)");
  blackGradient.addColorStop(1, "#000000");
  ctx.fillStyle = blackGradient;
  ctx.fillRect(0, 0, width, height);

  const x = context.saturation * width;
  const y = (1 - context.value) * height;
  ctx.beginPath();
  ctx.arc(x, y, markerRadius, 0, Math.PI * 2);
  ctx.lineWidth = 2 * ratio;
  ctx.strokeStyle = "#FFFFFF";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, markerOuterRadius, 0, Math.PI * 2);
  ctx.lineWidth = ratio;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
  ctx.stroke();
}

function updateColorFromCanvas(event) {
  const context = editingContext();
  const rect = els.colorCanvas.getBoundingClientRect();
  const x = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
  const y = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);
  context.saturation = x / rect.width;
  context.value = 1 - y / rect.height;
  setColor(rgbToHex(hsvToRgb(context.hue, context.saturation, context.value)), false);
}

function setColor(hex, syncFromHex = true) {
  const normalized = hex.startsWith("#") ? hex.toUpperCase() : `#${hex.toUpperCase()}`;
  if (!isHex(normalized)) return;

  const context = editingContext();
  context.kvColor = normalized;
  els.nativeColor.value = normalized;
  els.hexInput.value = normalized;
  els.colorDot.style.background = normalized;

  if (syncFromHex) {
    const hsv = rgbToHsv(hexToRgb(normalized));
    context.hue = hsv.h;
    context.saturation = hsv.s;
    context.value = hsv.v;
    els.hueRange.value = String(Math.round(context.hue));
  }

  renderSwatchCurrent();
  drawColorCanvas();
  renderPreviews();
}

function setKspColor(hex) {
  const normalized = hex.startsWith("#") ? hex.toUpperCase() : `#${hex.toUpperCase()}`;
  if (!isHex(normalized)) return;

  editingContext().kspColor = normalized;
  els.kspColorInput.value = normalized;
  els.kspColorHex.value = normalized;
  els.kspColorDot.style.background = normalized;
  renderPreviews();
}

function setSkuBackgroundColor(hex) {
  const normalized = hex.startsWith("#") ? hex.toUpperCase() : `#${hex.toUpperCase()}`;
  if (!isHex(normalized)) return;

  editingContext().skuBackgroundColor = normalized;
  if (els.skuBgColorInput) els.skuBgColorInput.value = normalized;
  if (els.skuBgColorHex) els.skuBgColorHex.value = normalized;
  if (els.skuBgColorDot) els.skuBgColorDot.style.background = normalized;
  renderPreviews();
}

function renderSwatches() {
  const fragment = document.createDocumentFragment();

  swatches.forEach((hex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.style.background = hex;
    button.setAttribute("aria-label", `Use color ${hex}`);
    button.addEventListener("click", () => setColor(hex));
    fragment.append(button);
  });

  els.swatchGrid.append(fragment);
  renderSwatchCurrent();
}

function renderSwatchCurrent() {
  const current = toCssRgb(editingContext().kvColor);
  els.swatchGrid.querySelectorAll("button").forEach((button) => {
    button.setAttribute(
      "aria-current",
      button.style.backgroundColor === current ? "true" : "false",
    );
  });
}

function readFile(input, key, labelKey, labelEl) {
  const [file] = input.files;
  if (!file) return;

  const context = editingContext();
  // The previous blob URL (if any) is deliberately left alive so undo can
  // restore it — see the comment in removeBackgroundFromImage.
  context[key] = URL.createObjectURL(file);
  context[labelKey] = titleCaseFileName(file.name);
  if (key === "skuImageUrl") {
    // A freshly uploaded photo is a new "pristine" original.
    context.originalSkuImageUrl = context[key];
    context.skuPositions = {};
    context.skuZooms = {};
  }
  if (key === "brandLogoUrl") {
    // Same "freshly uploaded = new pristine original" idea as the SKU photo
    // above, so a later Touch Up Restore brush always has the real original
    // logo to fall back on, even after Remove Background.
    context.originalBrandLogoUrl = context[key];
  }
  if (key === "sku2ImageUrl") {
    context.originalSku2ImageUrl = context[key];
    context.sku2Positions = {};
    context.sku2Zooms = {};
  }
  if (key === "sku3ImageUrl") {
    context.originalSku3ImageUrl = context[key];
    context.sku3Positions = {};
    context.sku3Zooms = {};
  }
  labelEl.textContent = context[labelKey];
  if (["skuImageUrl", "brandLogoUrl", "sku2ImageUrl", "sku3ImageUrl"].includes(key)) {
    syncRemoveBgAvailability(context);
  }
  renderPreviews();
}

function syncOutputButtons() {
  const outputs = editingContext().outputs;
  els.outputButtons.querySelectorAll("button").forEach((button) => {
    const isSelected = outputs.has(button.dataset.output);
    button.setAttribute("aria-selected", String(isSelected));
  });
}

// Returns the Set of output ids a template allows. Every Paying Seller
// template only has artwork for two formats; Shopee Live Flash Sale only
// ever has its own single fixed-size output; everything else (Mall BAU /
// Mall BAU New Arrival) gets the standard 5. Always an explicit Set now
// (never null/"anything goes") so a template-specific output like
// shopee-live-fs can't leak into another template's picker/bulk row chips.
function allowedOutputsForTemplate(template) {
  if (isPayingSellerTemplate(template)) return PAYING_SELLER_OUTPUTS;
  if (isShopeeLiveFsTemplate(template)) return SHOPEE_LIVE_FS_OUTPUTS;
  return MALL_BAU_OUTPUTS;
}

// Disables/greys out output-grid buttons that the given context's template
// doesn't support, auto-deselecting any that were already selected. Returns
// true if it had to drop a selection, so callers can decide whether to
// re-render anything that shows the output selection elsewhere (bulk rows).
function syncOutputAvailability(context) {
  const allowed = allowedOutputsForTemplate(context.template);
  let changed = false;

  if (allowed) {
    context.outputs.forEach((outputId) => {
      if (!allowed.has(outputId)) {
        context.outputs.delete(outputId);
        changed = true;
      }
    });
    // A template with only one possible output (Shopee Live Flash Sale)
    // has no picker UI to choose it from — see syncShopeeLiveFsVisibility —
    // so it needs to be selected automatically instead of just narrowing
    // down whatever the user already had picked.
    if (context.outputs.size === 0 && allowed.size === 1) {
      context.outputs.add([...allowed][0]);
      changed = true;
    }
  }

  els.outputButtons.querySelectorAll("button[data-output]").forEach((button) => {
    button.disabled = Boolean(allowed) && !allowed.has(button.dataset.output);
  });

  if (changed) syncOutputButtons();
  return changed;
}

// Populates every sidebar display field — KSP color, image filenames,
// output selection, template, KV color, toggles, and SKU background — from
// whichever context is currently active (the single editor's `state`, or a
// bulk row). Called whenever the main editor switches which one it's
// pointed at, so the sidebar always shows that context's own values. KSP
// text itself has no sidebar field anymore — see openKspEditor.
function syncEditorFieldsFromContext() {
  const context = editingContext();
  els.brandFileName.textContent = context.brandLogoLabel || "Upload";
  els.skuFileName.textContent = context.skuImageLabel || "Upload";
  if (els.sku2FileName) els.sku2FileName.textContent = context.sku2ImageLabel || "Upload";
  if (els.sku3FileName) els.sku3FileName.textContent = context.sku3ImageLabel || "Upload";
  if (els.skuImageGalleryError) els.skuImageGalleryError.hidden = true;
  renderSkuImageGallery(context);
  syncOutputButtons();
  syncRemoveBgAvailability(context);
  syncShopeeLiveFsVisibility(context);
  syncBulkCsvHint();

  els.templateSelect.value = context.template;
  els.logoContainerToggle.checked = context.hideLogoContainer;
  els.shopeeLogoToggle.checked = context.useOrangeShopeeLogo;
  // Checked = tag shown (matches its "Show ... tag" label), so this is the
  // inverse of the internal hideShopeeMallTag flag.
  if (els.shopeeMallLogoToggle) els.shopeeMallLogoToggle.checked = !context.hideShopeeMallTag;
  syncOutputAvailability(context);

  els.kspColorInput.value = context.kspColor;
  els.kspColorHex.value = context.kspColor;
  els.kspColorDot.style.background = context.kspColor;

  els.nativeColor.value = context.kvColor;
  els.hexInput.value = context.kvColor;
  els.colorDot.style.background = context.kvColor;
  els.hueRange.value = String(Math.round(context.hue));
  renderSwatchCurrent();
  drawColorCanvas();

  if (els.kvImageFileName) els.kvImageFileName.textContent = context.kvImageLabel || "Upload";
  els.kvModeToggle?.querySelectorAll("button[data-kv-mode]").forEach((button) => {
    const isActive = button.dataset.kvMode === context.kvMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  if (els.colorPicker) els.colorPicker.hidden = context.kvMode === "image";
  if (els.kvImagePanel) els.kvImagePanel.hidden = context.kvMode !== "image";

  syncKvColorAvailability(context);
  renderBackgroundPicker();
}

// Keeps the bulk panel's CSV column hint (and implicitly the "Download
// template" button, whose own click handler reads state.template directly)
// matching whichever template is currently selected — bulk generate always
// follows the sidebar's Template select, never a per-row override. Also
// hides "Default outputs for new rows" for Shopee Live FS — it only ever has
// its own single output, auto-selected on every new row (see
// syncOutputAvailability), so there's nothing for that picker to control.
function syncBulkCsvHint() {
  const isFs = isShopeeLiveFsTemplate(state.template);
  if (els.bulkDefaultsRow) els.bulkDefaultsRow.hidden = isFs;
  if (!els.bulkCsvHint) return;
  if (isFs) {
    els.bulkCsvHint.innerHTML =
      'Columns: <code>Time</code>, <code>Brand Name</code>, <code>Brand Logo</code>, ' +
      '<code>SKU 1 Name</code>, <code>SKU 1 Price Before</code>, <code>SKU 1 Price After</code>, ' +
      '<code>SKU 1 %</code>, <code>SKU 1 Image</code>, <code>SKU 2 %</code>, <code>SKU 2 Image</code>, ' +
      '<code>SKU 3 %</code>, <code>SKU 3 Image</code>. Logo and SKU images accept an image hash or a ' +
      "direct link, same as the single editor above.";
  } else {
    els.bulkCsvHint.innerHTML =
      "Columns: <code>Brand Name</code>, <code>KSP</code>, <code>Brand Logo</code>, <code>SKU Image</code>. " +
      "Brand Name is only used to label rows in the editor below and is never drawn onto the " +
      "banner. Logo and SKU accept an image hash or a direct link, same as the single editor above.";
  }
}

// A context built by the generic pipeline (the single editor's `state`, or a
// Mall BAU/Paying Seller bulk row from createBulkRowsFromCsv) never gets the
// Shopee Live FS-only fields (liveTime/skuName1/sku2ImageUrl/sku2Positions/
// etc. — see the state object's own "Shopee Live Flash Sale" block) since
// nothing else ever needs them. `state` happens to carry both shapes at once
// (it's initialized with every field up front), so this only matters for a
// bulk row: switching such a row's Template dropdown to Shopee Live FS
// mid-edit would otherwise leave those fields undefined, and
// createShopeeLiveFsPreviewBlock/drawShopeeLiveFs indexing into e.g.
// context.sku2Zooms[outputId] would throw. Backfills sane defaults (mirrors
// state's own defaults) only for whatever's actually missing, so it's a
// no-op for `state` and for any row that already has them.
function ensureShopeeLiveFsFields(context) {
  const defaults = {
    brandNameRaw: context.brandNameRaw || "",
    liveTime: state.liveTime,
    skuName1: state.skuName1,
    skuPriceBefore1: state.skuPriceBefore1,
    skuPriceAfter1: state.skuPriceAfter1,
    skuPct1: state.skuPct1,
    skuPct2: state.skuPct2,
    skuPct3: state.skuPct3,
    sku2ImageUrl: "",
    originalSku2ImageUrl: "",
    sku2ImageLabel: "",
    sku2Positions: {},
    sku2Zooms: {},
    sku3ImageUrl: "",
    originalSku3ImageUrl: "",
    sku3ImageLabel: "",
    sku3Positions: {},
    sku3Zooms: {},
  };
  Object.entries(defaults).forEach(([key, value]) => {
    if (context[key] === undefined) context[key] = value;
  });
}

// Shopee Live FS doesn't use KV/KSP/the Inverse Logo or Shopee Mall Logo
// toggles/the multi-output picker at all (see SHOPEE_LIVE_FS_LAYOUT/
// drawShopeeLiveFs) — hides those rows entirely rather than just disabling
// them (unlike Paying Seller's KV row, which stays visible-but-disabled
// since KV Color/Image are still conceptually meaningful there, just
// overridden by a fixed campaign background), and reveals the SKU 2/SKU 3
// panel + relabels "SKU Image" to "SKU 1 Image" in their place.
function syncShopeeLiveFsVisibility(context) {
  const isFs = isShopeeLiveFsTemplate(context.template);
  if (els.logoContainerToggleRow) els.logoContainerToggleRow.hidden = isFs;
  if (els.inverseLogoRow) els.inverseLogoRow.hidden = isFs;
  if (els.shopeeMallLogoRow) els.shopeeMallLogoRow.hidden = isFs;
  if (els.kspHintRow) els.kspHintRow.hidden = isFs;
  if (els.kspColorFieldRow) els.kspColorFieldRow.hidden = isFs;
  if (els.kvColorRow) els.kvColorRow.hidden = isFs;
  if (els.outputRow) els.outputRow.hidden = isFs;
  if (els.skuBackgroundRow) els.skuBackgroundRow.hidden = isFs;
  if (els.skuBgColorRow) els.skuBgColorRow.hidden = isFs;
  if (els.shopeeLiveFsPanel) els.shopeeLiveFsPanel.hidden = !isFs;
  if (els.skuImageFieldLabel) els.skuImageFieldLabel.textContent = isFs ? "SKU 1 Image" : "SKU Image";
}

// Every Paying Seller template's background is a fixed campaign image, so
// neither KV Color nor KV Image has anything to control there — disable
// both modes and explain why.
function syncKvColorAvailability(context) {
  const disabled = !templateUsesFlatKv(context.template);
  els.colorPicker?.classList.toggle("is-disabled", disabled);
  els.kvModeToggle?.classList.toggle("is-disabled", disabled);
  els.kvImagePanel?.classList.toggle("is-disabled", disabled);
  if (els.kvColorHint) els.kvColorHint.hidden = !disabled;
  [els.nativeColor, els.hexInput, els.hueRange].forEach((input) => {
    if (input) input.disabled = disabled;
  });
  if (els.kvImageInput) els.kvImageInput.disabled = disabled;
  if (disabled) resetKvActiveLayers(context);
}

// Disable "Remove Background" until this context has a SKU image/brand logo
// loaded, and keep both buttons out of the way while a removal run (either
// one — only one runs at a time app-wide) is already in flight.
function syncRemoveBgAvailability(context) {
  const hasSkuImage = Boolean(context.skuImageUrl);
  const hasLogo = Boolean(context.brandLogoUrl);
  const hasSku2Image = Boolean(context.sku2ImageUrl);
  const hasSku3Image = Boolean(context.sku3ImageUrl);
  if (els.removeBgButton && !bgRemovalRunning) els.removeBgButton.disabled = !hasSkuImage;
  if (els.removeLogoBgButton && !bgRemovalRunning) els.removeLogoBgButton.disabled = !hasLogo;
  if (els.removeBg2Button && !bgRemovalRunning) els.removeBg2Button.disabled = !hasSku2Image;
  if (els.removeBg3Button && !bgRemovalRunning) els.removeBg3Button.disabled = !hasSku3Image;
  // Touch Up has no async "running" state of its own (unlike Remove
  // Background), so it's always safe to sync straight from context.
  if (els.editSkuButton) els.editSkuButton.disabled = !hasSkuImage;
  if (els.editLogoButton) els.editLogoButton.disabled = !hasLogo;
  if (els.editSku2Button) els.editSku2Button.disabled = !hasSku2Image;
  if (els.editSku3Button) els.editSku3Button.disabled = !hasSku3Image;
}

function selectedOutputs() {
  return Object.keys(outputMeta).filter((output) => state.outputs.has(output));
}

function syncFloatingIconControls(context = editingContext()) {
  if (!els.floatingIconConfigRow) return;
  const isBlankMode = document.querySelector("#workflowCanvas")?.value === "blank";
  const isFloatingSelected = editingOutputs().includes("floating-icon");
  els.floatingIconConfigRow.hidden = isBlankMode || !isFloatingSelected;
  if (els.floatingIconConfigRow.hidden) return;
  els.floatingLogoRatio.value = context.floatingLogoRatio || "horizontal";
  const logoZoom = Math.round(getLogoZoom("floating-icon", context) * 100);
  const designZoom = Math.round(getSkuZoom("floating-icon", context) * 100);
  els.floatingLogoZoom.value = String(logoZoom);
  els.floatingLogoZoomValue.value = `${logoZoom}%`;
  els.floatingLogoZoomValue.textContent = `${logoZoom}%`;
  els.floatingDesignZoom.value = String(designZoom);
  els.floatingDesignZoomValue.value = `${designZoom}%`;
  els.floatingDesignZoomValue.textContent = `${designZoom}%`;
}

function outputFileName(outputId) {
  const format = outputMeta[outputId];
  return outputFileNameWithExtension(outputId, EXPORT_EXTENSION);
}

function outputFileNameWithExtension(outputId, extension) {
  const format = outputMeta[outputId];
  return `${format.title.replace(/\s+/g, "-").toLowerCase()}-${format.width}x${format.height}.${extension}`;
}

function formatFileSize(bytes) {
  if (bytes >= 1000 * 1000) return `${(bytes / (1000 * 1000)).toFixed(1)} MB`;
  return `${Math.ceil(bytes / 1000)} KB`;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}

function canvasToBlob(canvas, type = EXPORT_TYPE, quality = undefined) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas export returned an empty file."));
      }, type, quality);
    } catch (error) {
      reject(error);
    }
  });
}

function isRequestedBlobType(blob, type) {
  return type === EXPORT_TYPE || blob.type === type;
}

async function encodeCanvas(canvas, type = EXPORT_TYPE, quality = undefined) {
  const blob = await canvasToBlob(canvas, type, quality);
  return isRequestedBlobType(blob, type) ? blob : null;
}

function createOpaqueCanvas(canvas) {
  const opaqueCanvas = document.createElement("canvas");
  opaqueCanvas.width = canvas.width;
  opaqueCanvas.height = canvas.height;
  const ctx = opaqueCanvas.getContext("2d");
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, opaqueCanvas.width, opaqueCanvas.height);
  ctx.drawImage(canvas, 0, 0);
  return opaqueCanvas;
}

function createDetailLimitedCanvas(canvas, scale) {
  const scaledWidth = Math.max(1, Math.round(canvas.width * scale));
  const scaledHeight = Math.max(1, Math.round(canvas.height * scale));
  const smallCanvas = document.createElement("canvas");
  smallCanvas.width = scaledWidth;
  smallCanvas.height = scaledHeight;

  const smallCtx = smallCanvas.getContext("2d");
  smallCtx.imageSmoothingEnabled = true;
  smallCtx.imageSmoothingQuality = "high";
  smallCtx.drawImage(canvas, 0, 0, scaledWidth, scaledHeight);

  const detailCanvas = document.createElement("canvas");
  detailCanvas.width = canvas.width;
  detailCanvas.height = canvas.height;
  const detailCtx = detailCanvas.getContext("2d");
  detailCtx.imageSmoothingEnabled = true;
  detailCtx.imageSmoothingQuality = "high";
  detailCtx.fillStyle = "#FFFFFF";
  detailCtx.fillRect(0, 0, detailCanvas.width, detailCanvas.height);
  detailCtx.drawImage(smallCanvas, 0, 0, detailCanvas.width, detailCanvas.height);
  return detailCanvas;
}

// Only tries down to a moderate quality floor. Measured with a busy test photo:
// re-embedding a JPEG-softened photo losslessly into a full PNG barely shrinks at
// all as quality drops (PNG's DEFLATE can't exploit JPEG's frequency-domain
// compression), so pushing this ladder past ~0.4-0.5 wastes time and, for anything
// but very simple/plain photos, never actually gets under budget until it hits
// catastrophic quality. Better to fail fast here and let createExportFile move on
// to a full-canvas JPEG pass, which compresses busy photos far more efficiently
// and still keeps the ribbon/logo/text looking clean at a reasonable quality.
const PHOTO_SOFTEN_QUALITIES = [0.92, 0.82, 0.7, 0.58, 0.46];

// Renders only the SKU photo (the sole photographic, high-entropy region of the banner)
// into its own canvas at the exact size it occupies in the final output. Optionally passes
// it through one JPEG encode/decode round trip to reduce its detail/noise before it gets
// composited back in. Everything else in the banner (KV background, overlay ribbon/badge,
// brand logo, KSP text) is flat graphic content that a lossless PNG encodes near-perfectly,
// so keeping those pixels out of any lossy step is what keeps them crisp.
async function createPhotoLayer(outputId, quality, context = state) {
  const format = outputMeta[outputId];
  const layout = getLayout(format, context);
  const [skuImage, backgroundImage] = await Promise.all([
    loadImage(context.skuImageUrl),
    loadImage(getSkuBackgroundSrc(context)),
  ]);

  const photoCanvas = document.createElement("canvas");
  photoCanvas.width = Math.max(1, Math.round(layout.product.width));
  photoCanvas.height = Math.max(1, Math.round(layout.product.height));
  const photoCtx = photoCanvas.getContext("2d");
  photoCtx.imageSmoothingEnabled = true;
  photoCtx.imageSmoothingQuality = "high";
  photoCtx.fillStyle = "#FFFFFF";
  photoCtx.fillRect(0, 0, photoCanvas.width, photoCanvas.height);

  if (backgroundImage) {
    const bgPosition = getSkuBackgroundPosition(outputId, layout, backgroundImage, context);
    const bgZoom = getSkuBackgroundZoom(outputId, context);
    drawCover(
      photoCtx,
      backgroundImage,
      0,
      0,
      photoCanvas.width,
      photoCanvas.height,
      bgPosition.x,
      bgPosition.y,
      bgZoom,
    );
  }

  if (skuImage) {
    const skuPosition = getSkuPosition(outputId, layout, skuImage, context);
    const skuZoom = getSkuZoom(outputId, context);
    drawCover(
      photoCtx,
      skuImage,
      0,
      0,
      photoCanvas.width,
      photoCanvas.height,
      skuPosition.x,
      skuPosition.y,
      skuZoom,
    );
  }

  if (!quality || typeof createImageBitmap !== "function") return photoCanvas;

  const jpegBlob = await encodeCanvas(photoCanvas, "image/jpeg", quality);
  if (!jpegBlob) return photoCanvas;

  try {
    const softened = await createImageBitmap(jpegBlob);
    const softCanvas = document.createElement("canvas");
    softCanvas.width = photoCanvas.width;
    softCanvas.height = photoCanvas.height;
    softCanvas.getContext("2d").drawImage(softened, 0, 0);
    return softCanvas;
  } catch {
    return photoCanvas;
  }
}

async function renderPngWithSoftenedPhoto(outputId, quality, context = state) {
  const format = outputMeta[outputId];
  const photoLayer = await createPhotoLayer(outputId, quality, context);
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = format.width;
  exportCanvas.height = format.height;
  await drawOutput(outputId, exportCanvas, { photoOverride: photoLayer, context });
  return exportCanvas;
}

// Binary-searches for the highest JPEG quality that still fits under the
// byte budget for a given (already-rendered) canvas. Shared by the
// full-resolution lossy pass and the emergency detail-reduced pass below,
// so every resolution tier gets the best quality available at that size
// instead of always dropping straight to the worst possible quality.
async function findBestQualityFile(sourceCanvas, format) {
  let low = format.minQuality;
  let high = format.maxQuality;
  let bestUnderLimit = null;
  let smallestFile = null;

  for (let attempt = 0; attempt < 9; attempt += 1) {
    const quality = (low + high) / 2;
    const blob = await encodeCanvas(sourceCanvas, format.type, quality);
    if (!blob) return null;

    const file = {
      blob,
      extension: format.extension,
      label: format.label,
      quality,
    };

    if (!smallestFile || blob.size < smallestFile.blob.size) smallestFile = file;

    if (blob.size <= EXPORT_TARGET_BYTES) {
      bestUnderLimit = file;
      low = quality;
    } else {
      high = quality;
    }
  }

  if (!bestUnderLimit) {
    const blob = await encodeCanvas(sourceCanvas, format.type, format.minQuality);
    if (blob) {
      const file = {
        blob,
        extension: format.extension,
        label: format.label,
        quality: format.minQuality,
      };
      if (!smallestFile || blob.size < smallestFile.blob.size) smallestFile = file;
      if (blob.size <= EXPORT_TARGET_BYTES) bestUnderLimit = file;
    }
  }

  return bestUnderLimit || smallestFile;
}

async function createLossyExport(canvas, format) {
  const sourceCanvas = format.type === "image/jpeg" ? createOpaqueCanvas(canvas) : canvas;
  return findBestQualityFile(sourceCanvas, format);
}

// Last resort when even a full-resolution JPEG at the lowest quality can't
// fit the byte budget. Steps resolution down gradually, but at each step
// still searches for the *best* quality that fits rather than jumping
// straight to the worst quality — a modest resolution trim plus a
// reasonable quality usually looks far better than the same resolution
// crushed to minimum quality.
async function createEmergencyExport(canvas) {
  let smallestFile = null;

  for (const scale of DETAIL_LIMIT_SCALES) {
    const detailCanvas = createDetailLimitedCanvas(canvas, scale);
    for (const format of LOSSY_EXPORT_FORMATS) {
      const sourceCanvas =
        format.type === "image/jpeg" ? createOpaqueCanvas(detailCanvas) : detailCanvas;
      const file = await findBestQualityFile(sourceCanvas, format);
      if (!file) continue;

      if (!smallestFile || file.blob.size < smallestFile.blob.size) smallestFile = file;
      if (file.blob.size <= EXPORT_TARGET_BYTES) return file;
    }
  }

  return smallestFile;
}

async function renderExportCanvas(outputId, context = state) {
  const format = outputMeta[outputId];
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = format.width;
  exportCanvas.height = format.height;
  const ctx = exportCanvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  await drawOutput(outputId, exportCanvas, { context });
  return exportCanvas;
}

async function createExportFile(outputId, context = state) {
  const canvas = await renderExportCanvas(outputId, context);
  const pngBlob = await encodeCanvas(canvas, EXPORT_TYPE);
  const sizeLimited = SIZE_LIMITED_OUTPUTS.has(outputId);

  // Floating Icon is specified as transparent PNG; never fall back to JPEG,
  // which would replace its transparent area with an opaque background.
  if (outputId === "floating-icon") {
    if (!pngBlob) throw new Error("PNG export failed.");
    return {
      name: outputFileName(outputId),
      blob: pngBlob,
      label: "PNG",
      sizeLimited,
    };
  }

  if (!sizeLimited) {
    if (!pngBlob) throw new Error("PNG export failed.");
    return {
      name: outputFileName(outputId),
      blob: pngBlob,
      label: "PNG",
      sizeLimited,
    };
  }

  if (pngBlob && pngBlob.size <= EXPORT_TARGET_BYTES) {
    return {
      name: outputFileName(outputId),
      blob: pngBlob,
      label: "PNG",
      sizeLimited,
    };
  }

  let smallestFile = pngBlob
    ? {
        name: outputFileName(outputId),
        blob: pngBlob,
        label: "PNG",
        sizeLimited,
      }
    : null;

  // Try shrinking by softening only the photo region and keeping the ribbon/logo/text
  // crisp, re-exporting as lossless PNG each time, before falling back to full JPEG.
  for (const quality of PHOTO_SOFTEN_QUALITIES) {
    const softCanvas = await renderPngWithSoftenedPhoto(outputId, quality, context);
    const softPngBlob = await encodeCanvas(softCanvas, EXPORT_TYPE);
    if (!softPngBlob) continue;

    const file = {
      name: outputFileName(outputId),
      blob: softPngBlob,
      label: "PNG",
      sizeLimited,
    };

    if (!smallestFile || file.blob.size < smallestFile.blob.size) smallestFile = file;
    if (file.blob.size <= EXPORT_TARGET_BYTES) return file;
  }

  for (const format of LOSSY_EXPORT_FORMATS) {
    const file = await createLossyExport(canvas, format);
    if (!file) continue;

    const namedFile = {
      ...file,
      name: outputFileNameWithExtension(outputId, file.extension),
      sizeLimited,
    };

    if (!smallestFile || namedFile.blob.size < smallestFile.blob.size) {
      smallestFile = namedFile;
    }

    if (namedFile.blob.size <= EXPORT_TARGET_BYTES) return namedFile;
  }

  const emergencyFile = await createEmergencyExport(canvas);
  if (emergencyFile) {
    const namedEmergencyFile = {
      ...emergencyFile,
      name: outputFileNameWithExtension(outputId, emergencyFile.extension),
      sizeLimited,
    };

    if (!smallestFile || namedEmergencyFile.blob.size < smallestFile.blob.size) {
      smallestFile = namedEmergencyFile;
    }

    if (namedEmergencyFile.blob.size <= EXPORT_TARGET_BYTES) return namedEmergencyFile;
  }

  if (smallestFile) return smallestFile;
  throw new Error("No export file was generated.");
}

async function downloadCanvas(outputId, context = state) {
  try {
    setStatus("Compressing");
    const file = await createExportFile(outputId, context);
    downloadBlob(file.blob, file.name);
    setStatus(
      !file.sizeLimited || file.blob.size <= EXPORT_MAX_BYTES
        ? `${file.label} ${formatFileSize(file.blob.size)}`
        : "Over 250 KB",
    );
  } catch (error) {
    console.error("Download failed", error);
    setStatus(error?.name === "SecurityError" ? "Use local server" : "Download failed");
    window.setTimeout(() => setStatus("Ready"), 1800);
  }
}

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < table.length; i += 1) {
    let value = i;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[i] = value >>> 0;
  }
  return table;
}

const crcTable = makeCrcTable();

function crc32(bytes) {
  let crc = 0xffffffff;
  bytes.forEach((byte) => {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  });
  return (crc ^ 0xffffffff) >>> 0;
}

function dateToDosTime(date) {
  const year = Math.max(1980, date.getFullYear());
  return {
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
  };
}

function zipHeader(size) {
  return new Uint8Array(size);
}

function writeZipHeader(bytes, values) {
  const view = new DataView(bytes.buffer);
  values.forEach(([offset, size, value]) => {
    if (size === 2) view.setUint16(offset, value, true);
    else view.setUint32(offset, value, true);
  });
}

async function createZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { date, time } = dateToDosTime(new Date());

  for (const file of files) {
    const nameBytes = zipEncoder.encode(file.name);
    const data = new Uint8Array(await file.blob.arrayBuffer());
    const checksum = crc32(data);
    const localHeader = zipHeader(30 + nameBytes.length);

    writeZipHeader(localHeader, [
      [0, 4, 0x04034b50],
      [4, 2, 20],
      [6, 2, 0],
      [8, 2, 0],
      [10, 2, time],
      [12, 2, date],
      [14, 4, checksum],
      [18, 4, data.length],
      [22, 4, data.length],
      [26, 2, nameBytes.length],
      [28, 2, 0],
    ]);
    localHeader.set(nameBytes, 30);

    const centralHeader = zipHeader(46 + nameBytes.length);
    writeZipHeader(centralHeader, [
      [0, 4, 0x02014b50],
      [4, 2, 20],
      [6, 2, 20],
      [8, 2, 0],
      [10, 2, 0],
      [12, 2, time],
      [14, 2, date],
      [16, 4, checksum],
      [20, 4, data.length],
      [24, 4, data.length],
      [28, 2, nameBytes.length],
      [30, 2, 0],
      [32, 2, 0],
      [34, 2, 0],
      [36, 2, 0],
      [38, 4, 0],
      [42, 4, offset],
    ]);
    centralHeader.set(nameBytes, 46);

    localParts.push(localHeader, data);
    centralParts.push(centralHeader);
    offset += localHeader.length + data.length;
  }

  const centralSize = centralParts.reduce((total, part) => total + part.length, 0);
  const endHeader = zipHeader(22);
  writeZipHeader(endHeader, [
    [0, 4, 0x06054b50],
    [4, 2, 0],
    [6, 2, 0],
    [8, 2, files.length],
    [10, 2, files.length],
    [12, 4, centralSize],
    [16, 4, offset],
    [20, 2, 0],
  ]);

  return new Blob([...localParts, ...centralParts, endHeader], {
    type: "application/zip",
  });
}

async function downloadAll() {
  const context = editingContext();
  const selected = editingOutputs();
  if (!selected.length) {
    setStatus("Select output");
    return;
  }

  els.downloadAllButton.disabled = true;
  const buttonLabel = els.downloadAllButton.textContent;
  els.downloadAllButton.textContent = "Preparing...";

  try {
    setStatus("Compressing assets");

    const files = [];
    const failedOutputs = [];
    for (const outputId of selected) {
      // Match the Blank workflow: build and start each selected file on its
      // own. One output must never prevent the others from downloading.
      try {
        const file = await createExportFile(outputId, context);
        if (file?.blob) files.push(file);
      } catch (error) {
        console.error(`Download failed for ${outputId}`, error);
        failedOutputs.push(outputMeta[outputId]?.title || outputId);
      }
    }

    if (!files.length) {
      throw new Error(`No selected outputs could be downloaded: ${failedOutputs.join(", ")}.`);
    }

    // Match the Blank workflow exactly: download every selected image
    // directly. Standard mode must not add an intermediate ZIP step.
    files.forEach((file) => downloadBlob(file.blob, file.name));

    const hasOversizedFile = files.some(
      (file) => file.sizeLimited && file.blob.size > EXPORT_MAX_BYTES,
    );
    setStatus(
      hasOversizedFile
        ? "Some > 250 KB"
        : failedOutputs.length
          ? `${files.length} prepared; retry ${failedOutputs.join(", ")}`
          : `${files.length} asset${files.length === 1 ? "" : "s"} downloaded`,
    );
    return true;
  } catch (error) {
    console.error("Download failed", error);
    const isSecurityError = error?.name === "SecurityError";
    setStatus(isSecurityError ? "Use local server" : "Download failed");
    window.setTimeout(() => setStatus("Ready"), 1800);
    return false;
  } finally {
    els.downloadAllButton.disabled = false;
    els.downloadAllButton.textContent = buttonLabel;
  }

}

// ---------------------------------------------------------------------------
// Bulk generate from CSV
//
// This is a separate, self-contained workflow that borrows the existing
// single-image render pipeline (createExportFile / drawOutput / the main
// preview stage) rather than duplicating it. Template, KV color, toggles,
// and SKU background always stay whatever the sidebar currently has
// configured — those are shared and apply to every row. Brand logo, SKU
// image, KSP text, output selection, and SKU position/zoom are each row's
// own — clicking "Preview & edit" makes that row the active editing
// context (see `activeRow` above), so the exact same sidebar fields and
// main-stage preview cards used for the single brand become that row's
// editor until you click "Back to main editor".
// ---------------------------------------------------------------------------

const BULK_OUTPUT_IDS = Object.keys(outputMeta);
const BULK_DEFAULT_OUTPUTS = new Set(["banner-card", "pop-up-banner"]);
const BULK_CSV_TEMPLATE =
  "Brand Name,KSP,Brand Logo,SKU Image\r\n" +
  "ECENTIO,DISKON S.D. 80% + GRATIS ONGKIR,https://mms.img.susercontent.com/id-11134210-822wm-ml8pii7ihp8j90,https://down-id.img.susercontent.com/file/id-11134207-7r98o-loxqc8rx4uib3d.webp\r\n" +
  "OCTARINE,DISKON S.D. 25% + GRATIS HADIAH,https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQutJF3gU0wlRkmQD8-eRr3g45iv2vlATy9Q5Xk6wKuWKPrzdUjEsRsmSK3&s=10,https://down-id.img.susercontent.com/file/id-11134207-81ztg-mq31vghvdwch4b.webp\r\n" +
  "ADIDAS,BELI 2 GRATIS 1 + DISKON S.D. 25%,https://cdn.mos.cms.futurecdn.net/hSM7yyWB7BzvgAQ3tjTf2H.jpg,https://down-id.img.susercontent.com/file/sg-11134201-822xl-mi2u10of1blt78.webp\r\n" +
  "FASHION,BUNDLE HEMAT + DISKON S.D. 100RB,https://down-id.img.susercontent.com/file/id-11134216-81zto-mqlk0pmgpoge02@resize_w160_nl.webp,https://down-id.img.susercontent.com/file/id-11134207-82251-mfuy780y3dam63.webp\r\n" +
  "YAMAHA,EXCLUSIVE LAUNCH + GRATIS HELM,https://down-id.img.susercontent.com/file/id-11134226-23020-kk084vs3h2mv04@resize_w160_nl.webp,https://down-id.img.susercontent.com/file/id-11134207-81ztl-mr5crq05ixoh0d.webp\r\n" +
  "REALFOOD,REALFOOD BUY 2 GET 1 ,https://down-id.img.susercontent.com/file/009faf188f8171dfdb062f5762bd4013@resize_w160_nl.webp,https://down-id.img.susercontent.com/file/id-11134207-7rbk9-m70np7ny4i2k54.webp\r\n" +
  "NEW BALANCE,SPECIAL WORLD CUP,https://www.freepnglogos.com/pics/new-balance-png-logo-brands,https://www.soccer.com/wcm/connect/0369ef2a-8296-4d66-aa47-1fb8156886cf/smartphone/070626-NewBalance-Neon-Tide-Pack__EMAIL__MAIN__4x5-IMAGE.jpg?MOD=AJPERES&CACHEID=ROOTWORKSPACE-0369ef2a-8296-4d66-aa47-1fb8156886cf-smartphone-pYTJDI8\r\n";

// Shopee Live FS's own brief template — column order matches
// mapShopeeLiveFsCsvColumns exactly (Time, Brand Name, Brand Logo, then SKU
// 1's full Name/Price Before/Price After/%/Image, then SKU 2/SKU 3's %+Image
// only), mirroring the reference "Shopee Live FS Brief Template" CSV in
// Template -> Shopee Live Flash Sale -> CSV Template.
const SHOPEE_LIVE_FS_CSV_TEMPLATE =
  "Time,Brand Name,Brand Logo,SKU 1 Name,SKU 1 Price Before,SKU 1 Price After,SKU 1 %,SKU 1 Image,SKU 2 %,SKU 2 Image,SKU 3 %,SKU 3 Image\r\n" +
  "PK. 08:00 WIB,Zara Store,https://down-id.img.susercontent.com/file/id-11134004-8224o-mi5v8m6v37k0ee@resize_w160_nl.webp,Inara Bags Tas Selempang Wanita,Rp21.500,Rp20.900,-69,https://down-id.img.susercontent.com/file/sg-11134201-824gu-mpj4t5ukm0hsf6@resize_w900_nl.webp,-30,https://down-id.img.susercontent.com/file/sg-11134201-823r3-mp9fppw550r252.webp,-12,https://down-id.img.susercontent.com/file/id-11134207-7rbk4-m9epddhdqiohc8@resize_w900_nl.webp\r\n" +
  "PK. 12:00 WIB,Adidas,https://down-tx-id.img.susercontent.com/ae9781403fea2db79cafd33c853ade47_tn.webp,Tas Adidas Pria beige,Rp315.000,Rp200.900,-70,https://down-id.img.susercontent.com/file/sg-11134201-8225k-mhv534trkbutde@resize_w900_nl.webp,-37,https://down-id.img.susercontent.com/file/id-11134201-7rbk9-maurn41mes9e41@resize_w900_nl.webp,-60,https://down-id.img.susercontent.com/file/sg-11134201-821eb-mh9qbgxadslnda@resize_w900_nl.webp\r\n" +
  "PK. 22:00 WIB,sheena fashion,https://down-id.img.susercontent.com/file/id-11134233-7r991-lzcknfxh22vc89@resize_w160_nl.webp,CELANA HOMMY 3 KULOT ADEM PIYAMA COTTON ,Rp22.000,Rp19.707,-30,https://down-id.img.susercontent.com/file/id-11134207-822wr-mpjr9n12emm9cf.webp,-30,https://down-id.img.susercontent.com/file/id-11134207-7rbk9-m94ldx15dwxu80.webp,-30,https://down-id.img.susercontent.com/file/id-11134207-7rbka-m94ldx15fbia7b.webp\r\n" +
  "PK. 08:00 WIB,PUMA Official Shop,https://down-id.img.susercontent.com/file/a744086c7da0cf74f9b12ae78608e0c3@resize_w160_nl.webp,PUMA Tas Ransel Phase Tape Uniseks,Rp700.000,Rp374.250,-21,https://down-id.img.susercontent.com/file/sg-11134275-8259y-mqznkmtfc54xff.webp,-20,https://down-id.img.susercontent.com/file/id-11134201-7rash-m4zoc6wa2lfq4c@resize_w900_nl.webp,-61,https://down-id.img.susercontent.com/file/sg-11134275-825ar-mqznkmlyytj401.webp\r\n";

const bulkState = {
  rows: [],
  defaultOutputs: new Set(BULK_DEFAULT_OUTPUTS),
  page: 0,
};
let bulkRowSeq = 0;

// Minimal RFC4126-style CSV parser: handles quoted fields, embedded commas,
// escaped quotes ("") inside quoted fields, and CRLF/LF line endings.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') inQuotes = true;
    else if (char === ",") pushField();
    else if (char === "\n") pushRow();
    else if (char === "\r") {
      // Ignore; a following \n (if any) triggers the row push.
    } else field += char;
  }

  if (field.length > 0 || row.length > 0) pushRow();

  return rows.filter((cells) => cells.some((cell) => cell.trim() !== ""));
}

function findCsvColumn(header, patterns) {
  return header.findIndex((cell) =>
    patterns.some((pattern) => pattern.test(cell.trim().toLowerCase())),
  );
}

function mapCsvColumns(header) {
  return {
    // Identifier only — never rendered into any banner output. Matched
    // before "Brand Logo" so a header of just "Brand" doesn't get
    // misidentified as the logo column.
    brandName: findCsvColumn(header, [/^brand name$/, /brand[\s_-]*name/]),
    ksp: findCsvColumn(header, [/^ksp$/, /ksp/]),
    brandLogo: findCsvColumn(header, [/^brand logo$/, /brand[\s_-]*logo/, /\blogo\b/]),
    skuImage: findCsvColumn(header, [/^sku image$/, /sku[\s_-]*image/, /\bsku\b/]),
  };
}

// Column layout for the Shopee Live Flash Sale brief CSV — completely
// different shape from mapCsvColumns above: Time, Brand Name, Brand Logo,
// then SKU 1's full set (Name/Price Before/Price After/%/Image), and SKU 2 /
// SKU 3 with only a % and an Image each (matching the design — only the
// hero SKU gets a name/price, the other two are just smaller thumbnails
// with their own discount badge). Order-matched patterns (e.g. "sku 1 %"
// before "sku 2 %") so the more specific column wins over a looser one.
function mapShopeeLiveFsCsvColumns(header) {
  return {
    time: findCsvColumn(header, [/^time$/, /\btime\b/]),
    brandName: findCsvColumn(header, [/^brand name$/, /brand[\s_-]*name/]),
    brandLogo: findCsvColumn(header, [/^brand logo$/, /brand[\s_-]*logo/]),
    sku1Name: findCsvColumn(header, [/^sku ?1 name$/, /sku[\s_-]*1[\s_-]*name/]),
    sku1PriceBefore: findCsvColumn(header, [/^sku ?1 price before$/, /sku[\s_-]*1[\s_-]*price[\s_-]*before/]),
    sku1PriceAfter: findCsvColumn(header, [/^sku ?1 price after$/, /sku[\s_-]*1[\s_-]*price[\s_-]*after/]),
    sku1Pct: findCsvColumn(header, [/^sku ?1 ?%$/, /sku[\s_-]*1[\s_-]*%/]),
    sku1Image: findCsvColumn(header, [/^sku ?1 image$/, /sku[\s_-]*1[\s_-]*image/]),
    sku2Pct: findCsvColumn(header, [/^sku ?2 ?%$/, /sku[\s_-]*2[\s_-]*%/]),
    sku2Image: findCsvColumn(header, [/^sku ?2 image$/, /sku[\s_-]*2[\s_-]*image/]),
    sku3Pct: findCsvColumn(header, [/^sku ?3 ?%$/, /sku[\s_-]*3[\s_-]*%/]),
    sku3Image: findCsvColumn(header, [/^sku ?3 image$/, /sku[\s_-]*3[\s_-]*image/]),
  };
}

// Appends a leading "-" and trailing "%" to a bare CSV percentage value
// (e.g. "69" or "-69") so it renders exactly like the design's "-69%" — but
// leaves a value that already looks fully formatted (already has a "%")
// untouched, so re-editing an already-normalized value on canvas and
// re-exporting a CSV from it later wouldn't double up the punctuation.
function normalizePctValue(value) {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  if (trimmed.includes("%")) return trimmed;
  const withSign = trimmed.startsWith("-") ? trimmed : `-${trimmed.replace(/^\+/, "")}`;
  return `${withSign}%`;
}

// Shopee Live Flash Sale's own CSV row builder — kept entirely separate from
// the generic path below (rather than threading a dozen conditionals
// through it) since the column layout, and the row shape it produces, don't
// overlap at all: three SKUs instead of one, a Time field, prices, and no
// KSP/KV/logo-container concepts. See mapShopeeLiveFsCsvColumns for the
// column layout and SHOPEE_LIVE_FS_LAYOUT/drawShopeeLiveFs for how these
// fields get drawn.
function createShopeeLiveFsRowsFromCsv(text) {
  const table = parseCsv(text);
  if (!table.length) return [];

  const detected = mapShopeeLiveFsCsvColumns(table[0]);
  const headerRecognized = Object.values(detected).some((index) => index !== -1);
  const dataRows = headerRecognized ? table.slice(1) : table;

  return dataRows.map((cells) => {
    const cell = (index) => (index === -1 ? "" : (cells[index] || "").trim());
    const brandNameRaw = cell(detected.brandName);

    return {
      id: `bulk-row-${(bulkRowSeq += 1)}`,
      brandNameRaw,
      brandLogoRaw: cell(detected.brandLogo),
      skuImageRaw: cell(detected.sku1Image),
      sku2ImageRaw: cell(detected.sku2Image),
      sku3ImageRaw: cell(detected.sku3Image),
      outputs: new Set(SHOPEE_LIVE_FS_OUTPUTS),
      status: "pending",
      statusLabel: "Ready",
      template: SHOPEE_LIVE_FS_TEMPLATE,
      brandLogoUrl: "",
      originalBrandLogoUrl: "",
      brandLogoLabel: "",
      skuImageUrl: "",
      originalSkuImageUrl: "",
      skuImageLabel: "",
      skuImageCandidates: [],
      sku2ImageUrl: "",
      originalSku2ImageUrl: "",
      sku2ImageLabel: "",
      sku3ImageUrl: "",
      originalSku3ImageUrl: "",
      sku3ImageLabel: "",
      liveTime: cell(detected.time) || state.liveTime,
      skuName1: cell(detected.sku1Name) || state.skuName1,
      skuPriceBefore1: cell(detected.sku1PriceBefore) || state.skuPriceBefore1,
      skuPriceAfter1: cell(detected.sku1PriceAfter) || state.skuPriceAfter1,
      skuPct1: normalizePctValue(cell(detected.sku1Pct)) || state.skuPct1,
      skuPct2: normalizePctValue(cell(detected.sku2Pct)) || state.skuPct2,
      skuPct3: normalizePctValue(cell(detected.sku3Pct)) || state.skuPct3,
      skuPositions: {},
      skuZooms: {},
      sku2Positions: {},
      sku2Zooms: {},
      sku3Positions: {},
      sku3Zooms: {},
      logoZooms: {},
      skuBackgroundIndex: -1,
      skuBackgroundColor: state.skuBackgroundColor,
      skuBackgroundPositions: {},
      skuBackgroundZooms: {},
      activeLayerByOutput: {},
      // Unused by this template's own render path, but kept so the row's
      // shape still matches every other context object — some generic
      // sidebar-sync code (syncEditorFieldsFromContext, undo/redo restore)
      // reads these fields regardless of which template is active.
      ksp: "",
      kspColor: state.kspColor,
      kspFontSizes: {},
      kspOffsets: {},
      kspManualBreaksByOutput: {},
      hideLogoContainer: false,
      useOrangeShopeeLogo: false,
      hideShopeeMallTag: false,
      kvColor: state.kvColor,
      kvMode: "color",
      kvImageUrl: "",
      kvImageLabel: "",
      kvImagePositions: {},
      kvImageZooms: {},
      hue: state.hue,
      saturation: state.saturation,
      value: state.value,
      resolved: false,
      resolving: null,
      imagesFailed: false,
    };
  });
}

function createBulkRowsFromCsv(text) {
  if (isShopeeLiveFsTemplate(state.template)) return createShopeeLiveFsRowsFromCsv(text);

  const table = parseCsv(text);
  if (!table.length) return [];

  const detected = mapCsvColumns(table[0]);
  const headerRecognized =
    detected.ksp !== -1 || detected.brandLogo !== -1 || detected.skuImage !== -1 || detected.brandName !== -1;
  // No-header fallback keeps the original 3-column order (KSP, Brand Logo,
  // SKU Image) for backward compatibility with CSVs made before the Brand
  // Name column existed — brandName is left unmatched (-1) in that case.
  const columns = headerRecognized ? detected : { ksp: 0, brandLogo: 1, skuImage: 2, brandName: -1 };
  const dataRows = headerRecognized ? table.slice(1) : table;

  const rowTemplate = state.template;
  const rowAllowedOutputs = allowedOutputsForTemplate(rowTemplate);
  const defaultOutputs = rowAllowedOutputs
    ? new Set([...bulkState.defaultOutputs].filter((outputId) => rowAllowedOutputs.has(outputId)))
    : new Set(bulkState.defaultOutputs);

  return dataRows.map((cells) => {
    const kspRaw = (cells[columns.ksp] || "").trim();
    // Editor-only identifier — swapped in for the generic "Row 1", "Row 2"
    // label wherever a row is shown in the bulk list/editing banner. Never
    // drawn onto any canvas output.
    const brandNameRaw = columns.brandName !== -1 ? (cells[columns.brandName] || "").trim() : "";
    return {
      id: `bulk-row-${(bulkRowSeq += 1)}`,
      brandNameRaw,
      kspRaw,
      brandLogoRaw: (cells[columns.brandLogo] || "").trim(),
      skuImageRaw: (cells[columns.skuImage] || "").trim(),
      outputs: new Set(defaultOutputs),
      status: "pending",
      statusLabel: "Ready",
      // Each row is its own self-contained editing context — same shape the
      // shared render pipeline expects from `state` — so a row can be
      // previewed/edited independently without touching the single editor.
      // Template/KV color/toggles/background start as a copy of whatever
      // the sidebar currently has, then become fully independent per row
      // once you preview/edit that row and change any of them.
      brandLogoUrl: "",
      originalBrandLogoUrl: "",
      brandLogoLabel: "",
      skuImageUrl: "",
      originalSkuImageUrl: "",
      skuImageLabel: "",
      skuImageCandidates: [],
      ksp: normalizedKsp(kspRaw),
      skuPositions: {},
      skuZooms: {},
      logoZooms: {},
      kspFontSizes: {},
      kspOffsets: {},
      kspManualBreaksByOutput: {},
      activeLayerByOutput: {},
      template: state.template,
      hideLogoContainer: state.hideLogoContainer,
      useOrangeShopeeLogo: state.useOrangeShopeeLogo,
      hideShopeeMallTag: state.hideShopeeMallTag,
      kvColor: state.kvColor,
      kvMode: state.kvMode,
      kvImageUrl: "",
      kvImageLabel: "",
      kvImagePositions: {},
      kvImageZooms: {},
      kspColor: state.kspColor,
      hue: state.hue,
      saturation: state.saturation,
      value: state.value,
      skuBackgroundIndex: state.skuBackgroundIndex,
      skuBackgroundColor: state.skuBackgroundColor,
      skuBackgroundPositions: {},
      skuBackgroundZooms: {},
      resolved: false,
      resolving: null,
      imagesFailed: false,
    };
  });
}

// Fetches a row's brand logo + SKU image exactly once, caching the result on
// the row itself. Safe to call repeatedly (e.g. every time a row expands) —
// concurrent calls share the same in-flight promise instead of re-fetching.
// Resolves one image field without ever rejecting — a bad hash/link just
// comes back as "no image" (same as an intentionally blank CSV cell), with
// `failed: true` so the caller can flag it without treating it as fatal.
async function resolveBulkImageField(raw) {
  if (!raw) return { url: "", failed: false };
  try {
    return { url: await resolveBulkImage(raw), failed: false };
  } catch (error) {
    console.error("Bulk row image load failed", raw, error);
    return { url: "", failed: true };
  }
}

function ensureBulkRowResolved(row) {
  if (row.resolved) return Promise.resolve(row);
  if (row.resolving) return row.resolving;

  row.resolving = (async () => {
    try {
      // Each image field is resolved independently (not one Promise.all
      // that rejects the whole row the moment any single one fails) — a bad
      // hash/link in, say, the SKU image column should never block that same
      // row's perfectly valid brand logo, other SKU images, or any of its
      // text fields from previewing, editing, or generating normally. The
      // bad field simply falls back to "no image", exactly like a blank CSV
      // cell would.
      // sku2ImageRaw/sku3ImageRaw only exist on Shopee Live Flash Sale rows
      // (see createShopeeLiveFsRowsFromCsv) — undefined on every other
      // template's rows, so those two are skipped entirely for them.
      const [brandLogo, skuImage, sku2Image, sku3Image] = await Promise.all([
        resolveBulkImageField(row.brandLogoRaw),
        resolveBulkImageField(row.skuImageRaw),
        row.sku2ImageRaw !== undefined ? resolveBulkImageField(row.sku2ImageRaw) : Promise.resolve(null),
        row.sku3ImageRaw !== undefined ? resolveBulkImageField(row.sku3ImageRaw) : Promise.resolve(null),
      ]);

      row.brandLogoUrl = brandLogo.url;
      row.originalBrandLogoUrl = brandLogo.url;
      row.brandLogoLabel = row.brandLogoRaw ? imageLabelFromSource(row.brandLogoRaw) : "";
      row.skuImageUrl = skuImage.url;
      row.originalSkuImageUrl = skuImage.url;
      row.skuImageLabel = row.skuImageRaw ? imageLabelFromSource(row.skuImageRaw) : "";
      if (sku2Image) {
        row.sku2ImageUrl = sku2Image.url;
        row.originalSku2ImageUrl = sku2Image.url;
        row.sku2ImageLabel = row.sku2ImageRaw ? imageLabelFromSource(row.sku2ImageRaw) : "";
      }
      if (sku3Image) {
        row.sku3ImageUrl = sku3Image.url;
        row.originalSku3ImageUrl = sku3Image.url;
        row.sku3ImageLabel = row.sku3ImageRaw ? imageLabelFromSource(row.sku3ImageRaw) : "";
      }

      // Which field(s) failed, in plain-English labels for the row status —
      // used by enterRowEditing/generateBulk to warn without blocking.
      const failedImageFields = [];
      if (brandLogo.failed) failedImageFields.push("Brand Logo");
      if (skuImage.failed) failedImageFields.push(sku2Image ? "SKU 1 Image" : "SKU Image");
      if (sku2Image?.failed) failedImageFields.push("SKU 2 Image");
      if (sku3Image?.failed) failedImageFields.push("SKU 3 Image");
      row.failedImageFields = failedImageFields;
      row.imagesFailed = failedImageFields.length > 0;

      // Auto KV Color: the row's KV Color starts as a copy of whatever the
      // sidebar had at CSV-upload time (see createBulkRowsFromCsv), but the
      // very first time a row resolves its own brand logo, that generic
      // default is replaced with the logo's own dominant color instead — so
      // each brand automatically gets its own on-brand KV Color rather than
      // sharing one flat default across every row. This only ever runs once
      // per row (resolution is cached), so it can never clobber a color the
      // user picked by hand afterward via Preview & edit.
      if (row.brandLogoUrl) {
        const dominantColor = await extractDominantLogoColor(row.brandLogoUrl);
        if (dominantColor) row.kvColor = dominantColor;
      }

      row.resolved = true;
      return row;
    } catch (error) {
      // Only reachable for a genuinely unexpected failure now (e.g. the
      // dominant-color extraction itself throwing) — a bad image link/hash
      // is already handled per-field above and never reaches here.
      console.error("Bulk row resolution failed unexpectedly", row, error);
      throw error;
    } finally {
      row.resolving = null;
    }
  })();

  return row.resolving;
}

// Releases any blob URLs a row is holding onto. Call this when a row is
// removed or the whole CSV is replaced — not after every generate — since
// rows now cache their resolved images across preview + generate.
function releaseBulkRowImages(row) {
  const urls = new Set([
    row.brandLogoUrl,
    row.originalBrandLogoUrl,
    row.skuImageUrl,
    row.originalSkuImageUrl,
    row.sku2ImageUrl,
    row.originalSku2ImageUrl,
    row.sku3ImageUrl,
    row.originalSku3ImageUrl,
    row.kvImageUrl,
  ]);
  urls.forEach((url) => {
    if (url?.startsWith("blob:")) {
      imageCache.delete(url);
      URL.revokeObjectURL(url);
    }
  });
}

async function resolveBulkImage(rawValue) {
  const candidates = getImageCandidates(rawValue);
  if (!candidates.length) return "";

  let lastError = null;
  for (const candidate of candidates) {
    try {
      return await fetchImageObjectUrl(candidate);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Image could not be loaded.");
}

function setBulkRowStatus(row, label, kind) {
  row.statusLabel = label;
  row.status = kind;
  const statusEl = els.bulkRows.querySelector(`[data-row-status="${row.id}"]`);
  if (!statusEl) return;
  statusEl.textContent = label;
  statusEl.classList.toggle("is-done", kind === "done");
  statusEl.classList.toggle("is-error", kind === "error");
}

function renderBulkSummary() {
  const totalAssets = bulkState.rows.reduce((sum, row) => sum + row.outputs.size, 0);
  els.bulkSummary.textContent = bulkState.rows.length
    ? `${bulkState.rows.length} row${bulkState.rows.length === 1 ? "" : "s"} × mixed outputs → ${totalAssets} asset${totalAssets === 1 ? "" : "s"}`
    : "";
  els.bulkGenerateButton.disabled = !bulkState.rows.length || totalAssets === 0;
  if (els.bulkRemoveBgAllButton && !bulkRemoveBgAllRunning) {
    els.bulkRemoveBgAllButton.disabled = bulkSkuImageJobs().length === 0;
  }
}

// Editor-only display label — the CSV's Brand Name column when present,
// otherwise the generic "Row N" fallback. Used for the bulk row list title
// and the "Editing ..." banner only; never drawn onto any banner output.
function bulkRowLabel(row, index) {
  return row.brandNameRaw || `Row ${index + 1}`;
}

function createBulkRowElement(row, index) {
  const el = document.createElement("div");
  el.className = "bulk-row";
  el.dataset.rowId = row.id;
  const isActive = activeRow === row;
  el.classList.toggle("is-editing", isActive);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "bulk-row-remove";
  remove.setAttribute("aria-label", `Remove row ${index + 1}`);
  remove.textContent = "×";
  remove.addEventListener("click", () => {
    if (activeRow === row) exitRowEditing();
    releaseBulkRowImages(row);
    bulkState.rows = bulkState.rows.filter((candidate) => candidate.id !== row.id);
    renderBulkRows();
  });

  const main = document.createElement("div");
  main.className = "bulk-row-main";
  const title = document.createElement("div");
  title.className = "bulk-row-title";
  title.textContent = bulkRowLabel(row, index);
  const ksp = document.createElement("div");
  ksp.className = "bulk-row-ksp";
  ksp.textContent = isShopeeLiveFsTemplate(row.template)
    ? row.skuName1 || "(no product name)"
    : row.kspRaw || "(no KSP text)";
  main.append(title, ksp);

  const rowAllowedOutputs = allowedOutputsForTemplate(row.template);

  const outputsRow = document.createElement("div");
  outputsRow.className = "chip-row bulk-row-outputs";
  BULK_OUTPUT_IDS.forEach((outputId) => {
    const isAllowed = !rowAllowedOutputs || rowAllowedOutputs.has(outputId);
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip-button sm";
    chip.dataset.output = outputId;
    chip.textContent = outputMeta[outputId].title;
    chip.disabled = !isAllowed;
    chip.classList.toggle("is-active", isAllowed && row.outputs.has(outputId));
    chip.addEventListener("click", () => {
      if (row.outputs.has(outputId)) row.outputs.delete(outputId);
      else row.outputs.add(outputId);
      chip.classList.toggle("is-active", row.outputs.has(outputId));
      renderBulkSummary();
      if (activeRow === row) {
        syncOutputButtons();
        renderPreviews();
      }
    });
    outputsRow.append(chip);
  });

  const status = document.createElement("span");
  status.className = "bulk-row-status";
  status.textContent = row.statusLabel;
  status.dataset.rowStatus = row.id;

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "bulk-row-toggle";
  toggle.textContent = isActive ? "Editing…" : "Preview & edit";
  toggle.setAttribute("aria-pressed", String(isActive));
  toggle.addEventListener("click", () => {
    if (isActive) exitRowEditing();
    else enterRowEditing(row);
  });

  el.append(remove, main, outputsRow, status, toggle);
  return el;
}

// Makes a bulk row the thing the main editor (sidebar fields + preview
// stage) is currently pointed at, reusing that exact same UI instead of a
// separate/simplified editor. Resolves the row's images first (cached after
// the first time), then hands the shared render pipeline the row instead
// of `state`.
async function enterRowEditing(row) {
  els.bulkRows.querySelectorAll(".bulk-row-toggle").forEach((button) => {
    button.disabled = true;
  });
  setStatus("Loading row images...");

  try {
    await ensureBulkRowResolved(row);
  } catch (error) {
    // Only reachable for a genuinely unexpected failure now — a bad
    // image hash/link on its own is resolved per-field inside
    // ensureBulkRowResolved and never rejects here, so it no longer blocks
    // opening the row at all (see row.imagesFailed below instead).
    setBulkRowStatus(row, "Failed to load row", "error");
    setStatus("Row load failed");
    window.setTimeout(() => setStatus("Ready"), 2200);
    els.bulkRows.querySelectorAll(".bulk-row-toggle").forEach((button) => {
      button.disabled = false;
    });
    return;
  }

  // A bad image link/hash in one field is a warning, not a blocker — the
  // row still opens with every other correct image and text field intact;
  // that one field just previews as empty, same as a blank CSV cell.
  if (row.imagesFailed) {
    setBulkRowStatus(row, `${row.failedImageFields.join(", ")} could not be loaded`, "error");
  }

  activeRow = row;
  syncEditorFieldsFromContext();
  updateUndoRedoButtons();
  renderStageBanner();
  await renderPreviews();
  renderBulkRows();
}

function exitRowEditing() {
  activeRow = null;
  syncEditorFieldsFromContext();
  updateUndoRedoButtons();
  renderStageBanner();
  renderPreviews();
  renderBulkRows();
}

function renderStageBanner() {
  if (!els.stageBanner) return;
  if (!activeRow) {
    els.stageBanner.hidden = true;
    return;
  }
  const rowIndex = bulkState.rows.indexOf(activeRow);
  const subtitle = isShopeeLiveFsTemplate(activeRow.template) ? activeRow.skuName1 : activeRow.kspRaw;
  els.stageBannerText.textContent =
    rowIndex !== -1
      ? `Editing ${bulkRowLabel(activeRow, rowIndex)}${subtitle ? ` — ${subtitle}` : ""}`
      : "Editing bulk row";
  els.stageBanner.hidden = false;
}

function syncBulkRowsPager() {
  if (!els.bulkRowsPager) return;
  const totalRows = bulkState.rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / BULK_ROWS_PAGE_SIZE));
  bulkState.page = clamp(bulkState.page, 0, totalPages - 1);

  const start = totalRows ? bulkState.page * BULK_ROWS_PAGE_SIZE + 1 : 0;
  const end = Math.min(totalRows, (bulkState.page + 1) * BULK_ROWS_PAGE_SIZE);
  els.bulkRowsPager.hidden = totalRows <= BULK_ROWS_PAGE_SIZE;
  if (els.bulkRowsPageLabel) els.bulkRowsPageLabel.textContent = `${start}-${end} of ${totalRows}`;
  if (els.bulkRowsPrevButton) els.bulkRowsPrevButton.disabled = bulkState.page <= 0;
  if (els.bulkRowsNextButton) els.bulkRowsNextButton.disabled = bulkState.page >= totalPages - 1;
}

function renderBulkRows() {
  els.bulkRows.innerHTML = "";
  const totalPages = Math.max(1, Math.ceil(bulkState.rows.length / BULK_ROWS_PAGE_SIZE));
  bulkState.page = clamp(bulkState.page, 0, totalPages - 1);
  const start = bulkState.page * BULK_ROWS_PAGE_SIZE;
  const visibleRows = bulkState.rows.slice(start, start + BULK_ROWS_PAGE_SIZE);
  visibleRows.forEach((row, index) => {
    const rowIndex = start + index;
    els.bulkRows.append(createBulkRowElement(row, rowIndex));
  });
  els.bulkPanel.classList.toggle("has-rows", bulkState.rows.length > 0);
  syncBulkRowsPager();
  renderBulkSummary();
}

async function generateBulk() {
  const rowsToRun = bulkState.rows.filter((row) => row.outputs.size > 0);
  if (!rowsToRun.length) {
    setStatus("Add outputs to at least one row");
    window.setTimeout(() => setStatus("Ready"), 1800);
    return;
  }

  els.bulkGenerateButton.disabled = true;
  const originalLabel = els.bulkGenerateButton.textContent;
  els.bulkGenerateButton.textContent = "Generating...";

  // Each row is already its own self-contained editing context (brand
  // logo, SKU image, KSP, positions, zooms), so generation just calls the
  // shared export pipeline once per row/output — no borrowing or restoring
  // the single-image editor's `state`, and no disturbance to its preview.
  const files = [];
  let failed = 0;

  try {
    for (let index = 0; index < rowsToRun.length; index += 1) {
      const row = rowsToRun[index];
      setStatus(`Bulk row ${index + 1} of ${rowsToRun.length}`);

      try {
        await ensureBulkRowResolved(row);
      } catch (error) {
        // Only reachable for a genuinely unexpected failure now — a bad
        // image hash/link resolves per-field inside ensureBulkRowResolved
        // and never rejects here, so the row still generates below using
        // whatever it does have (see row.imagesFailed after the export
        // loop instead of skipping the row outright).
        setBulkRowStatus(row, "Row failed", "error");
        failed += 1;
        continue;
      }

      setBulkRowStatus(row, "Generating...", "pending");

      // All rows land in one flat ZIP folder — prefix the filename (instead
      // of nesting a row-N/ subfolder) so files stay unique across rows.
      const rowPrefix = `row-${bulkState.rows.indexOf(row) + 1}`;
      let rowFailed = false;
      for (const outputId of row.outputs) {
        try {
          const file = await createExportFile(outputId, row);
          files.push({ ...file, name: `${rowPrefix}-${file.name}` });
        } catch (error) {
          console.error("Bulk export failed", row, outputId, error);
          rowFailed = true;
        }
      }

      if (rowFailed) {
        failed += 1;
        setBulkRowStatus(row, "Partial failure", "error");
      } else if (row.imagesFailed) {
        // Outputs still generated fine — a missing image (bad hash/link)
        // just rendered as empty for that field, same as a blank CSV cell.
        // Not counted in the failed tally since files really were produced.
        setBulkRowStatus(row, `Done — ${row.failedImageFields.join(", ")} missing`, "done");
      } else {
        setBulkRowStatus(row, "Done", "done");
      }
    }

    if (!files.length) throw new Error("No assets were generated.");

    const zip = await createZip(files);
    downloadBlob(zip, "bulk-campaign-assets.zip");
    setStatus(failed ? `Done — ${failed} row(s) failed` : "Bulk generate done");
    window.setTimeout(() => setStatus("Ready"), 2400);
  } catch (error) {
    console.error("Bulk generate failed", error);
    setStatus("Bulk generate failed");
    window.setTimeout(() => setStatus("Ready"), 2400);
  } finally {
    els.bulkGenerateButton.disabled = false;
    els.bulkGenerateButton.textContent = originalLabel;
    renderBulkSummary();
  }
}

els.templateSelect.addEventListener("change", (event) => {
  const context = editingContext();
  commitHistoryStart(context);
  context.template = event.target.value;
  if (isShopeeLiveFsTemplate(context.template)) ensureShopeeLiveFsFields(context);
  syncKvColorAvailability(context);
  syncOutputAvailability(context);
  syncShopeeLiveFsVisibility(context);
  syncRemoveBgAvailability(context);
  syncBulkCsvHint();
  commitHistoryEnd(context);
  renderPreviews();
  if (activeRow) renderBulkRows();
});

els.brandLogoInput.addEventListener("change", () => {
  commitHistoryStart(editingContext());
  readFile(els.brandLogoInput, "brandLogoUrl", "brandLogoLabel", els.brandFileName);
  commitHistoryEnd(editingContext());
});

els.floatingLogoRatio?.addEventListener("change", () => {
  const context = editingContext();
  commitHistoryStart(context);
  context.floatingLogoRatio = els.floatingLogoRatio.value;
  commitHistoryEnd(context);
  renderPreviews();
});

els.floatingLogoZoom?.addEventListener("input", () => {
  const context = editingContext();
  setLogoZoom("floating-icon", Number(els.floatingLogoZoom.value) / 100, context);
  els.floatingLogoZoomValue.value = `${els.floatingLogoZoom.value}%`;
  els.floatingLogoZoomValue.textContent = `${els.floatingLogoZoom.value}%`;
  renderPreviews();
});
els.floatingLogoZoom?.addEventListener("pointerdown", () => commitHistoryStart(editingContext()));
els.floatingLogoZoom?.addEventListener("change", () => commitHistoryEnd(editingContext()));

els.floatingDesignZoom?.addEventListener("input", () => {
  const context = editingContext();
  setSkuZoom("floating-icon", Number(els.floatingDesignZoom.value) / 100, context);
  els.floatingDesignZoomValue.value = `${els.floatingDesignZoom.value}%`;
  els.floatingDesignZoomValue.textContent = `${els.floatingDesignZoom.value}%`;
  renderPreviews();
});
els.floatingDesignZoom?.addEventListener("pointerdown", () => commitHistoryStart(editingContext()));
els.floatingDesignZoom?.addEventListener("change", () => commitHistoryEnd(editingContext()));

els.kvModeToggle?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-kv-mode]");
  if (!button || button.classList.contains("is-active")) return;
  const context = editingContext();
  commitHistoryStart(context);
  context.kvMode = button.dataset.kvMode;
  if (context.kvMode !== "image") resetKvActiveLayers(context);
  commitHistoryEnd(context);
  syncEditorFieldsFromContext();
  renderPreviews();
});

els.kvImageInput?.addEventListener("change", () => {
  if (!els.kvImageInput.files?.length) return;
  const context = editingContext();
  commitHistoryStart(context);
  // A freshly uploaded KV image starts centered at default zoom on every
  // output, same as a freshly uploaded SKU photo resets its own positions.
  context.kvImagePositions = {};
  context.kvImageZooms = {};
  readFile(els.kvImageInput, "kvImageUrl", "kvImageLabel", els.kvImageFileName);
  commitHistoryEnd(context);
});

els.logoContainerToggle.addEventListener("change", (event) => {
  const context = editingContext();
  commitHistoryStart(context);
  context.hideLogoContainer = event.target.checked;
  commitHistoryEnd(context);
  renderPreviews();
});

els.shopeeLogoToggle.addEventListener("change", (event) => {
  const context = editingContext();
  commitHistoryStart(context);
  context.useOrangeShopeeLogo = event.target.checked;
  commitHistoryEnd(context);
  renderPreviews();
});

els.shopeeMallLogoToggle?.addEventListener("change", (event) => {
  const context = editingContext();
  commitHistoryStart(context);
  // Checked = tag shown, so the internal flag is the inverse.
  context.hideShopeeMallTag = !event.target.checked;
  commitHistoryEnd(context);
  renderPreviews();
});

els.skuImageInput.addEventListener("change", () => {
  const context = editingContext();
  commitHistoryStart(context);
  readFile(els.skuImageInput, "skuImageUrl", "skuImageLabel", els.skuFileName);
  // A manually uploaded photo replaces any product-URL gallery that was
  // showing — same "one path wins" rule as switching back to a direct
  // hash/link in loadSkuImageFromInput.
  if (context.skuImageCandidates?.length) {
    context.skuImageCandidates = [];
    renderSkuImageGallery(context);
  }
  commitHistoryEnd(context);
});

els.skuLink.addEventListener("input", (event) => {
  state.skuLink = event.target.value;
});

els.skuLink.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  loadSkuImageFromInput();
});

els.loadSkuLinkButton.addEventListener("click", loadSkuImageFromInput);
els.removeBgButton?.addEventListener("click", () => removeBackgroundFromImage("sku"));
els.removeLogoBgButton?.addEventListener("click", () => removeBackgroundFromImage("logo"));
els.removeBg2Button?.addEventListener("click", () => removeBackgroundFromImage("sku2"));
els.removeBg3Button?.addEventListener("click", () => removeBackgroundFromImage("sku3"));

els.sku2ImageInput?.addEventListener("change", () => {
  commitHistoryStart(editingContext());
  readFile(els.sku2ImageInput, "sku2ImageUrl", "sku2ImageLabel", els.sku2FileName);
  commitHistoryEnd(editingContext());
});
els.sku3ImageInput?.addEventListener("change", () => {
  commitHistoryStart(editingContext());
  readFile(els.sku3ImageInput, "sku3ImageUrl", "sku3ImageLabel", els.sku3FileName);
  commitHistoryEnd(editingContext());
});

els.editSkuButton?.addEventListener("click", () => openEditSkuModal("sku"));
els.editLogoButton?.addEventListener("click", () => openEditSkuModal("logo"));
els.editSku2Button?.addEventListener("click", () => openEditSkuModal("sku2"));
els.editSku3Button?.addEventListener("click", () => openEditSkuModal("sku3"));
els.editSkuCloseButton?.addEventListener("click", closeEditSkuModal);
els.editSkuCancelButton?.addEventListener("click", closeEditSkuModal);
els.editSkuSaveButton?.addEventListener("click", saveEditSkuCanvas);
els.editSkuResetButton?.addEventListener("click", () => {
  if (editSkuState) resetEditSkuCanvas();
});
els.editSkuEraseButton?.addEventListener("click", () => setEditSkuTool("erase"));
els.editSkuRestoreButton?.addEventListener("click", () => setEditSkuTool("restore"));
els.editSkuBackdropButtons?.forEach((button) => {
  button.addEventListener("click", () => setEditSkuBackdrop(button.dataset.backdrop));
});
els.editSkuBrushSize?.addEventListener("input", (event) => {
  if (!editSkuState) return;
  editSkuState.brushSize = Number(event.target.value);
  // Resize the cursor ring immediately even if the pointer hasn't moved —
  // recompute from its current on-screen position rather than requiring a
  // mousemove first.
  if (els.editSkuBrushCursor && els.editSkuBrushCursor.style.display === "block") {
    const canvas = editSkuState.canvas;
    const scale = canvas.getBoundingClientRect().width / canvas.width;
    const diameter = editSkuState.brushSize * scale;
    els.editSkuBrushCursor.style.width = `${diameter}px`;
    els.editSkuBrushCursor.style.height = `${diameter}px`;
  }
});

if (els.editSkuCanvas) {
  els.editSkuCanvas.addEventListener("pointerdown", (event) => {
    if (!editSkuState || event.button !== 0) return;
    event.preventDefault();
    els.editSkuCanvas.setPointerCapture(event.pointerId);
    editSkuState.drawing = true;
    editSkuState.pointerId = event.pointerId;
    editSkuState.lastPoint = null;
    editSkuStrokeTo(editSkuPointFromEvent(event));
  });

  els.editSkuCanvas.addEventListener("pointermove", (event) => {
    updateEditSkuBrushCursor(event);
    if (!editSkuState?.drawing || editSkuState.pointerId !== event.pointerId) return;
    event.preventDefault();
    editSkuStrokeTo(editSkuPointFromEvent(event));
  });

  els.editSkuCanvas.addEventListener("pointerenter", updateEditSkuBrushCursor);
  els.editSkuCanvas.addEventListener("pointerleave", hideEditSkuBrushCursor);

  els.editSkuCanvas.addEventListener("pointerup", endEditSkuStroke);
  els.editSkuCanvas.addEventListener("pointercancel", endEditSkuStroke);
  els.editSkuCanvas.addEventListener("lostpointercapture", endEditSkuStroke);
}

// Escape closes the modal, same as clicking Cancel — no partial-close state
// to worry about since nothing is written back until Save.
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && editSkuState) closeEditSkuModal();
});

function backgroundSearchText(background) {
  return [background.id, background.label, background.collection, ...(background.keywords || [])]
    .join(" ")
    .toLowerCase();
}

function getFilteredBackgrounds() {
  const query = backgroundPickerState.query.trim().toLowerCase();
  const terms = query ? query.split(/\s+/).filter(Boolean) : [];
  const collection = backgroundPickerState.collection;

  return SKU_BACKGROUNDS.map((background, index) => ({ background, index })).filter(({ background }) => {
    const matchesCollection =
      !collection || collection === BACKGROUND_COLLECTION_ALL || background.collection === collection;
    if (!matchesCollection) return false;
    if (!terms.length) return true;
    const searchable = backgroundSearchText(background);
    return terms.every((term) => searchable.includes(term));
  });
}

function backgroundLabelFromFile(fileName) {
  const baseName = (fileName || "")
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();
  const words = baseName ? baseName.split(/\s+/).slice(0, 2) : [];
  const label = words
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`)
    .join(" ");
  return label || `Custom ${customBackgroundSeq}`;
}

function createBackgroundUploadTile() {
  const tile = document.createElement("button");
  const plus = document.createElement("span");
  const label = document.createElement("span");

  tile.type = "button";
  tile.className = "bg-thumb is-upload";
  tile.setAttribute("aria-label", "Upload SKU background");

  plus.className = "bg-thumb-plus";
  plus.textContent = "+";
  label.className = "bg-thumb-label";
  label.textContent = "Upload";

  tile.append(plus, label);
  tile.addEventListener("click", () => els.bgUploadInput?.click());
  return tile;
}

function createBackgroundTile(index, background = null) {
  const tile = document.createElement("button");
  const label = document.createElement("span");
  const isNone = index === -1;

  tile.type = "button";
  tile.className = isNone ? "bg-thumb is-none" : "bg-thumb";
  tile.dataset.bgIndex = String(index);
  tile.setAttribute("role", "option");
  tile.setAttribute("aria-label", isNone ? "No background scene" : background.label);

  label.className = "bg-thumb-label";
  label.textContent = isNone ? "None" : background.label;
  tile.append(label);

  if (background) tile.style.backgroundImage = `url("${background.src}")`;

  tile.addEventListener("click", () => {
    const context = editingContext();
    commitHistoryStart(context);
    chooseSkuBackground(index, context);
    commitHistoryEnd(context);
    renderBackgroundPicker();
    renderPreviews();
  });

  return tile;
}

function syncBackgroundPager(matches, totalPages) {
  if (els.bgPrevButton) els.bgPrevButton.disabled = backgroundPickerState.page <= 0;
  if (els.bgNextButton) els.bgNextButton.disabled = backgroundPickerState.page >= totalPages - 1;
  if (els.bgResultsLabel) {
    const start = matches.length ? backgroundPickerState.page * BACKGROUND_PAGE_SIZE + 1 : 0;
    const end = Math.min(matches.length, (backgroundPickerState.page + 1) * BACKGROUND_PAGE_SIZE);
    els.bgResultsLabel.textContent = matches.length
      ? `${start}-${end} of ${matches.length}`
      : "No matches";
  }
}

function renderBackgroundThumbGrid() {
  if (!els.bgThumbGrid) return;
  const context = editingContext();
  const currentIndex = context.skuBackgroundIndex;
  const matches = getFilteredBackgrounds();
  const totalPages = Math.max(1, Math.ceil(matches.length / BACKGROUND_PAGE_SIZE));
  const fragment = document.createDocumentFragment();
  const noneTile = createBackgroundTile(-1);
  const uploadTile = createBackgroundUploadTile();

  backgroundPickerState.page = clamp(backgroundPickerState.page, 0, totalPages - 1);
  const start = backgroundPickerState.page * BACKGROUND_PAGE_SIZE;
  const visibleMatches = matches.slice(start, start + BACKGROUND_PAGE_SIZE);

  noneTile.classList.toggle("is-selected", currentIndex === -1);
  noneTile.setAttribute("aria-selected", String(currentIndex === -1));
  fragment.append(noneTile, uploadTile);

  visibleMatches.forEach(({ background, index }) => {
    const tile = createBackgroundTile(index, background);
    const isSelected = index === currentIndex;
    tile.classList.toggle("is-selected", isSelected);
    tile.setAttribute("aria-selected", String(isSelected));
    fragment.append(tile);
  });

  if (!visibleMatches.length) {
    const empty = document.createElement("div");
    empty.className = "bg-empty";
    empty.textContent = "No matches";
    fragment.append(empty);
  }

  els.bgThumbGrid.replaceChildren(fragment);
  syncBackgroundPager(matches, totalPages);
}

function renderBackgroundPicker() {
  renderBackgroundThumbGrid();
  syncSkuBackgroundColorAvailability(editingContext());
}

function populateBackgroundCollectionSelect() {
  if (!els.bgCollectionSelect) return;
  const collections = [...new Set(SKU_BACKGROUNDS.map((background) => background.collection))].sort(
    (a, b) => {
      const orderA = BACKGROUND_COLLECTION_ORDER.indexOf(a);
      const orderB = BACKGROUND_COLLECTION_ORDER.indexOf(b);
      if (orderA === -1 && orderB === -1) return a.localeCompare(b);
      if (orderA === -1) return 1;
      if (orderB === -1) return -1;
      return orderA - orderB;
    },
  );
  const currentValue = backgroundPickerState.collection || els.bgCollectionSelect.value || BACKGROUND_COLLECTION_ALL;
  const options = [
    { value: BACKGROUND_COLLECTION_ALL, label: "All" },
    ...collections.map((collection) => ({ value: collection, label: collection })),
  ];

  els.bgCollectionSelect.replaceChildren(
    ...options.map((option) => {
      const node = document.createElement("option");
      node.value = option.value;
      node.textContent = option.label;
      return node;
    }),
  );

  els.bgCollectionSelect.value = options.some((option) => option.value === currentValue)
    ? currentValue
    : BACKGROUND_COLLECTION_ALL;
  backgroundPickerState.collection = els.bgCollectionSelect.value;
}

function addUploadedSkuBackground(file) {
  if (!file || !file.type.startsWith("image/")) {
    setStatus("Choose an image file");
    window.setTimeout(() => setStatus("Ready"), 1800);
    return;
  }

  customBackgroundSeq += 1;
  const objectUrl = URL.createObjectURL(file);
  customBackgroundObjectUrls.add(objectUrl);
  const label = backgroundLabelFromFile(file.name);
  const background = {
    id: `custom-${customBackgroundSeq}`,
    label,
    collection: BACKGROUND_CUSTOM_COLLECTION,
    keywords: ["custom", "upload", file.name.toLowerCase(), ...label.toLowerCase().split(/\s+/)],
    src: objectUrl,
  };
  const backgroundIndex = SKU_BACKGROUNDS.push(background) - 1;

  backgroundPickerState.query = "";
  backgroundPickerState.collection = BACKGROUND_COLLECTION_ALL;
  if (els.bgSearchInput) els.bgSearchInput.value = "";
  populateBackgroundCollectionSelect();
  if (els.bgCollectionSelect) els.bgCollectionSelect.value = BACKGROUND_COLLECTION_ALL;

  const matches = getFilteredBackgrounds();
  const matchIndex = matches.findIndex(({ index }) => index === backgroundIndex);
  backgroundPickerState.page = matchIndex === -1 ? 0 : Math.floor(matchIndex / BACKGROUND_PAGE_SIZE);

  const context = editingContext();
  commitHistoryStart(context);
  chooseSkuBackground(backgroundIndex, context);
  commitHistoryEnd(context);
  renderBackgroundPicker();
  renderPreviews();
  setStatus("Background uploaded");
  window.setTimeout(() => setStatus("Ready"), 1800);
}

els.bgSearchInput?.addEventListener("input", (event) => {
  backgroundPickerState.query = event.target.value || "";
  backgroundPickerState.page = 0;
  renderBackgroundPicker();
});

els.bgCollectionSelect?.addEventListener("change", (event) => {
  backgroundPickerState.collection = event.target.value || BACKGROUND_COLLECTION_ALL;
  backgroundPickerState.page = 0;
  renderBackgroundPicker();
});

els.bgPrevButton?.addEventListener("click", () => {
  backgroundPickerState.page = Math.max(0, backgroundPickerState.page - 1);
  renderBackgroundPicker();
});

els.bgNextButton?.addEventListener("click", () => {
  backgroundPickerState.page += 1;
  renderBackgroundPicker();
});

els.bgUploadInput?.addEventListener("change", () => {
  const [file] = els.bgUploadInput.files;
  addUploadedSkuBackground(file);
  els.bgUploadInput.value = "";
});

// The flat color only shows through when no scene is selected — a scene
// covers the whole product area, so editing the color would have no visible
// effect while one is active. Greyed out (not hidden) so it's clear why.
function syncSkuBackgroundColorAvailability(context) {
  const disabled = hasSkuBackground(context);
  const controls = els.skuBgColorRow?.querySelector(".inline-color-control");
  controls?.classList.toggle("is-disabled", disabled);
  // pointer-events:none (from .is-disabled) only blocks mouse clicks — a
  // keyboard user could still Tab in and edit these while a scene is
  // selected, so disable the actual inputs too (matches the KV color
  // picker's pattern in syncKvColorAvailability).
  [els.skuBgColorInput, els.skuBgColorHex].forEach((input) => {
    if (input) input.disabled = disabled;
  });

  if (els.skuBgColorHint) {
    els.skuBgColorHint.textContent = disabled
      ? `Not used while "${getSkuBackgroundLabel(context)}" is selected — that scene covers the whole product area.`
      : "Fills the product area behind a transparent SKU photo when no background scene is selected.";
  }

  const colorValue = context.skuBackgroundColor || "#FFF3F6";
  if (els.skuBgColorInput) els.skuBgColorInput.value = colorValue;
  if (els.skuBgColorHex) els.skuBgColorHex.value = colorValue.toUpperCase();
  if (els.skuBgColorDot) els.skuBgColorDot.style.background = colorValue;
}

// Continuous-value fields (text/color/range) commit one undo step per
// "editing session" — opened on focus, closed on change (fires once on
// blur for text/color inputs, once on release for range inputs) — rather
// than once per keystroke or per drag tick.
function wrapHistorySession(input) {
  if (!input) return;
  input.addEventListener("focus", () => commitHistoryStart(editingContext()));
  input.addEventListener("change", () => commitHistoryEnd(editingContext()));
}

els.skuBgColorInput?.addEventListener("input", (event) => {
  setSkuBackgroundColor(event.target.value);
});
wrapHistorySession(els.skuBgColorInput);

els.skuBgColorHex?.addEventListener("input", (event) => {
  const value = event.target.value.startsWith("#")
    ? event.target.value
    : `#${event.target.value}`;
  if (isHex(value)) setSkuBackgroundColor(value);
});
wrapHistorySession(els.skuBgColorHex);

els.kspColorInput.addEventListener("input", (event) => {
  setKspColor(event.target.value);
});
wrapHistorySession(els.kspColorInput);

els.kspColorHex.addEventListener("input", (event) => {
  const value = event.target.value.startsWith("#")
    ? event.target.value
    : `#${event.target.value}`;
  if (isHex(value)) setKspColor(value);
});
wrapHistorySession(els.kspColorHex);

els.nativeColor.addEventListener("input", (event) => {
  setColor(event.target.value);
});
wrapHistorySession(els.nativeColor);

els.hexInput.addEventListener("input", (event) => {
  const value = event.target.value.startsWith("#")
    ? event.target.value
    : `#${event.target.value}`;
  if (isHex(value)) setColor(value);
});
wrapHistorySession(els.hexInput);

els.hueRange.addEventListener("input", (event) => {
  const context = editingContext();
  context.hue = Number(event.target.value);
  const nextColor = rgbToHex(hsvToRgb(context.hue, context.saturation, context.value));
  setColor(nextColor, false);
});
els.hueRange.addEventListener("pointerdown", () => commitHistoryStart(editingContext()));
els.hueRange.addEventListener("change", () => commitHistoryEnd(editingContext()));

els.colorCanvas.addEventListener("pointerdown", (event) => {
  els.colorCanvas.setPointerCapture(event.pointerId);
  commitHistoryStart(editingContext());
  updateColorFromCanvas(event);
});

els.colorCanvas.addEventListener("pointermove", (event) => {
  if (event.buttons !== 1) return;
  updateColorFromCanvas(event);
});

["pointerup", "pointercancel", "lostpointercapture"].forEach((eventName) => {
  els.colorCanvas.addEventListener(eventName, () => commitHistoryEnd(editingContext()));
});

window.addEventListener("resize", drawColorCanvas);

els.outputButtons.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-output]");
  if (!button) return;

  const context = editingContext();
  commitHistoryStart(context);
  const { output } = button.dataset;
  const outputs = context.outputs;
  if (outputs.has(output)) outputs.delete(output);
  else outputs.add(output);
  commitHistoryEnd(context);

  syncOutputButtons();
  renderPreviews();
  if (activeRow) renderBulkRows();
});

els.downloadAllButton.addEventListener("click", downloadAll);

els.undoButton?.addEventListener("click", undo);
els.redoButton?.addEventListener("click", redo);

document.addEventListener("keydown", (event) => {
  // Let native undo run inside the Touch Up modal or a plain text field —
  // this app-wide shortcut is only for the sidebar/preview editing state.
  if (editSkuState) return;
  const tag = document.activeElement?.tagName;
  const inputType = document.activeElement?.type;
  if (tag === "TEXTAREA" || (tag === "INPUT" && ["search", "text", "url"].includes(inputType))) return;

  const isUndo = (event.metaKey || event.ctrlKey) && !event.shiftKey && event.key.toLowerCase() === "z";
  const isRedo =
    (event.metaKey || event.ctrlKey) &&
    ((event.shiftKey && event.key.toLowerCase() === "z") || event.key.toLowerCase() === "y");
  if (isUndo) {
    event.preventDefault();
    undo();
  } else if (isRedo) {
    event.preventDefault();
    redo();
  }
});

els.bulkDefaultOutputs.querySelectorAll("button[data-output]").forEach((button) => {
  button.classList.toggle("is-active", bulkState.defaultOutputs.has(button.dataset.output));
  button.addEventListener("click", () => {
    const { output } = button.dataset;
    if (bulkState.defaultOutputs.has(output)) bulkState.defaultOutputs.delete(output);
    else bulkState.defaultOutputs.add(output);
    button.classList.toggle("is-active", bulkState.defaultOutputs.has(output));
  });
});

els.bulkCsvInput.addEventListener("change", async () => {
  const [file] = els.bulkCsvInput.files;
  if (!file) return;

  try {
    const text = await file.text();
    const newRows = createBulkRowsFromCsv(text);
    if (!newRows.length) {
      setStatus("No rows found in CSV");
      window.setTimeout(() => setStatus("Ready"), 1800);
      return;
    }

    const wasEditingRow = Boolean(activeRow);
    bulkState.rows.forEach(releaseBulkRowImages);
    bulkState.rows = newRows;
    bulkState.page = 0;
    activeRow = null;
    if (wasEditingRow) {
      syncEditorFieldsFromContext();
      updateUndoRedoButtons();
      renderStageBanner();
      renderPreviews();
    }
    els.bulkCsvFileName.textContent = titleCaseFileName(file.name);
    els.bulkPanel.open = true;
    renderBulkRows();
    setStatus(`${newRows.length} row${newRows.length === 1 ? "" : "s"} loaded`);
    window.setTimeout(() => setStatus("Ready"), 1800);
  } catch (error) {
    console.error("CSV read failed", error);
    setStatus("CSV read failed");
    window.setTimeout(() => setStatus("Ready"), 1800);
  } finally {
    els.bulkCsvInput.value = "";
  }
});

els.bulkTemplateButton.addEventListener("click", () => {
  // Bulk generate always follows whichever template is currently selected
  // in the sidebar (see createBulkRowsFromCsv's own branch on
  // isShopeeLiveFsTemplate(state.template)) — so the downloaded brief has to
  // match that same schema, not always the Mall BAU one.
  const isFs = isShopeeLiveFsTemplate(state.template);
  const blob = new Blob([isFs ? SHOPEE_LIVE_FS_CSV_TEMPLATE : BULK_CSV_TEMPLATE], {
    type: "text/csv;charset=utf-8",
  });
  downloadBlob(blob, isFs ? "shopee-live-fs-brief-template.csv" : "bulk-generate-template.csv");
});

els.bulkGenerateButton.addEventListener("click", generateBulk);
els.bulkRemoveBgAllButton?.addEventListener("click", removeBackgroundFromAllBulkRows);

els.bulkRowsPrevButton?.addEventListener("click", () => {
  bulkState.page = Math.max(0, bulkState.page - 1);
  renderBulkRows();
});

els.bulkRowsNextButton?.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(bulkState.rows.length / BULK_ROWS_PAGE_SIZE));
  bulkState.page = Math.min(totalPages - 1, bulkState.page + 1);
  renderBulkRows();
});

els.stageBannerExit?.addEventListener("click", exitRowEditing);

window.addEventListener("beforeunload", () => {
  customBackgroundObjectUrls.forEach((url) => URL.revokeObjectURL(url));
});

// ---------------------------------------------------------------------------
// Shopee homepage placement preview
// ---------------------------------------------------------------------------
// This deliberately reads the rendered banner canvas, not the source image.
// The right panel therefore mirrors the current editor result, including the
// fixed overlays, crops, image zoom, background preset, and KSP changes.
function initHomepagePreview() {
  const root = document.querySelector("#homepagePreview");
  const phone = document.querySelector(".iphone-frame");
  const popupState = document.querySelector("#homepagePopupState");
  const previous = document.querySelector("#homepagePreviewPrevious");
  const next = document.querySelector("#homepagePreviewNext");
  const expand = document.querySelector("#homepagePreviewExpand");
  const downloadPreview = document.querySelector("#homepagePreviewDownload");
  const modal = document.querySelector("#homepagePreviewModal");
  const modalMount = document.querySelector("#homepagePreviewModalMount");
  if (!root || !phone || !popupState || !previous || !next || !expand || !modal || !modalMount) return;

  const previewState = {
    page: "homepage",
    selected: null,
    blankRenderer: null,
    revision: 0,
    standardSources: new Map(),
  };
  // The placement guide is embedded for both local-file use and deployment.
  // Do not rely on the original guide folder being present in a GitHub build.
  const basePreview = root.querySelector(".homepage-base");
  if (basePreview && window.BrandMaxPreviewAssets?.homepage) {
    basePreview.src = window.BrandMaxPreviewAssets.homepage;
  }
  const asset = (id) => root.querySelector(`[data-home-output="${id}"]`);
  const canvasAsset = (id) => root.querySelector(`[data-home-canvas="${id}"]`);

  function selectedIds() {
    return previewState.selected || editingOutputs();
  }

  function updatePage() {
    const canShowPopup = selectedIds().includes("pop-up-banner");
    if (!canShowPopup) previewState.page = "homepage";
    popupState.hidden = previewState.page !== "popup";
    phone.classList.toggle("is-popup-preview", previewState.page === "popup");
    previous.classList.toggle("is-active", previewState.page === "homepage");
    next.classList.toggle("is-active", previewState.page === "popup");
    next.disabled = !canShowPopup;
  }

  async function syncExpandedPhone() {
    // The expanded panel is a presentation copy of the phone. Refresh that
    // copy after each artwork update so it never stays on an old placement
    // guide snapshot while the smaller right-panel preview has moved on.
    // Canvas pixels are not copied by cloneNode(), so redraw each cloned
    // standard-template canvas after cloning it.
    if (modal.hidden) return;
    const snapshot = phone.cloneNode(true);
    modalMount.replaceChildren(snapshot);
    const sourceScreen = phone.querySelector(".iphone-screen");
    const snapshotScreen = snapshot.querySelector(".iphone-screen");
    if (sourceScreen && snapshotScreen) snapshotScreen.scrollTop = sourceScreen.scrollTop;
    await Promise.all([...snapshot.querySelectorAll("canvas[data-home-canvas]")].map(async (canvas) => {
      if (canvas.hidden) return;
      try {
        await drawPreviewCanvas(canvas.dataset.homeCanvas, canvas);
      } catch (error) {
        console.warn(`Expanded homepage preview could not draw ${canvas.dataset.homeCanvas}`, error);
        canvas.hidden = true;
      }
    }));
  }

  async function sourceFor(id) {
    const isBlank = document.querySelector("#workflowCanvas")?.value === "blank";
    if (isBlank && previewState.blankRenderer) {
      const canvas = await previewState.blankRenderer(id);
      return canvas ? canvas.toDataURL("image/png") : "";
    }
    const capturedSource = previewState.standardSources.get(id);
    if (capturedSource) return capturedSource;
    // The mounted canvas is the exact artwork the user is seeing. Prefer it
    // for homepage mirroring (especially Skinny), then use a full-size render
    // only when that output card is not currently mounted.
    const mountedCanvas = els.previewList?.querySelector(`canvas.asset-canvas[data-output="${id}"]`);
    if (mountedCanvas?.width && mountedCanvas?.height) {
      try {
        return mountedCanvas.toDataURL("image/png");
      } catch (error) {
        console.warn(`Mounted homepage preview could not read ${id}; retrying export render.`, error);
      }
    }
    const canvas = await renderExportCanvas(id, editingContext());
    return canvas.toDataURL("image/png");
  }

  async function drawPreviewCanvas(id, targetCanvas) {
    const isBlank = document.querySelector("#workflowCanvas")?.value === "blank";
    if (isBlank && previewState.blankRenderer) {
      const sourceCanvas = await previewState.blankRenderer(id);
      if (!sourceCanvas) throw new Error(`Blank artwork was not available for ${id}.`);
      targetCanvas.width = sourceCanvas.width;
      targetCanvas.height = sourceCanvas.height;
      const targetContext = targetCanvas.getContext("2d");
      targetContext.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
      // Drawing a local file canvas is allowed for on-screen display even
      // though file:// prevents serialising it to a data URL.
      targetContext.drawImage(sourceCanvas, 0, 0);
      return;
    }
    const previewContext = {
      ...editingContext(),
      previewLocalAssets: window.BrandMaxPreviewLocalAssets || {},
    };
    await drawOutput(id, targetCanvas, { context: previewContext });
  }

  async function refresh() {
    const revision = ++previewState.revision;
    const ids = selectedIds();
    await Promise.all(["banner-card", "skinny-banner", "floating-icon", "pop-up-banner"].map(async (id) => {
      const image = asset(id);
      const outputCanvas = canvasAsset(id);
      if (!image) return;
      if (!ids.includes(id)) {
        image.hidden = true;
        image.removeAttribute("src");
        if (outputCanvas) outputCanvas.hidden = true;
        return;
      }
      // File:// gives every local image a unique origin. Drawing those
      // assets is safe, but serialising the canvas to a data URL is not. For
      // the three homepage formats below, render directly into the preview
      // canvas instead of converting it to an <img> source in both modes.
      if (outputCanvas) {
        image.hidden = true;
        try {
          await drawPreviewCanvas(id, outputCanvas);
          if (revision === previewState.revision) outputCanvas.hidden = false;
        } catch (error) {
          console.warn(`Homepage preview could not draw ${id}`, error);
          outputCanvas.hidden = true;
        }
        return;
      }
      if (outputCanvas) outputCanvas.hidden = true;
      try {
        const src = await sourceFor(id);
        if (revision !== previewState.revision) return;
        image.hidden = !src;
        if (src) image.src = src;
      } catch (error) {
        console.warn(`Homepage preview could not render ${id}`, error);
        image.hidden = true;
      }
    }));
    if (revision === previewState.revision) {
      updatePage();
      void syncExpandedPhone();
    }
  }

  function preview(outputId) {
    previewState.page = outputId === "pop-up-banner" ? "popup" : "homepage";
    refresh();
    root.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  async function openModal() {
    // Resolve the latest mirrored assets before taking the initial expanded
    // snapshot; subsequent edits are handled by syncExpandedPhone().
    await refresh();
    modal.hidden = false;
    await syncExpandedPhone();
  }

  function closeModal() {
    modal.hidden = true;
    modalMount.replaceChildren();
  }

  async function downloadVisiblePhonePreview() {
    try {
      // Compose only the device itself. This preserves transparency outside
      // the phone and mirrors the exact visible scroll position without
      // capturing the surrounding editor UI.
      const [baseImage, navImage] = await Promise.all([
        loadImage(window.BrandMaxPreviewAssets?.homepage || ""),
        loadImage(window.BrandMaxPreviewAssets?.nav || ""),
      ]);
      const frameRect = phone.getBoundingClientRect();
      const screen = phone.querySelector(".iphone-screen");
      const screenRect = screen.getBoundingClientRect();
      const home = screen.querySelector(".shopee-homepage");
      const homeRect = home.getBoundingClientRect();
      const nav = phone.querySelector(".iphone-floating-nav");
      const navRect = nav.getBoundingClientRect();
      const speakerRect = phone.querySelector(".iphone-speaker").getBoundingClientRect();
      const density = 2;
      const capture = document.createElement("canvas");
      capture.width = Math.round(frameRect.width * density);
      capture.height = Math.round(frameRect.height * density);
      const captureContext = capture.getContext("2d");
      const relativeRect = (rect) => ({
        x: (rect.left - frameRect.left) * density,
        y: (rect.top - frameRect.top) * density,
        width: rect.width * density,
        height: rect.height * density,
      });
      const frameBox = { x: 0, y: 0, width: capture.width, height: capture.height };
      captureContext.fillStyle = "#171717";
      roundRect(captureContext, frameBox.x, frameBox.y, frameBox.width, frameBox.height, 33 * density);
      captureContext.fill();
      const screenBox = relativeRect(screenRect);
      captureContext.save();
      roundRect(captureContext, screenBox.x, screenBox.y, screenBox.width, screenBox.height, 20 * density);
      captureContext.clip();
      const homeBox = relativeRect(homeRect);
      captureContext.drawImage(baseImage, homeBox.x, homeBox.y, homeBox.width, homeBox.height);
      // Hide the baked-in guide navigation, matching the on-screen mask.
      captureContext.fillStyle = "#f4f4f4";
      captureContext.fillRect(homeBox.x, homeBox.y + homeBox.height * .91, homeBox.width, homeBox.height * .09);
      const drawOutputCanvas = (id) => {
        const node = phone.querySelector(`canvas[data-home-canvas="${id}"]`);
        if (!node || node.hidden) return;
        const box = relativeRect(node.getBoundingClientRect());
        captureContext.drawImage(node, box.x, box.y, box.width, box.height);
      };
      drawOutputCanvas("skinny-banner");
      drawOutputCanvas("banner-card");
      drawOutputCanvas("floating-icon");
      if (!popupState.hidden) {
        captureContext.fillStyle = "rgba(0,0,0,.5)";
        captureContext.fillRect(screenBox.x, screenBox.y, screenBox.width, screenBox.height);
        drawOutputCanvas("pop-up-banner");
      }
      captureContext.restore();
      const speakerBox = relativeRect(speakerRect);
      captureContext.fillStyle = "#050505";
      roundRect(captureContext, speakerBox.x, speakerBox.y, speakerBox.width, speakerBox.height, speakerBox.height / 2);
      captureContext.fill();
      const navBox = relativeRect(navRect);
      captureContext.drawImage(navImage, navBox.x, navBox.y, navBox.width, navBox.height);
      const blob = await new Promise((resolve, reject) => capture.toBlob((value) => value ? resolve(value) : reject(new Error("Preview capture failed.")), "image/png"));
      downloadBlob(blob, "shopee-homepage-preview.png");
    } catch (error) {
      console.warn("Phone preview download failed", error);
    }
  }

  previous.addEventListener("click", () => { previewState.page = "homepage"; updatePage(); });
  next.addEventListener("click", () => { if (!next.disabled) { previewState.page = "popup"; updatePage(); } });
  expand.addEventListener("click", openModal);
  downloadPreview?.addEventListener("click", downloadVisiblePhonePreview);
  modal.querySelectorAll("[data-homepage-close]").forEach((button) => button.addEventListener("click", closeModal));

  window.BrandMaxHomepagePreview = {
    refresh,
    preview,
    updateSelected(ids) { previewState.selected = [...ids]; refresh(); },
    setBlankRenderer(renderer) { previewState.blankRenderer = renderer; },
  };
  updatePage();
}

const THEME_STORAGE_KEY = "shopeeMallTheme";

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors (e.g. private browsing).
  }
}

function applyTheme(isLight) {
  if (isLight) document.documentElement.setAttribute("data-theme", "light");
  else document.documentElement.removeAttribute("data-theme");
  // The brand logo file itself is baked for one background or the other
  // (white/red wordmark for the light UI, white-on-transparent for the dark
  // UI) — swap the actual image, not just a CSS filter, so it stays crisp
  // and on-brand either way. See assets/branding/ and the two source files'
  // names in the Branding folder for which is which.
  if (els.brandLogo) {
    els.brandLogo.src = isLight
      ? "assets/branding/logo-light-ui.png"
      : "assets/branding/logo-dark-ui.png";
  }
  if (!els.themeToggle) return;
  els.themeToggle.setAttribute("aria-pressed", String(isLight));
  els.themeToggle.setAttribute(
    "aria-label",
    isLight ? "Switch to dark mode" : "Switch to light mode",
  );
}

function initTheme() {
  // Dark is the default; only an explicit "light" preference switches it off.
  applyTheme(getStoredTheme() === "light");
}

els.themeToggle?.addEventListener("click", () => {
  const isLight = document.documentElement.getAttribute("data-theme") !== "light";
  applyTheme(isLight);
  setStoredTheme(isLight ? "light" : "dark");
});

// The workflow top bar is a separate script. Expose the Standard bulk export
// explicitly so its Download All button always calls the same export path.
window.downloadAll = downloadAll;

initHomepagePreview();

renderSwatches();
syncOutputButtons();
syncOutputAvailability(state);
syncKvColorAvailability(state);
syncRemoveBgAvailability(state);
syncShopeeLiveFsVisibility(state);
syncBulkCsvHint();
drawColorCanvas();
setKspColor(state.kspColor);
setColor(state.kvColor);
populateBackgroundCollectionSelect();
renderBackgroundPicker();
renderBulkRows();
initTheme();
updateUndoRedoButtons();
