import { useState, useEffect, KeyboardEvent } from "react";
import { Modal, Button, Input, TextArea } from "../../components";
import {
  Task,
  TaskStatus,
  TaskPriority,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "../../types";
import { updateTask, UpdateTaskData } from "./taskService";
import { useAuthStore } from "../auth/authStore";
import { useUIStore } from "../board/uiStore";
import { useTasksStore } from "./tasksStore";
import styles from "./TaskForm.module.css";

interface EditTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTaskModal({ task, isOpen, onClose }: EditTaskModalProps) {
  const user = useAuthStore((state) => state.user);
  const addToast = useUIStore((state) => state.addToast);
  const updateTaskLocal = useTasksStore((state) => state.updateTask);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate || "");
      setTags(task.tags);
      setTagInput("");
      setErrors({});
    }
  }, [task]);

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
    if (!user || !task) return;

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
      const taskData: UpdateTaskData = {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate || null,
        tags,
      };

      await updateTask(user.uid, task.id, taskData);
      updateTaskLocal(task.id, taskData);

      addToast("Task updated successfully", "success");
      onClose();
    } catch (error) {
      console.error("Failed to update task:", error);
      addToast("Failed to update task", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Task"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Save Changes
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
