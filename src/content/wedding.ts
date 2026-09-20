/**
 * Contenido editable de la invitación.
 * Actualiza textos, fotos, regalos y hospedaje aquí.
 */

export const wedding = {
  couple: {
    bride: "Joselyn",
    groom: "Enrique",
    displayName: "Joselyn & Enrique",
    shortLine: "Celebramos nuestro sí en Ica, bajo el sol del desierto.",
  },

  date: {
    iso: "2026-12-05",
    display: "5 de diciembre de 2026",
    shortDisplay: "05 · 12 · 2026",
  },

  ceremony: {
    time: "5:00 pm",
    place: "Santuario Nacional del Señor de Luren",
    city: "Ica",
    address: "Santuario Nacional del Señor de Luren, Ica, Perú",
    lat: -14.0678,
    lng: -75.7286,
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Santuario+Nacional+del+Se%C3%B1or+de+Luren+Ica",
  },

  reception: {
    time: "7:00 pm",
    place: "Hacienda Hotel Macacona",
    city: "Ica",
    address: "Hacienda Hotel Macacona, Ica, Perú",
    lat: -14.0185,
    lng: -75.752,
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Hacienda+Hotel+Macacona+Ica",
  },

  dressCode: {
    label: "Formal",
    description:
      "Te esperamos con elegancia: trajes, vestidos largos o cocktail sofisticado. Evita blanco y crema.",
    inspirationImages: [
      {
        src: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
        alt: "Inspiración vestido formal",
      },
      {
        src: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
        alt: "Inspiración traje formal",
      },
      {
        src: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80",
        alt: "Inspiración look cocktail",
      },
    ],
  },

  /** PLACEHOLDER — reemplaza con tu historia real y fotos */
  story: {
    welcomeTitle: "Nuestra historia",
    welcome:
      "PLACEHOLDER: Escribe aquí el mensaje de bienvenida para tus invitados. Cómo se conocieron, el momento en que dijeron sí, y lo que significa compartir este día juntos.",
    chapters: [
      {
        title: "El comienzo",
        body: "PLACEHOLDER: Primer encuentro, primera cita, o cómo empezó todo.",
        image:
          "https://images.unsplash.com/photo-1522673607200-164a2e637a08?w=1000&q=80",
      },
      {
        title: "El camino juntos",
        body: "PLACEHOLDER: Viajes, risas y momentos que sellaron su historia.",
        image:
          "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1000&q=80",
      },
      {
        title: "El sí",
        body: "PLACEHOLDER: La propuesta y el comienzo de esta nueva etapa.",
        image:
          "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1000&q=80",
      },
    ],
  },

  /** PLACEHOLDER — recomendaciones de hospedaje */
  lodging: [
    {
      name: "PLACEHOLDER: Hotel Centro Ica",
      zone: "Centro de Ica",
      note: "Cerca del santuario. Ideal para huéspedes que llegan la mañana del evento.",
      link: "https://www.google.com/maps/search/?api=1&query=hoteles+Ica+Peru",
    },
    {
      name: "PLACEHOLDER: Hacienda Hotel Macacona",
      zone: "Macacona",
      note: "Misma sede de la recepción. Consulta disponibilidad con anticipación.",
      link: "https://www.google.com/maps/search/?api=1&query=Hacienda+Hotel+Macacona+Ica",
    },
    {
      name: "PLACEHOLDER: Hotel oasis / viñedo",
      zone: "Alrededores de Ica",
      note: "Ambiente más tranquilo, a 15–20 min del centro.",
      link: "https://www.google.com/maps/search/?api=1&query=hoteles+viniedos+Ica",
    },
  ],

  /** PLACEHOLDER — datos bancarios / lista de regalos */
  gifts: {
    intro:
      "PLACEHOLDER: Tu presencia es el mejor regalo. Si deseas obsequiarnos algo más, puedes usar estos datos.",
    accounts: [
      {
        bank: "PLACEHOLDER: Banco de Crédito del Perú",
        holder: "PLACEHOLDER: Joselyn / Enrique",
        account: "PLACEHOLDER: 191-XXXXXXX-0-XX",
        clabeOrCci: "PLACEHOLDER: CCI 002191XXXXXXXXXXXXXX",
        alias: "PLACEHOLDER: joselyn.enrique.boda",
      },
    ],
  },

  hero: {
    image:
      "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1600&q=80",
    imageAlt: "Dunas doradas al atardecer en el desierto",
  },

  album: {
    title: "Álbum compartido",
    description:
      "Sube tus fotos y videos del día. Todo se guarda en este dispositivo (demo local).",
    shareHint: "Comparte el enlace o el código QR con los invitados.",
    maxFileBytes: 8 * 1024 * 1024,
    maxTotalBytes: 80 * 1024 * 1024,
  },

  rsvp: {
    title: "Confirmar asistencia",
    description:
      "Cuéntanos si nos acompañarás. Tu respuesta se guarda en este navegador (demo).",
    deadlineNote: "PLACEHOLDER: Confirma antes del 15 de noviembre de 2026.",
  },

  pass: {
    title: "Pase digital",
    description:
      "Genera un pase con código QR único para tu familia o grupo. Úsalo el día del evento.",
  },
} as const;

export type WeddingContent = typeof wedding;
