import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { wedding } from "@/content/wedding";

const RSVP_KEY = "boda-rsvp-entries";
const PASSES_KEY = "boda-digital-passes";
const ALBUM_DB = "boda-album-db";
const ALBUM_STORE = "media";

export type RsvpEntry = {
  id: string;
  name: string;
  attending: boolean;
  guestCount: number;
  message: string;
  createdAt: string;
};

export type DigitalPass = {
  id: string;
  familyName: string;
  guestCount: number;
  createdAt: string;
};

type AlbumDB = DBSchema & {
  media: {
    key: string;
    value: {
      id: string;
      name: string;
      type: string;
      size: number;
      createdAt: string;
      blob: Blob;
    };
  };
};

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadRsvps(): RsvpEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RSVP_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RsvpEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRsvp(
  input: Omit<RsvpEntry, "id" | "createdAt">
): RsvpEntry {
  const entry: RsvpEntry = {
    ...input,
    id: uid(),
    createdAt: new Date().toISOString(),
  };
  const all = loadRsvps();
  all.unshift(entry);
  localStorage.setItem(RSVP_KEY, JSON.stringify(all));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("boda-rsvp-changed"));
  }
  return entry;
}

export function loadPasses(): DigitalPass[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PASSES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DigitalPass[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePass(
  input: Omit<DigitalPass, "id" | "createdAt"> & { id?: string }
): DigitalPass {
  const pass: DigitalPass = {
    id: input.id ?? uid(),
    familyName: input.familyName,
    guestCount: input.guestCount,
    createdAt: new Date().toISOString(),
  };
  const all = loadPasses().filter((p) => p.id !== pass.id);
  all.unshift(pass);
  localStorage.setItem(PASSES_KEY, JSON.stringify(all));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("boda-pass-changed"));
  }
  return pass;
}

export function getPassById(id: string): DigitalPass | undefined {
  return loadPasses().find((p) => p.id === id);
}

let dbPromise: Promise<IDBPDatabase<AlbumDB>> | null = null;

function getAlbumDb() {
  if (!dbPromise) {
    dbPromise = openDB<AlbumDB>(ALBUM_DB, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(ALBUM_STORE)) {
          db.createObjectStore(ALBUM_STORE, { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export type AlbumItem = {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  url: string;
};

export async function listAlbumItems(): Promise<AlbumItem[]> {
  const db = await getAlbumDb();
  const rows = await db.getAll(ALBUM_STORE);
  return rows
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      size: row.size,
      createdAt: row.createdAt,
      url: URL.createObjectURL(row.blob),
    }));
}

export async function getAlbumTotalBytes(): Promise<number> {
  const db = await getAlbumDb();
  const rows = await db.getAll(ALBUM_STORE);
  return rows.reduce((sum, row) => sum + row.size, 0);
}

export async function addAlbumFile(file: File): Promise<AlbumItem> {
  if (file.size > wedding.album.maxFileBytes) {
    throw new Error(
      `El archivo supera el límite de ${(wedding.album.maxFileBytes / (1024 * 1024)).toFixed(0)} MB.`
    );
  }
  const total = await getAlbumTotalBytes();
  if (total + file.size > wedding.album.maxTotalBytes) {
    throw new Error(
      `El álbum supera el límite total de ${(wedding.album.maxTotalBytes / (1024 * 1024)).toFixed(0)} MB en este navegador.`
    );
  }
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    throw new Error("Solo se permiten fotos o videos.");
  }

  const id = uid();
  const record = {
    id,
    name: file.name,
    type: file.type,
    size: file.size,
    createdAt: new Date().toISOString(),
    blob: file,
  };
  const db = await getAlbumDb();
  await db.put(ALBUM_STORE, record);
  return {
    id,
    name: record.name,
    type: record.type,
    size: record.size,
    createdAt: record.createdAt,
    url: URL.createObjectURL(file),
  };
}

export async function deleteAlbumItem(id: string) {
  const db = await getAlbumDb();
  await db.delete(ALBUM_STORE, id);
}
