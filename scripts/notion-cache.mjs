import fs from 'node:fs/promises';
export async function loadCache(path, now = Date.now()) {
  let entries = {};
  try { const value = JSON.parse(await fs.readFile(path, 'utf8')); if (value.version === 1) entries = value.entries || {}; } catch {}
  return {
    get(page, field) { const entry = entries[page.id]; return entry?.updated === page.last_edited_time && now - entry.checkedAt < 6 * 3600000 ? entry[field] : undefined; },
    set(page, field, value) { const prior = entries[page.id]; const reusable = prior?.updated === page.last_edited_time && now - prior.checkedAt < 6 * 3600000; entries[page.id] = { ...(reusable ? prior : {}), updated: page.last_edited_time, checkedAt: reusable ? prior.checkedAt : now, [field]: value }; },
    async save(pages) { const ids = new Set(pages.map(page => page.id)); await fs.mkdir(new URL('.', path), { recursive: true }); await fs.writeFile(path, JSON.stringify({ version: 1, entries: Object.fromEntries(Object.entries(entries).filter(([id]) => ids.has(id))) })); }
  };
}
