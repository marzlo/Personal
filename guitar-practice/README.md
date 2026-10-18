# FRET / 指間

獨立吉他練習設計原型，包含四種調式、級數配和弦、可切換按法及 68 個指型的參考圖庫。

直接開啟 `index.html`，或在程式庫根目錄執行：

```sh
python -m http.server 8000
```

開啟 `http://localhost:8000/guitar-practice/`。不需安裝依賴、不需 API 金鑰。

檢查：

```sh
node guitar-practice/tests/harmony.cjs
node guitar-practice/tests/package.cjs
```

設計範圍及後續需求見 `PROJECT_CONTEXT.md`；雲端接續指令見 `CLOUD_HANDOFF.md`。
