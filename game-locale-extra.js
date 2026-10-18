/* Remaining home, trial, workshop, account and VIP labels. */
(() => {
const rows=String.raw`
已鎖定|Locked|ロック済み|잠김|Заблокировано|Bloqueado
查看試煉|Open trial|試練を見る|시련 보기|Открыть испытание|Ver prueba
指揮官進度|Commander progress|指揮官の進捗|지휘관 진행도|Прогресс командира|Progreso del comandante
帳號貨幣|Account currencies|所持通貨|계정 재화|Валюта аккаунта|Monedas de la cuenta
上一階級|Previous tier|前のTier|이전 티어|Предыдущий Tier|Tier anterior
下一階級|Next tier|次のTier|다음 티어|Следующий Tier|Tier siguiente
遊戲控制|Game controls|ゲーム操作|게임 조작|Управление игрой|Controles del juego
關閉設定|Close settings|設定を閉じる|설정 닫기|Закрыть настройки|Cerrar ajustes
遊戲速度|Game speed|ゲーム速度|게임 속도|Скорость игры|Velocidad del juego
砲台強化|Tower upgrades|砲台強化|포탑 강화|Улучшения турелей|Mejoras de torretas
星環守衛|Ring Guardian|星環の守衛|성환 수호자|Страж кольца|Guardián del anillo
{0} · {1} 黑曜石 · 卷 {2}|{0} · {1} Obsidian · Tickets {2}|{0}・黒曜石{1}・チケット{2}|{0} · 흑요석 {1} · 티켓 {2}|{0} · Обсидиан {1} · Билеты {2}|{0} · {1} obsidiana · Vales {2}
距離下一 Tier 尚差 {0} 波|{0} waves to the next Tier|次のTierまであと{0}波|다음 티어까지 {0}웨이브|До следующего Tier: {0} волн|Faltan {0} oleadas para el próximo Tier
作戰 Tier {0} 已開放第 {1} 層|Combat Tier {0} unlocks floor {1}|作戦Tier {0}で第{1}層解放|작전 티어 {0}: {1}층 개방|Боевой Tier {0}: открыт этаж {1}|Tier de combate {0}: piso {1} disponible
主砲與副砲碎片工坊|Main and support turret workshop|主砲・補助砲台の欠片工房|주포 및 보조 포탑 조각 공방|Мастерская основных и вспомогательных турелей|Taller de torretas principales y de apoyo
每個階級提供 1 格主砲與 3 格副砲；50 枚同型碎片可升星。|Each tier has 1 main and 3 support slots. Upgrade a star with 50 matching shards.|各Tierは主砲1枠と補助砲3枠。同種の欠片50個で星強化。|티어마다 주포 1칸과 보조 포탑 3칸. 같은 조각 50개로 별 강화.|В каждом Tier: 1 основное и 3 вспомогательных места. 50 одинаковых фрагментов повышают звезду.|Cada Tier tiene 1 espacio principal y 3 de apoyo. Sube una estrella con 50 fragmentos iguales.
永久權益|Permanent benefits|永久特典|영구 혜택|Постоянные привилегии|Beneficios permanentes
背景商店|Battlefield store|戦場ストア|전장 상점|Магазин полей боя|Tienda de campos de batalla
購買並裝備專屬戰場；高級背景會提升局內金幣與黑曜石獲取。|Buy and equip battlefields. Premium backgrounds boost gold and Obsidian gains.|専用戦場を購入・装備。上位背景はゴールドと黒曜石の獲得量を増加。|전용 전장을 구매하고 장착하세요. 고급 배경은 골드와 흑요석 획득량을 높입니다.|Покупайте и выбирайте поля боя. Премиальные фоны увеличивают получение золота и обсидиана.|Compra y equipa campos de batalla. Los fondos premium aumentan el oro y la obsidiana obtenidos.
傳說碎片每週最多購買 10 片。|Buy up to 10 legendary shards per week.|伝説の欠片は週10個まで購入可能。|전설 조각은 주당 최대 10개 구매 가능.|До 10 легендарных фрагментов в неделю.|Compra hasta 10 fragmentos legendarios por semana.
訂單由伺服器驗證，付款成功後才會發放黑曜石。|Orders are verified by the server. Obsidian is granted after successful payment.|注文はサーバーが検証し、決済完了後に黒曜石を付与します。|서버에서 주문을 검증하며 결제 성공 후 흑요석을 지급합니다.|Заказы проверяет сервер. Обсидиан выдаётся после успешной оплаты.|El servidor verifica los pedidos. La obsidiana se entrega tras el pago exitoso.
原創音樂 · 流明回響|Original music · Echoes of Lumen|オリジナル音楽・Echoes of Lumen|오리지널 음악 · Echoes of Lumen|Авторская музыка · Echoes of Lumen|Música original · Echoes of Lumen
{0} 波後|In {0} waves|あと{0}波|{0}웨이브 후|Через {0} волн|En {0} oleadas
Tier {0} 尚差 {1} 波|{1} waves to Tier {0}|Tier {0}まであと{1}波|티어 {0}까지 {1}웨이브|До Tier {0}: {1} волн|Faltan {1} oleadas para Tier {0}
達到設定金幣後，依順序自動購買並循環。|At the gold threshold, buy upgrades in order and repeat.|設定ゴールド到達後、順番に自動購入を繰り返します。|설정 골드에 도달하면 순서대로 자동 구매를 반복합니다.|При достижении порога золота улучшения покупаются по очереди и цикл повторяется.|Al alcanzar el oro indicado, compra mejoras en orden y repite.
100G · 物攻 → 魔攻 → 攻速|100G · Physical → Magic → Speed|100G・物攻→魔攻→攻速|100G · 물리 → 마법 → 공속|100G · Физ. → Маг. → Скорость|100G · Físico → Magia → Velocidad
每 25 波選 1 張，建立這一局的流派|Choose a card every 25 waves to shape your build.|25波ごとにカードを1枚選び、戦法を構築。|25웨이브마다 카드 1장을 선택해 전략을 구성하세요.|Выбирайте карту каждые 25 волн и создавайте свой набор усилений.|Elige una carta cada 25 oleadas para crear tu estrategia.
結算|Results|結果|결과|Результаты|Resultados
第 10 波後每局可復活一次，回復 50% 核心生命。|After wave 10, revive once per run with 50% core HP.|第10波以降、1プレイ1回、コアHP50%で復活。|10웨이브 이후 판당 1회, 코어 체력 50%로 부활.|После 10-й волны можно воскреснуть раз за игру с 50% HP ядра.|Tras la oleada 10, revive una vez por partida con 50% de vida del núcleo.
跳波|Skip waves|波をスキップ|웨이브 건너뛰기|Пропустить волны|Saltar oleadas
專屬砲台、2,400 黑曜石、2,000 太空幣與 7 種消耗券。|Exclusive turret, 2,400 Obsidian, 2,000 Space Coins and 7 ticket types.|専用砲台、黒曜石2,400、スペースコイン2,000、消耗チケット7種。|전용 포탑, 흑요석 2,400, 스페이스 코인 2,000, 소모 티켓 7종.|Особая турель, 2 400 обсидиана, 2 000 космомонет и 7 видов билетов.|Torreta exclusiva, 2400 de obsidiana, 2000 monedas espaciales y 7 tipos de vales.
六角核心 Boss|Hex Core Boss|六角コアボス|육각 코어 보스|Босс «Шестигранное ядро»|Jefe de núcleo hexagonal
BOSS 警示：六角核心入侵|BOSS ALERT: Hex Core incoming|ボス警報：六角コア接近|보스 경보: 육각 코어 침입|ТРЕВОГА: шестигранное ядро приближается|ALERTA: se acerca el núcleo hexagonal
星艦 Boss|Starship Boss|戦艦ボス|우주 전함 보스|Босс-звездолёт|Jefe nave estelar
BOSS 警示：星艦帶隊進場|BOSS ALERT: Starship fleet incoming|ボス警報：戦艦部隊接近|보스 경보: 전함 함대 접근|ТРЕВОГА: приближается флот звездолёта|ALERTA: se acerca una flota estelar
外星終極 Boss|Alien Overlord Boss|異星の最終ボス|외계 최종 보스|Босс «Владыка пришельцев»|Jefe supremo alienígena
物理攻擊|Physical attack|物理攻撃|물리 공격|Физическая атака|Ataque físico
魔法攻擊|Magic attack|魔法攻撃|마법 공격|Магическая атака|Ataque mágico
攻擊速度|Attack speed|攻撃速度|공격 속도|Скорость атаки|Velocidad de ataque
暴擊機率|Critical chance|会心率|치명타 확률|Шанс критического удара|Probabilidad de crítico
暴擊傷害|Critical damage|会心ダメージ|치명타 피해|Критический урон|Daño crítico
最大生命|Maximum HP|最大HP|최대 체력|Максимум HP|Vida máxima
生命回復|HP regeneration|HP回復|체력 재생|Регенерация HP|Regeneración de vida
開場護盾|Starting shield|開始時シールド|시작 보호막|Начальный щит|Escudo inicial
重擊核心|Heavy Strike Core|強打コア|강타 코어|Ядро тяжёлого удара|Núcleo de golpe fuerte
菁英獵手|Elite Hunter|精鋭ハンター|정예 사냥꾼|Охотник на элиту|Cazador de élite
補給感應|Supply Sensor|補給センサー|보급 감지|Датчик снабжения|Sensor de suministros
攻擊範圍|Attack range|攻撃範囲|공격 범위|Дальность атаки|Alcance de ataque
遊戲音樂|Game music|ゲーム音楽|게임 음악|Музыка игры|Música del juego
流明回響|Echoes of Lumen|Echoes of Lumen|Echoes of Lumen|Echoes of Lumen|Echoes of Lumen
4 倍速永久解鎖卷|Permanent 4× speed ticket|4倍速永久解放券|4배속 영구 해금권|Билет на постоянную скорость 4×|Vale permanente de velocidad 4×
5 倍速永久解鎖卷|Permanent 5× speed ticket|5倍速永久解放券|5배속 영구 해금권|Билет на постоянную скорость 5×|Vale permanente de velocidad 5×
10 倍速永久解鎖卷|Permanent 10× speed ticket|10倍速永久解放券|10배속 영구 해금권|Билет на постоянную скорость 10×|Vale permanente de velocidad 10×
願望砲塔碎片 ×100|Chosen turret shards ×100|選べる砲台欠片×100|선택 포탑 조각 ×100|Фрагменты выбранной турели ×100|Fragmentos de torreta elegida ×100
願望絕招碎片 ×50|Chosen skill shards ×50|選べる必殺技欠片×50|선택 필살기 조각 ×50|Фрагменты выбранного навыка ×50|Fragmentos de habilidad elegida ×50
全砲塔碎片 ×2|Every turret shard ×2|全砲台の欠片×2|모든 포탑 조각 ×2|Все фрагменты турелей ×2|Todos los fragmentos de torretas ×2
全絕招碎片 ×1|Every skill shard ×1|全必殺技の欠片×1|모든 필살기 조각 ×1|Все фрагменты навыков ×1|Todos los fragmentos de habilidades ×1
菁英戰備組：砲塔碎片 ×10＋絕招碎片 ×5|Elite kit: turret shards ×10 + skill shards ×5|精鋭装備：砲台欠片×10＋必殺技欠片×5|정예 장비: 포탑 조각 ×10 + 필살기 조각 ×5|Элитный комплект: фрагменты турелей ×10 + навыков ×5|Kit de élite: fragmentos de torreta ×10 y de habilidad ×5
黑曜石翻倍卷|Double Obsidian ticket|黒曜石2倍券|흑요석 2배권|Билет удвоения обсидиана|Vale de doble obsidiana
跳回合卷（不能跳過 Boss）|Wave skip ticket (cannot skip bosses)|波スキップ券（ボスは不可）|웨이브 건너뛰기권 (보스 제외)|Пропуск волн (кроме боссов)|Vale para saltar oleadas (excepto jefes)
前 200 回合金幣翻倍卷|Double gold for the first 200 waves|最初の200波ゴールド2倍券|첫 200웨이브 골드 2배권|Двойное золото за первые 200 волн|Oro doble durante las primeras 200 oleadas
排行榜|Leaderboard|ランキング|순위표|Таблица лидеров|Clasificación
每日 3 次 · 每週排名|3 daily attempts · Weekly rankings|毎日3回・週間ランキング|매일 3회 · 주간 순위|3 попытки в день · Недельный рейтинг|3 intentos diarios · Ranking semanal
試煉層級|Trial floor|試練階層|시련 층|Этаж испытания|Piso de prueba
開始試煉|Start trial|試練開始|시련 시작|Начать испытание|Iniciar prueba
看廣告 +1 次|Watch ad for +1 attempt|広告で挑戦回数+1|광고 시청 +1회|Реклама за +1 попытку|Ver anuncio: +1 intento
登入帳號後可挑戰並參加每週排名。|Sign in to challenge and join weekly rankings.|ログインして挑戦し、週間ランキングに参加。|로그인하면 도전하고 주간 순위에 참가할 수 있습니다.|Войдите для испытаний и недельного рейтинга.|Inicia sesión para participar en pruebas y ranking semanal.
展開|Expand|展開|펼치기|Развернуть|Expandir
10 種限定好禮|10 exclusive rewards|10種の限定報酬|한정 보상 10종|10 особых наград|10 recompensas exclusivas
看廣告立即領取|Watch an ad to claim|広告を見て受取|광고 보고 받기|Получить за рекламу|Ver anuncio para recibir
每日任務|Daily missions|日次任務|일일 임무|Ежедневные задания|Misiones diarias
特殊任務|Special missions|特別任務|특별 임무|Особые задания|Misiones especiales
成就|Achievements|実績|업적|Достижения|Logros
全球排行榜 Beta|Global leaderboard Beta|世界ランキング Beta|세계 순위 Beta|Мировой рейтинг Beta|Ranking global Beta
設定我的公開名稱|Set public name|公開名を設定|공개 이름 설정|Задать публичное имя|Definir nombre público
儲存名稱|Save name|名前を保存|이름 저장|Сохранить имя|Guardar nombre
我同意公開此名稱並遵守|I agree to publish this name and follow|この名前の公開と規約に同意します|이 이름 공개와 규칙 준수에 동의합니다|Согласен опубликовать имя и соблюдать|Acepto publicar este nombre y cumplir
玩家名稱規範|Player name rules|プレイヤー名の規則|플레이어 이름 규칙|Правила имён|Normas de nombres
帳號 ID 不會公開；未設定時顯示專屬星際稱號。|Account IDs stay private. A space callsign appears until you set a name.|アカウントIDは非公開。名前未設定時は専用の宇宙称号を表示します。|계정 ID는 공개되지 않습니다. 이름을 정하기 전에는 전용 우주 칭호가 표시됩니다.|ID аккаунта скрыт. Пока имя не задано, отображается космический позывной.|El ID permanece privado. Hasta elegir un nombre se muestra un indicativo espacial.
管理封鎖玩家|Manage blocked players|ブロック管理|차단 관리|Заблокированные игроки|Gestionar bloqueados
玩家選項|Player options|プレイヤー操作|플레이어 옵션|Действия с игроком|Opciones del jugador
檢舉原因|Report reason|通報理由|신고 사유|Причина жалобы|Motivo del informe
不當名稱|Inappropriate name|不適切な名前|부적절한 이름|Недопустимое имя|Nombre inapropiado
騷擾或仇恨|Harassment or hate|嫌がらせ・差別|괴롭힘·혐오|Травля или ненависть|Acoso u odio
冒充他人|Impersonation|なりすまし|사칭|Выдача себя за другого|Suplantación
其他|Other|その他|기타|Другое|Otro
檢舉玩家|Report player|プレイヤーを通報|플레이어 신고|Пожаловаться|Denunciar jugador
封鎖玩家|Block player|プレイヤーをブロック|플레이어 차단|Заблокировать|Bloquear jugador
我的排名|My rank|自分の順位|내 순위|Моё место|Mi puesto
完成第 2 波後上榜|Clear wave 2 to enter the leaderboard|第2波クリアでランキング参加|2웨이브 완료 후 순위 등록|Пройдите волну 2 для рейтинга|Supera la oleada 2 para entrar al ranking
請先同意玩家名稱規範。|Please accept the player name rules first.|先にプレイヤー名の規則に同意してください。|먼저 플레이어 이름 규칙에 동의하세요.|Сначала примите правила имён.|Primero acepta las normas de nombres.
名稱需 2–18 字，只能使用文字、數字、空格、底線或連字號，且不得含不當內容。|Use 2–18 characters: letters, numbers, spaces, underscores or hyphens. No inappropriate content.|2～18文字。文字・数字・空白・下線・ハイフンのみ。不適切な内容は禁止です。|2–18자, 문자·숫자·공백·밑줄·하이픈만 허용되며 부적절한 내용은 금지됩니다.|От 2 до 18 знаков: буквы, цифры, пробелы, подчёркивания и дефисы. Недопустимый контент запрещён.|Usa 2–18 caracteres: letras, números, espacios, guiones o guiones bajos. Sin contenido inapropiado.
公開名稱已儲存。|Public name saved.|公開名を保存しました。|공개 이름을 저장했습니다.|Публичное имя сохранено.|Nombre público guardado.
名稱剛更新，請稍後再改。|Name was just updated. Try later.|名前を変更したばかりです。後でお試しください。|방금 이름을 변경했습니다. 나중에 다시 시도하세요.|Имя недавно изменено. Попробуйте позже.|El nombre se cambió hace poco. Inténtalo más tarde.
暫時無法儲存名稱。|Could not save the name.|名前を保存できません。|이름을 저장할 수 없습니다.|Не удалось сохранить имя.|No se pudo guardar el nombre.
已送出檢舉。|Report submitted.|通報を送信しました。|신고를 접수했습니다.|Жалоба отправлена.|Informe enviado.
檢舉暫時無法送出。|Could not submit the report.|通報を送信できません。|신고를 보낼 수 없습니다.|Не удалось отправить жалобу.|No se pudo enviar el informe.
已封鎖此玩家。|Player blocked.|プレイヤーをブロックしました。|플레이어를 차단했습니다.|Игрок заблокирован.|Jugador bloqueado.
解除封鎖|Unblock|ブロック解除|차단 해제|Разблокировать|Desbloquear
目前沒有可顯示的玩家。|No players to display yet.|表示できるプレイヤーはいません。|표시할 플레이어가 없습니다.|Пока нет игроков для отображения.|Aún no hay jugadores que mostrar.
依作戰階級，再依最高波數排名。|Ranked by combat Tier, then highest wave.|作戦Tier、最高ウェーブの順で順位付け。|작전 Tier, 최고 웨이브 순으로 정렬합니다.|Рейтинг по боевому Tier, затем по максимальной волне.|Ordenado por Tier y después por la mayor oleada.
輸入公開名稱|Enter public name|公開名を入力|공개 이름 입력|Введите публичное имя|Introduce nombre público
建立玩家 ID|Create Player ID|プレイヤーID作成|플레이어 ID 생성|Создать ID игрока|Crear ID de jugador
選擇已開放層數|Unlocked floor|解放済み階層|해금된 층|Открытый этаж|Piso desbloqueado
第 {0} 層|Floor {0}|第{0}層|{0}층|Этаж {0}|Piso {0}
作戰 Tier {0} · 已開放第 1–{1} 層|Campaign Tier {0} · floors 1–{1} unlocked|作戦Tier {0}・第1～{1}層解放|작전 Tier {0} · 1–{1}층 해금|Tier {0} · Открыты этажи 1–{1}|Tier {0} · Pisos 1–{1} abiertos
每日 {0} / {1} 次 · 最高第 {2} 層|{0} / {1} attempts · Floor {2}|毎日 {0} / {1} 回・最高第{2}層|매일 {0} / {1}회 · 최고 {2}층|Попытки {0} / {1} · Этаж {2}|{0} / {1} intentos · Piso {2}
先登入或註冊帳號，才能挑戰並參加每週排名。|Sign in or create an account to enter the trial.|ログインまたは登録して試練と週間ランキングに参加してください。|로그인하거나 가입한 후 시련과 주간 순위에 참가하세요.|Войдите или создайте аккаунт для испытания.|Inicia sesión o crea una cuenta para entrar en la prueba.
正在讀取試煉紀錄…|Loading trial status…|試練記録を読込中…|시련 기록 로딩 중…|Загрузка испытания…|Cargando estado de prueba…
今日剩餘 {0} / {1} 次 · 每週一 00:00（台灣時間）結算|{0} of {1} attempts left today · Weekly reset Monday 00:00 Taiwan|本日残り {0} / {1} 回・毎週月曜00:00台湾時間に集計|오늘 {0} / {1}회 남음 · 매주 월요일 00:00 대만 시간 정산|Осталось {0} из {1} · Сброс в понедельник 00:00 по Тайваню|Quedan {0} de {1} · Reinicio lunes 00:00 de Taiwán
每週排名|Weekly ranking|週間ランキング|주간 순위|Недельный рейтинг|Ranking semanal
第 {0} 層排行榜|Floor {0} leaderboard|第{0}層ランキング|{0}층 순위|Рейтинг этажа {0}|Ranking del piso {0}
週一 00:00 結算|Resets Monday 00:00|月曜00:00集計|월요일 00:00 정산|Сброс в понедельник 00:00|Reinicio lunes 00:00
最高 {0} 波|Best {0} waves|最高{0}ウェーブ|최고 {0}웨이브|Рекорд: {0} волн|Máximo: {0} oleadas
我|Me|自分|나|Я|Yo
本週尚無紀錄|No records this week|今週の記録なし|이번 주 기록 없음|На этой неделе записей нет|Sin registros esta semana
每層前三名獎勵|Top-three rewards on each floor|各階層上位3名の報酬|각 층 상위 3명 보상|Награды тройке лучших на этаже|Premios para los tres primeros de cada piso
自選砲台碎片 ×{0}|Choice turret shards ×{0}|選択砲台の欠片 ×{0}|선택 포탑 조각 ×{0}|Фрагменты турели на выбор ×{0}|Fragmentos a elegir ×{0}
星隕補給艙 {0} 抽|Starfall Supply {0} pulls|星隕補給 {0}回|유성 보급 {0}회|Звёздное снабжение: {0} призывов|Suministro estelar: {0} tiradas
每週通關獎勵|Weekly clear rewards|週間クリア報酬|주간 클리어 보상|Недельные награды за прохождение|Premios semanales por completar
第 {0} 波|Wave {0}|第{0}波|{0}웨이브|Волна {0}|Oleada {0}
上週第 {0} 層第 {1} 名|Last week: Floor {0} #{1}|先週：第{0}層・{1}位|지난주: {0}층 {1}위|Прошлая неделя: этаж {0}, место {1}|Semana pasada: piso {0}, puesto {1}
自選碎片|choice shards|選択欠片|선택 조각|фрагменты на выбор|fragmentos a elegir
領取獎勵|Claim prize|報酬受取|보상 받기|Получить награду|Recibir premio
試煉第 {0} 層 · 通過 {1} 波。排名與里程碑獎勵同步中。|Trial floor {0} · {1} waves cleared. Syncing ranking and rewards.|試練第{0}層・{1}波クリア。順位と報酬を同期中。|시련 {0}층 · {1}웨이브 완료. 순위와 보상 동기화 중.|Этаж {0} · Пройдено {1} волн. Синхронизация рейтинга и наград.|Piso {0} · {1} oleadas superadas. Sincronizando ranking y premios.
試煉暫時無法讀取：{0}|Trial unavailable: {0}|試練を読込できません：{0}|시련을 읽을 수 없음: {0}|Испытание недоступно: {0}|Prueba no disponible: {0}
通過 {0} 波，獲得 {1} 黑曜石；每週排名已更新。|Cleared {0} waves, earned {1} Obsidian. Weekly ranking updated.|{0}波クリア、黒曜石{1}獲得。週間順位を更新しました。|{0}웨이브 완료, 흑요석 {1} 획득. 주간 순위를 갱신했습니다.|Пройдено {0} волн, получено {1} обсидиана. Недельный рейтинг обновлён.|Superaste {0} oleadas y ganaste {1} de obsidiana. Ranking semanal actualizado.
試煉結算失敗：{0}。請返回大廳重試同步。|Trial settlement failed: {0}. Return home to retry.|試練集計失敗：{0}。ホームで再同期してください。|시련 정산 실패: {0}. 홈에서 동기화를 다시 시도하세요.|Ошибка итогов: {0}. Вернитесь в меню для синхронизации.|Falló el resultado: {0}. Vuelve al inicio para sincronizar.
無法開始：{0}|Cannot start: {0}|開始できません：{0}|시작할 수 없음: {0}|Нельзя начать: {0}|No se puede iniciar: {0}
無法準備廣告：{0}|Cannot prepare ad: {0}|広告を準備できません：{0}|광고 준비 실패: {0}|Не удалось загрузить рекламу: {0}|No se puede preparar el anuncio: {0}
廣告未完成，沒有增加次數。|Ad incomplete; no attempt added.|広告未完了のため回数は増えていません。|광고가 완료되지 않아 횟수가 추가되지 않았습니다.|Реклама не завершена, попытка не добавлена.|Anuncio incompleto; no se añadió un intento.
廣告獎勵正在驗證，稍後回到此頁會自動補上次數。|Ad reward is being verified; return later for the attempt.|広告報酬を確認中。後で戻ると回数が追加されます。|광고 보상을 검증 중입니다. 나중에 돌아오면 횟수가 추가됩니다.|Награда проверяется. Вернитесь позже для попытки.|Se verifica la recompensa; vuelve después para recibir el intento.
加次數失敗：{0}|Bonus failed: {0}|回数追加失敗：{0}|횟수 추가 실패: {0}|Ошибка добавления попытки: {0}|Falló el intento extra: {0}
領取失敗：{0}|Claim failed: {0}|受取失敗：{0}|수령 실패: {0}|Ошибка получения: {0}|Error al recibir: {0}
反傷 {0}|Reflect {0}|反射 {0}|반사 {0}|Отражение {0}|Reflejo {0}
弱點|Weak point|弱点|약점|Слабое место|Punto débil
隱私權政策|Privacy Policy|プライバシーポリシー|개인정보 처리방침|Политика конфиденциальности|Política de privacidad
使用條款|Terms of Use|利用規約|이용약관|Условия использования|Condiciones de uso
月|month|月|월|месяц|mes
每月 NT$120|NT$120/month in Taiwan|台湾では月額NT$120|대만 기준 월 NT$120|NT$120 в месяц на Тайване|NT$120 al mes en Taiwán
{0} · 免廣告 · 一般商城 8 折 · 專屬砲台與黑曜王座戰場|{0} · Ad-free · 20% off the regular store · Exclusive turrets and battlefield|{0}・広告なし・通常ショップ20%割引・専用砲台と戦場|{0} · 광고 제거 · 일반 상점 20% 할인 · 전용 포탑과 전장|{0} · Без рекламы · Скидка 20% · Особые турели и поле|{0} · Sin anuncios · 20% de descuento · Torretas y campo exclusivos
查看訂閱|View subscription|定期購入を見る|구독 보기|Просмотр подписки|Ver suscripción
VIP 已啟用|VIP active|VIP有効|VIP 활성화|VIP активен|VIP activo
請先登入正式帳號，以便換機恢復訂閱。|Sign in to your account to restore your subscription on another device.|機種変更時に復元できるよう、アカウントにログインしてください。|다른 기기에서 구독을 복원하려면 계정에 로그인하세요.|Войдите в аккаунт для восстановления подписки на другом устройстве.|Inicia sesión para restaurar la suscripción en otro dispositivo.
請在 iPhone 或 Android App 內訂閱。|Subscribe in the iPhone or Android app.|iPhoneまたはAndroidアプリで定期購入してください。|iPhone 또는 Android 앱에서 구독하세요.|Оформите подписку в приложении iPhone или Android.|Suscríbete en la app de iPhone o Android.
訂閱無法完成：{0}|Subscription failed: {0}|定期購入失敗：{0}|구독 실패: {0}|Ошибка подписки: {0}|Falló la suscripción: {0}
購買成功，砲台已放入裝備庫。|Purchase complete. Turret added to your inventory.|購入完了。砲台を装備庫に追加しました。|구매 완료. 포탑을 장비고에 추가했습니다.|Покупка завершена. Турель добавлена в инвентарь.|Compra completada. Torreta añadida al inventario.
購買失敗：{0}|Purchase failed: {0}|購入失敗：{0}|구매 실패: {0}|Ошибка покупки: {0}|Compra fallida: {0}
稀有砲台 · 黑曜石直購|Rare turrets · Buy with Obsidian|レア砲台・黒曜石で購入|희귀 포탑 · 흑요석 구매|Редкие турели · За обсидиан|Torretas raras · Comprar con obsidiana
稀有砲台 · 可直接購買|Rare turrets · Direct purchase|レア砲台・直接購入|희귀 포탑 · 직접 구매|Редкие турели · Прямая покупка|Torretas raras · Compra directa
傳說砲台 · 100 碎片組裝|Legendary turrets · Assemble with 100 shards|伝説砲台・欠片100枚で組立|전설 포탑 · 조각 100개로 조립|Легендарные турели · 100 фрагментов|Torretas legendarias · Montar con 100 fragmentos
每 10 碎片 500 黑曜石；集滿 100 碎片需 5,000 黑曜石。所有傳說砲台合計每週限購 10 碎片。|500 Obsidian per 10 shards; 5,000 Obsidian for all 100. Limit: 10 legendary shards total each week.|欠片10枚で黒曜石500、100枚で5,000。伝説砲台の欠片は合計週10枚まで。|조각 10개당 흑요석 500, 100개는 5,000. 전설 조각은 합계 주 10개까지 구매 가능합니다.|500 обсидиана за 10 фрагментов, 5 000 за 100. Общий лимит — 10 легендарных фрагментов в неделю.|500 de obsidiana por 10 fragmentos; 5000 por 100. Límite total: 10 legendarios por semana.
訂閱|Subscribe|定期購入|구독|Подписаться|Suscribirse
專屬商品已解鎖|Exclusive items unlocked|限定商品を解放|전용 상품 해금|Особые товары открыты|Artículos exclusivos desbloqueados
每月自動續訂，可隨時在 App Store 或 Google Play 取消。|Renews monthly. Cancel anytime in your app store.|毎月自動更新。App StoreまたはGoogle Playでいつでも解約できます。|매월 자동 갱신됩니다. App Store 또는 Google Play에서 언제든 취소할 수 있습니다.|Продлевается ежемесячно. Отмена в App Store или Google Play.|Se renueva cada mes. Cancela en App Store o Google Play.
訂閱商品尚未在商店開放|Subscription is not available in the app store yet|定期購入商品はまだ利用できません|스토어에서 아직 구독할 수 없습니다|Подписка ещё недоступна в магазине|La suscripción aún no está disponible
用黑曜石購買|Buy with Obsidian|黒曜石で購入|흑요석으로 구매|Купить за обсидиан|Comprar con obsidiana
VIP 專屬|VIP exclusive|VIP限定|VIP 전용|Только VIP|Exclusivo VIP
10 碎片 · 500 黑曜石|10 shards · 500 Obsidian|欠片10枚・黒曜石500|조각 10개 · 흑요석 500|10 фрагментов · 500 обсидиана|10 fragmentos · 500 de obsidiana
完整砲台 · 2,600 黑曜石|Full turret · 2,600 Obsidian|完成砲台・黒曜石2,600|완성 포탑 · 흑요석 2,600|Готовая турель · 2 600 обсидиана|Torreta completa · 2600 de obsidiana
實戰預覽|Battle preview|戦闘プレビュー|전투 미리보기|Просмотр боя|Vista de combate
點擊選擇砲台|Choose turret|砲台を選択|포탑 선택|Выбрать турель|Elegir torreta
選擇已擁有的砲台，這一格會立即換裝。|Choose an owned turret for this slot.|所持砲台を選ぶと、この枠に即装備します。|보유 포탑을 선택하면 이 슬롯에 바로 장착됩니다.|Выберите полученную турель для этой ячейки.|Elige una torreta que tengas para esta casilla.
尚未擁有可用砲台；先收集碎片並組裝。|No available turret yet.|使える砲台がありません。欠片を集めて組み立てましょう。|사용 가능한 포탑이 없습니다. 조각을 모아 조립하세요.|Нет доступных турелей. Соберите фрагменты и создайте их.|Aún no hay torretas disponibles. Reúne fragmentos y móntalas.
卸下這格|Unequip slot|この枠を外す|슬롯 해제|Снять из ячейки|Desequipar casilla
主砲欄位|Main slots|主砲スロット|주포 슬롯|Основные ячейки|Casillas principales
副砲欄位|Support slots|副砲スロット|보조포 슬롯|Вспомогательные ячейки|Casillas auxiliares
前往新手計畫 ↗|Recruit missions ↗|新兵計画へ ↗|신병 계획으로 ↗|К заданиям новичка ↗|Misiones iniciales ↗
關閉預覽|Close preview|プレビューを閉じる|미리보기 닫기|Закрыть просмотр|Cerrar vista
黑曜王座|Obsidian Throne|黒曜の玉座|흑요석 왕좌|Обсидиановый трон|Trono de Obsidiana
星殿專屬戰場；裝備後，戰鬥取得的黑曜石 +10%。|VIP battlefield. Equip for +10% battle Obsidian.|星殿専用戦場。装備で戦闘黒曜石+10%。|VIP 전장. 장착 시 전투 흑요석 +10%.|Поле VIP. При экипировке +10% обсидиана в бою.|Campo VIP. Equiparlo da +10% de obsidiana en combate.
戰鬥黑曜石 ×1.10|Battle Obsidian ×1.10|戦闘黒曜石 ×1.10|전투 흑요석 ×1.10|Обсидиан в бою ×1.10|Obsidiana de combate ×1.10
查看 VIP|View VIP|VIPを見る|VIP 보기|Открыть VIP|Ver VIP
{0} 黑曜石|{0} Obsidian|黒曜石 {0}|흑요석 {0}|{0} обсидиана|{0} de obsidiana
{0} 太空幣|{0} Space Coins|スペースコイン {0}|스페이스 코인 {0}|{0} космомонет|{0} monedas espaciales
隨機砲塔碎片 ×{0}|Random turret shards ×{0}|ランダム砲台欠片 ×{0}|무작위 포탑 조각 ×{0}|Случайные фрагменты турелей ×{0}|Fragmentos de torreta aleatoria ×{0}
隨機絕招碎片 ×{0}|Random skill shards ×{0}|ランダム必殺技欠片 ×{0}|무작위 필살기 조각 ×{0}|Случайные фрагменты навыков ×{0}|Fragmentos de habilidad aleatoria ×{0}
`;
for(const line of rows.trim().split('\n')){const [source,...values]=line.split('|');SpaceTowerLocale.add(source,values);}
})();
