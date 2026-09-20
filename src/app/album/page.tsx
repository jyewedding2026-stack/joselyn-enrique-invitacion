"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { wedding } from "@/content/wedding";
import { useOrigin } from "@/hooks/use-client-store";
import {
  addAlbumFile,
  deleteAlbumItem,
  getAlbumTotalBytes,
  listAlbumItems,
  type AlbumItem,
} from "@/lib/storage";

export default function AlbumPage() {
  const origin = useOrigin();
  const [items, setItems] = useState<AlbumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalBytes, setTotalBytes] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  async function reloadAlbum() {
    const [list, total] = await Promise.all([
      listAlbumItems(),
      getAlbumTotalBytes(),
    ]);
    setItems(list);
    setTotalBytes(total);
  }

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        setLoading(false);
        setError(
          (prev) =>
            prev ?? "El álbum tardó demasiado en cargar. Recarga la página."
        );
      }
    }, 6000);

    void (async () => {
      try {
        setError(null);
        const [list, total] = await Promise.all([
          listAlbumItems(),
          getAlbumTotalBytes(),
        ]);
        if (cancelled) return;
        setItems(list);
        setTotalBytes(total);
      } catch {
        if (!cancelled) {
          setError("No se pudo cargar el álbum en este navegador.");
        }
      } finally {
        if (!cancelled) setLoading(false);
        window.clearTimeout(timeout);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  async function onFilesSelected(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        await addAlbumFile(file);
      }
      toast.success(
        files.length === 1
          ? "Archivo añadido"
          : `${files.length} archivos añadidos`
      );
      await reloadAlbum();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al subir el archivo.";
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onDelete(id: string) {
    try {
      await deleteAlbumItem(id);
      setItems((prev) => {
        const target = prev.find((i) => i.id === id);
        if (target) URL.revokeObjectURL(target.url);
        return prev.filter((i) => i.id !== id);
      });
      setTotalBytes(await getAlbumTotalBytes());
      toast.success("Eliminado del álbum");
    } catch {
      toast.error("No se pudo eliminar.");
    }
  }

  const albumUrl = origin ? `${origin}/album` : "/album";
  const usedMb = (totalBytes / (1024 * 1024)).toFixed(1);
  const maxMb = (wedding.album.maxTotalBytes / (1024 * 1024)).toFixed(0);

  return (
    <main className="min-h-svh bg-[var(--warm-white)]">
      <div className="border-b border-[var(--sand-border)] bg-[var(--sand)]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 md:px-8">
          <div>
            <Link
              href="/"
              className="text-sm text-[var(--olive)] underline-offset-4 hover:underline"
            >
              ← Volver a la invitación
            </Link>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--olive-deep)] md:text-4xl">
              {wedding.album.title}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-[var(--ink-soft)]">
              {wedding.album.description}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--sand-border)] bg-[var(--warm-white)] p-3">
            <QRCodeSVG
              value={albumUrl}
              size={96}
              bgColor="transparent"
              fgColor="#3f4a32"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => void onFilesSelected(e.target.files)}
          />
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--olive)] px-4 text-sm font-medium text-[var(--warm-white)] hover:bg-[var(--olive-deep)] disabled:opacity-60"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus className="size-4" />
            {uploading ? "Subiendo…" : "Subir fotos o videos"}
          </button>
          <p className="text-xs text-[var(--olive-muted)]">
            Máx. {(wedding.album.maxFileBytes / (1024 * 1024)).toFixed(0)} MB por
            archivo · {usedMb}/{maxMb} MB usados
          </p>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        {loading ? (
          <p className="mt-10 text-sm text-[var(--ink-soft)]">Cargando álbum…</p>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-[var(--sand-border)] bg-[var(--sand-muted)]/40 px-6 py-16 text-center">
            <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--olive-deep)]">
              El álbum está vacío
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--ink-soft)]">
              Sé el primero en subir un recuerdo. Los archivos se guardan solo en
              este navegador (IndexedDB).
            </p>
          </div>
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((item) => (
              <li
                key={item.id}
                className="group relative overflow-hidden rounded-xl border border-[var(--sand-border)] bg-[var(--sand)]"
              >
                {item.type.startsWith("video/") ? (
                  <video
                    src={item.url}
                    className="aspect-square w-full object-cover"
                    controls
                    playsInline
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.name}
                    className="aspect-square w-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => void onDelete(item.id)}
                  className="absolute top-2 right-2 rounded-md bg-[var(--warm-white)]/90 p-1.5 text-[var(--olive-deep)] opacity-100 shadow-sm transition md:opacity-0 md:group-hover:opacity-100"
                  aria-label={`Eliminar ${item.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
