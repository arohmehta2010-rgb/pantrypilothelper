import { useEffect, useRef, useState, useCallback } from "react";

const GRID_SIZE = 60;
const EXPAND_RADIUS = 150;
const PUSH_STRENGTH = 8;
const PARALLAX_FACTOR = 0.4; // Grid scrolls at 40% of page speed for depth

const CursorSpotlight = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const posRef = useRef({ x: 0, y: 0 });
  const scrollRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleScroll = () => {
      scrollRef.current = { x: window.scrollX, y: window.scrollY };
    };

    handleScroll();
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    ctx.clearRect(0, 0, w, h);

    const { x: mx, y: my } = posRef.current;
    const { x: sx, y: sy } = scrollRef.current;
    const hovering = visibleRef.current;

    // Offset grid origin by scroll with parallax (grid moves slower than content)
    const offsetX = -((sx * PARALLAX_FACTOR) % GRID_SIZE);
    const offsetY = -((sy * PARALLAX_FACTOR) % GRID_SIZE);

    // Precompute displaced grid points
    const cols = Math.ceil(w / GRID_SIZE) + 2;
    const rows = Math.ceil(h / GRID_SIZE) + 2;
    const points: { x: number; y: number; influence: number }[][] = [];

    for (let r = 0; r < rows; r++) {
      points[r] = [];
      for (let c = 0; c < cols; c++) {
        const baseX = offsetX + c * GRID_SIZE;
        const baseY = offsetY + r * GRID_SIZE;
        const dx = baseX - mx;
        const dy = baseY - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = hovering ? Math.max(0, 1 - dist / EXPAND_RADIUS) : 0;

        // Push points away from cursor (directional expansion)
        let px = baseX;
        let py = baseY;
        if (influence > 0 && dist > 0) {
          const pushAmount = influence * influence * PUSH_STRENGTH;
          px += (dx / dist) * pushAmount;
          py += (dy / dist) * pushAmount;
        }

        points[r][c] = { x: px, y: py, influence };
      }
    }

    // Draw vertical lines through displaced points
    for (let c = 0; c < cols; c++) {
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        const p = points[r][c];
        const alpha = 0.06 + p.influence * 0.18;
        const lineWidth = 0.5 + p.influence * 2;

        ctx.strokeStyle = `hsla(260, 55%, 55%, ${alpha})`;
        ctx.lineWidth = lineWidth;

        if (r === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          // Draw segment from previous to current
          ctx.stroke();
          ctx.beginPath();
          const prev = points[r - 1][c];
          const segAlpha = Math.max(0.06, (prev.influence + p.influence) / 2 * 0.18 + 0.06);
          const segWidth = Math.max(0.5, (prev.influence + p.influence) / 2 * 2 + 0.5);
          ctx.strokeStyle = `hsla(260, 55%, 55%, ${segAlpha})`;
          ctx.lineWidth = segWidth;
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
        }
      }
      ctx.stroke();
    }

    // Draw horizontal lines through displaced points
    for (let r = 0; r < rows; r++) {
      ctx.beginPath();
      for (let c = 0; c < cols; c++) {
        const p = points[r][c];

        if (c === 0) {
          ctx.moveTo(p.x, p.y);
        } else {
          ctx.stroke();
          ctx.beginPath();
          const prev = points[r][c - 1];
          const segAlpha = Math.max(0.06, (prev.influence + p.influence) / 2 * 0.18 + 0.06);
          const segWidth = Math.max(0.5, (prev.influence + p.influence) / 2 * 2 + 0.5);
          ctx.strokeStyle = `hsla(260, 55%, 55%, ${segAlpha})`;
          ctx.lineWidth = segWidth;
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
        }
      }
      ctx.stroke();
    }

    // Intersection dots near cursor
    if (hovering) {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p = points[r][c];
          if (p.influence > 0) {
            ctx.beginPath();
            ctx.fillStyle = `hsla(260, 55%, 70%, ${p.influence * 0.5})`;
            ctx.arc(p.x, p.y, 1 + p.influence * 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
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
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [drawGrid]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
};

export default CursorSpotlight;
