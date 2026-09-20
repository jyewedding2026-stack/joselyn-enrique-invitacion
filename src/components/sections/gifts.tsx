"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { wedding } from "@/content/wedding";
import { FadeIn } from "@/components/motion";
import { Button } from "@/components/ui/button";

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

export function GiftsSection() {
  const [copied, setCopied] = useState<string | null>(null);

  return (
    <section id="regalos" className="section-shell bg-[var(--warm-white)]">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <FadeIn>
          <p className="section-eyebrow">Con cariño</p>
          <h2 className="section-title">Lista de regalos</h2>
          <p className="section-lead mt-4 max-w-2xl">{wedding.gifts.intro}</p>
        </FadeIn>

        <div className="mt-10 space-y-8">
          {wedding.gifts.accounts.map((account, i) => (
            <FadeIn
              key={account.account}
              delay={0.05 * i}
              className="max-w-xl space-y-4 rounded-xl border border-[var(--sand-border)] bg-[var(--sand-muted)]/60 p-5 md:p-6"
            >
              <div>
                <p className="text-sm text-[var(--olive)]">{account.bank}</p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--olive-deep)]">
                  {account.holder}
                </p>
              </div>

              {(
                [
                  ["Cuenta", account.account],
                  ["CCI / CLABE", account.clabeOrCci],
                  ["Alias", account.alias],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--sand-border)] pt-3"
                >
                  <div>
                    <p className="text-xs tracking-wide text-[var(--olive-muted)] uppercase">
                      {label}
                    </p>
                    <p className="mt-0.5 font-mono text-sm text-[var(--ink)] break-all">
                      {value}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-[var(--olive)]/25"
                    onClick={async () => {
                      const ok = await copyText(label, value);
                      if (ok) {
                        setCopied(`${label}-${value}`);
                        setTimeout(() => setCopied(null), 1800);
                      }
                    }}
                  >
                    {copied === `${label}-${value}` ? (
                      <Check data-icon="inline-start" />
                    ) : (
                      <Copy data-icon="inline-start" />
                    )}
                    Copiar
                  </Button>
                </div>
              ))}
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
