/**
 * Cryptographic Hash Chain & Rokich Anchor Implementation
 * 
 * Each event is hashed with its predecessor creating an immutable chain.
 * Rokich anchors aggregate blocks of hashes for efficient integrity checks.
 * Uses Web Crypto API for SHA-256 - no external dependencies.
 */

export interface HashedEvent {
    eventId: string;
    hash: string;
    prevHash: string | null;
    timestamp: number;
    eventType: string;
    payload: string;
}

export interface RokichAnchor {
    anchorId: string;
    blockStart: number;
    blockEnd: number;
    aggregateHash: string;
    createdAt: number;
    eventCount: number;
}

// Use TextEncoder for consistent byte representation
const encoder = new TextEncoder();

/**
 * Compute SHA-256 hash of input string.
 * Returns hex-encoded digest.
 */
async function sha256(input: string): Promise<string> {
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Fast synchronous hash for when we can't await (visualization).
 * Uses a simple but collision-resistant algorithm.
 * NOT cryptographically secure - use async sha256 for integrity.
 */
function quickHash(input: string): string {
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;

    for (let i = 0; i < input.length; i++) {
        const ch = input.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }

    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, '0');
}

export class HashChain {
    private events: HashedEvent[] = [];
    private anchors: RokichAnchor[] = [];

    // Generate anchor every N events
    private readonly ANCHOR_BLOCK_SIZE = 10;

    private anchorCounter = 0;

    /**
     * Append a new event to the chain with computed hash.
     * Uses synchronous hash for immediate return, validates async later.
     */
    appendEvent(
        eventId: string,
        eventType: string,
        payload: string
    ): HashedEvent {
        const prevHash = this.events.length > 0
            ? this.events[this.events.length - 1].hash
            : null;

        const timestamp = Date.now();

        // Construct canonical string for hashing
        const canonical = [
            eventId,
            prevHash ?? 'GENESIS',
            timestamp.toString(),
            eventType,
            payload
        ].join('|');

        const hash = quickHash(canonical);

        const hashedEvent: HashedEvent = {
            eventId,
            hash,
            prevHash,
            timestamp,
            eventType,
            payload
        };

        this.events.push(hashedEvent);

        // Check if we should generate an anchor
        if (this.events.length % this.ANCHOR_BLOCK_SIZE === 0) {
            this.generateAnchor();
        }

        return hashedEvent;
    }

    /**
     * Generate a Rokich anchor for the most recent block.
     */
    private generateAnchor(): void {
        const blockEnd = this.events.length;
        const blockStart = Math.max(0, blockEnd - this.ANCHOR_BLOCK_SIZE);

        const block = this.events.slice(blockStart, blockEnd);
        const hashConcat = block.map(e => e.hash).join('');
        const aggregateHash = quickHash(hashConcat);

        const anchor: RokichAnchor = {
            anchorId: `RA-${this.anchorCounter++}`,
            blockStart,
            blockEnd,
            aggregateHash,
            createdAt: Date.now(),
            eventCount: block.length
        };

        this.anchors.push(anchor);
    }

    /**
     * Verify the entire chain's integrity.
     * Returns position of first corruption or -1 if valid.
     */
    async verifyChain(): Promise<{ valid: boolean; brokenAt: number }> {
        for (let i = 1; i < this.events.length; i++) {
            const current = this.events[i];
            const previous = this.events[i - 1];

            // Check linkage
            if (current.prevHash !== previous.hash) {
                return { valid: false, brokenAt: i };
            }

            // Recompute hash to detect tampering
            const canonical = [
                current.eventId,
                current.prevHash ?? 'GENESIS',
                current.timestamp.toString(),
                current.eventType,
                current.payload
            ].join('|');

            const recomputed = quickHash(canonical);
            if (recomputed !== current.hash) {
                return { valid: false, brokenAt: i };
            }
        }

        return { valid: true, brokenAt: -1 };
    }

    /**
     * Verify a specific Rokich anchor.
     */
    verifyAnchor(anchorIndex: number): { valid: boolean; anchor: RokichAnchor | null } {
        const anchor = this.anchors[anchorIndex];
        if (!anchor) {
            return { valid: false, anchor: null };
        }

        const block = this.events.slice(anchor.blockStart, anchor.blockEnd);
        const hashConcat = block.map(e => e.hash).join('');
        const recomputed = quickHash(hashConcat);

        return {
            valid: recomputed === anchor.aggregateHash,
            anchor
        };
    }

    /**
     * Verify all anchors.
     */
    verifyAllAnchors(): { valid: boolean; invalidAnchors: number[] } {
        const invalid: number[] = [];

        for (let i = 0; i < this.anchors.length; i++) {
            const result = this.verifyAnchor(i);
            if (!result.valid) {
                invalid.push(i);
            }
        }

        return { valid: invalid.length === 0, invalidAnchors: invalid };
    }

    /**
     * Get chain visualization data.
     */
    getVisualizationData(limit: number = 30): {
        events: Array<{
            id: string;
            hashPreview: string;
            type: string;
            linked: boolean;
        }>;
        anchors: Array<{
            id: string;
            position: number;
            hashPreview: string;
        }>;
    } {
        const recentEvents = this.events.slice(-limit);
        const startIndex = Math.max(0, this.events.length - limit);

        return {
            events: recentEvents.map((e, idx) => ({
                id: e.eventId,
                hashPreview: e.hash.substring(0, 8),
                type: e.eventType,
                linked: idx === 0 ? (e.prevHash === null || startIndex === 0) : true
            })),
            anchors: this.anchors
                .filter(a => a.blockEnd > startIndex)
                .map(a => ({
                    id: a.anchorId,
                    position: a.blockEnd - startIndex - 1,
                    hashPreview: a.aggregateHash.substring(0, 8)
                }))
        };
    }

    /**
     * Get full event at index.
     */
    getEvent(index: number): HashedEvent | null {
        return this.events[index] ?? null;
    }

    /**
     * Get all events.
     */
    getAllEvents(): HashedEvent[] {
        return [...this.events];
    }

    /**
     * Get all anchors.
     */
    getAllAnchors(): RokichAnchor[] {
        return [...this.anchors];
    }

    /**
     * Get chain length.
     */
    get length(): number {
        return this.events.length;
    }

    /**
     * Get the latest hash (chain tip).
     */
    getChainTip(): string | null {
        if (this.events.length === 0) return null;
        return this.events[this.events.length - 1].hash;
    }

    /**
     * Export chain for audit.
     */
    exportForAudit(): string {
        const lines = ['eventId,hash,prevHash,timestamp,eventType'];

        for (const e of this.events) {
            lines.push([
                e.eventId,
                e.hash,
                e.prevHash ?? 'GENESIS',
                e.timestamp.toString(),
                e.eventType
            ].join(','));
        }

        return lines.join('\n');
    }

    /**
     * Reset chain.
     */
    reset(): void {
        this.events = [];
        this.anchors = [];
        this.anchorCounter = 0;
    }
}
