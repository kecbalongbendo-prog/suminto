import React from 'react';

interface QrCodeSvgProps {
  value: string;
  size?: number;
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const QrCodeSvg: React.FC<QrCodeSvgProps> = ({ value, size = 128 }) => {
  const grid = 21;
  const cells: boolean[][] = Array.from({ length: grid }, () => Array(grid).fill(false));

  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        cells[r0 + r][c0 + c] = isBorder || isCenter;
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(0, grid - 7);
  drawFinder(grid - 7, 0);

  let seed = hashSeed(value);
  const nextBit = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return (seed & 0x10000) !== 0;
  };

  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= grid - 8;
      const inBottomLeft = r >= grid - 8 && c < 8;
      if (inTopLeft || inTopRight || inBottomLeft) continue;

      if (r === 6 || c === 6) {
        cells[r][c] = (r + c) % 2 === 0;
      } else {
        cells[r][c] = nextBit();
      }
    }
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${grid + 2} ${grid + 2}`}
      className="bg-white rounded-lg border border-slate-200 p-1.5"
      role="img"
      aria-label={`QR Code verifikasi untuk ${value}`}
    >
      <rect x={0} y={0} width={grid + 2} height={grid + 2} fill="#FFFFFF" />
      {cells.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={c + 1}
              y={r + 1}
              width={1}
              height={1}
              fill="#022C22"
            />
          ) : null
        )
      )}
    </svg>
  );
};
