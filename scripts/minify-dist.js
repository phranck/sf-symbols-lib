#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { minify as terserMinify } from 'terser';
// Note: avoid heavy external CSS/JS obfuscation libs to keep install simple.

const DIST_DIR = path.resolve(process.cwd(), 'docs', 'dist');

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...await walk(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

async function minifyJs(filePath) {
  const source = await fs.readFile(filePath, 'utf8');
  try {
    const minified = await terserMinify(source, {
      compress: true,
      mangle: true,
      format: { comments: false }
    });
    const code = minified.code || source;
    await fs.writeFile(filePath, code, 'utf8');
    console.log('Minified JS:', path.relative(process.cwd(), filePath));
  } catch (err) {
    console.error('Failed to minify JS', filePath, err);
  }
}

async function minifyCss(filePath) {
  const source = await fs.readFile(filePath, 'utf8');
  try {
    // Simple CSS minifier (removes comments and unnecessary whitespace).
    const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, '');
    const collapsed = withoutComments.replace(/\s+/g, ' ').replace(/\s*([{}:;,])\s*/g, '$1').trim();
    await fs.writeFile(filePath, collapsed, 'utf8');
    console.log('Minified CSS:', path.relative(process.cwd(), filePath));
  } catch (err) {
    console.error('Failed to minify CSS', filePath, err);
  }
}

async function run() {
  try {
    const files = await walk(DIST_DIR);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (ext === '.js') {
        // skip already-minified vendor files (heuristic)
        if (file.endsWith('.min.js')) continue;
        await minifyJs(file);
      } else if (ext === '.css') {
        if (file.endsWith('.min.css')) continue;
        await minifyCss(file);
      }
    }
    console.log('\n✅ Minification complete.');
  } catch (err) {
    console.error('Minification failed', err);
    process.exitCode = 1;
  }
}

run();
