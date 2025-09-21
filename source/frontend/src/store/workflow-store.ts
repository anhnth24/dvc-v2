import { create } from 'zustand';

export interface WorkflowState {
  nodes: { id: string; type: string }[];
  setNodes(nodes: WorkflowState['nodes']): void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  nodes: [],
  setNodes: (nodes) => set({ nodes }),
}));
