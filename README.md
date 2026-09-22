# Invitación digital — Joselyn & Enrique

Invitación web tipo Invitify para la boda de **Joselyn y Enrique** (5 de diciembre de 2026, Ica). Next.js App Router + TypeScript + Tailwind + shadcn/ui. Copy en español. Persistencia demo solo en el navegador (`localStorage` + IndexedDB); sin backend, auth ni base de datos.

Export estático (`output: "export"`) para poder publicarla en hosting estático sin que el link dependa de un túnel frágil.

## Link público

Ver siempre [`PUBLIC_URL.md`](PUBLIC_URL.md).

- **Subdominio fijo (auto-recuperable):** https://invitacion-joselyn-enrique.loca.lt  
  Mantenerlo vivo: `npm run keep:public`
- **Vercel (permanente al reclamar):** `npm run publish:public` y abre el *claim URL* que imprime el script (1 clic).

## Cómo correr

```bash
npm install
npm run build
npm start
```

Abre [http://127.0.0.1:43127](http://127.0.0.1:43127).

Para desarrollo con hot reload:

```bash
npm run dev
```

## Publicar / no dejar caer el link

```bash
# 1) Hosting claimable en Vercel (recomendado para invitados)
npm run publish:public
# Abre el claim URL del resultado → el .vercel.app queda permanente

# 2) Túnel con subdominio FIJO + watchdog (mismo link tras reinicios)
npm run keep:public
```

El watchdog reinicia el servidor estático y el túnel `invitacion-joselyn-enrique.loca.lt` si se caen, para que el enlace no cambie.

## Qué incluye

- **Home (`/`)** — sobre, hero sticky, historia, logística con Google Maps, dress code, hospedaje, regalos, RSVP, álbum, pases QR
- **`/album`** — subida de fotos/videos a IndexedDB + galería + QR
- **`/pase` y `/pase/ver?id=`** — generación y vista de pases QR (localStorage)

## Editar contenido

Todo el copy editable vive en [`src/content/wedding.ts`](src/content/wedding.ts).

## Fuera de alcance (demo)

Auth, base de datos real, emails, pagos, subida a la nube, panel admin remoto.
