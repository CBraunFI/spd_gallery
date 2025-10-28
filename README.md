# SPD Langenselbold Fotogalerie

Eine statische, responsive und barrierefreie Fotogalerie für die SPD Langenselbold, die auf GitHub Pages gehostet und über einen iframe in WordPress eingebunden werden kann.

## Features

- **Responsive Masonry-Grid** mit CSS Grid
- **Lightbox** mit PhotoSwipe v5 (Zoom, Swipe, Tastatursteuerung)
- **Lazy Loading** für optimale Performance
- **Volltextsuche** mit Fuse.js über Titel, Untertitel, Tags, Personen, Orte, Events und Hashtags
- **Filter** nach Jahr und Event
- **Cluster-Ansichten** nach Jahr, Event, Ort oder Person
- **Hashtags** - klickbar und als Filter nutzbar
- **Share-Funktion** pro Bild (Web Share API + Clipboard-Fallback)
- **Deep Links** (?id=<bild-id>) öffnen Bilder direkt in der Lightbox
- **iFrame-Integration** mit automatischer Höhenanpassung
- **Barrierefrei** mit sinnvollen alt-Texten, Fokus-Ringen und Tastatursteuerung
- **Datenschutzfreundlich** - keine externen Fonts, keine Tracker
- **SPD-Branding** mit SPD-Rot (#e3000f) als Akzentfarbe

## Installation

### 1. Repository klonen oder herunterladen

```bash
git clone https://github.com/YOUR-USERNAME/spd-gallery.git
cd spd-gallery
```

### 2. Abhängigkeiten installieren

```bash
npm install
```

### 3. Bilder hinzufügen

Legen Sie Ihre Originalbilder im Ordner `public/img/originals/` ab. Unterstützte Formate:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)
- AVIF (.avif)
- HEIC (.heic)

### 4. Metadaten hinzufügen (optional)

Für jedes Bild können Sie eine JSON-Datei mit Metadaten erstellen:

**Beispiel:** `public/img/originals/2025-10-26-001.json`

```json
{
  "title": "135 Jahre SPD Langenselbold – Eröffnung",
  "caption": "Feierliche Eröffnung im Stucksaal des Schlosses mit Musik und Gästen.",
  "credit": "Foto: SPD Langenselbold",
  "year": 2025,
  "event": "135 Jahre",
  "location": "Schloss Langenselbold",
  "people": ["Julian Brenner", "Wolfgang Rittershauß"],
  "tags": ["Feierstunde", "Musik", "Schloss"],
  "hashtags": ["#SPDLangenselbold", "#135Jahre", "#Feierstunde"],
  "alt": "Eröffnung der Feierstunde im Stucksaal"
}
```

Wenn keine Metadaten-Datei vorhanden ist, werden Standardwerte verwendet:
- **title**: Dateiname (ohne Extension)
- **year**: Aus Dateiname extrahiert (z.B. `2025-10-26-001.jpg` → 2025)
- **event**: Aus Dateiname abgeleitet (z.B. "135" → "135 Jahre")
- **hashtags**: Automatisch generiert (#SPDLangenselbold, #Jahr, #Event, #Ort)

### 5. Thumbnails generieren

```bash
npm run generate
```

Dieser Befehl:
- Erstellt Thumbnails in 320px und 640px Breite
- Konvertiert zu WebP (Qualität 72)
- Generiert `src/data/images.json` mit allen Metadaten

### 6. Lokal testen

```bash
npm run dev
```

Öffnen Sie http://localhost:4321 im Browser.

### 7. Build für Produktion

```bash
npm run build
```

Die fertigen Dateien befinden sich im `dist/` Ordner.

## Konfiguration

### Astro Config

Bearbeiten Sie `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://YOUR-USERNAME.github.io',
  base: '/spd-gallery',
  // ...
});
```

Ersetzen Sie `YOUR-USERNAME` mit Ihrem GitHub-Benutzernamen.

### GitHub Pages Deployment

1. Erstellen Sie ein neues Repository auf GitHub
2. Pushen Sie den Code:

```bash
git remote add origin https://github.com/YOUR-USERNAME/spd-gallery.git
git branch -M main
git add .
git commit -m "Initial commit"
git push -u origin main
```

3. Aktivieren Sie GitHub Pages:
   - Gehen Sie zu **Settings** → **Pages**
   - Source: **Deploy from a branch**
   - Branch: **gh-pages** / **root**
   - Speichern

Die GitHub Action wird automatisch ausgelöst und deployed die Seite nach `https://YOUR-USERNAME.github.io/spd-gallery/`

## WordPress Integration

### Variante 1: Custom HTML Block mit inline Script

```html
<iframe id="spd-gallery"
        src="https://YOUR-USERNAME.github.io/spd-gallery/"
        style="width:100%;border:0;min-height:600px"
        loading="lazy">
</iframe>
<script>
  window.addEventListener("message", function(e) {
    if (e?.data?.type === "spd-gallery-height") {
      var iframe = document.getElementById("spd-gallery");
      if (iframe) {
        iframe.style.height = e.data.value + "px";
      }
    }
  });
</script>
```

### Variante 2: Mit externem Script

```html
<iframe id="spd-gallery"
        src="https://YOUR-USERNAME.github.io/spd-gallery/"
        style="width:100%;border:0;min-height:600px"
        loading="lazy">
</iframe>
<script src="https://YOUR-USERNAME.github.io/spd-gallery/resize-iframe.js"></script>
```

## Deep Links

Sie können direkt zu einem bestimmten Bild verlinken:

```
https://YOUR-USERNAME.github.io/spd-gallery/?id=2025-10-26-001
```

Die Lightbox öffnet sich automatisch mit dem angegebenen Bild.

## Tastatursteuerung

- **Suche fokussieren**: Tab-Navigation
- **Lightbox Navigation**: Pfeiltasten links/rechts
- **Lightbox schließen**: ESC
- **Hashtag-Filter zurücksetzen**: ESC

## Browser-Kompatibilität

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile Browser: ✅

## Performance

Die Galerie ist für 100-200 Bilder optimiert:
- Thumbnails in WebP-Format
- Lazy Loading
- Responsive Images (srcset/sizes)
- Minimales JavaScript
- Keine externen Fonts oder Tracker

Erwarteter Lighthouse-Score:
- Performance: ≥ 90
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 90

## Projektstruktur

```
spd-gallery/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions Workflow
├── public/
│   ├── img/
│   │   ├── originals/          # Original-Bilder (nicht im Repo)
│   │   └── thumbs/             # Generierte Thumbnails (nicht im Repo)
│   └── resize-iframe.js        # WordPress iFrame-Resize-Script
├── scripts/
│   └── generate-thumbs.js      # Thumbnail-Generator
├── src/
│   ├── data/
│   │   └── images.json         # Generierte Bilddaten
│   ├── pages/
│   │   └── index.astro         # Hauptseite
│   └── styles/
│       └── gallery.css         # Styles
├── astro.config.mjs            # Astro-Konfiguration
├── package.json
└── README.md
```

## Entwicklung

### Neue Bilder hinzufügen

1. Bilder in `public/img/originals/` kopieren
2. Optional: JSON-Metadaten erstellen
3. `npm run generate` ausführen
4. `npm run dev` zum Testen

### CSS anpassen

Bearbeiten Sie `src/styles/gallery.css`. Die SPD-Farben sind als CSS-Variablen definiert:

```css
:root {
  --spd-red: #e3000f;
  --spd-dark: #1a1a1a;
  --spd-light: #f5f5f5;
  /* ... */
}
```

## Troubleshooting

### Bilder werden nicht angezeigt

- Prüfen Sie, ob die Bilder in `public/img/originals/` liegen
- Führen Sie `npm run generate` aus
- Prüfen Sie `src/data/images.json`

### GitHub Pages zeigt 404

- Prüfen Sie die `astro.config.mjs` (site + base)
- Prüfen Sie GitHub Pages Settings (Branch: gh-pages)
- Warten Sie einige Minuten nach dem Deploy

### iFrame-Höhe passt sich nicht an

- Prüfen Sie, ob das resize-iframe.js-Script eingebunden ist
- Prüfen Sie die Browser-Konsole auf CORS-Fehler
- Prüfen Sie, ob die iframe-ID korrekt ist (`spd-gallery`)

## Lizenz

Dieses Projekt wurde für die SPD Langenselbold erstellt.

## Support

Bei Fragen oder Problemen öffnen Sie ein Issue auf GitHub oder kontaktieren Sie den Entwickler.
