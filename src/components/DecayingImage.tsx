import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

// GLOBAL MEMORY: Permanently store the decay level of each image URL (全局记忆：永久记录每张图片的腐烂等级，切走也不会忘)
const decayMemory = new Map<string, number>();

interface DecayingImageProps {
  src: string;
  alt?: string;
  className?: string;
  isActive?: boolean;
}

export const DecayingImage: React.FC<DecayingImageProps> = ({ src, alt, className, isActive = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // A ref to track active state silently without destroying the p5 canvas (静默追踪激活状态，防止 React 销毁画布)
  const isActiveRef = useRef(isActive);
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      let mainCanvas: p5.Graphics;
      let originalImg: p5.Image;

      let isLoaded = false;
      // Retrieve the permanent decay level from memory, default to 0 (从记忆中提取腐烂等级，默认为0)
      let decayLevel = decayMemory.get(src) || 0; 
      
      let lastFrameTime = 0;
      let timeActive = 0;
      let stageInterval = 3000; // Time per level (每个层级的时间)

      // THE CHAOS ENGINE: Applies random glitches non-linearly (混沌引擎：非线性地随机应用各种故障)
      const applyChaos = (level: number, burst: boolean = false) => {
        if (level >= 5) return;

        // If we are fast-forwarding (burst), apply more effects at once (如果是快进补偿，一次性施加更多破坏)
        let loops = burst ? 15 : 1; 

        for (let i = 0; i < loops; i++) {
          // The severity increases with the level, but the TYPE of glitch is totally random (破坏力随等级上升，但故障类型完全随机)
          let glitchType = p.floor(p.random(5)); 

          switch (glitchType) {
            case 0:
              // 1. LOCALIZED PIXELATION/MOSAIC: Leaves other parts crystal clear (局部马赛克：保持其他部分清晰，只破坏一块)
              if (p.random() < 0.2 * level) {
                let w = p.random(20, 150);
                let h = p.random(20, 150);
                let sx = p.random(mainCanvas.width - w);
                let sy = p.random(mainCanvas.height - h);
                let scale = p.random(5, 15); // Downscale factor (缩小系数)
                // Compress and blow back up to create chunky pixels (先缩小再放大，制造局部马赛克)
                mainCanvas.copy(mainCanvas, sx, sy, w, h, sx, sy, w / scale, h / scale);
                mainCanvas.copy(mainCanvas, sx, sy, w / scale, h / scale, sx, sy, w, h);
              }
              break;

            case 1:
              // 2. IMAGE TEARING & SHIFTING (画面撕裂与严重错位)
              if (p.random() < 0.15 * level) {
                let chunkH = p.random(5, 60);
                let sy = p.random(mainCanvas.height - chunkH);
                let offsetX = p.random(-80, 80); // Random left or right tear (随机左右撕裂)
                mainCanvas.copy(mainCanvas, 0, sy, mainCanvas.width, chunkH, offsetX, sy, mainCanvas.width, chunkH);
              }
              break;

            case 2:
              // 3. COLOR BANDING / GHOSTING (色彩条纹与重影)
              if (p.random() < 0.1 * level) {
                mainCanvas.blendMode(p.DIFFERENCE);
                mainCanvas.noStroke();
                // Random neon RGB slices (随机的霓虹 RGB 切片)
                mainCanvas.fill(p.random() > 0.5 ? 255 : 0, p.random() > 0.5 ? 255 : 0, p.random() > 0.5 ? 255 : 0, 80);
                mainCanvas.rect(0, p.random(mainCanvas.height), mainCanvas.width, p.random(10, 50));
                mainCanvas.blendMode(p.BLEND);
              }
              break;

            case 3:
              // 4. CHAOTIC COLOR BLOCKS (混乱的高饱和度死像素块)
              if (p.random() < 0.2 * level) {
                mainCanvas.noStroke();
                mainCanvas.fill(p.random(255), p.random(255), p.random(255));
                mainCanvas.rect(p.random(mainCanvas.width), p.random(mainCanvas.height), p.random(10, 80), p.random(5, 20));
              }
              break;

            case 4:
              // 5. VERTICAL SMEAR / MELTING (纵向像素融化/涂抹)
              if (p.random() < 0.08 * level) {
                let meltX = p.random(mainCanvas.width);
                let meltW = p.random(5, 30);
                let meltY = p.random(mainCanvas.height);
                // Drag pixels down (把像素向下拉扯)
                mainCanvas.copy(mainCanvas, meltX, meltY, meltW, 5, meltX + p.random(-2, 2), meltY, meltW, p.random(50, 200));
              }
              break;
          }
        }
      };

      p.setup = () => {
        p.loadImage(src, (img) => {
          originalImg = img;
          p.createCanvas(img.width, img.height);
          mainCanvas = p.createGraphics(img.width, img.height);
          mainCanvas.image(originalImg, 0, 0);
          
          // FAST-FORWARD: If this image was already decaying before, apply its scars instantly! (快进补偿：如果这张图以前腐烂过，瞬间恢复它的伤痕！)
          if (decayLevel > 0 && decayLevel < 5) {
            applyChaos(decayLevel, true);
          }
          
          isLoaded = true;
          lastFrameTime = p.millis();
        });
      };

      p.draw = () => {
        if (!isLoaded || !mainCanvas) return;

        let currentFrameTime = p.millis();
        let deltaTime = currentFrameTime - lastFrameTime;
        lastFrameTime = currentFrameTime;

        // Only progress the decay logic if this image is currently the center focus (只有处于中央被凝视时，才推进腐烂进度)
        if (isActiveRef.current && decayLevel < 5) {
          timeActive += deltaTime;
          
          if (timeActive > stageInterval) {
            decayLevel++;
            decayMemory.set(src, decayLevel); // BRAND IT: Save the new decay level permanently (烙印：永久保存新的腐烂等级)
            timeActive = 0;
            console.log(`Image ${src.substring(0, 15)}... reached Decay Level ${decayLevel}`);
          }
          
          // Continuously apply chaotic glitches based on current severity (根据当前严重程度，持续施加混沌故障)
          if (decayLevel > 0) {
             applyChaos(decayLevel, false);
          }
        }

        // --- RENDER OUTPUT ---
        if (decayLevel >= 5) {
          // STAGE 5: PERMANENT DEATH (第五阶段：永久死亡黑屏)
          p.background(5, 5, 5);
          p.textAlign(p.CENTER, p.CENTER);
          p.textFont('monospace');
          p.textSize(24);
          p.fill(200, 30, 30); // Deep error red (深红警告色)
          if (p.frameCount % 40 < 30) {
             p.text('[ 0 BYTES_DATA LOST ]', p.width / 2, p.height / 2);
          }
        } else {
          p.image(mainCanvas, 0, 0);
        }
      };
    };

    const myP5 = new p5(sketch, containerRef.current);
    
    // CLEANUP
    return () => { myP5.remove(); };
  }, [src]); // ONLY re-run setup if the actual image source changes, ignoring active state! (只在图片源改变时重建，忽略 active 状态的变化)

  return (
    <div ref={containerRef} className={className} style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
      <style>{` canvas { width: 100% !important; height: 100% !important; object-fit: cover; } `}</style>
    </div>
  );
};