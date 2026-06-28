# VillaNova 

A lightweight, dependency-free cultural events agenda built with vanilla HTML, CSS (compiled from SCSS), and JavaScript. It displays events from the [OpenAgenda](https://openagenda.com) API and falls back gracefully to built-in demo data when no API credentials are configured.

---

## Features

- **Event listing** with a responsive 1/2/3-column card grid
- **Category filters** — Concerts, Expositions, Spectacles, Jeune public, Ateliers
- **Detail view** with hero image, date/time/location/price metadata, full description, and a video section
- **OpenAgenda API integration** with automatic fallback to demo events
- **Skeleton loading** placeholders while events are fetched
- **Client-side routing** via the History API (`?id=<uid>`) with browser back/forward support
- **Accessibility** — skip link, ARIA live announcements, `aria-pressed` filter buttons, `aria-busy` states, `aria-current` nav, focus management on navigation, reduced-motion support
- **Responsive & mobile-first** CSS compiled from SCSS

---

## Project Structure

```
project/
├── index.html          # Single-page shell with two views: home (list) and detail
├── css/
│   └── styles.css      # Compiled output — do not edit directly
├── scss/
│   └── styles.scss     # Source styles — edit this file
└── js/
    └── main.js         # All app logic: API, rendering, routing, filters
```

---

## Getting Started

### 1. Clone or download

```bash
git clone https://github.com/your-org/villanova.git
cd villanova
```

### 2. Compile SCSS

Use any Sass compiler. With the Sass CLI:

```bash
sass scss/styles.scss css/styles.css --watch
```

Or via a bundler (Vite, Webpack, Parcel — configure as needed).

### 3. Open in a browser

Because the app fetches from the OpenAgenda API, you need a local server (not `file://`):

```bash
# Python
python3 -m http.server 8080

# Node.js (npx)
npx serve .
```

Then visit `http://localhost:8080`.

---

## OpenAgenda Configuration

By default the app runs on **demo data** (6 hardcoded events). To connect your real agenda:

1. Create an account at [openagenda.com](https://openagenda.com) and obtain a **public API key**.
2. Find your **agenda UID** in your agenda's admin URL.
3. Open `js/main.js` and fill in the two constants at the top:

```js
const API_KEY    = 'your_public_api_key';
const AGENDA_UID = 'your_agenda_uid';
```

The app fetches the next 24 upcoming events sorted by start date. No server-side proxy is required — the OpenAgenda public API supports browser requests.

---

## Filters

Filters match against the `keywords.fr` field returned by the API (or set on demo events). The built-in filter slugs are:

| Button | Matches keyword containing |
|---|---|
| Tout | *(all events)* |
| Concerts | `concert` |
| Expositions | `expo` |
| Spectacles | `spectacle` |
| Jeune public | `jeune public` |
| Ateliers | `atelier` |

To add a filter, add a `<button>` to the filter group in `index.html` and ensure your OpenAgenda events use a matching keyword.

---

## Customisation

### Colours & typography

All design tokens are defined as plain CSS custom properties at the top of `styles.scss`. The palette uses:

- **Primary green** — `#1D9E75` / dark `#0F6E56`
- **Accent gold** — `#BA7517`
- **Neutral** — `#1A1A18`, `#5F5E5A`, `#B4B2A9`, `#EDEDEA`, `#F7F6F3`

Fonts are loaded from Google Fonts: **Playfair Display** (headings) and **Inter** (body). Replace the `<link>` in `index.html` to use self-hosted fonts.

### Adding pages

The app uses a simple show/hide pattern. To add a new page:

1. Add a `<div id="page-mypage" class="page-wrapper">` in `index.html`.
2. Call `showPage('mypage')` from any link or button.

---

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). No polyfills are included; IE is not supported.

---

## Accessibility Notes

- A **skip link** (`Aller au contenu principal`) is visually hidden until focused.
- Filter buttons use `aria-pressed` to communicate toggle state to screen readers.
- An off-screen **ARIA live region** (`role="status"`, `aria-live="polite"`) announces filter changes, page transitions, and load completion.
- All animations and transitions respect `prefers-reduced-motion`.
- Focus is programmatically moved to the back button when opening a detail view.

---

## Licence

MIT — free to use, modify, and distribute.
