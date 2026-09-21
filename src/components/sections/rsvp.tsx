"use client";

import { useState } from "react";
import { toast } from "sonner";
import { wedding } from "@/content/wedding";
import { FadeIn } from "@/components/motion";
import { saveRsvp } from "@/lib/storage";
import { useRsvps } from "@/hooks/use-client-store";

const fieldClass =
  "h-10 w-full rounded-lg border border-[var(--sand-border)] bg-[var(--warm-white)] px-3 text-base text-[var(--ink)] outline-none focus-visible:border-[var(--olive)] focus-visible:ring-2 focus-visible:ring-[var(--olive)]/30";

export function RsvpSection() {
  const entries = useRsvps();
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [guestCount, setGuestCount] = useState("1");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submitRsvp() {
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Escribe tu nombre para confirmar.");
      return;
    }
    const count = Number(guestCount);
    if (!Number.isFinite(count) || count < 1 || count > 20) {
      setError("Indica un número de personas entre 1 y 20.");
      return;
    }

    try {
      saveRsvp({
        name: trimmed,
        attending: attending === "yes",
        guestCount: attending === "yes" ? count : 0,
        message: message.trim(),
      });
      setSubmitted(true);
      setName("");
      setMessage("");
      setGuestCount("1");
      setAttending("yes");
      toast.success("¡Gracias! Tu confirmación quedó guardada.");
    } catch {
      setError("No pudimos guardar tu respuesta en este navegador.");
      toast.error("Error al guardar la confirmación.");
    }
  }

  return (
    <section id="rsvp" className="invite-panel section-shell bg-[var(--sand)]">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <FadeIn>
          <p className="section-eyebrow">RSVP</p>
          <h2 className="section-title">{wedding.rsvp.title}</h2>
          <p className="section-lead mt-4 max-w-2xl">
            {wedding.rsvp.description}
          </p>
          <p className="mt-2 text-sm text-[var(--olive-muted)]">
            {wedding.rsvp.deadlineNote}
          </p>
        </FadeIn>

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <FadeIn>
            {submitted ? (
              <div className="rounded-xl border border-[var(--olive)]/20 bg-[var(--warm-white)] p-6">
                <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--olive-deep)]">
                  Confirmación recibida
                </h3>
                <p className="mt-2 text-[var(--ink-soft)]">
                  Gracias por responder. Puedes enviar otra confirmación si
                  alguien más de tu grupo necesita registrarse.
                </p>
                <button
                  type="button"
                  className="mt-5 inline-flex h-10 items-center rounded-lg bg-[var(--olive)] px-4 text-sm font-medium text-[var(--warm-white)] hover:bg-[var(--olive-deep)]"
                  onClick={() => setSubmitted(false)}
                >
                  Enviar otra respuesta
                </button>
              </div>
            ) : (
              <form
                className="space-y-5 rounded-xl border border-[var(--sand-border)] bg-[var(--warm-white)] p-5 md:p-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  submitRsvp();
                }}
              >
                <div className="space-y-2">
                  <label htmlFor="rsvp-name" className="text-sm font-medium">
                    Nombre
                  </label>
                  <input
                    id="rsvp-name"
                    name="name"
                    className={fieldClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre completo"
                    autoComplete="name"
                  />
                </div>

                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium">¿Asistirás?</legend>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="attending"
                        value="yes"
                        checked={attending === "yes"}
                        onChange={() => setAttending("yes")}
                      />
                      Sí, ahí estaré
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="attending"
                        value="no"
                        checked={attending === "no"}
                        onChange={() => setAttending("no")}
                      />
                      No podré asistir
                    </label>
                  </div>
                </fieldset>

                {attending === "yes" && (
                  <div className="space-y-2">
                    <label htmlFor="rsvp-count" className="text-sm font-medium">
                      Número de personas
                    </label>
                    <input
                      id="rsvp-count"
                      name="guestCount"
                      type="number"
                      min={1}
                      max={20}
                      className={fieldClass}
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="rsvp-message" className="text-sm font-medium">
                    Mensaje (opcional)
                  </label>
                  <textarea
                    id="rsvp-message"
                    name="message"
                    className={`${fieldClass} min-h-24 py-2`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Un saludo para los novios"
                    rows={3}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-700" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[var(--olive)] px-5 text-base font-medium text-[var(--warm-white)] hover:bg-[var(--olive-deep)] sm:w-auto"
                  onClick={submitRsvp}
                >
                  Enviar confirmación
                </button>
              </form>
            )}
          </FadeIn>

          <FadeIn delay={0.08}>
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--olive-deep)]">
                Respuestas en este navegador
              </h3>
              {entries.length === 0 ? (
                <p className="mt-3 rounded-xl border border-dashed border-[var(--sand-border)] bg-[var(--warm-white)]/50 p-5 text-sm text-[var(--ink-soft)]">
                  Aún no hay confirmaciones guardadas aquí. Cuando envíes el
                  formulario, aparecerán en esta lista (solo en este
                  dispositivo).
                </p>
              ) : (
                <ul className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
                  {entries.map((entry) => (
                    <li
                      key={entry.id}
                      className="rounded-lg border border-[var(--sand-border)] bg-[var(--warm-white)] px-4 py-3"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-medium text-[var(--olive-deep)]">
                          {entry.name}
                        </p>
                        <p className="text-xs text-[var(--olive-muted)]">
                          {entry.attending
                            ? `${entry.guestCount} persona(s)`
                            : "No asiste"}
                        </p>
                      </div>
                      {entry.message && (
                        <p className="mt-1 text-sm text-[var(--ink-soft)]">
                          {entry.message}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
