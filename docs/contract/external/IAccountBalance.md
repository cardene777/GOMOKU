# IAccountBalance

上記のコントラクトは、Perpetual Protocol Curieスマートコントラクトからインポートされた「IAccountBalance」という名前のインターフェースです。このインターフェースは、トレーダーのアカウントのバランスを管理するための関数を定義しています。以下は、このインターフェースに含まれる主な関数についての説明です。

**1. イベント:**
- `VaultChanged`: バルトコントラクトが変更されたときに発生するイベント。
- `PnlRealized`: トレーダーの`owedRealizedPnl`が更新されたときに発生するイベント。

**2. 関数:**
- `modifyTakerBalance`: トレーダーのアカウントバランスを変更します。`ClearingHouse`コントラクトのみが使用します。
- `modifyOwedRealizedPnl`: トレーダーの`owedRealizedPnl`を変更します。`ClearingHouse`コントラクトのみが使用します。
- `settleOwedRealizedPnl`: トレーダーの`owedRealizedPnl`を解決します。これは、`Vault.withdraw()`によってのみ使用されます。
- `settleQuoteToOwedRealizedPnl`: トレーダーの`owedRealizedPnl`を解決します。これは、`ClearingHouse`コントラクトによってのみ使用されます。
- `settleBalanceAndDeregister`: トレーダーのアカウントバランスを解決し、特定のベーストークンを登録解除します。`ClearingHouse`コントラクトのみが使用します。
- `registerBaseToken`: トレーダーのベーストークンリストにベーストークンを登録します。`ClearingHouse`コントラクトのみが使用します。
- `deregisterBaseToken`: トレーダーのベーストークンリストからベーストークンを登録解除します。`ClearingHouse`コントラクトのみが使用します。
- `updateTwPremiumGrowthGlobal`: トレーダーのTwapプレミアム情報を更新します。`ClearingHouse`コントラクトのみが使用します。
- `settlePositionInClosedMarket`: クローズされたマーケットでのトレーダーのポジションを解決します。`ClearingHouse`コントラクトのみが使用します。
- `getClearingHouseConfig`: `ClearingHouseConfig`コントラクトのアドレスを取得します。
- `getOrderBook`: `OrderBook`コントラクトのアドレスを取得します。
- `getVault`: `Vault`コントラクトのアドレスを取得します。
- その他、各種のトレーダーの情報やバランスを取得するための関数が含まれています。

このインターフェースは、Perpetual Protocolの取引所で使用されるトレーダーのアカウントバランスの管理と取引関連のデータを提供するための重要なコントラクトです。
