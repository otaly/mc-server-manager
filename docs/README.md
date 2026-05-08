# MC Server Manager Docs

MC Server Manager（MCSM）は、少人数向け Minecraft Java Edition / Forge サーバーを必要な時だけ起動し、遊び終わったら停止することでクラウド費用を抑えるためのWebアプリケーションです。

## ドキュメント構成

- [01_requirements.md](./01_requirements.md): 要件定義
- [02_architecture.md](./02_architecture.md): システム構成・技術選定
- [03_auth_security.md](./03_auth_security.md): 認証・認可・サービス間認証・secret管理
- [04_aws_infra.md](./04_aws_infra.md): AWSインフラ設計
- [05_api_design.md](./05_api_design.md): MVP API設計
- [06_operations_backup.md](./06_operations_backup.md): 起動・停止・バックアップ・自動停止
- [07_roadmap.md](./07_roadmap.md): MVP以降の計画
- [08_decision_log.md](./08_decision_log.md): 設計判断ログ
- [references.md](./references.md): 参考資料

## MVP方針

MVPでは、以下を優先する。

1. MinecraftサーバーをWeb UIから起動できる
2. MinecraftサーバーをWeb UIから停止できる
3. 停止時にワールドデータをS3へバックアップする
4. DBなしで構成し、サーバー定義は環境変数または設定ファイルで管理する
5. 認証はGoogle/GitHub OAuth + 許可済みメールアドレスで制御する
6. BackendはFastAPI on AWS Lambda Function URLで構築する
7. VercelからAWSへはVercel OIDC Federationで短期credentialを取得する

## 非目標

MVPでは以下をやらない。

- サーバー作成画面
- DBによる操作履歴管理
- 権限ロール管理
- MOD一覧表示
- MOD zipダウンロード
- プレイヤー数・プレイヤー名表示
- 起動中の定期バックアップ
- ECS/Fargate + internal ALB構成
