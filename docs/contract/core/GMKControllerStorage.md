# GMKControllerStorage

上記のコントラクトは、GMKControllerコントラクトのストレージを定義する抽象コントラクト「GMKControllerStorage」です。このコントラクトでは、GMKControllerのステート変数を定義していますが、実際のロジックはこのコントラクトには含まれていません。代わりに、このコントラクトは他のコントラクトに継承され、そこで具体的なロジックが実装されます。

**主なステート変数:**

1. `IRedeemable public redeemable;`: GMKControllerが発行および引き換える対象のトークンを表す`IRedeemable`インターフェースへの参照です。このインターフェースには、GMKコントラクトがmint（発行）とburn（引き換え）を行うための関数が定義されていると想定されています。

2. `IGMKRouter public router;`: GMKControllerがパーペチュアルDEX（永続的な分散取引所）へのアクセスに使用するルーターのアドレスを表す`IGMKRouter`インターフェースへの参照です。このインターフェースには、パーペチュアルDEXとの相互作用に必要な関数が定義されていると想定されています。

3. `mapping(address => bool) public whitelistedAssets;`: トークンアドレスをブール値にマッピングするマッピング変数です。このマッピングにより、ホワイトリストに登録されたトークンのみがGMKControllerで使用できることが制御されます。

4. `address[] public assetList;`: ホワイトリストに登録されているトークンのリストを保持する配列変数です。この変数は、ホワイトリストに登録されたトークンのリストを追跡するために使用されます。

**その他:**

このコントラクトは「abstract contract」として定義されています。これは、実際のロジックがこのコントラクト自体ではなく、他のコントラクトで実装されることを意味しています。具体的なロジックは、このコントラクトを継承するGMKControllerコントラクトで実装されます。GMKControllerStorageは、GMKControllerの状態変数を定義するための共通の基底として機能します。
