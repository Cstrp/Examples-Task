export type TaskStatus = "New" | "In Progress" | "Completed" | "Cancelled";
export type SyncStatus = "Synced" | "Pending Sync" | "Sync Failed";

export type AttachmentMetadata = {
  id: string;
  name: string;
  uri: string;
  mimeType: string;
  size?: number;
  createdAt: string;
};

export type HistoryEntry = {
  id: string;
  timestamp: string;
  actionType: string;
  description: string;
};

export type TaskLocation = {
  address: string;
  latitude: number;
  longitude: number;
};

export type TaskRecord = {
  id: string;
  title: string;
  description: string;
  dueAt: string;
  status: TaskStatus;
  location: TaskLocation;
  attachments: AttachmentMetadata[];
  history: HistoryEntry[];
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
};

export type TaskDraft = {
  title: string;
  description: string;
  dueAt: string;
  status: TaskStatus;
  locationAddress: string;
  latitude: string;
  longitude: string;
};

export type ValidationErrors = Partial<
  Record<"title" | "description" | "dueAt" | "locationAddress" | "latitude" | "longitude", string>
>;
