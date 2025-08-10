#!/usr/bin/env node
// exclude.js
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Check if we're receiving input from stdin
const isReceivingInput = !process.stdin.isTTY;

// Display help if no input is passed
if (!isReceivingInput) {
  console.log(`
  ╭───────────────────────────────────────────────────╮
  │                   exclude.js                      │
  ╰───────────────────────────────────────────────────╯
  
  A filter utility that excludes file paths based on patterns in .sumignore

  USAGE:
    fd '\\.(ts|svelte)$' --type f | exclude.js | rsum > summary.md
    
  DESCRIPTION:
    This script reads file paths from stdin, filters out those matching
    patterns in .sumignore, and outputs the remaining paths to stdout.
    
  .sumignore FORMAT:
    # Comments start with #
    node_modules/     # Exclude node_modules directory
    *.test.*          # Exclude test files
    *.spec.*          # Exclude spec files
    
  If .sumignore doesn't exist, no files will be excluded.
  `);
  process.exit(0);
}
// Get current directory in ESM context
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load ignore patterns from .sumignore
function loadIgnorePatterns() {
  const ignorePath = path.resolve(process.cwd(), '.sumignore');

  if (!fs.existsSync(ignorePath)) {
    return [];
  }

  return fs.readFileSync(ignorePath, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
}

// Check if a file path should be ignored
function shouldIgnore(filePath, patterns) {
  return patterns.some(pattern => {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');

    const regex = new RegExp(regexPattern);
    return regex.test(filePath);
  });
}

// Main function
async function main() {
  const ignorePatterns = loadIgnorePatterns();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  for await (const line of rl) {
    if (!shouldIgnore(line, ignorePatterns)) {
      console.log(line);
    }
  }
}

main().catch(console.error);
