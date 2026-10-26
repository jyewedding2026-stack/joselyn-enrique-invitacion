"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

const SRC = "./audio/valse-suave.mp3";

type MusicApi = {
  playing: boolean;
  start: () => void;
  toggle: () => void;
};

const MusicContext = createContext<MusicApi | null>(null);

export function InvitationMusic({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const startedRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  const start = useCallback(() => {
    if (startedRef.current) return;
    const audio = audioRef.current;
    if (!audio) return;
    startedRef.current = true;
    void audio.play().catch(() => {
      startedRef.current = false;
    });
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      void audio.play();
      return;
    }
    audio.pause();
  }, []);

  return (
    <MusicContext.Provider value={{ playing, start, toggle }}>
      <audio
        ref={audioRef}
        src={SRC}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="pointer-events-none fixed top-0 left-0 h-px w-px opacity-0"
      />
      {children}
    </MusicContext.Provider>
  );
}

export function useInvitationMusic(): MusicApi {
  const music = useContext(MusicContext);
  if (!music) {
    throw new Error("La música de la invitación no está disponible.");
  }
  return music;
}

export function MusicControl() {
  const { playing, toggle } = useInvitationMusic();
  const label = playing ? "Pausar música" : "Reproducir música";

  return (
    <div className="mb-5 flex justify-center">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        className="flex flex-col items-center gap-2.5 border-0 bg-transparent p-0"
      >
        <span
          aria-hidden="true"
          className="relative block size-[4.25rem] rounded-full border-[3px] border-[#2c3424] shadow-[0_8px_16px_rgba(63,74,50,0.16)]"
          style={{
            background: [
              "radial-gradient(circle at 35% 30%, rgba(248,245,239,0.28), transparent 42%)",
              "repeating-radial-gradient(circle at 50% 50%, #3f4a32 0 1px, #2a3322 1.5px 3px, rgba(248,245,239,0.2) 3px 3.5px)",
            ].join(","),
          }}
        >
          <span className="absolute top-1/2 left-1/2 size-[1.65rem] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#7a3f32] bg-[#f8f5ef]">
            <span className="absolute top-1/2 left-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#7a3f32]" />
          </span>
        </span>
        <span className="text-[0.75rem] tracking-wide text-[#7a3f32]">{label}</span>
      </button>
    </div>
  );
}
