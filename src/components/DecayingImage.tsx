import { useEffect, useRef } from 'react';
import p5 from 'p5';

export type DecayLevel = 0 | 1 | 2 | 3;

export interface DecayingImageProps {
  id: string;
  src: string;
  alt?: string;
  className?: string;
  isActive?: boolean;
  decayLevel: DecayLevel;
  resetNonce: number;
}

const TRANSITION_MS_LEVEL_0 = 260;
const TRANSITION_MS_PER_DECAY_STEP = 10_000;

const MAX_RENDER_DIM = 1000;

type Phase = 'transition' | 'settled';

const sketchResumeById = new Map<string, SketchSnapshot>();

const lastSketchSnapshotById = new Map<string, () => SketchSnapshot>();

interface SketchSnapshot {
  phase: Phase;
  lastDecayLevel: DecayLevel | null;
  shifting: number;
  smearing: number;
  grit: number;
  rgbSplit: number;
  shifting0: number;
  smearing0: number;
  grit0: number;
  rgbSplit0: number;
  shifting1: number;
  smearing1: number;
  grit1: number;
  rgbSplit1: number;
  transDuration: number;
  transTargetLevel: DecayLevel;
  transFromLevel: DecayLevel;
  transElapsed: number;
  displayImageData: ImageData | null;
}

function idSeed(id: string): number {
  return [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
}

function copyImageData(src: ImageData): ImageData {
  const copy = new ImageData(src.width, src.height);
  copy.data.set(src.data);
  return copy;
}

/**
 * Shifting / smear / grit: 0..1 style intensities at high tier (caps below).
 * rgbSplit: fraction of renderWidth (max 0.10).
 */
function targetsForLevel(level: DecayLevel): {
  shifting: number;
  smearing: number;
  grit: number;
  rgbSplit: number;
} {
  switch (level) {
    case 0:
      return { shifting: 0, smearing: 0, grit: 0, rgbSplit: 0 };
    case 1:
      return { shifting: 0.15, smearing: 0.05, grit: 0.02, rgbSplit: 0.02 };
    case 2:
      return { shifting: 0.3, smearing: 0.15, grit: 0.05, rgbSplit: 0.05 };
    case 3:
      return { shifting: 0.6, smearing: 0.3, grit: 0.08, rgbSplit: 0.08 };
    default:
      return { shifting: 0, smearing: 0, grit: 0, rgbSplit: 0 };
  }
}

function transitionDurationMs(toLevel: DecayLevel): number {
  return toLevel === 0 ? TRANSITION_MS_LEVEL_0 : TRANSITION_MS_PER_DECAY_STEP;
}

function computeRenderSize(imgW: number, imgH: number): { rw: number; rh: number } {
  const m = Math.max(imgW, imgH);
  if (m <= MAX_RENDER_DIM) return { rw: imgW, rh: imgH };
  const s = MAX_RENDER_DIM / m;
  return { rw: Math.round(imgW * s), rh: Math.round(imgH * s) };
}

function legacyToSnapshotFields(s: Record<string, unknown>): Partial<SketchSnapshot> | null {
  if (typeof s.mis !== 'number') return null;
  return {
    shifting: Math.min(0.6, (s.mis as number) * 0.75),
    smearing: Math.min(0.3, ((s.loss as number) ?? 0) * 0.4 + ((s.art as number) ?? 0) * 0.2),
    grit: Math.min(0.08, ((s.noise as number) ?? 0) * 0.06),
    rgbSplit: Math.min(0.1, ((s.noise as number) ?? 0) * 0.05),
    shifting0: (s.mis0 as number) ?? 0,
    smearing0: (s.loss0 as number) ?? 0,
    grit0: (s.noise0 as number) ?? 0,
    rgbSplit0: (s.noise0 as number) ?? 0,
    shifting1: (s.mis1 as number) ?? 0,
    smearing1: (s.loss1 as number) ?? 0,
    grit1: (s.noise1 as number) ?? 0,
    rgbSplit1: (s.noise1 as number) ?? 0,
  };
}

function normalizeSnapshot(snap: SketchSnapshot | Record<string, unknown>): SketchSnapshot {
  const L = legacyToSnapshotFields(snap as Record<string, unknown>);
  const s = snap as SketchSnapshot & { grit?: number };
  if (L && typeof s.shifting !== 'number') {
    return {
      ...s,
      shifting: L.shifting ?? 0,
      smearing: L.smearing ?? 0,
      grit: L.grit ?? 0,
      rgbSplit: L.rgbSplit ?? 0,
      shifting0: L.shifting0 ?? 0,
      smearing0: L.smearing0 ?? 0,
      grit0: L.grit0 ?? 0,
      rgbSplit0: L.rgbSplit0 ?? 0,
      shifting1: L.shifting1 ?? 0,
      smearing1: L.smearing1 ?? 0,
      grit1: L.grit1 ?? 0,
      rgbSplit1: L.rgbSplit1 ?? 0,
    } as SketchSnapshot;
  }
  if (typeof s.grit !== 'number') {
    return { ...s, grit: 0, grit0: s.grit0 ?? 0, grit1: s.grit1 ?? 0 } as SketchSnapshot;
  }
  return s as SketchSnapshot;
}

export function DecayingImage({
  id,
  src,
  className,
  isActive = false,
  decayLevel,
  resetNonce,
}: DecayingImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const decayLevelRef = useRef<DecayLevel>(decayLevel);
  const isActiveRef = useRef<boolean>(isActive);
  const p5Ref = useRef<p5 | null>(null);
  const resetNonceRef = useRef<number>(resetNonce);
  const snapshotSaverRef = useRef<(() => SketchSnapshot) | null>(null);

  /** Single sync: refs + loop only while active (avoids decay advancing on inactive instances). */
  useEffect(() => {
    isActiveRef.current = isActive;
    decayLevelRef.current = decayLevel;
    const inst = p5Ref.current;
    if (!inst) return;
    if (isActive) inst.loop();
    else inst.noLoop();
  }, [isActive, decayLevel]);

  useEffect(() => {
    if (resetNonceRef.current === resetNonce) return;
    resetNonceRef.current = resetNonce;
    sketchResumeById.delete(id);
    lastSketchSnapshotById.delete(id);
    if (isActiveRef.current) p5Ref.current?.loop();
  }, [resetNonce, id]);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      let renderW = 1;
      let renderH = 1;
      let mainCanvas: p5.Graphics;
      let baseScaled: p5.Graphics;
      let tempShift: p5.Graphics;
      let smearGfx: p5.Graphics;
      let originalImg: p5.Image;
      let isLoaded = false;

      let phase: Phase = 'settled';
      let lastDecayLevel: DecayLevel | null = null;

      let shifting = 0;
      let smearing = 0;
      let grit = 0;
      let rgbSplit = 0;

      let shifting0 = 0;
      let smearing0 = 0;
      let grit0 = 0;
      let rgbSplit0 = 0;
      let shifting1 = 0;
      let smearing1 = 0;
      let grit1 = 0;
      let rgbSplit1 = 0;

      let transStart = 0;
      let transDuration = TRANSITION_MS_PER_DECAY_STEP;
      let transTargetLevel: DecayLevel = 0;
      let transFromLevel: DecayLevel = 0;

      let hasPaintedFrame = false;
      let restoredBlitPending = false;

      const seed = idSeed(id);

      let pendingRestore: SketchSnapshot | null = null;
      const rawPending = sketchResumeById.get(id);
      if (rawPending) {
        // Do NOT delete from map immediately to allow multiple clones to read it
        pendingRestore = normalizeSnapshot(rawPending as unknown as Record<string, unknown>);
      } else {
        // SHIELD: If no saved snapshot, fetch directly from the currently active exiting clone!
        const liveSaver = lastSketchSnapshotById.get(id);
        if (liveSaver) {
          pendingRestore = normalizeSnapshot(liveSaver() as unknown as Record<string, unknown>);
        }
      }

      const snapshotForUnmount = (): SketchSnapshot => {
        let displayData: ImageData | null = null;
        if (p.width > 0 && p.height > 0) {
          try {
            const ctx = p.drawingContext as CanvasRenderingContext2D;
            displayData = copyImageData(ctx.getImageData(0, 0, p.width, p.height));
          } catch {
            /* ignore */
          }
        }
        return {
          phase,
          lastDecayLevel,
          shifting,
          smearing,
          grit,
          rgbSplit,
          shifting0,
          smearing0,
          grit0,
          rgbSplit0,
          shifting1,
          smearing1,
          grit1,
          rgbSplit1,
          transDuration,
          transTargetLevel,
          transFromLevel,
          transElapsed:
            phase === 'transition' ? Math.min(Math.max(0, p.millis() - transStart), transDuration) : 0,
          displayImageData: displayData,
        };
      };

      const applyRestore = (snapIn: SketchSnapshot) => {
        const snap = normalizeSnapshot(snapIn);
        phase = snap.phase;
        lastDecayLevel = snap.lastDecayLevel;
        shifting = snap.shifting;
        smearing = snap.smearing;
        grit = snap.grit;
        rgbSplit = snap.rgbSplit;
        shifting0 = snap.shifting0;
        smearing0 = snap.smearing0;
        grit0 = snap.grit0;
        rgbSplit0 = snap.rgbSplit0;
        shifting1 = snap.shifting1;
        smearing1 = snap.smearing1;
        grit1 = snap.grit1;
        rgbSplit1 = snap.rgbSplit1;
        transDuration = snap.transDuration;
        transTargetLevel = snap.transTargetLevel;
        transFromLevel = snap.transFromLevel;
        transStart = p.millis() - snap.transElapsed;
        hasPaintedFrame = false;
        restoredBlitPending = false;
      };

      const compositeRgbSplitToScreen = (src: p5.Graphics, rgbFrac: number) => {
        const px = rgbFrac * renderW;
        if (px <= 0) {
          p.image(src, 0, 0);
          return;
        }
        p.background(0);
        p.blendMode(p.SCREEN);
        p.tint(255, 0, 0);
        p.image(src, -px, 0);
        p.tint(0, 255, 0);
        p.image(src, 0, 0);
        p.tint(0, 0, 255);
        p.image(src, px, 0);
        p.noTint();
        p.blendMode(p.BLEND);
      };

      const applyHorizontalShifting = (g: p5.Graphics, shiftStr: number, levelForSeed: DecayLevel) => {
        if (shiftStr <= 0) {
          g.image(baseScaled, 0, 0);
          return;
        }
        tempShift.image(baseScaled, 0, 0);
        g.image(baseScaled, 0, 0);
        p.randomSeed(seed + levelForSeed * 900);
        const bands = Math.floor(p.constrain(p.map(shiftStr, 0, 0.6, 8, 18), 8, 18));
        const bandH = renderH / bands;
        for (let i = 0; i < bands; i++) {
          const y = Math.floor(i * bandH);
          const h = i === bands - 1 ? renderH - y : Math.max(1, Math.floor(bandH));
          const maxOff = shiftStr * renderW;
          const ox = Math.round(p.random(-1, 1) * maxOff);
          g.copy(tempShift, 0, y, renderW, h, ox, y, renderW, h);
        }
        p.randomSeed(p.millis());
      };

      /** Layer 2: 2×2 / 5×5 chunks, H / V / sheared stretch, neon SCREEN/ADD. */
      const applyMultiSmear = (g: p5.Graphics, smearCov: number, levelForSeed: DecayLevel) => {
        if (smearCov <= 0.0001) return;
        smearGfx.clear();
        p.randomSeed(seed + levelForSeed * 601);
        const n = Math.min(85, Math.max(1, Math.floor(smearCov * 220)));
        for (let k = 0; k < n; k++) {
          const cell = p.random() < 0.55 ? 2 : 5;
          const sx = Math.floor(p.random(0, Math.max(1, renderW - cell)));
          const sy = Math.floor(p.random(0, Math.max(1, renderH - cell)));
          const chip = baseScaled.get(sx, sy, cell, cell);
          const mode = Math.floor(p.random(3));
          const destX = p.random(0, Math.max(1, renderW - cell));
          const destY = p.random(0, Math.max(1, renderH - cell));
          smearGfx.push();
          smearGfx.translate(destX, destY);
          smearGfx.blendMode(p.ADD);
          smearGfx.tint(p.random(100, 255), p.random(100, 255), p.random(100, 255), p.random(45, 130));
          if (mode === 0) {
            const dw = renderW * p.random(0.45, 1.35);
            smearGfx.image(chip, 0, 0, dw, cell);
          } else if (mode === 1) {
            const dh = renderH * p.random(0.25, 0.75);
            smearGfx.image(chip, 0, 0, cell, dh);
          } else {
            smearGfx.rotate(p.random(-0.35, 0.35));
            const dw = renderW * p.random(0.5, 1.4);
            const dh = cell * p.random(2, 6);
            smearGfx.image(chip, 0, 0, dw, dh);
          }
          smearGfx.pop();
        }
        smearGfx.noTint();
        smearGfx.blendMode(p.BLEND);
        g.blendMode(p.SCREEN);
        g.image(smearGfx, 0, 0);
        g.blendMode(p.BLEND);
        p.randomSeed(p.millis());
      };

      /** Layer 3: fine grain + tiny micro-loss (no large black blocks). */
      const applyMicroGrit = (g: p5.Graphics, gritStr: number, levelForSeed: DecayLevel) => {
        if (gritStr <= 0.0001) return;
        p.randomSeed(seed + levelForSeed * 503);
        const area = renderW * renderH;
        const snowDots = Math.min(8000, Math.floor(gritStr * area * 0.05));
        g.noStroke();
        for (let i = 0; i < snowDots; i++) {
          const x = Math.floor(p.random(renderW));
          const y = Math.floor(p.random(renderH));
          const bright = p.random() < 0.5 ? p.random(200, 255) : p.random(0, 45);
          g.fill(bright, bright, bright, p.random(12, 42));
          g.rect(x, y, 1, 1);
        }
        const microLoss = Math.min(1200, Math.floor(gritStr * 900));
        for (let j = 0; j < microLoss; j++) {
          const x = Math.floor(p.random(renderW - 1));
          const y = Math.floor(p.random(renderH - 1));
          const w = p.random() < 0.65 ? 1 : 2;
          const h = p.random() < 0.65 ? 1 : 2;
          g.fill(p.random(55, 105), p.random(55, 105), p.random(55, 105), p.random(18, 55));
          g.rect(x, y, w, h);
        }
        p.randomSeed(p.millis());
      };

      const renderPipelineToMain = (shiftStr: number, smearCov: number, gritStr: number, levelForSeed: DecayLevel) => {
        applyHorizontalShifting(mainCanvas, shiftStr, levelForSeed);
        applyMultiSmear(mainCanvas, smearCov, levelForSeed);
        applyMicroGrit(mainCanvas, gritStr, levelForSeed);
      };

      const paintInactiveOnce = () => {
        const seedLevel = lastDecayLevel ?? decayLevelRef.current;
        if (shifting <= 0 && smearing <= 0 && grit <= 0 && rgbSplit <= 0) {
          p.image(originalImg, 0, 0, renderW, renderH);
        } else {
          renderPipelineToMain(shifting, smearing, grit, seedLevel);
          compositeRgbSplitToScreen(mainCanvas, rgbSplit);
        }
      };

      const startTransition = (fromLevel: DecayLevel, toLevel: DecayLevel) => {
        transFromLevel = fromLevel;
        transTargetLevel = toLevel;
        transDuration = transitionDurationMs(toLevel);
        shifting0 = shifting;
        smearing0 = smearing;
        grit0 = grit;
        rgbSplit0 = rgbSplit;
        const tgt = targetsForLevel(toLevel);
        shifting1 = tgt.shifting;
        smearing1 = tgt.smearing;
        grit1 = tgt.grit;
        rgbSplit1 = tgt.rgbSplit;
        transStart = p.millis();
        phase = 'transition';
        p.loop();
      };

      p.setup = () => {
        snapshotSaverRef.current = snapshotForUnmount;
        p.loadImage(src, (img) => {
          originalImg = img;
          const { rw, rh } = computeRenderSize(img.width, img.height);
          renderW = rw;
          renderH = rh;

          p.pixelDensity(1);
          p.createCanvas(renderW, renderH);

          const pd = (gr: p5.Graphics) => (gr as unknown as { pixelDensity: (n: number) => void }).pixelDensity(1);

          mainCanvas = p.createGraphics(renderW, renderH);
          pd(mainCanvas);
          baseScaled = p.createGraphics(renderW, renderH);
          pd(baseScaled);
          baseScaled.image(originalImg, 0, 0, renderW, renderH);

          tempShift = p.createGraphics(renderW, renderH);
          pd(tempShift);
          smearGfx = p.createGraphics(renderW, renderH);
          pd(smearGfx);

          isLoaded = true;

          if (pendingRestore) {
            const snapRestore = pendingRestore;
            pendingRestore = null;
            applyRestore(snapRestore);
            if (
              snapRestore.displayImageData &&
              snapRestore.displayImageData.width === p.width &&
              snapRestore.displayImageData.height === p.height
            ) {
              try {
                const ctx = p.drawingContext as CanvasRenderingContext2D;
                ctx.putImageData(snapRestore.displayImageData, 0, 0);
                hasPaintedFrame = true;
                if (snapRestore.phase === 'settled') {
                  restoredBlitPending = true;
                }
              } catch {
                /* ignore */
              }
            }
          } else {
            lastDecayLevel = null;
            phase = 'settled';
            shifting = 0;
            smearing = 0;
            grit = 0;
            rgbSplit = 0;
          }

          // SHIELD: Only register this instance's saver globally if it's active, or if no one else has.
          if (isActiveRef.current || !lastSketchSnapshotById.has(id)) {
            lastSketchSnapshotById.set(id, snapshotForUnmount);
          }

          if (isActiveRef.current) {
            p.loop();
          } else {
            p.noLoop();
            if (!hasPaintedFrame) p.redraw();
          }
        });
      };

      p.draw = () => {
        if (!isLoaded || !mainCanvas || !baseScaled) return;

        const active = isActiveRef.current;

        if (!active) {
          p.noLoop();
          if (hasPaintedFrame) return;
          paintInactiveOnce();
          hasPaintedFrame = true;
          return;
        }

        if (restoredBlitPending && phase === 'settled') {
          restoredBlitPending = false;
          hasPaintedFrame = true;
          p.noLoop();
          return;
        }

        const level = decayLevelRef.current;

        if (lastDecayLevel === null) {
          lastDecayLevel = level;
          transFromLevel = 0;
          if (level === 0) {
            shifting = smearing = grit = rgbSplit = 0;
            phase = 'settled';
            p.image(originalImg, 0, 0, renderW, renderH);
            hasPaintedFrame = true;
            p.noLoop();
            return;
          }
          shifting0 = 0;
          smearing0 = 0;
          grit0 = 0;
          rgbSplit0 = 0;
          const tgt = targetsForLevel(level);
          shifting1 = tgt.shifting;
          smearing1 = tgt.smearing;
          grit1 = tgt.grit;
          rgbSplit1 = tgt.rgbSplit;
          transTargetLevel = level;
          transDuration = transitionDurationMs(level);
          transStart = p.millis();
          phase = 'transition';
        }

        if (lastDecayLevel !== level) {
          startTransition(lastDecayLevel, level);
          lastDecayLevel = level;
        }

        if (phase === 'transition') {
          const elapsed = p.millis() - transStart;
          const t = p.constrain(elapsed / transDuration, 0, 1);
          shifting = p.lerp(shifting0, shifting1, t);
          smearing = p.lerp(smearing0, smearing1, t);
          grit = p.lerp(grit0, grit1, t);
          rgbSplit = p.lerp(rgbSplit0, rgbSplit1, t);

          if (t >= 1) {
            shifting = shifting1;
            smearing = smearing1;
            grit = grit1;
            rgbSplit = rgbSplit1;
            renderPipelineToMain(shifting, smearing, grit, transTargetLevel);
            compositeRgbSplitToScreen(mainCanvas, rgbSplit);
            phase = 'settled';
            hasPaintedFrame = true;
            p.noLoop();
          } else {
            renderPipelineToMain(shifting, smearing, grit, transTargetLevel);
            compositeRgbSplitToScreen(mainCanvas, rgbSplit);
          }
          return;
        }

        if (phase === 'settled') {
          if (shifting <= 0 && smearing <= 0 && grit <= 0 && rgbSplit <= 0) {
            p.image(originalImg, 0, 0, renderW, renderH);
          } else {
            renderPipelineToMain(shifting, smearing, grit, level);
            compositeRgbSplitToScreen(mainCanvas, rgbSplit);
          }
          hasPaintedFrame = true;
          p.noLoop();
        }
      };
    };

    const instance = new p5(sketch, containerRef.current);
    p5Ref.current = instance;

    return () => {
      p5Ref.current = null;
      const saver = snapshotSaverRef.current ?? lastSketchSnapshotById.get(id);
      if (saver) {
        try {
          const snap = saver();
          // THE SHIELD: Only save if this instance is actively decaying OR already holds a broken state.
          // This prevents inactive 0-level clones from wiping out valid memory.
          if (isActiveRef.current || snap.shifting > 0 || (snap.lastDecayLevel ?? 0) > 0) {
            sketchResumeById.set(id, snap);
          }
        } catch {
          /* ignore */
        }
        // Prevent deleting the function if a new instance of the same ID just registered it
        if (lastSketchSnapshotById.get(id) === saver) {
          lastSketchSnapshotById.delete(id);
        }
      }

      instance.remove();
    };
  }, [src, id]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}
    >
      <style>{` canvas { width: 100% !important; height: 100% !important; object-fit: cover; } `}</style>
    </div>
  );
}
