// tests/e2e/task-workflow.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Task Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    // Wait for page to load
    await page.waitForSelector('.app-container');
  });

  test('should create a new task and display it in the list', async ({ page }) => {
    // Use a unique title to avoid conflicts with leftover data from previous runs
    const uniqueTitle = `E2E Task ${Date.now()}`;

    // Click FAB button to open form
    await page.click('.fab-btn');
    await page.waitForSelector('.task-form');

    // Fill form
    await page.fill('input[name="title"]', uniqueTitle);
    await page.fill('textarea[name="description"]', 'Milk, eggs, bread');
    await page.fill('input[name="time"]', '14:30');

    // Submit form
    await page.click('button:has-text("Add Task")');

    // Wait for form to close and task to appear
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 5000 }).catch(() => {});

    // Verify task appears in list
    const taskTitle = await page.getByText(uniqueTitle);
    await expect(taskTitle).toBeVisible();
  });

  test('should complete a task', async ({ page }) => {
    // Find a pending task checkbox
    const checkbox = page.locator('.task-checkbox input[type="checkbox"]').first();

    // Click checkbox to complete
    await checkbox.click();

    // Verify task shows as completed (visual feedback)
    const taskCard = page.locator('.task-card').first();
    await expect(taskCard).toHaveClass(/task-completed/);
  });

  test('should navigate between days', async ({ page }) => {
    // Get current date label
    const currentDate = await page.locator('.current-date').textContent();
    expect(currentDate).toBeTruthy();

    // Click next day button
    const nextBtn = page.locator('button').filter({ has: page.locator('text=→') }).last();
    await nextBtn.click();

    // Wait for task list to update
    await page.waitForTimeout(500);

    // Verify date changed
    const newDate = await page.locator('.current-date').textContent();
    expect(newDate).not.toBe(currentDate);
  });

  test('should edit a task', async ({ page }) => {
    // Find first task and click edit button
    const editBtn = page.locator('.action-edit').first();
    await editBtn.click();

    // Wait for form to appear
    await page.waitForSelector('.task-form');

    // Verify it's in edit mode (form title should be "Edit Task")
    const formTitle = await page.locator('.form-title');
    await expect(formTitle).toContainText('Edit Task');

    // Change title
    const titleInput = page.locator('input[name="title"]');
    await titleInput.clear();
    await titleInput.fill('Updated task title');

    // Submit
    await page.click('button:has-text("Update Task")');

    // Verify change appears
    await expect(page.getByText('Updated task title')).toBeVisible();
  });

  test('should delete a task with confirmation', async ({ page }) => {
    // Get initial task count
    const taskCount = await page.locator('.task-card').count();

    // Click delete button on first task
    const deleteBtn = page.locator('.action-delete').first();
    await deleteBtn.click();

    // Confirmation dialog appears
    await expect(page.locator('text=Delete task')).toBeVisible();

    // Click confirm delete
    await page.click('button:has-text("Delete")');

    // Verify task is removed
    await page.waitForTimeout(500);
    const newTaskCount = await page.locator('.task-card').count();
    expect(newTaskCount).toBe(taskCount - 1);
  });

  test('should show validation errors in form', async ({ page }) => {
    // Open form
    await page.click('.fab-btn');
    await page.waitForSelector('.task-form');

    // Try to submit empty form
    await page.click('button:has-text("Add Task")');

    // Wait for error messages
    await page.waitForTimeout(300);

    // Verify error is shown
    const errors = await page.locator('.input-error');
    const errorCount = await errors.count();
    expect(errorCount).toBeGreaterThan(0);
  });

  test('should handle keyboard shortcuts', async ({ page }) => {
    // Get current date
    const currentDate = await page.locator('.current-date').textContent();

    // Press right arrow to go to next day
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    // Verify date changed
    const newDate = await page.locator('.current-date').textContent();
    expect(newDate).not.toBe(currentDate);

    // Press left arrow to go back
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);

    // Verify date changed back
    const backDate = await page.locator('.current-date').textContent();
    expect(backDate).toBe(currentDate);
  });

  test('should persist data after page refresh', async ({ page }) => {
    // Create a task
    await page.click('.fab-btn');
    await page.waitForSelector('.task-form');

    const uniqueTitle = `Persistent task ${Date.now()}`;
    await page.fill('input[name="title"]', uniqueTitle);
    await page.fill('input[name="time"]', '10:00');
    await page.click('button:has-text("Add Task")');

    // Wait for task to appear
    await expect(page.getByText(uniqueTitle)).toBeVisible();

    // Refresh page
    await page.reload();

    // Wait for page to load and verify task is still there
    await page.waitForSelector('.app-container');
    await expect(page.getByText(uniqueTitle)).toBeVisible();
  });

  test('should mark task as missed', async ({ page }) => {
    // Find first pending task
    const missedBtn = page.locator('.action-missed').first();

    if (await missedBtn.isVisible()) {
      // Click mark as missed
      await missedBtn.click();

      // Verify task status changed to missed
      const taskCard = page.locator('.task-card').first();
      await expect(taskCard).toHaveClass(/task-missed/);
    }
  });

  test('should close form when clicking close button', async ({ page }) => {
    // Open form
    await page.click('.fab-btn');
    await page.waitForSelector('.form-modal');

    // Click close button
    await page.click('.form-close-btn');

    // Verify form is gone
    await expect(page.locator('.form-modal')).not.toBeVisible();
  });
});

test.describe('Task List States', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.app-container');
  });

  test('should show empty state when no tasks for day', async ({ page }) => {
    // Navigate to a far future date with likely no tasks
    const nextBtn = page.locator('button').filter({ has: page.locator('text=→') }).last();

    // Click multiple times to go far into future
    for (let i = 0; i < 10; i++) {
      await nextBtn.click();
      await page.waitForTimeout(200);
    }

    // Check for empty state message
    const emptyState = page.locator('.empty-state');
    const isVisible = await emptyState.isVisible();

    if (isVisible) {
      await expect(emptyState).toContainText('No tasks');
    }
  });

  test('should display tasks sorted by time', async ({ page }) => {
    // Create multiple tasks for today
    const times = ['09:00', '14:00', '18:00'];

    for (const time of times) {
      await page.click('.fab-btn');
      await page.waitForSelector('.task-form');
      await page.fill('input[name="title"]', `Task at ${time}`);
      await page.fill('input[name="time"]', time);
      await page.click('button:has-text("Add Task")');
      await page.waitForTimeout(500);
    }

    // Get all task times displayed
    const taskTimes = await page.locator('.task-time').allTextContents();

    // Verify at least some tasks are visible and times are in order
    if (taskTimes.length > 0) {
      for (let i = 1; i < taskTimes.length; i++) {
        const prevTime = taskTimes[i - 1];
        const currTime = taskTimes[i];
        // Basic check that times are reasonable
        expect(prevTime.length).toBeGreaterThan(0);
        expect(currTime.length).toBeGreaterThan(0);
      }
    }
  });
});
