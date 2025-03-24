// src/db.js
import Dexie from 'dexie';

// Create (or open) a database
const db = new Dexie('ChatDatabase');

// Define a schema for a "messages" table.
// Here, "++id" is an auto-incrementing primary key.
db.version(1).stores({
  messages: '++id, sender, text, timestamp, attachment'
});

export default db;
