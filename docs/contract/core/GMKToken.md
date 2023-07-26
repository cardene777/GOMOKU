# GMKToken

上記のコントラクトは「GMKToken」という名前のERC20トークンコントラクトで、GMKトークンの発行と燃焼を管理します。以下では、コントラクトの主な機能や重要な部分について説明します。

**1. インポート:**
このコントラクトは以下のコントラクトやインターフェースを使用しています。
- `ERC20Permit`: OpenZeppelinのERC20トークンにpermit機能を追加する拡張コントラクト。
- `ERC20Snapshot`: OpenZeppelinのERC20トークンにスナップショット機能を追加する拡張コントラクト。
- `Ownable`: オーナーシップの管理を提供するOpenZeppelinのコントラクト。
- `OFTV2`: レイヤーゼロラボのOFTV2トークンの機能を提供するコントラクト。
- `IRedeemable`: GMKトークンが準拠するERC20トークンのインターフェース。

**2. ステート変数:**
- `uint256 public localMintCap`: このチェーン上で許可される最大のマイント量を表す変数。
- `uint256 public localMintAmount`: このチェーン上でマイントされたトークンの累計量を表す変数。
- `address public immutable controller`: GMKトークンのマイントとバーンを管理するコントローラーアドレス。

**3. イベント:**
- `Minted`: トークンがマイントされたときに発生するイベント。
- `Burned`: トークンがバーンされたときに発生するイベント。
- `LocalMintCapChanged`: `localMintCap`変数が変更されたときに発生するイベント。

**4. 修飾子:**
- `onlyController`: コントローラーアドレスのみが呼び出し可能な修飾子。

**5. コンストラクタ:**
- `constructor`: GMKトークンの初期化を行うコンストラクタで、オーナーとコントローラーアドレスを指定します。

**6. 関数:**
- `mint`: GMKトークンを特定のアカウントにマイントする関数です。コントローラーのみが呼び出し可能です。
- `burn`: GMKトークンを特定のアカウントからバーンする関数です。コントローラーのみが呼び出し可能です。
- `setLocalMintCap`: GMKトークンの`localMintCap`変数を設定する関数で、ガバナンスによって呼び出されます。
- `_checkLocalMint`: `localMintCap`をチェックして、`localMintAmount`が制限を超えていないかを確認する内部関数。
- `_beforeTokenTransfer`: トークンのトランスファーが行われる前に呼び出されるコールバック関数。
- `takeSnapshot`: スナップショットを取得するための関数。

GMKトークンはERC20準拠のトークンであり、特定のコントローラーによってマイントとバーンが管理され、またスナップショット機能も提供されています。また、OFTV2の機能を組み込んでおり、ERC20Permitを使用することもできます。
