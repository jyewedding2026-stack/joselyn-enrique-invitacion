# Invitación digital — Joselyn & Enrique

Invitación web tipo Invitify para la boda de **Joselyn y Enrique** (5 de diciembre de 2026, Ica). Next.js App Router + TypeScript + Tailwind + shadcn/ui. Copy en español. Persistencia demo solo en el navegador (`localStorage` + IndexedDB); sin backend, auth ni base de datos.

## Cómo correr

```bash
npm install
npm run dev
```

Abre [http://127.0.0.1:43127](http://127.0.0.1:43127). El script `dev` usa el puerto **43127** y escucha en `0.0.0.0`.

```bash
npm run build
npm start
```

## Qué incluye

- **Home (`/`)** — hero, historia, logística con mapas Leaflet/OSM, dress code, hospedaje, regalos (copiar), RSVP, CTA de álbum, pases QR
- **`/album`** — subida de fotos/videos a IndexedDB + galería + QR compartible
- **`/pase` y `/pase/[id]`** — generación y vista de pases QR únicos (localStorage)

## Editar contenido

Todo el copy y los placeholders editables viven en:

[`src/content/wedding.ts`](src/content/wedding.ts)

Ahí actualizas historia, fotos, hospedaje, datos bancarios, textos de RSVP/álbum, etc.

## Fuera de alcance (demo)

Auth, base de datos real, emails, pagos, subida a la nube, panel admin remoto.
