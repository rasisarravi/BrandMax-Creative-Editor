# BrandMax Creative

This folder is the complete website, ready for GitHub Pages. No build step is required.

## Upload to GitHub

Everything is together in this folder. You do not need files from anywhere else.

**Easiest with GitHub Desktop:** copy this folder's contents into your local repository folder, keeping the nested folders intact. Review the changes, commit, and push.

**Using the GitHub website:** GitHub accepts up to 100 files in each browser upload, so use these two batches from the same folder:

1. Open your repository and choose **Add file → Upload files**.
2. Open **Github & 2026-11-09** on your computer. Upload the loose files at its top level (`index.html`, the JS/CSS files, `README.md`, and `.nojekyll`). Commit to `main`.
3. Choose **Add file → Upload files** again. Drag in the **assets**, **Guideline**, and **Template** folders together, without opening or flattening them. Commit to `main`.
4. Make sure `index.html` appears at the repository's top level—not inside another `Github & 2026-11-09` folder. The asset paths must remain, for example, `assets/fonts/...`.
5. Open **Settings → Pages**. Choose **Deploy from a branch**, branch **main**, folder **/(root)**, then **Save**. If this repository previously used `/docs`, change it to `/(root)`.
6. Wait for GitHub Pages to finish deploying, then open the website link shown there. Refresh the page after an update.

Do not flatten the nested folders or upload only the HTML file. The small `.nojekyll` file should remain in the repository; if it is hidden in Finder, press **Command + Shift + .** to show it.

Browser upload limits: [GitHub's official instructions](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).

## Included

- Homepage, project manager, banner editor, canvas tools, previews, and downloads.
- Required logos, fonts, overlays, template previews, and background images.
- Both original design-guideline PDFs.

The `Template` folder contains only fixed overlay PNGs used as fallbacks, not editable working files. Testing files, screenshots, original design-source files, old releases, and Google Apps Script deployment files are not included.

## Important

Projects are saved in the browser on the current website address. Moving to a new address does not automatically transfer projects. Use **Download backup** and **Import a project backup** to transfer them.

The bundled Shopee font works locally. Google Fonts require an internet connection. Run the website through GitHub Pages or a local web server, not by double-clicking `index.html`.
