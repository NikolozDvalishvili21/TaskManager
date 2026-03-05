import { useState, useEffect, KeyboardEvent } from "react";
import { Modal, Button, Input, TextArea } from "../../components";
import {
  TaskStatus,
  TaskPriority,
  Assignee,
  TeamMember,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "../../types";
import { createTask, CreateTaskData } from "./taskService";
import { useAuthStore } from "../auth/authStore";
import { useUIStore } from "../board/uiStore";
import { useTasksStore } from "./tasksStore";
import { subscribeToAllUsers } from "../users/userService";
import { AssigneeSelect } from "../team/AssigneeSelect";
import { sendTaskAssignmentEmail } from "../email/emailService";
import styles from "./TaskForm.module.css";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: TaskStatus;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  defaultStatus = "todo",
}: CreateTaskModalProps) {
  const user = useAuthStore((state) => state.user);
  const addToast = useUIStore((state) => state.addToast);
  const addTask = useTasksStore((state) => state.addTask);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [assignee, setAssignee] = useState<Assignee | null>(null);
  const [allUsers, setAllUsers] = useState<TeamMember[]>([]);

  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    const unsubscribe = subscribeToAllUsers(setAllUsers);
    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus(defaultStatus);
    setPriority("medium");
    setDueDate("");
    setTags([]);
    setTagInput("");
    setAssignee(null);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!user) return;

    const newErrors: { title?: string } = {};
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData: CreateTaskData = {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate || null,
        tags,
        assignee,
      };

      const taskId = await createTask(user.uid, taskData);

      addTask({
        id: taskId,
        ...taskData,
        imageUrls: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.uid,
      });

      // Send email notification if task is assigned to someone
      if (assignee && assignee.email) {
        sendTaskAssignmentEmail({
          toEmail: assignee.email,
          toName: assignee.displayName,
          taskTitle: taskData.title,
          taskDescription: taskData.description,
          assignedBy: user.displayName || user.email || "Someone",
        });
      }

      addToast("Task created successfully", "success");
      handleClose();
    } catch (error) {
      console.error("Failed to create task:", error);
      addToast("Failed to create task", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Task"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Create Task
          </Button>
        </>
      }
    >
      <div className={styles.form}>
        <Input
          label="Title"
          placeholder="Enter task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          autoFocus
        />

        <TextArea
          label="Description"
          placeholder="Enter task description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className={styles.row}>
          <div>
            <label className={styles.label}>Status</label>
            <select
              className={styles.select}
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={styles.label}>Priority</label>
            <select
              className={styles.select}
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <div>
          <label className={styles.label}>Assignee</label>
          <AssigneeSelect
            value={assignee}
            onChange={setAssignee}
            users={allUsers}
          />
        </div>

        <div>
          <label className={styles.label}>Tags</label>
          <div className={styles.tagsInput}>
            {tags.map((tag) => (
              <span key={tag} className={styles.tagItem}>
                {tag}
                <button
                  type="button"
                  className={styles.tagRemove}
                  onClick={() => removeTag(tag)}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M8 2L2 8M2 2L8 8" strokeLinecap="round" />
                  </svg>
                </button>
              </span>
            ))}
            <input
              type="text"
              className={styles.tagInputField}
              placeholder={tags.length === 0 ? "Add tags (press Enter)" : ""}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
