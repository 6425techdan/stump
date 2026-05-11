# Stump Grinding Calculator

A small vanilla JavaScript demo for estimating stump grinding work. The page is styled with Tailwind via CDN and runs as a static site with no build step.

## Inferred project context

The calculator supports a simple quoting workflow for arborists or landscaping teams:

- Stumps are grouped by diameter: small, medium, large, and x-large.
- The largest stump on the job receives the one-time base rate for its size tier.
- Every remaining stump receives its size tier's additional-stump rate.
- Rates can be adjusted in the Settings modal and are saved in the browser with `localStorage`.

This keeps the demo focused on quick field estimates rather than a full invoicing or scheduling system.

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static file server:

```sh
python -m http.server
```

Then visit `http://localhost:8000`.

## Files

- `index.html` - calculator markup, Tailwind CDN imports, and the settings modal.
- `calc.js` - pricing rules, form handling, settings persistence, and result rendering.
- `calc.css` - legacy standalone styles from an earlier version; the current page uses Tailwind utility classes.

## Pricing defaults

| Tier | Diameter | Base rate | Additional rate |
| --- | --- | ---: | ---: |
| Small | <1 ft | $125 | $25 |
| Medium | 1-2 ft | $200 | $75 |
| Large | 2-3 ft | $275 | $125 |
| X-Large | 3+ ft | $350 | $175 |

These values are demo defaults only. Use the Settings modal to adapt them for a specific market or rate card.
