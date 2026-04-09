/**
 * Integration Tests - Task API workflow tests
 * Tests multiple endpoints working together
 */

const request = require('supertest');
const { app, db } = require('../../src/app');

afterAll(() => {
  if (db) {
    db.close();
  }
});

describe('Task API Integration Tests', () => {
  describe('Complete task workflow', () => {
    it('should create, update, and delete a task in sequence', async () => {
      // Step 1: Create a task
      const createRes = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Integration test task',
          description: 'Testing workflow',
          date: '2026-04-15',
          time: '10:00'
        });

      expect(createRes.status).toBe(201);
      const taskId = createRes.body.id;
      expect(createRes.body.title).toBe('Integration test task');

      // Step 2: Fetch the created task
      const fetchRes = await request(app).get(`/api/tasks/${taskId}`);
      expect(fetchRes.status).toBe(200);
      expect(fetchRes.body.id).toBe(taskId);

      // Step 3: Update the task
      const updateRes = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({
          status: 'completed',
          time: '11:00'
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.status).toBe('completed');
      expect(updateRes.body.time).toBe('11:00');

      // Step 4: Delete the task
      const deleteRes = await request(app).delete(`/api/tasks/${taskId}`);
      expect(deleteRes.status).toBe(200);

      // Step 5: Verify task is deleted
      const notFoundRes = await request(app).get(`/api/tasks/${taskId}`);
      expect(notFoundRes.status).toBe(404);
    });

    it('should handle day-based task retrieval and sorting', async () => {
      const testDate = '2026-04-20';

      // Create multiple tasks for the same day
      const task1Res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Morning task',
          date: testDate,
          time: '08:00'
        });

      const task2Res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Afternoon task',
          date: testDate,
          time: '14:00'
        });

      const task3Res = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Evening task',
          date: testDate,
          time: '18:00'
        });

      expect(task1Res.status).toBe(201);
      expect(task2Res.status).toBe(201);
      expect(task3Res.status).toBe(201);

      // Fetch all tasks for the day
      const listRes = await request(app).get(`/api/tasks?date=${testDate}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.length).toBeGreaterThanOrEqual(3);

      // Verify sorting by time
      const ourTasks = listRes.body.filter(t =>
        [task1Res.body.id, task2Res.body.id, task3Res.body.id].includes(t.id)
      );

      expect(ourTasks[0].time).toBe('08:00');
      expect(ourTasks[1].time).toBe('14:00');
      expect(ourTasks[2].time).toBe('18:00');
    });

    it('should handle status transitions correctly', async () => {
      // Create task with pending status
      const createRes = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Status test',
          date: '2026-04-21',
          time: '09:00',
          status: 'pending'
        });

      const taskId = createRes.body.id;
      expect(createRes.body.status).toBe('pending');

      // Transition to completed
      const completedRes = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ status: 'completed' });

      expect(completedRes.status).toBe(200);
      expect(completedRes.body.status).toBe('completed');

      // Transition to missed
      const missedRes = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ status: 'missed' });

      expect(missedRes.status).toBe(200);
      expect(missedRes.body.status).toBe('missed');

      // Back to pending
      const pendingRes = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({ status: 'pending' });

      expect(pendingRes.status).toBe(200);
      expect(pendingRes.body.status).toBe('pending');
    });

    it('should validate across multiple operations', async () => {
      // Attempt invalid creation
      const invalidCreateRes = await request(app)
        .post('/api/tasks')
        .send({
          title: '', // Invalid: empty title
          date: '2026-04-22',
          time: '10:00'
        });

      expect(invalidCreateRes.status).toBe(400);
      expect(invalidCreateRes.body.details).toHaveProperty('title');

      // Create valid task
      const validRes = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Valid task',
          date: '2026-04-22',
          time: '10:00'
        });

      expect(validRes.status).toBe(201);
      const taskId = validRes.body.id;

      // Attempt invalid update
      const invalidUpdateRes = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({
          status: 'invalid_status'
        });

      expect(invalidUpdateRes.status).toBe(400);
      expect(invalidUpdateRes.body.details).toHaveProperty('status');

      // Valid update should still work
      const validUpdateRes = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({
          title: 'Updated task'
        });

      expect(validUpdateRes.status).toBe(200);
      expect(validUpdateRes.body.title).toBe('Updated task');
    });
  });

  describe('Error recovery workflows', () => {
    it('should handle partial updates with validation', async () => {
      // Create task
      const createRes = await request(app)
        .post('/api/tasks')
        .send({
          title: 'Recovery test',
          date: '2026-04-23',
          time: '12:00',
          description: 'Original description'
        });

      const taskId = createRes.body.id;

      // Attempt update with invalid time
      const invalidRes = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({
          time: '25:00' // Invalid
        });

      expect(invalidRes.status).toBe(400);

      // Verify original task unchanged
      const fetchRes = await request(app).get(`/api/tasks/${taskId}`);
      expect(fetchRes.body.time).toBe('12:00');
      expect(fetchRes.body.description).toBe('Original description');

      // Successful partial update
      const validRes = await request(app)
        .put(`/api/tasks/${taskId}`)
        .send({
          description: 'Updated description'
        });

      expect(validRes.status).toBe(200);
      expect(validRes.body.description).toBe('Updated description');
      expect(validRes.body.time).toBe('12:00'); // Unchanged
    });
  });
});
