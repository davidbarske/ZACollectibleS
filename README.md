# ZA Collectibles

ZA Collectibles is a heritage and collectibles website covering appraisals and evaluations, research and authentication, buying and selling, consignment, auctions, private sourcing, collection building and professional collection presentation.

The current site includes dedicated pages for the main service families and collectible disciplines, together with current curation, journal content, privacy and appraisal conditions.

## Run locally

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

## GitHub Pages

1. Upload the contents of this folder to the root of the `ZACollectibles` repository.
2. Open **Settings → Pages**.
3. Select **Deploy from a branch**.
4. Select `main` and `/ (root)`.
5. Save.

All site links are relative, so the site will work from the GitHub Pages repository path.

## Enquiry forms

The static GitHub Pages version validates input, previews selected images and prepares a local enquiry summary. A server-side form or email endpoint can be connected through `assets/js/site-config.js` before using the website for direct online delivery of submissions.

## Image assets

The site uses a deliberately mixed image library: selected ZA Collectibles project imagery for genuine work examples, locally prepared editorial imagery for the primary visual system and additional public-domain/CC0 reference imagery on selected discipline pages. See `docs/ASSET_NOTES.md` and `docs/IMAGE_SOURCES.md`.
