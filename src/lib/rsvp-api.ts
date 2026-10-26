/**
 * Cliente del RSVP vía Google Apps Script (Sheets).
 * GET ?id= carga el grupo del enlace; POST guarda confirmaciones.
 */

export const RSVP_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbwOiuMpwh6ZVRcnGJZ9xlxj_Lixjtcpoim3eJRGn5xDLVznfdBBvM8-55Lh79MFb7aq5w/exec";

export type RsvpEstado = "Asistirá" | "No asistirá" | "Pendiente";

export type RsvpPersona = {
  idPersona: string;
  nombre: string;
  tipo: string;
  estado: RsvpEstado;
};

export type RsvpGrupo = {
  idGrupo: string;
  yaRespondio: boolean;
  personas: RsvpPersona[];
};

export type ObtenerPorIdResult =
  | { success: true; grupo: RsvpGrupo }
  | { success: false; message: string };

export type BuscarResult =
  | { kind: "none"; message: string }
  | { kind: "single"; grupo: RsvpGrupo }
  | { kind: "multiple"; grupos: RsvpGrupo[] };

export type ConfirmarPayload = {
  idGrupo: string;
  confirmaciones: Array<{ idPersona: string; estado: "Asistirá" | "No asistirá" }>;
};

export type ConfirmarResult = { success: true } | { success: false; message: string };

function asString(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function readYaRespondio(raw: Record<string, unknown>): boolean {
  const value = raw.yaRespondio ?? raw.ya_respondio ?? raw.YA_RESPONDIO;
  if (value === true) return true;
  return asString(value).toLowerCase() === "true";
}

function normalizeEstado(raw: unknown): RsvpEstado {
  const s = asString(raw).toLowerCase();
  if (s.includes("no") || s === "no asistirá" || s === "no asistira") {
    return "No asistirá";
  }
  if (
    s.includes("asist") &&
    !s.includes("pend") &&
    s !== "pendiente"
  ) {
    // "Asistirá", "asistira", "Asistira", etc.
    if (!s.includes("no")) return "Asistirá";
  }
  if (s === "sí" || s === "si" || s === "yes") return "Asistirá";
  if (s === "no") return "No asistirá";
  return "Pendiente";
}

function normalizePersona(raw: Record<string, unknown>): RsvpPersona | null {
  const idPersona = asString(
    raw.idPersona ?? raw.ID_PERSONA ?? raw.id_persona ?? raw.id,
  );
  const fromParts = [asString(raw.NOMBRES), asString(raw.APELLIDOS)]
    .filter(Boolean)
    .join(" ");
  const nombre = asString(
    raw.nombreCompleto ??
      raw.NombreCompleto ??
      raw.nombre ??
      raw.NOMBRE ??
      raw.name ??
      fromParts,
  );
  if (!idPersona || !nombre) return null;
  const tipo = asString(raw.tipo ?? raw.TIPO ?? raw.rol ?? "Invitado") || "Invitado";
  const estado = normalizeEstado(raw.estado ?? raw.ESTADO ?? raw.status);
  return { idPersona, nombre, tipo, estado };
}

function normalizeGrupo(raw: Record<string, unknown>): RsvpGrupo | null {
  const idGrupo = asString(raw.idGrupo ?? raw.ID_GRUPO ?? raw.id_grupo ?? raw.grupoId);
  const listRaw =
    raw.personas ?? raw.PERSONAS ?? raw.miembros ?? raw.integrantes ?? raw.guests;
  if (!idGrupo || !Array.isArray(listRaw)) return null;
  const personas = listRaw
    .map((item) =>
      item && typeof item === "object"
        ? normalizePersona(item as Record<string, unknown>)
        : null,
    )
    .filter((p): p is RsvpPersona => p != null);
  if (personas.length === 0) return null;
  return { idGrupo, yaRespondio: readYaRespondio(raw), personas };
}

function collectGrupos(data: Record<string, unknown>): RsvpGrupo[] {
  const buckets = [
    data.grupos,
    data.coincidencias,
    data.resultados,
    data.matches,
    data.gruposEncontrados,
  ];
  for (const bucket of buckets) {
    if (!Array.isArray(bucket)) continue;
    const grupos = bucket
      .map((item) =>
        item && typeof item === "object"
          ? normalizeGrupo(item as Record<string, unknown>)
          : null,
      )
      .filter((g): g is RsvpGrupo => g != null);
    if (grupos.length > 0) return grupos;
  }

  // Single group at root
  const single = normalizeGrupo(data);
  if (single) return [single];

  // Root personas + idGrupo
  const idGrupo = asString(data.idGrupo ?? data.ID_GRUPO);
  const personasRaw = data.personas ?? data.PERSONAS;
  if (idGrupo && Array.isArray(personasRaw)) {
    const personas = personasRaw
      .map((item) =>
        item && typeof item === "object"
          ? normalizePersona(item as Record<string, unknown>)
          : null,
      )
      .filter((p): p is RsvpPersona => p != null);
    if (personas.length > 0) {
      return [{ idGrupo, yaRespondio: readYaRespondio(data), personas }];
    }
  }

  return [];
}

async function parseJsonResponse(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("El servidor no devolvió datos.");
  }
  if (trimmed.startsWith("<")) {
    throw new Error(
      "No se pudo conectar con la lista de invitados. Intenta de nuevo más tarde.",
    );
  }
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    throw new Error("Respuesta inválida del servidor de confirmaciones.");
  }
}

/** GET ?id= — carga el grupo del enlace único. */
export async function obtenerPorId(id: string): Promise<ObtenerPorIdResult> {
  const query = id.trim();
  if (!query) {
    return { success: false, message: "Acción no válida." };
  }

  const url = new URL(RSVP_ENDPOINT);
  url.searchParams.set("id", query);

  const res = await fetch(url.toString(), {
    method: "GET",
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error("No pudimos cargar tu invitación. Intenta de nuevo.");
  }

  const data = await parseJsonResponse(res);
  if (data.success === false) {
    return {
      success: false,
      message:
        asString(data.mensaje ?? data.message ?? data.error) ||
        "Enlace de invitación no encontrado.",
    };
  }

  const grupo = collectGrupos(data)[0];
  if (!grupo) {
    return {
      success: false,
      message:
        asString(data.mensaje ?? data.message ?? data.error) ||
        "No pudimos leer los datos de tu invitación.",
    };
  }

  return { success: true, grupo };
}

/** GET ?action=buscar&nombre= — nunca carga la lista completa. */
export async function buscarPorNombre(nombre: string): Promise<BuscarResult> {
  const query = nombre.trim().replace(/\s+/g, " ");
  if (!query) {
    return { kind: "none", message: "Escribe tu nombre y apellido." };
  }

  const url = new URL(RSVP_ENDPOINT);
  url.searchParams.set("action", "buscar");
  url.searchParams.set("nombre", query);

  const res = await fetch(url.toString(), {
    method: "GET",
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error("No pudimos buscar tu nombre. Intenta de nuevo.");
  }

  const data = await parseJsonResponse(res);
  const grupos = collectGrupos(data);
  const multipleFlag =
    data.multipleCoincidencias === true ||
    data.multiple === true ||
    data.variasCoincidencias === true;

  if (grupos.length === 0) {
    const message =
      asString(data.mensaje ?? data.message ?? data.error) ||
      "No encontramos tu nombre en la lista. Revisa la ortografía o escribe nombre y apellido.";
    return { kind: "none", message };
  }

  if (multipleFlag || grupos.length > 1) {
    return { kind: "multiple", grupos };
  }

  return { kind: "single", grupo: grupos[0]! };
}

/**
 * POST JSON with text/plain to avoid Apps Script CORS preflight failures.
 * doPost still parses the JSON body.
 */
export async function confirmarAsistencia(
  payload: ConfirmarPayload,
): Promise<ConfirmarResult> {
  const res = await fetch(RSVP_ENDPOINT, {
    method: "POST",
    redirect: "follow",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    return {
      success: false,
      message: "No pudimos guardar tu confirmación. Intenta de nuevo.",
    };
  }

  const data = await parseJsonResponse(res);
  if (data.success === true || data.ok === true) {
    return { success: true };
  }

  return {
    success: false,
    message:
      asString(data.mensaje ?? data.message ?? data.error) ||
      "No se pudo guardar la confirmación.",
  };
}

/** Etiqueta corta para desambiguar grupos (acompañantes / tipo). */
export function describeGrupo(grupo: RsvpGrupo): string {
  const tipos = grupo.personas.map((p) => p.tipo).filter(Boolean);
  const names = grupo.personas.map((p) => p.nombre);
  const companions = names.slice(1);
  const tipoHint = tipos.length ? ` · ${[...new Set(tipos)].join(", ")}` : "";
  if (companions.length === 0) {
    return `${names[0]}${tipoHint}`;
  }
  return `${names[0]} (+ ${companions.join(", ")})${tipoHint}`;
}
