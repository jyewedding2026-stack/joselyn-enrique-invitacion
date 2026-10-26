"use client";

import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/** Solo "Perfect" by Ed Sheeran. Not the Beyoncé duet. */
const PERFECT_URI = "spotify:track:0tgVpDi06FyKpA1z0VMD4v";
const SPOTIFY_API = "https://open.spotify.com/embed/iframe-api/v1";

type Playback = {
  playingURI?: string;
  isPaused?: boolean;
  duration?: number;
  position?: number;
};

type EmbedController = {
  play: () => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  addListener: (name: string, cb: (event: { data: Playback }) => void) => void;
};

type IFrameAPI = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width: string | number; height: number },
    callback: (controller: EmbedController) => void,
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: IFrameAPI) => void;
  }
}

type MusicApi = {
  start: () => void;
};

const MusicContext = createContext<MusicApi | null>(null);

const bridge: {
  controller: EmbedController | null;
  playRequested: boolean;
  setPlaying: ((playing: boolean) => void) | null;
  restarting: boolean;
} = {
  controller: null,
  playRequested: false,
  setPlaying: null,
  restarting: false,
};

function playPerfectOnce() {
  if (bridge.playRequested) return;
  bridge.playRequested = true;
  bridge.controller?.play();
}

function onPlayback(event: { data: Playback }) {
  const { isPaused, position = 0, duration = 0 } = event.data;
  const playing = isPaused === false;
  bridge.setPlaying?.(playing);

  const ended = duration > 10_000 && position >= duration - 800 && isPaused === true;
  if (!ended || bridge.restarting) {
    if (position < 2_000) bridge.restarting = false;
    return;
  }
  bridge.restarting = true;
  const controller = bridge.controller;
  if (!controller) return;
  if (typeof controller.restart === "function") controller.restart();
  else controller.play();
}

export function InvitationMusic({ children }: { children: ReactNode }) {
  const start = useCallback(() => {
    playPerfectOnce();
  }, []);

  return <MusicContext.Provider value={{ start }}>{children}</MusicContext.Provider>;
}

export function useInvitationMusic(): MusicApi {
  const music = useContext(MusicContext);
  if (!music) {
    throw new Error("La música de la invitación no está disponible.");
  }
  return music;
}

const SpotifyFrame = memo(function SpotifyFrame() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = hostRef.current;
    if (!element) return;

    const mount = (api: IFrameAPI) => {
      if (bridge.controller) return;
      api.createController(
        element,
        { uri: PERFECT_URI, width: "100%", height: 152 },
        (controller) => {
          bridge.controller = controller;
          controller.addListener("playback_update", onPlayback);
          controller.addListener("playback_started", () => {
            bridge.restarting = false;
            bridge.setPlaying?.(true);
          });
          if (bridge.playRequested) controller.play();
        },
      );
    };

    const previous = window.onSpotifyIframeApiReady;
    window.onSpotifyIframeApiReady = (api: IFrameAPI) => {
      previous?.(api);
      mount(api);
    };

    if (!document.getElementById("spotify-iframe-api")) {
      const script = document.createElement("script");
      script.id = "spotify-iframe-api";
      script.src = SPOTIFY_API;
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full">
      <div ref={hostRef} />
    </div>
  );
});

export function MusicControl() {
  const [playing, setPlaying] = useState(false);
  const label = playing ? "Pausar música" : "Reproducir música";

  useEffect(() => {
    bridge.setPlaying = setPlaying;
    return () => {
      if (bridge.setPlaying === setPlaying) bridge.setPlaying = null;
    };
  }, []);

  const toggle = () => {
    const controller = bridge.controller;
    if (!controller) return;
    if (playing) controller.pause();
    else controller.resume();
  };

  return (
    <div className="mx-auto mb-6 flex w-full max-w-[360px] flex-col items-center gap-3 px-4">
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
      <SpotifyFrame />
    </div>
  );
}
