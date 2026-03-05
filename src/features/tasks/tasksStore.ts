import { create } from "zustand";
import { Task, TaskStatus, TaskPriority } from "../../types";

interface FilterState {
  searchQuery: string;
  priorityFilter: TaskPriority | "all";
  statusFilter: TaskStatus | "all";
  sortBy: "dueDate" | "priority" | "createdAt";
  sortOrder: "asc" | "desc";
}

interface TasksState {
  tasks: Task[];
  selectedTaskId: string | null;
  isTaskModalOpen: boolean;
  isCreateModalOpen: boolean;
  filters: FilterState;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  setSelectedTaskId: (taskId: string | null) => void;
  setTaskModalOpen: (isOpen: boolean) => void;
  setCreateModalOpen: (isOpen: boolean) => void;
  setSearchQuery: (query: string) => void;
  setPriorityFilter: (priority: TaskPriority | "all") => void;
  setStatusFilter: (status: TaskStatus | "all") => void;
  setSortBy: (sortBy: "dueDate" | "priority" | "createdAt") => void;
  setSortOrder: (order: "asc" | "desc") => void;
  getFilteredTasks: () => Task[];
}

const priorityOrder: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  selectedTaskId: null,
  isTaskModalOpen: false,
  isCreateModalOpen: false,
  filters: {
    searchQuery: "",
    priorityFilter: "all",
    statusFilter: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  },

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),

  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task,
      ),
    })),

  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
      selectedTaskId:
        state.selectedTaskId === taskId ? null : state.selectedTaskId,
      isTaskModalOpen:
        state.selectedTaskId === taskId ? false : state.isTaskModalOpen,
    })),

  moveTask: (taskId, newStatus) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
          : task,
      ),
    })),

  setSelectedTaskId: (taskId) => set({ selectedTaskId: taskId }),

  setTaskModalOpen: (isOpen) => set({ isTaskModalOpen: isOpen }),

  setCreateModalOpen: (isOpen) => set({ isCreateModalOpen: isOpen }),

  setSearchQuery: (query) =>
    set((state) => ({ filters: { ...state.filters, searchQuery: query } })),

  setPriorityFilter: (priority) =>
    set((state) => ({
      filters: { ...state.filters, priorityFilter: priority },
    })),

  setStatusFilter: (status) =>
    set((state) => ({ filters: { ...state.filters, statusFilter: status } })),

  setSortBy: (sortBy) =>
    set((state) => ({ filters: { ...state.filters, sortBy } })),

  setSortOrder: (order) =>
    set((state) => ({ filters: { ...state.filters, sortOrder: order } })),

  getFilteredTasks: () => {
    const state = get();
    const { tasks, filters } = state;

    let filtered = [...tasks];

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query),
      );
    }

    // Apply priority filter
    if (filters.priorityFilter !== "all") {
      filtered = filtered.filter(
        (task) => task.priority === filters.priorityFilter,
      );
    }

    // Apply status filter
    if (filters.statusFilter !== "all") {
      filtered = filtered.filter(
        (task) => task.status === filters.statusFilter,
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case "dueDate":
          if (!a.dueDate && !b.dueDate) comparison = 0;
          else if (!a.dueDate) comparison = 1;
          else if (!b.dueDate) comparison = -1;
          else
            comparison =
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
        case "priority":
          comparison = priorityOrder[b.priority] - priorityOrder[a.priority];
          break;
        case "createdAt":
          comparison =
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
      }

      return filters.sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  },
}));
