import React, { useState } from 'react';
import { motion } from 'motion/react';

interface ChainEvent {
    id: string;
    hashPreview: string;
    type: string;
    linked: boolean;
}

interface ChainAnchor {
    id: string;
    position: number;
    hashPreview: string;
}

interface HashChainGraphProps {
    events: ChainEvent[];
    anchors: ChainAnchor[];
    onVerifyAnchor?: (index: number) => void;
}

const TYPE_COLORS: Record<string, string> = {
    task_submitted: '#6366f1',
    task_assigned: '#8b5cf6',
    task_started: '#0ea5e9',
    task_completed: '#10b981',
    task_blocked: '#ef4444',
    task_uncertain: '#f59e0b',
    task_requeued: '#14b8a6',
    node_failed: '#dc2626',
    node_recovered: '#22c55e',
    node_registered: '#64748b'
};

export const HashChainGraph: React.FC<HashChainGraphProps> = ({
    events,
    anchors,
    onVerifyAnchor
}) => {
    const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

    const nodeWidth = 48;
    const nodeSpacing = 56;
    const anchorSet = new Set(anchors.map(a => a.position));

    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="font-mono text-[10px] text-white/20 mb-1">
                    H₀ = SHA256(∅)
                </div>
                <div className="text-white/15 text-[9px]">genesis block pending</div>
                <div className="mt-6 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="w-8 h-8 border border-dashed border-white/10 rounded"
                            style={{ opacity: 1 - i * 0.15 }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    const totalWidth = Math.max(events.length * nodeSpacing + 80, 300);

    return (
        <div className="relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-3">
                    <span className="text-[9px] font-mono text-white/30 uppercase tracking-wider">
                        Event Chain
                    </span>
                    <span className="text-[8px] font-mono text-white/15">
                        len={events.length}
                    </span>
                </div>
                <div className="flex items-center gap-2 text-[8px] font-mono">
                    <span className="text-white/20">anchors: {anchors.length}</span>
                    <span className={events.every(e => e.linked) ? 'text-green-500/60' : 'text-red-500/60'}>
                        {events.every(e => e.linked) ? 'INTACT' : 'BROKEN'}
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto overflow-y-hidden pb-4">
                <svg width={totalWidth} height={140} className="font-mono">
                    {/* Connection lines */}
                    {events.map((event, idx) => {
                        if (idx === 0) return null;
                        const x1 = 40 + (idx - 1) * nodeSpacing + nodeWidth / 2 + 8;
                        const x2 = 40 + idx * nodeSpacing - 8;
                        const y = 50;
                        const broken = !event.linked;

                        return (
                            <g key={`line-${idx}`}>
                                <line
                                    x1={x1}
                                    y1={y}
                                    x2={x2}
                                    y2={y}
                                    stroke={broken ? 'rgba(239,68,68,0.4)' : 'rgba(100,116,139,0.3)'}
                                    strokeWidth={1.5}
                                    strokeDasharray={broken ? '3 2' : '0'}
                                />
                                {/* Hash preview on line */}
                                {idx % 3 === 0 && !broken && (
                                    <text
                                        x={(x1 + x2) / 2}
                                        y={y - 6}
                                        textAnchor="middle"
                                        className="fill-white/10 text-[6px]"
                                    >
                                        {event.hashPreview.slice(0, 4)}
                                    </text>
                                )}
                            </g>
                        );
                    })}

                    {/* Event nodes */}
                    {events.map((event, idx) => {
                        const x = 40 + idx * nodeSpacing;
                        const y = 35;
                        const color = TYPE_COLORS[event.type] || '#64748b';
                        const hasAnchor = anchorSet.has(idx);
                        const isSelected = selectedEvent === idx;

                        return (
                            <g
                                key={event.id}
                                onClick={() => setSelectedEvent(isSelected ? null : idx)}
                                style={{ cursor: 'pointer' }}
                            >
                                {/* Selection ring */}
                                {isSelected && (
                                    <rect
                                        x={x - 4}
                                        y={y - 4}
                                        width={nodeWidth + 8}
                                        height={38}
                                        rx={6}
                                        fill="none"
                                        stroke="rgba(255,255,255,0.2)"
                                        strokeWidth={1}
                                    />
                                )}

                                {/* Main node */}
                                <rect
                                    x={x}
                                    y={y}
                                    width={nodeWidth}
                                    height={30}
                                    rx={4}
                                    fill="rgba(15, 16, 18, 0.95)"
                                    stroke={color}
                                    strokeWidth={1.5}
                                    opacity={0.9}
                                />

                                {/* Hash display */}
                                <text
                                    x={x + nodeWidth / 2}
                                    y={y + 13}
                                    textAnchor="middle"
                                    className="fill-white/70 text-[8px]"
                                >
                                    {event.hashPreview}
                                </text>

                                {/* Event type */}
                                <text
                                    x={x + nodeWidth / 2}
                                    y={y + 24}
                                    textAnchor="middle"
                                    fill={color}
                                    className="text-[6px] uppercase"
                                    opacity={0.7}
                                >
                                    {event.type.split('_')[1]?.slice(0, 4) || event.type.slice(0, 4)}
                                </text>

                                {/* Index marker */}
                                <text
                                    x={x + nodeWidth / 2}
                                    y={y + 42}
                                    textAnchor="middle"
                                    className="fill-white/15 text-[7px]"
                                >
                                    {idx}
                                </text>

                                {/* Anchor marker */}
                                {hasAnchor && (
                                    <g transform={`translate(${x + nodeWidth / 2}, ${y - 12})`}>
                                        <rect
                                            x={-16}
                                            y={-6}
                                            width={32}
                                            height={12}
                                            rx={2}
                                            fill="rgba(245, 158, 11, 0.15)"
                                            stroke="rgba(245, 158, 11, 0.4)"
                                            strokeWidth={0.5}
                                        />
                                        <text
                                            x={0}
                                            y={3}
                                            textAnchor="middle"
                                            className="fill-amber-500/70 text-[7px]"
                                        >
                                            R{anchors.find(a => a.position === idx)?.id.split('-')[1]}
                                        </text>
                                    </g>
                                )}

                                {/* Integrity warning */}
                                {!event.linked && idx > 0 && (
                                    <circle
                                        cx={x + nodeWidth + 2}
                                        cy={y}
                                        r={5}
                                        fill="#dc2626"
                                    />
                                )}
                            </g>
                        );
                    })}

                    {/* Genesis marker */}
                    <text x={40} y={100} className="fill-white/10 text-[7px] font-mono">
                        genesis
                    </text>

                    {/* Chain tip */}
                    <text
                        x={40 + (events.length - 1) * nodeSpacing + nodeWidth / 2}
                        y={100}
                        textAnchor="middle"
                        className="fill-blue-400/40 text-[7px] font-mono"
                    >
                        tip
                    </text>
                </svg>
            </div>

            {/* Technical footer */}
            <div className="flex items-center justify-between px-1 text-[8px] font-mono text-white/20 mt-2">
                <div>
                    Hₑ = SHA256(eᵢ ∥ Hₑ₋₁ ∥ ts ∥ type ∥ payload)
                </div>
                <div className="flex items-center gap-3">
                    <span>block_size: 10</span>
                    <span>verified: {(anchors.length * 10).toString().padStart(3, '0')}</span>
                </div>
            </div>

            {/* Selected event detail */}
            {selectedEvent !== null && events[selectedEvent] && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-0 left-0 right-0 bg-black/90 border border-white/10 p-3 text-[9px] font-mono"
                >
                    <div className="flex justify-between text-white/40">
                        <span>event[{selectedEvent}].hash</span>
                        <span className="text-white/60">{events[selectedEvent].hashPreview}...</span>
                    </div>
                    <div className="flex justify-between text-white/40 mt-1">
                        <span>event[{selectedEvent}].type</span>
                        <span style={{ color: TYPE_COLORS[events[selectedEvent].type] || '#64748b' }}>
                            {events[selectedEvent].type}
                        </span>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
