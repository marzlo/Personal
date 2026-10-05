import fs from "node:fs/promises";

const token = process.env.NOTION_TOKEN;
if (!token) throw new Error("Missing required GitHub secret: NOTION_TOKEN");

const apiVersion = "2026-03-11";
const site = "https://pickle-trail-279.notion.site";
const sources = {
  books: { id: "d80caf93-f7f2-4eec-8fe1-fc8c55550984", url: site + "/f8293e8197f74b8ea5004f994c545a84?v=6a1c05f3f1324d2c9b44c6f8d12c92a2" },
  podcasts: { id: "8713b45c-2125-4f12-a10f-c052ff90f17f", url: site + "/4c2a14bf42bc4f139d4bf279f36d2c3b?v=8dc4e593879445558c70b1dd1127fe14" },
  quotes: { id: "d4a879f2-d0a8-4c16-aafc-9134bec7b86d", url: site + "/c3db8f32feec4a82bf849c87322223d5?v=3ccf6701328e4e36aa30106ef41257be" }
};
const authorOverrides = JSON.parse(await fs.readFile(new URL("./book-author-overrides.json", import.meta.url), "utf8"));
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let nextRequestAt = 0;

async function request(path, options = {}) {
  for (let attempt = 0; attempt < 7; attempt++) {
    const now = Date.now();
    if (now < nextRequestAt) await wait(nextRequestAt - now);
    nextRequestAt = Date.now() + 350;
    const response = await fetch("https://api.notion.com/v1/" + path, {
      ...options,
      headers: {
        Authorization: "Bearer " + token,
        "Notion-Version": apiVersion,
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    });
    if (response.ok) return response.json();
    const message = await response.text();
    if (![429, 500, 503, 529].includes(response.status) || attempt === 6) {
      throw new Error("Notion API " + response.status + " for " + path + ": " + message);
    }
    const retryAfter = Number(response.headers.get("retry-after") || 1);
    await wait(Math.max(retryAfter * 1000, 1000 * (attempt + 1)));
  }
  throw new Error("Notion request failed: " + path);
}

async function querySource(id) {
  const results = [];
  let cursor;
  do {
    const payload = { page_size: 100 };
    if (cursor) payload.start_cursor = cursor;
    const page = await request("data_sources/" + id + "/query", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    results.push(...page.results);
    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor);
  return results;
}

const prop = (page, name) => page.properties?.[name];
const titleOf = (page, name) => (prop(page, name)?.title || []).map(x => x.plain_text || "").join("");
const selectOf = (page, name) => prop(page, name)?.select?.name || "";
const multiOf = (page, name) => (prop(page, name)?.multi_select || []).map(x => x.name);
const refsOf = (page, name) => (prop(page, name)?.relation || []).map(x => x.id);
const publicUrl = id => site + "/" + String(id).replaceAll("-", "");
const pageIdOf = page => String(page.id).replaceAll("-", "");
const allBooks = await querySource(sources.books.id);
const allPodcasts = await querySource(sources.podcasts.id);
const allQuotes = await querySource(sources.quotes.id);
const allBooksById = new Map(allBooks.map(page => [pageIdOf(page), page]));
const authorOf = page => selectOf(page, "Author") || authorOverrides[pageIdOf(page)]?.author || "";
const idToUrl = new Map();
for (const page of [...allBooks, ...allPodcasts, ...allQuotes]) idToUrl.set(pageIdOf(page), publicUrl(page.id));
const relationUrls = (page, name) => refsOf(page, name).map(id => idToUrl.get(String(id).replaceAll("-", "")) || publicUrl(id));

const books = allBooks.map(page => ({
  title: titleOf(page, "書名"),
  author: authorOf(page),
  status: selectOf(page, "Leyo status"),
  rating: selectOf(page, "推薦程度"),
  tags: multiOf(page, "屬性"),
  podcast: Boolean(prop(page, "Podcast")?.checkbox),
  podcastRefs: relationUrls(page, "Podcast 1"),
  quoteRefs: relationUrls(page, "金句"),
  updated: page.last_edited_time || "",
  url: publicUrl(page.id)
})).filter(x => x.title);

const podcasts = allPodcasts.map(page => ({
  title: titleOf(page, "Name"),
  created: page.created_time || "",
  updated: page.last_edited_time || "",
  tags: multiOf(page, "Tags"),
  bookRefs: relationUrls(page, "書籍"),
  authors: [...new Set([...refsOf(page, "書籍"), ...allBooks.filter(book => refsOf(book, "Podcast 1").includes(page.id)).map(book => book.id)].map(id => allBooksById.get(String(id).replaceAll("-", ""))).filter(Boolean).map(authorOf).filter(Boolean))],
  url: publicUrl(page.id)
})).filter(x => x.title);

const quotes = allQuotes.map(page => ({
  title: titleOf(page, "Name"),
  created: page.created_time || "",
  updated: page.last_edited_time || "",
  tags: multiOf(page, "tag"),
  bookRefs: relationUrls(page, "Book"),
  page: prop(page, "Page")?.number ?? null,
  url: publicUrl(page.id)
})).filter(x => x.title);

async function children(blockId) {
  const results = [];
  let cursor;
  do {
    const suffix = cursor ? "?page_size=100&start_cursor=" + encodeURIComponent(cursor) : "?page_size=100";
    const page = await request("blocks/" + blockId + "/children" + suffix);
    results.push(...page.results);
    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor);
  return results;
}

function richText(items) {
  return (items || []).map(item => item.plain_text || item.text?.content || "").join("");
}

async function blockLines(blockId, depth = 0) {
  const result = [];
  for (const block of await children(blockId)) {
    const type = block.type;
    const value = block[type] || {};
    let line = "";
    if (["image", "audio", "file", "pdf", "video", "bookmark", "embed", "link_preview"].includes(type)) {
      line = "";
    } else if (type === "table_row") {
      line = (value.cells || []).map(richText).join("　｜　");
    } else if (type === "child_page") {
      line = value.title || "";
    } else if (type === "equation") {
      line = value.expression || "";
    } else {
      line = richText(value.rich_text);
      if (type === "heading_1") line = "# " + line;
      else if (type === "heading_2") line = "## " + line;
      else if (type === "heading_3") line = "### " + line;
      else if (type === "bulleted_list_item") line = "- " + line;
      else if (type === "numbered_list_item") line = "1. " + line;
      else if (type === "to_do") line = (value.checked ? "[x] " : "[ ] ") + line;
      else if (type === "quote") line = "> " + line;
    }
    if (line.trim()) result.push("  ".repeat(Math.min(depth, 5)) + line);
    if (block.has_children && !["child_database", "child_page"].includes(type)) {
      result.push(...await blockLines(block.id, depth + 1));
    }
  }
  return result;
}

const quoteBodies = {};
for (const page of allQuotes) {
  quoteBodies[publicUrl(page.id)] = (await blockLines(page.id)).join("\n").trim();
}
const snapshot = {
  updatedAt: new Date().toISOString().slice(0, 10),
  sources: Object.fromEntries(Object.entries(sources).map(([key, value]) => [key, value.url])),
  books,
  podcasts,
  quotes
};
await fs.writeFile("data.js", "window.DASHBOARD_DATA = " + JSON.stringify(snapshot) + ";\n", "utf8");
await fs.writeFile("quote-bodies.js", "window.QUOTE_BODIES = " + JSON.stringify(quoteBodies) + ";\n", "utf8");
console.log("Synced " + books.length + " books, " + podcasts.length + " podcasts, and " + quotes.length + " quotes.");
