Du bist ein erfahrener Full-Stack-Entwickler.
Erstelle eine statische, responsive und barrierearme Fotogalerie für die SPD Langenselbold, die auf GitHub Pages gehostet und über einen responsive iFrame in WordPress eingebunden wird.
Ziel: ca. 100–200 Bilder, sortier-, filter-, such- und teilbar.
Design schlicht, performant, datenschutzfreundlich, mit SPD-Rot (#e3000f) als Akzentfarbe.

1 – Technische Basis

Static Site Generator → Astro

Programmiersprache → TypeScript / JavaScript

Bild-Pipeline → sharp (Thumbnails + WebP/AVIF)

Lightbox → PhotoSwipe v5

Volltextsuche → Fuse.js

Hosting → GitHub Pages (Deploy über Action)

Keine externen Fonts, keine Tracker

Barrierefreiheit: sinnvolle alt-Texte, Fokus-Ringe, Tastatursteuerung

2 – Funktionaler Umfang (MVP + Extras)

Responsive Masonry-Grid (CSS Grid, kein jQuery)

Lightbox mit Zoom, Swipe, Tastatur, ESC zum Schließen

Lazy Loading (loading="lazy", decoding="async")

Filter nach Jahr und Event

Suche über Titel, Untertitel, Tags, Personen, Orte, Events, Hashtags

Hashtags – klickbar und als Filter nutzbar

Cluster-Ansichten → Keine / Jahr / Event / Ort / Person

Share-Funktion pro Bild (Web Share API + Clipboard-Fallback + Toast)

Deep Link ?id=<bild-id> öffnet Bild direkt in Lightbox

iFrame-Integration mit automatischer Höhenanpassung

SEO/Performance → srcset/sizes, WebP/AVIF, ohne Scrollbalken

3 – Projektstruktur
spd-gallery/
  .github/workflows/deploy.yml
  public/
    img/originals/
    img/thumbs/
    vendor/fuse.min.js
    resize-iframe.js
  src/
    data/images.json
    pages/index.astro
    styles/gallery.css
  scripts/
    generate-thumbs.js
  package.json
  astro.config.mjs
  README.md

4 – Datenmodell (src/data/images.json)
[
  {
    "id": "2025-10-26-001",
    "src": "/img/originals/2025-10-26-001.jpg",
    "thumb": "/img/thumbs/2025-10-26-001-640.webp",
    "w": 2048,
    "h": 1365,
    "title": "135 Jahre SPD Langen-Selbold – Eröffnung",
    "caption": "Feierliche Eröffnung im Stucksaal des Schlosses mit Musik und Gästen.",
    "credit": "Foto: SPD Langenselbold",
    "year": 2025,
    "event": "135 Jahre",
    "location": "Schloss Langenselbold",
    "people": ["Julian Brenner","Wolfgang Rittershauß"],
    "tags": ["Feierstunde","Musik","Schloss"],
    "hashtags": ["#SPDLangenselbold","#135Jahre","#Feierstunde"],
    "alt": "Eröffnung der Feierstunde im Stucksaal"
  }
]

5 – Thumbnail-Generator (scripts/generate-thumbs.js)

Erzeugt Thumbnails und images.json automatisch.
Unterstützt optionale Sidecar-Dateien (.json mit zusätzlichen Metadaten).

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ORIG = 'public/img/originals';
const THUMBS = 'public/img/thumbs';
const OUT = 'src/data/images.json';

await fs.promises.mkdir(THUMBS, { recursive: true });
const files = (await fs.promises.readdir(ORIG))
  .filter(f => /\.(jpe?g|png|webp|avif|heic)$/i.test(f));

const items = [];
for (const f of files) {
  const inPath = path.join(ORIG, f);
  const img = sharp(inPath);
  const meta = await img.metadata();
  const base = path.parse(f).name;

  const sidecarPath = path.join(ORIG, `${base}.json`);
  let sidecar = {};
  if (fs.existsSync(sidecarPath)) {
    try { sidecar = JSON.parse(await fs.promises.readFile(sidecarPath,'utf8')); } catch {}
  }

  const thumb320 = path.join(THUMBS, `${base}-320.webp`);
  const thumb640 = path.join(THUMBS, `${base}-640.webp`);
  await sharp(inPath).resize({ width: 320 }).webp({ quality: 72 }).toFile(thumb320);
  await sharp(inPath).resize({ width: 640 }).webp({ quality: 72 }).toFile(thumb640);

  items.push({
    id: base,
    src: `/img/originals/${f}`,
    thumb: `/img/thumbs/${base}-640.webp`,
    w: meta.width ?? 0,
    h: meta.height ?? 0,
    title: sidecar.title || base.replace(/[-_]/g,' '),
    caption: sidecar.caption || '',
    credit: sidecar.credit || "Foto: SPD Langenselbold",
    year: sidecar.year ?? inferYear(base),
    event: sidecar.event ?? inferEvent(base),
    location: sidecar.location || '',
    people: sidecar.people || [],
    tags: sidecar.tags || [],
    hashtags: sidecar.hashtags || deriveHashtags({year: sidecar.year ?? inferYear(base), event: sidecar.event, location: sidecar.location}),
    alt: sidecar.alt || `Foto ${base}`
  });
}

function inferYear(name){ const m=name.match(/\b(19|20)\d{2}\b/); return m?Number(m[0]):null; }
function inferEvent(name){ if(/135/i.test(name)) return "135 Jahre"; return null; }
function deriveHashtags({year,event,location}) {
  const hs=new Set(['#SPDLangenselbold']);
  if(year) hs.add(`#${year}`);
  if(event) hs.add('#'+String(event).replace(/\s+/g,''));
  if(location) hs.add('#'+String(location).replace(/\s+/g,''));
  return [...hs];
}

await fs.promises.writeFile(OUT, JSON.stringify(items,null,2));
console.log(`Wrote ${items.length} items to ${OUT}`);

6 – src/pages/index.astro

Hauptseite mit Filter, Suche, Cluster, Lightbox und Share.

(Kurzfassung – Claude soll kompletten, lauffähigen Code generieren wie unten beschrieben.)

Funktionen

Header mit Suchfeld, Filter (Jahr/Event), Cluster-Select, Hashtag-Leiste

Masonry-Grid (ul.grid) → dynamisches Rendering

JS-Logik:

Fuse.js Index für Suche mit Gewichtungen

Kombinierte Filter (Suche + Jahr + Event + Cluster + Hashtags)

Gruppenweise Darstellung (Cluster)

Share-Buttons (Kachel + Lightbox)

Deep-Link ?id=…

postMessage an Parent für iFrame-Höhe

(Claude soll vollständigen Astro-Code mit importierten JSON-Daten, PhotoSwipe-Init, Fuse-Integration und den im vorigen Prompt beschriebenen JS-Funktionen erzeugen.)

7 – Styles (src/styles/gallery.css)

SPD-Rot als Akzent

Responsive Grid

Toolbar, Filter, Hashtag-Pills, Share-Button, Toast, Cluster-Überschriften, Caption etc.
(Claude soll kompletten CSS-Code aus dem vorherigen Prompt übernehmen und erweitern.)

8 – GitHub Actions Deploy (.github/workflows/deploy.yml)
name: Build and Deploy
on:
  push:
    branches: [ main ]
permissions:
  contents: write
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run generate
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          publish_branch: gh-pages

9 – Einbettung in WordPress

In einem Custom-HTML-Block:

<iframe id="spd-gallery" src="https://<USER>.github.io/spd-gallery/"
        style="width:100%;border:0;aspect-ratio:16/9" loading="lazy"></iframe>
<script>
  window.addEventListener("message", e => {
    if (e?.data?.type === "spd-gallery-height")
      document.getElementById("spd-gallery").style.height = e.data.value + "px";
  });
</script>

10 – Akzeptanzkriterien

100–200 Bilder laden performant (Thumbnails + Lazy Load).

Suche findet Titel, Untertitel, Hashtags, Tags, Personen, Orte, Events.

Hashtags sind klickbar und filtern Bilder.

Cluster-Ansicht funktioniert und bleibt flüssig.

Share-Buttons in Kachel und Lightbox arbeiten (Web Share API oder Copy + Toast).

Deep Links öffnen direkt die Lightbox.

iFrame-Integration ist responsive, ohne Scrollbalken.

Lighthouse-Score mobil ≥ 90 für Performance und Accessibility.

Keine externen Tracker oder Fonts.

GitHub Action baut und veröffentlicht nach gh-pages.

11 – Aufgabe für Claude

Erstelle das komplette, funktionsfähige Repository spd-gallery gemäß dieser Spezifikation:

alle oben genannten Dateien mit vollständigem Code,

Beispiel-Daten (10 Bilder oder Platzhalter) + funktionierende Suche, Filter, Hashtags, Cluster, Share.
Das Ergebnis soll lokal mit npm run dev laufen und sich nach Push automatisch auf GitHub Pages veröffentlichen.