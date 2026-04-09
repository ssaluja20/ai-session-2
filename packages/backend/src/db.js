const Database = require('better-sqlite3');

/**
 * Initialize the in-memory SQLite database with tables and indexes
 * @returns {Database.Database} Database instance
 */
function initializeDatabase() {
  const db = new Database(':memory:');

  // Create tasks table with rich task model
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'missed')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for common queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_date_time ON tasks(date, time);
  `);

  console.log('Database initialized with tasks table');

  return db;
}

/**
 * Seed initial data for development/testing
 * @param {Database.Database} db - Database instance
 */
function seedInitialData(db) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const initialTasks = [
    {
      title: 'Morning standup',
      description: 'Team sync meeting',
      date: today,
      time: '09:00',
      status: 'pending'
    },
    {
      title: 'Review pull requests',
      description: 'Check and review pending PRs',
      date: today,
      time: '14:30',
      status: 'pending'
    },
    {
      title: 'Update documentation',
      description: 'Update README and API docs',
      date: today,
      time: '15:00',
      status: 'completed'
    },
    {
      title: 'Project planning',
      description: 'Plan next sprint tasks',
      date: tomorrow,
      time: '10:00',
      status: 'pending'
    },
    {
      title: 'Code review',
      description: 'Review backend code',
      date: tomorrow,
      time: '13:00',
      status: 'pending'
    }
  ];

  const insertStmt = db.prepare(`
    INSERT INTO tasks (title, description, date, time, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  initialTasks.forEach(task => {
    insertStmt.run(task.title, task.description, task.date, task.time, task.status);
  });

  console.log(`Seeded ${initialTasks.length} initial tasks`);
}

module.exports = {
  initializeDatabase,
  seedInitialData
};
