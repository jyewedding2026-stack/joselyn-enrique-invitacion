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
  restarting: boolean;
} = {
  controller: null,
  playRequested: false,
  restarting: false,
};

function playPerfectOnce() {
  if (bridge.playRequested) return;
  bridge.playRequested = true;
  bridge.controller?.play();
}

function onPlayback(event: { data: Playback }) {
  const { isPaused, position = 0, duration = 0 } = event.data;
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
        { uri: PERFECT_URI, width: 360, height: 152 },
        (controller) => {
          bridge.controller = controller;
          controller.addListener("playback_update", onPlayback);
          controller.addListener("playback_started", () => {
            bridge.restarting = false;
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

  return <div ref={hostRef} />;
});

export function InvitationMusic({ children }: { children: ReactNode }) {
  const start = useCallback(() => {
    playPerfectOnce();
  }, []);

  return (
    <MusicContext.Provider value={{ start }}>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 -left-[10000px] h-[152px] w-[360px] overflow-hidden"
      >
        <SpotifyFrame />
      </div>
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
