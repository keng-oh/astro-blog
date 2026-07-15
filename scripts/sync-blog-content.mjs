#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import matter from 'gray-matter';

const [, , vaultBlogDir, destDir] = process.argv;

if (!vaultBlogDir || !destDir) {
  console.error('Usage: node sync-blog-content.mjs <vaultBlogDir> <destDir>');
  process.exit(1);
}

mkdirSync(destDir, { recursive: true });

for (const file of readdirSync(destDir)) {
  if (file.endsWith('.md')) {
    unlinkSync(join(destDir, file));
  }
}

const vaultFiles = readdirSync(vaultBlogDir).filter((file) => file.endsWith('.md'));

let syncedCount = 0;
for (const file of vaultFiles) {
  const raw = readFileSync(join(vaultBlogDir, file), 'utf-8');
  const { data } = matter(raw);

  if (data.status !== 'active') continue;

  writeFileSync(join(destDir, file), raw);
  syncedCount += 1;
}

console.log(`Synced ${syncedCount} active post(s) from ${vaultFiles.length} note(s) in ${vaultBlogDir}.`);
