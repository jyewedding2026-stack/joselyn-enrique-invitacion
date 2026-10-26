"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { wedding } from "@/content/wedding";
import { FadeIn } from "@/components/motion";
import {
  confirmarAsistencia,
  obtenerPorId,
  type RsvpEstado,
  type RsvpGrupo,
  type RsvpPersona,
} from "@/lib/rsvp-api";

type Phase = "loading" | "missing" | "rejected" | "network" | "form" | "done";

type AttendanceChoice = "Asistirá" | "No asistirá";

const CHOICE_BUTTONS: Array<{ label: string; estado: AttendanceChoice }> = [
  { label: "Sí, asistire", estado: "Asistirá" },
  { label: "No podré asistir", estado: "No asistirá" },
];

const NETWORK_MESSAGE =
  "No pudimos conectar con la lista de invitados. Intenta de nuevo más tarde.";

function labelForEstado(estado: RsvpEstado): string {
  return CHOICE_BUTTONS.find((choice) => choice.estado === estado)?.label ?? estado;
}

function estadoToChoice(estado: RsvpEstado): AttendanceChoice | "" {
  if (estado === "Asistirá") return "Asistirá";
  if (estado === "No asistirá") return "No asistirá";
  return "";
}

function initialChoices(
  personas: RsvpPersona[],
): Record<string, AttendanceChoice | ""> {
  const next: Record<string, AttendanceChoice | ""> = {};
  for (const persona of personas) {
    next[persona.idPersona] = estadoToChoice(persona.estado);
  }
  return next;
}

function groupIsLocked(grupo: RsvpGrupo): boolean {
  if (grupo.yaRespondio) return true;
  return (
    grupo.personas.length > 0 &&
    grupo.personas.every((persona) => persona.estado !== "Pendiente")
  );
}

function friendlyError(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : "";
  if (
    !raw ||
    /failed to fetch|networkerror|load failed|network request failed/i.test(raw)
  ) {
    return fallback;
  }
  return raw;
}

function readGuestId(): string {
  return new URLSearchParams(window.location.search).get("id")?.trim() ?? "";
}

export function RsvpSection() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [attempt, setAttempt] = useState(0);
  const [grupo, setGrupo] = useState<RsvpGrupo | null>(null);
  const [choices, setChoices] = useState<Record<string, AttendanceChoice | "">>(
    {},
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const id = readGuestId();
    const task = id
      ? obtenerPorId(id).then((result) =>
          result.success
            ? { kind: "form" as const, grupo: result.grupo }
            : { kind: "rejected" as const, message: result.message },
        )
      : Promise.resolve({ kind: "missing" as const });

    task
      .then((outcome) => {
        if (cancelled) return;
        if (outcome.kind === "missing") {
          setPhase("missing");
          setGrupo(null);
          setChoices({});
          setError(null);
          return;
        }
        if (outcome.kind === "rejected") {
          setPhase("rejected");
          setGrupo(null);
          setChoices({});
          setError(outcome.message);
          return;
        }
        setGrupo(outcome.grupo);
        setChoices(initialChoices(outcome.grupo.personas));
        setError(null);
        setPhase("form");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setPhase("network");
        setError(friendlyError(err, NETWORK_MESSAGE));
        toast.error("No pudimos cargar tu invitación.");
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const locked = grupo != null && groupIsLocked(grupo);

  async function onConfirmSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!grupo || locked) return;

    const confirmaciones: Array<{
      idPersona: string;
      estado: AttendanceChoice;
    }> = [];

    for (const persona of grupo.personas) {
      const choice = choices[persona.idPersona];
      if (choice !== "Asistirá" && choice !== "No asistirá") {
        setError(`Indica la asistencia de ${persona.nombre}.`);
        return;
      }
      confirmaciones.push({ idPersona: persona.idPersona, estado: choice });
    }

    setBusy(true);
    try {
      const result = await confirmarAsistencia({
        idGrupo: grupo.idGrupo,
        confirmaciones,
      });
      if (!result.success) {
        setError(result.message);
        toast.error("Error al guardar la confirmación.");
        return;
      }
      setPhase("done");
      toast.success("¡Gracias! Tu confirmación quedó guardada.");
    } catch (err) {
      setError(
        friendlyError(err, "No pudimos guardar tu confirmación. Intenta de nuevo."),
      );
      toast.error("Error al guardar la confirmación.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="rsvp" className="relative z-10 bg-[#eeeeeb] py-14 sm:py-20">
      <div className="mx-auto max-w-lg px-5 sm:px-6">
        <FadeIn>
          <div className="text-center">
            <h2 className="font-[family-name:var(--font-display)] text-[1.55rem] tracking-[0.16em] text-[#c4a070] uppercase sm:text-[1.85rem] sm:tracking-[0.2em]">
              {wedding.rsvp.title}
            </h2>
            <div className="mx-auto mt-3 mb-1 flex max-w-[280px] justify-center sm:max-w-[320px]">
              {/* Relative path for Arweave / path-hosted static export */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="./images/rsvp-copas.jpg"
                alt=""
                width={547}
                height={315}
                className="h-auto w-full select-none"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.06}>
          {phase === "done" ? (
            <div className="mt-2 rounded-[1.75rem] bg-white px-6 py-10 text-center shadow-[0_12px_40px_rgba(60,50,40,0.08)]">
              <h3 className="font-[family-name:var(--font-display)] text-2xl text-[#5c4033]">
                Confirmación recibida
              </h3>
              <p className="mt-3 text-sm text-[#7a7268]">
                Gracias por responder. Tu confirmación quedó registrada.
              </p>
            </div>
          ) : phase === "loading" ? (
            <div
              className="mt-2 rounded-[1.75rem] bg-white px-6 py-10 text-center shadow-[0_12px_40px_rgba(60,50,40,0.08)]"
              aria-busy="true"
            >
              <p className="text-sm text-[#7a7268]">Cargando tu invitación…</p>
            </div>
          ) : phase === "missing" ? (
            <div className="mt-2 rounded-[1.75rem] bg-white px-6 py-10 text-center shadow-[0_12px_40px_rgba(60,50,40,0.08)]">
              <p className="text-sm leading-relaxed text-[#5c4033]">
                No encontramos el código de tu invitación. Usa el enlace
                personal que te enviamos para confirmar tu asistencia.
              </p>
            </div>
          ) : phase === "rejected" ? (
            <div className="mt-2 rounded-[1.75rem] bg-white px-6 py-10 text-center shadow-[0_12px_40px_rgba(60,50,40,0.08)]">
              <p className="text-sm leading-relaxed text-[#5c4033]" role="alert">
                {error}
              </p>
            </div>
          ) : phase === "network" ? (
            <div className="mt-2 rounded-[1.75rem] bg-white px-6 py-10 text-center shadow-[0_12px_40px_rgba(60,50,40,0.08)]">
              <p className="text-sm text-red-700" role="alert">
                {error}
              </p>
              <button
                type="button"
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#7a3f32] text-base font-medium tracking-wide text-white transition hover:bg-[#6a3529]"
                onClick={() => {
                  setPhase("loading");
                  setError(null);
                  setAttempt((n) => n + 1);
                }}
              >
                Reintentar
              </button>
            </div>
          ) : (
            <form
              className="mt-2 rounded-[1.75rem] bg-white px-4 py-7 shadow-[0_12px_40px_rgba(60,50,40,0.08)] sm:px-7 sm:py-9"
              onSubmit={onConfirmSubmit}
              noValidate
            >
              <p className="mb-5 text-center text-sm text-[#7a7268]">
                {locked
                  ? "Ya recibimos la confirmación de este grupo."
                  : "Confirma la asistencia de cada persona de tu grupo."}
              </p>

              <div className="space-y-4">
                {grupo?.personas.map((persona) => {
                  const recorded = choices[persona.idPersona] ?? "";
                  return (
                    <div
                      key={persona.idPersona}
                      className="rounded-[1.25rem] border border-[#ebe6e0] bg-[#faf8f6] px-4 py-4"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-medium text-[#5c4033]">
                          {persona.nombre}
                        </p>
                        <p className="text-[0.75rem] uppercase tracking-wide text-[#a3988c]">
                          {persona.tipo}
                        </p>
                      </div>

                      <div
                        role="group"
                        aria-label={`Asistencia de ${persona.nombre}`}
                        className="mt-3 space-y-2"
                      >
                        {CHOICE_BUTTONS.map((choice) => {
                          const selected = recorded === choice.estado;
                          return (
                            <button
                              key={choice.estado}
                              type="button"
                              disabled={locked || busy}
                              aria-pressed={selected}
                              className={`flex h-11 w-full items-center justify-center rounded-full border text-sm transition ${
                                selected
                                  ? "border-[#7a3f32] bg-[#7a3f32] text-white"
                                  : "border-[#d8d4cf] bg-white text-[#5c4033]"
                              } ${
                                locked || busy
                                  ? "cursor-not-allowed"
                                  : "cursor-pointer hover:border-[#c4a070]"
                              } ${!selected && (locked || busy) ? "opacity-60" : ""}`}
                              onClick={() => {
                                setChoices((prev) => ({
                                  ...prev,
                                  [persona.idPersona]: choice.estado,
                                }));
                              }}
                            >
                              {choice.label}
                            </button>
                          );
                        })}
                      </div>

                      {locked && (
                        <p className="mt-3 text-center text-sm text-[#7a3f32]">
                          Estado registrado: {labelForEstado(persona.estado)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {error && (
                <p className="mt-4 text-center text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}

              <div className="mt-7">
                <button
                  type="submit"
                  disabled={busy || locked}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#7a3f32] text-base font-medium tracking-wide text-white transition hover:bg-[#6a3529] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? "Guardando…" : wedding.rsvp.submitLabel}
                </button>
              </div>
            </form>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
