import React from 'react';
import { motion } from 'motion/react';

interface StateNode {
    name: string;
    count: number;
    active: boolean;
}

interface StateTransition {
    from: string;
    to: string;
    count: number;
}

interface StateFlowDiagramProps {
    states: StateNode[];
    transitions: StateTransition[];
}

// Positions with slight imperfection
const STATE_POS: Record<string, { x: number; y: number }> = {
    PENDING: { x: 55, y: 55 },
    ASSIGNED: { x: 158, y: 52 },
    RUNNING: { x: 262, y: 54 },
    COMPLETED: { x: 365, y: 53 },
    BLOCKED: { x: 185, y: 138 },
    UNCERTAIN: { x: 305, y: 140 }
};

const STATE_META: Record<string, { color: string; abbr: string; desc: string }> = {
    PENDING: { color: '#64748b', abbr: 'PND', desc: 'awaiting allocation' },
    ASSIGNED: { color: '#8b5cf6', abbr: 'ASN', desc: 'node selected' },
    RUNNING: { color: '#3b82f6', abbr: 'RUN', desc: 'executing' },
    COMPLETED: { color: '#10b981', abbr: 'CMP', desc: 'success' },
    BLOCKED: { color: '#ef4444', abbr: 'BLK', desc: 'fault detected' },
    UNCERTAIN: { color: '#f59e0b', abbr: 'UNC', desc: 'ack timeout' }
};

export const StateFlowDiagram: React.FC<StateFlowDiagramProps> = ({
    states,
    transitions
}) => {
    const width = 440;
    const height = 200;
    const nodeRadius = 26;

    // Build transition lookup
    const transitionCounts = new Map<string, number>();
    transitions.forEach(t => {
        transitionCounts.set(`${t.from}->${t.to}`, t.count);
    });

    const getPath = (from: string, to: string): string => {
        const start = STATE_POS[from];
        const end = STATE_POS[to];
        if (!start || !end) return '';

        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const ox = (dx / dist) * nodeRadius;
        const oy = (dy / dist) * nodeRadius;

        const x1 = start.x + ox;
        const y1 = start.y + oy;
        const x2 = end.x - ox * 1.2;
        const y2 = end.y - oy * 1.2;

        if (Math.abs(dy) > 20) {
            const cx = (x1 + x2) / 2;
            const cy = (y1 + y2) / 2 + (dy > 0 ? -25 : 25);
            return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
        }

        return `M ${x1} ${y1} L ${x2} ${y2}`;
    };

    // Active transitions
    const activeTransitions = transitions.filter(t => t.count > 0);
    const totalTransitions = activeTransitions.reduce((s, t) => s + t.count, 0);

    return (
        <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider">
                        State Machine
                    </span>
                    <span className="text-[8px] font-mono text-white/15">
                        |S|=6, |δ|={transitions.length}
                    </span>
                </div>
                <div className="text-[8px] font-mono text-white/20">
                    transitions: {totalTransitions}
                </div>
            </div>

            <svg width={width} height={height} className="font-mono">
                <defs>
                    <marker
                        id="arrow-dim"
                        markerWidth="6"
                        markerHeight="5"
                        refX="5"
                        refY="2.5"
                        orient="auto"
                    >
                        <polygon points="0 0, 6 2.5, 0 5" fill="rgba(255,255,255,0.15)" />
                    </marker>
                    <marker
                        id="arrow-active"
                        markerWidth="7"
                        markerHeight="5"
                        refX="6"
                        refY="2.5"
                        orient="auto"
                    >
                        <polygon points="0 0, 7 2.5, 0 5" fill="rgba(59,130,246,0.7)" />
                    </marker>
                </defs>

                {/* Transitions */}
                {transitions.map((t, idx) => {
                    const path = getPath(t.from, t.to);
                    const active = t.count > 0;

                    return (
                        <g key={`${t.from}-${t.to}`}>
                            <path
                                d={path}
                                fill="none"
                                stroke={active ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.06)'}
                                strokeWidth={active ? 1.5 : 0.8}
                                strokeDasharray={active ? '0' : '3 2'}
                                markerEnd={active ? 'url(#arrow-active)' : 'url(#arrow-dim)'}
                            />
                            {/* Transition count */}
                            {active && t.count > 1 && (
                                <text
                                    x={STATE_POS[t.from] ? (STATE_POS[t.from].x + (STATE_POS[t.to]?.x || 0)) / 2 : 0}
                                    y={STATE_POS[t.from] ? (STATE_POS[t.from].y + (STATE_POS[t.to]?.y || 0)) / 2 - 8 : 0}
                                    textAnchor="middle"
                                    className="fill-blue-400/40 text-[7px]"
                                >
                                    ×{t.count}
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* State nodes */}
                {states.map((state) => {
                    const pos = STATE_POS[state.name];
                    const meta = STATE_META[state.name];
                    if (!pos || !meta) return null;

                    const isActive = state.count > 0;

                    return (
                        <g key={state.name}>
                            {/* Outer glow for active */}
                            {isActive && (
                                <motion.circle
                                    cx={pos.x}
                                    cy={pos.y}
                                    r={nodeRadius + 8}
                                    fill="none"
                                    stroke={meta.color}
                                    strokeWidth={0.5}
                                    opacity={0.3}
                                    animate={{ opacity: [0.15, 0.4, 0.15] }}
                                    transition={{ repeat: Infinity, duration: 2.5 }}
                                />
                            )}

                            {/* Main circle */}
                            <circle
                                cx={pos.x}
                                cy={pos.y}
                                r={nodeRadius}
                                fill={`${meta.color}15`}
                                stroke={meta.color}
                                strokeWidth={isActive ? 2 : 1}
                                opacity={isActive ? 1 : 0.5}
                            />

                            {/* State abbreviation */}
                            <text
                                x={pos.x}
                                y={pos.y - 3}
                                textAnchor="middle"
                                fill={meta.color}
                                className="text-[9px] font-bold uppercase"
                                opacity={isActive ? 1 : 0.6}
                            >
                                {meta.abbr}
                            </text>

                            {/* Count */}
                            <text
                                x={pos.x}
                                y={pos.y + 10}
                                textAnchor="middle"
                                className={`text-[12px] font-bold ${isActive ? 'fill-white' : 'fill-white/30'}`}
                            >
                                {state.count}
                            </text>

                            {/* Description on hover area - shows on active */}
                            {isActive && (
                                <text
                                    x={pos.x}
                                    y={pos.y + nodeRadius + 12}
                                    textAnchor="middle"
                                    className="fill-white/25 text-[6px]"
                                >
                                    {meta.desc}
                                </text>
                            )}
                        </g>
                    );
                })}

                {/* Zone labels */}
                <text x={55} y={height - 8} textAnchor="middle" className="fill-white/10 text-[7px]">
                    intake
                </text>
                <text x={365} y={height - 8} textAnchor="middle" className="fill-white/10 text-[7px]">
                    terminal
                </text>
                <text x={245} y={height - 8} textAnchor="middle" className="fill-white/10 text-[7px]">
                    fault domain
                </text>

                {/* Formal notation */}
                <text x={width - 10} y={16} textAnchor="end" className="fill-white/10 text-[7px]">
                    δ: S × Σ → S
                </text>
            </svg>

            {/* State summary bar */}
            <div className="flex gap-1 mt-3 px-1">
                {states.map(s => {
                    const meta = STATE_META[s.name];
                    if (!meta) return null;
                    const pct = states.reduce((sum, st) => sum + st.count, 0);
                    const width = pct > 0 ? (s.count / pct) * 100 : 0;

                    return (
                        <div
                            key={s.name}
                            className="h-1.5 rounded-full transition-all duration-500"
                            style={{
                                width: `${Math.max(width, s.count > 0 ? 8 : 2)}%`,
                                backgroundColor: s.count > 0 ? meta.color : 'rgba(255,255,255,0.05)'
                            }}
                            title={`${s.name}: ${s.count}`}
                        />
                    );
                })}
            </div>
        </div>
    );
};
