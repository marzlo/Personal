import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { loadCache } from "./notion-cache.mjs";
const startedAt = Date.now();
const cache = await loadCache(process.env.NOTION_CACHE_PATH ? pathToFileURL(process.env.NOTION_CACHE_PATH) : new URL("../.cache/notion-sync.json", import.meta.url));
let requestCount = 0;

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
const childrenCache = new Map();

async function request(path, options = {}) {
  for (let attempt = 0; attempt < 7; attempt++) {
    const now = Date.now();
    if (now < nextRequestAt) await wait(nextRequestAt - now);
    nextRequestAt = Date.now() + 350;
    requestCount++;
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
const audioExtension = /\.(?:mp3|m4a|aac|wav|ogg|opus|flac|wma|aiff?)(?:$|[?#])/i;
const idToUrl = new Map();
for (const page of [...allBooks, ...allPodcasts, ...allQuotes]) idToUrl.set(pageIdOf(page), publicUrl(page.id));
const relationUrls = (page, name) => refsOf(page, name).map(id => idToUrl.get(String(id).replaceAll("-", "")) || publicUrl(id));

const books = [];
for (const page of allBooks) {
  books.push({
    title: titleOf(page, "書名"),
    author: authorOf(page),
    status: selectOf(page, "Leyo status"),
    rating: selectOf(page, "推薦程度"),
    tags: multiOf(page, "屬性"),
    podcast: Boolean(prop(page, "Podcast")?.checkbox),
    hasAudio: await pageHasAudio(page),
    podcastRefs: relationUrls(page, "Podcast 1"),
    quoteRefs: relationUrls(page, "金句"),
    updated: page.last_edited_time || "",
    url: publicUrl(page.id)
  });
}
const titledBooks = books.filter(x => x.title);

const podcasts = [];
for (const page of allPodcasts) {
  const title = titleOf(page, "Name");
  if (!title) continue;
  podcasts.push({
  title: titleOf(page, "Name"),
  created: page.created_time || "",
  updated: page.last_edited_time || "",
  hasAudio: await pageHasAudio(page),
  tags: multiOf(page, "Tags"),
  bookRefs: relationUrls(page, "書籍"),
  authors: [...new Set([...refsOf(page, "書籍"), ...allBooks.filter(book => refsOf(book, "Podcast 1").includes(page.id)).map(book => book.id)].map(id => allBooksById.get(String(id).replaceAll("-", ""))).filter(Boolean).map(authorOf).filter(Boolean))],
  url: publicUrl(page.id)
  });
}

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
  if (childrenCache.has(blockId)) return childrenCache.get(blockId);
  const results = [];
  let cursor;
  do {
    const suffix = cursor ? "?page_size=100&start_cursor=" + encodeURIComponent(cursor) : "?page_size=100";
    const page = await request("blocks/" + blockId + "/children" + suffix);
    results.push(...page.results);
    cursor = page.has_more ? page.next_cursor : undefined;
  } while (cursor);
  childrenCache.set(blockId, results);
  return results;
}

function isAudioFile(value = {}) {
  if (value.type === "audio") return true;
  const mimeType = value.mime_type || value.media_type || "";
  if (typeof mimeType === "string" && mimeType.toLowerCase().startsWith("audio/")) return true;
  return [value.name, value.url, value.file?.url, value.external?.url]
    .some(candidate => typeof candidate === "string" && audioExtension.test(candidate));
}

function pagePropertyHasAudio(page) {
  return Object.values(page.properties || {}).some(property =>
    property?.type === "files" && (property.files || []).some(isAudioFile)
  );
}

async function blockTreeHasAudio(blockId) {
  for (const block of await children(blockId)) {
    const value = block[block.type] || {};
    if (block.type === "audio" || (["file", "embed"].includes(block.type) && isAudioFile(value))) return true;
    if (block.has_children && block.type !== "child_database" && await blockTreeHasAudio(block.id)) return true;
  }
  return false;
}

async function pageHasAudio(page) {
  const saved = cache.get(page, "audio");
  if (saved !== undefined) return saved;
  const audio = pagePropertyHasAudio(page) || await blockTreeHasAudio(page.id);
  cache.set(page, "audio", audio);
  return audio;
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

async function pageBody(page) {
  const saved = cache.get(page, "body");
  if (saved !== undefined) return saved;
  const body = (await blockLines(page.id)).join("\n").trim();
  cache.set(page, "body", body);
  return body;
}
const quoteBodies = {};
for (const page of allQuotes) {
  quoteBodies[publicUrl(page.id)] = await pageBody(page);
}
const articleBodies = {};
const audioBookUrls = new Set(books.filter(book => book.hasAudio).map(book => book.url));
const articlePages = [...allPodcasts, ...allBooks.filter(page => audioBookUrls.has(publicUrl(page.id)))];
for (const page of articlePages) {
  try {
    articleBodies[publicUrl(page.id)] = await pageBody(page);
  } catch (error) {
    console.warn("Could not read article body for " + publicUrl(page.id) + ": " + error.message);
    articleBodies[publicUrl(page.id)] = "";
  }
}
const bookByUrl = new Map(titledBooks.map(book => [book.url, book]));
const reflectiveWords = /自己|生命|意識|選擇|相信|理解|自由|改變|感受|存在|真正|行動|責任|世界|內在|思考|經驗|可能|看見|活著|成為/;
function quoteCandidates(text) {
  const lines = String(text || "").split(/\n+/)
    .map(line => line.replace(/^\s*(?:#{1,3}\s|>\s?|[-*]\s|\d+\.\s)/, "").trim())
    .filter(line => line && !/^(深度探討模式|辯論模式)$/.test(line));
  return lines.flatMap(line => {
    const sentences = line.match(/[^。！？.!?]+[。！？.!?]?/g) || [line];
    return sentences.map(sentence => sentence.trim()).filter(sentence => sentence.length >= 28 && sentence.length <= 220);
  });
}
const featuredCandidates = quotes.flatMap(quote => {
  const body = quoteBodies[quote.url] || "";
  let passages = quoteCandidates(body);
  if (!passages.length) {
    const firstLine = body.split(/\n+/).map(line => line.trim()).find(line => line.length >= 28);
    if (firstLine) passages = [firstLine.slice(0, 180).replace(/[，、；：\s]+$/, "") + (firstLine.length > 180 ? "…" : "")];
  }
  const reflective = passages.filter(passage => reflectiveWords.test(passage));
  if (reflective.length) passages = reflective;
  if (!passages.length) return [];
  const passage = passages[Math.floor(Math.random() * passages.length)];
  const book = quote.bookRefs.map(url => bookByUrl.get(url)).find(Boolean);
  return [{
    text: passage,
    sourceTitle: book?.title || quote.title || "Notion 金句",
    sourceUrl: book?.url || quote.url,
    notionUrl: quote.url,
    page: quote.page
  }];
});
const featuredQuote = featuredCandidates.length
  ? featuredCandidates[Math.floor(Math.random() * featuredCandidates.length)]
  : null;
const snapshot = {
  updatedAt: new Date().toISOString().slice(0, 10),
  syncedAt: new Date().toISOString(),
  sources: Object.fromEntries(Object.entries(sources).map(([key, value]) => [key, value.url])),
  featuredQuote,
  books: titledBooks,
  podcasts,
  quotes
};
await fs.writeFile("data.js", "window.DASHBOARD_DATA = " + JSON.stringify(snapshot) + ";\n", "utf8");
await fs.writeFile("quote-bodies.js", "window.QUOTE_BODIES = " + JSON.stringify(quoteBodies) + ";\n", "utf8");
await fs.writeFile("article-bodies.js", "window.ARTICLE_BODIES = " + JSON.stringify(articleBodies) + ";\n", "utf8");
console.log("Synced " + books.length + " books, " + podcasts.length + " podcasts, and " + quotes.length + " quotes.");

await cache.save([...allBooks, ...allPodcasts, ...allQuotes]);
console.log(`Notion requests: ${requestCount}; elapsed: ${Math.round((Date.now()-startedAt)/1000)}s`);
