# 設計判断ログ

## ADR-001: BackendはFastAPIにする

### Context

Hono + Cloudflare Workersにも興味があるが、MCSMの中心はAWS上のEC2、SSM、S3操作である。

### Decision

BackendはFastAPIにする。

### Consequences

- AWS SDK for Python（boto3）を利用できる
- OpenAPI自動生成しやすい
- Lambda化にはMangumを使う
- TypeScript統一はしない

## ADR-002: BackendはLambda Function URLで公開する

### Context

Backendを完全にprivate networkに置きたい気持ちはあるが、ECS/Fargate + internal ALBはコストが高くMVPには重い。

### Decision

MVPではLambda Function URLを使う。AuthTypeは `AWS_IAM` にする。

### Consequences

- ネットワーク的にはURLを持つ
- `AWS_IAM` とService JWTで防御する
- Private backendが必要になったらv1以降で再検討する

## ADR-003: Vercel OIDC Federationを使う

### Context

Vercelに長期AWSアクセスキーを置くと漏洩時リスクがある。

### Decision

Vercel OIDC FederationでAWS STSから短期credentialを取得する。

### Consequences

- Vercelに長期AWSアクセスキーを置かない
- AWS側にVercel OIDC用IAM Roleが必要
- IAM trust policyの設計が必要

## ADR-004: ECS/Fargate + internal ALBは使わない

### Context

private backend構成としては綺麗だが、ALBとFargateの常時コストがMCSMの月額0〜1000円目標に合わない。

### Decision

MVPでは使わない。

### Consequences

- BackendはLambda Function URLになる
- 完全private network構成ではない
- コストと単純さを優先する

## ADR-005: MVPではDBを使わない

### Context

サーバー作成はMCSM外で行い、MVPの機能は一覧・起動・停止のみである。

### Decision

MVPではDBを使わず、サーバー定義は環境変数または設定ファイルに置く。

### Consequences

- 構成が単純になる
- 起動者/停止者や操作履歴は保存しない
- STOPPING表示はフロント側の楽観的状態で対応する
- v1でDynamoDBを導入する

## ADR-006: Google/GitHub OAuth + allowlistにする

### Context

事前に許可された少人数だけが使うアプリであり、自前のパスワード管理は避けたい。

### Decision

Google/GitHub OAuthを使い、許可済みメールアドレスで利用者を制限する。

### Consequences

- パスワードDBが不要
- パスワードリセット機能が不要
- allowedEmailsはsecret管理する

## ADR-007: 停止は非同期にする

### Context

停止時にはMinecraft停止、バックアップ、OS shutdownが必要であり、同期リクエストで待つとタイムアウトやUXの問題が出やすい。

### Decision

`POST /servers/{id}/stop` はSSM Run Commandを送信して即時に `stopping` を返す。

### Consequences

- UIはポーリングで状態更新する
- DBなしMVPでは画面リロード時にSTOPPING状態が失われる可能性がある
- v1でoperations tableにより改善する
