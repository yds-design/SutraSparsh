export enum ImportStatus {
  Pending = "pending",
  Running = "running",
  Completed = "completed",
  Failed = "failed",
}

export interface ImportJob {
  id: string;
  source: string;
  startedAt: Date;
  completedAt?: Date;
  status: ImportStatus;
  totalItems: number;
  importedItems: number;
  failedItems: number;
}