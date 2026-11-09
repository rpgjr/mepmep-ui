import { useEffect, useRef, useState } from "react";

// Transparent dancing-rat sticker from Tenor: https://tenor.com/view/rat-dance-clearbackground-gif-6329183519842978013
const RAT_GIF = "https://media.tenor.com/V9XG4Lp_SN0AAAAj/rat-dance.gif";
// Song: "SAMSUNG WASHING MACHINE TYPE BEAT" by Chorus Fruit. Only the sound is used, the player stays hidden.
const SONG_ID = "0oUsL20821o";
const YT = "https://www.youtube-nocookie.com";

const reduceMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
// Browsers allow sound only after the visitor has clicked, tapped or pressed a key on the site.
const canPlaySound = () => (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation?.hasBeenActive ?? false;

/** Plays the song's sound from a hidden YouTube player. Starts muted if the browser would block sound, then turns it on at the first tap. */
function Song() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [soundOn, setSoundOn] = useState(canPlaySound);
  const startMuted = useRef(!soundOn);

  useEffect(() => {
    if (soundOn) return;
    const command = (func: string, args: unknown[] = []) =>
      frame.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), YT);
    const turnOn = () => {
      command("unMute");
      command("setVolume", [100]);
      command("playVideo");
      setSoundOn(true);
    };
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    for (const e of events) window.addEventListener(e, turnOn, { once: true });
    return () => {
      for (const e of events) window.removeEventListener(e, turnOn);
    };
  }, [soundOn]);

  const src = `${YT}/embed/${SONG_ID}?autoplay=1&loop=1&playlist=${SONG_ID}&playsinline=1&rel=0&enablejsapi=1&mute=${startMuted.current ? 1 : 0}&origin=${encodeURIComponent(location.origin)}`;
  return (
    <>
      <iframe ref={frame} className="song-audio" title="Song" src={src} allow="autoplay; encrypted-media" aria-hidden="true" tabIndex={-1} />
      {!soundOn && <p className="muted">Tap anywhere on the page to hear the song.</p>}
    </>
  );
}

/** Shown while the free server wakes up (can take minutes): a dancing rat, and the song playing as sound only. */
export default function WakeUp() {
  const [ratOk, setRatOk] = useState(true);

  return (
    <div className="wakeup" role="status" aria-label="Waking up the server">
      {!reduceMotion() && ratOk && <img className="rat-gif" src={RAT_GIF} alt="Dancing rat" onError={() => setRatOk(false)} />}

      <h2>Waking up the server…</h2>
      <p className="muted">
        It sleeps when nobody has used it for a while, and this can take up to 2-3 minutes. The movies will appear on their own.
      </p>
      <Song />
    </div>
  );
}
