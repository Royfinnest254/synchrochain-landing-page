/**
 * Task State Machine
 * 
 * Formal definition of task lifecycle with deterministic transitions.
 * Includes UNCERTAIN state for handling acknowledgement failures.
 */

export type TaskState =
    | 'PENDING'
    | 'ASSIGNED'
    | 'RUNNING'
    | 'COMPLETED'
    | 'BLOCKED'
    | 'UNCERTAIN';

export type TransitionTrigger =
    | 'ALLOCATE'
    | 'START'
    | 'COMPLETE'
    | 'NODE_FAIL'
    | 'ACK_TIMEOUT'
    | 'OPERATOR_REQUEUE'
    | 'OPERATOR_CONFIRM_FAIL'
    | 'OPERATOR_CONFIRM_SUCCESS';

export interface Transition {
    from: TaskState;
    to: TaskState;
    trigger: TransitionTrigger;
    guard?: () => boolean;
}

export interface StateChangeEvent {
    taskId: string;
    fromState: TaskState;
    toState: TaskState;
    trigger: TransitionTrigger;
    timestamp: number;
    metadata?: Record<string, unknown>;
}

// State machine definition
const TRANSITIONS: Transition[] = [
    // Happy path
    { from: 'PENDING', to: 'ASSIGNED', trigger: 'ALLOCATE' },
    { from: 'ASSIGNED', to: 'RUNNING', trigger: 'START' },
    { from: 'RUNNING', to: 'COMPLETED', trigger: 'COMPLETE' },

    // Failure paths
    { from: 'ASSIGNED', to: 'BLOCKED', trigger: 'NODE_FAIL' },
    { from: 'RUNNING', to: 'BLOCKED', trigger: 'NODE_FAIL' },
    { from: 'RUNNING', to: 'UNCERTAIN', trigger: 'ACK_TIMEOUT' },

    // Recovery paths
    { from: 'BLOCKED', to: 'PENDING', trigger: 'OPERATOR_REQUEUE' },
    { from: 'UNCERTAIN', to: 'BLOCKED', trigger: 'OPERATOR_CONFIRM_FAIL' },
    { from: 'UNCERTAIN', to: 'COMPLETED', trigger: 'OPERATOR_CONFIRM_SUCCESS' },
];

export class TaskStateMachine {
    private states: Map<string, TaskState> = new Map();
    private history: StateChangeEvent[] = [];
    private listeners: Array<(event: StateChangeEvent) => void> = [];

    /**
     * Initialize a new task in PENDING state.
     */
    initTask(taskId: string): void {
        if (this.states.has(taskId)) {
            throw new Error(`Task ${taskId} already exists`);
        }
        this.states.set(taskId, 'PENDING');
        this.recordChange(taskId, 'PENDING', 'PENDING', 'ALLOCATE'); // Genesis
    }

    /**
     * Attempt a state transition.
     * Returns true if transition was valid and executed.
     */
    transition(taskId: string, trigger: TransitionTrigger, metadata?: Record<string, unknown>): boolean {
        const currentState = this.states.get(taskId);
        if (!currentState) {
            return false;
        }

        // Find valid transition
        const validTransition = TRANSITIONS.find(
            t => t.from === currentState && t.trigger === trigger
        );

        if (!validTransition) {
            // Invalid transition - could log this as an invariant violation
            return false;
        }

        // Check guard if present
        if (validTransition.guard && !validTransition.guard()) {
            return false;
        }

        // Execute transition
        this.states.set(taskId, validTransition.to);
        this.recordChange(taskId, currentState, validTransition.to, trigger, metadata);

        return true;
    }

    /**
     * Get current state of a task.
     */
    getState(taskId: string): TaskState | null {
        return this.states.get(taskId) ?? null;
    }

    /**
     * Check if a transition is valid without executing it.
     */
    canTransition(taskId: string, trigger: TransitionTrigger): boolean {
        const currentState = this.states.get(taskId);
        if (!currentState) return false;

        return TRANSITIONS.some(
            t => t.from === currentState && t.trigger === trigger
        );
    }

    /**
     * Get all possible transitions from current state.
     */
    getAvailableTransitions(taskId: string): TransitionTrigger[] {
        const currentState = this.states.get(taskId);
        if (!currentState) return [];

        return TRANSITIONS
            .filter(t => t.from === currentState)
            .map(t => t.trigger);
    }

    /**
     * Get counts by state for dashboard.
     */
    getStateCounts(): Record<TaskState, number> {
        const counts: Record<TaskState, number> = {
            PENDING: 0,
            ASSIGNED: 0,
            RUNNING: 0,
            COMPLETED: 0,
            BLOCKED: 0,
            UNCERTAIN: 0
        };

        this.states.forEach(state => {
            counts[state]++;
        });

        return counts;
    }

    /**
     * Get all tasks in a specific state.
     */
    getTasksInState(state: TaskState): string[] {
        const tasks: string[] = [];
        this.states.forEach((s, taskId) => {
            if (s === state) tasks.push(taskId);
        });
        return tasks;
    }

    /**
     * Get state transition history for a specific task.
     */
    getTaskHistory(taskId: string): StateChangeEvent[] {
        return this.history.filter(e => e.taskId === taskId);
    }

    /**
     * Get recent state changes across all tasks.
     */
    getRecentChanges(limit: number = 20): StateChangeEvent[] {
        return this.history.slice(-limit);
    }

    /**
     * Subscribe to state changes.
     */
    onStateChange(listener: (event: StateChangeEvent) => void): () => void {
        this.listeners.push(listener);
        return () => {
            const idx = this.listeners.indexOf(listener);
            if (idx >= 0) this.listeners.splice(idx, 1);
        };
    }

    /**
     * Get visualization data for state flow diagram.
     */
    getFlowVisualization(): {
        states: Array<{ name: TaskState; count: number; active: boolean }>;
        transitions: Array<{ from: TaskState; to: TaskState; count: number }>;
    } {
        const counts = this.getStateCounts();

        // Count transition frequency
        const transitionCounts = new Map<string, number>();
        for (let i = 1; i < this.history.length; i++) {
            const current = this.history[i];
            if (current.fromState !== current.toState) {
                const key = `${current.fromState}->${current.toState}`;
                transitionCounts.set(key, (transitionCounts.get(key) ?? 0) + 1);
            }
        }

        const allStates: TaskState[] = ['PENDING', 'ASSIGNED', 'RUNNING', 'COMPLETED', 'BLOCKED', 'UNCERTAIN'];

        return {
            states: allStates.map(name => ({
                name,
                count: counts[name],
                active: counts[name] > 0
            })),
            transitions: TRANSITIONS.map(t => ({
                from: t.from,
                to: t.to,
                count: transitionCounts.get(`${t.from}->${t.to}`) ?? 0
            }))
        };
    }

    private recordChange(
        taskId: string,
        from: TaskState,
        to: TaskState,
        trigger: TransitionTrigger,
        metadata?: Record<string, unknown>
    ): void {
        const event: StateChangeEvent = {
            taskId,
            fromState: from,
            toState: to,
            trigger,
            timestamp: Date.now(),
            metadata
        };

        this.history.push(event);

        // Notify listeners
        for (const listener of this.listeners) {
            try {
                listener(event);
            } catch (e) {
                // Don't let listener errors break the state machine
                console.warn('State change listener error:', e);
            }
        }
    }

    /**
     * Remove a task (cleanup after archival).
     */
    removeTask(taskId: string): boolean {
        return this.states.delete(taskId);
    }

    /**
     * Reset all state.
     */
    reset(): void {
        this.states.clear();
        this.history = [];
    }
}
