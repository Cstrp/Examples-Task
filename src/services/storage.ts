import AsyncStorage from "@react-native-async-storage/async-storage";

import type { HistoryEntry, TaskDraft, TaskRecord, TaskStatus } from "../types";

export const STORAGE_KEY = "field-task-entries-v1";

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createHistoryEntry(actionType: string, description: string): HistoryEntry {
  return {
    id: createId(),
    timestamp: new Date().toISOString(),
    actionType,
    description,
  };
}

export function buildTaskFromDraft(
  draft: TaskDraft,
  existing?: TaskRecord,
  attachments: TaskRecord["attachments"] = existing?.attachments ?? [],
): TaskRecord {
  const now = new Date().toISOString();
  const lat = Number(draft.latitude);
  const lon = Number(draft.longitude);

  const history = existing?.history ?? [
    createHistoryEntry("Task created", `Task created for ${draft.locationAddress}.`),
  ];

  return {
    id: existing?.id ?? createId(),
    title: draft.title.trim(),
    description: draft.description.trim(),
    dueAt: new Date(draft.dueAt).toISOString(),
    status: draft.status,
    location: {
      address: draft.locationAddress.trim(),
      latitude: Number.isFinite(lat) ? lat : 0,
      longitude: Number.isFinite(lon) ? lon : 0,
    },
    attachments,
    history,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    syncStatus: "Pending Sync",
  };
}

export async function getStoredTasks(): Promise<TaskRecord[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed: TaskRecord[] = [
      {
        id: createId(),
        title: "Inspect HVAC unit",
        description: "Check the rooftop ventilation system and confirm pressure readings.",
        dueAt: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
        status: "In Progress",
        location: {
          address: "23 North Street, Depot 7",
          latitude: -33.8688,
          longitude: 151.2093,
        },
        attachments: [],
        history: [createHistoryEntry("Task created", "Initial task created for site follow-up.")],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: "Synced",
      },
      {
        id: createId(),
        title: "Review meter installation",
        description: "Verify the digital meter is installed and calibrated before close-out.",
        dueAt: new Date(Date.now() + 1000 * 60 * 60 * 30).toISOString(),
        status: "New",
        location: {
          address: "7 Harbor Lane, Unit 2",
          latitude: -33.879,
          longitude: 151.214,
        },
        attachments: [],
        history: [createHistoryEntry("Task created", "Scheduled for customer inspection.")],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: "Synced",
      },
    ];

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    const parsed = JSON.parse(raw) as TaskRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveTasks(tasks: TaskRecord[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export async function upsertTask(task: TaskRecord): Promise<TaskRecord[]> {
  const current = await getStoredTasks();
  const next = current.some((item) => item.id === task.id)
    ? current.map((item) => (item.id === task.id ? task : item))
    : [task, ...current];

  await saveTasks(next);
  return next;
}

export async function deleteTask(taskId: string): Promise<TaskRecord[]> {
  const current = await getStoredTasks();
  const next = current.filter((item) => item.id !== taskId);
  await saveTasks(next);
  return next;
}

export async function updateTaskStatus(taskId: string, nextStatus: TaskStatus): Promise<TaskRecord[]> {
  const current = await getStoredTasks();
  const index = current.findIndex((task) => task.id === taskId);
  if (index === -1) {
    return current;
  }

  const task = current[index];
  const updatedTask: TaskRecord = {
    ...task,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
    syncStatus: "Pending Sync",
    history: [
      ...task.history,
      createHistoryEntry("Status updated", `Task status changed to ${nextStatus}.`),
    ],
  };

  current[index] = updatedTask;
  await saveTasks(current);
  return current;
}
