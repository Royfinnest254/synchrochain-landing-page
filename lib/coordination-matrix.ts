/**
 * Coordination Matrix Implementation
 * 
 * Formal model for task-to-node assignment following the paper's specification.
 * Binary Matrix M ∈ {0,1}^(T×N) ensures at-most-once execution.
 * Redundancy Matrix R tracks backup assignments with exclusion invariant.
 */

export type TaskId = string;
export type NodeId = string;

export interface MatrixCell {
  taskId: TaskId;
  nodeId: NodeId;
  assignedAt: number;
  isPrimary: boolean;
}

export interface MatrixSnapshot {
  binary: Map<TaskId, NodeId>;
  redundancy: Map<TaskId, Set<NodeId>>;
  timestamp: number;
}

export class CoordinationMatrix {
  // Binary Matrix: task -> primary node (sparse representation)
  private binaryMatrix: Map<TaskId, NodeId> = new Map();
  
  // Redundancy Matrix: task -> set of backup nodes
  private redundancyMatrix: Map<TaskId, Set<NodeId>> = new Map();
  
  // Assignment history for visualization
  private assignmentLog: MatrixCell[] = [];
  
  // Track node load for distribution
  private nodeTaskCount: Map<NodeId, number> = new Map();

  /**
   * Assign a task to a primary node.
   * Enforces IV_09: Σ_n BinaryMatrix[t,n] ≤ 1
   * 
   * @returns true if assignment succeeded, false if task already assigned
   */
  assignPrimary(taskId: TaskId, nodeId: NodeId): boolean {
    // Check single-assignment invariant
    if (this.binaryMatrix.has(taskId)) {
      return false; // Already assigned - violation would occur
    }

    // Check backup exclusion: can't be primary if already backup
    const backups = this.redundancyMatrix.get(taskId);
    if (backups?.has(nodeId)) {
      // Remove from backup first (promotion)
      backups.delete(nodeId);
    }

    this.binaryMatrix.set(taskId, nodeId);
    this.incrementNodeLoad(nodeId);
    
    this.assignmentLog.push({
      taskId,
      nodeId,
      assignedAt: Date.now(),
      isPrimary: true
    });

    return true;
  }

  /**
   * Add a backup node for a task.
   * Enforces IV_10: R[t,n]=1 → M[t,n]=0
   */
  assignBackup(taskId: TaskId, nodeId: NodeId): boolean {
    // Backup exclusion invariant: can't be backup if primary
    const primary = this.binaryMatrix.get(taskId);
    if (primary === nodeId) {
      return false;
    }

    let backups = this.redundancyMatrix.get(taskId);
    if (!backups) {
      backups = new Set();
      this.redundancyMatrix.set(taskId, backups);
    }
    
    backups.add(nodeId);
    
    this.assignmentLog.push({
      taskId,
      nodeId,
      assignedAt: Date.now(),
      isPrimary: false
    });

    return true;
  }

  /**
   * Remove primary assignment (on completion or failure).
   */
  releasePrimary(taskId: TaskId): NodeId | null {
    const nodeId = this.binaryMatrix.get(taskId);
    if (nodeId) {
      this.binaryMatrix.delete(taskId);
      this.decrementNodeLoad(nodeId);
      return nodeId;
    }
    return null;
  }

  /**
   * Promote backup to primary (for recovery scenarios).
   */
  promoteBackup(taskId: TaskId): NodeId | null {
    const backups = this.redundancyMatrix.get(taskId);
    if (!backups || backups.size === 0) {
      return null;
    }

    // Take first backup (could be smarter with load balancing)
    const backupNode = backups.values().next().value;
    backups.delete(backupNode);
    
    // Clear any existing primary first
    this.releasePrimary(taskId);
    
    // Assign as new primary
    this.binaryMatrix.set(taskId, backupNode);
    this.incrementNodeLoad(backupNode);
    
    return backupNode;
  }

  /**
   * Get the primary node for a task.
   */
  getPrimary(taskId: TaskId): NodeId | null {
    return this.binaryMatrix.get(taskId) ?? null;
  }

  /**
   * Get all backup nodes for a task.
   */
  getBackups(taskId: TaskId): NodeId[] {
    const backups = this.redundancyMatrix.get(taskId);
    return backups ? Array.from(backups) : [];
  }

  /**
   * Find all tasks assigned to a specific node (primary).
   */
  getTasksForNode(nodeId: NodeId): TaskId[] {
    const tasks: TaskId[] = [];
    this.binaryMatrix.forEach((node, task) => {
      if (node === nodeId) tasks.push(task);
    });
    return tasks;
  }

  /**
   * Select best node for assignment based on load.
   */
  selectLeastLoadedNode(availableNodes: NodeId[]): NodeId | null {
    if (availableNodes.length === 0) return null;
    
    let minLoad = Infinity;
    let selected: NodeId | null = null;
    
    for (const nodeId of availableNodes) {
      const load = this.nodeTaskCount.get(nodeId) ?? 0;
      if (load < minLoad) {
        minLoad = load;
        selected = nodeId;
      }
    }
    
    return selected;
  }

  /**
   * Verify the single-assignment invariant holds.
   */
  verifySingleAssignment(): { valid: boolean; violations: TaskId[] } {
    // With our Map implementation, this is guaranteed by structure
    // But we verify anyway for auditability
    const violations: TaskId[] = [];
    const seen = new Set<TaskId>();
    
    this.binaryMatrix.forEach((_, taskId) => {
      if (seen.has(taskId)) {
        violations.push(taskId);
      }
      seen.add(taskId);
    });
    
    return { valid: violations.length === 0, violations };
  }

  /**
   * Verify backup exclusion invariant.
   */
  verifyBackupExclusion(): { valid: boolean; violations: Array<{ taskId: TaskId; nodeId: NodeId }> } {
    const violations: Array<{ taskId: TaskId; nodeId: NodeId }> = [];
    
    this.redundancyMatrix.forEach((backups, taskId) => {
      const primary = this.binaryMatrix.get(taskId);
      if (primary && backups.has(primary)) {
        violations.push({ taskId, nodeId: primary });
      }
    });
    
    return { valid: violations.length === 0, violations };
  }

  /**
   * Export matrix state for visualization.
   */
  getVisualizationData(allTasks: TaskId[], allNodes: NodeId[]): {
    cells: Array<{ row: number; col: number; value: 'primary' | 'backup' | 'empty' }>;
    taskLabels: TaskId[];
    nodeLabels: NodeId[];
  } {
    const cells: Array<{ row: number; col: number; value: 'primary' | 'backup' | 'empty' }> = [];
    
    allTasks.forEach((taskId, row) => {
      allNodes.forEach((nodeId, col) => {
        let value: 'primary' | 'backup' | 'empty' = 'empty';
        
        if (this.binaryMatrix.get(taskId) === nodeId) {
          value = 'primary';
        } else if (this.redundancyMatrix.get(taskId)?.has(nodeId)) {
          value = 'backup';
        }
        
        cells.push({ row, col, value });
      });
    });
    
    return {
      cells,
      taskLabels: allTasks,
      nodeLabels: allNodes
    };
  }

  /**
   * Create snapshot for event logging.
   */
  snapshot(): MatrixSnapshot {
    return {
      binary: new Map(this.binaryMatrix),
      redundancy: new Map(
        Array.from(this.redundancyMatrix.entries()).map(([k, v]) => [k, new Set(v)])
      ),
      timestamp: Date.now()
    };
  }

  /**
   * Get recent assignment activity for visualization.
   */
  getRecentAssignments(limit: number = 20): MatrixCell[] {
    return this.assignmentLog.slice(-limit);
  }

  private incrementNodeLoad(nodeId: NodeId): void {
    const current = this.nodeTaskCount.get(nodeId) ?? 0;
    this.nodeTaskCount.set(nodeId, current + 1);
  }

  private decrementNodeLoad(nodeId: NodeId): void {
    const current = this.nodeTaskCount.get(nodeId) ?? 0;
    this.nodeTaskCount.set(nodeId, Math.max(0, current - 1));
  }

  /**
   * Reset for fresh experiment.
   */
  reset(): void {
    this.binaryMatrix.clear();
    this.redundancyMatrix.clear();
    this.assignmentLog = [];
    this.nodeTaskCount.clear();
  }
}
