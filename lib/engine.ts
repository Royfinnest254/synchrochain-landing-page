
import { INVARIANTS, Invariant } from './invariants';

// --- DATA STRUCTURES ---

export type TaskStatus = 'pending' | 'running' | 'completed' | 'blocked';
export type NodeStatus = 'alive' | 'failed' | 'unknown' | 'stale';

export interface DecisionSnapshot {
    task_states: Record<string, TaskStatus>;
    node_states: Record<string, NodeStatus>;
    uncertainty_flags: string[];
    invariant_evaluated: string | null;
}

export interface Task {
    task_id: string;
    status: TaskStatus;
    submit_intent_hash?: string; // For duplicate detection
    assigned_node: string | null;
    created_at: number;
    started_at: number | null;
    completed_at: number | null;
    blocked_reason?: string;
    blocked_by_invariant?: string;
    is_uncertain?: boolean;
    latency_ms?: number;
}

export interface SystemNode {
    node_id: string;
    state: NodeStatus;
    last_seen: number;
}

export interface SystemEvent {
    event_id: string;
    previous_event_id: string | null; // Causality Chain
    causality_chain_id: string;
    timestamp: number;
    event_type: string;
    task_id: string | null;
    node_id: string | null;
    invariant_id_applied: string | null; // Invariant Registry reference
    metadata: string;
    snapshot?: DecisionSnapshot; // Why the decision was made
}

// --- ENGINE CLASS ---

// --- ENGINE CLASS ---

export class SynchroChainEngine {
    private events: SystemEvent[] = [];
    private tasks: Map<string, Task> = new Map();
    private nodes: Map<string, SystemNode> = new Map();

    private eventIdCounter = 100;
    private taskIdCounter = 5000;
    private lastEventId: string | null = null;
    private currentCausalityChainId: string;

    constructor() {
        this.currentCausalityChainId = `CHAIN-${Date.now()}`;
        // Implicitly initialize 3 nodes for manual playground
        ['Node-01', 'Node-02', 'Node-03'].forEach(nid => this.manualRegisterNode(nid));
    }

    // --- TRUTH LAYER (LOGGING) ---

    private logEvent(
        type: string,
        tid: string | null,
        nid: string | null,
        meta: string,
        invariantId: string | null
    ): SystemEvent {
        const eid = `E-${this.eventIdCounter++}`;
        const event: SystemEvent = {
            event_id: eid,
            previous_event_id: this.lastEventId,
            causality_chain_id: this.currentCausalityChainId,
            timestamp: Date.now(),
            event_type: type,
            task_id: tid,
            node_id: nid,
            invariant_id_applied: invariantId,
            metadata: meta,
            snapshot: this.createSnapshot(invariantId)
        };

        this.events.push(event);
        this.lastEventId = eid;

        // Apply to local state immediately
        this.applyEventToState(event);
        return event;
    }

    private createSnapshot(invariantId: string | null): DecisionSnapshot {
        const tStates: Record<string, TaskStatus> = {};
        this.tasks.forEach((t, k) => tStates[k] = t.status);
        const nStates: Record<string, NodeStatus> = {};
        this.nodes.forEach((n, k) => nStates[k] = n.state);
        return {
            task_states: tStates,
            node_states: nStates,
            uncertainty_flags: [],
            invariant_evaluated: invariantId
        };
    }

    private applyEventToState(e: SystemEvent) {
        // 1. Task Logic
        if (e.task_id) {
            let task = this.tasks.get(e.task_id);
            if (e.event_type === 'task_submitted' && !task) {
                this.tasks.set(e.task_id, {
                    task_id: e.task_id,
                    status: 'pending',
                    assigned_node: null,
                    created_at: e.timestamp,
                    started_at: null,
                    completed_at: null
                });
            }
            else if (task) {
                if (e.event_type === 'task_assigned') task.assigned_node = e.node_id;
                else if (e.event_type === 'task_started') { task.status = 'running'; task.started_at = e.timestamp; }
                else if (e.event_type === 'task_completed') { task.status = 'completed'; task.completed_at = e.timestamp; }
                else if (e.event_type === 'task_blocked') { task.status = 'blocked'; task.blocked_reason = e.metadata; }
            }
        }
        // 2. Node Logic
        if (e.node_id) {
            let node = this.nodes.get(e.node_id);
            if (!node && e.event_type === 'node_added') {
                node = { node_id: e.node_id, state: 'alive', last_seen: e.timestamp };
                this.nodes.set(e.node_id, node);
            }
            if (node) {
                if (e.event_type === 'node_failed') node.state = 'failed';
                if (e.event_type === 'node_recovered') node.state = 'alive';
                node.last_seen = e.timestamp;
            }
        }
    }

    // --- AUTOMATED COORDINATOR LOOP ---

    public processTick() {
        const now = Date.now();

        // 1. AUTO-ASSIGNMENT (Pending -> Running)
        // Rule: Assign to first alphabetical ALIVE node.
        const pendingTasks = Array.from(this.tasks.values()).filter(t => t.status === 'pending');
        const aliveNodes = Array.from(this.nodes.values())
            .filter(n => n.state === 'alive')
            .sort((a, b) => a.node_id.localeCompare(b.node_id));

        for (const t of pendingTasks) {
            if (aliveNodes.length > 0) {
                const targetNode = aliveNodes[0];

                // IV_02: Liveness Check (Redundant but explicit)
                if (targetNode.state !== 'alive') continue;

                // State Transition
                // PENDING -> RUNNING (Assignment is implicit start in this auto-model? 
                // Super Prompt says: Assign -> Running. We can do direct assignment then start.)

                // Actually Super Prompt says: 
                // "Coordinator automatically selects... Task is assigned... Event logged"
                // Then "Coordinator marks task RUNNING... Task runs... Task auto-completes"

                // Let's do: Pending -> Running (Assigned) immediately in one tick for simplicity,
                // or separate ticks? Let's do immediate assignment + start to keep responsiveness high.

                // Update State
                t.assigned_node = targetNode.node_id;
                t.status = 'running';
                t.started_at = now;

                this.logEvent('task_assigned', t.task_id, targetNode.node_id, 'Auto-Assignment', null);
                this.logEvent('task_started', t.task_id, targetNode.node_id, 'Execution Started', null);
            } else {
                // If no nodes, we wait. Or Block? 
                // "If not alive_nodes: task.status = BLOCKED"
                if (t.status !== 'blocked') {
                    // Only log/change if not already blocked to avoid spam
                    t.status = 'blocked';
                    this.logEvent('task_blocked', t.task_id, null, 'No eligible nodes for assignment', INVARIANTS.IV_08_RESOURCE.id);
                }
            }
        }

        // 2. AUTO-EXECUTION (Running -> Completed)
        const runningTasks = Array.from(this.tasks.values()).filter(t => t.status === 'running');
        const SIMULATED_DURATION = 2000; // 2 seconds

        for (const t of runningTasks) {
            const node = this.nodes.get(t.assigned_node!);

            // IV_02: Continuous Liveness Check
            if (!node || node.state !== 'alive') {
                t.status = 'blocked';
                this.logEvent('task_blocked', t.task_id, t.assigned_node, 'Node failed during execution', INVARIANTS.IV_02_LIVENESS.id);
                continue;
            }

            // Check Duration
            if (t.started_at && (now - t.started_at >= SIMULATED_DURATION)) {
                t.status = 'completed';
                t.completed_at = now;
                t.latency_ms = now - t.started_at;

                this.logEvent('task_completed', t.task_id, t.assigned_node, `Completed. Latency: ${t.latency_ms}ms`, null);
            }
        }
    }

    // --- MANUAL CONTROLS (Failures Only) ---

    public manualInjectTask() {
        const tid = `T-${this.taskIdCounter++}`;
        // IV_01
        if (this.tasks.has(tid)) return;

        this.tasks.set(tid, {
            task_id: tid,
            status: 'pending',
            assigned_node: null,
            created_at: Date.now(),
            started_at: null,
            completed_at: null
        });

        this.logEvent('task_submitted', tid, null, 'Manual Injection', null);
    }

    public manualFailNode(nodeId: string) {
        const n = this.nodes.get(nodeId);
        if (!n) return;
        this.logEvent('node_failed', null, nodeId, 'Manual Failure Injection', null);
        // State update happens in applyEventToState usually, but here we can force it for the 'tick'
        // Actually logEvent calls applyEventToState.
    }

    public manualRecoverNode(nodeId: string) {
        this.logEvent('node_recovered', null, nodeId, 'Manual Recovery', null);
    }

    public manualRegisterNode(nodeId: string) {
        if (this.nodes.has(nodeId)) return;
        this.logEvent('node_added', null, nodeId, 'Manual Node Registration', null);
    }

    // --- ACCESSORS ---
    public getEvents() { return [...this.events]; }
    public getTasks() { return Array.from(this.tasks.values()); }
    public getNodes() { return Array.from(this.nodes.values()); }

    // Truth vs State Reconstruction
    public rebuildStateFromLog(): void {
        this.tasks.clear();
        this.nodes.clear();
        this.events.forEach(e => this.applyEventToState(e));
    }
}
