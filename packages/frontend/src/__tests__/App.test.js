import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

const todayTasks = [
  {
    id: 1,
    title: 'Morning standup',
    description: 'Team sync meeting',
    date: '2026-04-09',
    time: '09:00',
    status: 'pending',
    created_at: '2026-04-09T08:00:00Z',
    updated_at: '2026-04-09T08:00:00Z',
  },
  {
    id: 2,
    title: 'Code review',
    description: 'Review PRs',
    date: '2026-04-09',
    time: '14:00',
    status: 'pending',
    created_at: '2026-04-09T08:00:00Z',
    updated_at: '2026-04-09T08:00:00Z',
  },
];

// Mock server to intercept API requests
const server = setupServer(
  // GET /api/tasks?date=... handler
  rest.get('http://localhost:3030/api/tasks', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(todayTasks));
  }),

  // POST /api/tasks handler
  rest.post('http://localhost:3030/api/tasks', async (req, res, ctx) => {
    const body = await req.json();
    return res(
      ctx.status(201),
      ctx.json({
        id: 3,
        title: body.title,
        description: body.description || '',
        date: body.date,
        time: body.time,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    );
  })
);

// Setup and teardown for the mock server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component', () => {
  test('renders the header', async () => {
    await act(async () => {
      render(<App />);
    });
    expect(screen.getByText('📋 Daily Tasks')).toBeInTheDocument();
    expect(screen.getByText('Organize your day, one task at a time')).toBeInTheDocument();
  });

  test('loads and displays tasks', async () => {
    await act(async () => {
      render(<App />);
    });

    // Initially shows loading state
    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();

    // Wait for tasks to load
    await waitFor(() => {
      expect(screen.getByText('Morning standup')).toBeInTheDocument();
      expect(screen.getByText('Code review')).toBeInTheDocument();
    });
  });

  test('adds a new task', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<App />);
    });

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading tasks...')).not.toBeInTheDocument();
    });

    // Open the add task form via FAB
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /add new task/i }));
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter task title...')).toBeInTheDocument();
    });

    // Fill in the title
    await act(async () => {
      await user.type(screen.getByPlaceholderText('Enter task title...'), 'Buy groceries');
    });

    // Submit the form
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /add task/i }));
    });

    // Verify the new task appears
    await waitFor(() => {
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });
  });

  test('handles API error', async () => {
    // Override the default handler to simulate an error
    server.use(
      rest.get('http://localhost:3030/api/tasks', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Internal server error' }));
      })
    );

    await act(async () => {
      render(<App />);
    });

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Failed to Load Tasks')).toBeInTheDocument();
    });
  });

  test('shows empty state when no tasks', async () => {
    // Override to return empty array
    server.use(
      rest.get('http://localhost:3030/api/tasks', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );

    await act(async () => {
      render(<App />);
    });

    // Wait for empty state message
    await waitFor(() => {
      expect(screen.getByText('No tasks for today')).toBeInTheDocument();
    });
  });
});