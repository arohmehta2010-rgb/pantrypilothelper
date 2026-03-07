import { useEffect, useRef, useState, useCallback } from "react";

const GRID_SIZE = 60;
const EXPAND_RADIUS = 120;

const CursorSpotlight = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const posRef = useRef({ x: 0, y: 0 });
  const visibleRef = useRef(false);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const p = { x: e.clientX, y: e.clientY };
      setPos(p);
      posRef.current = p;
      if (!visibleRef.current) {
        setVisible(true);
        visibleRef.current = true;
      }
    };
    const handleLeave = () => { setVisible(false); visibleRef.current = false; };
    const handleEnter = () => { setVisible(true); visibleRef.current = true; };

    window.addEventListener("mousemove", handleMove);
    document.documentElement.addEventListener("mouseleave", handleLeave);
    document.documentElement.addEventListener("mouseenter", handleEnter);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
      document.documentElement.removeEventListener("mouseenter", handleEnter);
    };
  }, []);

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = window.innerWidth;
    const h = document.documentElement.scrollHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.clearRect(0, 0, w, h);

    const { x: mx, y: my } = posRef.current;
    const scrollY = window.scrollY;
    const cursorY = my + scrollY;

    // Draw vertical lines
    for (let x = 0; x <= w; x += GRID_SIZE) {
      const dist = Math.abs(x - mx);
      const influence = Math.max(0, 1 - dist / EXPAND_RADIUS);
      const alpha = 0.04 + influence * 0.12;
      const lineWidth = 0.5 + influence * 1.5;

      ctx.beginPath();
      ctx.strokeStyle = `hsla(260, 55%, 55%, ${visibleRef.current ? alpha : 0.04})`;
      ctx.lineWidth = lineWidth;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= h; y += GRID_SIZE) {
      const dist = Math.abs(y - cursorY);
      const influence = Math.max(0, 1 - dist / EXPAND_RADIUS);
      const alpha = 0.04 + influence * 0.12;
      const lineWidth = 0.5 + influence * 1.5;

      ctx.beginPath();
      ctx.strokeStyle = `hsla(260, 55%, 55%, ${visibleRef.current ? alpha : 0.04})`;
      ctx.lineWidth = lineWidth;
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw brighter intersections near cursor
    for (let x = 0; x <= w; x += GRID_SIZE) {
      for (let y = 0; y <= h; y += GRID_SIZE) {
        const dx = x - mx;
        const dy = y - cursorY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist / EXPAND_RADIUS);
        if (influence > 0 && visibleRef.current) {
          const dotAlpha = influence * 0.4;
          const dotSize = 1 + influence * 2;
          ctx.beginPath();
          ctx.fillStyle = `hsla(260, 55%, 65%, ${dotAlpha})`;
          ctx.arc(x, y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    animRef.current = requestAnimationFrame(drawGrid);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(drawGrid);
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = document.documentElement.scrollHeight;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [drawGrid]);

  return (
    <>
      {/* Grid lines */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0"
        style={{ opacity: 1 }}
      />
      {/* Radial glow */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: 600,
            height: 600,
            left: pos.x - 300,
            top: pos.y - 300,
            background:
              "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, hsl(var(--primary) / 0.04) 40%, transparent 70%)",
            transition: "left 0.15s ease-out, top 0.15s ease-out",
          }}
        />
      </div>
    </>
  );
};

export default CursorSpotlight;
