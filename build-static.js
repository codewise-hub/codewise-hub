#!/usr/bin/env node

// Static build script for frontend-only deployment
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Building frontend-only version for static deployment...');

try {
  // Build only the frontend
  execSync('vite build --config vite.config.vercel.ts', {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  console.log('✅ Static build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}