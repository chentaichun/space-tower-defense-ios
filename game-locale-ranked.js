/* Ranked preparation, rules, settlement and accessibility copy. */
(() => {
const rows=String.raw`
{0} · 出戰|{0} · Selected|{0}・出撃中|{0} · 편성|{0} · В составе|{0} · Seleccionada
{0}，{1}，{2}，HP {3}，已出戰|{0}, {1}, {2}, HP {3}, selected|{0}、{1}、{2}、HP {3}、出撃中|{0}, {1}, {2}, HP {3}, 편성됨|{0}, {1}, {2}, HP {3}, в составе|{0}, {1}, {2}, vida {3}, seleccionada
{0}，{1}，{2}，HP {3}，尚未擁有|{0}, {1}, {2}, HP {3}, not owned|{0}、{1}、{2}、HP {3}、未所持|{0}, {1}, {2}, HP {3}, 미보유|{0}, {1}, {2}, HP {3}, не получена|{0}, {1}, {2}, vida {3}, sin obtener
{0}，{1}，{2}，HP {3}，替換第 {4} 座|{0}, {1}, {2}, HP {3}, replace slot {4}|{0}、{1}、{2}、HP {3}、スロット{4}と交換|{0}, {1}, {2}, HP {3}, 슬롯 {4} 교체|{0}, {1}, {2}, HP {3}, заменить ячейку {4}|{0}, {1}, {2}, vida {3}, cambiar casilla {4}
五砲配隊 · 排位對戰|Five-turret lineup · Ranked battle|5種編成・ランク対戦|5종 편성 · 랭크 대전|Пять турелей · Рейтинговый бой|Cinco torretas · Clasificatoria
Space Tower Defense · 排位賽|Space Tower Defense · Ranked|Space Tower Defense・ランク戦|Space Tower Defense · 랭크전|Space Tower Defense · Рейтинг|Space Tower Defense · Clasificatoria
演練|Practice|練習|연습|Практика|Práctica
派遣|Sent|派遣|전송|Отправлено|Enviados
我的陣地|My arena|自分の陣地|내 진영|Моё поле|Mi campo
已部署|Deployed|配置済み|배치|Размещено|Desplegadas
已暫停|Paused|一時停止中|일시 정지|Пауза|En pausa
戰鬥強化|Battle upgrades|戦闘強化|전투 강화|Улучшения|Mejoras de combate
收起|Close|閉じる|닫기|Свернуть|Cerrar
強化|Upgrade|強化|강화|Улучшить|Mejorar
召喚砲台|Summon|砲台召喚|포탑 소환|Призвать|Invocar
排位賽備戰|Ranked preparation|ランク戦準備|랭크전 준비|Подготовка к бою|Preparación clasificatoria
本機預覽|Local preview|ローカルプレビュー|로컬 미리보기|Локальный просмотр|Vista local
出戰陣容|Battle lineup|出撃編成|출격 편성|Боевой состав|Equipo de combate
點選砲台欄位進行替換|Tap a turret slot to replace it|砲台スロットをタップして交換|포탑 슬롯을 눌러 교체|Нажмите ячейку для замены|Toca una casilla para cambiarla
開戰後鎖定|Locked in battle|対戦開始後は固定|전투 시작 후 고정|В бою состав фиксирован|Fijo durante el combate
選擇砲台|Turrets|砲台選択|포탑 선택|Турели|Torretas
砲台血量|Turret HP|砲台HP|포탑 HP|HP турелей|Vida de torretas
對戰規則|Rules|対戦ルール|대전 규칙|Правила|Reglas
收集五種砲台，開啟排位|Collect five types to unlock ranked|5種の砲台でランク戦解放|포탑 5종으로 랭크 해금|Соберите пять типов для рейтинга|Reúne cinco tipos para clasificatoria
砲台軍械庫|Turret arsenal|砲台軍備庫|포탑 무기고|Арсенал турелей|Arsenal de torretas
全部砲台|All turrets|全砲台|모든 포탑|Все турели|Todas las torretas
坦克與重裝|Tanks and heavies|タンク・重装|탱커·중장갑|Танки и тяжёлые|Tanques y pesadas
點選查看基礎數值|Tap for base stats|タップで基本数値|눌러 기본 수치 보기|Нажмите для параметров|Toca para ver atributos
依品級|By grade|品級順|등급순|По классу|Por grado
血量由高至低|Highest HP first|HPが高い順|HP 높은 순|HP по убыванию|Mayor vida primero
出戰砲台優先|Selected first|編成中を優先|편성 우선|Сначала выбранные|Seleccionadas primero
砲台 / 品級|Turret / Grade|砲台 / 品級|포탑 / 등급|Турель / Класс|Torreta / Grado
定位|Role|役割|역할|Роль|Rol
初始 HP|Base HP|初期HP|초기 HP|Начальное HP|Vida inicial
五砲配隊，共築核心|Five turrets power your core|5種の砲台でコアを構成|5종 포탑으로 코어 구성|Пять турелей питают ядро|Cinco torretas fortalecen el núcleo
五種砲台血量加總，決定核心初始 HP。|Starting core HP is the sum of your five turret types' HP.|5種の砲台HP合計がコアの初期HPになります。|포탑 5종의 HP 합계가 코어 초기 HP가 됩니다.|Начальное HP ядра равно сумме HP пяти выбранных типов турелей.|La vida inicial del núcleo es la suma de la vida de tus cinco tipos de torreta.
核心初始 HP|Starting core HP|コア初期HP|코어 초기 HP|Начальное HP ядра|Vida inicial del núcleo
擊破敵機，壓向對手|Destroy enemies, pressure your rival|敵を撃破して相手を圧迫|적을 격파해 상대 압박|Уничтожайте врагов и давите на соперника|Destruye enemigos y presiona al rival
擊破幾隻，就立即送幾隻到對面。|Every enemy you defeat is immediately sent across.|倒した数だけ、すぐ相手側に送られます。|격파한 수만큼 즉시 상대에게 보내집니다.|Каждый уничтоженный враг сразу отправляется сопернику.|Cada enemigo destruido se envía al rival al instante.
擊破後持續往返|Defeats keep them moving across|撃破のたびに相手側へ|격파마다 상대에게 전송|Уничтоженные идут обратно|Cada baja los envía de vuelta
對手陣地|Opponent arena|相手の陣地|상대 진영|Поле соперника|Campo rival
隨機召喚與融合|Random summons and merging|ランダム召喚と合成|무작위 소환과 합성|Случайный призыв и объединение|Invocación aleatoria y fusión
13 座 · 10 星|13 slots · 10 stars|13座・10星|13기 · 10성|13 ячеек · 10 звёзд|13 casillas · 10 estrellas
每種出戰砲台召喚機率 20%，出現在隨機空位，最多 13 座。召喚費用從 10 金幣起，每次增加 10。|Each selected type has a 20% summon chance in a random empty slot, up to 13 turrets. Summons start at 10 gold and cost 10 more each time.|各編成砲台の召喚確率は20%。空き枠にランダム配置、最大13座。費用は10ゴールドから毎回10ずつ増加。|각 편성 포탑 확률은 20%이며 무작위 빈칸에 최대 13기 배치됩니다. 소환 비용은 골드 10부터 매번 10씩 증가합니다.|Каждый выбранный тип имеет шанс 20% и занимает случайную пустую ячейку; максимум 13. Призыв стоит от 10 золота, каждый следующий дороже на 10.|Cada tipo tiene 20% de probabilidad y aparece en una casilla vacía al azar, hasta 13. Invocar cuesta desde 10 de oro y aumenta 10 cada vez.
同種 ★1|Same type ★1|同種 ★1|같은 종류 ★1|Один тип ★1|Mismo tipo ★1
隨機 ★2|Random ★2|ランダム ★2|무작위 ★2|Случайная ★2|Aleatoria ★2
同種同星融合升一星，種類從出戰五種中重新隨機抽取，最高 10 星。每星額外增加 40% 基礎攻速，融合保留兩座砲台的平均剩餘血量比例。|Merge the same type and stars to gain one star and a random type from your five, up to 10 stars. Each extra star adds 40% base fire rate. Remaining HP percentage is averaged.|同種・同星を合成すると1星上昇し、編成5種からランダムに変化。最大10星、追加1星ごとに基礎攻速+40%。残HP割合は2座の平均を引き継ぎます。|같은 종류·별 합성 시 1성 상승하고 편성 5종 중 무작위로 바뀝니다. 최대 10성, 추가 별마다 기본 공속 +40%. 남은 HP 비율은 두 포탑 평균입니다.|Объединение одинаковых типа и звёзд добавляет звезду и случайно меняет тип из ваших пяти, максимум 10 звёзд. Каждая добавляет 40% базовой скорострельности. Доля оставшегося HP усредняется.|Fusiona igual tipo y estrellas para subir una estrella y obtener un tipo aleatorio de tus cinco, hasta 10 estrellas. Cada estrella extra añade 40% de cadencia base. Se conserva la media del porcentaje de vida restante.
怪物波次與能力|Enemy waves and abilities|敵のウェーブと能力|적 웨이브와 능력|Волны и способности врагов|Oleadas y habilidades enemigas
20 秒 / 波|20 seconds / wave|20秒 / ウェーブ|웨이브당 20초|20 секунд / волна|20 segundos / oleada
擊破或撞上核心消失，都獲得 8 金幣；撞核心不計擊殺，也不派遣到對面。|Destroyed enemies and enemies lost on core impact both give 8 gold. Core impacts do not count as kills or send enemies across.|撃破でもコア衝突で消滅しても8ゴールド獲得。コア衝突は撃破数に含まず、相手にも送りません。|격파하거나 코어 충돌로 사라져도 골드 8을 얻습니다. 코어 충돌은 처치로 세지 않으며 상대에게 보내지 않습니다.|За уничтожение и за гибель врага при ударе о ядро вы получаете 8 золота. Удар о ядро не считается убийством и не отправляет врага сопернику.|Destruir un enemigo o que desaparezca al chocar con el núcleo da 8 de oro. Los choques no cuentan como bajas ni envían enemigos al rival.
各 10 級|10 levels each|各10レベル|각 10레벨|По 10 уровней|10 niveles cada una
攻速每級 +8%，物攻與魔攻每級 +10%。血量強化隨機提升一種出戰砲台原始 HP 的 10%（四捨五入），同步增加核心及場上同種砲台的 HP。四項費用各從 10 金幣起，每次增加 10。|Fire rate gains 8% per level; physical and magic attack gain 10%. HP upgrades add a rounded 10% of one random selected type's base HP to that type and the core. Each upgrade starts at 10 gold and rises by 10.|攻速は1級+8%、物攻・魔攻は+10%。HP強化は編成からランダムな1種の基礎HPの10%を四捨五入し、その種類とコアに加算。各費用は10から毎回10増加。|공속은 레벨당 +8%, 물공·마공은 +10%. HP 강화는 무작위 편성 1종의 기본 HP 10%를 반올림해 해당 포탑과 코어에 더합니다. 각 비용은 골드 10부터 매번 10 증가합니다.|Скорострельность +8% за уровень, физический и магический урон +10%. Улучшение HP добавляет округлённые 10% базового HP случайного выбранного типа ему и ядру. Цена каждого начинается с 10 и растёт на 10.|Cadencia +8% por nivel; ataque físico y mágico +10%. Mejorar vida añade un 10% redondeado de vida base de un tipo elegido al azar a ese tipo y al núcleo. Cada mejora cuesta desde 10 y sube 10.
杯數與勝負獎勵|Cups and match rewards|トロフィーと勝敗報酬|트로피와 승패 보상|Кубки и награды|Copas y recompensas
依戰績變化|Based on results|戦績で変動|전적에 따라 변동|Зависит от результатов|Según resultados
杯數依雙方分數與連勝、連敗調整。連敗後獲勝增加回升獎勵；連勝後落敗加重扣杯，杯數最低為零。|Cups change with both ratings and win/loss streaks. Winning after losses earns a comeback bonus; losing after wins deducts more. Cups cannot fall below zero.|両者の点数と連勝・連敗で変動。連敗後の勝利は復帰ボーナス、連勝後の敗北は追加減点。最低0です。|양측 점수와 연승·연패에 따라 트로피가 변합니다. 연패 후 승리 보너스, 연승 후 패배 추가 차감이 있으며 최저 0입니다.|Кубки зависят от рейтингов и серий. Победа после поражений даёт бонус, поражение после побед отнимает больше. Минимум — ноль.|Las copas dependen de ambas puntuaciones y rachas. Ganar tras derrotas da una bonificación; perder tras victorias resta más. El mínimo es cero.
勝利|Victory|勝利|승리|Победа|Victoria
落敗|Defeat|敗北|패배|Поражение|Derrota
依杯數尋找對手。開局提供 150 金幣並自動召喚五次，合計花費 150。|Opponents are matched by cups. Start with 150 gold and five automatic summons costing 150 in total.|トロフィーで対戦相手を検索。初期150ゴールドで5回自動召喚し、合計150を消費します。|트로피 기준으로 상대를 찾습니다. 시작 골드 150으로 5회 자동 소환하며 총 150을 사용합니다.|Соперники подбираются по кубкам. Стартовые 150 золота полностью тратятся на пять автоматических призывов.|Se buscan rivales por copas. Los 150 de oro iniciales se gastan en cinco invocaciones automáticas.
確認出戰|Confirm lineup|出撃確定|출격 확인|Подтвердить состав|Confirmar equipo
對戰結算|Match result|対戦結果|대전 결과|Итоги боя|Resultado
排位杯數|Ranked cups|ランクトロフィー|랭크 트로피|Рейтинговые кубки|Copas clasificatorias
黑曜石獎勵|Obsidian reward|黒曜石報酬|흑요석 보상|Награда: обсидиан|Recompensa de obsidiana
結束|Finish|終了|종료|Завершить|Terminar
從第一座，到五砲成軍|From one turret to a team of five|最初の1座から5種編成へ|첫 포탑에서 5종 편성까지|От одной турели к пяти|De una torreta a un equipo de cinco
擁有五種不同砲台，才能進入正式排位。|Own five different turret types to enter ranked.|異なる砲台を5種所持するとランク戦に参加できます。|서로 다른 포탑 5종을 보유해야 랭크전에 참가할 수 있습니다.|Для рейтинга нужно владеть пятью разными типами турелей.|Necesitas cinco tipos distintos de torreta para entrar a clasificatoria.
教學後完成兩場一般模式，各領一座。核心失守並結算才算完成，中途離開不計次。|After training, finish two normal runs for one turret each. A run counts when your core falls and results appear; leaving early does not count.|訓練後、通常モードを2回完走して各1座獲得。コアが破壊され結果表示まで進むと達成。途中退出は対象外。|훈련 후 일반 모드 두 판을 완료해 각 1기씩 받으세요. 코어가 파괴되고 정산되어야 완료이며 중도 이탈은 제외됩니다.|После обучения завершите два обычных боя за турель каждый. Бой засчитывается после гибели ядра и итогов; ранний выход не считается.|Tras el tutorial, termina dos partidas normales para una torreta por partida. Cuentan al caer el núcleo y mostrar resultados; salir antes no cuenta.
重看操作教學|Replay controls tutorial|操作訓練を再確認|조작 훈련 다시 보기|Повторить обучение управлению|Repetir tutorial de controles
首航訓練完成|First-flight training complete|初出撃訓練完了|첫 출격 훈련 완료|Первое обучение завершено|Entrenamiento inicial completo
已掌握召喚、融合與強化。|You've learned summoning, merging and upgrades.|召喚・合成・強化を習得しました。|소환, 합성, 강화를 익혔습니다.|Вы освоили призыв, объединение и улучшения.|Ya conoces la invocación, la fusión y las mejoras.
✓ 已選取|✓ Selected|✓ 選択済み|✓ 선택됨|✓ Выбрано|✓ Seleccionada
點這裡|Tap here|ここをタップ|여기 누르기|Нажмите здесь|Toca aquí
結束重看|End replay|再確認を終了|다시 보기 종료|Завершить повтор|Terminar repetición
星環競技場|Orbital Arena|星環アリーナ|궤도 투기장|Орбитальная арена|Arena orbital
你的出戰陣容|Your lineup|あなたの編成|내 출격 편성|Ваш состав|Tu equipo
已等待|Elapsed|待機時間|대기 시간|Прошло|Tiempo
陣容就緒|Lineup ready|編成完了|편성 준비|Состав готов|Equipo listo
搜尋對手|Find opponent|相手検索|상대 검색|Поиск соперника|Buscar rival
準備進場|Get ready|出撃準備|출격 준비|Подготовка|Prepárate
返回遊戲首頁|Return to game home|ゲームホームへ|게임 홈으로|В главное меню игры|Volver al inicio del juego
對手戰場|Opponent battlefield|相手の戦場|상대 전장|Поле соперника|Campo del rival
對手砲台與敵機|Opponent turrets and enemies|相手の砲台と敵機|상대 포탑과 적기|Турели и враги соперника|Torretas y enemigos del rival
我方戰場|Your battlefield|自分の戦場|내 전장|Ваше поле|Tu campo de batalla
我方砲台與敵機，點選同種同星砲台融合|Your turrets and enemies. Tap matching turrets to merge.|自分の砲台と敵機。同種・同星の砲台を選んで合成。|내 포탑과 적기. 같은 종류·별 포탑을 눌러 합성.|Ваши турели и враги. Выберите одинаковые турели для объединения.|Tus torretas y enemigos. Toca torretas iguales para fusionarlas.
收起強化抽屜|Close upgrade drawer|強化パネルを閉じる|강화 패널 닫기|Свернуть улучшения|Cerrar panel de mejoras
五種出戰砲台|Five selected turret types|出撃する砲台5種|출격 포탑 5종|Пять выбранных типов|Cinco tipos seleccionados
備戰資訊|Preparation information|出撃準備情報|출격 준비 정보|Информация подготовки|Información de preparación
搜尋砲台|Search turrets|砲台検索|포탑 검색|Поиск турелей|Buscar torretas
搜尋砲台名稱|Search turret names|砲台名で検索|포탑 이름 검색|Поиск по имени турели|Buscar nombres de torretas
篩選砲台|Filter turrets|砲台を絞り込む|포탑 필터|Фильтр турелей|Filtrar torretas
搜尋砲台血量|Search turret HP|砲台HPを検索|포탑 HP 검색|Поиск HP турелей|Buscar vida de torretas
血量排序|Sort by HP|HP順に並べる|HP 정렬|Сортировать по HP|Ordenar por vida
杯數進度|Cup progress|トロフィー進行|트로피 진행|Прогресс кубков|Progreso de copas
關閉新手計畫|Close recruit missions|新兵計画を閉じる|신병 계획 닫기|Закрыть задания новичка|Cerrar misiones iniciales
關閉砲台圖鑑|Close turret archive|砲台図鑑を閉じる|포탑 도감 닫기|Закрыть архив турелей|Cerrar archivo de torretas
戰鬥已結束|Battle has ended|対戦は終了しました|대전이 끝났습니다|Бой завершён|El combate terminó
場上已滿，請融合砲台|Board full. Merge turrets.|配置上限です。砲台を合成してください。|전장이 가득 찼습니다. 포탑을 합성하세요.|Поле заполнено. Объедините турели.|Campo lleno. Fusiona torretas.
金幣不足|Not enough gold|ゴールド不足|골드 부족|Недостаточно золота|Oro insuficiente
請選擇另一座相同砲台|Choose another matching turret|同じ砲台をもう1座選んでください|같은 포탑을 하나 더 선택하세요|Выберите другую такую же турель|Elige otra torreta igual
需要同種類、同星級的兩座砲台|Requires two turrets of the same type and stars|同種・同星の砲台2座が必要です|같은 종류·별 포탑 2기가 필요합니다|Нужны две турели одного типа и звёзд|Se necesitan dos torretas del mismo tipo y estrellas
已達 10 星上限|10-star maximum reached|上限の10星です|최대 10성 도달|Достигнут предел 10 звёзд|Máximo de 10 estrellas
無法升級|Cannot upgrade|強化できません|강화 불가|Улучшение недоступно|No se puede mejorar
已達強化上限|Maximum upgrade reached|強化上限です|최대 강화 도달|Максимальное улучшение|Mejora máxima
請稍候再操作|Please wait before acting|少し待ってから操作してください|잠시 후 조작하세요|Подождите перед действием|Espera antes de actuar
無效操作|Invalid action|無効な操作|잘못된 동작|Недопустимое действие|Acción no válida
暴擊 {0}|CRIT {0}|会心 {0}|치명타 {0}|КРИТ {0}|CRÍT. {0}
砲台失效|Turret lost|砲台停止|포탑 파괴|Турель потеряна|Torreta destruida
攻速 Lv.{0}|Rate Lv.{0}|攻速 Lv.{0}|공속 Lv.{0}|Скорость ур.{0}|Cadencia Nv.{0}
物攻 Lv.{0}|Physical Lv.{0}|物攻 Lv.{0}|물공 Lv.{0}|Физ. ур.{0}|Físico Nv.{0}
魔攻 Lv.{0}|Magic Lv.{0}|魔攻 Lv.{0}|마공 Lv.{0}|Маг. ур.{0}|Mágico Nv.{0}
血量 Lv.{0}|HP Lv.{0}|HP Lv.{0}|HP Lv.{0}|HP ур.{0}|Vida Nv.{0}
攻速|Rate|攻速|공속|Скорость|Cadencia
物攻|Physical|物攻|물공|Физ. урон|Físico
魔攻|Magic|魔攻|마공|Маг. урон|Mágico
黑曜石|Obsidian|黒曜石|흑요석|Обсидиан|Obsidiana
太空幣|Space Coins|スペースコイン|스페이스 코인|Космомонеты|Monedas espaciales
砲台血量決定核心 HP 貢獻；怪物只攻擊核心，不會摧毀砲台。|Turret HP contributes to core HP. Enemies attack only the core and cannot destroy turrets.|砲台HPはコアHPに加算されます。敵はコアのみを攻撃し、砲台を破壊しません。|포탑 HP는 코어 HP에 합산됩니다. 적은 코어만 공격하며 포탑을 파괴하지 않습니다.|HP турелей добавляется к HP ядра. Враги атакуют только ядро и не уничтожают турели.|La vida de las torretas se suma a la del núcleo. Los enemigos solo atacan el núcleo y no destruyen torretas.
排位不分主砲、副砲。怪物直接攻擊核心，核心 HP 歸零即落敗。|All turret types can be deployed in ranked. Enemies attack the core directly. Lose when core HP reaches zero.|ランク戦では主砲・副砲の区別はありません。敵はコアを直接攻撃し、コアHPが0で敗北です。|랭크전은 주포·보조포 구분이 없습니다. 적은 코어를 직접 공격하며 코어 HP가 0이면 패배합니다.|Все типы турелей доступны в рейтинге. Враги атакуют ядро напрямую. Ноль HP ядра — поражение.|Todos los tipos de torreta pueden usarse. Los enemigos atacan directamente al núcleo. Si su vida llega a cero, pierdes.
原有 13 種怪物從第一波依權重混合出現，比例逐波調整。保留護盾、治療、分裂等能力；所有敵機以核心為目標，穿過砲台繼續進攻。|All 13 enemy types appear in weighted waves from the start. They keep shields, healing and splitting, and pass through turrets to attack the core.|13種の敵が最初から重み付きで混成出現。盾・回復・分裂などの能力を保ち、砲台を通過してコアを攻撃します。|13종 적이 첫 웨이브부터 가중 확률로 등장합니다. 보호막·치유·분열 능력을 유지하며 포탑을 지나 코어를 공격합니다.|Все 13 типов появляются с первой волны с меняющимися весами. Сохраняют щиты, лечение и разделение; проходят сквозь турели и атакуют ядро.|Los 13 tipos aparecen en oleadas ponderadas desde el inicio. Conservan escudos, curación y división, y atraviesan torretas para atacar el núcleo.
開啟音效|Enable audio|サウンドを有効にする|오디오 켜기|Включить звук|Activar audio
關閉音效|Mute audio|サウンドをミュート|오디오 끄기|Выключить звук|Silenciar audio
排位榮耀|Ranked glory|ランクの栄光|랭크의 영광|Рейтинговая слава|Gloria clasificatoria
登入後同步杯數|Sign in to sync cups|ログインしてトロフィーを同期|로그인하여 트로피 동기화|Войдите для синхронизации кубков|Inicia sesión para sincronizar copas
杯數暫時無法同步|Cups could not be synced|トロフィーを同期できません|트로피를 동기화할 수 없습니다|Не удалось синхронизировать кубки|No se pudieron sincronizar las copas
距離 {0} 還有 {1} 杯|{1} cups to {0}|{0}まであと{1}トロフィー|{0}까지 트로피 {1}개|До ранга {0}: {1} кубков|{1} copas para {0}
最高段位 · 持續突破|Highest rank · Keep climbing|最高ランク・さらなる高みへ|최고 랭크 · 계속 도전|Высший ранг · Вперёд к рекордам|Rango máximo · Sigue subiendo
搜尋中…|Searching…|検索中…|검색 중…|Поиск…|Buscando…
`;
for(const line of rows.trim().split('\n')){const [source,...values]=line.split('|');SpaceTowerLocale.add(source,values);}
})();
