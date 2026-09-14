import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";

import type { TaskRecord } from "../types";

const API_BASE = Platform.select({
  android: "http://10.0.2.2:3001",
  ios: "http://localhost:3001",
  default: "http://localhost:3001",
});

export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

async function fetchRemoteTasks(): Promise<TaskRecord[]> {
  const response = await fetch(`${API_BASE}/tasks`);
  if (!response.ok) {
    throw new Error("Failed to fetch server tasks.");
  }

  const json = (await response.json()) as TaskRecord[];
  return Array.isArray(json) ? json : [];
}

export async function applyLastWriteWins(localTasks: TaskRecord[]): Promise<{
  mergedTasks: TaskRecord[];
  status: "Synced" | "Pending Sync" | "Sync Failed";
}> {
  const online = await isOnline();
  if (!online) {
    return { mergedTasks: localTasks, status: "Pending Sync" };
  }

  try {
    const remoteTasks = await fetchRemoteTasks();
    const merged = new Map<string, TaskRecord>();

    [...localTasks, ...remoteTasks].forEach((task) => {
      const current = merged.get(task.id);
      const winner =
        !current ||
        new Date(task.updatedAt).getTime() >=
          new Date(current.updatedAt).getTime()
          ? task
          : current;
      merged.set(task.id, winner);
    });

    const mergedTasks = [...merged.values()].sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() -
        new Date(left.updatedAt).getTime(),
    );

    for (const task of mergedTasks) {
      const remoteMatch = remoteTasks.find((item) => item.id === task.id);
      const url = remoteMatch
        ? `${API_BASE}/tasks/${task.id}`
        : `${API_BASE}/tasks`;
      const method = remoteMatch ? "PUT" : "POST";

      await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
      });
    }

    return { mergedTasks, status: "Synced" };
  } catch {
    return { mergedTasks: localTasks, status: "Sync Failed" };
  }
}
