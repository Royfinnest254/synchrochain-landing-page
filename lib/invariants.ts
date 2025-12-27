
export type InvariantAction = 'block' | 'error';

export interface Invariant {
    id: string;
    name: string;
    description: string;
    action: InvariantAction;
}

export const INVARIANTS: Record<string, Invariant> = {
    IV_01_UNIQUENESS: {
        id: 'IV_01',
        name: 'Task Uniqueness',
        description: 'A task ID must never be processed more than once.',
        action: 'block'
    },
    IV_02_LIVENESS: {
        id: 'IV_02',
        name: 'Node Liveness',
        description: 'Tasks cannot be assigned to nodes that are not in the alive state.',
        action: 'block'
    },
    IV_03_ATOMICITY: {
        id: 'IV_03',
        name: 'Transition Atomicity',
        description: 'State transitions must be atomic and recorded in the event log before taking effect.',
        action: 'block'
    },
    IV_04_CAUSALITY: {
        id: 'IV_04',
        name: 'Causal Integrity',
        description: 'Every event must have a valid causal parent event ID, ensuring a traceable chain.',
        action: 'error' // System integrity violation
    },
    IV_05_DETERMINISM: {
        id: 'IV_05',
        name: 'Deterministic Outcome',
        description: 'Replaying events must strictly produce the same state, with no side effects.',
        action: 'error'
    },
    IV_06_IMMUTABILITY: {
        id: 'IV_06',
        name: 'Log Immutability',
        description: 'Event logs are append-only. No updates or deletions are permitted.',
        action: 'error'
    },
    IV_07_UNCERTAINTY: {
        id: 'IV_07',
        name: 'Uncertainty Block',
        description: 'If system state is ambiguous (e.g., lost ACK), the system must block rather than guess.',
        action: 'block'
    },
    IV_08_RESOURCE: {
        id: 'IV_08',
        name: 'Resource Safety',
        description: 'If resources are exhausted, the system must block safe.',
        action: 'block'
    }
};
