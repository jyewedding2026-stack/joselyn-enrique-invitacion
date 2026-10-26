# Invitación digital — Joselyn & Enrique

Invitación web tipo Invitify para la boda de **Joselyn y Enrique** (5 de diciembre de 2026, Ica). Next.js App Router + TypeScript + Tailwind + shadcn/ui. Copy en español. Persistencia demo solo en el navegador (`localStorage` + IndexedDB).

Export estático (`output: "export"`) publicado de forma **permanente en Arweave** (sin reclamar, sin cuenta).

## Link público permanente

Ver [`PUBLIC_URL.md`](PUBLIC_URL.md).

**Principal:** https://turbo-gateway.com/JOW-k91kt8Aai3G_qtxeTPQqfbNPmKK4w_YmP0jcAqc

## Cómo correr en local

```bash
npm install
npm run build
npm start
```

Abre [http://127.0.0.1:43127](http://127.0.0.1:43127).

Desarrollo:

```bash
npm run dev
```

## Publicar (permanente, sin reclamar)

```bash
npm run publish:permanent
```

Esto genera el export estático, parte archivos grandes para el límite gratuito de Arweave Turbo y sube el sitio. El link nuevo queda en `PUBLIC_URL.md` y `publish-result.json`.

## Qué incluye

- **Home (`/`)** — sobre, hero sticky, historia, logística con Google Maps, dress code, hospedaje, regalos, RSVP, álbum
- **`/album`** — subida de fotos/videos a IndexedDB + galería + QR

## Editar contenido

Todo el copy editable vive en [`src/content/wedding.ts`](src/content/wedding.ts).

## Fuera de alcance (demo)

Auth, base de datos real, emails, pagos, subida a la nube, panel admin remoto.
