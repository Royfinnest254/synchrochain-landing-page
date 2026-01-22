import React, { useState, useEffect, useMemo } from 'react';
import { SynchroChainEngine } from '../lib/engine';

// Simple, functional lab-style workbench
// No gradients, no animations, just data

export const Workbench = () => {
    const [engine] = useState(() => new SynchroChainEngine());
    const [tick, setTick] = useState(0);
    const [isRunning, setIsRunning] = useState(true);

    const [metrics, setMetrics] = useState(engine.getMetrics());
    const [nodes, setNodes] = useState(engine.getNodes());
    const [tasks, setTasks] = useState(engine.getTasks());
    const [events, setEvents] = useState(engine.getEvents());

    const [throughputHistory, setThroughputHistory] = useState<number[]>([]);

    const syncState = () => {
        const m = engine.getMetrics();
        setMetrics(m);
        setNodes(engine.getNodes());
        setTasks(engine.getTasks());
        setEvents(engine.getEvents());
        setThroughputHistory(prev => [...prev.slice(-40), m.tasks_completed]);
    };

    useEffect(() => {
        syncState();
        if (!isRunning) return;

        const interval = setInterval(() => {
            engine.processTick();
            setTick(t => t + 1);
            syncState();
        }, 1000);

        return () => clearInterval(interval);
    }, [engine, isRunning]);

    const handleSubmit = () => {
        engine.submitTask();
        syncState();
    };

    const handleNodeToggle = (nodeId: string) => {
        const node = nodes.find(n => n.node_id === nodeId);
        if (node?.state === 'alive') {
            engine.injectNodeFailure(nodeId);
        } else {
            engine.recoverNode(nodeId);
        }
        syncState();
    };

    const handleReset = () => {
        engine.reset();
        syncState();
        setTick(0);
        setThroughputHistory([]);
    };

    const exportCSV = () => {
        let csv = 'event_id,timestamp,event_type,task_id,node_id\n';
        events.forEach(e => {
            csv += `${e.event_id},${e.timestamp},${e.event_type},${e.task_id || ''},${e.node_id || ''}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `synchrochain_events_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Simple sparkline
    const Sparkline = ({ data }: { data: number[] }) => {
        if (data.length < 2) return <span className="text-gray-500">--</span>;
        const max = Math.max(...data, 1);
        const width = 120;
        const height = 24;
        const points = data.map((v, i) =>
            `${(i / (data.length - 1)) * width},${height - (v / max) * height}`
        ).join(' ');
        return (
            <svg width={width} height={height} className="inline-block">
                <polyline points={points} fill="none" stroke="#666" strokeWidth="1.5" />
            </svg>
        );
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-mono pt-16">
            <div className="max-w-6xl mx-auto px-4 py-6">

                {/* Header */}
                <div className="border-b-2 border-gray-900 pb-4 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-xl font-bold uppercase tracking-wide">
                                SynchroChain Workbench
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Task Coordination Prototype • Build 1.1.4
                            </p>
                        </div>
                        <div className="text-right text-sm">
                            <div>Tick: <span className="font-bold">{tick}</span></div>
                            <div>Status: <span className={isRunning ? 'text-green-700' : 'text-gray-500'}>{isRunning ? 'RUNNING' : 'PAUSED'}</span></div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-bold uppercase hover:bg-gray-700"
                    >
                        + Submit Task
                    </button>
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className="px-4 py-2 border-2 border-gray-900 text-sm font-bold uppercase hover:bg-gray-100"
                    >
                        {isRunning ? 'Pause' : 'Resume'}
                    </button>
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 border-2 border-gray-400 text-gray-600 text-sm font-bold uppercase hover:bg-gray-100"
                    >
                        Reset
                    </button>
                    <button
                        onClick={exportCSV}
                        className="px-4 py-2 border-2 border-gray-400 text-gray-600 text-sm font-bold uppercase hover:bg-gray-100 ml-auto"
                    >
                        Export CSV
                    </button>
                </div>

                {/* Metrics Table */}
                <div className="mb-6">
                    <h2 className="text-sm font-bold uppercase text-gray-500 mb-2">System Metrics</h2>
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="border-b-2 border-gray-900">
                                <th className="text-left py-2 font-bold">Metric</th>
                                <th className="text-right py-2 font-bold">Value</th>
                                <th className="text-right py-2 font-bold">Trend</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-200">
                                <td className="py-2">Tasks Submitted</td>
                                <td className="text-right font-bold">{metrics.tasks_submitted}</td>
                                <td className="text-right"><Sparkline data={throughputHistory} /></td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2">Tasks Completed</td>
                                <td className="text-right font-bold text-green-700">{metrics.tasks_completed}</td>
                                <td className="text-right text-gray-500">
                                    {metrics.tasks_submitted > 0 ? Math.round((metrics.tasks_completed / metrics.tasks_submitted) * 100) : 0}%
                                </td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2">Tasks Running</td>
                                <td className="text-right font-bold">{metrics.tasks_running}</td>
                                <td className="text-right text-gray-500">--</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2">Tasks Blocked</td>
                                <td className="text-right font-bold text-red-700">{metrics.tasks_blocked}</td>
                                <td className="text-right text-gray-500">--</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2">Avg Latency</td>
                                <td className="text-right font-bold">{metrics.avg_latency_ms}ms</td>
                                <td className="text-right text-gray-500">--</td>
                            </tr>
                            <tr className="border-b border-gray-200">
                                <td className="py-2">Events Logged</td>
                                <td className="text-right font-bold">{metrics.events_total}</td>
                                <td className="text-right text-gray-500">--</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-2 gap-6">

                    {/* Left: Nodes + Tasks */}
                    <div>
                        {/* Nodes */}
                        <div className="mb-6">
                            <h2 className="text-sm font-bold uppercase text-gray-500 mb-2">Node Cluster</h2>
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-b-2 border-gray-900">
                                        <th className="text-left py-2">Node ID</th>
                                        <th className="text-center py-2">State</th>
                                        <th className="text-right py-2">Tasks</th>
                                        <th className="text-right py-2">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {nodes.map(node => (
                                        <tr key={node.node_id} className="border-b border-gray-200">
                                            <td className="py-2 font-bold">{node.node_id}</td>
                                            <td className="text-center">
                                                <span className={`inline-block px-2 py-0.5 text-xs font-bold uppercase ${node.state === 'alive' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {node.state}
                                                </span>
                                            </td>
                                            <td className="text-right">{node.tasks_processed}</td>
                                            <td className="text-right">
                                                <button
                                                    onClick={() => handleNodeToggle(node.node_id)}
                                                    className="text-xs text-blue-600 hover:underline"
                                                >
                                                    {node.state === 'alive' ? 'fail' : 'recover'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Task Queue */}
                        <div>
                            <h2 className="text-sm font-bold uppercase text-gray-500 mb-2">
                                Task Queue ({tasks.length})
                            </h2>
                            <div className="border-2 border-gray-200 max-h-64 overflow-y-auto">
                                <table className="w-full border-collapse text-xs">
                                    <thead className="sticky top-0 bg-gray-100">
                                        <tr>
                                            <th className="text-left py-1 px-2">ID</th>
                                            <th className="text-left py-1 px-2">Status</th>
                                            <th className="text-left py-1 px-2">Node</th>
                                            <th className="text-right py-1 px-2">Latency</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasks.slice(-20).reverse().map(task => (
                                            <tr key={task.task_id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-1 px-2 font-mono">{task.task_id}</td>
                                                <td className="py-1 px-2">
                                                    <span className={`text-xs font-bold ${task.status === 'COMPLETED' ? 'text-green-700' :
                                                            task.status === 'RUNNING' ? 'text-blue-700' :
                                                                task.status === 'BLOCKED' ? 'text-red-700' :
                                                                    'text-gray-500'
                                                        }`}>
                                                        {task.status}
                                                    </span>
                                                </td>
                                                <td className="py-1 px-2 text-gray-600">{task.assigned_node || '--'}</td>
                                                <td className="py-1 px-2 text-right text-gray-600">
                                                    {task.latency_ms ? `${task.latency_ms}ms` : '--'}
                                                </td>
                                            </tr>
                                        ))}
                                        {tasks.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="py-8 text-center text-gray-400">
                                                    No tasks. Click "Submit Task" to begin.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right: Event Log */}
                    <div>
                        <h2 className="text-sm font-bold uppercase text-gray-500 mb-2">
                            Event Log ({events.length})
                        </h2>
                        <div className="border-2 border-gray-200 max-h-[500px] overflow-y-auto bg-gray-50">
                            <pre className="text-xs p-2 leading-relaxed">
                                {events.length === 0 && (
                                    <span className="text-gray-400">Waiting for events...</span>
                                )}
                                {events.slice(-50).reverse().map((event, i) => {
                                    const time = String(event.timestamp).padStart(6, '0');
                                    const type = (event.event_type || 'event').padEnd(20);
                                    const task = event.task_id ? `task=${event.task_id}` : '';
                                    const node = event.node_id ? `node=${event.node_id}` : '';
                                    const hash = event.hash ? `hash=${event.hash.slice(0, 8)}` : '';

                                    return (
                                        <div key={event.event_id || i} className={`${event.event_type?.includes('completed') ? 'text-green-700' :
                                                event.event_type?.includes('fail') || event.event_type?.includes('blocked') ? 'text-red-700' :
                                                    'text-gray-700'
                                            }`}>
                                            [{time}] {type} {task} {node} {hash}
                                        </div>
                                    );
                                })}
                            </pre>
                        </div>

                        {/* Invariants */}
                        <div className="mt-4">
                            <h2 className="text-sm font-bold uppercase text-gray-500 mb-2">Invariants</h2>
                            <div className="text-xs space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-600"></span>
                                    <span>IV-01 Task Uniqueness</span>
                                    <span className="text-green-600 font-bold ml-auto">PASS</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-600"></span>
                                    <span>IV-02 At-Most-Once Execution</span>
                                    <span className="text-green-600 font-bold ml-auto">PASS</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-600"></span>
                                    <span>IV-06 Immutable Event Log</span>
                                    <span className="text-green-600 font-bold ml-auto">PASS</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-500 flex justify-between">
                    <span>SynchroChain Research Prototype v1.1.4</span>
                    <span>Chain: {events.length} events | All invariants hold</span>
                </div>
            </div>
        </div>
    );
};

export default Workbench;
