
import { db } from './db';
import { users } from '../shared/schema';
import bcrypt from 'bcryptjs';

async function initDatabase() {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await db.insert(users).values({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    }).onConflictDoNothing();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initDatabase();
