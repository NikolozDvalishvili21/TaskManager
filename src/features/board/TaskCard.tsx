import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task } from "../../types";
import { Avatar } from "../../components";
import { formatDate, classNames } from "../../lib/utils";
import { parseISO, isPast, isToday } from "date-fns";
import styles from "./TaskCard.module.css";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue =
    task.dueDate &&
    isPast(parseISO(task.dueDate)) &&
    !isToday(parseISO(task.dueDate));

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={classNames(
        styles.taskCard,
        isDragging && styles.taskCardDragging,
      )}
      onClick={onClick}
    >
      <h3 className={styles.taskTitle}>{task.title}</h3>
      {task.description && (
        <p className={styles.taskDescription}>{task.description}</p>
      )}
      <div className={styles.taskMeta}>
        <span
          className={classNames(
            styles.priority,
            task.priority === "high" && styles.priorityHigh,
            task.priority === "medium" && styles.priorityMedium,
            task.priority === "low" && styles.priorityLow,
          )}
        >
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>

        {task.dueDate && (
          <span
            className={classNames(
              styles.dueDate,
              isOverdue && styles.dueDateOverdue,
            )}
          >
            <svg
              className={styles.dueDateIcon}
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="2" y="3" width="12" height="11" rx="1" />
              <path d="M5 1v4M11 1v4M2 7h12" />
            </svg>
            {formatDate(task.dueDate)}
          </span>
        )}

        {task.imageUrls.length > 0 && (
          <span className={styles.attachmentCount}>
            <svg
              className={styles.attachmentIcon}
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                d="M14 10v4a1 1 0 01-1 1H3a1 1 0 01-1-1v-4M11 5l-3-3-3 3M8 2v10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {task.imageUrls.length}
          </span>
        )}

        {task.tags.slice(0, 2).map((tag) => (
          <span key={tag} className={styles.tag}>
            {tag}
          </span>
        ))}
        {task.tags.length > 2 && (
          <span className={styles.tag}>+{task.tags.length - 2}</span>
        )}

        {task.assignee && (
          <div className={styles.assignee}>
            <Avatar
              src={task.assignee.photoURL}
              name={task.assignee.displayName}
              size="xs"
            />
          </div>
        )}
      </div>
    </div>
  );
}
