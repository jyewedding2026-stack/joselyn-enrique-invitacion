"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { wedding } from "@/content/wedding";
import { FadeIn } from "@/components/motion";
import {
  buscarPorNombre,
  confirmarAsistencia,
  describeGrupo,
  type RsvpEstado,
  type RsvpGrupo,
  type RsvpPersona,
} from "@/lib/rsvp-api";

const pillField =
  "h-11 w-full rounded-full border border-[#d8d4cf] bg-white px-4 text-[0.95rem] text-[#3a3a3a] outline-none transition placeholder:text-[#b0aaa3] focus-visible:border-[#c4a070] focus-visible:ring-2 focus-visible:ring-[#c4a070]/30";

const pillSelect =
  `${pillField} appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 viewBox=%220 0 12 8%22%3E%3Cpath fill=%22%23a3988c%22 d=%22M1 1.5 6 6.5 11 1.5%22/%3E%3C/svg%3E')] bg-[length:12px_8px] bg-[right_1rem_center] bg-no-repeat pr-9`;

type Step = "search" | "pick" | "confirm" | "done";

type AttendanceChoice = "Asistirá" | "No asistirá";

function estadoToChoice(estado: RsvpEstado): AttendanceChoice | "" {
  if (estado === "Asistirá") return "Asistirá";
  if (estado === "No asistirá") return "No asistirá";
  return "";
}

function initialChoices(personas: RsvpPersona[]): Record<string, AttendanceChoice | ""> {
  const next: Record<string, AttendanceChoice | ""> = {};
  for (const p of personas) {
    next[p.idPersona] = estadoToChoice(p.estado);
  }
  return next;
}

export function RsvpSection() {
  const [step, setStep] = useState<Step>("search");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [candidates, setCandidates] = useState<RsvpGrupo[]>([]);
  const [selectedGrupo, setSelectedGrupo] = useState<RsvpGrupo | null>(null);
  const [choices, setChoices] = useState<Record<string, AttendanceChoice | "">>(
    {},
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullName = useMemo(
    () => `${firstName.trim()} ${lastName.trim()}`.replace(/\s+/g, " ").trim(),
    [firstName, lastName],
  );

  function resetToSearch() {
    setStep("search");
    setCandidates([]);
    setSelectedGrupo(null);
    setChoices({});
    setError(null);
    setBusy(false);
  }

  function openConfirm(grupo: RsvpGrupo) {
    setSelectedGrupo(grupo);
    setChoices(initialChoices(grupo.personas));
    setStep("confirm");
    setError(null);
  }

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!firstName.trim() || !lastName.trim()) {
      setError("Completa tu nombre y apellido.");
      return;
    }
    setBusy(true);
    try {
      const result = await buscarPorNombre(fullName);
      if (result.kind === "none") {
        setError(result.message);
        toast.error("No encontramos tu nombre.");
        return;
      }
      if (result.kind === "multiple") {
        setCandidates(result.grupos);
        setStep("pick");
        return;
      }
      openConfirm(result.grupo);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const message =
        !raw ||
        /failed to fetch|networkerror|load failed|network request failed/i.test(
          raw,
        )
          ? "No pudimos conectar con la lista de invitados. Intenta de nuevo más tarde."
          : raw;
      setError(message);
      toast.error("Error al buscar.");
    } finally {
      setBusy(false);
    }
  }

  function onPickContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const chosen =
      candidates.find((g) => g.idGrupo === selectedGrupo?.idGrupo) ?? null;
    if (!chosen) {
      setError("Elige tu grupo de la lista.");
      return;
    }
    openConfirm(chosen);
  }

  async function onConfirmSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!selectedGrupo) {
      setError("Vuelve a buscar tu nombre.");
      return;
    }

    const confirmaciones: Array<{
      idPersona: string;
      estado: AttendanceChoice;
    }> = [];

    for (const persona of selectedGrupo.personas) {
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
        idGrupo: selectedGrupo.idGrupo,
        confirmaciones,
      });
      if (!result.success) {
        setError(result.message);
        toast.error("Error al guardar la confirmación.");
        return;
      }
      setStep("done");
      setFirstName("");
      setLastName("");
      setCandidates([]);
      setSelectedGrupo(null);
      setChoices({});
      toast.success("¡Gracias! Tu confirmación quedó guardada.");
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const message =
        !raw ||
        /failed to fetch|networkerror|load failed|network request failed/i.test(
          raw,
        )
          ? "No pudimos guardar tu confirmación. Intenta de nuevo."
          : raw;
      setError(message);
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
          {step === "done" ? (
            <div className="mt-2 rounded-[1.75rem] bg-white px-6 py-10 text-center shadow-[0_12px_40px_rgba(60,50,40,0.08)]">
              <h3 className="font-[family-name:var(--font-display)] text-2xl text-[#5c4033]">
                Confirmación recibida
              </h3>
              <p className="mt-3 text-sm text-[#7a7268]">
                Gracias por responder. Puedes enviar otra confirmación si alguien
                más de tu grupo necesita registrarse.
              </p>
              <button
                type="button"
                className="mt-6 inline-flex h-12 w-full max-w-xs items-center justify-center rounded-full bg-[#7a3f32] px-8 text-base font-medium text-white hover:bg-[#6a3529]"
                onClick={resetToSearch}
              >
                Enviar otra respuesta
              </button>
            </div>
          ) : step === "search" ? (
            <form
              className="mt-2 rounded-[1.75rem] bg-white px-4 py-7 shadow-[0_12px_40px_rgba(60,50,40,0.08)] sm:px-7 sm:py-9"
              onSubmit={onSearch}
              noValidate
            >
              <p className="mb-5 text-center text-sm text-[#7a7268]">
                Escribe tu nombre y apellido para encontrar tu invitación.
              </p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-5 sm:gap-y-5">
                <div className="space-y-1.5">
                  <label
                    htmlFor="rsvp-first"
                    className="block text-[0.8rem] text-[#a3988c]"
                  >
                    Nombre:
                  </label>
                  <input
                    id="rsvp-first"
                    name="firstName"
                    className={pillField}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Nombre"
                    autoComplete="given-name"
                    disabled={busy}
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="rsvp-last"
                    className="block text-[0.8rem] text-[#a3988c]"
                  >
                    Apellido:
                  </label>
                  <input
                    id="rsvp-last"
                    name="lastName"
                    className={pillField}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Apellido"
                    autoComplete="family-name"
                    disabled={busy}
                  />
                </div>
              </div>

              {error && (
                <p className="mt-4 text-center text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}

              <div className="mt-7">
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#7a3f32] text-base font-medium tracking-wide text-white transition hover:bg-[#6a3529] disabled:opacity-60"
                >
                  {busy ? "Buscando…" : "Buscar mi invitación"}
                </button>
              </div>
            </form>
          ) : step === "pick" ? (
            <form
              className="mt-2 rounded-[1.75rem] bg-white px-4 py-7 shadow-[0_12px_40px_rgba(60,50,40,0.08)] sm:px-7 sm:py-9"
              onSubmit={onPickContinue}
              noValidate
            >
              <p className="mb-5 text-center text-sm text-[#7a7268]">
                Encontramos más de un grupo. Elige el tuyo para continuar.
              </p>
              <div className="space-y-1.5">
                <label
                  htmlFor="rsvp-group"
                  className="block text-[0.8rem] text-[#a3988c]"
                >
                  Tu grupo:
                </label>
                <select
                  id="rsvp-group"
                  name="group"
                  className={pillSelect}
                  value={selectedGrupo?.idGrupo ?? ""}
                  onChange={(e) => {
                    const g =
                      candidates.find((c) => c.idGrupo === e.target.value) ??
                      null;
                    setSelectedGrupo(g);
                  }}
                  disabled={busy}
                >
                  <option value="">Selecciona…</option>
                  {candidates.map((g) => (
                    <option key={g.idGrupo} value={g.idGrupo}>
                      {describeGrupo(g)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedGrupo && (
                <ul className="mt-4 space-y-2 rounded-[1.25rem] border border-[#ebe6e0] bg-[#faf8f6] px-4 py-3 text-sm text-[#5c4033]">
                  {selectedGrupo.personas.map((p) => (
                    <li key={p.idPersona} className="flex justify-between gap-3">
                      <span>{p.nombre}</span>
                      <span className="text-[#a3988c]">{p.tipo}</span>
                    </li>
                  ))}
                </ul>
              )}

              {error && (
                <p className="mt-4 text-center text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#d8d4cf] bg-white text-base font-medium text-[#5c4033] hover:bg-[#faf8f6]"
                  onClick={resetToSearch}
                  disabled={busy}
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={busy || !selectedGrupo}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#7a3f32] text-base font-medium tracking-wide text-white transition hover:bg-[#6a3529] disabled:opacity-60"
                >
                  Continuar
                </button>
              </div>
            </form>
          ) : (
            <form
              className="mt-2 rounded-[1.75rem] bg-white px-4 py-7 shadow-[0_12px_40px_rgba(60,50,40,0.08)] sm:px-7 sm:py-9"
              onSubmit={onConfirmSubmit}
              noValidate
            >
              <p className="mb-5 text-center text-sm text-[#7a7268]">
                Confirma la asistencia de cada persona de tu grupo.
              </p>

              <div className="space-y-4">
                {selectedGrupo?.personas.map((persona) => (
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
                    <div className="mt-3 space-y-1.5">
                      <label
                        htmlFor={`rsvp-att-${persona.idPersona}`}
                        className="block text-[0.8rem] text-[#a3988c]"
                      >
                        Asistencia:
                      </label>
                      <select
                        id={`rsvp-att-${persona.idPersona}`}
                        className={pillSelect}
                        value={choices[persona.idPersona] ?? ""}
                        disabled={busy}
                        onChange={(e) => {
                          const v = e.target.value;
                          setChoices((prev) => ({
                            ...prev,
                            [persona.idPersona]:
                              v === "Asistirá" || v === "No asistirá" ? v : "",
                          }));
                        }}
                      >
                        <option value="">Selecciona…</option>
                        <option value="Asistirá">Sí, asistiré</option>
                        <option value="No asistirá">No podré asistir</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <p className="mt-4 text-center text-sm text-red-700" role="alert">
                  {error}
                </p>
              )}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full border border-[#d8d4cf] bg-white text-base font-medium text-[#5c4033] hover:bg-[#faf8f6]"
                  onClick={() => {
                    if (candidates.length > 1) {
                      setStep("pick");
                      setError(null);
                    } else {
                      resetToSearch();
                    }
                  }}
                  disabled={busy}
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#7a3f32] text-base font-medium tracking-wide text-white transition hover:bg-[#6a3529] disabled:opacity-60"
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
