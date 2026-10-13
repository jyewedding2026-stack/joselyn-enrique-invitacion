import { ArrowRight, Calendar, Moon, Sun } from "lucide-react";
import { FadeIn } from "@/components/motion";

const CALENDAR_URL =
  "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Boda+Joselyn+%26+Enrique&dates=20261205T170000/20261205T220000&location=Santuario+Se%C3%B1or+de+Luren,+Ica,+Per%C3%BA";

const WEEKDAYS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"] as const;

/** 1 December 2026 is a Tuesday; the week starts on Sunday. */
const DECEMBER_FIRST_WEEKDAY = 2;
const DAYS_IN_DECEMBER = 31;
const WEDDING_DAY = 5;

function decemberWeeks() {
  const cells: Array<number | null> = [
    ...Array.from({ length: DECEMBER_FIRST_WEEKDAY }, () => null),
    ...Array.from({ length: DAYS_IN_DECEMBER }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: Array<Array<number | null>> = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }
  return weeks;
}

function CornerSprig({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path
        d="M24 146c22-34 40-62 74-102"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <ellipse cx="48" cy="122" rx="13" ry="5.5" transform="rotate(-42 48 122)" />
      <ellipse cx="62" cy="102" rx="13" ry="5.2" transform="rotate(-58 62 102)" />
      <ellipse cx="74" cy="82" rx="12" ry="4.8" transform="rotate(-72 74 82)" />
      <ellipse cx="82" cy="62" rx="10" ry="4.2" transform="rotate(-84 82 62)" />
      <ellipse cx="40" cy="110" rx="10" ry="4" transform="rotate(18 40 110)" />
      <ellipse cx="54" cy="88" rx="10" ry="4" transform="rotate(4 54 88)" />
      <ellipse cx="66" cy="68" rx="9" ry="3.6" transform="rotate(-12 66 68)" />
    </svg>
  );
}

export function SaveTheDateSection() {
  const weeks = decemberWeeks();

  return (
    <section
      id="fecha"
      className="invite-panel section-shell overflow-x-clip bg-[var(--sand)]"
    >
      <div className="mx-auto w-full max-w-xl px-4 sm:px-6">
        <FadeIn>
          <div className="relative overflow-hidden rounded-[1.75rem] border border-[var(--sand-border)] bg-[var(--warm-white)] px-4 py-8 shadow-[0_18px_40px_rgba(63,74,50,0.07)] sm:px-8 sm:py-10">
            <CornerSprig className="pointer-events-none absolute -left-1 -top-2 h-24 w-24 text-[var(--olive)] opacity-35 sm:h-28 sm:w-28" />
            <CornerSprig className="pointer-events-none absolute -right-1 -bottom-2 h-24 w-24 rotate-180 text-[var(--olive)] opacity-30 sm:h-28 sm:w-28" />

            <div className="relative z-10 text-center">
              <p className="font-[family-name:var(--font-body)] text-[0.68rem] font-medium tracking-[0.28em] text-[var(--olive)] uppercase sm:text-xs">
                Save the date
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.85rem,6.2vw,2.7rem)] leading-tight text-[var(--olive-deep)]">
                Un día para recordar
              </h2>
              <p className="mt-3 font-[family-name:var(--font-body)] text-[clamp(0.62rem,2.5vw,0.95rem)] tracking-[0.14em] text-[var(--olive-deep)] uppercase sm:tracking-[0.2em]">
                Sábado · Diciembre · 2026
              </p>
              <div className="mt-3 flex items-center justify-center gap-3 text-[var(--olive)]">
                <span className="h-px w-10 bg-[var(--sand-border)] sm:w-14" />
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-current">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span className="h-px w-10 bg-[var(--sand-border)] sm:w-14" />
              </div>
            </div>

            <div className="relative z-10 mt-6 rounded-2xl border border-[var(--sand-border)] bg-[var(--card)] px-2 py-4 sm:px-4 sm:py-5">
              <p className="text-center font-[family-name:var(--font-display)] text-xl text-[var(--olive-deep)] sm:text-2xl">
                Diciembre 2026
              </p>
              <table className="mt-4 w-full table-fixed border-separate border-spacing-y-1 text-center">
                <caption className="sr-only">
                  Diciembre 2026. El sábado 5 es el día de la boda.
                </caption>
                <thead>
                  <tr>
                    {WEEKDAYS.map((label) => (
                      <th
                        key={label}
                        scope="col"
                        className="pb-2 font-[family-name:var(--font-body)] text-[0.58rem] font-medium tracking-[0.04em] text-[var(--olive-muted)] sm:text-[0.68rem] sm:tracking-[0.12em]"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week, weekIndex) => (
                    <tr key={weekIndex}>
                      {week.map((day, dayIndex) => (
                        <td key={`${weekIndex}-${dayIndex}`} className="p-0">
                          {day == null ? (
                            <span className="block h-8 sm:h-9" />
                          ) : (
                            <span
                              className={
                                day === WEDDING_DAY
                                  ? "mx-auto flex h-8 w-8 max-w-full items-center justify-center rounded-full bg-[var(--olive-deep)] font-[family-name:var(--font-body)] text-sm font-medium text-[var(--warm-white)] sm:h-9 sm:w-9"
                                  : "mx-auto flex h-8 w-8 max-w-full items-center justify-center font-[family-name:var(--font-body)] text-sm text-[#6e655a] sm:h-9 sm:w-9"
                              }
                            >
                              {day}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <a
              href={CALENDAR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 mt-6 grid w-full grid-cols-[1.25rem_1fr_1.25rem] items-center rounded-full bg-[var(--olive-deep)] px-5 py-3.5 font-[family-name:var(--font-body)] text-sm font-medium text-[var(--warm-white)] transition-colors hover:bg-[var(--olive)] sm:text-base"
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span className="text-center">Añadir a mi calendario</span>
              <ArrowRight className="h-4 w-4 justify-self-end" aria-hidden="true" />
            </a>
          </div>
        </FadeIn>

        <FadeIn delay={0.08}>
          <div className="mt-4 rounded-[1.25rem] border border-[var(--sand-border)] bg-[var(--warm-white)] px-4 py-5 text-center sm:px-6">
            <p className="font-[family-name:var(--font-body)] text-[0.68rem] font-medium tracking-[0.24em] text-[var(--olive)] uppercase">
              El clima en Ica
            </p>
            <div className="mx-auto mt-4 grid max-w-sm grid-cols-2">
              <div className="flex flex-col items-center gap-1 border-r border-[var(--sand-border)] px-2">
                <Sun className="h-7 w-7 text-[var(--olive)]" strokeWidth={1.5} aria-hidden="true" />
                <p className="font-[family-name:var(--font-display)] text-[1.7rem] leading-none text-[var(--olive-deep)] sm:text-3xl">
                  26 °C
                </p>
                <p className="font-[family-name:var(--font-body)] text-sm text-[var(--ink-soft)]">
                  Tarde
                </p>
              </div>
              <div className="flex flex-col items-center gap-1 px-2">
                <Moon className="h-7 w-7 text-[var(--olive)]" strokeWidth={1.5} aria-hidden="true" />
                <p className="font-[family-name:var(--font-display)] text-[1.7rem] leading-none text-[var(--olive-deep)] sm:text-3xl">
                  18 °C
                </p>
                <p className="font-[family-name:var(--font-body)] text-sm text-[var(--ink-soft)]">
                  Noche
                </p>
              </div>
            </div>
            <p className="mt-4 font-[family-name:var(--font-body)] text-sm text-[var(--ink-soft)]">
              Temperaturas referenciales para nuestra celebración
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
