import dotenv from 'dotenv';
import path from 'path';
import { defineConfig } from 'prisma/config';

// Load .env and .env.local files
dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fuel_tracker',
  },
});
