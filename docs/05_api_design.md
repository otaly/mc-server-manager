# MVP API設計

## 方針

MVPでは一覧画面のみを対象とする。APIは3つに絞る。

```text
GET  /servers
POST /servers/{serverId}/start
POST /servers/{serverId}/stop
```

## 共通認証

BFFからBackendへのリクエストには以下を付与する。

- SigV4署名
- `X-MCSM-JWT`

```http
X-MCSM-JWT: <service-jwt>
```

## GET /servers

サーバー一覧を取得する。

### Request

```http
GET /servers
```

### Response

```json
[
  {
    "id": "vanilla-1",
    "name": "Vanilla-1.12.0-CutAll",
    "status": "running",
    "minecraftVersion": "1.12.0",
    "publicIp": "126.15.228.42",
    "startedAt": "2026-05-05T10:00:00Z"
  }
]
```

### status

```ts
type ServerStatus =
  | "starting"
  | "running"
  | "stopping"
  | "stopped"
  | "unknown"
```

### EC2 stateからの変換

```ts
const toUiStatus = (ec2State: string) => {
  switch (ec2State) {
    case "pending":
      return "starting"
    case "running":
      return "running"
    case "stopping":
    case "shutting-down":
      return "stopping"
    case "stopped":
      return "stopped"
    default:
      return "unknown"
  }
}
```

SSMで停止スクリプト実行中はEC2 stateがまだ `running` のため、MVPではフロント側の楽観的状態で `stopping` を表示する。

## POST /servers/{serverId}/start

EC2を起動する。

### Request

```http
POST /servers/vanilla-1/start
```

### Response

```json
{
  "serverId": "vanilla-1",
  "status": "starting"
}
```

### Backend処理

1. `serverId` から固定定義の `instanceId` を取得
2. `DescribeInstances`
3. `stopped` なら `StartInstances`
4. `pending` / `running` なら現在状態を返す
5. その他の状態ならエラー

## POST /servers/{serverId}/stop

Minecraft停止・S3バックアップ・EC2停止を非同期で開始する。

### Request

```http
POST /servers/vanilla-1/stop
```

### Response

```json
{
  "serverId": "vanilla-1",
  "status": "stopping"
}
```

### Backend処理

1. `serverId` から固定定義の `instanceId` を取得
2. `DescribeInstances`
3. `running` でなければ現在状態を返す
4. `SSM SendCommand` で `/opt/minecraft/scripts/backup-and-stop.sh` を実行
5. 即時に `stopping` を返す

## フロント側ポーリング

起動/停止操作後、3〜5秒間隔で `GET /servers` を呼ぶ。

```text
Start clicked
  -> optimistic status = STARTING
  -> poll GET /servers
  -> EC2 running
  -> RUNNING + IP表示

Stop clicked
  -> optimistic status = STOPPING
  -> poll GET /servers
  -> EC2 stopped
  -> STOPPED表示
```

## v1で追加するAPI候補

```text
GET  /servers/{serverId}
GET  /servers/{serverId}/players
GET  /servers/{serverId}/mods
POST /servers/{serverId}/backup
GET  /operations
GET  /operations/{operationId}
```
