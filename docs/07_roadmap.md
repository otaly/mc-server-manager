# MVP以降の計画

## MVP

目的: Web UIからMinecraftサーバーを起動・停止でき、停止時バックアップできる状態にする。

### Scope

- Next.js + Chakra UI
- Better Auth Stateless Session
- Google/GitHub OAuth
- allowedEmails
- Vercel OIDC Federation
- FastAPI on Lambda Function URL
- AWS_IAM認証
- Service JWT
- DBなし
- `GET /servers`
- `POST /servers/{id}/start`
- `POST /servers/{id}/stop`
- EC2 Forge Server
- systemd
- SSM Run Command
- 停止時S3バックアップ

### 完了条件

- 許可されたユーザーだけログインできる
- サーバー一覧が表示できる
- 停止中のEC2をWeb UIから起動できる
- 起動後にPublic IPが表示される
- Web UIから停止処理を開始できる
- 停止時にS3へバックアップされる
- 停止後にEC2がstoppedになる

## v1

目的: 運用状態を見える化し、停止/起動の信頼性を上げる。

### 追加機能

- DynamoDB導入
- operations table
- servers table
- 起動者/停止者の記録
- SSM commandId保存
- 操作状態管理
- 全ユーザーで共有されるSTARTING/STOPPING表示
- 操作失敗表示
- 起動中30分ごとの定期バックアップ
- S3 Lifecycleで古いバックアップを整理

### DynamoDB案

#### servers

```ts
type Server = {
  id: string
  name: string
  instanceId: string
  region: string
  minecraftVersion: string
  serverType: "forge"
  autoStopEnabled: boolean
  autoStopMinutes: number
  backupBucket: string
  backupPrefix: string
  createdAt: string
  updatedAt: string
}
```

#### operations

```ts
type Operation = {
  id: string
  serverId: string
  userEmail: string
  type: "start" | "stop" | "backup" | "auto-stop"
  status: "queued" | "running" | "succeeded" | "failed"
  commandId?: string
  message?: string
  createdAt: string
  finishedAt?: string
}
```

## v1.1

目的: 使い勝手を上げる。

- プレイヤー数表示
- プレイヤー名表示
- 自動停止
- 停止前のゲーム内通知
- 停止前 `save-all`
- Copy IP button
- 接続先 `ip:25565` 表示

## v2

目的: MODサーバー運用支援。

- MOD一覧表示
- MOD version表示
- クライアント導入用MOD zipダウンロード
- サーバー設定情報の管理
- バックアップからの復元補助
- サーバー追加用スクリプト整備

## 後回しにするもの

- サーバー作成管理画面
- ECS/Fargate + internal ALB
- RDS
- 詳細な権限ロール
