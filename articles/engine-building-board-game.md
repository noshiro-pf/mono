---
title: '拡大再生産ゲームが満たすべき性質の考察'
emoji: '🐈'
type: 'idea' # tech: 技術記事 / idea: アイデア
topics: ['boardgame']
published: false
---

拡大再生産系のボードゲームの投資行動（生産力アップ）と得点行動について、先日友人と会話していてふと気になったので考察してみる。

AI同士の対戦ならともかく、人間同士で行う対戦ゲームで一番重要な要素は終盤で逆転が起こり得るということだと思う。
逆転の余地が無くなった（より正確には逆転の目があると思えなくなった）ゲームがその後も長く続かないことが、最後まで全プレイヤーが楽しめるために必要である（負けているプレイヤーがゲームを続ける意欲が無くなることを避ける）。

これを踏まえると、拡大再生産ゲームの投資と得点アクションの設計で満たすと良さそうな性質は以下のようなものがあると思われる（AND条件ではない）。

- （性質A）そもそもの1ゲームの時間が短い
  - 1ゲーム全体が短ければ大差が付いてからのゲームが長く続くことも無いので（＝リセマラできる）。ただし、短すぎると拡大した生産力を活かす時間も短くなり勝っているプレイヤーの楽しさが目減りするので、適度な長さが必要。
- （性質B）投資行動がそのまま自動的に得点にならない
  - 貪欲に投資すればするほど得をし続けるタイプのゲームは、序盤に拡大再生産が捗ったプレイヤーがそのまま最後まで簡単に勝ちやすく、後から逆転する余地が少ない傾向があり要件を満たさない（例：カタン）。
  - 投資と得点のバランスが難しいゲームほど、後半にも紛れが起きやすい傾向があると思われる。
- （性質C）多様な得点手段があり、各プレイヤーはその一部に特化した戦略を取らざるを得ない
  - 得点が比較しづらい状況になっていれば、凡人がパッと見で誰が勝っているかはっきり分からないので、実際の逆転の有無によらず終盤まで勝ちを目指す気持ちを維持しやすい。
  - 逆に得点手段が一元的だと、得点状況を把握しやすく途中で勝敗が見えてしまいやすい（例：カタン）。
  - 得点手段が多くても、勝っている人が簡単に総取りできてしまうようなシステムだと状況は分かりやすくなってしまうので、それがしづらいようにする必要もある。
- （性質D）不利をひっくり返すためのギミックがある
  - 逆転の目があれば、負けているプレイヤーも最後までゲームを続ける意欲を持続しやすいので。
  - 例：終盤に低頻度に大得点をする手段がある
    - 麻雀の親番連荘とか役満とか

## 具体例

自分が遊んだことのある拡大再生産ゲームを例として考える。

### カタンの場合

建設や改築が資源の生産力を上げると共にそのまま得点にもなる。純粋な得点行動にしかならないアクションは、最長交易路タイル獲得のためだけの生産に寄与しない街道建設や、最後の住居建設などのみで、貪欲に自明な生産行動を繰り返すだけで得点行動になる傾向が強い（性質Bを満たさない）。
序盤に拡大が進むほど多くの賽の目で資源を産むことができるようになり確率にも左右されづらくなるため、中終盤に巻き返す方法はほぼ貿易によるトップの足止めに限られてくる。ところがその貿易を行う頻度が増えるとゲーム時間が長引いてしまい（＝性質Aを満たさなくなる）、ゲーム体験の悪さがトレードオフにしかならない。
得点手段は建設と最長交易路2点・最大騎士力2点、発展カード1点（非公開）に限られており、得点状況は容易に計算できてしまう（性質C・Dを満たさない）。

### テラミスティカの場合

住居2点や交易所3点の恩恵タイルが生産力アップをそのまま得点にするシステムで得点も大きいので`解決策B`は部分的には満たしていない。しかし、投資行動自体が得点になるケースはそれ以外では少なく、得点手段は多様でゲーム終了時に集計される点数もそれなりに大きいため、得点状況は比較的複雑といえる（性質Cを概ね満たす）。
1ゲームは長いため、要件Aは満たさない。

### ツォルキンの場合

ワーカー数や資源自体も一応得点になることがあるが得点換算効率はあまり良くない場合が多く、技術トラック成長によって行動時の加点効率を上げたり、純粋に得点のためだけに行う記念碑建設などの点数が支配的な傾向がある（性質Bを満たす）。生産と得点のバランスに最後まで悩まなければならない点で中盤あたりからも紛れが多い。
得点手段はテラミスティカと同じくらい種類が多く、異なる戦略の対抗になることが多い（性質Cを満たす）。
大得点をする手段は主に記念碑で、集計がゲーム終盤に行われるが、足し上げることはそれほど難しくはないし

### ドミニオンの場合

生産力アップのための行動自体は得点にならない場合が多く、得点行動が生産力を下げることが多い（VPトークンによる得点とかその他もろもろの回避策はあるが）。そのため、序盤の生産力アップが勝敗に直結するというよりは、得点行動のバランスが難しい点が面白いと思っている。
加えて、ドミニオンは1ゲームが上の三つと比べてそれほど長くない点もゲームシステムに求められる緻密さを多少緩和できるとも言える（＝何ゲームも繰り返せば1ゲームあたりのゲーム体験の悪さがあったとしても緩和されやすい）。
