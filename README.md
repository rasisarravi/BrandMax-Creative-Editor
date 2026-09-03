# Shopee Campaign Creative Tool

A static campaign asset generator for Shopee creative formats. The tool runs fully in the browser with HTML, CSS, and JavaScript only.

## What Is Included

- `index.html` as the entry point
- `styles.css` for the interface
- `script.js` for preview rendering and size-safe downloads
- `assets/fonts/` for ShopeeFont
- `assets/overlays/` for fixed output overlays
- `assets/logos/` for Shopee Mall logo references
- `assets/template-guides/` for layout references

No backend, database, or build step is required.

## GitHub Pages Deployment

1. Create a new GitHub repository.
2. Upload these files and folders to the repository root:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `assets/`
   - `README.md`
3. Open the repository settings.
4. Go to **Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select the `main` branch and `/root` folder.
7. Save the settings.

GitHub will publish the tool at:

```text
https://your-username.github.io/your-repository-name/
```

## Local Preview

For the best local test, run a static server from this folder and open the printed local URL:

```bash
python3 -m http.server 5173
```

Opening `index.html` directly from the file system may block canvas image export in some browsers. GitHub Pages serves the files over HTTPS, so downloads work there without a backend.

## Notes

- All asset paths are relative.
- `Undo` / `Redo` (also `Ctrl/Cmd+Z` and `Ctrl/Cmd+Shift+Z`, or `Ctrl+Y`) step back and forward through edits — color picks, toggles, template swaps, image uploads, Remove Background runs, Touch Up saves, and each drag or slider adjustment (one whole drag or slider movement counts as a single step, not one per pixel/tick). The single editor and whichever bulk row you're previewing/editing each keep their own separate undo history.
- `KV` (formerly `KV Color`) has two modes, switched with the `Color` / `Image` buttons above the picker:
  - `Color`: the default. Same as before — a flat fill, defaulting to Shopee orange (`#EE4D2D`), changeable anytime with the color picker, hex field, or swatches.
  - `Image`: upload a photo/graphic to use as the KV background instead of a flat color. The panel shows the recommended minimum size and supported formats (JPG, PNG, WebP). Once uploaded, use the `KV` option in each preview card's edit-target switch (it sits right after `Logo`) to drag its position and zoom it per output format, the same way the SKU photo or SKU Background scene work.
  - KV Image only applies to `Mall BAU` and `Mall BAU New Arrival` — every Paying Seller template keeps its own fixed campaign background regardless of this setting.
- Template options are `Mall BAU`, `Mall BAU New Arrival`, `8.8 Paying Seller`, `9.9 Paying Seller`, and `Shopee Live Flash Sale` (see its own section below — it has a different sidebar, single fixed output, and its own CSV schema).
- Every Paying Seller template (`8.8 Paying Seller`, `9.9 Paying Seller`) only has artwork for Category Banner and Banner Card — the other three output buttons are disabled while one is selected (and auto-deselected if they were already picked). Its background is a fixed campaign image rather than a flat color, so the `KV` picker (both Color and Image modes) is disabled and has no effect on these templates. Brand Logo, SKU Image, and KSP editing — including `Hide white logo container` and `Inverse Logo` — work exactly the same as the other templates.
- Turn on `Hide white logo container` to use the no-container Template 2 overlays.
- By default, the "NEW ARRIVAL" badge (Mall BAU New Arrival template) and the Shopee icon (IG Story & FB Post only) show their colored/branded versions. Turn on `Inverse Logo` if your KV color is light to switch both to plain white instead — it also switches the "Shopee Mall | 100% ORI" tag to a plain white-friendly version on Banner Card & IG Story only (its default red-pill version is unaffected when the toggle is off).
- Turn off `Shopee Mall Logo` to remove the "Shopee Mall | 100% ORI" tag from every output (Mall BAU and Mall BAU New Arrival only — every Paying Seller template's tag is part of its fixed campaign background image and isn't affected by this toggle).
- The Brand Logo field has its own `Remove Background` and `Touch Up`, working exactly the same way as the SKU Image versions described below (same in-browser AI model and cleanup pass for Remove Background, same Erase/Restore brush editor for Touch Up) — just applied to the logo instead of the product photo. Since every output's logo shares the same underlying image, a run/save here updates all of them at once.
- Enter an image hash or image link, then click `Load Image` to place that image into the SKU area.
- The same field also accepts a full Shopee product page URL (e.g. `https://shopee.co.id/<slug>-i.<shopid>.<itemid>`) instead of a single hash/link. **This is currently a stub, not a working feature** — Shopee's product-data API doesn't allow the kind of direct, unauthenticated request a static page like this one can make (verified by hand: the product page itself is a client-rendered app shell with no image data in the raw HTML, and its API rejects the request outright), unlike the CDN hosts (`cf.shopee.co.id`, `*.susercontent.com`) the hash/link path above already talks to successfully. Pasting a product URL today shows a clear "not connected to a backend yet" message rather than pretending to work. The seam to plug in a real resolver later is `PRODUCT_IMAGE_RESOLVER_ENDPOINT` in `script.js` — point it at a backend/internal API that returns `{ images: ["https://...", ...] }` for a given product URL, and the rest of the feature (detection, the `Select SKU Image` gallery below the field, click-to-select) starts working immediately with no other code changes. Brand Logo is unaffected either way — this only ever applies to the SKU Image field.
- Click `Remove Background` to cut the current SKU photo out from its background, right inside the tool. This runs entirely in your browser (in-browser AI model, via [`@imgly/background-removal`](https://github.com/imgly/background-removal-js)) — the image is never uploaded anywhere. The first use on a given device downloads a one-time ~80MB model (cached afterward by the browser, so later uses are fast). A cleanup pass runs automatically on the result: white or bright areas on the product itself — reflections, glossy spots, or a product's own plain white packaging (like the unprinted plastic edge of a pouch/sachet) — are kept as long as they're attached to the product and their color doesn't actually match the photo's real backdrop, instead of being mistaken for background (this holds even when the AI model itself was confidently wrong about that area); a small gap left in the middle of an otherwise-detected product (e.g. a plain packaging surface sitting between two printed areas the model was independently confident about, even on a plain white backdrop where the color check above can't tell them apart) gets bridged automatically, a thin, low-contrast outer edge just past the detected body (like a pouch's crimped heat-seal edge) gets pulled in too; and as a last resort, a notch bitten out of an otherwise-solid product — most often where a fork, spoon, or other utensil crosses in front of it and confuses the model and the color check at the same time — gets patched by filling in the product's overall convex shape, as long as doing so doesn't add an implausible amount of extra area (so this doesn't misfire on a genuinely non-convex or multi-part photo); small fully-enclosed gaps inside the product are filled in; the cutout edge gets a light feather instead of a hard jagged line; and only one connected piece is kept, preferring whichever piece covers the most area in the middle of the image (since the product is normally centered there) over a merely bigger stray leftover elsewhere — so a second product, promotional photo, or leftover text the model failed to remove gets discarded automatically. The product itself is never cropped by this cleanup. Since this cleanup step re-runs on whatever the SKU image looks like right now, using `Touch Up` to erase a secondary product or distracting element first, then running `Remove Background` afterward, works as expected — anything already erased stays erased and can't come back during cleanup, even if the model itself gets confused by it. Quality is good for typical product photos but can still be rougher than remove.bg on very fine detail (hair, semi-transparent edges), and on busy multi-subject graphics (ads, banners with several photos) rather than a single centered product shot; use `Touch Up` afterward to clean those up by hand.
- Click `Touch Up` to manually fix the SKU image with an Erase/Restore brush — handy for leftover background bits Remove Background missed, or for correcting a spot where it cut too far into the product. Erase clears pixels to transparent; Restore paints pixels back from the original image, before any Remove Background or Touch Up edits — so it can bring back area Remove Background cut away entirely, not just spots that were left translucent. Adjust brush size with the slider, switch the canvas backdrop between `Checker` / `Light` / `Dark` to make it easier to spot bits that didn't crop cleanly, `Reset` reverts every edit made in that session, and nothing is applied until you click `Save`. Since every output format shares the same underlying SKU image, a save updates all of them at once.
- Uploaded SKU images can be repositioned by dragging them inside each preview.
- SKU images can be zoomed per output from the preview controls.
- Pick a `SKU Background` scene from the searchable preset library (or `None`). The library supports keyword search, collection filtering, scrollable thumbnails, and Prev/Next paging so the sidebar stays compact even with many background options. The chosen background applies to every output format, but its position/zoom is adjusted per format since box sizes differ.
- The background only shows through a transparent-background SKU photo (e.g. a background-removed PNG). A fully opaque SKU photo (e.g. a plain JPG) will simply cover it, so the background feature is optional either way.
- When `SKU Background` is set to `None`, the `Background Color` picker (hex or color swatch) controls the flat fill behind the product area instead. It's only active while `None` is selected — pick a scene and this color has no effect, since the scene covers that area completely.
- Each preview card has a `Logo / KV / KSP / SKU / BG` switch (`KV` only appears once a KV image is uploaded; `BG` only appears once a background scene is selected) that picks what the slider — and canvas drag — below it controls, per output format:
  - `Logo`: zoom only, no drag — the brand logo always stays centered in its box; zooming in crops closer, zooming out shrinks it, same rounded-rect box either way.
  - `KV`: drag to reposition, slider to zoom — same mechanics as `SKU` / `BG` below, but for the KV image and within the KV area instead of the product area.
  - `KSP`: a font-size slider instead of a zoom percentage, plus the ability to drag the KSP box up or down directly on the canvas (horizontal position always stays centered — you can't drag it left or right). By default the KSP text auto-shrinks to fit its box; dragging the slider takes manual control of the exact size for that output, which is the way to force where the text wraps — for example, making sure two distinct phrases land on two separate lines instead of auto-fit choosing a different break point. Range is that output format's own designed min/max size.
  - `SKU` / `BG`: unchanged — drag to reposition, slider to zoom.
- There's no separate KSP text field in the sidebar anymore — edit it directly on a banner. Set that card's `Logo / KV / KSP / SKU / BG` switch to `KSP`, then double-click the text on the canvas (or double-tap it on a touchscreen, e.g. iPad — a manual double-tap detector backs this up since browsers don't reliably turn a touch double-tap into a `dblclick` on a canvas) to open a text cursor right there (up to 50 characters). The editable area itself is sized and centered to match the text's own real rendered footprint at its current size, not the full allowed box, so it never looks like an oversized placeholder rectangle around smaller text. Typing or deleting words updates the wording on every output format at once, since they all share the same line. Pressing `Enter` to force a line break only affects the banner you're actively editing — every other output keeps auto-wrapping the same words on its own, so two banners with different box shapes can each break the line wherever it actually looks right for that shape. Click elsewhere (or press `Esc`) to finish editing that banner.
  - If you later change the wording again, any other banner's forced line break gets dropped automatically if it no longer matches the new words — a stale forced break over changed wording wouldn't line up correctly anyway.
- KSP text color can be changed with the color picker or hex field (this is the only KSP control left in the sidebar).
- The output formats are Category Banner, Top Module Banner, IG Story, FB Post, and Banner Card.
- Category Banner, Top Module Banner, and Banner Card are compressed to stay under 250 KB when possible.
- IG Story and FB Post export as full-size PNG because they are not internal-platform assets.
- For size-limited outputs, the app keeps PNG when it is already under the limit. Heavier photo-based assets are automatically exported as JPG (quality reduced, then resolution reduced if needed) to keep the file size below 250 KB. WebP is never used since the downstream internal system only supports PNG and JPG.
- The app can download a single asset or a ZIP containing all selected outputs.

## Shopee Live Flash Sale

`Shopee Live Flash Sale` is a fixed-layout template — 1200x750, transparent PNG, single output only — built for a live-shopping card design with one "hero" SKU plus two secondary SKUs. It doesn't share the KV/KSP/Inverse-Logo/Shopee-Mall-Logo/multi-output setup the other templates use, so selecting it hides those sidebar rows and replaces them with its own:

- `Brand Logo` and `SKU 1 Image` (the hero SKU) reuse the exact same upload/Remove Background/Touch Up fields as the other templates.
- `SKU 2 Image` and `SKU 3 Image` are new fields below them, each with their own `Remove Background` and `Touch Up`, for the two secondary product thumbnails.
- There's no `SKU Background`, `Background Color`, `Inverse Logo`, or `KSP Text Color` — this template has no flat/scene background or KSP text, so none of those apply.
- There's no Output picker — this template only ever produces its own single 1200x750 output, selected automatically.
- Every text element — the live time, product name, sliced price, promo price, all three discount `%` badges, and the brand name — is edited by **double-clicking it directly on the preview canvas**, the same "type right on the banner" pattern as KSP elsewhere in the tool. There's no sidebar text field for any of them. Each preview card's `SKU 1 / SKU 2 / SKU 3` switch controls which photo the drag/zoom slider below it targets; the three photo boxes don't overlap each other, so dragging inside any one of them always moves the right photo regardless of that switch.

### CSV columns for Shopee Live Flash Sale

When `Shopee Live Flash Sale` is the selected template, the bulk panel's `Download template` button and column hint switch to this template's own schema instead of the standard one:

`Time`, `Brand Name`, `Brand Logo`, `SKU 1 Name`, `SKU 1 Price Before`, `SKU 1 Price After`, `SKU 1 %`, `SKU 1 Image`, `SKU 2 %`, `SKU 2 Image`, `SKU 3 %`, `SKU 3 Image`.

Only SKU 1 gets a name/price pair — SKU 2 and SKU 3 are just a thumbnail and a discount badge each, matching the design. Logo and SKU image columns accept an image hash or a direct link, same as every other template. The downloaded template comes pre-filled with several real example rows the same way the standard one does. The rest of the workflow (upload CSV → rows appear at the top → `Preview & edit` opens the same main editor/canvas below → `Generate all` exports a flat ZIP) is identical to the standard bulk flow described next.

## Bulk Generate From CSV

The `Bulk generate from CSV` panel above the main editor batch-creates assets for many brands at once, without touching the single-image editor below it.

- Click `Download template` for a starter CSV. Columns are `Brand Name`, `KSP`, `Brand Logo`, `SKU Image`. It comes pre-filled with several real example brand rows (not just one placeholder row) so it's immediately previewable/usable as-is — replace the rows with your own brands, or use them to see how the tool behaves before uploading real data. Brand Logo and SKU Image accept either a Shopee image hash or a direct image link, same as the `Image Hash / Image Link` field in the single editor. `Brand Name` is an identifier only — it labels that row in the bulk list and the "Editing ..." banner (in place of the generic "Row 1", "Row 2", ...) but is never drawn onto the banner output. It's optional: rows without it (or CSVs made before this column existed) simply keep the generic "Row N" label.
- After uploading, each row defaults to whatever is selected under `Default outputs for new rows` (Category Banner and Banner Card, out of the box, to keep batch runs fast). Every row's output selection can be overridden individually with its own chips.
- Click `Preview & edit` on a row to load that row into the main editor — the exact same sidebar (Template, Brand Logo, Logo Color, SKU Image, SKU Background, KV Color, output selection) and preview stage used for a single brand, not a separate simplified view, including double-clicking a banner to edit its KSP text directly. Fetching the row's logo/SKU happens once and is cached, so reopening a row is instant. A banner above the preview stage shows which row you're editing, with a `Back to main editor` button to return to the single-brand editor. Only one row can be open at a time; opening another row closes the previous one.
- Every row is fully independent: Template, KV Color, KSP Text Color, the Logo Color / Hide-container toggles, SKU Background, Brand Logo, SKU Image, KSP text, output selection, and each output's drag position/zoom/logo-zoom/KSP-font-size can all differ per row. New rows start as a copy of whatever the sidebar currently has, then become that row's own settings once you preview/edit it — so ten different brands can have ten different KV colors, text colors, templates, or backgrounds, and each result reflects that row's own configuration.
- **Auto KV Color**: the first time a row's Brand Logo loads, its `KV Color` is automatically switched from that generic sidebar default to the logo's own dominant color — e.g. a Shopee logo sets the row to Shopee orange, a logo with a navy mark sets that row to navy, and so on, so each brand gets an on-brand KV Color without touching the color picker. Only genuinely colored logo pixels count (plain white/black/gray areas, and transparent background, are ignored), and a logo that has no real color of its own (purely black-and-white) leaves the KV Color at its default instead of guessing. This only happens once per row, so picking a different color by hand afterward via `Preview & edit` always sticks — it's a starting point, not something that re-applies on every load.
- `Remove Background` and `Touch Up` both work the same way while previewing a row, for both SKU Image and Brand Logo — each button only affects the field it's under for that row.
- If a row's template is `8.8 Paying Seller` or `9.9 Paying Seller`, that row's output chips are limited to Category Banner and Banner Card (the other three are disabled), same as the single editor.
- `Generate all` uses each row's own settings and keeps any edits made while previewing it. Rows that were never opened export with their default centered framing and whatever settings they started with.
- Rows with a blank cell simply skip that field (no logo, or no SKU image, for that row). A bad image hash/link (one that can't actually be opened) is treated the same way, field by field — that one image just comes up empty while every other correct image and every text field on that row still previews, edits, and generates normally. `Preview & edit` opens the row regardless, with a status note naming which field(s) couldn't load; `Generate all` still produces that row's outputs, just without the missing image(s).
- Results download as one flat ZIP — every file is prefixed `row-1-`, `row-2-`, ... instead of being nested in a subfolder per brand.
- `Remove Background All`, next to `Generate all`, runs Remove Background on every row's SKU image in one go (SKU 1, plus SKU 2 and SKU 3 for `Shopee Live Flash Sale` rows) — one image at a time, with a progress readout (`Removing background... (3/12) 64%`) since a full batch can take a while. Rows without an image, or whose image failed to load, are skipped; the rest still complete. Brand logos aren't included — use the per-row `Remove Background` button under the logo for those. `Default outputs for new rows` is hidden while `Shopee Live Flash Sale` is selected, since that template only ever has its own single output (auto-selected on every row).
