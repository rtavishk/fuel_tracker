import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

// Load environment variables from .env.local first, then .env
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URL || '',
  },
});
