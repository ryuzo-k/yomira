# 2026-05-11 02:22 古野光太朗さんMTG「人格シミュレーションAPI事業化検討」

Circleback ID: 8644552 / linkId: Uuscyg6bvjrp7GOe8LUM6

> このMTG議事録は Mora / Path Simulator プロダクトの事業化検討記録。
> 関連商談: ユニオンツール（勝俣氏）5/11 10:45 MTG（`~/yobou/sales/leads/katsumata-uniontool/`）

## 参加者
- 基島 隆蔵（Yobou代表）
- 古野 光太朗（Yobou）
- ほか3名（Participant 1,4,5）

## 議題サマリ
- Ryuzo自分用に開発中の**人格シミュレーションAPI**を**プロダクト化・API化**する可能性を検討
- 古野は前向きに反応
- **上場企業・ユニオンツールからの提案依頼が、このアイデアを外部に出すきっかけ**になった

## 重要決定/方向性
- **YCイベント参加でXAIのAPIクレジット約300万円相当 獲得可能性**
- **AnthropicのVCフォームも選択肢**
- **2B より 2C の方がスケールしやすい**・Ryuzoの性格にも向いている認識で一致

## プロダクト構造（README/docs/product-2-simulation.md より）
- **Product 1: Mora**（無料配布層・skills.sh）— 候補パス抽出/比較
- **Product 2: Path Simulator**（課金型シミュレーションAPI）— 候補パスを「シミュレートしたオーディエンス」にぶつけて反応分布を返す

### MVP契約（既存設計）
- `POST /simulate`
- 入力: paths / audience_brief / decision_question / reaction_dimensions
- 出力: aggregate_reactions / segments / representative_reactions / next_tests

### 推奨初手（既存設計）
- **Path B（Manual Concierge $49/$99 fixed-price report）+ Path A（Agent-Native API）併用**
- 裏側はAPI設計で構築・初期はマニュアル/セミマニュアル提供

## 次アクション候補
- [ ] YCイベント参加方針確定 / XAIクレジット申請
- [ ] AnthropicのVCフォーム提出可否判断
- [ ] ユニオンツールへの提案資料に Path Simulator の応用を組み込む（5/11 MTGで合意済）
- [ ] 2Cターゲット（AI-native builders / 個人事業主 / Creator）への配信ルート設計
- [ ] Manual Concierge 5件分のサンプルレポート作成（販売検証）

## 関連リソース
- プロダクトレポ: `/Users/ryuzokijima/Documents/New project`
- README: `README.md`
- Product 2 設計書: `docs/product-2-simulation.md`
- ユニオンツール商談議事録: `~/yobou/sales/leads/katsumata-uniontool/comm_log/2026-05-11_mtg-circleback.md`
