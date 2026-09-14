import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";

const MapView =
  Platform.OS === "web" ? null : require("react-native-maps").default;
const Marker =
  Platform.OS === "web" ? null : require("react-native-maps").Marker;

import { createId } from "./src/services/storage";
import { scheduleTaskReminder } from "./src/utils/notifications";
import { formatDateTime } from "./src/utils/datetime";
import { getReminderWarning, validateTaskInput } from "./src/utils/validation";
import { useTaskStore } from "./src/store/useTaskStore";
import type {
  AttachmentMetadata,
  TaskDraft,
  TaskRecord,
  TaskStatus,
} from "./src/types";

const CANDIDATE_CODE = "SA-RN-4257";

type TabKey = "tasks" | "history" | "map" | "settings";

function buildDefaultDraft(): TaskDraft {
  return {
    title: "",
    description: "",
    dueAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    status: "New",
    locationAddress: "",
    latitude: "",
    longitude: "",
  };
}

function buildDraftFromTask(task: TaskRecord): TaskDraft {
  return {
    title: task.title,
    description: task.description,
    dueAt: new Date(task.dueAt).toISOString().slice(0, 16),
    status: task.status,
    locationAddress: task.location.address,
    latitude: String(task.location.latitude),
    longitude: String(task.location.longitude),
  };
}

export default function App() {
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<TabKey>("tasks");
  const [editorVisible, setEditorVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<TaskRecord | null>(null);
  const [draft, setDraft] = useState<TaskDraft>(buildDefaultDraft());
  const [draftAttachments, setDraftAttachments] = useState<
    AttachmentMetadata[]
  >([]);

  const {
    tasks,
    sortMode,
    syncStatus,
    loadTasks,
    saveTask,
    updateStatus,
    deleteTaskById,
    syncNow,
    setSortMode,
  } = useTaskStore();

  const isDark = themeMode === "dark";

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (!selectedTaskId && tasks.length > 0) {
      setSelectedTaskId(tasks[0].id);
    }
  }, [selectedTaskId, tasks]);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? tasks[0] ?? null,
    [selectedTaskId, tasks],
  );

  const openCreateForm = () => {
    setEditingTask(null);
    setDraft(buildDefaultDraft());
    setDraftAttachments([]);
    setEditorVisible(true);
  };

  const openEditForm = (task: TaskRecord) => {
    setEditingTask(task);
    setDraft(buildDraftFromTask(task));
    setDraftAttachments(task.attachments ?? []);
    setEditorVisible(true);
  };

  const handleFieldChange = <K extends keyof TaskDraft>(
    field: K,
    value: TaskDraft[K],
  ) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handlePickAttachment = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Photo access required",
        "Please allow access to choose a task image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    const fileName = asset.fileName ?? `${Date.now()}.jpg`;

    const attachment: AttachmentMetadata = {
      id: createId(),
      name: fileName,
      uri: asset.uri,
      mimeType: asset.mimeType ?? "image/jpeg",
      size: asset.fileSize,
      createdAt: new Date().toISOString(),
    };

    setDraftAttachments((current) => [...current, attachment]);
  };

  const handleSave = async () => {
    const errors = validateTaskInput(draft);
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      Alert.alert(
        "Please review the form",
        firstError ?? "Some fields are invalid.",
      );
      return;
    }

    try {
      const savedTask = await saveTask(
        draft,
        editingTask?.id,
        draftAttachments,
      );
      setSelectedTaskId(savedTask.id);
      setEditorVisible(false);
      const warning = getReminderWarning(savedTask.dueAt);
      if (warning) {
        Alert.alert("Reminder notice", warning);
      }
      try {
        const reminder = await scheduleTaskReminder(savedTask);
        if (reminder.warning) {
          Alert.alert("Reminder set", reminder.warning);
        }
      } catch {
        Alert.alert(
          "Notification unavailable",
          "Task saved locally, but the reminder could not be scheduled.",
        );
      }
    } catch (error) {
      Alert.alert(
        "Save failed",
        error instanceof Error ? error.message : "Unable to save the task.",
      );
    }
  };

  const handleDelete = (taskId: string) => {
    Alert.alert("Delete task", "This action cannot be undone. Continue?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteTaskById(taskId);
          setSelectedTaskId((current) => (current === taskId ? null : current));
        },
      },
    ]);
  };

  const handleStatusChange = async (
    task: TaskRecord,
    nextStatus: TaskStatus,
  ) => {
    await updateStatus(task.id, nextStatus);
    setSelectedTaskId(task.id);
  };

  const handleDemoReminder = async () => {
    const demoTask = tasks[0];
    if (!demoTask) {
      Alert.alert(
        "No task available",
        "Create a task before testing the reminder flow.",
      );
      return;
    }

    try {
      await scheduleTaskReminder(demoTask, true);
      Alert.alert(
        "Demo reminder ready",
        "The same reminder flow will trigger in 30-60 seconds.",
      );
    } catch {
      Alert.alert(
        "Notification denied",
        "Please grant notification permission to run the demo reminder.",
      );
    }
  };

  const mapMarkers = tasks.filter(
    (task) =>
      Number.isFinite(task.location.latitude) &&
      Number.isFinite(task.location.longitude),
  );

  const historyFeed = tasks
    .flatMap((task) =>
      task.history.map((entry) => ({
        ...entry,
        taskTitle: task.title,
      })),
    )
    .sort(
      (left, right) =>
        new Date(right.timestamp).getTime() -
        new Date(left.timestamp).getTime(),
    );

  const STATUS_COLORS: Record<
    TaskStatus,
    { backgroundColor: string; color: string }
  > = {
    New: {
      backgroundColor: "#EEF4FF",
      color: "#2457D6",
    },
    "In Progress": {
      backgroundColor: "#FFF7E6",
      color: "#B54708",
    },
    Completed: {
      backgroundColor: "#ECFDF3",
      color: "#027A48",
    },
    Cancelled: {
      backgroundColor: "#FEF3F2",
      color: "#B42318",
    },
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkBackground]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={[styles.header, isDark && styles.darkPanel]}>
        <View>
          <Text style={[styles.appTitle, isDark && styles.darkText]}>
            Field Tasks
          </Text>
          <Text style={[styles.subtitle, isDark && styles.mutedText]}>
            {syncStatus}
          </Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            onPress={() => void syncNow()}
            style={[styles.syncButton, isDark && styles.darkButton]}
          >
            <Text style={[styles.syncButtonText, isDark && styles.darkText]}>
              Sync
            </Text>
          </Pressable>
          <Switch
            value={isDark}
            onValueChange={(next) => setThemeMode(next ? "dark" : "light")}
            accessibilityLabel="Toggle dark mode"
          />
        </View>
      </View>

      <View style={styles.tabBar}>
        {(["tasks", "history", "map", "settings"] as TabKey[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTabButton,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab === "tasks"
                ? "Tasks"
                : tab === "history"
                  ? "History"
                  : tab === "map"
                    ? "Map"
                    : "Settings"}
            </Text>
          </Pressable>
        ))}
      </View>

      {activeTab === "tasks" && (
        <View style={styles.tasksContainer}>
          <View style={styles.toolbar}>
            <Text style={[styles.sectionLabel, isDark && styles.darkText]}>
              Sort
            </Text>
            <View style={styles.sortRow}>
              {[
                { key: "createdAt", label: "Added" },
                { key: "dueDate", label: "Due" },
                { key: "status", label: "Status" },
              ].map((option) => (
                <Pressable
                  key={option.key}
                  onPress={() =>
                    setSortMode(
                      option.key as "createdAt" | "dueDate" | "status",
                    )
                  }
                  style={[
                    styles.sortChip,
                    sortMode === option.key && styles.sortChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.sortChipText,
                      sortMode === option.key && styles.sortChipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable onPress={openCreateForm} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>New task</Text>
            </Pressable>
          </View>

          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={[styles.emptyTitle, isDark && styles.darkText]}>
                  No tasks yet
                </Text>
                <Text style={[styles.emptyBody, isDark && styles.mutedText]}>
                  Create a task to start tracking your field schedule.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setSelectedTaskId(item.id)}
                style={[
                  styles.taskCard,
                  selectedTask?.id === item.id && styles.taskCardSelected,
                  isDark && styles.darkPanel,
                ]}
              >
                <View style={styles.taskHeaderRow}>
                  <Text style={[styles.taskTitle, isDark && styles.darkText]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          STATUS_COLORS[item.status].backgroundColor,
                        color: STATUS_COLORS[item.status].color,
                      },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
                <Text style={[styles.taskMeta, isDark && styles.mutedText]}>
                  {formatDateTime(item.dueAt)}
                </Text>
                <Text style={[styles.taskMeta, isDark && styles.mutedText]}>
                  {item.location.address}
                </Text>
                <Text
                  style={[styles.taskDescription, isDark && styles.mutedText]}
                >
                  {item.description}
                </Text>
              </Pressable>
            )}
          />

          {selectedTask && (
            <ScrollView
              style={styles.detailPanel}
              contentContainerStyle={styles.detailContent}
            >
              <Text style={[styles.detailTitle, isDark && styles.darkText]}>
                {selectedTask.title}
              </Text>
              <Text style={[styles.detailMeta, isDark && styles.mutedText]}>
                {formatDateTime(selectedTask.dueAt)}
              </Text>
              <Text
                style={[styles.detailDescription, isDark && styles.darkText]}
              >
                {selectedTask.description}
              </Text>

              <Text style={[styles.sectionLabel, isDark && styles.darkText]}>
                Status
              </Text>
              <View style={styles.statusRow}>
                {(
                  [
                    "New",
                    "In Progress",
                    "Completed",
                    "Cancelled",
                  ] as TaskStatus[]
                ).map((status) => (
                  <Pressable
                    key={status}
                    onPress={() =>
                      void handleStatusChange(selectedTask, status)
                    }
                    style={[
                      styles.statusButton,
                      selectedTask.status === status &&
                        styles.statusButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        selectedTask.status === status &&
                          styles.statusButtonTextActive,
                      ]}
                    >
                      {status}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.sectionLabel, isDark && styles.darkText]}>
                Location
              </Text>
              <Text style={[styles.detailMeta, isDark && styles.mutedText]}>
                {selectedTask.location.address}
              </Text>
              <Text style={[styles.detailMeta, isDark && styles.mutedText]}>
                {selectedTask.location.latitude.toFixed(4)},{" "}
                {selectedTask.location.longitude.toFixed(4)}
              </Text>

              <Text style={[styles.sectionLabel, isDark && styles.darkText]}>
                Attachments
              </Text>
              {selectedTask.attachments.length === 0 ? (
                <Text style={[styles.detailMeta, isDark && styles.mutedText]}>
                  No images attached.
                </Text>
              ) : (
                <View style={styles.attachmentGrid}>
                  {selectedTask.attachments.map((attachment) => (
                    <Image
                      key={attachment.id}
                      source={{ uri: attachment.uri }}
                      style={styles.detailImage}
                    />
                  ))}
                </View>
              )}

              <Text style={[styles.sectionLabel, isDark && styles.darkText]}>
                History
              </Text>
              {selectedTask.history.map((entry) => (
                <View
                  key={entry.id}
                  style={[styles.historyRow, isDark && styles.darkPanel]}
                >
                  <Text
                    style={[styles.historyTitle, isDark && styles.darkText]}
                  >
                    {entry.actionType}
                  </Text>
                  <Text
                    style={[styles.historyText, isDark && styles.mutedText]}
                  >
                    {entry.description}
                  </Text>
                  <Text
                    style={[
                      styles.historyTimestamp,
                      isDark && styles.mutedText,
                    ]}
                  >
                    {formatDateTime(entry.timestamp)}
                  </Text>
                </View>
              ))}

              <View style={styles.detailActionRow}>
                <Pressable
                  onPress={() => openEditForm(selectedTask)}
                  style={styles.secondaryButton}
                >
                  <Text style={styles.secondaryButtonText}>Edit</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDelete(selectedTask.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </Pressable>
              </View>
            </ScrollView>
          )}
        </View>
      )}

      {activeTab === "history" && (
        <ScrollView
          style={styles.settingsContainer}
          contentContainerStyle={styles.settingsContent}
        >
          <Text style={[styles.sectionLabel, isDark && styles.darkText]}>
            Activity log
          </Text>
          {historyFeed.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, isDark && styles.darkText]}>
                No activity yet
              </Text>
            </View>
          ) : (
            historyFeed.map((entry) => (
              <View
                key={`${entry.id}-${entry.taskTitle}`}
                style={[styles.historyRow, isDark && styles.darkPanel]}
              >
                <Text style={[styles.historyTitle, isDark && styles.darkText]}>
                  {entry.taskTitle}
                </Text>
                <Text style={[styles.historyText, isDark && styles.mutedText]}>
                  {entry.actionType}
                </Text>
                <Text style={[styles.historyText, isDark && styles.mutedText]}>
                  {entry.description}
                </Text>
                <Text
                  style={[styles.historyTimestamp, isDark && styles.mutedText]}
                >
                  {formatDateTime(entry.timestamp)}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {activeTab === "map" && (
        <View style={styles.mapContainer}>
          {Platform.OS === "web" ? (
            <View style={styles.webMapPlaceholder}>
              <Text style={[styles.emptyTitle, isDark && styles.darkText]}>
                Map view is for native Android/iOS builds.
              </Text>
              <Text style={[styles.emptyBody, isDark && styles.mutedText]}>
                Use the Expo mobile app to view task markers on a live map.
              </Text>
            </View>
          ) : (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: mapMarkers[0]?.location.latitude ?? -33.8688,
                longitude: mapMarkers[0]?.location.longitude ?? 151.2093,
                latitudeDelta: 0.15,
                longitudeDelta: 0.15,
              }}
            >
              {mapMarkers.map((task) => (
                <Marker
                  key={task.id}
                  coordinate={{
                    latitude: task.location.latitude,
                    longitude: task.location.longitude,
                  }}
                  title={task.title}
                  description={task.location.address}
                  onCalloutPress={() => setSelectedTaskId(task.id)}
                />
              ))}
            </MapView>
          )}
        </View>
      )}

      {activeTab === "settings" && (
        <ScrollView
          style={styles.settingsContainer}
          contentContainerStyle={styles.settingsContent}
        >
          <View style={[styles.settingsCard, isDark && styles.darkPanel]}>
            <Text style={[styles.sectionLabel, isDark && styles.darkText]}>
              Candidate code
            </Text>
            <Text style={[styles.candidateCode, isDark && styles.darkText]}>
              {CANDIDATE_CODE}
            </Text>
            <Text style={[styles.valueText, isDark && styles.mutedText]}>
              Include this Settings screen in the video demonstration.
            </Text>
          </View>

          <View style={[styles.settingsCard, isDark && styles.darkPanel]}>
            <Text style={[styles.sectionLabel, isDark && styles.darkText]}>
              Sync state
            </Text>
            <Text style={[styles.valueText, isDark && styles.mutedText]}>
              {syncStatus}
            </Text>
            <Pressable
              onPress={() => void syncNow()}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Run sync</Text>
            </Pressable>
          </View>

          <View style={[styles.settingsCard, isDark && styles.darkPanel]}>
            <Text style={[styles.sectionLabel, isDark && styles.darkText]}>
              Demo reminder
            </Text>
            <Text style={[styles.valueText, isDark && styles.mutedText]}>
              Trigger the same reminder flow after 30-60 seconds without waiting
              for a real due date.
            </Text>
            <Pressable
              onPress={() => void handleDemoReminder()}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>
                Trigger demo reminder
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}

      <Modal visible={editorVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, isDark && styles.darkBackground]}>
            <Text style={[styles.modalTitle, isDark && styles.darkText]}>
              {editingTask ? "Edit task" : "New task"}
            </Text>

            <ScrollView>
              <Text style={[styles.fieldLabel, isDark && styles.darkText]}>
                Task title*
              </Text>
              <TextInput
                value={draft.title}
                onChangeText={(value) => handleFieldChange("title", value)}
                style={[styles.input, isDark && styles.darkInput]}
                placeholder="e.g. Service call at North Depot"
              />

              <Text style={[styles.fieldLabel, isDark && styles.darkText]}>
                Description*
              </Text>
              <TextInput
                value={draft.description}
                onChangeText={(value) =>
                  handleFieldChange("description", value)
                }
                style={[
                  styles.input,
                  styles.textArea,
                  isDark && styles.darkInput,
                ]}
                placeholder="Add task details"
                multiline
              />

              <Text style={[styles.fieldLabel, isDark && styles.darkText]}>
                Due date and time*
              </Text>
              <TextInput
                value={draft.dueAt}
                onChangeText={(value) => handleFieldChange("dueAt", value)}
                style={[styles.input, isDark && styles.darkInput]}
                placeholder="2026-09-15T09:30"
              />

              <Text style={[styles.fieldLabel, isDark && styles.darkText]}>
                Location address*
              </Text>
              <TextInput
                value={draft.locationAddress}
                onChangeText={(value) =>
                  handleFieldChange("locationAddress", value)
                }
                style={[styles.input, isDark && styles.darkInput]}
                placeholder="123 Quarry Road, Brisbane"
              />

              <Text style={[styles.fieldLabel, isDark && styles.darkText]}>
                Latitude (optional)
              </Text>
              <TextInput
                value={draft.latitude}
                onChangeText={(value) => handleFieldChange("latitude", value)}
                keyboardType="decimal-pad"
                style={[styles.input, isDark && styles.darkInput]}
                placeholder="-33.8688"
              />

              <Text style={[styles.fieldLabel, isDark && styles.darkText]}>
                Longitude (optional)
              </Text>
              <TextInput
                value={draft.longitude}
                onChangeText={(value) => handleFieldChange("longitude", value)}
                keyboardType="decimal-pad"
                style={[styles.input, isDark && styles.darkInput]}
                placeholder="151.2093"
              />

              <Text style={[styles.fieldLabel, isDark && styles.darkText]}>
                Status
              </Text>
              <View style={styles.statusRow}>
                {(
                  [
                    "New",
                    "In Progress",
                    "Completed",
                    "Cancelled",
                  ] as TaskStatus[]
                ).map((status) => (
                  <Pressable
                    key={status}
                    onPress={() => handleFieldChange("status", status)}
                    style={[
                      styles.statusButton,
                      draft.status === status && styles.statusButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        draft.status === status &&
                          styles.statusButtonTextActive,
                      ]}
                    >
                      {status}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={[styles.fieldLabel, isDark && styles.darkText]}>
                Attachments
              </Text>
              <Pressable
                onPress={() => void handlePickAttachment()}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Add image</Text>
              </Pressable>

              {draftAttachments.length > 0 && (
                <View style={styles.attachmentGrid}>
                  {draftAttachments.map((attachment) => (
                    <Image
                      key={attachment.id}
                      source={{ uri: attachment.uri }}
                      style={styles.detailImage}
                    />
                  ))}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setEditorVisible(false)}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => void handleSave()}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>Save task</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F6FA",
  },

  darkBackground: {
    backgroundColor: "#0B1220",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    paddingHorizontal: 20,
    paddingVertical: 16,

    backgroundColor: "#FFFFFF",

    borderBottomWidth: 1,
    borderBottomColor: "#E8EDF3",
  },

  appTitle: {
    color: "#101828",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.6,
  },

  subtitle: {
    marginTop: 3,
    color: "#667085",
    fontSize: 12,
    fontWeight: "500",
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  syncButton: {
    minHeight: 38,
    paddingHorizontal: 14,

    justifyContent: "center",
    alignItems: "center",

    borderRadius: 10,

    backgroundColor: "#EEF4FF",
    borderWidth: 1,
    borderColor: "#D9E5FF",
  },

  syncButtonText: {
    color: "#2457D6",
    fontSize: 13,
    fontWeight: "700",
  },

  tabBar: {
    flexDirection: "row",
    gap: 6,

    marginHorizontal: 16,
    marginTop: 14,

    padding: 5,

    borderRadius: 14,

    backgroundColor: "#EAF0F6",
  },

  tabButton: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    minHeight: 42,

    borderRadius: 10,

    backgroundColor: "transparent",
  },

  activeTabButton: {
    backgroundColor: "#FFFFFF",

    shadowColor: "#101828",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  tabText: {
    color: "#667085",
    fontSize: 13,
    fontWeight: "600",
  },

  activeTabText: {
    color: "#172B4D",
    fontWeight: "800",
  },

  tasksContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  toolbar: {
    gap: 10,
    marginBottom: 14,
  },

  sectionLabel: {
    color: "#667085",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  sortRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  sortChip: {
    minHeight: 34,

    paddingHorizontal: 13,
    paddingVertical: 8,

    justifyContent: "center",

    borderRadius: 9,

    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE3EC",
  },

  sortChipActive: {
    backgroundColor: "#2457D6",
    borderColor: "#2457D6",
  },

  sortChipText: {
    color: "#475467",
    fontSize: 12,
    fontWeight: "700",
  },

  sortChipTextActive: {
    color: "#FFFFFF",
  },

  primaryButton: {
    minHeight: 44,

    paddingHorizontal: 16,
    paddingVertical: 11,

    justifyContent: "center",
    alignItems: "center",

    borderRadius: 11,

    backgroundColor: "#2457D6",

    shadowColor: "#2457D6",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  listContent: {
    gap: 10,
    paddingBottom: 18,
  },

  taskCard: {
    padding: 16,

    borderRadius: 16,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E4EAF1",

    shadowColor: "#101828",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  taskCardSelected: {
    borderColor: "#8CB1FF",
    backgroundColor: "#F8FBFF",

    shadowColor: "#2457D6",
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },

  taskHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",

    gap: 10,
  },

  taskTitle: {
    flex: 1,

    color: "#101828",
    fontSize: 16,
    fontWeight: "800",

    lineHeight: 22,
    letterSpacing: -0.2,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 8,

    overflow: "hidden",

    fontSize: 10,
    fontWeight: "800",
    color: "#344054",
  },

  taskMeta: {
    marginTop: 7,

    color: "#667085",
    fontSize: 12,
    fontWeight: "500",
  },

  taskDescription: {
    marginTop: 9,

    color: "#475467",
    fontSize: 13,
    lineHeight: 19,
  },

  detailPanel: {
    maxHeight: 430,

    marginTop: 12,

    borderRadius: 18,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E4EAF1",

    shadowColor: "#101828",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  detailContent: {
    gap: 10,

    padding: 18,
    paddingBottom: 22,
  },

  detailTitle: {
    color: "#101828",
    fontSize: 22,
    fontWeight: "800",

    letterSpacing: -0.5,
  },

  detailMeta: {
    color: "#667085",
    fontSize: 13,
    lineHeight: 19,
  },

  detailDescription: {
    color: "#1D2939",
    fontSize: 14,
    lineHeight: 21,
  },

  statusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  statusButton: {
    minHeight: 36,

    paddingHorizontal: 12,
    paddingVertical: 8,

    justifyContent: "center",
    alignItems: "center",

    borderRadius: 9,

    backgroundColor: "#F2F4F7",
    borderWidth: 1,
    borderColor: "#E4E7EC",
  },

  statusButtonActive: {
    backgroundColor: "#2457D6",
    borderColor: "#2457D6",
  },

  statusButtonText: {
    color: "#475467",
    fontSize: 12,
    fontWeight: "700",
  },

  statusButtonTextActive: {
    color: "#FFFFFF",
  },

  attachmentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  detailImage: {
    width: 92,
    height: 92,

    borderRadius: 12,

    backgroundColor: "#EEF2F6",
  },

  historyRow: {
    padding: 13,

    borderRadius: 12,

    backgroundColor: "#F8FAFC",

    borderWidth: 1,
    borderColor: "#E7ECF2",
  },

  historyTitle: {
    marginBottom: 4,

    color: "#101828",
    fontSize: 13,
    fontWeight: "800",
  },

  historyText: {
    color: "#667085",
    fontSize: 12,
    lineHeight: 18,
  },

  historyTimestamp: {
    marginTop: 6,

    color: "#98A2B3",
    fontSize: 11,
    fontWeight: "500",
  },

  detailActionRow: {
    flexDirection: "row",
    gap: 10,

    marginTop: 12,
  },

  secondaryButton: {
    minHeight: 42,

    paddingHorizontal: 16,
    paddingVertical: 10,

    justifyContent: "center",
    alignItems: "center",

    borderRadius: 10,

    backgroundColor: "#F2F4F7",

    borderWidth: 1,
    borderColor: "#E4E7EC",
  },

  secondaryButtonText: {
    color: "#344054",
    fontSize: 13,
    fontWeight: "800",
  },

  deleteButton: {
    flex: 1,

    minHeight: 42,

    paddingHorizontal: 16,
    paddingVertical: 10,

    justifyContent: "center",
    alignItems: "center",

    borderRadius: 10,

    backgroundColor: "#D92D20",
  },

  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  emptyState: {
    marginTop: 30,
    padding: 28,

    alignItems: "center",

    borderRadius: 18,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E4EAF1",
  },

  emptyTitle: {
    color: "#101828",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyBody: {
    maxWidth: 300,

    marginTop: 7,

    color: "#667085",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },

  mapContainer: {
    flex: 1,
    padding: 16,
  },

  map: {
    flex: 1,

    minHeight: 300,

    borderRadius: 18,
    overflow: "hidden",
  },

  webMapPlaceholder: {
    flex: 1,

    minHeight: 300,

    padding: 28,

    justifyContent: "center",
    alignItems: "center",

    borderRadius: 18,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E4EAF1",
  },

  settingsContainer: {
    flex: 1,

    paddingHorizontal: 16,
    paddingTop: 16,
  },

  settingsContent: {
    gap: 12,

    paddingBottom: 24,
  },

  settingsCard: {
    gap: 10,

    padding: 18,

    borderRadius: 16,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#E4EAF1",

    shadowColor: "#101828",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },

  candidateCode: {
    color: "#101828",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1,
  },

  valueText: {
    color: "#667085",
    fontSize: 13,
    lineHeight: 19,
  },

  modalBackdrop: {
    flex: 1,

    padding: 16,

    justifyContent: "center",

    backgroundColor: "rgba(15, 23, 42, 0.55)",
  },

  modalCard: {
    width: "100%",
    maxHeight: "90%",

    padding: 20,

    borderRadius: 22,

    backgroundColor: "#FFFFFF",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 10,
  },

  modalTitle: {
    marginBottom: 14,

    color: "#101828",
    fontSize: 22,
    fontWeight: "900",

    letterSpacing: -0.4,
  },

  fieldLabel: {
    marginTop: 14,
    marginBottom: 7,

    color: "#344054",
    fontSize: 12,
    fontWeight: "800",
  },

  input: {
    minHeight: 44,

    paddingHorizontal: 13,
    paddingVertical: 10,

    borderRadius: 10,

    backgroundColor: "#F8FAFC",

    borderWidth: 1,
    borderColor: "#DCE3EC",

    color: "#101828",

    fontSize: 14,
  },

  textArea: {
    minHeight: 110,

    textAlignVertical: "top",
  },

  darkPanel: {
    backgroundColor: "#111827",
    borderColor: "#22304A",
  },

  darkText: {
    color: "#F8FAFC",
  },

  darkInput: {
    backgroundColor: "#0F172A",
    borderColor: "#334155",
    color: "#F8FAFC",
  },

  mutedText: {
    color: "#98A2B3",
  },

  darkButton: {
    backgroundColor: "#182338",
    borderColor: "#263653",
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,

    marginTop: 18,
    paddingTop: 14,

    borderTopWidth: 1,
    borderTopColor: "#E8EDF3",
  },
});
