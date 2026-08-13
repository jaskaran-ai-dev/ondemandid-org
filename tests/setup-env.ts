// Runs before every test file module graph is evaluated, so modules that
// capture env at import time (lib/db, lib/ivalt) see the right values.
process.env.IVALT_API_KEY = process.env.IVALT_API_KEY || 'test-key';
process.env.DB_TYPE = 'sqlite';
process.env.SQLITE_DB_PATH = ':memory:';
