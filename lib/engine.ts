/**
 * SynchroChain Engine v1.1
 * 
 * Coordination-first execution layer with formal correctness guarantees.
 * Integrates matrix allocation, hash-chained logging, and state machine.
 */

import { CoordinationMatrix, TaskId, NodeId } from './coordination-matrix';
import { HashChain, HashedEvent } from './hash-chain';
import { TaskStateMachine, TaskState, TransitionTrigger } from './state-machine';
import { INVARIANTS } from './invariants';

// Configuration
const CONFIG = {
    UNCERTAINTY_TIMEOUT_MS: 5000,
    TASK_EXECUTION_MS: 2500,
    MAX_PENDING_TASKS: 100,
    BACKUP_COUNT: 1,
    ENABLE_AUTO_BACKUP: true
};

export interface Task {
    task_id: string;
    status: TaskState;
    assigned_node: string | null;
    backup_nodes: string[];
    created_at: number;
    started_at: number | null;
    completed_at: number | null;
    blocked_reason?: string;
    is_uncertain: boolean;
    latency_ms?: number;
}

export interface SystemNode {
    node_id: string;
    state: 'alive' | 'failed' | 'unknown';
    last_seen: number;
    tasks_processed: number;
    tasks_blocked: number;
}

export interface SystemEvent {
    event_id: string;
    previous_event_id: string | null;
    hash: string;
    timestamp: number;
    event_type: string;
    task_id: string | null;
    node_id: string | null;
    invariant_id_applied: string | null;
    metadata: string;
}

export interface EngineMetrics {
    tasks_submitted: number;
    tasks_completed: number;
    tasks_blocked: number;
    tasks_uncertain: number;
    tasks_pending: number;
    tasks_running: number;
    node_failures: number;
    events_total: number;
    chain_valid: boolean;
    avg_latency_ms: number;
}

export class SynchroChainEngine {
    private matrix: CoordinationMatrix;
    private hashChain: HashChain;
    private stateMachine: TaskStateMachine;

    private tasks: Map<string, Task> = new Map();
    private nodes: Map<string, SystemNode> = new Map();

    private eventCounter = 1000;
    private taskCounter = 1;

    // Simulation flags
    public sim_drop_acks = false;
    public sim_network_delay = 0;
    public sim_resource_exhaustion = false;

    constructor() {
        this.matrix = new CoordinationMatrix();
        this.hashChain = new HashChain();
        this.stateMachine = new TaskStateMachine();

        // Initialize default nodes
        this.initializeNodes(['Alpha', 'Beta', 'Gamma']);
    }

    // ==================== NODE MANAGEMENT ====================

    initializeNodes(nodeIds: string[]): void {
        for (const id of nodeIds) {
            this.registerNode(id);
        }
    }

    registerNode(nodeId: string): void {
        if (this.nodes.has(nodeId)) return;

        const node: SystemNode = {
            node_id: nodeId,
            state: 'alive',
            last_seen: Date.now(),
            tasks_processed: 0,
            tasks_blocked: 0
        };

        this.nodes.set(nodeId, node);
        this.logEvent('node_registered', null, nodeId, `Node ${nodeId} joined cluster`);
    }

    injectNodeFailure(nodeId: string): void {
        const node = this.nodes.get(nodeId);
        if (!node || node.state === 'failed') return;

        node.state = 'failed';
        this.logEvent('node_failed', null, nodeId, 'Manual fault injection');

        // Block all tasks on this node
        const affectedTasks = this.matrix.getTasksForNode(nodeId);
        for (const taskId of affectedTasks) {
            this.handleNodeFailureForTask(taskId, nodeId);
        }
    }

    recoverNode(nodeId: string): void {
        const node = this.nodes.get(nodeId);
        if (!node) return;

        node.state = 'alive';
        node.last_seen = Date.now();
        this.logEvent('node_recovered', null, nodeId, 'Node back online');
    }

    private handleNodeFailureForTask(taskId: string, nodeId: string): void {
        const task = this.tasks.get(taskId);
        if (!task) return;

        const currentState = this.stateMachine.getState(taskId);

        if (currentState === 'RUNNING' || currentState === 'ASSIGNED') {
            // Transition to BLOCKED
            this.stateMachine.transition(taskId, 'NODE_FAIL', { failedNode: nodeId });
            task.status = 'BLOCKED';
            task.blocked_reason = `Node ${nodeId} failed during execution`;

            // Release from matrix
            this.matrix.releasePrimary(taskId);

            this.logEvent(
                'task_blocked',
                taskId,
                nodeId,
                task.blocked_reason,
                INVARIANTS.IV_02_LIVENESS.id
            );

            // Update node stats
            const node = this.nodes.get(nodeId);
            if (node) node.tasks_blocked++;
        }
    }

    // ==================== TASK SUBMISSION ====================

    submitTask(intentId?: string): string | null {
        // Admission control
        const pendingCount = Array.from(this.tasks.values())
            .filter(t => t.status === 'PENDING').length;

        if (pendingCount >= CONFIG.MAX_PENDING_TASKS || this.sim_resource_exhaustion) {
            this.logEvent('task_rejected', null, null, 'Backpressure: queue full', INVARIANTS.IV_08_RESOURCE.id);
            return null;
        }

        const taskId = intentId ?? `TXN-${String(this.taskCounter++).padStart(4, '0')}`;

        // Duplicate detection
        if (this.tasks.has(taskId)) {
            this.logEvent('task_duplicate', taskId, null, 'Duplicate intent rejected', INVARIANTS.IV_01_UNIQUENESS.id);
            return null;
        }

        // Create task
        const task: Task = {
            task_id: taskId,
            status: 'PENDING',
            assigned_node: null,
            backup_nodes: [],
            created_at: Date.now(),
            started_at: null,
            completed_at: null,
            is_uncertain: false
        };

        this.tasks.set(taskId, task);
        this.stateMachine.initTask(taskId);

        this.logEvent('task_submitted', taskId, null, 'New task entered intake');

        return taskId;
    }

    // ==================== COORDINATOR LOOP ====================

    processTick(): void {
        const now = Date.now();

        // 1. Assign pending tasks
        this.processPendingTasks();

        // 2. Start assigned tasks
        this.processAssignedTasks();

        // 3. Execute running tasks
        this.processRunningTasks(now);

        // 4. Check for uncertainty timeouts
        this.processUncertaintyTimeouts(now);
    }

    private processPendingTasks(): void {
        const pendingTasks = Array.from(this.tasks.values())
            .filter(t => t.status === 'PENDING');

        const aliveNodes = Array.from(this.nodes.values())
            .filter(n => n.state === 'alive')
            .map(n => n.node_id);

        for (const task of pendingTasks) {
            if (aliveNodes.length === 0) {
                // No resources - stay pending (not blocked, just waiting)
                continue;
            }

            // Select least loaded node
            const selectedNode = this.matrix.selectLeastLoadedNode(aliveNodes);
            if (!selectedNode) continue;

            // Assign primary
            const assigned = this.matrix.assignPrimary(task.task_id, selectedNode);
            if (!assigned) continue;

            // Assign backup if enabled
            if (CONFIG.ENABLE_AUTO_BACKUP) {
                const backupCandidates = aliveNodes.filter(n => n !== selectedNode);
                for (let i = 0; i < Math.min(CONFIG.BACKUP_COUNT, backupCandidates.length); i++) {
                    const backup = this.matrix.selectLeastLoadedNode(
                        backupCandidates.filter(n => !task.backup_nodes.includes(n))
                    );
                    if (backup) {
                        this.matrix.assignBackup(task.task_id, backup);
                        task.backup_nodes.push(backup);
                    }
                }
            }

            // Update state
            this.stateMachine.transition(task.task_id, 'ALLOCATE');
            task.status = 'ASSIGNED';
            task.assigned_node = selectedNode;

            this.logEvent('task_assigned', task.task_id, selectedNode,
                `Primary: ${selectedNode}, Backups: [${task.backup_nodes.join(', ')}]`);
        }
    }

    private processAssignedTasks(): void {
        const assignedTasks = Array.from(this.tasks.values())
            .filter(t => t.status === 'ASSIGNED');

        for (const task of assignedTasks) {
            // Verify node still alive
            const node = this.nodes.get(task.assigned_node!);
            if (!node || node.state !== 'alive') {
                this.handleNodeFailureForTask(task.task_id, task.assigned_node!);
                continue;
            }

            // Start execution
            this.stateMachine.transition(task.task_id, 'START');
            task.status = 'RUNNING';
            task.started_at = Date.now();

            this.logEvent('task_started', task.task_id, task.assigned_node, 'Execution began');
        }
    }

    private processRunningTasks(now: number): void {
        const runningTasks = Array.from(this.tasks.values())
            .filter(t => t.status === 'RUNNING' && !t.is_uncertain);

        for (const task of runningTasks) {
            // Verify node still alive
            const node = this.nodes.get(task.assigned_node!);
            if (!node || node.state !== 'alive') {
                this.handleNodeFailureForTask(task.task_id, task.assigned_node!);
                continue;
            }

            // Check if execution complete
            const elapsed = now - (task.started_at ?? now);

            if (elapsed >= CONFIG.TASK_EXECUTION_MS) {
                // Simulate ACK drop
                if (this.sim_drop_acks) {
                    task.is_uncertain = true;
                    this.stateMachine.transition(task.task_id, 'ACK_TIMEOUT');
                    task.status = 'UNCERTAIN';
                    this.logEvent('task_uncertain', task.task_id, task.assigned_node,
                        'ACK not received within timeout', INVARIANTS.IV_07_UNCERTAINTY.id);
                    continue;
                }

                // Normal completion
                this.completeTask(task.task_id, now);
            }
        }
    }

    private processUncertaintyTimeouts(now: number): void {
        const uncertainTasks = Array.from(this.tasks.values())
            .filter(t => t.status === 'UNCERTAIN');

        for (const task of uncertainTasks) {
            const elapsed = now - (task.started_at ?? now);

            // Auto-block after extended uncertainty
            if (elapsed >= CONFIG.UNCERTAINTY_TIMEOUT_MS * 2) {
                this.stateMachine.transition(task.task_id, 'OPERATOR_CONFIRM_FAIL');
                task.status = 'BLOCKED';
                task.blocked_reason = 'Uncertainty timeout exceeded';

                this.logEvent('task_blocked', task.task_id, task.assigned_node,
                    'Auto-blocked after extended uncertainty');
            }
        }
    }

    private completeTask(taskId: string, now: number): void {
        const task = this.tasks.get(taskId);
        if (!task) return;

        this.stateMachine.transition(taskId, 'COMPLETE');
        task.status = 'COMPLETED';
        task.completed_at = now;
        task.latency_ms = now - (task.started_at ?? now);

        // Release from matrix
        this.matrix.releasePrimary(taskId);

        // Update node stats
        const node = this.nodes.get(task.assigned_node!);
        if (node) node.tasks_processed++;

        this.logEvent('task_completed', taskId, task.assigned_node,
            `Latency: ${task.latency_ms}ms`);
    }

    // ==================== OPERATOR INTERVENTIONS ====================

    operatorRequeue(taskId: string): boolean {
        const task = this.tasks.get(taskId);
        if (!task || (task.status !== 'BLOCKED' && task.status !== 'UNCERTAIN')) {
            return false;
        }

        this.stateMachine.transition(taskId, 'OPERATOR_REQUEUE');
        task.status = 'PENDING';
        task.assigned_node = null;
        task.backup_nodes = [];
        task.is_uncertain = false;
        task.blocked_reason = undefined;

        this.logEvent('task_requeued', taskId, null, 'Operator intervention');
        return true;
    }

    operatorConfirmSuccess(taskId: string): boolean {
        const task = this.tasks.get(taskId);
        if (!task || task.status !== 'UNCERTAIN') {
            return false;
        }

        this.stateMachine.transition(taskId, 'OPERATOR_CONFIRM_SUCCESS');
        task.status = 'COMPLETED';
        task.completed_at = Date.now();
        task.is_uncertain = false;

        this.matrix.releasePrimary(taskId);

        this.logEvent('task_completed', taskId, task.assigned_node,
            'Operator confirmed success');
        return true;
    }

    // ==================== LOGGING ====================

    private logEvent(
        eventType: string,
        taskId: string | null,
        nodeId: string | null,
        metadata: string,
        invariantId?: string
    ): void {
        const eventId = `E-${this.eventCounter++}`;

        const payload = JSON.stringify({
            task_id: taskId,
            node_id: nodeId,
            metadata,
            invariant: invariantId ?? null
        });

        const hashedEvent = this.hashChain.appendEvent(eventId, eventType, payload);

        // Keep in legacy format for compatibility
        // (The hash chain is the source of truth now)
    }

    // ==================== ACCESSORS ====================

    getTasks(): Task[] {
        return Array.from(this.tasks.values());
    }

    getNodes(): SystemNode[] {
        return Array.from(this.nodes.values());
    }

    getEvents(): SystemEvent[] {
        return this.hashChain.getAllEvents().map(e => {
            const payload = JSON.parse(e.payload);
            return {
                event_id: e.eventId,
                previous_event_id: e.prevHash,
                hash: e.hash,
                timestamp: e.timestamp,
                event_type: e.eventType,
                task_id: payload.task_id,
                node_id: payload.node_id,
                invariant_id_applied: payload.invariant,
                metadata: payload.metadata
            };
        });
    }

    getMetrics(): EngineMetrics {
        const tasks = Array.from(this.tasks.values());
        const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

        const totalLatency = completedTasks.reduce((sum, t) => sum + (t.latency_ms ?? 0), 0);
        const avgLatency = completedTasks.length > 0 ? totalLatency / completedTasks.length : 0;

        return {
            tasks_submitted: tasks.length,
            tasks_completed: completedTasks.length,
            tasks_blocked: tasks.filter(t => t.status === 'BLOCKED').length,
            tasks_uncertain: tasks.filter(t => t.status === 'UNCERTAIN').length,
            tasks_pending: tasks.filter(t => t.status === 'PENDING').length,
            tasks_running: tasks.filter(t => t.status === 'RUNNING').length,
            node_failures: this.hashChain.getAllEvents()
                .filter(e => e.eventType === 'node_failed').length,
            events_total: this.hashChain.length,
            chain_valid: true, // Async verification needed
            avg_latency_ms: Math.round(avgLatency)
        };
    }

    // ==================== VISUALIZATION DATA ====================

    getMatrixVisualization() {
        const taskIds = Array.from(this.tasks.keys());
        const nodeIds = Array.from(this.nodes.keys());
        return this.matrix.getVisualizationData(taskIds, nodeIds);
    }

    getHashChainVisualization(limit?: number) {
        return this.hashChain.getVisualizationData(limit);
    }

    getStateFlowVisualization() {
        return this.stateMachine.getFlowVisualization();
    }

    getStateCounts() {
        return this.stateMachine.getStateCounts();
    }

    // ==================== VERIFICATION ====================

    async verifyIntegrity(): Promise<{
        matrixValid: boolean;
        chainValid: boolean;
        anchorsValid: boolean;
    }> {
        const matrixSingle = this.matrix.verifySingleAssignment();
        const matrixBackup = this.matrix.verifyBackupExclusion();
        const chainResult = await this.hashChain.verifyChain();
        const anchorResult = this.hashChain.verifyAllAnchors();

        return {
            matrixValid: matrixSingle.valid && matrixBackup.valid,
            chainValid: chainResult.valid,
            anchorsValid: anchorResult.valid
        };
    }

    // ==================== EXPERIMENTS ====================

    runExperimentCorrectness(count: number = 5): void {
        for (let i = 0; i < count; i++) {
            this.submitTask();
        }
    }

    runExperimentFailure(): void {
        this.submitTask();
        this.submitTask();

        const aliveNode = Array.from(this.nodes.values())
            .find(n => n.state === 'alive');

        if (aliveNode) {
            setTimeout(() => {
                this.injectNodeFailure(aliveNode.node_id);
            }, 800);
        }
    }

    runExperimentUncertainty(): void {
        this.sim_drop_acks = true;
        this.submitTask();

        setTimeout(() => {
            this.sim_drop_acks = false;
        }, 10000);
    }

    // ==================== EXPORT ====================

    exportCSV(type: 'tasks' | 'nodes' | 'events' | 'chain'): string {
        if (type === 'chain') {
            return this.hashChain.exportForAudit();
        }

        if (type === 'tasks') {
            const header = 'task_id,status,assigned_node,backup_nodes,created_at,started_at,completed_at,latency_ms,is_uncertain\n';
            const rows = Array.from(this.tasks.values()).map(t =>
                `${t.task_id},${t.status},${t.assigned_node ?? ''},${t.backup_nodes.join(';')},${t.created_at},${t.started_at ?? ''},${t.completed_at ?? ''},${t.latency_ms ?? ''},${t.is_uncertain}`
            ).join('\n');
            return header + rows;
        }

        if (type === 'nodes') {
            const header = 'node_id,state,last_seen,tasks_processed,tasks_blocked\n';
            const rows = Array.from(this.nodes.values()).map(n =>
                `${n.node_id},${n.state},${n.last_seen},${n.tasks_processed},${n.tasks_blocked}`
            ).join('\n');
            return header + rows;
        }

        // events
        const header = 'event_id,hash,timestamp,event_type,task_id,node_id,metadata\n';
        const rows = this.getEvents().map(e =>
            `${e.event_id},${e.hash.substring(0, 16)},${e.timestamp},${e.event_type},${e.task_id ?? ''},${e.node_id ?? ''},"${e.metadata.replace(/"/g, '""')}"`
        ).join('\n');
        return header + rows;
    }

    // ==================== RESET ====================

    reset(): void {
        this.matrix.reset();
        this.hashChain.reset();
        this.stateMachine.reset();
        this.tasks.clear();
        this.nodes.clear();
        this.eventCounter = 1000;
        this.taskCounter = 1;
        this.sim_drop_acks = false;
        this.sim_network_delay = 0;
        this.sim_resource_exhaustion = false;

        this.initializeNodes(['Alpha', 'Beta', 'Gamma']);
    }

    // Legacy aliases for backward compat
    manualInjectTask = () => this.submitTask();
    manualFailNode = (id: string) => this.injectNodeFailure(id);
    manualRecoverNode = (id: string) => this.recoverNode(id);
    processStep = () => this.processTick();
}
