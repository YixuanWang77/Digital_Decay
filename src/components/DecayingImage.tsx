import React, { useEffect, useRef } from 'react';
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

/** 性能与叙事节奏：拉长过渡，让破坏“慢慢升起来”。 */
const TRANSITION_MS_LEVEL_0 = 260;
const TRANSITION_MS_DEFAULT = 1800;

const L3_PAUSE_MS = 500;
const L3_FADE_MS = 1600;

/** 边缘预览冻结：缓存每张图当前帧像素，避免继续渲染/计算。 */
const pixelCache = new Map<string, ImageData>();

function idSeed(id: string): number {
  return [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
}

function targetsForLevel(level: DecayLevel): { mis: number; loss: number; noise: number; art: number } {
  switch (level) {
    case 0:
      return { mis: 0, loss: 0, noise: 0, art: 0 };
    case 1:
      return { mis: 0.3, loss: 0, noise: 0, art: 0 };
    case 2:
      return { mis: 0.6, loss: 0.3, noise: 0, art: 0 };
    case 3:
      return { mis: 0.8, loss: 0.3, noise: 0.8, art: 0.8 };
    default:
      return { mis: 0, loss: 0, noise: 0, art: 0 };
  }
}

function transitionDurationMs(toLevel: DecayLevel): number {
  return toLevel === 0 ? TRANSITION_MS_LEVEL_0 : TRANSITION_MS_DEFAULT;
}

export const DecayingImage: React.FC<DecayingImageProps> = ({
  id,
  src,
  className,
  isActive = false,
  decayLevel,
  resetNonce,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const decayLevelRef = useRef<DecayLevel>(decayLevel);
  const isActiveRef = useRef<boolean>(isActive);
  const p5Ref = useRef<p5 | null>(null);
  const resetNonceRef = useRef<number>(resetNonce);

  useEffect(() => {
    decayLevelRef.current = decayLevel;
    // 只有当前处于中央的图片才响应档位变化并运行过渡
    if (isActiveRef.current) p5Ref.current?.loop();
  }, [decayLevel]);

  useEffect(() => {
    if (resetNonceRef.current === resetNonce) return;
    resetNonceRef.current = resetNonce;
    pixelCache.delete(id);
    // reset 发生时，允许中央图立刻重算一帧（回到 Level 0）
    if (isActiveRef.current) p5Ref.current?.loop();
  }, [resetNonce, id]);

  useEffect(() => {
    isActiveRef.current = isActive;
    const inst = p5Ref.current;
    const host = containerRef.current;
    if (!inst || !host) return;

    const canvas = host.querySelector('canvas');
    if (!isActive) {
      // 离开中央：立刻冻结为当前帧静态预览
      if (canvas instanceof HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        if (ctx && canvas.width > 0 && canvas.height > 0) {
          try {
            pixelCache.set(id, ctx.getImageData(0, 0, canvas.width, canvas.height));
          } catch {
            /* ignore */
          }
        }
      }
      inst.noLoop();
    } else {
      // 回到中央：允许引擎继续/追上目标档位
      inst.loop();
    }
  }, [isActive, id]);

  useEffect(() => {
    if (!containerRef.current) return;

    type Phase = 'transition' | 'l3_pause' | 'l3_fade' | 'l3_dead' | 'settled';

    const sketch = (p: p5) => {
      let mainCanvas: p5.Graphics;
      let originalImg: p5.Image;
      let isLoaded = false;

      let phase: Phase = 'settled';
      let lastDecayLevel: DecayLevel | null = null;

      let mis = 0;
      let loss = 0;
      let noise = 0;
      let art = 0;

      let mis0 = 0;
      let loss0 = 0;
      let noise0 = 0;
      let art0 = 0;
      let mis1 = 0;
      let loss1 = 0;
      let noise1 = 0;
      let art1 = 0;

      let transStart = 0;
      let transDuration = TRANSITION_MS_DEFAULT;
      let transTargetLevel: DecayLevel = 0;

      let l3Snapshot: ImageData | null = null;
      let l3PhaseStart = 0;

      const seed = idSeed(id);

      const blitCachedFrameIfAny = (): boolean => {
        const cached = pixelCache.get(id);
        if (!cached) return false;
        if (cached.width !== p.width || cached.height !== p.height) return false;
        const ctx = p.drawingContext as CanvasRenderingContext2D;
        ctx.putImageData(cached, 0, 0);
        return true;
      };

      const cacheCurrentFrame = () => {
        const ctx = p.drawingContext as CanvasRenderingContext2D;
        try {
          const data = ctx.getImageData(0, 0, p.width, p.height);
          pixelCache.set(id, data);
        } catch {
          /* ignore */
        }
      };

      const startTransition = (toLevel: DecayLevel) => {
        transTargetLevel = toLevel;
        transDuration = transitionDurationMs(toLevel);
        mis0 = mis;
        loss0 = loss;
        noise0 = noise;
        art0 = art;
        const t = targetsForLevel(toLevel);
        mis1 = t.mis;
        loss1 = t.loss;
        noise1 = t.noise;
        art1 = t.art;
        transStart = p.millis();
        phase = 'transition';
        l3Snapshot = null;
        p.loop();
      };

      const applyMisalignment = (g: p5.Graphics, strength: number, levelForSeed: DecayLevel) => {
        if (strength <= 0) return;
        g.image(originalImg, 0, 0);
        g.noStroke();
        p.randomSeed(seed + levelForSeed * 999);
        const tears = Math.floor(p.map(strength, 0, 1, 8, 360));
        for (let i = 0; i < tears; i++) {
          const y = p.random(g.height);
          const h = p.max(3, p.random(4, 38) * (0.35 + strength));
          const offset = p.random(-1, 1) * 130 * strength;
          g.copy(originalImg, 0, y, g.width, h, offset, y, g.width, h);
        }
        p.randomSeed(p.millis());
      };

      const applyPartialLoss = (g: p5.Graphics, strength: number, levelForSeed: DecayLevel) => {
        if (strength <= 0) return;
        g.noStroke();
        p.randomSeed(seed + levelForSeed * 999 + 17);
        const count = Math.floor(strength * 400);
        for (let i = 0; i < count; i++) {
          const x = p.random(g.width);
          const y = p.random(g.height);
          const w = p.random(4, 16);
          const h = p.random(3, 12);
          g.fill(10, 10, 10, p.random(190, 255));
          g.rect(x, y, w, h);
        }
        p.randomSeed(p.millis());
      };

      const applyCompressionArtifacts = (g: p5.Graphics, strength: number, levelForSeed: DecayLevel) => {
        if (strength <= 0) return;
        g.noStroke();
        p.randomSeed(seed + levelForSeed * 999 + 29);
        const n = Math.floor(p.map(strength, 0, 1, 6, 128));
        for (let i = 0; i < n; i++) {
          const bSize = p.random([24, 32, 40, 56, 64]);
          const gx = p.floor(p.random(g.width / bSize)) * bSize;
          const gy = p.floor(p.random(g.height / bSize)) * bSize;
          const sx = p.constrain(gx + p.random(-bSize * 1.5, bSize * 1.5), 0, g.width - bSize);
          const sy = p.constrain(gy + p.random(-bSize * 1.5, bSize * 1.5), 0, g.height - bSize);
          g.copy(originalImg, sx, sy, bSize, bSize, gx, gy, bSize, bSize);
          const m = p.random(85, 135);
          g.fill(m, m, m, 95);
          g.rect(gx, gy, bSize, bSize);
        }
        p.randomSeed(p.millis());
      };

      const applyNoise = (g: p5.Graphics, cover: number, levelForSeed: DecayLevel) => {
        if (cover <= 0) return;
        g.noStroke();
        p.randomSeed(seed + levelForSeed * 999 + 41);
        const area = g.width * g.height;
        const dots = Math.floor(cover * area * 0.095);
        for (let i = 0; i < dots; i++) {
          const x = p.floor(p.random(g.width));
          const y = p.floor(p.random(g.height));
          const s = p.random(1, 3);
          const v = p.random() < 0.52 ? p.random(0, 40) : p.random(188, 255);
          g.fill(v, v, v, p.random(40, 190));
          g.rect(x, y, s, s * p.random(0.85, 1.35));
        }
        p.randomSeed(p.millis());
      };

      const renderDecayToMain = (
        m: number,
        l: number,
        n: number,
        a: number,
        levelForSeed: DecayLevel,
      ) => {
        mainCanvas.image(originalImg, 0, 0);
        if (m > 0) applyMisalignment(mainCanvas, m, levelForSeed);
        if (l > 0) applyPartialLoss(mainCanvas, l, levelForSeed);
        if (a > 0) applyCompressionArtifacts(mainCanvas, a, levelForSeed);
        if (n > 0) applyNoise(mainCanvas, n, levelForSeed);
      };

      const drawSettledFrame = (levelForSeed: DecayLevel) => {
        if (mis <= 0 && loss <= 0 && noise <= 0 && art <= 0) {
          p.image(originalImg, 0, 0);
        } else {
          renderDecayToMain(mis, loss, noise, art, levelForSeed);
          p.image(mainCanvas, 0, 0);
        }
      };

      p.setup = () => {
        p.loadImage(src, (img) => {
          originalImg = img;
          p.pixelDensity(1);
          p.createCanvas(img.width, img.height);
          mainCanvas = p.createGraphics(img.width, img.height);
          (mainCanvas as unknown as { pixelDensity: (n: number) => void }).pixelDensity(1);
          isLoaded = true;
          lastDecayLevel = null;
          phase = 'settled';
          mis = 0;
          loss = 0;
          noise = 0;
          art = 0;
          // 初始只渲染一帧；是否继续由 isActive 决定
          p.loop();
        });
      };

      p.draw = () => {
        if (!isLoaded || !mainCanvas) return;

        const active = isActiveRef.current;
        if (!active) {
          // 边缘预览：只显示已缓存的静态帧（或原图），并立刻停 loop
          if (!blitCachedFrameIfAny()) {
            p.image(originalImg, 0, 0);
            cacheCurrentFrame();
          }
          p.noLoop();
          return;
        }

        const level = decayLevelRef.current;

        if (lastDecayLevel === null) {
          lastDecayLevel = level;
          if (level === 0) {
            mis = loss = noise = art = 0;
            phase = 'settled';
            p.image(originalImg, 0, 0);
            cacheCurrentFrame();
            p.noLoop();
            return;
          }
          mis0 = 0;
          loss0 = 0;
          noise0 = 0;
          art0 = 0;
          const t = targetsForLevel(level);
          mis1 = t.mis;
          loss1 = t.loss;
          noise1 = t.noise;
          art1 = t.art;
          transTargetLevel = level;
          transDuration = transitionDurationMs(level);
          transStart = p.millis();
          phase = 'transition';
        }

        const leaveL3 = level !== 3 && (phase === 'l3_pause' || phase === 'l3_fade' || phase === 'l3_dead');
        if (leaveL3) {
          l3Snapshot = null;
        }

        if (lastDecayLevel !== level) {
          startTransition(level);
          lastDecayLevel = level;
        }

        if (phase === 'transition') {
          const elapsed = p.millis() - transStart;
          const t = p.constrain(elapsed / transDuration, 0, 1);
          mis = p.lerp(mis0, mis1, t);
          loss = p.lerp(loss0, loss1, t);
          noise = p.lerp(noise0, noise1, t);
          art = p.lerp(art0, art1, t);

          if (t >= 1) {
            mis = mis1;
            loss = loss1;
            noise = noise1;
            art = art1;
            if (transTargetLevel === 3) {
              renderDecayToMain(mis, loss, noise, art, 3);
              p.image(mainCanvas, 0, 0);
              try {
                l3Snapshot = (p.drawingContext as CanvasRenderingContext2D).getImageData(
                  0,
                  0,
                  p.width,
                  p.height,
                );
              } catch {
                l3Snapshot = null;
              }
              phase = 'l3_pause';
              l3PhaseStart = p.millis();
            } else {
              drawSettledFrame(transTargetLevel);
              phase = 'settled';
              cacheCurrentFrame();
              p.noLoop();
            }
          } else {
            renderDecayToMain(mis, loss, noise, art, transTargetLevel);
            p.image(mainCanvas, 0, 0);
          }
          return;
        }

        if (phase === 'l3_pause') {
          const ctx = p.drawingContext as CanvasRenderingContext2D;
          if (l3Snapshot && l3Snapshot.width === p.width && l3Snapshot.height === p.height) {
            ctx.putImageData(l3Snapshot, 0, 0);
          } else {
            renderDecayToMain(mis, loss, noise, art, 3);
            p.image(mainCanvas, 0, 0);
          }
          if (p.millis() - l3PhaseStart >= L3_PAUSE_MS) {
            phase = 'l3_fade';
            l3PhaseStart = p.millis();
          }
          return;
        }

        if (phase === 'l3_fade') {
          const ctx = p.drawingContext as CanvasRenderingContext2D;
          if (l3Snapshot && l3Snapshot.width === p.width && l3Snapshot.height === p.height) {
            ctx.putImageData(l3Snapshot, 0, 0);
          } else {
            p.background(0);
          }
          const ft = p.constrain((p.millis() - l3PhaseStart) / L3_FADE_MS, 0, 1);
          p.noStroke();
          p.fill(0, ft * 255);
          p.rect(0, 0, p.width, p.height);
          if (ft >= 1) {
            phase = 'l3_dead';
          }
          return;
        }

        if (phase === 'l3_dead') {
          p.background(8, 8, 8);
          p.textAlign(p.CENTER, p.CENTER);
          p.textFont('monospace');
          p.textSize(24);
          p.fill(200, 30, 30);
          if (p.frameCount % 40 < 28) {
            p.text('[ 0 BYTES_DATA LOST ]', p.width / 2, p.height / 2);
          }
          return;
        }

        if (phase === 'settled') {
          drawSettledFrame(level);
          cacheCurrentFrame();
          p.noLoop();
        }
      };
    };

    const instance = new p5(sketch, containerRef.current);
    p5Ref.current = instance;

    return () => {
      p5Ref.current = null;
      // 卸载也确保留住当前帧，方便再次作为静态预览复用
      const host = containerRef.current;
      const canvas = host?.querySelector('canvas');
      if (canvas instanceof HTMLCanvasElement) {
        const ctx = canvas.getContext('2d');
        if (ctx && canvas.width > 0 && canvas.height > 0) {
          try {
            pixelCache.set(id, ctx.getImageData(0, 0, canvas.width, canvas.height));
          } catch {
            /* ignore */
          }
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
};
