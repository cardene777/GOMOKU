# GMKController

上記のコントラクトは「GMKController」という名前のスマートコントラクトです。GMKControllerは、GMK stable coinの発行と引き換えを制御する役割を果たします。以下では、コントラクトの主な機能や構造について説明します。

**1. コントラクトの役割:**
GMKControllerは、ユーザーが特定のERC20トークンを預け入れ（mint）することで、対応するGMK stable coinを発行する機能を提供します。また、ユーザーがGMK stable coinを引き換え（redeem）することで、対応するERC20トークンを受け取る機能も提供します。さらに、各種のパラメータを設定し、管理者によってコントロールされることが想定されています。

**2. インポート:**
以下のOpenZeppelinのコントラクトを使用しています。
- UUPSUpgradeable: アップグレード可能なコントラクトを管理するためのライブラリ
- OwnableUpgradeable: オーナーシップの管理を提供するライブラリ
- AddressUpgradeable: アドレスに関連するユーティリティ機能を提供するライブラリ
- ReentrancyGuardUpgradeable: リエントラント攻撃から保護するためのライブラリ
- SafeERC20Upgradeable: ERC20トークンに対するセーフなトランザクションを提供するライブラリ
- ERC20, IERC20: ERC20トークンのインターフェースおよび実装

**3. ストレージ:**
GMKControllerは、GMKControllerStorageという別のコントラクトから継承しており、ストレージデータを別のコントラクトに保存する設計になっています。具体的なストレージの詳細は質問文に記載されていないため、詳細はわかりませんが、このようなアーキテクチャは、アップグレード時のデータの安全性を確保するために使われることがあります。

**4. 関数:**
GMKControllerは、以下のような主な関数が定義されています。
- initialize: コントラクトの初期化関数で、オーナーを設定します。
- whitelistAsset: 特定のトークンを許可リストに追加または削除する関数。
- updateRouter: GMKControllerのルーターアドレスを更新する関数。
- setRedeemable: レディーマブル(lsToken)アドレスを設定する関数。
- mint: 特定のトークンを預け入れ（mint）してGMKを発行する関数。
- mintWithERC20: ERC20トークンを預け入れ（mint）してGMKを発行する関数。
- redeem: GMKを引き換えて特定のトークンを受け取る関数。
- redeemForLsToken: GMKを引き換えてlsTokenを受け取る関数。

**5. モディファイア:**
- onlyOwner: オーナーによってのみ実行可能な関数を制御するためのモディファイア。
- nonReentrant: リエントラント攻撃から保護するためのモディファイア。

その他、内部で使用される構造体やエラー定義などがありますが、上記で主要なポイントを説明しました。
