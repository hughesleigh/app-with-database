import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'dashboard.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS panels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  panel_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(panel_id) REFERENCES panels(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
);
`);

const panelCount = db.prepare('SELECT COUNT(*) AS count FROM panels').get().count;
if (panelCount === 0) {
  const createPanel = db.prepare('INSERT INTO panels (name, position) VALUES (?, ?)');
  createPanel.run('Work', 0);
  createPanel.run('Personal', 1);
}

function getActivePanelId(requestedPanelId) {
  const allPanels = db.prepare('SELECT id FROM panels ORDER BY position ASC, id ASC').all();
  if (allPanels.length === 0) return null;
  const parsed = Number(requestedPanelId);
  if (Number.isInteger(parsed) && allPanels.some((panel) => panel.id === parsed)) return parsed;
  return allPanels[0].id;
}

export function getDashboardData(requestedPanelId) {
  const panels = db.prepare('SELECT id, name, position FROM panels ORDER BY position ASC, id ASC').all();
  const activePanelId = getActivePanelId(requestedPanelId);

  const categories = activePanelId
    ? db
        .prepare('SELECT id, panel_id, name, position FROM categories WHERE panel_id = ? ORDER BY position ASC, id ASC')
        .all(activePanelId)
    : [];

  const links = activePanelId
    ? db
        .prepare(
          `SELECT id, category_id, name, url, COALESCE(description, '') AS description, position
           FROM links
           WHERE category_id IN (SELECT id FROM categories WHERE panel_id = ?)
           ORDER BY position ASC, id ASC`
        )
        .all(activePanelId)
    : [];

  const linksByCategory = new Map();
  for (const category of categories) {
    linksByCategory.set(category.id, []);
  }
  for (const link of links) {
    if (!linksByCategory.has(link.category_id)) linksByCategory.set(link.category_id, []);
    linksByCategory.get(link.category_id).push(link);
  }

  return {
    panels,
    activePanelId,
    categories: categories.map((category) => ({ ...category, links: linksByCategory.get(category.id) ?? [] }))
  };
}

export function createPanel(name) {
  const position = db.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS next FROM panels').get().next;
  db.prepare('INSERT INTO panels (name, position) VALUES (?, ?)').run(name, position);
}

export function deletePanel(panelId) {
  db.prepare('DELETE FROM panels WHERE id = ?').run(panelId);
}

export function createCategory(panelId, name) {
  const position = db
    .prepare('SELECT COALESCE(MAX(position), -1) + 1 AS next FROM categories WHERE panel_id = ?')
    .get(panelId).next;
  db.prepare('INSERT INTO categories (panel_id, name, position) VALUES (?, ?, ?)').run(panelId, name, position);
}

export function deleteCategory(categoryId) {
  db.prepare('DELETE FROM categories WHERE id = ?').run(categoryId);
}

export function createLink(categoryId, name, url, description = '') {
  const position = db
    .prepare('SELECT COALESCE(MAX(position), -1) + 1 AS next FROM links WHERE category_id = ?')
    .get(categoryId).next;
  db.prepare('INSERT INTO links (category_id, name, url, description, position) VALUES (?, ?, ?, ?, ?)').run(
    categoryId,
    name,
    url,
    description,
    position
  );
}

export function updateLink(id, categoryId, name, url, description = '') {
  db.prepare('UPDATE links SET category_id = ?, name = ?, url = ?, description = ? WHERE id = ?').run(
    categoryId,
    name,
    url,
    description,
    id
  );
}

export function deleteLink(id) {
  db.prepare('DELETE FROM links WHERE id = ?').run(id);
}

export function reorderCategories(panelId, orderedIds) {
  const update = db.prepare('UPDATE categories SET position = ? WHERE id = ? AND panel_id = ?');
  const txn = db.transaction(() => {
    orderedIds.forEach((id, index) => update.run(index, id, panelId));
  });
  txn();
}

export function reorderLinks(categoryId, orderedIds) {
  const update = db.prepare('UPDATE links SET position = ?, category_id = ? WHERE id = ?');
  const txn = db.transaction(() => {
    orderedIds.forEach((id, index) => update.run(index, categoryId, id));
  });
  txn();
}

export function findLink(id) {
  return db.prepare('SELECT id, category_id, name, url, COALESCE(description, "") AS description FROM links WHERE id = ?').get(id);
}

export function moveLink(id, targetCategoryId, position) {
  db.prepare('UPDATE links SET category_id = ?, position = ? WHERE id = ?').run(targetCategoryId, position, id);
}

export function getLinkForEdit(id) {
  const link = db
    .prepare(
      `SELECT l.id, l.name, l.url, COALESCE(l.description, '') AS description, l.category_id, c.panel_id
       FROM links l
       JOIN categories c ON c.id = l.category_id
       WHERE l.id = ?`
    )
    .get(id);
  if (!link) return null;
  const categories = db
    .prepare('SELECT id, name FROM categories WHERE panel_id = ? ORDER BY position ASC, id ASC')
    .all(link.panel_id);
  return { link, categories };
}
