"use client";

import { useState } from "react";
import { toast } from "sonner";
import { wedding } from "@/content/wedding";
import { FadeIn } from "@/components/motion";
import { saveRsvp } from "@/lib/storage";

const pillField =
  "h-11 w-full rounded-full border border-[#d8d4cf] bg-white px-4 text-[0.95rem] text-[#3a3a3a] outline-none transition placeholder:text-[#b0aaa3] focus-visible:border-[#c4a070] focus-visible:ring-2 focus-visible:ring-[#c4a070]/30";

const pillSelect =
  `${pillField} appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%228%22 viewBox=%220 0 12 8%22%3E%3Cpath fill=%22%23a3988c%22 d=%22M1 1.5 6 6.5 11 1.5%22/%3E%3C/svg%3E')] bg-[length:12px_8px] bg-[right_1rem_center] bg-no-repeat pr-9`;

export function RsvpSection() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [attending, setAttending] = useState<"yes" | "no">("yes");
  const [companion, setCompanion] = useState<"yes" | "no">("no");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submitRsvp() {
    setError(null);
    const fn = firstName.trim();
    const ln = lastName.trim();
    if (!fn || !ln) {
      setError("Completa tu nombre y apellido.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Ingresa un email válido.");
      return;
    }
    if (!phone.trim()) {
      setError("Ingresa tu teléfono.");
      return;
    }

    const isAttending = attending === "yes";
    const hasCompanion = isAttending && companion === "yes";

    try {
      saveRsvp({
        firstName: fn,
        lastName: ln,
        email: email.trim(),
        phone: phone.trim(),
        attending: isAttending,
        companion: hasCompanion,
        guestCount: isAttending ? (hasCompanion ? 2 : 1) : 0,
      });
      setSubmitted(true);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setAttending("yes");
      setCompanion("no");
      toast.success("¡Gracias! Tu confirmación quedó guardada.");
    } catch {
      setError("No pudimos guardar tu respuesta en este navegador.");
      toast.error("Error al guardar la confirmación.");
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
                src="./images/rsvp-floral.png"
                alt=""
                width={437}
                height={132}
                className="h-auto w-full select-none"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.06}>
          {submitted ? (
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
                onClick={() => setSubmitted(false)}
              >
                Enviar otra respuesta
              </button>
            </div>
          ) : (
            <form
              className="mt-2 rounded-[1.75rem] bg-white px-4 py-7 shadow-[0_12px_40px_rgba(60,50,40,0.08)] sm:px-7 sm:py-9"
              onSubmit={(e) => {
                e.preventDefault();
                submitRsvp();
              }}
              noValidate
            >
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
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="rsvp-email"
                    className="block text-[0.8rem] text-[#a3988c]"
                  >
                    Email:
                  </label>
                  <input
                    id="rsvp-email"
                    name="email"
                    type="email"
                    className={pillField}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="rsvp-phone"
                    className="block text-[0.8rem] text-[#a3988c]"
                  >
                    Teléfono:
                  </label>
                  <input
                    id="rsvp-phone"
                    name="phone"
                    type="tel"
                    className={pillField}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Teléfono"
                    autoComplete="tel"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="rsvp-attending"
                    className="block text-[0.8rem] text-[#a3988c]"
                  >
                    Asistencia:
                  </label>
                  <select
                    id="rsvp-attending"
                    name="attending"
                    className={pillSelect}
                    value={attending}
                    onChange={(e) =>
                      setAttending(e.target.value === "no" ? "no" : "yes")
                    }
                  >
                    <option value="yes">Sí</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="rsvp-companion"
                    className="block text-[0.8rem] text-[#a3988c]"
                  >
                    Acompañante:
                  </label>
                  <select
                    id="rsvp-companion"
                    name="companion"
                    className={pillSelect}
                    value={companion}
                    disabled={attending === "no"}
                    onChange={(e) =>
                      setCompanion(e.target.value === "yes" ? "yes" : "no")
                    }
                  >
                    <option value="no">No</option>
                    <option value="yes">Sí</option>
                  </select>
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
                  className="inline-flex h-12 w-full items-center justify-center rounded-full bg-[#7a3f32] text-base font-medium tracking-wide text-white transition hover:bg-[#6a3529]"
                >
                  {wedding.rsvp.submitLabel}
                </button>
              </div>
            </form>
          )}
        </FadeIn>
      </div>
    </section>
  );
}
