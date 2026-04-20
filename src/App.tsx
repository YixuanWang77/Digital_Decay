import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import landingVideo from '../Sources/Animations.mp4';
import demoVideo from '../Sources/Demo.mp4';
import techDiagram from '../Sources/Technical Development.jpeg';
import artOverview from '../Sources/Deterioration Overview List.png';
import level1 from '../Sources/Deterioration Level 1.png';
import level2 from '../Sources/Deterioration Level 2.png';
import level3 from '../Sources/Deterioration Level 3.png';
import statePreservationImg from '../Sources/State_Preservation.png';
import rgbSplitImg from '../Sources/RGB_Split.png';
import sabatoVisconti from '../Sources/Sabato_Visconti.png';

import { CoverFlowCarousel } from './components/CoverFlowCarousel';
import { OverviewList } from './components/OverviewList';

import photo01 from '../Sources/Photo 01.jpeg';
import photo02 from '../Sources/Photo 02.jpeg';
import photo03 from '../Sources/Photo 03.jpeg';
import photo04 from '../Sources/Photo 04.jpeg';
import photo05 from '../Sources/Photo 05.jpeg';
import photo06 from '../Sources/Photo 06.jpeg';
import photo07 from '../Sources/Photo 07.jpg';
import photo08 from '../Sources/Photo 08.jpeg';
import photo09 from '../Sources/Photo 09.jpeg';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const basePhotos = [
  { url: photo01, fileName: 'Photo 01.jpeg', orientation: 'portrait' as const },
  { url: photo02, fileName: 'Photo 02.jpeg', orientation: 'portrait' as const },
  { url: photo03, fileName: 'Photo 03.jpeg', orientation: 'portrait' as const },
  { url: photo04, fileName: 'Photo 04.jpeg', orientation: 'portrait' as const },
  { url: photo05, fileName: 'Photo 05.jpeg', orientation: 'portrait' as const },
  { url: photo06, fileName: 'Photo 06.jpeg', orientation: 'portrait' as const },
  { url: photo07, fileName: 'Photo 07.jpg', orientation: 'portrait' as const },
  { url: photo08, fileName: 'Photo 08.jpeg', orientation: 'portrait' as const },
  { url: photo09, fileName: 'Photo 09.jpeg', orientation: 'portrait' as const },
];

function IconSingleUser(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-1a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v1" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconTwoUsers(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-1a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconThreeUsers(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-1a4 4 0 0 0-3-3.87" />
      <path d="M15 3.13a4 4 0 0 1 0 7.75" />
      <path d="M19 8a3 3 0 1 0 0-6" />
    </svg>
  );
}

function IconReset(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={props.className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v6h6" />
    </svg>
  );
}

/** Manual mode: classic mouse pointer */
function IconCursorManual(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
      <path d="M13 13l6 6" />
    </svg>
  );
}

/** Auto / camera mode: watching */
function IconEyeAuto(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={props.className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LandingSequence({ onComplete }: { onComplete: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      const videoWrap = videoWrapperRef.current;
      const textEl = textRef.current;
      if (!container || !videoWrap || !textEl) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: '+=600', // 稍微增加滚动长度，让穿梭过程更细腻
          scrub: 1,
          pin: true,
          onLeave: () => {
            window.scrollTo(0, 0);
            onComplete();
          },
        },
      });

      // 1. 纯物理放大，删掉 opacity 动画，确保文字始终是 100% 纯白实心
      // 放大倍数增加到 800 倍，确保镜头能完全“钻进” D 的内部
      tl.to(textEl, {
        scale: 800,
        ease: 'power3.in', // 使用更陡峭的曲线，营造最后的冲刺感
      });

      // 2. 只有当镜头完全穿过字母、满眼都是视频时，视频才开始淡出
      tl.to(
        videoWrap,
        {
          opacity: 0,
          duration: 0.4,
          ease: 'power1.inOut',
        },
        '-=0.15', // 在放大接近终点时开始淡出背景视频
      );
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        zIndex: 100,
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#ffffff', // 最终露出的底色
      }}
    >
      {/* Layer 2: Video Background */}
      <div
        ref={videoWrapperRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100vh',
          zIndex: 10,
          backgroundColor: '#000000',
        }}
      >
        <video
          src={landingVideo}
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 1,
          }}
        />
      </div>

      {/* Layer 3: Solid White Text Overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <h1
          ref={textRef}
          style={{
            color: '#ffffff',
            fontWeight: 900,
            whiteSpace: 'nowrap',
            margin: 0,
            padding: 0,
            fontSize: '7.5vw', // 保持安全尺寸，不碰黑边
            letterSpacing: '0.04em',
            /* 核心修正：transformOrigin 移动到整行文字的 68.5% 位置。
               这会把放大的靶心精准锁定在 DECAY 的第一个字母 'D' 的内部圆心。
            */
            transformOrigin: '68.5% 50%',
            willChange: 'transform',
          }}
        >
          DIGITAL DECAY
        </h1>
      </div>
    </div>
  );
}

function HomepageContent() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isPlaying) {
      void videoRef.current?.play();
    }
  }, [isPlaying]);

  return (
    <div className="min-h-screen w-full bg-white text-left">
      {/* ⚠️ 终极防弹布局：彻底抛弃 Tailwind 的左右排版，使用原生 Flex 强制并排 */}
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%', minHeight: '100vh' }}>
        {/* Left Column: Narrative (40% text) */}
        <div
          style={{
            width: '40%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '4rem 5rem',
            borderRight: '1px solid #f5f5f5',
            boxSizing: 'border-box',
          }}
        >
          <h2 style={{ fontSize: '1.25vw', fontWeight: 'bold', lineHeight: 1.15, marginBottom: '3rem', color: '#000' }}>
            Digital Decay is an interactive webpage that uses real-time facial recognition technology to decay images on the webpage as browsing becomes more familiar, thereby visualizing the unreliability of digital memories.
          </h2>

          <div
            style={{
              maxWidth: '600px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
              fontSize: '1.125rem',
              color: 'rgba(0,0,0,0.8)',
              lineHeight: 1.6,
            }}
          >
            <p>
              This interactive online archive is like a living, decaying ecosystem. Powered by a Python backend integrated with real-time facial tracking technology; it monitors the presence of viewers. This physical data dynamically drives a custom WebGL and p5.js frontend, triggering gradual visual degradation on the images, such as distortion, blurring, and pixelation. The more people view the images in an archive at the same time, the faster the data "rots".
            </p>
            <p>
              By transforming passive viewing into an active catalyst for decay, this project forces us to confront the fragility of our own digital footprints and the inevitable decay of the memories we upload to the cloud.
            </p>
            <div style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#000', marginBottom: '0.5rem' }}>
                Project Links
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', fontSize: '0.875rem' }}>
                <a
                  href="https://github.com/YixuanWang77/Digital_Decay"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#000', textDecoration: 'underline', textUnderlineOffset: '4px', transition: 'opacity 0.2s' }}
                >
                  GitHub Repository
                </a>
                <a
                  href="https://digitaldecay-ocadu.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#000', textDecoration: 'underline', textUnderlineOffset: '4px', transition: 'opacity 0.2s' }}
                >
                  Live Deployment
                </a>
                <a
                  href="https://youtu.be/kRQZf_ZHAp0"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#000', textDecoration: 'underline', textUnderlineOffset: '4px', transition: 'opacity 0.2s' }}
                >
                  Video Demo
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Media (60%) */}
        <div
          style={{
            width: '60%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fafafa',
            padding: '4rem',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              className="group"
              onClick={() => setIsPlaying(true)}
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '16/9',
                cursor: 'pointer',
                overflow: 'hidden',
                backgroundColor: '#000',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
              }}
            >
              <video
                ref={videoRef}
                src={demoVideo}
                loop
                muted
                playsInline
                style={{ height: '100%', width: '100%', objectFit: 'cover', opacity: isPlaying ? 1 : 0.4, transition: 'opacity 0.5s' }}
              />

              {/* 磨砂黑纱与播放按钮 */}
              {!isPlaying && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.25)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <span
                    style={{
                      color: 'white',
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      letterSpacing: '0.2em',
                      border: '2px solid rgba(255,255,255,0.4)',
                      padding: '0.75rem 1.5rem',
                      transition: 'transform 0.3s',
                    }}
                    className="group-hover:scale-105"
                  >
                    PLAY DEMO
                  </span>
                </div>
              )}
            </div>

            <p
              style={{
                fontSize: '0.75rem',
                color: '#a3a3a3',
                fontFamily: 'monospace',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginTop: '0.5rem',
              }}
            >
              * Note: Live webcam tracking is restricted to local execution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TechnicalDevelopmentContent() {
  return (
    <div style={{ height: '100vh', width: '100%', backgroundColor: 'white', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%' }}>
        {/* Left Column: Technical Text (40%) */}
        <div
          style={{
            width: '40%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '2rem 5rem',
            borderRight: '1px solid #f5f5f5',
            boxSizing: 'border-box',
            overflowY: 'auto',
          }}
        >
          <h2 style={{ fontSize: '2vw', fontWeight: 'bold', lineHeight: 1.15, marginBottom: '1.5rem', color: '#000' }}>
            System Architecture & Interaction Modes
          </h2>

          <div
            style={{
              maxWidth: '600px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              fontSize: '1.125rem',
              color: 'rgba(0,0,0,0.8)',
              lineHeight: 1.6,
            }}
          >
            <p>
              The architecture of Digital Decay is built on a strict separation between physical sensing (Python/OpenCV), state management (React), and real-time rendering (WebGL/p5.js). To demonstrate the core concept of data degradation, the system operates in two distinct interaction modes.
            </p>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#000', marginBottom: '0.5rem' }}>Auto Mode (Facial Recognition)</h3>
              <p>
                In the primary mode, a Python backend continuously monitors the physical space via a webcam to calculate the active audience headcount. This data is asynchronously polled by the React frontend and mapped to a specific corruption scale (Level 0 to 3). The decay is driven entirely by passive human observation—as long as faces are detected, the rendering layer dynamically and irreversibly erodes the image data.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#000', marginBottom: '0.5rem' }}>Manual Mode (Direct Override)</h3>
              <p>
                Bypassing the hardware sensing, the manual mode allows for direct UI intervention via cursor controls. Users can manually trigger specific decay levels (1 to 3) or reset the images to their pristine state. This serves both as a technical debugging environment and as a comparative baseline, isolating the rendering engine from the unpredictability of physical audience tracking.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Technical Diagram (60%) */}
        <div
          style={{
            width: '60%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fafafa',
            padding: '2rem',
            boxSizing: 'border-box',
            overflow: 'hidden',
          }}
        >
          <img
            src={techDiagram}
            alt="Technical Architecture Diagram"
            style={{
              maxWidth: '100%',
              maxHeight: '80vh',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ArtProductionContent() {
  return (
    <div className="min-h-screen w-full bg-white text-left px-20 pt-24 pb-32">
      {/* Top Section: Explanation (40/60 Split) */}
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%', marginBottom: '6rem', alignItems: 'center' }}>
        <div style={{ width: '40%', paddingRight: '5rem', boxSizing: 'border-box' }}>
          <h2 style={{ fontSize: '2vw', fontWeight: 'bold', lineHeight: 1.15, marginBottom: '2.5rem', color: '#000' }}>
            Visual Degradation & State Preservation
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1.125rem', color: 'rgba(0,0,0,0.8)', lineHeight: 1.6 }}>
            <p>
              The visual deterioration in Digital Decay is categorized into three progressive stages, systematically employing techniques such as noise injection, heavy pixelation, and color stripping to simulate data rot.
            </p>
            <p>
              A defining technical and artistic feature of this project is its global state preservation. Whether you are swiping through individual photos in the detail view or returning to the main overview gallery, the exact frame of decay is frozen and synchronized across the interface. This ensures that the memory's specific state of ruin is permanently recorded and consistently displayed, regardless of how you navigate the archive.
            </p>
          </div>
        </div>
        <div style={{ width: '60%' }}>
          <img src={artOverview} alt="State Preservation Overview" style={{ width: '100%', height: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} />
        </div>
      </div>

      {/* Middle Section: Three-Column Comparison (Full Width) */}
      <div style={{ width: '100%', borderTop: '1px solid #f5f5f5', paddingTop: '6rem', marginBottom: '6rem' }}>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem', width: '100%' }}>
          {[
            { img: level1, label: 'Level 1: Minor Decay' },
            { img: level2, label: 'Level 2: Moderate Decay' },
            { img: level3, label: 'Level 3: Severe Decay' },
          ].map((item, idx) => (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <img
                src={item.img}
                alt={item.label}
                style={{ width: '100%', height: 'auto', aspectRatio: '4/3', objectFit: 'cover', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <p style={{ fontSize: '0.875rem', fontWeight: 'bold', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#000' }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: Code Proofs (50/50 Split) */}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '4rem', width: '100%', borderTop: '1px solid #f5f5f5', paddingTop: '6rem' }}>
        
        {/* Snippet 1: State Preservation (Selected Option A) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Implementation: Global State Memory
          </h3>
          <img
            src={statePreservationImg}
            alt="State preservation memory mapping code"
            style={{ width: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)', backgroundColor: '#1e1e1e' }}
          />
          <p style={{ fontSize: '1rem', color: 'rgba(0,0,0,0.8)', lineHeight: 1.6 }}>
            By utilizing a global memory map, the system captures and restores precise WebGL rendering variables across React component lifecycles, ensuring the exact decay state is frozen even when navigating between the gallery and detail views.
          </p>
        </div>

        {/* Snippet 2: RGB Split */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Implementation: Chromatic Aberration
          </h3>
          <img
            src={rgbSplitImg}
            alt="RGB channel splitting code"
            style={{ width: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)', backgroundColor: '#1e1e1e' }}
          />
          <p style={{ fontSize: '1rem', color: 'rgba(0,0,0,0.8)', lineHeight: 1.6 }}>
            The color stripping effect is achieved by rendering the image buffer three times using screen blending. The algorithm dynamically offsets the isolated Red, Green, and Blue channels based on the current decay severity.
          </p>
        </div>

      </div>
    </div>
  );
}

function ConceptNarrativeContent() {
  return (
    <div className="min-h-screen w-full bg-white text-left">
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%', minHeight: '100vh' }}>
        {/* Left Column: Conceptual Text (40%) */}
        <div
          style={{
            width: '40%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '4rem 4rem',
            borderRight: '1px solid #f5f5f5',
            boxSizing: 'border-box',
          }}
        >
          <h2 style={{ fontSize: '2vw', fontWeight: 'bold', lineHeight: 1.15, marginBottom: '3rem', color: '#000' }}>
            Conceptual Origins & Inspiration
          </h2>
          <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '1.125rem', color: 'rgba(0,0,0,0.8)', lineHeight: 1.6 }}>
            <p>
              The core interaction model of Digital Decay addresses the passive accumulation of unscreened digital files. Rather than presenting a speculative narrative, the project mechanically visualizes data rot by actively degrading image pixels based on audience presence.
            </p>
            <p>
              The specific visual execution of this deterioration is directly informed by the glitch photography of Sabato Visconti. By manually manipulating hexadecimal code and writing zeros into image files, Visconti exposed the fragile, mathematical reality hiding beneath smooth digital interfaces.
            </p>
            <p>
              Building upon Visconti's manual interventions, this project automates the destruction process. It shifts the trigger from manual code-editing to passive human observation, establishing a direct feedback loop between physical presence and digital degradation.
            </p>
          </div>
        </div>

        {/* Right Column: Inspiration Image (60%) */}
        <div
          style={{
            width: '60%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fafafa',
            padding: '2rem',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <img
              src={sabatoVisconti}
              alt="Glitch photography by Sabato Visconti"
              style={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
            />
            <p
              style={{
                fontSize: '0.75rem',
                color: '#a3a3a3',
                fontFamily: 'monospace',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginTop: '0.5rem',
                textAlign: 'center',
              }}
            >
              * INSPIRATION: GLITCH PHOTOGRAPHY BY SABATO VISCONTI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AboutContent() {
  return (
    <div className="min-h-screen w-full bg-white text-left">
      <div style={{ display: 'flex', flexDirection: 'row', width: '100%', minHeight: '100vh' }}>
        {/* Left Column: Bio & Info (40%) */}
        <div
          style={{
            width: '40%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '4rem 5rem',
            borderRight: '1px solid #f5f5f5',
            boxSizing: 'border-box',
          }}
        >
          <h2 style={{ fontSize: '2vw', fontWeight: 'bold', lineHeight: 1.15, marginBottom: '3rem', color: '#000' }}>
            About the Creator
          </h2>

          <div style={{ maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '2.5rem', fontSize: '1.125rem', color: 'rgba(0,0,0,0.8)', lineHeight: 1.6 }}>
            <div>
              <p style={{ marginBottom: '1rem' }}>
                <strong>Yixuan Wang </strong> is a 3rd-year undergraduate student in the <strong>Digital Futures</strong> program at <strong>OCAD University</strong>.
              </p>
              <p>
              Inspired by digital art, my work combines front-end interaction design with back-end programming to build visual, interactive experiences.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#000', marginBottom: '1rem' }}>
                AI Agents & Tools
              </h3>
              <p style={{ fontSize: '1rem', color: '#666' }}>
                Cursor (Coding), Google Gemini (Conceptual Logic), Figma (UI/UX Design).
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#000', marginBottom: '1rem' }}>
                Connect
              </h3>
              <a
                href="https://www.linkedin.com/in/yixuan-wang-b02958160"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#000', textDecoration: 'underline', textUnderlineOffset: '4px' }}
              >
                LinkedIn Profile
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Branding (60%) */}
        <div
          style={{
            width: '60%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fafafa',
            padding: '4rem',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '8vw', fontWeight: '900', color: '#eeeeee', letterSpacing: '-0.05em', margin: 0 }}>
              YIXUAN
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#a3a3a3', fontFamily: 'monospace', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
              Digital Futures @ OCADU
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const photos = useMemo(
    () =>
      basePhotos.map((photo, index) => ({
        id: `img-${index}`,
        url: photo.url,
        fileName: photo.fileName,
        orientation: photo.orientation,
      })),
    [],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [decayLevels, setDecayLevels] = useState<Record<string, 0 | 1 | 2 | 3>>({});
  const [manualMode, setManualMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'landing' | 'overview' | 'detail' | 'homepage' | 'tech' | 'art' | 'concept' | 'about'>('landing');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailEntryNonce, setDetailEntryNonce] = useState(0);

  const [resetNonceById, setResetNonceById] = useState<Record<string, number>>({});

  const activePhotoId = photos[currentIndex]?.id;
  const canManual = manualMode;
  const selectedPhotoName = selectedId ? photos.find((photo) => photo.id === selectedId)?.fileName ?? null : null;

  const pollTimerRef = useRef<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const mapFaceCountToDecayLevel = (count: number): 0 | 1 | 2 | 3 => {
    if (!Number.isFinite(count) || count <= 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    return 3; // 3 or more people trigger the maximum decay
  };

  useEffect(() => {
    if (!manualMode) {
      const tick = async () => {
        try {
          abortRef.current?.abort();
          const controller = new AbortController();
          abortRef.current = controller;

          const res = await fetch('http://127.0.0.1:5000/api/face-count', {
            method: 'GET',
            signal: controller.signal,
            headers: { Accept: 'application/json' },
            cache: 'no-store',
          });
          if (!res.ok) return;

          const data = (await res.json()) as unknown;
          const faceCount =
            typeof data === 'number'
              ? data
              : typeof data === 'object' && data !== null && 'count' in data
                ? Number((data as { count?: unknown }).count)
                : NaN;

          const proposed = mapFaceCountToDecayLevel(faceCount);
          if (!activePhotoId) return;
          setDecayLevels((prev) => {
            const existing = prev[activePhotoId] ?? 0;
            const next = Math.max(existing, proposed) as 0 | 1 | 2 | 3;
            if (next === existing) return prev;
            return { ...prev, [activePhotoId]: next };
          });
        } catch (err) {
          if (err instanceof DOMException && err.name === 'AbortError') return;
        }
      };

      void tick();
      pollTimerRef.current = window.setInterval(() => void tick(), 1000);

      return () => {
        if (pollTimerRef.current !== null) {
          window.clearInterval(pollTimerRef.current);
          pollTimerRef.current = null;
        }
        abortRef.current?.abort();
        abortRef.current = null;
      };
    }

    if (pollTimerRef.current !== null) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    abortRef.current?.abort();
    abortRef.current = null;
  }, [manualMode, activePhotoId]);

  const setLevel = (level: 0 | 1 | 2 | 3) => {
    if (!canManual) return;
    if (viewMode === 'overview' || viewMode === 'landing') {
      setDecayLevels((prev) => {
        const next = { ...prev };
        photos.forEach((photo) => {
          next[photo.id] = level;
        });
        return next;
      });
      return;
    }
    if (!activePhotoId) return;
    setDecayLevels((prev) => ({ ...prev, [activePhotoId]: level }));
  };

  const resetActive = () => {
    if (viewMode === 'overview' || viewMode === 'landing') {
      setDecayLevels((prev) => {
        const next = { ...prev };
        photos.forEach((photo) => {
          next[photo.id] = 0;
        });
        return next;
      });
      setResetNonceById((prev) => {
        const next = { ...prev };
        photos.forEach((photo) => {
          next[photo.id] = (prev[photo.id] ?? 0) + 1;
        });
        return next;
      });
      return;
    }
    if (!activePhotoId) return;
    setDecayLevels((prev) => ({ ...prev, [activePhotoId]: 0 }));
    setResetNonceById((prev) => ({ ...prev, [activePhotoId]: (prev[activePhotoId] ?? 0) + 1 }));
  };

  const handleSelectOverviewItem = (id: string) => {
    const nextIndex = photos.findIndex((photo) => photo.id === id);
    if (nextIndex < 0) return;
    setSelectedId(id);
    setCurrentIndex(nextIndex);
    setViewMode('detail');
    setDetailEntryNonce((prev) => prev + 1);
  };

  const navItems = ['Homepage', 'Gallery', 'Concept', 'Art', 'Technical Development', 'About'];

  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden">
      {viewMode === 'landing' && <LandingSequence onComplete={() => setViewMode('overview')} />}
      <div className="relative min-h-screen">

        {/* 1. Fixed Sidebar (Pure inline styles to guarantee width/position) */}
        <aside style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: '60px',
          zIndex: 40,
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label="Toggle index menu"
            className="w-10 rounded-sm text-neutral-900 transition-all duration-500 hover:bg-neutral-100"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <span
              className="text-[0.75rem] tracking-[0.35em] uppercase font-semibold"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', display: 'inline-block' }}
            >
              Index
            </span>
          </button>
        </aside>

        {/* 2. Slide-out Menu (No borders, seamless) */}
        <nav
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: '60px',
            width: '320px',
            zIndex: 30,
            backgroundColor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(24px)',
            padding: '3.5rem 2.5rem',
            transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
            transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
            opacity: isMenuOpen ? 1 : 0,
            pointerEvents: isMenuOpen ? 'auto' : 'none',
          }}
          aria-hidden={!isMenuOpen}
        >
          <ul className="flex h-full flex-col justify-center items-start gap-9">
            {navItems.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => {
                    if (item === 'Homepage') setViewMode('homepage');
                    if (item === 'Gallery') setViewMode('overview');
                    if (item === 'Concept') setViewMode('concept');
                    if (item === 'Technical Development') setViewMode('tech');
                    if (item === 'Art') setViewMode('art');
                    if (item === 'About') setViewMode('about');
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-2xl font-bold tracking-tight text-black/85 transition-colors duration-300 hover:text-black py-1"
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* 3. Main Content & Apple-style Blur */}
        <main
          style={{
            marginLeft: '60px',
            width: 'calc(100vw - 60px)',
            minHeight: viewMode === 'detail' ? undefined : '100vh',
            height: viewMode === 'detail' ? '100dvh' : undefined,
            maxHeight: viewMode === 'detail' ? '100dvh' : undefined,
            overflow: viewMode === 'detail' ? 'hidden' : undefined,
            position: viewMode === 'landing' ? 'fixed' : 'relative',
            top: viewMode === 'landing' ? 0 : undefined,
            zIndex: 10,
          }}
        >
          {/* The Blur Wrapper applies filter dynamically */}
          <div
            style={{
              minHeight: viewMode === 'detail' ? 0 : '100vh',
              height: viewMode === 'detail' ? '100%' : undefined,
              maxHeight: viewMode === 'detail' ? '100%' : undefined,
              overflow: viewMode === 'detail' ? 'hidden' : undefined,
              transition: 'filter 0.5s cubic-bezier(0.16,1,0.3,1)',
              filter: isMenuOpen ? 'blur(12px) brightness(0.8)' : 'blur(0px) brightness(1)',
              pointerEvents: viewMode === 'landing' || isMenuOpen ? 'none' : 'auto',
            }}
          >
            <div
              style={{
                display: 'block',
                width: '100%',
                minHeight: viewMode === 'detail' ? 0 : '100vh',
                height: viewMode === 'detail' ? '100%' : undefined,
                maxHeight: viewMode === 'detail' ? '100%' : undefined,
                overflow: viewMode === 'detail' ? 'hidden' : undefined,
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gridTemplateRows: '1fr',
                  width: '100%',
                  height: viewMode === 'detail' ? '100%' : undefined,
                  minHeight: viewMode === 'detail' ? 0 : undefined,
                  boxSizing: 'border-box',
                }}
              >
                <AnimatePresence>
                  {(viewMode === 'overview' || viewMode === 'landing') && (
                    <motion.div
                      key="overview"
                      className="w-full"
                      style={{ gridArea: '1 / 1 / 2 / 2' }}
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    >
                      <OverviewList
                        photos={photos}
                        decayLevels={decayLevels}
                        resetNonceById={resetNonceById}
                        selectedId={selectedId}
                        onSelect={handleSelectOverviewItem}
                      />
                    </motion.div>
                  )}
                  {viewMode === 'homepage' && (
                    <motion.div
                      key="homepage"
                      className="w-full h-full overflow-y-auto bg-white"
                      style={{ gridArea: '1 / 1 / 2 / 2', zIndex: 20 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <HomepageContent />
                    </motion.div>
                  )}
                  {viewMode === 'tech' && (
                    <motion.div
                      key="tech"
                      className="w-full h-full overflow-y-auto bg-white"
                      style={{ gridArea: '1 / 1 / 2 / 2', zIndex: 20 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <TechnicalDevelopmentContent />
                    </motion.div>
                  )}
                  {viewMode === 'art' && (
                    <motion.div
                      key="art"
                      className="w-full h-full overflow-y-auto bg-white"
                      style={{ gridArea: '1 / 1 / 2 / 2', zIndex: 20 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <ArtProductionContent />
                    </motion.div>
                  )}
                  {viewMode === 'concept' && (
                    <motion.div
                      key="concept"
                      className="w-full h-full overflow-y-auto bg-white"
                      style={{ gridArea: '1 / 1 / 2 / 2', zIndex: 20 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <ConceptNarrativeContent />
                    </motion.div>
                  )}
                  {viewMode === 'about' && (
                    <motion.div
                      key="about"
                      className="w-full h-full overflow-y-auto bg-white"
                      style={{ gridArea: '1 / 1 / 2 / 2', zIndex: 20 }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <AboutContent />
                    </motion.div>
                  )}
                  {viewMode === 'detail' && (
                    <motion.div
                      key="detail"
                      className="w-full flex h-full min-h-0 flex-col items-stretch bg-white"
                      style={{
                        gridArea: '1 / 1 / 2 / 2',
                        width: '100%',
                        zIndex: 10,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="flex h-full min-h-0 w-full max-w-7xl flex-col gap-8 mx-auto px-8">
                        <div className="shrink-0 w-full flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              setViewMode('overview');
                            }}
                            className="px-5 py-2 border-2 border-black bg-white text-black uppercase tracking-[0.2em] text-xs font-semibold hover:bg-black hover:text-white transition-colors"
                            aria-label={`Back to overview list${selectedPhotoName ? ` from ${selectedPhotoName}` : ''}`}
                          >
                            Back
                          </button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
                          <div className="flex min-h-full items-center justify-center">
                            <CoverFlowCarousel
                              photos={photos}
                              decayLevels={decayLevels}
                              currentIndex={currentIndex}
                              selectedLayoutId={selectedId}
                              detailEntryNonce={detailEntryNonce}
                              onChangeIndex={(nextIndex: number) => {
                                setCurrentIndex(nextIndex);
                                setSelectedId(photos[nextIndex]?.id ?? null);
                              }}
                              resetNonceById={resetNonceById}
                            />
                          </div>
                        </div>

                        <motion.div
                          key={`detail-controls-${detailEntryNonce}`}
                          className="shrink-0 w-full"
                          initial={{ x: -300, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: -300, opacity: 0 }}
                          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <div className="flex items-center justify-end gap-8">
                            <button
                              type="button"
                              aria-label="Level 1"
                              onClick={() => setLevel(1)}
                              disabled={!canManual}
                              className={`w-12 h-12 shrink-0 border-2 border-black flex items-center justify-center bg-neutral-200 transition-colors disabled:text-neutral-300 ${canManual ? 'hover:bg-black hover:text-white' : ''}`}
                            >
                              <IconSingleUser className={`w-6 h-6 ${!canManual ? 'text-neutral-300 opacity-70' : ''}`} />
                            </button>

                            <button
                              type="button"
                              aria-label="Level 2"
                              onClick={() => setLevel(2)}
                              disabled={!canManual}
                              className={`w-12 h-12 shrink-0 border-2 border-black flex items-center justify-center bg-white transition-colors disabled:text-neutral-300 ${canManual ? 'hover:bg-black hover:text-white' : ''}`}
                            >
                              <IconTwoUsers className={`w-6 h-6 ${!canManual ? 'text-neutral-300 opacity-70' : ''}`} />
                            </button>

                            <button
                              type="button"
                              aria-label="Level 3"
                              onClick={() => setLevel(3)}
                              disabled={!canManual}
                              className={`w-12 h-12 shrink-0 border-2 border-black flex items-center justify-center bg-white transition-colors disabled:text-neutral-300 ${canManual ? 'hover:bg-black hover:text-white' : ''}`}
                            >
                              <IconThreeUsers className={`w-6 h-6 ${!canManual ? 'text-neutral-300 opacity-70' : ''}`} />
                            </button>

                            <button
                              type="button"
                              aria-label="Reset current image to perfect state"
                              onClick={resetActive}
                              className="w-12 h-12 shrink-0 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors flex items-center justify-center"
                            >
                              <IconReset className="w-6 h-6" />
                            </button>

                            <button
                              type="button"
                              aria-label={
                                manualMode
                                  ? 'Manual mode: use level buttons (cursor)'
                                  : 'Auto camera mode: decay is irreversible (eye)'
                              }
                              onClick={() => setManualMode((v) => !v)}
                              className={`w-12 h-12 shrink-0 border-2 border-black flex items-center justify-center transition-colors hover:bg-black hover:text-white ${manualMode ? 'bg-white' : 'bg-neutral-200'
                                }`}
                            >
                              {manualMode ? (
                                <IconCursorManual className="w-6 h-6" />
                              ) : (
                                <IconEyeAuto className="w-6 h-6" />
                              )}
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
