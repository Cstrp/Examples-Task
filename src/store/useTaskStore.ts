import { create } from "zustand";

import { buildTaskFromDraft, createHistoryEntry, deleteTask, getStoredTasks, saveTasks, upsertTask, updateTaskStatus } from "../services/storage";
import { applyLastWriteWins } from "../services/syncService";
import type { AttachmentMetadata, SyncStatus, TaskDraft, TaskRecord, TaskStatus } from "../types";

export type SortMode = "createdAt" | "dueDate" | "status";

type TaskStore = {
  tasks: TaskRecord[];
  sortMode: SortMode;
  syncStatus: SyncStatus;
  isHydrated: boolean;
  loadTasks: () => Promise<void>;
  saveTask: (draft: TaskDraft, existingId?: string, attachments?: AttachmentMetadata[]) => Promise<TaskRecord>;
  updateStatus: (taskId: string, nextStatus: TaskStatus) => Promise<void>;
  deleteTaskById: (taskId: string) => Promise<void>;
  syncNow: () => Promise<void>;
  setSortMode: (sortMode: SortMode) => void;
  setSyncStatus: (status: SyncStatus) => void;
};

function sortTasks(tasks: TaskRecord[], sortMode: SortMode): TaskRecord[] {
  const ordered = [...tasks];

  if (sortMode === "dueDate") {
    return ordered.sort((left, right) => new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime());
  }

  if (sortMode === "status") {
    const statusOrder: Record<TaskStatus, number> = {
      New: 0,
      "In Progress": 1,
      Completed: 2,
      Cancelled: 3,
    };

    return ordered.sort(
      (left, right) => statusOrder[left.status] - statusOrder[right.status] || new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime(),
    );
  }

  return ordered.sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  sortMode: "dueDate",
  syncStatus: "Synced",
  isHydrated: false,
  loadTasks: async () => {
    const tasks = await getStoredTasks();
    set({ tasks: sortTasks(tasks, get().sortMode), isHydrated: true, syncStatus: tasks.some((task) => task.syncStatus === "Pending Sync") ? "Pending Sync" : "Synced" });
  },
  saveTask: async (draft, existingId, attachments = []) => {
    const tasks = await getStoredTasks();
    const existing = existingId ? tasks.find((task) => task.id === existingId) : undefined;
    const nextTask = buildTaskFromDraft(draft, existing, attachments.length > 0 ? attachments : existing?.attachments ?? []);

    if (existing) {
      nextTask.history = [
        ...existing.history,
        createHistoryEntry("Task edited", `Updated details for ${nextTask.title}.`),
      ];
    } else {
      nextTask.history = [
        createHistoryEntry("Task created", `Created task ${nextTask.title}.`),
      ];
    }

    nextTask.syncStatus = "Pending Sync";
    const updated = await upsertTask(nextTask);
    set({ tasks: sortTasks(updated, get().sortMode), syncStatus: "Pending Sync" });
    return nextTask;
  },
  updateStatus: async (taskId, nextStatus) => {
    const updated = await updateTaskStatus(taskId, nextStatus);
    set({ tasks: sortTasks(updated, get().sortMode), syncStatus: "Pending Sync" });
  },
  deleteTaskById: async (taskId) => {
    const updated = await deleteTask(taskId);
    set({ tasks: sortTasks(updated, get().sortMode), syncStatus: "Pending Sync" });
  },
  syncNow: async () => {
    const tasks = get().tasks;
    const result = await applyLastWriteWins(tasks);
    await saveTasks(result.mergedTasks);
    set({ tasks: sortTasks(result.mergedTasks, get().sortMode), syncStatus: result.status });
  },
  setSortMode: (sortMode) => {
    set((state) => ({ sortMode, tasks: sortTasks(state.tasks, sortMode) }));
  },
  setSyncStatus: (syncStatus) => set({ syncStatus }),
}));
