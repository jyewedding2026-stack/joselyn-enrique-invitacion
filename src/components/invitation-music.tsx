"use client";

import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
  playing: boolean;
  restarting: boolean;
} = {
  controller: null,
  playRequested: false,
  playing: false,
  restarting: false,
};

function playPerfect() {
  bridge.playRequested = true;
  if (bridge.playing) return;
  bridge.controller?.play();
}

function onPlayback(event: { data: Playback }) {
  const { isPaused, position = 0, duration = 0 } = event.data;
  if (isPaused === false) bridge.playing = true;
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
            bridge.playing = true;
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

  return <div ref={hostRef} className="h-[152px] w-full" />;
});

export function InvitationMusic({ children }: { children: ReactNode }) {
  const start = useCallback(() => {
    playPerfect();
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

/** Official compact embed. One controller for the page. */
export function SpotifyEmbed({ parked = false }: { parked?: boolean }) {
  return (
    <div
      className={
        parked
          ? "pointer-events-none fixed top-6 left-1/2 z-[1] w-[min(26rem,calc(100%-2.5rem))] -translate-x-1/2"
          : "relative z-10 mx-auto mb-8 w-full max-w-md px-5"
      }
      aria-hidden={parked || undefined}
    >
      <div className="overflow-hidden rounded-2xl border border-[#7a3f32]/40 bg-[#f8f5ef] shadow-[0_8px_20px_rgba(122,63,50,0.08)]">
        <SpotifyFrame />
      </div>
    </div>
  );
}
