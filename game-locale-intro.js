/* Six-language onboarding and shop tour. */
(() => {
const rows=String.raw`
歡迎登艦，指揮官|Welcome aboard, Commander|艦へようこそ、指揮官|승선을 환영합니다, 지휘관|Добро пожаловать, командир|Bienvenido a bordo, comandante
守住核心、組建砲台陣容，挑戰更遠的星域。完成這段航程，領取你的第一份補給。|Defend the core, build your turret lineup and explore further. Complete this tour to claim your first supplies.|コアを守り、砲台を編成して遠くの星域へ。案内を終えて最初の補給を受け取りましょう。|코어를 지키고 포탑을 편성해 더 먼 성역에 도전하세요. 안내를 마치면 첫 보급을 받습니다.|Защищайте ядро, собирайте турели и покоряйте новые сектора. Пройдите обучение и получите первые припасы.|Defiende el núcleo, forma tu equipo y explora nuevos sectores. Completa el recorrido para recibir suministros.
讓第一發更有力|Make your first shot count|最初の一撃を強く|첫 발을 더 강하게|Усильте первый выстрел|Potencia el primer disparo
砲台會自動攻擊。點物攻強化，提升傷害；擊破敵機就能取得本局金幣。|Turrets attack automatically. Upgrade physical attack for more damage. Destroy enemies to earn gold for this run.|砲台は自動攻撃。物攻を強化して威力を上げ、敵機を倒して今回のゴールドを獲得します。|포탑은 자동 공격합니다. 물리 공격을 강화해 피해를 높이고 적을 격파해 이번 판 골드를 얻으세요.|Турели атакуют автоматически. Улучшайте физический урон и уничтожайте врагов ради золота на этот бой.|Las torretas atacan solas. Mejora el ataque físico y destruye enemigos para ganar oro durante la partida.
選擇你的下一場戰役|Choose your next battle|次の戦いを選ぼう|다음 전투 선택|Выберите следующий бой|Elige tu próxima batalla
三種模式，各有目標。點選圖示，認識每種玩法。|Three modes, three goals. Tap each icon to learn how they work.|3つのモードにはそれぞれ目標があります。各アイコンを押して確認しましょう。|세 모드마다 목표가 다릅니다. 아이콘을 눌러 알아보세요.|Три режима с разными целями. Нажмите каждый значок, чтобы узнать правила.|Tres modos con objetivos distintos. Toca los iconos para conocerlos.
組建你的砲台陣容|Build your turret lineup|砲台編成を組もう|포탑 편성 구성|Соберите состав турелей|Forma tu equipo de torretas
在工坊收集碎片與核心、組裝砲台，再裝備出戰。不同砲台有各自的子彈與能力。|Collect fragments and cores in the workshop, assemble turrets and equip them. Each turret has its own projectiles and abilities.|工房で欠片とコアを集め、砲台を組み立てて装備。砲台ごとに弾や能力が異なります。|공방에서 조각과 코어를 모아 포탑을 조립하고 장착하세요. 포탑마다 탄환과 능력이 다릅니다.|В мастерской собирайте фрагменты и ядра, создавайте и оснащайте турели. У каждой свои снаряды и способности.|Reúne fragmentos y núcleos en el taller, monta torretas y equípalas. Cada una tiene proyectiles y habilidades propios.
出戰前，先認識裝備與敵人|Know your gear and enemies|装備と敵を知ろう|장비와 적 알아보기|Изучите технику и врагов|Conoce tu equipo y al enemigo
圖鑑能查看砲台的血量、能力與取得方式，也能認識每種敵機的特性。|The archive shows turret HP, abilities and how to obtain them, plus the traits of every enemy.|図鑑で砲台のHP・能力・入手方法と、各敵機の特徴を確認できます。|도감에서 포탑 체력, 능력, 획득 방법과 적기별 특성을 확인하세요.|Архив показывает HP, способности и способы получения турелей, а также свойства каждого врага.|El archivo muestra vida, habilidades y cómo obtener torretas, además de las características de cada enemigo.
完成任務，領取補給|Complete missions for supplies|任務を終えて補給を受取|임무 완료 후 보급 받기|Выполняйте задания ради припасов|Cumple misiones y recibe suministros
這裡有每日、每週任務與星際信箱。達成目標後回來領獎，累積下一場的資源。|Find daily and weekly missions and your inbox here. Return to claim rewards and prepare resources for your next battle.|日次・週次任務と受信箱があります。目標達成後に報酬を受け取り、次の戦いに備えましょう。|일일·주간 임무와 우편함입니다. 목표를 달성한 뒤 보상을 받아 다음 전투를 준비하세요.|Здесь ежедневные и еженедельные задания и почта. Выполняйте цели и забирайте ресурсы для следующего боя.|Aquí están las misiones diarias, semanales y el correo. Cumple objetivos y vuelve por recursos para tu próxima batalla.
把絕招留給關鍵時刻|Save skills for the right moment|切り札は勝負どころで|중요한 순간에 필살기 사용|Используйте навыки вовремя|Usa habilidades en el momento justo
戰鬥中可施放已裝備的絕招。查看效果與冷卻時間，決定何時解圍或集中火力。|Use equipped skills in battle. Check their effects and cooldowns to choose when to escape danger or focus fire.|装備した必殺技を戦闘中に使用できます。効果とクールダウンを確認し、危機脱出や集中攻撃に使いましょう。|장착한 필살기를 전투 중 사용합니다. 효과와 재사용 시간을 확인해 위기를 벗어나거나 화력을 집중하세요.|Применяйте экипированные навыки в бою. Изучите эффекты и перезарядку, чтобы вовремя спастись или сосредоточить огонь.|Usa las habilidades equipadas en combate. Consulta efectos y recargas para escapar del peligro o concentrar el fuego.
絕招|Skills|必殺技|필살기|Навыки|Habilidades
把成長留到下一場|Carry progress into the next battle|成長を次の戦いへ|다음 전투까지 성장 유지|Сохраните силу для следующего боя|Conserva tu progreso
本局金幣用於戰鬥強化；黑曜石可投入永久強化，提升後續出戰的基礎能力。|Gold upgrades last for this run. Spend Obsidian on permanent upgrades to improve your starting stats in future runs.|ゴールド強化は今回限り。黒曜石の永久強化は次回以降の初期能力を高めます。|골드 강화는 이번 판에 적용됩니다. 흑요석 영구 강화로 다음 출격의 기본 능력을 높이세요.|Золото улучшает вас на один бой. Обсидиан даёт постоянные улучшения начальных характеристик.|El oro mejora esta partida. Usa obsidiana en mejoras permanentes para aumentar los atributos iniciales de futuras partidas.
永久強化|Permanent upgrades|永久強化|영구 강화|Постоянные улучшения|Mejoras permanentes
開啟你的補給站|Visit your supply station|補給所を開こう|보급소 방문|Откройте станцию снабжения|Visita la estación de suministros
認識 VIP 訂閱、新手禮包與兩種卡池。完成入門後，兩種卡池各送一次免費十連抽。|Explore the VIP subscription, starter pack and both supply pools. Finish onboarding for one free ten-pull in each pool.|VIP定期購入、新人パック、2種類の補給を紹介します。入門完了で各補給に無料10連を1回プレゼント。|VIP 구독, 초보자 패키지와 두 뽑기를 알아보세요. 입문 완료 시 각 뽑기에서 무료 10연 1회를 받습니다.|Узнайте о VIP-подписке, стартовом наборе и двух пулах. За обучение получите по одному бесплатному набору из 10 призывов.|Conoce la suscripción VIP, el paquete inicial y los dos sorteos. Al terminar tendrás una tirada de diez gratis en cada uno.
看看自己走了多遠|See how far you've come|自分の進歩を確かめよう|성장 기록 확인|Оцените свой прогресс|Comprueba tu progreso
全球排行記錄玩家的作戰進度。持續突破波數與 Tier，就能挑戰更高的位置。|The global leaderboard tracks combat progress. Push through more waves and Tiers to climb higher.|世界ランキングは作戦進行を記録します。ウェーブとTierを突破して上位を目指しましょう。|세계 순위에 전투 진행이 기록됩니다. 더 높은 웨이브와 Tier에 도전해 순위를 올리세요.|Мировой рейтинг отражает боевой прогресс. Проходите больше волн и Tier, чтобы подняться выше.|El ranking global registra el progreso. Supera más oleadas y Tiers para subir puestos.
全球排行|Global Rank|世界順位|세계 순위|Рейтинг|Ranking
從五座砲台，開始你的排位旅程|Start ranked with five turrets|5種の砲台でランク戦へ|포탑 5종으로 랭크전 시작|Начните рейтинг с пяти турелей|Empieza clasificatoria con cinco torretas
首次點排位先完成操作教學，領兩座 G1 砲台。再完成兩場一般模式，各領一座；加上初始砲台，就能帶五砲出戰。|Your first ranked visit starts training and awards two G1 turrets. Then finish two normal runs for one turret each. With your starting cannon, you'll have five.|初回ランク戦で操作訓練を終えるとG1砲台を2種獲得。通常モードを2回完走して各1種を受け取り、初期砲台と合わせて5種になります。|첫 랭크 진입 시 조작 훈련으로 G1 포탑 2종을 받습니다. 일반 모드 두 판을 마쳐 각각 1종씩 받으면 기본 포탑과 합쳐 5종입니다.|При первом входе в рейтинг пройдите обучение за две турели G1. Затем завершите два обычных боя за ещё две. Вместе с начальной получится пять.|En tu primera visita al modo clasificatorio, completa el tutorial para dos G1. Termina dos partidas normales para otra por partida. Con la inicial tendrás cinco.
尚未儲存，請再試一次。|Not saved yet. Please try again.|まだ保存できていません。再試行してください。|저장되지 않았습니다. 다시 시도하세요.|Не сохранено. Повторите попытку.|Aún no se guardó. Reinténtalo.
結束導覽|End tour|案内を終了|안내 종료|Завершить обзор|Terminar recorrido
遊戲入門完成|Onboarding complete|ゲーム入門完了|게임 입문 완료|Обучение завершено|Introducción completada
2,000 黑曜石 · 兩種卡池各 10 抽|2,000 Obsidian · 10 pulls in each pool|黒曜石2,000・両補給に各10連|흑요석 2,000 · 각 뽑기 10연|2 000 обсидиана · По 10 призывов в двух пулах|2000 de obsidiana · 10 tiradas en cada sorteo
獎勵尚未完成儲存，請重試領取。|Reward not saved yet. Please claim again.|報酬が未保存です。再度受け取ってください。|보상이 저장되지 않았습니다. 다시 수령하세요.|Награда не сохранена. Получите её повторно.|La recompensa no se guardó. Vuelve a reclamarla.
FIRST FLIGHT · 遊戲入門|FIRST FLIGHT · Getting started|FIRST FLIGHT・ゲーム入門|FIRST FLIGHT · 게임 입문|FIRST FLIGHT · Обучение|FIRST FLIGHT · Introducción
✦ 星隕補給艙|✦ Meteor Supply|✦ 星隕補給|✦ 유성 보급|✦ Метеоритное снабжение|✦ Suministro meteórico
10 抽|10 pulls|10連|10연|10 призывов|10 tiradas
♛ 皇極星庫|♛ Imperial Vault|♛ 皇極星庫|♛ 황극 성고|♛ Имперское хранилище|♛ Bóveda imperial
已領取入門獎勵|Starter reward claimed|入門報酬受取済み|입문 보상 수령 완료|Стартовая награда получена|Recompensa inicial recibida
完成教學獎勵|Training completion reward|訓練完了報酬|훈련 완료 보상|Награда за обучение|Recompensa por el tutorial
開始航程|Begin the journey|航程を開始|여정 시작|Начать путь|Comenzar el viaje
02 / 11 · 自動戰鬥與強化|02 / 11 · Auto combat and upgrades|02 / 11・自動戦闘と強化|02 / 11 · 자동 전투와 강화|02 / 11 · Автобой и улучшения|02 / 11 · Combate automático y mejoras
核心 HP {0} / {1}|Core HP {0} / {1}|コアHP {0} / {1}|코어 HP {0} / {1}|HP ядра {0} / {1}|Vida del núcleo {0} / {1}
擊破 {0} / {1}|Defeated {0} / {1}|撃破 {0} / {1}|격파 {0} / {1}|Уничтожено {0} / {1}|Destruidos {0} / {1}
金幣 {0}|Gold {0}|ゴールド {0}|골드 {0}|Золото {0}|Oro {0}
物攻 {0} → {1}|Physical {0} → {1}|物攻 {0} → {1}|물공 {0} → {1}|Физ. урон {0} → {1}|Ataque físico {0} → {1}
11 金幣 · 點擊強化|11 gold · Tap to upgrade|11ゴールド・タップで強化|골드 11 · 눌러 강화|11 золота · Улучшить|11 de oro · Toca para mejorar
練習戰場：中央砲台自動攻擊三架敵機|Training field: the central turret attacks three enemies automatically|練習戦場：中央砲台が敵機3機を自動攻撃|훈련장: 중앙 포탑이 적기 3대를 자동 공격|Учебное поле: центральная турель автоматически атакует трёх врагов|Campo de práctica: la torreta central ataca automáticamente a tres enemigos
擊破三架敵機後繼續|Defeat three enemies to continue|敵機3機を倒すと次へ|적기 3대 격파 후 계속|Уничтожьте троих для продолжения|Destruye tres enemigos para continuar
物攻 {0}|Physical {0}|物攻 {0}|물공 {0}|Физ. урон {0}|Ataque físico {0}
已強化 ✓|Upgraded ✓|強化済み ✓|강화 완료 ✓|Улучшено ✓|Mejorado ✓
金幣|Gold|ゴールド|골드|Золото|Oro
FLIGHT READY · 入門完成|FLIGHT READY · Training complete|FLIGHT READY・入門完了|FLIGHT READY · 입문 완료|FLIGHT READY · Обучение завершено|FLIGHT READY · Tutorial completo
航程準備完成|Ready for departure|出撃準備完了|출격 준비 완료|Готовы к вылету|Listo para partir
抽卡券優先使用。登入後，到商店「星際卡包」開啟十連抽。|Tickets are used first. Sign in, then visit Supply Packs in the store for your ten-pulls.|抽選券を優先消費します。ログイン後、ショップの補給パックで10連を引けます。|뽑기권을 먼저 사용합니다. 로그인 후 상점 보급 팩에서 10연 뽑기를 하세요.|Сначала расходуются билеты. Войдите и откройте наборы снабжения в магазине для 10 призывов.|Los boletos se usan primero. Inicia sesión y ve a los paquetes de suministros para tus diez tiradas.
返回大廳|Return home|ホームに戻る|홈으로|В главное меню|Volver al inicio
領取全部入門獎勵|Claim all starter rewards|入門報酬をすべて受取|모든 입문 보상 받기|Получить все стартовые награды|Recibir recompensas iniciales
{0} / 11 · 遊戲入門|{0} / 11 · Getting started|{0} / 11・ゲーム入門|{0} / 11 · 게임 입문|{0} / 11 · Обучение|{0} / 11 · Introducción
先點選「{0}」|First tap “{0}”|まず「{0}」をタップ|먼저 “{0}” 누르기|Сначала нажмите «{0}»|Primero toca «{0}»
下一站|Next stop|次へ|다음으로|Далее|Siguiente
一般模式|Normal mode|通常モード|일반 모드|Обычный режим|Modo normal
守住核心，突破波次|Defend the core, clear waves|コアを守りウェーブを突破|코어 방어와 웨이브 돌파|Защищайте ядро, проходите волны|Defiende el núcleo, supera oleadas
選擇作戰 Tier，抵擋一波波敵機。局內用金幣強化，每 25 波選特技卡；突破進度後開放更高 Tier。|Choose a Tier and hold off enemy waves. Spend gold on upgrades and choose a skill card every 25 waves. Progress unlocks higher Tiers.|作戦Tierを選んで敵の波を防衛。ゴールドで強化し、25ウェーブごとにスキルカードを選択。進行で上位Tierを解放します。|Tier를 선택해 적 웨이브를 막으세요. 골드로 강화하고 25웨이브마다 스킬 카드를 선택합니다. 진행하면 높은 Tier가 열립니다.|Выберите Tier и отражайте волны. Улучшайтесь за золото, выбирайте карту навыка каждые 25 волн и открывайте более высокие Tier.|Elige un Tier y resiste oleadas. Mejora con oro y elige una carta cada 25 oleadas. El progreso abre Tiers superiores.
累積黑曜石與砲台成長資源|Earn Obsidian and turret resources|黒曜石と砲台育成素材を獲得|흑요석과 포탑 성장 자원 획득|Получайте обсидиан и ресурсы турелей|Obtén obsidiana y recursos para torretas
排位賽|Ranked|ランク戦|랭크전|Рейтинг|Clasificatoria
五砲配隊，雙方攻防|Five turrets, two-sided battle|5種の砲台で対戦|5종 포탑으로 공방전|Пять турелей, бой двух сторон|Cinco torretas, duelo de ataque y defensa
五種砲台組隊，召喚與融合形成陣容。擊殺敵機會立刻送到對面，先讓對手核心歸零的一方獲勝。|Choose five turret types, then summon and merge your formation. Kills send enemies across immediately. Destroy the opponent's core first to win.|5種を選び召喚と合成で編成。撃破した敵は即座に相手へ送られ、先に相手のコアを破壊すると勝利です。|포탑 5종을 선택하고 소환·합성으로 편성하세요. 격파한 적은 즉시 상대에게 가며, 상대 코어를 먼저 파괴하면 승리합니다.|Выберите пять типов, призывайте и объединяйте турели. Убитые враги сразу идут сопернику. Побеждает тот, кто первым разрушит его ядро.|Elige cinco tipos, invoca y fusiona. Los enemigos destruidos pasan al rival al instante. Gana quien destruya primero el núcleo rival.
勝敗影響杯數，並獲得結算獎勵|Results change cups and award rewards|勝敗でトロフィー変動と報酬獲得|승패에 따라 트로피와 보상 지급|Результат меняет кубки и даёт награды|El resultado cambia copas y concede premios
星核試煉|Core Trial|星核試練|코어 시련|Испытание ядра|Prueba del núcleo
挑戰首領，爭取週榜|Challenge bosses, climb weekly ranks|ボスに挑み週間順位を競う|보스 도전과 주간 순위 경쟁|Побеждайте боссов ради недельного рейтинга|Desafía a jefes y compite cada semana
專門挑戰首領的關卡。依一般模式 Tier 開放層數，每日 3 次挑戰，通關進度參與每週排名。|Boss-focused stages unlock with normal-mode Tiers. You have 3 daily attempts. Cleared floors count toward weekly rankings.|ボス専用ステージ。通常モードTierで階層解放、1日3回挑戦。クリア階層で週間ランキングに参加します。|일반 모드 Tier에 따라 열리는 보스 전용 층입니다. 하루 3회 도전하며 클리어 기록으로 주간 순위를 겨룹니다.|Этапы с боссами открываются по Tier обычного режима. Доступно 3 попытки в день; пройденные этажи идут в недельный рейтинг.|Los pisos de jefes se abren con Tiers del modo normal. Tienes 3 intentos diarios y los pisos superados cuentan para el ranking semanal.
通關獎勵與週榜碎片、補給抽卡|Clear rewards, weekly fragments and supply pulls|クリア報酬、週間欠片・補給抽選|클리어 보상, 주간 조각과 보급 뽑기|Награды за этажи, недельные фрагменты и призывы|Premios por completar, fragmentos semanales y tiradas
03 / 11 · 作戰模式|03 / 11 · Battle modes|03 / 11・作戦モード|03 / 11 · 전투 모드|03 / 11 · Режимы боя|03 / 11 · Modos de combate
認識三種模式|Explore three modes|3つのモードを紹介|세 가지 모드 알아보기|Изучите три режима|Conoce los tres modos
已認識|Viewed|確認済み|확인 완료|Просмотрено|Visto
點選了解|Tap to learn|タップして確認|눌러 알아보기|Нажмите для обзора|Toca para conocer
已認識三種模式|All three modes viewed|3モード確認済み|세 모드 확인 완료|Три режима изучены|Tres modos vistos
再認識其他模式|Explore the other modes|他のモードも確認|다른 모드도 확인|Изучите другие режимы|Conoce los otros modos
09 / 11 · 補給站 {0} / 3|09 / 11 · Supplies {0} / 3|09 / 11・補給所 {0} / 3|09 / 11 · 보급소 {0} / 3|09 / 11 · Снабжение {0} / 3|09 / 11 · Suministros {0} / 3
星殿通行證|Celestial VIP Pass|星殿VIPパス|성전 VIP 패스|VIP-пропуск|Pase VIP celestial
按月訂閱，開啟專屬權益。|Subscribe monthly for exclusive benefits.|月額定期購入で限定特典を解放。|월 구독으로 전용 혜택을 누리세요.|Ежемесячная подписка открывает особые привилегии.|Suscríbete cada mes para obtener ventajas exclusivas.
免廣告體驗|Ad-free play|広告なし|광고 없는 플레이|Без рекламы|Sin anuncios
一般商城 8 折|20% off the regular store|通常ショップ20%割引|일반 상점 20% 할인|Скидка 20% в обычном магазине|20% de descuento en tienda normal
VIP 砲台購買資格|Access to VIP turret purchases|VIP砲台の購入資格|VIP 포탑 구매 자격|Доступ к покупке VIP-турелей|Acceso a comprar torretas VIP
黑曜王座戰場|Obsidian Throne battlefield|黒曜の玉座戦場|흑요석 왕좌 전장|Поле «Обсидиановый трон»|Campo Trono de Obsidiana
每月自動續訂，可在 App Store 或 Google Play 取消。VIP 砲台需另用黑曜石購買。|Renews monthly. Cancel in the App Store or Google Play. VIP turrets are purchased separately with Obsidian.|毎月自動更新。App StoreまたはGoogle Playで解約できます。VIP砲台は黒曜石で別途購入。|매월 자동 갱신되며 App Store 또는 Google Play에서 취소할 수 있습니다. VIP 포탑은 흑요석으로 별도 구매합니다.|Продлевается ежемесячно; отмена в App Store или Google Play. VIP-турели покупаются отдельно за обсидиан.|Se renueva cada mes; cancela en App Store o Google Play. Las torretas VIP se compran aparte con obsidiana.
{0} / 月|{0} / month|{0} / 月|{0} / 월|{0} / месяц|{0} / mes
價格以 App 商店顯示為準|See the price in your app store|価格はアプリストアで確認|가격은 앱 스토어 기준|Цена указана в магазине приложений|Consulta el precio en tu tienda de apps
新手專屬優惠，快速補足開局資源。|A starter offer to boost your opening supplies.|新人限定のお得な補給パック。|초반 자원을 채워 주는 초보자 전용 상품입니다.|Стартовое предложение для пополнения начальных ресурсов.|Una oferta inicial para reforzar tus suministros.
永久保留|Keep forever|永久所持|영구 보유|Навсегда|Permanente
7 種消耗券|7 ticket types|7種の消耗券|소모권 7종|7 видов билетов|7 tipos de boletos
共 20 張|20 tickets total|計20枚|총 20장|Всего 20 билетов|20 boletos en total
每個帳號限購一次 · 自由選購|Once per account · Optional purchase|1アカウント1回限定・購入は任意|계정당 1회 · 선택 구매|Один раз на аккаунт · Покупка по желанию|Una vez por cuenta · Compra opcional
第一次十連，送給你|Your first ten-pulls are on us|初めての10連をプレゼント|첫 10연 뽑기를 드립니다|Первые десять призывов — в подарок|Tus primeras diez tiradas son gratis
兩種卡池各送 10 張抽卡券，完成教學後領取。|Finish training to claim 10 tickets for each of the two pools.|訓練完了で、2種類の補給に各10枚の抽選券を受け取れます。|훈련을 마치면 두 뽑기 각각 10장의 뽑기권을 받습니다.|За обучение получите по 10 билетов для каждого из двух пулов.|Termina el tutorial para recibir 10 boletos para cada sorteo.
每 10 抽至少一項稀有以上獎勵；每次十連另得 12 星塵。抽卡券優先使用，正式抽取需登入。|Every 10 pulls guarantees at least one rare-or-better reward and adds 12 Stardust. Tickets are used first. Sign-in required.|10連ごとにレア以上1枠を保証し、星塵12を追加獲得。抽選券を優先使用。抽選にはログインが必要です。|10연마다 희귀 이상 보상 1개를 보장하고 별가루 12를 추가로 받습니다. 뽑기권을 먼저 사용하며 로그인이 필요합니다.|Каждые 10 призывов гарантируют редкую награду или выше и дают 12 звёздной пыли. Сначала тратятся билеты. Нужен вход.|Cada diez tiradas garantiza un premio raro o superior y añade 12 de polvo estelar. Se usan primero los boletos. Requiere iniciar sesión.
免費十連 ×1|Free ten-pull ×1|無料10連 ×1|무료 10연 ×1|Бесплатные 10 призывов ×1|Diez tiradas gratis ×1
之後使用{4}抽取|Future pulls use {4}|次回からは{4}で抽選|이후 {4}으로 뽑기|Далее для призывов: {4}|Después se usa {4}
查看獎池與機率|View rewards and odds|報酬と確率を見る|보상과 확률 보기|Награды и вероятности|Ver premios y probabilidades
砲台、絕招碎片與貨幣補給|Turret and skill fragments, plus currency|砲台・必殺技の欠片と通貨|포탑·필살기 조각과 재화|Фрагменты турелей, навыков и валюта|Fragmentos de torretas, habilidades y monedas
進階素材、特殊外觀與戰備道具|Advanced materials, cosmetics and battle items|上級素材・特別外観・戦備アイテム|고급 재료, 특별 외형과 전투 아이템|Редкие материалы, облики и боевые предметы|Materiales avanzados, aspectos y objetos de combate
認識新手禮包|Explore the starter pack|新人パックを見る|초보자 패키지 알아보기|Изучить стартовый набор|Conocer el paquete inicial
認識免費十連抽|See your free ten-pulls|無料10連を見る|무료 10연 알아보기|Бесплатные призывы|Ver diez tiradas gratis
記住補給站，繼續導覽|Continue the tour|案内を続ける|안내 계속|Продолжить обзор|Continuar recorrido
擊破|Defeated|撃破|격파|Уничтожено|Destruidos
前往大廳|Go home|ホームへ|홈으로|В главное меню|Ir al inicio
重看遊戲入門教學|Replay game introduction|ゲーム入門を再確認|게임 입문 다시 보기|Повторить вводное обучение|Repetir introducción
本次更新|What's new|アップデート|새로운 업데이트|Обновление|Novedades
`;
for(const line of rows.trim().split('\n')){const [source,...values]=line.split('|');SpaceTowerLocale.add(source,values);}
})();
