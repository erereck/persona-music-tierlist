import { readFile, writeFile } from 'node:fs/promises';

const path = 'public/tracks.json';
const tracks = JSON.parse(await readFile(path, 'utf8'));

const normalize = (value) => value
  .replace(/[〜～]/g, '~')
  .replace(/[‐–—−]/g, '-')
  .replace(/（/g, '(')
  .replace(/）/g, ')')
  .replace(/／/g, '/')
  .replace(/　/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const hasJapanese = (value) => /[\u3040-\u30ff\u3400-\u9fff]/u.test(value);
const makeMap = (pairs) => new Map(pairs.map(([from, to]) => [normalize(from), to]));

const p1 = makeMap([
  ['神取のテーマ～静か', "Kandori's Theme ~ Silence"],
  ['フィレモンムービー～セベク編1', 'Philemon Movie ~ SEBEC Chapter 1'],
  ['麻希のテーマ～明るい', "Maki's Theme ~ Cheerful"],
  ['ダンジョン～警察署', 'Dungeon ~ Police Station'],
  ['マークのテーマ', "Mark's Theme"],
  ['ダンジョン～廃工場地下通路', 'Dungeon ~ Abandoned Factory Underground Passage'],
  ['ダンジョン～セベク地上部', 'Dungeon ~ SEBEC Above Ground'],
  ['ダンジョン～セベク地下研究所', 'Dungeon ~ SEBEC Underground Research Lab'],
  ['神取のテーマ～野望', "Kandori's Theme ~ Ambition"],
  ['ディメンションロード', 'Dimension Road'],
  ['アキのテーマ', "Aki's Theme"],
  ['街2異変', 'City 2 Incident'],
  ['ダンジョン～遺跡', 'Dungeon ~ Ruins'],
  ['フィレモンムービー～セベク編2', 'Philemon Movie ~ SEBEC Chapter 2'],
  ['街2', 'City 2'],
  ['ダンジョン～ブラックマーケット', 'Dungeon ~ Black Market'],
  ['ハーレムクイーンに犯されたBAR', 'Bar Attacked by Harem Queen'],
  ['ダンジョン～カーマ宮殿', 'Dungeon ~ Kama Palace'],
  ['シャドゥ～シリアス', 'Shadow ~ Serious'],
  ['マイのテーマ', "Mai's Theme"],
  ['ダンジョン～洋館', 'Dungeon ~ House'],
  ['デヴァ・ユガ出現', 'Deva Yuga Appears'],
  ['神取のテーマ～哀愁', "Kandori's Theme ~ Sorrow"],
  ['ディメンションロード後デヴァ・ユガ風景', 'View of Deva Yuga Beyond Dimension Road'],
  ['ダンジョン～デヴァ・ユガ', 'Dungeon ~ Deva Yuga'],
  ['レイジのテーマ', "Reiji's Theme"],
  ['フィレモンムービー～セベク3', 'Philemon Movie ~ SEBEC Chapter 3'],
  ['意識のシャボン玉', 'Bubble of Consciousness'],
  ['麻希のテーマ～哀しい', "Maki's Theme ~ Sad"],
  ['ダンジョン～パンドラの巣（最深部）', "Dungeon ~ Pandora's Nest (Deepmost Area)"],
  ['パンドラ遭遇', 'Encounter with Pandora'],
  ['パンドラ登場', 'Pandora Enters'],
  ['戦闘～パンドラ', 'Battle ~ Pandora'],
  ['フィレモンムービー～セベク編4', 'Philemon Movie ~ SEBEC Chapter 4'],
  ['セベク編グッドエンディング', 'SEBEC Chapter Good Ending'],
  ['セベク編バッドエンディング2', 'SEBEC Chapter Bad Ending 2'],
  ['保健室（旧ダンジョン～冴子先生）', 'School Infirmary (Former Dungeon ~ Saeko-Sensei)'],
  ['ゆきののテーマ', "Yukino's Theme"],
  ['凍りつく学校', 'Frozen School'],
  ['雪の女王のテーマ～メイン', "Snow Queen's Theme ~ Main"],
  ['フィレモンムービー～雪の女王編1', 'Philemon Movie ~ Snow Queen Chapter 1'],
  ['氷の城', 'Ice Castle'],
  ['ダンジョン～氷の城', 'Dungeon ~ Ice Castle'],
  ['固く閉ざされた扉', 'Door, Frozen Shut'],
  ['ダンジョン～旧氷の城', 'Dungeon ~ Former Ice Castle'],
  ['会話～汎用1', 'Conversation ~ Generic 1'],
  ['アヤセに告白するトロ', 'Toro Confesses to Ayase'],
  ['雪の女王のテーマ～激しい', "Snow Queen's Theme ~ Violent"],
  ['意識', 'Consciousness'],
  ['ヒュプノスの塔進入', 'Entering Hypnos Tower'],
  ['ダンジョン～ヒュプノスの塔', 'Dungeon ~ Hypnos Tower'],
  ['通常戦闘', 'Normal Battle'],
  ['回復の泉', 'Spring of Restoration'],
  ['フィレモンムービー～雪の女王編2', 'Philemon Movie: Snow Queen Chapter 2'],
  ['ダンジョン～反夢界', 'Dungeon ~ Reverse Dream World'],
  ['ネムリン愛のテーマ', 'Theme of Nemurin Love'],
  ['ネメシスの塔進入', 'Entering Nemesis Tower'],
  ['ダンジョン～ネメシスの塔', 'Dungeon: Nemesis Tower'],
  ['雪の女王のテーマ～哀しい', "Snow Queen's Theme ~ Sad"],
  ['会話～汎用2', 'Conversation ~ Generic 2'],
  ['悪魔の山進入', "Entering Devil's Peak"],
  ['ダンジョン～悪魔の山', "Dungeon ~ Devil's Peak"],
  ['タイムカウントイベント（未使用）', 'Time Count Event (Unused)'],
  ['神秘', 'Mystery'],
  ['タナトスの塔進入', 'Entering Thanatos Tower'],
  ['タナトスの塔', 'Thanatos Tower'],
  ['冴子先生のテーマ', "Saeko-Sensei's Theme"],
  ['阿修羅女王登場', 'Asura Queen Enters'],
  ['戦闘～夜の女王', 'Battle ~ Night Queen'],
  ['雪の女王編バッドエンディング1', 'Snow Queen Chapter Bad Ending 1'],
  ['戻る学校', 'Restored School'],
  ['ラストイベント', 'Last Event'],
  ['雪の女王編グッドエンディング', 'Snow Queen Chapter Good Ending'],
  ['雪の女王編バッドエンディング2', 'Snow Queen Chapter Bad Ending 2'],
  ['オープニング', 'Opening'],
  ['デイドリーム1', 'Daydream 1'],
  ['デイドリーム2', 'Daydream 2'],
  ['ネームエントリー', 'Name Entry'],
  ['エリーのテーマ', "Elly's Theme"],
  ['ダンジョン～学校（放課後）', 'Dungeon ~ School (After School)'],
  ['南条のテーマ', "Nanjo's Theme"],
  ['街1平穏', 'City 1 Tranquility'],
  ['ダンジョン～街1商店街（東口）', 'Dungeon: City 1 Shopping District (East Entrance)'],
  ['カジノ', 'Casino'],
  ['コンビニ', 'Convenience Store'],
  ['街1＆2商店街（西口）', 'City 1 & 2 Shopping District (West Entrance)'],
  ['ブティック', 'Boutique'],
  ['サトミタダシ薬局店のうた', 'Satomi Tadashi Pharmacy Song'],
  ['ファーストフード', 'Fast Food'],
  ['千年万年堂', 'Sennen-Mannen Hall'],
  ['医者', 'Doctor'],
  ['戦闘～病院（異変前）', 'Battle ~ Hospital (Before the Incident)'],
  ['汎用BGM-B', 'Generic BGM-B'],
  ['戦闘～覚醒', 'Battle: Awakening'],
  ['ダンジョン～病院（異変後）', 'Dungeon ~ Hospital (After the Incident)'],
  ['街1異変後', 'City 1 After the Incident'],
  ['神社（フィレモンの声）', "Shrine (Philemon's Voice)"],
  ['アガスティアの樹', 'Agastya Tree'],
  ['ダンジョン～街1学校（再訪）', 'Dungeon ~ City 1 School (Revisited)'],
  ['戦闘～中ボス', 'Battle ~ Mid Boss'],
  ['体育館裏の穴', 'The Hole Behind the Gym'],
  ['ブラウンのテーマ', "Brown's Theme"],
  ['戦闘～テッソ', 'Battle ~ Tesso'],
  ['アヤセのテーマ', "Ayase's Theme"],
  ['ベルベットルーム', 'Velvet Room'],
  ['ベルベットルーム～合体シーン', 'Velvet Room ~ Fusion Scene'],
  ['セベク編バッドエンディング1', 'SEBEC Chapter Bad Ending 1'],
  ['麻希のテーマ～寂しい', "Maki's Theme ~ Loneliness"],
  ['舞耶のテーマ', "Maya's Theme"],
  ['ダンジョン～その1', 'Dungeon: No. 1'],
  ['フーリッシュボスのテーマ', 'Foolish Struggle'],
  ['サトミタダシ薬局店のうた～俺バージョン', 'Satomi Tadashi Pharmacy Song: Ore Version'],
  ['サトミタダシ薬局店のうた～JAZZバージョン', 'Satomi Tadashi Pharmacy Song: Jazz Version'],
]);

const p2is = makeMap([
  ['オープニング', 'Opening'], ['タイトル', 'Title Screen'], ['ヒーロー・テーマ', "Hero's Theme"],
  ['七姉妹学園A', 'Seven Sisters High A'], ['乗物操縦', 'Driving'], ['ギンコ・テーマ', "Ginko's Theme"],
  ['緊張', 'Tension'], ['コミカル路線', 'Punchline'], ['フィレモン・テーマ', "Philemon's Theme"],
  ['予感', 'Premonition'], ['MAP珠閒瑠市', 'Sumaru City'], ['葛葉探偵事務所', 'Kuzunoha Detective Agency'],
  ['サトミタダシ～平坂店', 'Satomi Tadashi: Hirasaka'], ['ラーメンしらいし', 'Shiraishi Ramen'],
  ['サトミタダシ～蓮華台店', 'Satomi Tadashi: Rengedai'], ['サトミタダシ～連華台店', 'Satomi Tadashi: Rengedai'],
  ['本丸公園', 'Honmaru Park'], ['シルバーマン邸', 'Silverman Manor'], ['舞耶・テーマ', "Maya's Theme"],
  ['メイン・テーマB', 'Main Theme B'], ['ゆきの・テーマ', "Yukino's Theme"], ['JOKER・テーマ', "Joker's Theme"],
  ['悪の胎動', 'Scent of Evil'], ['ボス戦闘', 'Boss Battle'], ['サトミタダシ～夢崎店', 'Satomi Tadashi: Yumesaki'],
  ['ソディアック', 'Zodiac'], ['イベントシーンA', 'Event Scene A'], ['春日山高校', 'Kasugayama High'],
  ['防空壕', 'Air Raid Shelter'], ['安らぎ', 'Peace'], ['狂宴', 'Mad Dance'], ['戦闘', 'Battle'],
  ['戦闘リザルト', 'Results'], ['全ての人の魂の詩', "The Poem for Everyone's Souls"],
  ['ベルベットルーム～Gymnopedie', 'Velvet Room # 2'], ['ベルベットルーム～月の光', 'Velvet Room # 3'],
  ['時間城', 'Time Castle'], ['ムー大陸', 'Mu'], ['カジノ～ムー大陸', 'Mu Casino'], ['珠閒瑠ジニー', 'Sumaru Genie'],
  ['柊サイコセラピー', 'Hiiragi Psychotherapy'], ['ギガ・マッチョ', 'Giga Macho'],
  ['流星野郎のSOUND・MAX', 'Meteor Masa To The Max'], ['CDショップ～ギガ・マッチョ', 'Giga Macho Records'],
  ['青葉公園', 'Aoba Park'], ['野外音楽堂', 'Outdoor Concert Hall'], ['ギンコ・テーマ (悲しい)', "Ginko's Theme (Sad)"],
  ['仮面党4幹部', 'Masked Executives'], ['東亜ディフェンス', 'Toua Defense'], ['富永カイロプラクティック', 'Tominaga Chiropractic'],
  ['ROSA-CANDIDA～青葉店', 'Rosa Candida: Aoba'], ['サトミタダシ～青葉店', 'Satomi Tadashi: Aoba'],
  ['スマイル平坂', 'Smile Hirasaka'], ['foolishボス', 'Foolish Struggle'], ['勇者登場', "Hero's Appearance"],
  ['トリッシュの泉', "Trish's Spring"], ['回想 (苦しい)', 'Recollection (Pain)'], ['ゴールド', 'GOLD'],
  ['サトミタダシ～港南店', 'Satomi Tadashi: Kounan'], ['倫敦屋', 'London Clothier'], ['ルナパレス港南', 'Lunar Palace Kounan'],
  ['イン・ラケチ', "In Lak'ech"], ['イベントシーンB', 'Event Scene B'], ['アラヤ神社', 'Alaya Shrine'],
  ['岩戸山', 'Mt. Iwato'], ['ペルソナ様', 'Persona Game'], ['摩耶・テーマ (悲しい)', "Maya's Theme (Sad)"],
  ['舞耶・テーマ (悲しい)', "Maya's Theme (Sad)"], ['蝸牛山', 'Mt. Katatsumuri'], ['ゆきの・テーマ (悲しい)', "Yukino's Theme (Sad)"],
  ['聖槍騎士団', 'Order of the Holy Lance'], ['カラコル', 'Caracol'], ['シャドウ', 'Shadow'],
  ['黒須・テーマ', 'Blooming Flower'], ['MAP珠閒瑠市～シバルバー', 'Outer Xibalba'],
  ['ROSA-CANDIDA～連華台店', 'Rosa Candida: Rengedai'], ['ROSA-CANDIDA～蓮華台店', 'Rosa Candida: Rengedai'],
  ['公共施設', 'Public Facility'], ['宝瓶宮', 'Aquarius Temple'], ['金牛宮', 'Taurus Temple'], ['天蠍宮', 'Scorpio Temple'],
  ['栄吉・テーマ (悲しい)', "Eikichi's Theme (Sad)"], ['回想 (懐かしい)', 'Recollection (Nostalgia)'],
  ['獅子宮', 'Leo Temple'], ['七姉妹学園B', 'Seven Sisters High B'], ['天の川', 'Silver River'], ['シバルバー', 'Xibalba'],
  ['廃工場', 'Abandoned Factory'], ['危険', 'Danger'], ['橿原', 'Kashihara'], ['最終ボス戦闘', 'Final Battle'],
  ['摩耶死す', "Maya's Death"], ['舞耶死す', "Maya's Death"], ['ペルソナ音頭', 'Persona Dance'],
]);

const p2ep = makeMap([
  ['オープニング', 'Opening'], ['タイトル', 'Title'], ['舞耶（テーマ2）', 'Maya (Theme 2)'], ['七姉妹学園', 'Seven Sisters High School'],
  ['時間城', 'Time Castle'], ['蝸牛山', 'Mt. Katatsumuri'], ['森本病院', 'Morimoto Hospital'], ['謎', 'Enigma'],
  ['ボス戦闘', 'Boss Battle'], ['珠閒瑠ジニー', 'Sumaru Genie'], ['相性占い', 'Affinity Readings'], ['日常', 'Everyday'],
  ['赤提灯しらいし', 'Akachochin Shiraishi'], ['サトミタダシ平坂店', 'Satomi Tadashi: Hirasaka'],
  ['クラブ・ゾディアック', 'Club Zodiac'], ['TONY’S SHOP(不思議アイテム店)', "TONY'S SHOP (Wonder Item Store)"],
  ['青葉公園', 'Aoba Park'], ['ペントハウス', 'Penthouse'], ['管制室', 'Management Room'], ['理学研究所', 'Science Laboratory'],
  ['富永カイロプラクティック', 'Tominaga Chiropractic'], ['裏珠閒瑠TV', 'Other Side Sumaru TV'],
  ['柊サイコセラピー', 'Hiiragi Psychotherapy'], ['ギガ・マッチョ', 'Giga Macho'], ['春日山高校', 'Kasugayama High'],
  ['ベルベットナナシアレンジ', 'Velvet Room: Nanashi Arrangement'], ['戦闘', 'Battle'], ['珠閒瑠TV', 'Sumaru TV'],
  ['ムー大陸', 'Mu Continent'], ['スマイル平坂', 'Smile Hirasaka'], ['廃工場', 'Abandoned Factory'],
  ['サトミタダシ夢崎店', 'Satomi Tadashi: Yumezaki'], ['日輪丸', 'Nichirinmaru'], ['幻想', 'Illusions'], ['海底遺跡', 'Undersea Ruins'],
  ['回想（懐かしい）', 'Reminiscence (Beloved)'], ['地下鉄工事現場', 'Subway Construction Site'],
  ['東亜ディフェンス（特殊武器店）', 'Toa Defense (Special Weapon Store)'], ['ネコマタ噂事務所', 'Nekomata Rumor Office'],
  ['アメノトリフネ', 'Ameno Torifune'], ['珠閒瑠城', 'Sumaru Castle'], ['巨悪', 'A Great Evil'], ['モナドマンダラ', 'Monado Mandala'],
  ['回想（悲しい）', 'Reminiscence (Sad)'], ['EX最終戦闘', 'EX Final Battle'], ['ペルソナマンボ', 'Persona Mambo'], ['ペルソナロック', 'Persona Rock'],
  ['戦闘リザルト', 'Battle Result'],
]);

const p3 = makeMap([
  ['全ての人の魂の詩', 'Aria of the Soul'], ['はじまり', 'Beginning'], ['この不思議な感覚', 'This Mysterious Feeling'],
  ['シャドウ', 'Shadow'], ['ペルソナ発動', 'Persona Invocation'], ['避けられぬ戦い', 'Unavoidable Battle'], ['やすらぎ', 'Peace'],
  ['巌戸台分寮', 'Iwatodai Dorm'], ['戦いのあと', 'After the Battle'], ['ポロニアンモール', 'Paulownia Mall'], ['嫌な予感', 'Bad Feeling'],
  ['試験中…', 'During the Exams'], ['深層心理', 'Deep Mentality'], ['これでいいんだ…', 'This is how it should be...'], ['京都', 'Kyoto'],
  ['時価ネットたなか', "Tanaka's Amazing Commodities"], ['10年前の記憶', 'Memories from 10 Years Ago'], ['心の力', 'Strength of Heart'],
  ['街の記憶', 'Memories of the City'], ['学園の記憶', 'Memories of the Campus'],
  ['Living With Determination -巌戸台分寮アレンジ-', 'Living With Determination -Iwatodai Dorm Arrangement-'],
  ['暗闇より出でしもの', 'What Lies in the Darkness'], ['全ての人の魂の戦い', 'Battle Hymn of the Soul'], ['決意', 'Determination'],
  ['絆', 'Enduring Bonds'], ['私が守るから', 'I Will Protect You'], ['キミの記憶', 'Memories of You'], ['君の記憶', 'Memories of You'],
]);

const p3fes = makeMap([
  ['Brand New days -はじまり-', 'Brand New days -The Beginning-'], ['時の狭間', 'The Abyss of Time'], ['雪の女王', "Snow Queen's Theme"],
  ['舞耶・テーマ', "Maya's Theme"], ['扉の間', 'Desert of Doors'], ['それぞれの過去', 'Glimpse of the Past'], ['ペルソナ', 'Persona'],
  ['時間城', 'Time Castle'], ['封印', 'Seal'], ['闇', 'Darkness'],
]);

const p3p = makeMap([
  ['放課後', 'After School'], ['やさしい気持ち', 'Warm Feeling'],
]);

const p3reload = makeMap([
  ['全ての人の魂の詩', 'Aria of the Soul'], ['この不思議な感覚', 'This Mysterious Feeling'], ['シャドウ', 'Shadow'],
  ['避けられぬ戦い', 'Unavoidable Battle'], ['やすらぎ -Reload-', 'Peace -Reload-'], ['巌戸台分寮 -Reload-', 'Iwatodai Dorm -Reload-'],
  ['戦いのあと', 'After the Battle'], ['ポロニアンモール -Reload-', 'Paulownia Mall -Reload-'], ['嫌な予感', 'Bad Feeling'],
  ['試験中…', 'During the Exams'], ['深層心理 -Reload-', 'Deep Mentality -Reload-'], ['これでいいんだ…', 'This is How It Should Be…'],
  ['京都', 'Kyoto'], ['時価ネットたなか -Reload-', "Tanaka's Amazing Commodities -Reload-"],
  ['10年前の記憶 -追想-', 'Memories from 10 Years Ago -Recollection-'], ['10年前の記憶 -対峙-', 'Memories from 10 Years Ago -Confrontation-'],
  ['心の力', 'Strength of Heart'], ['街の記憶', 'Memories of the City'], ['学園の記憶', 'Memories of the School'],
  ['Living With Determination -巌戸台分寮アレンジ-', 'Living With Determination -Iwatodai Dorm Arrangement-'],
  ['暗闇より出でしもの', 'What Lies in the Darkness'], ['全ての人の魂の戦い', 'Battle Hymn of the Soul'], ['決意', 'Determination'],
  ['絆', 'Enduring Bonds'], ['私が守るから -Reload-', 'I Will Protect You -Reload-'], ['キミの記憶 -Reload-', 'Memories of You -Reload-'],
  ['キミの記憶 -Reload Instrumental-', 'Memories of You -Reload Instrumental-'],
]);

const p4 = makeMap([
  ['記憶の片隅', 'Glimpse of a Memory'], ['全ての人の魂の詩', 'Aria of the Soul'], ['マヨナカテレビ', 'Midnight Channel'],
  ['そこにいるのは誰？', "Who's There?"], ['推理', 'Deduction'], ['狂気の境界線', 'Border of Insanity'], ['人の夫', "Someone Else's Man"],
  ['ケロリンMAGIC!', 'Quelorie Magic!'], ['覚醒', 'Awakening'], ['霧', 'The Fog'], ['ジュネスのテーマ', 'Junes Theme'],
  ['心の力 (P4ver.)', 'Strength of Heart (P4 ver.)'], ['夢想曲', 'Traumerei'], ['推理-another version-', 'Deduction -another version-'],
  ['回廊', 'Corridor'],
]);

const p4g = makeMap([
  ['海へ行こーぜ', "Let's Hit the Beach!"], ['マヨナカ横断ミラクルクイズ', 'Midnight Trivia Miracle Quiz'],
  ['みんなで初詣', "New Year's Shrine Visit with Everyone"], ['湯けむり旅情大作戦', 'Operation Steamy Vacation'],
  ['虚ろの森の少女', 'Girl of the Hollow Forest'], ['記憶', 'Memories'], ['Never More ～おかえり～', 'Never More -Welcome Home-'],
  ['真・ミツオ転生', 'Revelations: Mitsuo'],
]);

const p5 = makeMap([
  ['脱出', 'Escape'], ['逃走～逮捕', 'Getaway & Arrest'], ['尋問室', 'Interrogation Room'], ['回想～暗示', 'Recollection & Foreboding'],
  ['全ての人の魂の詩', 'Hymn of the Soul'], ['出会い', 'Meeting'], ['異世界へ', 'Into the Metaverse'], ['緊迫', 'Tension'], ['覚醒', 'Awakening'],
  ['王と王妃と奴隷 -another version-', 'King, Queen, and Slaves (Another Version)'], ['王と王妃と奴隷', 'King, Queen, and Slaves'],
  ['勝利', 'Triumph'], ['告白／秘密', 'Confession / Secret'], ['告白／秘密 -piano version-', 'Confession / Secret (Piano Version)'],
  ['色欲の崩壊', 'The Collapse of Lust'], ['終わらない日々', 'Endless Days'], ['スターフォルネウス', 'Star Forneus'],
  ['パンチdeアウチ', 'Punch Ouch'], ['垢太郎鉄道', 'Train of Life'], ['豪血寺一味', 'Power Intuition'], ['はったれ五右衛門', 'Legend of Gambla Goemon'],
  ['プロゴルファー猿田彦', 'Pro Golfer Sarutakhiko'], ['メメントス', 'Mementos'], ['BAR にゅぅカマー', 'Crossroads'], ['疑惑', 'Suspicion'],
  ['夏の日の思い出', 'Memories of Summer'], ['灼熱の砂漠を往く', 'Treading on Scorched Sand'],
  ['母のいた日々 -another version-', 'When Mother Was There (Another Version)'], ['母のいた日々', 'When Mother Was There'],
  ['憤怒の崩壊', 'The Collapse of Wrath'], ['ビッグバン・バーガーのマーチ', 'Big Bang Burger March'], ['クレーンゲーム', 'Crane Game'],
  ['プラネタリウム', 'Planetarium'], ['家電量販店', 'Home Electronics Store'], ['おかえりなさいませ！ご主人様♡', 'Welcome Home, Master!'],
  ['懺悔のお時間', 'Time to Repent'], ['デスティニー・ランド', 'Destinyland'], ['闇ネットたなか', "Tanaka's Shady Commodities"],
  ['つまらない', 'So Boring'], ['廃人化', 'Mental Shutdown'], ['放送事故', 'Accident on-Air'], ['不穏', 'Disquiet'],
  ['脱出 -another version-', 'Escape (Another Version)'], ['逃走 -another version-', 'Getaway (Another Version)'],
  ['底知れぬ傲慢', 'Limitless Pride'], ['方舟', 'Ark'], ['次期総理の船路に捧げる即興曲', 'Impromptu for the Next Prime Minister'],
  ['欲望', 'Desire'], ['傲慢の崩壊', 'The Collapse of Pride'], ['自由と安心', 'Freedom and Peace'], ['対峙', 'Confrontation'],
  ['星と僕らと -piano version-', 'Hoshi To Bokura To (Piano Version)'], ['星と僕らと', 'Hoshi To Bokura To'],
]);

const p5r = makeMap([
  ['メメントス・上層', 'Mementos: Upper Area'], ['メメントス・中層', 'Mementos: Mid Area'], ['もう一つの世界へ', 'To the Other World'],
  ['メメントス・下層', 'Mementos: Lower Area'], ['フェザーマンシーカー', 'Featherman Seeker'], ['あいつはトリック☆スタ→', "He's a Trickster☆"],
  ['初詣', "New Year's Visit"], ['わたしがあなたに...', 'You and I'], ['メメントス・新層', 'Mementos: New Area'],
  ['崩壊～覚悟', 'Ruin to Resolution'], ['僕らの光', 'Our Light'],
]);

const mapsByEdition = {
  p1_ps1: p1,
  p2_is_ps1: p2is,
  p2_is_psp: p2is,
  p2_ep_ps1: p2ep,
  p2_ep_psp: p2ep,
  p3_ps2: p3,
  p3_fes: p3fes,
  p3p: p3p,
  p3_reload: p3reload,
  p4_ps2: p4,
  p4g: p4g,
  p5_ps4: p5,
  p5r: p5r,
};

let changed = 0;
const changedByEdition = {};
for (const track of tracks) {
  if (!hasJapanese(track.title)) continue;
  const map = mapsByEdition[track.edition];
  if (!map) continue;
  const replacement = map.get(normalize(track.title));
  if (!replacement || replacement === track.title) continue;
  track.title = replacement;
  changed += 1;
  changedByEdition[track.edition] = (changedByEdition[track.edition] ?? 0) + 1;
}

await writeFile(path, JSON.stringify(tracks), 'utf8');

const remaining = tracks.filter((track) => hasJapanese(track.title));
console.log(`Changed ${changed} track titles.`);
console.log('Changed by edition:', JSON.stringify(changedByEdition));
console.log(`Remaining titles containing Japanese: ${remaining.length}`);
for (const track of remaining) {
  console.log(`${track.id}\t${track.edition}\t${track.title}`);
}
