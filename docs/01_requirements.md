# 要件定義

## 目的

MC Server Manager（MCSM）は、Minecraftサーバーを常時稼働させず、遊ぶタイミングだけ起動できるようにすることで、AWS等のクラウド利用料を抑えるためのWebアプリケーションである。

## 利用者

- 管理者: 開発者本人
- 利用者: 数人の友人
- 利用規模: 小規模・非公開利用

## 対象Minecraftサーバー

- Edition: Java Edition
- サーバー種別: Forge
- 1サーバーあたり人数: 1〜5人
- 平均同時接続: 2〜3人
- ワールドサイズ想定: 数GB程度、10GB未満
- 固定IP: 不要

## MVP機能

### サーバー一覧

一覧画面で以下を表示する。

- サーバー名
- 起動/停止状態
- 起動中の場合のPublic IP
- Minecraftバージョン
- Startボタン
- Stopボタン

DBなしMVPでは、停止してからの正確な経過時間は持たない。起動中の `startedAt` はEC2の `LaunchTime` から表示できる範囲で対応する。

### サーバー起動

停止中のEC2インスタンスを起動する。

### サーバー停止

停止APIを呼ぶと、SSM Run CommandでEC2内の停止スクリプトを非同期実行する。スクリプトはMinecraftサーバー停止、S3バックアップ、OS shutdownを行う。

### 認証

- Google OAuth
- GitHub OAuth
- 許可済みメールアドレスのみ利用可能
- Better Auth Stateless Sessionを利用する

## MVP以降の候補機能

- 起動中30分ごとの定期バックアップ
- EC2内cronによる自動停止
- ログイン中プレイヤー数表示
- ログイン中プレイヤー名表示
- MOD一覧表示
- クライアント向けMOD zipダウンロード
- DynamoDBによる操作履歴管理
- 起動者/停止者の表示
- より正確なSTARTING/STOPPING状態管理
