"use client";

import { useState } from "react";
import { toast } from "sonner";
import { wedding } from "@/content/wedding";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { saveRsvp } from "@/lib/storage";
import { useRsvps } from "@/hooks/use-client-store";

export function RsvpSection() {
  const entries = useRsvps();
  const [name, setName] = useState("");
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [guestCount, setGuestCount] = useState("1");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    <section id="rsvp" className="section-shell bg-[var(--sand)]">
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
                <Button
                  type="button"
                  className="mt-5 bg-[var(--olive)] text-[var(--warm-white)] hover:bg-[var(--olive-deep)]"
                  onClick={() => setSubmitted(false)}
                >
                  Enviar otra respuesta
                </Button>
              </div>
            ) : (
              <form
                onSubmit={onSubmit}
                className="space-y-5 rounded-xl border border-[var(--sand-border)] bg-[var(--warm-white)] p-5 md:p-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="rsvp-name">Nombre</Label>
                  <Input
                    id="rsvp-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre completo"
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-3">
                  <Label>¿Asistirás?</Label>
                  <RadioGroup
                    value={attending}
                    onValueChange={(v) => setAttending(v as "yes" | "no")}
                    className="flex flex-wrap gap-4"
                  >
                    <label className="flex items-center gap-2 text-sm">
                      <RadioGroupItem value="yes" />
                      Sí, ahí estaré
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <RadioGroupItem value="no" />
                      No podré asistir
                    </label>
                  </RadioGroup>
                </div>

                {attending === "yes" && (
                  <div className="space-y-2">
                    <Label htmlFor="rsvp-count">Número de personas</Label>
                    <Input
                      id="rsvp-count"
                      type="number"
                      min={1}
                      max={20}
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="rsvp-message">Mensaje (opcional)</Label>
                  <Textarea
                    id="rsvp-message"
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

                <Button
                  type="submit"
                  className="w-full bg-[var(--olive)] text-[var(--warm-white)] hover:bg-[var(--olive-deep)] sm:w-auto"
                  size="lg"
                >
                  Enviar confirmación
                </Button>
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
