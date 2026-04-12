# Sudoku

インタラクティブな数独パズル。解法テクニック付きヒント、3 段階の難易度、タイマー、クリア時の紙吹雪演出。vanilla JS、ゼロ依存。

> Interactive Sudoku puzzle with technique-based hints, 3 difficulty levels, timer, and confetti celebration. Vanilla JS, zero dependencies.

## 特徴 / Features

- **3 段階の難易度** — かんたん / ふつう / むずかしい（クルー数で制御、一意解保証）
  Three difficulty levels — Easy / Medium / Hard (clue count controlled, unique solution guaranteed)
- **解法テクニック付きヒント** — Naked Single, Hidden Single, Pointing Pair を検出して説明
  Technique-based hints — detects and explains Naked Single, Hidden Single, Pointing Pair
- **タイマー** — 経過時間を表示
  Timer — shows elapsed time
- **紙吹雪演出** — クリア時に canvas ベースの紙吹雪
  Confetti celebration — canvas-based confetti on puzzle completion
- **入力バリデーション** — 競合セルを赤くハイライト
  Input validation — conflicting cells highlighted in red
- **日英 UI** — 言語切替ボタンで即時切替
  Bilingual UI — instant language switch between Japanese and English
- **ダークテーマ** — 目に優しいダーク UI
  Dark theme — eye-friendly dark UI
- **キーボード操作** — 矢印キーでセル移動、数字キーで入力
  Keyboard support — arrow keys to navigate, number keys to input

## ローカル起動 / Run locally

```sh
npm run serve
# → http://localhost:8033
```

## テスト / Tests

```sh
npm test
```

44 テストケース: ソルバー (22)、ジェネレーター (11)、ヒントエンジン (11)

44 test cases: solver (22), generator (11), hint engine (11)

## 仕組み / How it works

| モジュール | 役割 |
|---|---|
| `src/solver.js` | 制約伝播 + バックトラッキングの純粋関数ソルバー |
| `src/generator.js` | 完成盤面生成 → セル除去（一意解保証） |
| `src/hints.js` | 人間の解法テクニックを 1 ステップずつ検出 |
| `src/confetti.js` | canvas ベースの軽量紙吹雪アニメーション |
| `src/i18n.js` | 日英メッセージ定義 |
| `src/main.js` | DOM 操作・状態管理・イベントハンドリング |

## ライセンス / License

MIT. See [LICENSE](./LICENSE).

---

Part of the [SEN portfolio series](https://sen.ltd/portfolio/)
