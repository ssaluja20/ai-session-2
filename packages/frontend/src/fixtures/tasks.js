/**
 * Test fixtures - Sample task data for testing and development
 */

export const mockTasks = [
  {
    id: 1,
    title: 'Morning standup',
    description: 'Team sync meeting',
    date: '2026-04-09',
    time: '09:00',
    status: 'completed',
    created_at: '2026-04-09T08:00:00Z',
    updated_at: '2026-04-09T09:30:00Z'
  },
  {
    id: 2,
    title: 'Code review',
    description: 'Review pull requests from the team',
    date: '2026-04-09',
    time: '14:00',
    status: 'pending',
    created_at: '2026-04-09T08:00:00Z',
    updated_at: '2026-04-09T08:00:00Z'
  },
  {
    id: 3,
    title: 'Update documentation',
    description: 'Update README and API docs',
    date: '2026-04-09',
    time: '15:30',
    status: 'pending',
    created_at: '2026-04-09T08:00:00Z',
    updated_at: '2026-04-09T08:00:00Z'
  },
  {
    id: 4,
    title: 'Project planning',
    description: 'Plan next sprint tasks and roadmap',
    date: '2026-04-10',
    time: '10:00',
    status: 'pending',
    created_at: '2026-04-09T08:00:00Z',
    updated_at: '2026-04-09T08:00:00Z'
  },
  {
    id: 5,
    title: 'Team retrospective',
    description: '',
    date: '2026-04-11',
    time: '16:00',
    status: 'pending',
    created_at: '2026-04-09T08:00:00Z',
    updated_at: '2026-04-09T08:00:00Z'
  }
];

export const mockTasksByDate = {
  '2026-04-09': mockTasks.slice(0, 3),
  '2026-04-10': mockTasks.slice(3, 4),
  '2026-04-11': mockTasks.slice(4, 5)
};

export const singleTask = mockTasks[0];

export const newTaskFormData = {
  title: 'New test task',
  description: 'This is a test task',
  date: '2026-04-12',
  time: '10:00',
  status: 'pending'
};
