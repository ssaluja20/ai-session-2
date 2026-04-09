const request = require('supertest');
const { app, db } = require('../src/app');

// Test helpers
const createTask = async (taskData = {}) => {
  const defaultTask = {
    title: 'Test Task',
    description: 'Test Description',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    status: 'pending'
  };

  const response = await request(app)
    .post('/api/tasks')
    .send({ ...defaultTask, ...taskData })
    .set('Accept', 'application/json');

  expect(response.status).toBe(201);
  expect(response.body).toHaveProperty('id');
  return response.body;
};

describe('Tasks API - GET /api/tasks', () => {
  it('should return all tasks when no date specified', async () => {
    const response = await request(app).get('/api/tasks');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);

    // Check task structure
    const task = response.body[0];
    expect(task).toHaveProperty('id');
    expect(task).toHaveProperty('title');
    expect(task).toHaveProperty('description');
    expect(task).toHaveProperty('date');
    expect(task).toHaveProperty('time');
    expect(task).toHaveProperty('status');
  });

  it('should return tasks for a specific date, sorted by time', async () => {
    const today = new Date().toISOString().split('T')[0];

    const response = await request(app).get(`/api/tasks?date=${today}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    // Verify all tasks are for the specified date
    response.body.forEach(task => {
      expect(task.date).toBe(today);
    });

    // Verify tasks are sorted by time
    for (let i = 1; i < response.body.length; i++) {
      expect(response.body[i].time >= response.body[i - 1].time).toBe(true);
    }
  });

  it('should return empty array for date with no tasks', async () => {
    const futureDate = new Date(Date.now() + 86400000 * 365); // 1 year in future
    const dateStr = futureDate.toISOString().split('T')[0];

    const response = await request(app).get(`/api/tasks?date=${dateStr}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(0);
  });
});

describe('Tasks API - GET /api/tasks/:id', () => {
  it('should return a single task by ID', async () => {
    const createdTask = await createTask();

    const response = await request(app).get(`/api/tasks/${createdTask.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', createdTask.id);
    expect(response.body).toHaveProperty('title');
    expect(response.body).toHaveProperty('date');
    expect(response.body).toHaveProperty('time');
  });

  it('should return 404 for non-existent task', async () => {
    const response = await request(app).get('/api/tasks/999999');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Task not found');
  });

  it('should return 400 for invalid task ID', async () => {
    const response = await request(app).get('/api/tasks/abc');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});

describe('Tasks API - POST /api/tasks', () => {
  it('should create a new task with all fields', async () => {
    const taskData = {
      title: 'Complete project',
      description: 'Finish the TODO app',
      date: '2026-04-15',
      time: '14:30',
      status: 'pending'
    };

    const response = await request(app)
      .post('/api/tasks')
      .send(taskData)
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe(taskData.title);
    expect(response.body.description).toBe(taskData.description);
    expect(response.body.date).toBe(taskData.date);
    expect(response.body.time).toBe(taskData.time);
    expect(response.body.status).toBe(taskData.status);
  });

  it('should create task with default status if not provided', async () => {
    const taskData = {
      title: 'Simple task',
      date: '2026-04-15',
      time: '10:00'
    };

    const response = await request(app)
      .post('/api/tasks')
      .send(taskData)
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('pending');
  });

  it('should create task with empty description', async () => {
    const taskData = {
      title: 'Task without description',
      date: '2026-04-15',
      time: '10:00'
    };

    const response = await request(app)
      .post('/api/tasks')
      .send(taskData)
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);
    expect(response.body.description).toBe('');
  });

  describe('Validation Errors', () => {
    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          date: '2026-04-15',
          time: '10:00'
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('details');
      expect(response.body.details).toHaveProperty('title');
    });

    it('should return 400 if date is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test',
          time: '10:00'
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.details).toHaveProperty('date');
    });

    it('should return 400 if time is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test',
          date: '2026-04-15'
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.details).toHaveProperty('time');
    });

    it('should return 400 for invalid date format', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test',
          date: '04/15/2026',
          time: '10:00'
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.details).toHaveProperty('date');
    });

    it('should return 400 for invalid time format', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test',
          date: '2026-04-15',
          time: '25:00'
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.details).toHaveProperty('time');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Test',
          date: '2026-04-15',
          time: '10:00',
          status: 'invalid'
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.details).toHaveProperty('status');
    });

    it('should return 400 for empty title', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: '',
          date: '2026-04-15',
          time: '10:00'
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.details).toHaveProperty('title');
    });

    it('should return 400 for title exceeding max length', async () => {
      const longTitle = 'a'.repeat(256);
      const response = await request(app)
        .post('/api/tasks')
        .send({
          title: longTitle,
          date: '2026-04-15',
          time: '10:00'
        })
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.details).toHaveProperty('title');
    });
  });
});

describe('Tasks API - PUT /api/tasks/:id', () => {
  it('should update task title', async () => {
    const task = await createTask();

    const response = await request(app)
      .put(`/api/tasks/${task.id}`)
      .send({ title: 'Updated Title' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Updated Title');
    expect(response.body.id).toBe(task.id);
  });

  it('should update task status', async () => {
    const task = await createTask();

    const response = await request(app)
      .put(`/api/tasks/${task.id}`)
      .send({ status: 'completed' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('completed');
  });

  it('should update multiple fields', async () => {
    const task = await createTask();

    const response = await request(app)
      .put(`/api/tasks/${task.id}`)
      .send({
        title: 'New Title',
        time: '15:00',
        status: 'missed'
      })
      .set('Accept', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.title).toBe('New Title');
    expect(response.body.time).toBe('15:00');
    expect(response.body.status).toBe('missed');
  });

  it('should return 404 for non-existent task', async () => {
    const response = await request(app)
      .put('/api/tasks/999999')
      .send({ title: 'Updated' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Task not found');
  });

  it('should return 400 for invalid task ID', async () => {
    const response = await request(app)
      .put('/api/tasks/abc')
      .send({ title: 'Updated' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 for invalid status in update', async () => {
    const task = await createTask();

    const response = await request(app)
      .put(`/api/tasks/${task.id}`)
      .send({ status: 'invalid' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(400);
    expect(response.body.details).toHaveProperty('status');
  });

  it('should return 400 for invalid time in update', async () => {
    const task = await createTask();

    const response = await request(app)
      .put(`/api/tasks/${task.id}`)
      .send({ time: '25:00' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(400);
    expect(response.body.details).toHaveProperty('time');
  });
});

describe('Tasks API - DELETE /api/tasks/:id', () => {
  it('should delete an existing task', async () => {
    const task = await createTask();

    const response = await request(app).delete(`/api/tasks/${task.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Task deleted successfully', id: task.id });

    // Verify task is gone
    const getResponse = await request(app).get(`/api/tasks/${task.id}`);
    expect(getResponse.status).toBe(404);
  });

  it('should return 404 when task does not exist', async () => {
    const response = await request(app).delete('/api/tasks/999999');

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error', 'Task not found');
  });

  it('should return 400 for invalid task ID', async () => {
    const response = await request(app).delete('/api/tasks/abc');

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});

describe('Backward Compatibility - Legacy Items API', () => {
  it('should return items from legacy GET /api/items endpoint', async () => {
    const response = await request(app).get('/api/items');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);

    // Check legacy format
    const item = response.body[0];
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('created_at');
  });

  it('should create items via legacy POST /api/items endpoint', async () => {
    const response = await request(app)
      .post('/api/items')
      .send({ name: 'Legacy Item' })
      .set('Accept', 'application/json');

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('Legacy Item');
  });

  it('should delete items via legacy DELETE /api/items endpoint', async () => {
    // Create via legacy endpoint
    const createResponse = await request(app)
      .post('/api/items')
      .send({ name: 'Item to Delete' })
      .set('Accept', 'application/json');

    const itemId = createResponse.body.id;

    // Delete via legacy endpoint
    const deleteResponse = await request(app).delete(`/api/items/${itemId}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toEqual({
      message: 'Item deleted successfully',
      id: itemId
    });
  });
});
