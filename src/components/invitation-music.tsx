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

  return (
    <div className="relative z-10 bg-[var(--warm-white)] px-5 pt-2 pb-16 text-center">
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        className="inline-flex h-11 items-center justify-center rounded-full border border-[#d8d4cf] bg-[#faf8f6] px-6 text-sm text-[#7a3f32] transition hover:border-[#c4a070]"
      >
        {playing ? "Pausar música" : "Reproducir música"}
      </button>
    </div>
  );
}
