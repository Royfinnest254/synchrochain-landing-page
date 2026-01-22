import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';

interface MatrixCell {
    row: number;
    col: number;
    value: 'primary' | 'backup' | 'empty';
}

interface MatrixVisualizationProps {
    cells: MatrixCell[];
    taskLabels: string[];
    nodeLabels: string[];
    compact?: boolean;
}

// Slight variations to avoid AI-perfect look
const jitter = () => (Math.random() - 0.5) * 0.8;

export const MatrixVisualization: React.FC<MatrixVisualizationProps> = ({
    cells,
    taskLabels,
    nodeLabels,
    compact = false
}) => {
    const [hoveredCell, setHoveredCell] = useState<string | null>(null);

    const cellSize = compact ? 32 : 40;
    const labelWidth = 95;

    const gridWidth = labelWidth + (nodeLabels.length * cellSize) + 20;
    const gridHeight = 32 + (taskLabels.length * cellSize) + 40;

    const cellMap = useMemo(() => {
        const map = new Map<string, MatrixCell>();
        cells.forEach(cell => {
            map.set(`${cell.row}-${cell.col}`, cell);
        });
        return map;
    }, [cells]);

    // Calculate assignment density per node
    const nodeDensity = useMemo(() => {
        const counts: Record<number, number> = {};
        cells.forEach(c => {
            if (c.value !== 'empty') {
                counts[c.col] = (counts[c.col] || 0) + 1;
            }
        });
        return counts;
    }, [cells]);

    if (taskLabels.length === 0 || nodeLabels.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-white/20">
                <div className="font-mono text-xs mb-2">BINARY MATRIX M ∈ {'{0,1}'}^(T×N)</div>
                <div className="text-[10px]">awaiting task allocation...</div>
                <div className="mt-4 w-32 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Header with technical info */}
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider">
                        Assignment Matrix
                    </span>
                    <span className="text-[8px] font-mono text-white/15">
                        dim={taskLabels.length}×{nodeLabels.length}
                    </span>
                </div>
                <div className="text-[8px] font-mono text-green-500/50">
                    ∀t: Σₙ M[t,n] ≤ 1 ✓
                </div>
            </div>

            <div className="overflow-auto pb-2">
                <svg
                    width={gridWidth}
                    height={gridHeight}
                    className="font-mono"
                    style={{ filter: 'url(#noise)' }}
                >
                    {/* Noise filter for subtle texture */}
                    <defs>
                        <filter id="noise" x="0%" y="0%" width="100%" height="100%">
                            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" result="noise" />
                            <feColorMatrix type="saturate" values="0" />
                            <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
                        </filter>
                    </defs>

                    {/* Column headers with load indicators */}
                    {nodeLabels.map((label, col) => {
                        const load = nodeDensity[col] || 0;
                        const loadPct = taskLabels.length > 0 ? (load / taskLabels.length) * 100 : 0;

                        return (
                            <g key={`col-${col}`}>
                                <text
                                    x={labelWidth + (col * cellSize) + cellSize / 2}
                                    y={14}
                                    textAnchor="middle"
                                    className="fill-white/50 text-[10px]"
                                >
                                    {label}
                                </text>
                                {/* Load bar */}
                                <rect
                                    x={labelWidth + (col * cellSize) + 4}
                                    y={20}
                                    width={cellSize - 8}
                                    height={3}
                                    fill="rgba(255,255,255,0.05)"
                                    rx={1}
                                />
                                <rect
                                    x={labelWidth + (col * cellSize) + 4}
                                    y={20}
                                    width={Math.max(0, (cellSize - 8) * loadPct / 100)}
                                    height={3}
                                    fill={loadPct > 70 ? 'rgba(239,68,68,0.6)' : 'rgba(59,130,246,0.5)'}
                                    rx={1}
                                />
                            </g>
                        );
                    })}

                    {/* Row labels and cells */}
                    {taskLabels.map((taskLabel, row) => (
                        <g key={`row-${row}`} transform={`translate(0, ${32 + row * cellSize})`}>
                            {/* Task label with subtle styling */}
                            <text
                                x={labelWidth - 8}
                                y={cellSize / 2 + 4}
                                textAnchor="end"
                                className="fill-white/40 text-[9px]"
                            >
                                {taskLabel}
                            </text>

                            {/* Row background for alternating effect */}
                            {row % 2 === 0 && (
                                <rect
                                    x={labelWidth}
                                    y={0}
                                    width={nodeLabels.length * cellSize}
                                    height={cellSize}
                                    fill="rgba(255,255,255,0.01)"
                                />
                            )}

                            {/* Cells */}
                            {nodeLabels.map((_, col) => {
                                const cell = cellMap.get(`${row}-${col}`);
                                const value = cell?.value ?? 'empty';
                                const cellKey = `${row}-${col}`;
                                const isHovered = hoveredCell === cellKey;

                                return (
                                    <g
                                        key={cellKey}
                                        onMouseEnter={() => setHoveredCell(cellKey)}
                                        onMouseLeave={() => setHoveredCell(null)}
                                        style={{ cursor: 'crosshair' }}
                                    >
                                        <rect
                                            x={labelWidth + col * cellSize + 3 + jitter()}
                                            y={3 + jitter()}
                                            width={cellSize - 6}
                                            height={cellSize - 6}
                                            rx={2}
                                            fill={
                                                value === 'primary' ? 'rgba(59, 130, 246, 0.7)' :
                                                    value === 'backup' ? 'rgba(217, 119, 6, 0.5)' :
                                                        'rgba(255, 255, 255, 0.02)'
                                            }
                                            stroke={
                                                value === 'primary' ? 'rgba(96, 165, 250, 0.8)' :
                                                    value === 'backup' ? 'rgba(245, 158, 11, 0.6)' :
                                                        'rgba(255, 255, 255, 0.04)'
                                            }
                                            strokeWidth={value === 'empty' ? 0.5 : 1}
                                            opacity={isHovered ? 1 : 0.9}
                                        />

                                        {/* Value indicator */}
                                        {value !== 'empty' && (
                                            <text
                                                x={labelWidth + col * cellSize + cellSize / 2}
                                                y={cellSize / 2 + 4}
                                                textAnchor="middle"
                                                className={`text-[10px] font-bold ${value === 'primary' ? 'fill-white' : 'fill-white/70'
                                                    }`}
                                            >
                                                {value === 'primary' ? '1' : 'β'}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                        </g>
                    ))}

                    {/* Grid lines for technical feel */}
                    <line
                        x1={labelWidth - 2}
                        y1={28}
                        x2={labelWidth - 2}
                        y2={32 + taskLabels.length * cellSize}
                        stroke="rgba(255,255,255,0.08)"
                        strokeDasharray="2 4"
                    />
                </svg>
            </div>

            {/* Footer legend with technical notation */}
            <div className="flex items-center justify-between mt-3 px-1 text-[9px] font-mono">
                <div className="flex gap-4 text-white/30">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-blue-500/60 border border-blue-400/50" />
                        <span>M[t,n]=1</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm bg-amber-600/50 border border-amber-500/40" />
                        <span>R[t,n]=1</span>
                    </div>
                </div>
                <div className="text-white/20">
                    sparsity: {((cells.filter(c => c.value === 'empty').length / Math.max(1, cells.length)) * 100).toFixed(1)}%
                </div>
            </div>

            {/* Hover tooltip */}
            {hoveredCell && (
                <div className="absolute top-2 right-2 bg-black/80 border border-white/10 px-2 py-1 text-[9px] font-mono text-white/60">
                    cell[{hoveredCell.replace('-', ',')}]
                </div>
            )}
        </div>
    );
};
