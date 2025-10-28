import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ORIG = 'public/img/originals';
const THUMBS = 'public/img/thumbs';
const OUT = 'src/data/images.json';

await fs.promises.mkdir(THUMBS, { recursive: true });
await fs.promises.mkdir(path.dirname(OUT), { recursive: true });

// Check if originals directory exists
let files = [];
try {
  files = (await fs.promises.readdir(ORIG))
    .filter(f => /\.(jpe?g|png|webp|avif|heic)$/i.test(f));
} catch (err) {
  if (err.code === 'ENOENT') {
    console.log('No originals directory found, creating empty images.json');
    await fs.promises.mkdir(ORIG, { recursive: true });
  } else {
    throw err;
  }
}

const items = [];
for (const f of files) {
  const inPath = path.join(ORIG, f);
  const img = sharp(inPath);
  const meta = await img.metadata();
  const base = path.parse(f).name;

  const sidecarPath = path.join(ORIG, `${base}.json`);
  let sidecar = {};

  // Wenn keine JSON-Datei existiert, erstelle eine mit Platzhaltern
  if (!fs.existsSync(sidecarPath)) {
    console.log(`Creating placeholder JSON for: ${base}`);
    const placeholder = createPlaceholderJson(base);
    await fs.promises.writeFile(sidecarPath, JSON.stringify(placeholder, null, 2));
    sidecar = placeholder;
  } else {
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

// Erstellt eine Platzhalter-JSON-Datei basierend auf dem Dateinamen
function createPlaceholderJson(filename) {
  const year = inferYear(filename);
  const event = inferEvent(filename);

  // Extrahiere mögliche Personen und Tags aus dem Dateinamen
  // Format: 2025-10-26_Name_Name oder 2025-10-26_Tag_Name
  const parts = filename.split('_').slice(1); // Entferne Datum-Teil
  const people = [];
  const tags = [];

  // Versuche Personennamen und Tags zu identifizieren
  parts.forEach(part => {
    // Ersetze Bindestriche durch Leerzeichen für Namen
    const cleanPart = part.replace(/-/g, ' ');

    // Wenn es wie ein Name aussieht (enthält Groß- und Kleinbuchstaben)
    if (/^[A-ZÄÖÜ][a-zäöüß]+(\s[A-ZÄÖÜ][a-zäöüß]+)*$/.test(cleanPart)) {
      people.push(cleanPart);
    } else if (part.includes('-') && part !== parts[0]) {
      // Wenn es Bindestriche enthält, könnte es ein Tag sein
      tags.push(part.replace(/-/g, ' '));
    }
  });

  const hashtags = deriveHashtags({ year, event, location: null });

  // Füge spezielle Hashtags basierend auf Tags hinzu
  tags.forEach(tag => {
    const hashtagVersion = '#' + tag.replace(/\s+/g, '');
    if (!hashtags.includes(hashtagVersion)) {
      hashtags.push(hashtagVersion);
    }
  });

  return {
    title: "Inhalt wird nachgetragen.",
    caption: "Inhalt wird nachgetragen.",
    credit: "Foto: SPD Langenselbold",
    year: year,
    event: event || "Inhalt wird nachgetragen.",
    location: "Inhalt wird nachgetragen.",
    people: people,
    tags: tags,
    hashtags: hashtags,
    alt: parts.join(' ').replace(/-/g, ' ') || filename
  };
}

await fs.promises.writeFile(OUT, JSON.stringify(items,null,2));
console.log(`Wrote ${items.length} items to ${OUT}`);
