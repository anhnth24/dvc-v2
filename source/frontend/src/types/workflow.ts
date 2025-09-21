// workflow types skeleton
export interface WorkflowNode {
  id: string;
  type: string;
}

export interface Connection {
  from: string;
  to: string;
}
