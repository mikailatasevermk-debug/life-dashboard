#!/usr/bin/env node

/**
 * Hook Anti-Pattern Detector
 * Scans for common React hooks violations that cause error #310
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const HOOK_PATTERNS = [
  /use[A-Z]\w*\(/g, // Hook calls
];

const VIOLATION_PATTERNS = [
  {
    pattern: /if\s*\([^)]*\)\s*\{[^}]*\buse[A-Z]\w*\s*\(/g,
    description: 'Hook called inside if statement',
    filter: (match) => {
      // Filter out false positives - ensure it's actually a hook call, not just a word containing "use"
      return /\buse[A-Z]\w*\s*\(/.test(match) && !/\w+use[A-Z]/.test(match);
    }
  },
  {
    pattern: /for\s*\([^)]*\)\s*\{[^}]*\buse[A-Z]\w*\s*\(/g,
    description: 'Hook called inside for loop',
    filter: (match) => /\buse[A-Z]\w*\s*\(/.test(match) && !/\w+use[A-Z]/.test(match)
  },
  {
    pattern: /while\s*\([^)]*\)\s*\{[^}]*\buse[A-Z]\w*\s*\(/g,
    description: 'Hook called inside while loop',
    filter: (match) => /\buse[A-Z]\w*\s*\(/.test(match) && !/\w+use[A-Z]/.test(match)
  },
  {
    pattern: /return\s+[^;]*;\s*\/\/.*\n.*\buse[A-Z]\w*\s*\(/g,
    description: 'Hook called after early return',
    filter: (match) => /\buse[A-Z]\w*\s*\(/.test(match) && !/\w+use[A-Z]/.test(match)
  }
];

async function scanFiles() {
  const files = await glob('**/*.{tsx,ts,jsx,js}', {
    ignore: ['node_modules/**', '.next/**', 'dist/**', 'build/**']
  });

  let violationsFound = 0;

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    
    for (const { pattern, description, filter } of VIOLATION_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        const validMatches = filter ? matches.filter(filter) : matches;
        if (validMatches.length > 0) {
          console.log(`❌ ${file}: ${description}`);
          validMatches.forEach(match => {
            console.log(`   ${match.trim()}`);
          });
          violationsFound++;
        }
      }
    }
  }

  if (violationsFound === 0) {
    console.log('✅ No hook violations detected');
  } else {
    console.log(`\n❌ Found ${violationsFound} potential hook violations`);
    process.exit(1);
  }
}

scanFiles().catch(console.error);