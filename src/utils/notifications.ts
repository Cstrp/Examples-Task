import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type { TaskRecord } from "../types";
import { formatDateTime } from "./datetime";
import { getReminderWarning } from "./validation";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleTaskReminder(task: TaskRecord, demoMode = false): Promise<{ warning: string | null; triggerDate: Date }> {
  const granted = await requestNotificationPermission();
  if (!granted) {
    throw new Error("Notification permission was denied.");
  }

  const warning = getReminderWarning(task.dueAt);
  let triggerDate = new Date(task.dueAt);

  if (demoMode) {
    triggerDate = new Date(Date.now() + 45_000);
  } else if (warning) {
    triggerDate = new Date(Date.now() + 20_000);
  }

  const secondsUntilTrigger = Math.max(1, Math.ceil((triggerDate.getTime() - Date.now()) / 1000));
  const notificationId = `task-reminder-${task.id}`;
  await Notifications.cancelScheduledNotificationAsync(notificationId);

  await Notifications.scheduleNotificationAsync({
    identifier: notificationId,
    content: {
      title: `Task due soon: ${task.title}`,
      body: `${task.location.address} • ${formatDateTime(task.dueAt)}`,
      sound: Platform.OS === "android" ? "default" : "default",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsUntilTrigger,
      repeats: false,
    },
  });

  return { warning, triggerDate };
}
