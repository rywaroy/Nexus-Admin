import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const collect = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? collect(target) : [target];
    }),
  );
  return files.flat().filter((file) => file.endsWith('.md'));
};
const documents = [
  path.join(root, 'development.md'),
  ...(await collect(path.join(root, 'devdocs'))),
];
const errors = [];
for (const document of documents) {
  const source = await readFile(document, 'utf8');
  for (const match of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].split('#')[0];
    if (!target || /^[a-z]+:/i.test(target)) continue;
    try {
      await access(path.resolve(path.dirname(document), target));
    } catch {
      errors.push(`${path.relative(root, document)}: ${target}`);
    }
  }
}
if (errors.length > 0)
  throw new Error(`开发文档链接失效：\n${errors.join('\n')}`);
console.log(`已检查 ${documents.length} 份开发文档的本地链接。`);
