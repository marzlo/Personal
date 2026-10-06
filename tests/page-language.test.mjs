import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
function fixture(search = '', saved = '') {
  const values = new Map(saved ? [['shiyeLanguage', saved]] : []);
  const context = { window: { confirm: value => value, dispatchEvent() {} }, document: { body: null, addEventListener() {} }, location: { search, href: 'https://marzlo.github.io/Personal/' + search }, localStorage: { getItem: k => values.get(k), setItem: (k, v) => values.set(k, v) }, URL, URLSearchParams, history: { replaceState() {} }, CustomEvent: class { constructor(name, options) { this.detail = options.detail; } } };
  vm.runInNewContext(fs.readFileSync(new URL('../page-language.js', import.meta.url), 'utf8'), context);
  return { context, api: context.window.ShiyeI18n, values };
}
test('URL language overrides saved preference; old Chinese default remains valid', () => {
  assert.equal(fixture().api.language, 'zh');
  assert.equal(fixture('?lang=en', 'zh').api.language, 'en');
  assert.equal(fixture('?lang=zh', 'en').api.language, 'zh');
});
test('UI translation preserves dynamic dates, counts and original concept names', () => {
  const { api, context } = fixture('?lang=en');
  assert.equal(api.translate('⌂　總覽'), '⌂　Overview');
  assert.equal(api.translate('已選文章（12）'), 'Selected articles (12)');
  assert.equal(api.translate('共用整理已同步 · 12:40'), 'Your notes are synced · 12:40');
  assert.equal(context.window.confirm('刪除「我的原文名詞」名詞及其整理與文章連結？'), 'Delete the concept “我的原文名詞” and its notes and article links?');
});
test('switching language remembers only preference keys and returns original Chinese', () => {
  const { api, values } = fixture('?lang=en');
  api.setLanguage('zh');
  assert.equal(api.translate('儲存'), '儲存');
  assert.equal(values.get('shiyeLanguage'), 'zh');
  assert.deepEqual([...values.keys()].sort(), ['shiyeLanguage', 'shiyeShareLanguage']);
});
test('combined login reminders are translated without changing arbitrary note text', () => {
  const { api } = fixture('?lang=en');
  assert.equal(api.translate('我的閱讀筆記與文章原文'), '我的閱讀筆記與文章原文');
  assert.equal(api.translate('請登入 GitHub，讓這次整理同步到另一台裝置。 請先儲存目前編輯；已儲存的內容會保留在本機。'), 'Sign in to GitHub to sync these notes with your other device. Save your current edits first. Saved notes will remain on this device.');
});
