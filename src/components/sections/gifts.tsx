"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { wedding } from "@/content/wedding";
import { FadeIn } from "@/components/motion";

async function copyText(label: string, value: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`${label} copiado`);
    return true;
  } catch {
    toast.error("No se pudo copiar. Copia manualmente.");
    return false;
  }
}

function OliveSprig({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 170"
      aria-hidden
      className={className}
      fill="none"
    >
      <path
        d="M62 162C58 118 74 86 46 18"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {[
        [72, 146, -36],
        [48, 128, 28],
        [78, 108, -24],
        [44, 90, 34],
        [74, 70, -18],
        [50, 52, 26],
        [68, 34, -12],
      ].map(([cx, cy, rot]) => (
        <ellipse
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          rx="15"
          ry="6.2"
          transform={`rotate(${rot} ${cx} ${cy})`}
          fill="currentColor"
          fillOpacity="0.18"
          stroke="currentColor"
          strokeWidth="1"
        />
      ))}
    </svg>
  );
}

function CopyButton({
  label,
  value,
  copied,
  onCopied,
}: {
  label: string;
  value: string;
  copied: boolean;
  onCopied: (key: string | null) => void;
}) {
  return (
    <button
      type="button"
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-[var(--sand-border)] bg-[#fffdf9] px-3 text-sm text-[var(--ink)] shadow-sm hover:bg-white"
      onClick={async () => {
        const ok = await copyText(label, value);
        if (!ok) return;
        onCopied(`${label}-${value}`);
        window.setTimeout(() => onCopied(null), 1800);
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      Copiar
    </button>
  );
}

export function GiftsSection() {
  const [copied, setCopied] = useState<string | null>(null);
  const account = wedding.gifts.accounts[0];

  return (
    <section id="regalos" className="invite-panel section-shell bg-[var(--warm-white)]">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <FadeIn>
          <p className="section-eyebrow">Con cariño</p>
          <h2 className="section-title">Lista de regalos</h2>
          <p className="section-lead mt-4 max-w-3xl">{wedding.gifts.intro}</p>
        </FadeIn>

        <FadeIn delay={0.05} className="relative mt-10">
          <OliveSprig className="pointer-events-none absolute -bottom-6 -left-2 hidden h-28 w-20 text-[var(--olive)] sm:block" />
          <OliveSprig className="pointer-events-none absolute -top-8 -right-1 hidden h-32 w-24 rotate-12 text-[var(--olive)] md:block" />
          <OliveSprig className="pointer-events-none absolute right-[31%] -bottom-5 hidden h-16 w-12 -rotate-12 text-[var(--olive)] lg:block" />

          <div className="relative grid gap-4 md:grid-cols-3">
            {wedding.gifts.ideas.map((idea) => (
              <article
                key={idea.title}
                className="flex flex-col rounded-2xl border border-[var(--sand-border)] bg-[#fffdf9] p-3 shadow-[0_1px_0_rgba(63,74,50,0.04)]"
              >
                <img
                  src={idea.image}
                  alt={idea.imageAlt}
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-[1.35rem] leading-tight text-[var(--ink)]">
                  {idea.title}
                </h3>
                <p className="mt-1 text-sm leading-snug text-[var(--ink-soft)]">{idea.text}</p>
              </article>
            ))}
          </div>
        </FadeIn>

        {account ? (
          <FadeIn
            delay={0.1}
            className="mt-8 rounded-[1.35rem] border border-[var(--sand-border)] bg-[var(--sand-muted)]/55 px-5 py-5 md:px-8 md:py-6"
          >
            <div className="grid items-end gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-10">
              <div>
                <p className="text-sm text-[var(--olive)]">{account.bank}</p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-[1.7rem] leading-tight text-[var(--olive-deep)]">
                  {account.holder}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <p className="text-sm text-[var(--ink-soft)] break-all">{account.account}</p>
                  <CopyButton
                    label="Cuenta"
                    value={account.account}
                    copied={copied === `Cuenta-${account.account}`}
                    onCopied={setCopied}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {(
                  [
                    ["CCI", account.clabeOrCci],
                    ["Alias", account.alias],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[0.7rem] tracking-[0.14em] text-[var(--olive-muted)] uppercase">
                        {label}
                      </p>
                      <p className="mt-0.5 text-sm text-[var(--ink)] break-all">{value}</p>
                    </div>
                    <CopyButton
                      label={label}
                      value={value}
                      copied={copied === `${label}-${value}`}
                      onCopied={setCopied}
                    />
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        ) : null}
      </div>
    </section>
  );
}
