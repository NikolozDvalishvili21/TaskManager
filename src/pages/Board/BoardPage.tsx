import { useState, useEffect, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { motion } from "framer-motion";
import {
  Button,
  Input,
  Dropdown,
  EmptyState,
  LoadingContainer,
} from "../../components";
import { TaskCard } from "../../features/board/TaskCard";
import { CreateTaskModal } from "../../features/tasks/CreateTaskModal";
import { TaskDetailModal } from "../../features/tasks/TaskDetailModal";
import { EditTaskModal } from "../../features/tasks/EditTaskModal";
import { useAuthStore } from "../../features/auth/authStore";
import { useTasksStore } from "../../features/tasks/tasksStore";
import { useUIStore } from "../../features/board/uiStore";
import {
  subscribeToTasks,
  updateTaskStatus,
} from "../../features/tasks/taskService";
import { Task, TaskStatus, TaskPriority, COLUMNS } from "../../types";
import { classNames } from "../../lib/utils";
import styles from "./BoardPage.module.css";

interface ColumnDropzoneProps {
  id: TaskStatus;
  children: React.ReactNode;
}

function ColumnDropzone({ id, children }: ColumnDropzoneProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={classNames(styles.columnDropzone, isOver && styles.isOver)}
    >
      {children}
    </div>
  );
}

export function BoardPage() {
  const user = useAuthStore((state) => state.user);
  const {
    tasks,
    setTasks,
    selectedTaskId,
    isTaskModalOpen,
    isCreateModalOpen,
    filters,
    setSelectedTaskId,
    setTaskModalOpen,
    setCreateModalOpen,
    setSearchQuery,
    setPriorityFilter,
    setStatusFilter,
    getFilteredTasks,
    moveTask,
  } = useTasksStore();

  const addToast = useUIStore((state) => state.addToast);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [createStatus, setCreateStatus] = useState<TaskStatus>("todo");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (!user) return;

    setIsLoading(true);
    const unsubscribe = subscribeToTasks(user.uid, (newTasks) => {
      setTasks(newTasks);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, setTasks]);

  const filteredTasks = useMemo(() => getFilteredTasks(), [tasks, filters]);

  const tasksByColumn = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      testing: [],
      done: [],
    };

    filteredTasks.forEach((task) => {
      grouped[task.status].push(task);
    });

    return grouped;
  }, [filteredTasks]);

  const selectedTask = useMemo(
    () => tasks.find((t) => t.id === selectedTaskId) || null,
    [tasks, selectedTaskId],
  );

  const activeTask = useMemo(
    () => tasks.find((t) => t.id === activeTaskId) || null,
    [tasks, activeTaskId],
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTaskId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTaskId(null);

    if (!over || !user) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    moveTask(taskId, newStatus);

    try {
      await updateTaskStatus(user.uid, taskId, newStatus);
    } catch (error) {
      console.error("Failed to update task status:", error);
      addToast("Failed to move task", "error");
      moveTask(taskId, task.status);
    }
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setTaskModalOpen(true);
  };

  const handleAddTask = (status: TaskStatus) => {
    setCreateStatus(status);
    setCreateModalOpen(true);
  };

  const priorityOptions = [
    { value: "all", label: "All Priorities" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "todo", label: "To Do" },
    { value: "in_progress", label: "In Progress" },
    { value: "testing", label: "Testing" },
    { value: "done", label: "Done" },
  ];

  if (isLoading) {
    return <LoadingContainer size="lg" />;
  }

  return (
    <div className={styles.boardContainer}>
      <div className={styles.header}>
        <div className={styles.filters}>
          <Input
            className={styles.searchInput}
            placeholder="Search tasks..."
            value={filters.searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <circle cx="7" cy="7" r="5" />
                <path d="M14 14l-3.5-3.5" strokeLinecap="round" />
              </svg>
            }
          />
          <Dropdown
            options={priorityOptions}
            value={filters.priorityFilter}
            onChange={(v) => setPriorityFilter(v as TaskPriority | "all")}
          />
          <Dropdown
            options={statusOptions}
            value={filters.statusFilter}
            onChange={(v) => setStatusFilter(v as TaskStatus | "all")}
          />
        </div>
        <Button
          onClick={() => handleAddTask("todo")}
          leftIcon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M8 3v10M3 8h10" strokeLinecap="round" />
            </svg>
          }
        >
          New Task
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={styles.boardWrapper}>
          <div className={styles.board}>
            {COLUMNS.map((column) => (
              <motion.div
                key={column.id}
                className={styles.column}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className={styles.columnHeader}>
                  <div className={styles.columnTitle}>
                    <span
                      className={classNames(
                        styles.columnDot,
                        column.id === "todo" && styles.columnDotTodo,
                        column.id === "in_progress" &&
                          styles.columnDotInProgress,
                        column.id === "testing" && styles.columnDotTesting,
                        column.id === "done" && styles.columnDotDone,
                      )}
                    />
                    {column.title}
                    <span className={styles.columnCount}>
                      {tasksByColumn[column.id].length}
                    </span>
                  </div>
                </div>

                <div className={styles.columnContent}>
                  <SortableContext
                    items={tasksByColumn[column.id].map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <ColumnDropzone id={column.id}>
                      {tasksByColumn[column.id].length === 0 &&
                        filters.searchQuery === "" && (
                          <EmptyState
                            title="No tasks"
                            description={`Drag tasks here or create a new one`}
                          />
                        )}
                      {tasksByColumn[column.id].map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onClick={() => handleTaskClick(task.id)}
                        />
                      ))}
                    </ColumnDropzone>
                  </SortableContext>

                  <button
                    className={styles.addTaskButton}
                    onClick={() => handleAddTask(column.id)}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M7 2v10M2 7h10" strokeLinecap="round" />
                    </svg>
                    Add task
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} onClick={() => {}} />}
        </DragOverlay>
      </DndContext>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        defaultStatus={createStatus}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskModalOpen && !showEditModal}
        onClose={() => {
          setTaskModalOpen(false);
          setSelectedTaskId(null);
        }}
        onEdit={() => setShowEditModal(true)}
      />

      <EditTaskModal
        task={selectedTask}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </div>
  );
}
