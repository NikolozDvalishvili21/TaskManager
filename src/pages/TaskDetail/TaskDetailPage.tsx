import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuthStore } from "../../features/auth/authStore";
import { useUIStore } from "../../features/board/uiStore";
import { useTasksStore } from "../../features/tasks/tasksStore";
import { EditTaskModal } from "../../features/tasks/EditTaskModal";
import { Task, STATUS_LABELS, PRIORITY_LABELS } from "../../types";
import { formatDate, formatRelativeTime, classNames } from "../../lib/utils";
import {
  Button,
  Avatar,
  TextArea,
  LoadingContainer,
  ImageUpload,
  ImagePreview,
} from "../../components";
import {
  updateTask,
  deleteTask as deleteTaskService,
} from "../../features/tasks/taskService";
import {
  subscribeToComments,
  createComment,
  deleteComment,
} from "../../features/comments/commentService";
import { Comment } from "../../types";
import styles from "./TaskDetailPage.module.css";
import detailStyles from "../../features/tasks/TaskDetailModal.module.css";

export function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const addToast = useUIStore((state) => state.addToast);
  const { updateTask: updateTaskLocal, deleteTask } = useTasksStore();

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !taskId) return;

    const fetchTask = async () => {
      try {
        const taskDoc = await getDoc(
          doc(db, "users", user.uid, "tasks", taskId),
        );
        if (taskDoc.exists()) {
          const data = taskDoc.data();
          setTask({
            id: taskDoc.id,
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            dueDate: data.dueDate || null,
            tags: data.tags || [],
            createdAt:
              data.createdAt?.toDate?.().toISOString() ||
              new Date().toISOString(),
            updatedAt:
              data.updatedAt?.toDate?.().toISOString() ||
              new Date().toISOString(),
            imageUrls: data.imageUrls || [],
            userId: user.uid,
            assignee: data.assignee || null,
          });
        } else {
          addToast("Task not found", "error");
          navigate("/app/board");
        }
      } catch (error) {
        console.error("Failed to fetch task:", error);
        addToast("Failed to load task", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [user, taskId, navigate, addToast]);

  useEffect(() => {
    if (!user || !taskId) return;

    const unsubscribe = subscribeToComments(user.uid, taskId, setComments);
    return () => unsubscribe();
  }, [user, taskId]);

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
      setTask({ ...task, imageUrls: newImages });
      updateTaskLocal(task.id, { imageUrls: newImages });
    } catch (error) {
      console.error("Failed to update images:", error);
      addToast("Failed to update images", "error");
    }
  };

  const handleDelete = async () => {
    if (!user || !task) return;

    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTaskService(user.uid, task.id);
      deleteTask(task.id);
      addToast("Task deleted successfully", "success");
      navigate("/app/board");
    } catch (error) {
      console.error("Failed to delete task:", error);
      addToast("Failed to delete task", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingContainer size="lg" />;
  }

  if (!task) {
    return null;
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.backButton}
        onClick={() => navigate("/app/board")}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            d="M10 12L6 8l4-4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to Board
      </button>

      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>{task.title}</h1>
          <div className={styles.meta}>
            <span className={detailStyles.status}>
              {STATUS_LABELS[task.status]}
            </span>
            <span
              className={classNames(
                detailStyles.priority,
                task.priority === "high" && detailStyles.priorityHigh,
                task.priority === "medium" && detailStyles.priorityMedium,
                task.priority === "low" && detailStyles.priorityLow,
              )}
            >
              {PRIORITY_LABELS[task.priority]}
            </span>
          </div>
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => setShowEditModal(true)}>
            Edit
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.mainContent}>
          {/* Description */}
          <div className={detailStyles.section}>
            <h4 className={detailStyles.sectionTitle}>
              <svg
                className={detailStyles.sectionIcon}
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
                detailStyles.description,
                !task.description && detailStyles.descriptionEmpty,
              )}
            >
              {task.description || "No description provided"}
            </p>
          </div>

          {/* Attachments */}
          <div className={detailStyles.section}>
            <h4 className={detailStyles.sectionTitle}>
              <svg
                className={detailStyles.sectionIcon}
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
          <div className={detailStyles.section}>
            <h4 className={detailStyles.sectionTitle}>
              <svg
                className={detailStyles.sectionIcon}
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
              <div className={detailStyles.commentsList}>
                {comments.map((comment) => (
                  <div key={comment.id} className={detailStyles.comment}>
                    <Avatar
                      src={comment.authorPhoto}
                      name={comment.authorName}
                      size="sm"
                    />
                    <div className={detailStyles.commentContent}>
                      <div className={detailStyles.commentHeader}>
                        <span className={detailStyles.commentAuthor}>
                          {comment.authorName}
                        </span>
                        <span className={detailStyles.commentTime}>
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                      </div>
                      <p className={detailStyles.commentText}>{comment.text}</p>
                    </div>
                    {comment.authorId === user?.uid && (
                      <button
                        className={detailStyles.commentDelete}
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

            <div className={detailStyles.commentForm}>
              <Avatar src={user?.photoURL} name={user?.displayName} size="sm" />
              <div className={detailStyles.commentInput}>
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

        <div className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.sidebarTitle}>Due Date</div>
            <div className={styles.sidebarValue}>
              {task.dueDate ? formatDate(task.dueDate) : "Not set"}
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <div className={styles.sidebarTitle}>Created</div>
            <div className={styles.sidebarValue}>
              {formatRelativeTime(task.createdAt)}
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <div className={styles.sidebarTitle}>Last Updated</div>
            <div className={styles.sidebarValue}>
              {formatRelativeTime(task.updatedAt)}
            </div>
          </div>

          {task.tags.length > 0 && (
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarTitle}>Tags</div>
              <div className={detailStyles.tags}>
                {task.tags.map((tag) => (
                  <span key={tag} className={detailStyles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <EditTaskModal
        task={task}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          // Refetch task to get updates
          if (user && taskId) {
            getDoc(doc(db, "users", user.uid, "tasks", taskId)).then(
              (taskDoc) => {
                if (taskDoc.exists()) {
                  const data = taskDoc.data();
                  setTask({
                    id: taskDoc.id,
                    title: data.title,
                    description: data.description,
                    status: data.status,
                    priority: data.priority,
                    dueDate: data.dueDate || null,
                    tags: data.tags || [],
                    createdAt:
                      data.createdAt?.toDate?.().toISOString() ||
                      new Date().toISOString(),
                    updatedAt:
                      data.updatedAt?.toDate?.().toISOString() ||
                      new Date().toISOString(),
                    imageUrls: data.imageUrls || [],
                    userId: user.uid,
                    assignee: data.assignee || null,
                  });
                }
              },
            );
          }
        }}
      />

      <ImagePreview url={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
}
