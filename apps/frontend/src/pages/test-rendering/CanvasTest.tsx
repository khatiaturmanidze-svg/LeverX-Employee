import { useEffect, useRef } from 'react';

export default function CanvasTest() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const cols = 250;
    const rows = 200;
    const cellWidth = 20;
    const cellHeight = 16;

    canvas.width = cols * cellWidth;
    canvas.height = rows * cellHeight;

    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = row * cols + col;
        ctx.fillStyle = '#fff';
        ctx.fillRect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(
          col * cellWidth,
          row * cellHeight,
          cellWidth,
          cellHeight,
        );
        ctx.fillStyle = '#9ca3af';
        ctx.fillText(
          String(cell % 1000),
          col * cellWidth + cellWidth / 2,
          row * cellHeight + cellHeight / 2,
        );
      }
    }
  }, []);

  return <canvas ref={canvasRef} />;
}
