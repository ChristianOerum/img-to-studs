# img-to-studs

Convert any image into a LEGO mosaic. Upload a photo and get an instant preview, a full piece list, and a BrickLink want list — ready to order.

**Live app:** https://christianoerum.github.io/img-to-studs/

---

## Features

- **Mosaic preview** — renders your image as 1×1 LEGO plates matched to real LEGO colors
- **Size control** — set width and height in 16×16 baseplates; studs and physical size (cm) are calculated automatically
- **Image adjustments** — tweak brightness, contrast, X/Y offset, and grayscale; drag the original image overlay to reposition the crop
- **Color palette** — 60+ official LEGO colors; toggle individual colors or hide expensive/rare ones
- **Piece list** — full 1×1 plate count per color plus baseplate count, with estimated prices
- **Multi-currency** — price estimates in DKK, USD, EUR, GBP, SEK, and NOK
- **BrickLink export** — one-click copy of a BrickLink XML want list, ready to paste into Wanted List → Upload
- **Wall preview** — drag the mosaic onto a living room photo to visualize it on a wall
- **Resizable panel** — drag the divider to give more space to the canvas or the controls

## Tech stack

- [Nuxt 3](https://nuxt.com) — Vue 3 framework with static site generation
- [Tailwind CSS](https://tailwindcss.com) — utility-first styling
- [Pinia](https://pinia.vuejs.org) — state management
- Web Worker (`mosaic.worker.js`) — off-main-thread color matching so the UI stays responsive

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Build & deploy

Generate a static site:

```bash
npm run generate
```

Output is written to `.output/public/`. The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys to GitHub Pages on every push to `main`.
