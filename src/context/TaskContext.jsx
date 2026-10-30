import React, { createContext, useContext, useState, useMemo } from 'react';

const TaskContext = createContext(null);

export const DEFAULT_PRESET_TASKS = [
  {
    id: 'task-1',
    title: 'Algorithms Midterm Revision',
    duration: 3,
    deadline: 'Thursday 9:00 AM',
    priority: 'high',
    type: 'fixed', // 'fixed' | 'flexible'
    notes: 'Dynamic programming & graph theory proofs',
  },
  {
    id: 'task-2',
    title: 'Distributed Systems 12-Page Paper Draft',
    duration: 2.5,
    deadline: 'Friday 5:00 PM',
    priority: 'high',
    type: 'fixed',
    notes: 'Raft consensus benchmark results section',
  },
  {
    id: 'task-3',
    title: 'Club Frontend Web Project',
    duration: 1.5,
    deadline: 'Sunday 11:59 PM',
    priority: 'medium',
    type: 'flexible',
    notes: 'Navbar responsiveness and bug triage',
  },
  {
    id: 'task-4',
    title: 'Gym & Recovery Workout',
    duration: 1,
    deadline: 'Today 8:00 PM',
    priority: 'low',
    type: 'flexible',
    notes: 'Essential for cognitive decompression',
  },
];

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(DEFAULT_PRESET_TASKS);
  const [freeHours, setFreeHours] = useState(6);
  const [constraints, setConstraints] = useState('Need 7 hours of sleep. Workout is non-negotiable for mental health.');
  const [confirmationModal, setConfirmationModal] = useState(null);

  // Deterministic Calculations
  const stats = useMemo(() => {
    const totalPlanned = tasks.reduce((sum, t) => sum + (parseFloat(t.duration) || 0), 0);
    const available = parseFloat(freeHours) || 0;
    const balance = available - totalPlanned;
    const isOverloaded = balance < 0;
    const overloadHours = Math.abs(balance);
    const workloadPercentage = available > 0 ? Math.round((totalPlanned / available) * 100) : 100;

    const fixedHours = tasks.filter(t => t.type === 'fixed').reduce((s, t) => s + (parseFloat(t.duration) || 0), 0);
    const flexibleHours = tasks.filter(t => t.type === 'flexible').reduce((s, t) => s + (parseFloat(t.duration) || 0), 0);

    // High pressure tasks: fixed + high priority or large duration
    const highPressureTasks = tasks.filter(t => t.priority === 'high' || t.duration >= 2.5);

    // Upcoming deadlines
    const upcomingDeadlines = tasks
      .filter(t => Boolean(t.deadline))
      .map(t => ({ title: t.title, deadline: t.deadline, priority: t.priority }));

    return {
      totalPlanned: Number(totalPlanned.toFixed(1)),
      available: Number(available.toFixed(1)),
      balance: Number(balance.toFixed(1)),
      isOverloaded,
      overloadHours: Number(overloadHours.toFixed(1)),
      workloadPercentage,
      fixedHours: Number(fixedHours.toFixed(1)),
      flexibleHours: Number(flexibleHours.toFixed(1)),
      highPressureTasks,
      upcomingDeadlines,
    };
  }, [tasks, freeHours]);

  const addTask = (newTask) => {
    const task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: newTask.title || 'Untitled Task',
      duration: parseFloat(newTask.duration) || 1,
      deadline: newTask.deadline || '',
      priority: newTask.priority || 'medium',
      type: newTask.type || 'flexible',
      notes: newTask.notes || '',
    };
    setTasks(prev => [...prev, task]);
  };

  const updateTask = (id, updates) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const removeTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const setAllTasks = (newTasks) => {
    setTasks(newTasks);
  };

  const resetToDefault = () => {
    setTasks(DEFAULT_PRESET_TASKS);
    setFreeHours(6);
    setConstraints('Need 7 hours of sleep. Workout is non-negotiable for mental health.');
  };

  // Convert tasks to text format for structured prompts
  const tasksAsPromptText = useMemo(() => {
    return tasks
      .map(t => `${t.duration}h ${t.title} (${t.type}, ${t.priority} priority${t.deadline ? `, due ${t.deadline}` : ''})`)
      .join(', ');
  }, [tasks]);

  // Request user confirmation before applying a suggested schedule
  const requestScheduleApplication = (proposedSchedule, originFeature, callback) => {
    setConfirmationModal({
      isOpen: true,
      origin: originFeature, // e.g. 'Reality Check' or 'Emergency Replanner'
      proposedSchedule,
      onConfirm: () => {
        if (callback) callback();
        setConfirmationModal(null);
      },
      onCancel: () => {
        setConfirmationModal(null);
      },
    });
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        freeHours,
        constraints,
        stats,
        tasksAsPromptText,
        setTasks,
        setFreeHours,
        setConstraints,
        addTask,
        updateTask,
        removeTask,
        setAllTasks,
        resetToDefault,
        requestScheduleApplication,
        confirmationModal,
        closeConfirmationModal: () => setConfirmationModal(null),
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
