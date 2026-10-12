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

  /** Portada de bienvenida (overlay) — textos y acentos editables */
  cover: {
    welcomePhrase: "Nuestra Boda",
    invitedLine: "Están cordialmente invitados",
    initials: "J & E",
    ctaLabel: "TOCA EL SELLO",
    placeLine: "Ica · Perú",
    colors: {
      cream: "#FDFBF7",
      creamDeep: "#F3EEE4",
      sage: "#6B735F",
      sageDeep: "#5A6250",
      gold: "#C9A227",
      goldDeep: "#8A6414",
      ink: "#3A342C",
      muted: "#8A8074",
    },
  },

  date: {
    iso: "2026-12-05",
    display: "5 de diciembre de 2026",
    shortDisplay: "05 · 12 · 2026",
  },

  ceremony: {
    time: "05:00 pm",
    place: "Santuario del Señor de Luren",
    city: "Ica",
    address: "Calle Piura 700, Ica",
    lat: -14.070598,
    lng: -75.725617,
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Santuario+del+Se%C3%B1or+de+Luren%2C+Calle+Piura+700%2C+Ica",
  },

  reception: {
    time: "06:30 pm",
    place: "Hacienda Hotel Macacona",
    city: "Ica",
    address: "Urb. La Florida 4ta Etapa Sector Macacona, Ica",
    lat: -14.030912,
    lng: -75.772326,
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Hacienda+Hotel+Macacona%2C+Urb.+La+Florida+4ta+Etapa+Sector+Macacona%2C+Ica",
  },

  dressCode: {
    label: "Elegante",
    illustration: "./images/dress-code-couple.jpg",
    lines: [
      { lead: "Hombres", text: "terno y corbata" },
      { lead: "Mujeres", text: "vestido largo o cocktail sofisticado" },
      {
        lead: "Nota",
        text: "Reservamos los colores blanco, beige y marfil exclusivamente para la novia. ¡Gracias por tu comprensión!",
      },
    ],
  },

  story: {
    welcomeTitle: "Nuestra historia",
    openingImage: {
      src: "./images/historia-mundo.jpg",
      alt: "Joselyn y Enrique frente al mundo",
    },
    closingImage: {
      src: "./images/historia-pedida.jpg",
      alt: "La pedida de mano",
    },
    chapters: [
      {
        title: "El Comienzo",
        body: "Nos conocimos en la universidad en 2012 y, tras dos años de conocernos, comenzamos una hermosa relación en 2014. Nos enamoramos desde el primer momento y supimos desde ese instante que no solo coincidíamos en la misma carrera y la misma pasión, sino que estábamos destinados a estar juntos.",
      },
      {
        title: "El Camino Juntos",
        body: "A lo largo de estos 12 años, hemos construido una historia llena de complicidad, risas y momentos inolvidables. Juntos nos aventuramos a cruzar fronteras, explorar ciudades lejanas y crear recuerdos que jamás olvidaremos. ¡Quién diría que nuestro amor terminaría dándole la vuelta al mundo!",
      },
      {
        title: "El Sí",
        body: 'Jamás imaginamos que sellaríamos este compromiso a 15,512 km de distancia: desde nuestra ciudad del eterno sol hasta el país del sol naciente, en el lugar exacto donde la infancia sueña y la magia cobra vida. Allí dijimos el "sí" más esperado, listos para iniciar una nueva etapa juntos.',
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
      "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=1080&q=55",
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
    title: "Confirma tu asistencia",
    description:
      "Completa el formulario para decirnos si nos acompañarás en Ica.",
    deadlineNote: "PLACEHOLDER: Confirma antes del 15 de noviembre de 2026.",
    submitLabel: "Enviar",
  },
} as const;

export type WeddingContent = typeof wedding;
