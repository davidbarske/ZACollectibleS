import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const pages = (await readdir(root)).filter(name => name.endsWith('.html'));
const missing = [];

for (const page of pages) {
  const source = await readFile(join(root, page), 'utf8');
  for (const match of source.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    const target = match[1].split('#')[0].split('?')[0];
    if (!target || /^(?:https?:|mailto:|tel:|data:)/.test(target)) continue;
    try {
      await access(join(root, target));
    } catch {
      missing.push(`${page} -> ${target}`);
    }
  }
}

if (missing.length > 0) {
  console.error(missing.join('\n'));
  process.exit(1);
}

console.log(`Validated ${pages.length} HTML pages with no missing local references.`);
