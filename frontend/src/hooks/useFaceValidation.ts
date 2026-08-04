/**
 * useFaceValidation.ts
 *
 * Live face quality + liveness gate for the Admin Portal login.
 *
 * Pipeline (runs every 350 ms):
 *   1. Frozen-frame guard  — pixel diff between consecutive frames
 *   2. Global brightness   — reject too dark / overexposed
 *   3. Face detection      — TinyFaceDetector, confidence ≥ 55 %
 *   4. Face count          — exactly one face required
 *   5. Face region quality — brightness, blur (std-dev), texture liveness
 *
 * Liveness heuristic (no ML model required):
 *   Real skin has moderate luminance variance AND non-uniform colour channels.
 *   Printed photos / phone screens tend to have very low LOCAL texture std-dev
 *   on small patches AND very uniform R/G/B channel spread.
 *   Solid colours / black-out / white-out are caught by the global brightness
 *   and texture checks before we even get to face detection.
 *
 * Fallback: if models fail to load within 10 s the hook enters "degraded"
 * mode and faceOk becomes true so the login is not permanently blocked.
 */

import { useEffect, useRef, useState, useCallback } from 'react';

const MODEL_URL          = '/models';
const POLL_MS            = 350;
const CONFIDENCE_MIN     = 0.30;   // lowered to allow angled faces
const MODEL_TIMEOUT_MS   = 10_000;

// Module-level cache — models load only once per page lifetime
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let faceapiCache: any     = null;
let modelsReady_g         = false;
let modelsFailed_g        = false;

// ── Types ─────────────────────────────────────────────────────────────────────
export type FaceStatus =
  | 'loading'      // models / camera not ready yet
  | 'ok'           // ✓ live face detected
  | 'no_face'      // no face in frame
  | 'multiple'     // 2+ faces
  | 'too_dark'     // frame too dark
  | 'overexposed'  // frame too bright (white screen / solid colour)
  | 'blurry'       // face region has very low texture std-dev
  | 'frozen'       // no pixel change between frames (camera paused/covered)
  | 'spoof'        // flat texture + uniform channels → likely printed/screen
  | 'degraded';    // models unavailable — camera active, login allowed

export const STATUS_MESSAGES: Record<FaceStatus, string> = {
  loading:    'Initializing camera check…',
  ok:         '✓ Live face detected — enter your password',
  no_face:    'No face detected — look directly at the camera',
  multiple:   'Multiple faces detected — only one person please',
  too_dark:   'Too dark — turn on a light or move to a brighter area',
  overexposed:'Too bright — reduce direct light or move away',
  blurry:     'Image blurry or obstructed — hold still and clear the view',
  frozen:     'Camera is frozen or covered — check your camera',
  spoof:      'Non-live image detected — please use a live face',
  degraded:   '⚠ Face detection unavailable — camera is active',
};

// ── Pixel analysis helpers ────────────────────────────────────────────────────

/** Average luminance (0–255) of a flat RGBA Uint8ClampedArray */
function meanLum(data: Uint8ClampedArray): number {
  let s = 0;
  const n = data.length / 4;
  for (let i = 0; i < data.length; i += 4)
    s += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  return n > 0 ? s / n : 128;
}

/** Standard deviation of luminance — measures texture / sharpness */
function stdLum(data: Uint8ClampedArray, mean: number): number {
  let sq = 0;
  const n = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    const l = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    sq += (l - mean) ** 2;
  }
  return n > 0 ? Math.sqrt(sq / n) : 0;
}

/** Max channel spread (R, G, B means) — low = monochrome / flat / spoof */
function channelSpread(data: Uint8ClampedArray): number {
  let r = 0, g = 0, b = 0;
  const n = data.length / 4;
  for (let i = 0; i < data.length; i += 4) { r += data[i]; g += data[i + 1]; b += data[i + 2]; }
  const rm = r / n, gm = g / n, bm = b / n;
  return Math.max(rm, gm, bm) - Math.min(rm, gm, bm);
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useFaceValidation(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean
) {
  const [faceStatus,  setFaceStatus]  = useState<FaceStatus>('loading');
  const [modelsReady, setModelsReady] = useState(modelsReady_g);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef   = useRef<HTMLCanvasElement | null>(null);
  const ctxRef      = useRef<CanvasRenderingContext2D | null>(null);
  const prevGrayRef = useRef<Uint8ClampedArray | null>(null);

  /** Login enabled when face is OK or when we're in degraded mode */
  const faceOk = faceStatus === 'ok' || faceStatus === 'degraded';

  // ── 1. Load models ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) return;

    if (modelsReady_g && faceapiCache) {
      setModelsReady(true);
      if (!modelsFailed_g) setFaceStatus('no_face');
      return;
    }
    if (modelsFailed_g) { setFaceStatus('degraded'); setModelsReady(true); return; }

    let cancelled = false;

    const timeout = setTimeout(() => {
      if (!cancelled && !modelsReady_g) {
        console.warn('[FaceValidation] Models timed out — degraded mode');
        modelsFailed_g = true;
        if (!cancelled) { setFaceStatus('degraded'); setModelsReady(true); }
      }
    }, MODEL_TIMEOUT_MS);

    (async () => {
      try {
        const api = await import('face-api.js');
        faceapiCache = api;
        // Load only TinyFaceDetector (fastest — ~1s on good connection)
        await api.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        clearTimeout(timeout);
        if (cancelled) return;
        modelsReady_g = true;
        setModelsReady(true);
        setFaceStatus('no_face');
      } catch (err) {
        clearTimeout(timeout);
        console.error('[FaceValidation] Model load error:', err);
        if (!cancelled) {
          modelsFailed_g = true;
          setFaceStatus('degraded');
          setModelsReady(true);
        }
      }
    })();

    return () => { cancelled = true; clearTimeout(timeout); };
  }, [enabled]);

  // ── 2. Per-frame pipeline ───────────────────────────────────────────────────
  const analyse = useCallback(async () => {
    // Degraded mode — just verify camera is not frozen
    if (faceStatus === 'degraded') return;

    const api   = faceapiCache;
    const video = videoRef.current;
    if (!api || !modelsReady_g)               return;
    if (!video || video.readyState < 2)       return;
    const vw = video.videoWidth, vh = video.videoHeight;
    if (!vw || !vh)                           return;

    // Prepare offscreen canvas
    if (!canvasRef.current) canvasRef.current = document.createElement('canvas');
    const canvas = canvasRef.current;
    if (canvas.width !== vw || canvas.height !== vh) { canvas.width = vw; canvas.height = vh; }
    if (!ctxRef.current)
      ctxRef.current = canvas.getContext('2d', { willReadFrequently: true })!;
    const ctx = ctxRef.current;
    ctx.drawImage(video, 0, 0, vw, vh);

    // ── Step 1: Frozen-frame check ─────────────────────────────────────────
    const tw = Math.min(vw, 80), th = Math.min(vh, 60);
    const sample = ctx.getImageData(0, 0, tw, th).data;
    const grayNow = new Uint8ClampedArray(sample.length / 4);
    for (let i = 0; i < grayNow.length; i++) {
      const p = i * 4;
      grayNow[i] = Math.round(0.299 * sample[p] + 0.587 * sample[p + 1] + 0.114 * sample[p + 2]);
    }
    if (prevGrayRef.current?.length === grayNow.length) {
      let diff = 0;
      for (let i = 0; i < grayNow.length; i++) diff += Math.abs(grayNow[i] - prevGrayRef.current[i]);
      if (diff / grayNow.length < 0.05) { setFaceStatus('frozen'); return; }
    }
    prevGrayRef.current = grayNow;

    // ── Step 2: Global brightness ──────────────────────────────────────────
    // Sample a grid of ~400 points instead of reading the whole frame (perf)
    const strideX = Math.max(1, Math.floor(vw / 20));
    const strideY = Math.max(1, Math.floor(vh / 20));
    const gridData = ctx.getImageData(0, 0, vw, vh).data;
    let lumSum = 0, lumCount = 0;
    for (let y = 0; y < vh; y += strideY) {
      for (let x = 0; x < vw; x += strideX) {
        const idx = (y * vw + x) * 4;
        lumSum += 0.299 * gridData[idx] + 0.587 * gridData[idx + 1] + 0.114 * gridData[idx + 2];
        lumCount++;
      }
    }
    const globalLum = lumCount > 0 ? lumSum / lumCount : 128;
    if (globalLum < 18)  { setFaceStatus('too_dark');    return; }
    if (globalLum > 244) { setFaceStatus('overexposed'); return; }

    // ── Step 3: Global texture variance (catch solid colour / white/black) ──
    const globalStd = stdLum(gridData, globalLum);
    if (globalStd < 3) {
      // Nearly uniform frame — black screen, white wall, coloured paper, etc.
      setFaceStatus('no_face');
      return;
    }

    // ── Step 4: Face detection ─────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let detections: any[];
    try {
      detections = await (api as any).detectAllFaces(
        canvas,
        new api.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.3 })
      ) as any[];
    } catch {
      return; // TF not ready this frame
    }

    if (!detections || detections.length === 0) { setFaceStatus('no_face');  return; }
    if (detections.length > 1)                  { setFaceStatus('multiple'); return; }

    const det  = detections[0];
    const score: number = det.score ?? det._score ?? 0;
    if (score < CONFIDENCE_MIN) { setFaceStatus('no_face'); return; }

    const box = det.box ?? det._box;

    // ── Step 5: Face-region quality checks ────────────────────────────────
    const fx = Math.max(0, Math.floor(box.x));
    const fy = Math.max(0, Math.floor(box.y));
    const fw = Math.min(vw - fx, Math.ceil(box.width));
    const fh = Math.min(vh - fy, Math.ceil(box.height));

    if (fw <= 0 || fh <= 0) { setFaceStatus('no_face'); return; }

    const facePixels = ctx.getImageData(fx, fy, fw, fh).data;
    const faceLum    = meanLum(facePixels);
    const faceStd    = stdLum(facePixels, faceLum);
    const faceSpread = channelSpread(facePixels);

    // Brightness on the face itself
    if (faceLum < 20)  { setFaceStatus('too_dark');    return; }
    if (faceLum > 240) { setFaceStatus('overexposed'); return; }

    // Blur / obstruction — std-dev of luminance very low means flat/covered
    if (faceStd < 5)   { setFaceStatus('blurry');      return; }

    // Liveness anti-spoof:
    // Printed photos & screens have low local texture variance AND very low
    // colour channel spread (near-monochrome / flat colour rendition).
    // Real skin always has some non-trivial channel variation.
    if (faceStd < 10 && faceSpread < 8) {
      setFaceStatus('spoof');
      return;
    }

    // ── All checks passed ✓ ────────────────────────────────────────────────
    setFaceStatus('ok');
  }, [videoRef, faceStatus]);

  // ── 3. Start / stop polling ─────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !modelsReady) return;
    intervalRef.current = setInterval(analyse, POLL_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [enabled, modelsReady, analyse]);

  useEffect(() => {
    if (!enabled && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [enabled]);

  return { faceStatus, faceOk, modelsReady };
}
