import { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Avatar,
  TextArea,
  ImageUpload,
  ImagePreview,
} from "../../components";
import { Task, Comment, STATUS_LABELS, PRIORITY_LABELS } from "../../types";
import { formatDate, formatRelativeTime, classNames } from "../../lib/utils";
import { useAuthStore } from "../auth/authStore";
import { useUIStore } from "../board/uiStore";
import { useTasksStore } from "./tasksStore";
import { updateTask, deleteTask as deleteTaskService } from "./taskService";
import {
  subscribeToComments,
  createComment,
  deleteComment,
} from "../comments/commentService";
import styles from "./TaskDetailModal.module.css";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onEdit,
}: TaskDetailModalProps) {
  const user = useAuthStore((state) => state.user);
  const addToast = useUIStore((state) => state.addToast);
  const { deleteTask, updateTask: updateTaskLocal } = useTasksStore();

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !task) return;

    const unsubscribe = subscribeToComments(user.uid, task.id, setComments);
    return () => unsubscribe();
  }, [user, task]);

  const handleAddComment = async () => {
    if (!user || !task || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      await createComment(user.uid, task.id, {
        text: newComment.trim(),
        authorName: user.displayName || "Anonymous",
        authorPhoto: user.photoURL || "",
        authorId: user.uid,
      });
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
      addToast("Failed to add comment", "error");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user || !task) return;

    try {
      await deleteComment(user.uid, task.id, commentId);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      addToast("Failed to delete comment", "error");
    }
  };

  const handleImagesChange = async (newImages: string[]) => {
    if (!user || !task) return;

    try {
      await updateTask(user.uid, task.id, { imageUrls: newImages });
      updateTaskLocal(task.id, { imageUrls: newImages });
    } catch (error) {
      console.error("Failed to update images:", error);
      addToast("Failed to update images", "error");
    }
  };

  const handleDelete = async () => {
    if (!user || !task) return;

    setIsDeleting(true);
    try {
      await deleteTaskService(user.uid, task.id);
      deleteTask(task.id);
      addToast("Task deleted successfully", "success");
      onClose();
    } catch (error) {
      console.error("Failed to delete task:", error);
      addToast("Failed to delete task", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!task) return null;

  if (showDeleteConfirm) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Task"
      >
        <div className={styles.deleteConfirm}>
          <p className={styles.deleteConfirmText}>
            Are you sure you want to delete "{task.title}"? This action cannot
            be undone.
          </p>
          <div className={styles.deleteConfirmButtons}>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete Task
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={task.title}
        size="large"
        footer={
          <div className={styles.actions}>
            <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
              Delete
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onEdit}>Edit Task</Button>
          </div>
        }
      >
        <div className={styles.detailContainer}>
          {/* Meta Information */}
          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Status</span>
              <span className={styles.status}>
                {STATUS_LABELS[task.status]}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Priority</span>
              <span
                className={classNames(
                  styles.priority,
                  task.priority === "high" && styles.priorityHigh,
                  task.priority === "medium" && styles.priorityMedium,
                  task.priority === "low" && styles.priorityLow,
                )}
              >
                {PRIORITY_LABELS[task.priority]}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Assignee</span>
              {task.assignee ? (
                <div className={styles.assigneeDisplay}>
                  <Avatar
                    src={task.assignee.photoURL}
                    name={task.assignee.displayName}
                    size="xs"
                  />
                  <span className={styles.metaValue}>
                    {task.assignee.displayName}
                  </span>
                </div>
              ) : (
                <span className={styles.metaValueEmpty}>Unassigned</span>
              )}
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Due Date</span>
              <span className={styles.metaValue}>
                {task.dueDate ? formatDate(task.dueDate) : "Not set"}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Created</span>
              <span className={styles.metaValue}>
                {formatRelativeTime(task.createdAt)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              <svg
                className={styles.sectionIcon}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="2" y="2" width="12" height="12" rx="1" />
                <path d="M4 6h8M4 10h5" strokeLinecap="round" />
              </svg>
              Description
            </h4>
            <p
              className={classNames(
                styles.description,
                !task.description && styles.descriptionEmpty,
              )}
            >
              {task.description || "No description provided"}
            </p>
          </div>

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>
                <svg
                  className={styles.sectionIcon}
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M2 4.5a2.5 2.5 0 012.5-2.5h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 010 1.414l-5.586 5.586a1 1 0 01-1.414 0L2.793 9.293A1 1 0 012 8.586V4.5z" />
                  <circle cx="5.5" cy="5.5" r="1" fill="currentColor" />
                </svg>
                Tags
              </h4>
              <div className={styles.tags}>
                {task.tags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Images */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              <svg
                className={styles.sectionIcon}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="2" y="2" width="12" height="12" rx="1" />
                <circle cx="5.5" cy="5.5" r="1" />
                <path d="M14 10l-3-3-7 7" />
              </svg>
              Attachments
            </h4>
            <ImageUpload
              taskId={task.id}
              images={task.imageUrls}
              onImagesChange={handleImagesChange}
              onImageClick={setPreviewImage}
            />
          </div>

          {/* Comments */}
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>
              <svg
                className={styles.sectionIcon}
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M14 10c0 .552-.448 1-1 1H4l-2 2V3c0-.552.448-1 1-1h10c.552 0 1 .448 1 1v7z" />
              </svg>
              Comments ({comments.length})
            </h4>

            {comments.length > 0 && (
              <div className={styles.commentsList}>
                {comments.map((comment) => (
                  <div key={comment.id} className={styles.comment}>
                    <Avatar
                      src={comment.authorPhoto}
                      name={comment.authorName}
                      size="sm"
                    />
                    <div className={styles.commentContent}>
                      <div className={styles.commentHeader}>
                        <span className={styles.commentAuthor}>
                          {comment.authorName}
                        </span>
                        <span className={styles.commentTime}>
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className={styles.commentText}>{comment.text}</p>
                    </div>
                    {comment.authorId === user?.uid && (
                      <button
                        className={styles.commentDelete}
                        onClick={() => handleDeleteComment(comment.id)}
                        aria-label="Delete comment"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path
                            d="M1.75 3.5h10.5M4.667 3.5V2.333c0-.644.522-1.166 1.166-1.166h2.334c.644 0 1.166.522 1.166 1.166V3.5m1.75 0v8.167c0 .644-.522 1.166-1.166 1.166H4.083c-.644 0-1.166-.522-1.166-1.166V3.5h8.166z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className={styles.commentForm}>
              <Avatar src={user?.photoURL} name={user?.displayName} size="sm" />
              <div className={styles.commentInput}>
                <TextArea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </div>
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                isLoading={isSubmittingComment}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <ImagePreview url={previewImage} onClose={() => setPreviewImage(null)} />
    </>
  );
}
