/* Additional UI copy: zh | en | ja | ko | ru | es. Keep placeholders intact. */
(() => {
  const rows=String.raw`
血量|HP|HP|체력|HP|Vida
VIP 金|VIP Gold|VIP ゴールド|VIP 골드|VIP Золото|VIP Oro
VIP 銀|VIP Silver|VIP シルバー|VIP 실버|VIP Серебро|VIP Plata
VIP 金色|VIP Gold|VIP ゴールド|VIP 골드|VIP Золото|VIP Oro
VIP 銀色|VIP Silver|VIP シルバー|VIP 실버|VIP Серебро|VIP Plata
暫時無法配對|Matchmaking unavailable|マッチングできません|매칭할 수 없습니다|Поиск недоступен|Búsqueda no disponible
返回備戰|Back to preparation|編成に戻る|편성으로|К подготовке|Volver a preparación
正在尋找對手|Finding an opponent|対戦相手を検索中|상대 검색 중|Поиск соперника|Buscando rival
陣容已鎖定 · 等待對戰訊號|Lineup locked · Searching|編成確定・対戦相手を検索中|편성 확정 · 상대 검색 중|Состав выбран · Идёт поиск|Equipo fijado · Buscando
對手訊號|Opponent signal|対戦相手の信号|상대 신호|Сигнал соперника|Señal del rival
搜尋中…|Searching…|検索中…|검색 중…|Поиск…|Buscando…
搜尋中|Searching|検索中|검색 중|Поиск|Buscando
取消配對|Cancel search|検索を中止|검색 취소|Отменить поиск|Cancelar búsqueda
杯|Cups|トロフィー|트로피|Кубки|Copas
{0} 杯|{0} cups|{0} トロフィー|트로피 {0}|{0} кубков|{0} copas
正在連接對手|Connecting to opponent|対戦相手に接続中|상대 연결 중|Соединение с соперником|Conectando con el rival
配對預覽|Match preview|対戦プレビュー|매칭 미리보기|Просмотр матча|Vista de partida
排位對戰|Ranked match|ランク対戦|랭크 대전|Рейтинговый бой|Partida clasificatoria
對手已就緒|Opponent ready|対戦相手が準備完了|상대 준비 완료|Соперник готов|Rival listo
對手連接中|Opponent connecting|対戦相手が接続中|상대 연결 중|Соперник подключается|El rival se conecta
雙方陣容鎖定 · 準備進場|Both lineups locked · Get ready|両者の編成確定・出撃準備|양측 편성 확정 · 출격 준비|Составы выбраны · Приготовьтесь|Equipos fijados · Prepárate
對手重新連線中|Opponent reconnecting|対戦相手が再接続中|상대 재연결 중|Соперник переподключается|El rival se reconecta
對手未能連線，請重新配對|Opponent could not connect. Search again.|相手に接続できませんでした。再検索してください。|상대 연결에 실패했습니다. 다시 검색하세요.|Соперник не подключился. Повторите поиск.|El rival no pudo conectarse. Busca de nuevo.
操作確認中|Confirming action|操作を確認中|동작 확인 중|Подтверждение действия|Confirmando acción
等待對戰開始|Waiting for battle|対戦開始を待っています|대전 시작 대기|Ожидание начала боя|Esperando el combate
尚未解鎖|Locked|未解放|미해금|Закрыто|Bloqueado
新手計畫|Recruit missions|新兵ミッション|신병 임무|Задания новичка|Misiones iniciales
第 {2} 格，尚未擁有砲台|Slot {2}, no turret owned|スロット {2}、砲台未所持|슬롯 {2}, 보유 포탑 없음|Ячейка {2}, турель не получена|Casilla {2}, sin torreta
第 {5} 種砲台 {6} 血量 {7}，點選替換|Slot {5}: {6}, HP {7}. Tap to replace.|スロット {5}：{6}、HP {7}。タップで交換。|슬롯 {5}: {6}, HP {7}. 눌러 교체.|Ячейка {5}: {6}, HP {7}. Нажмите для замены.|Casilla {5}: {6}, vida {7}. Toca para cambiar.
首航訓練|First-flight training|初出撃訓練|첫 출격 훈련|Первый учебный вылет|Entrenamiento inicial
星環守衛|Orbit Sentinel|星環の守衛|궤도 수호자|Страж орбиты|Centinela orbital
等待對手|Awaiting opponent|対戦相手を待機|상대 대기 중|Ожидание соперника|Esperando rival
召喚砲台，花費 {0} 金幣{1}|Summon turret: {0} gold{1}|砲台召喚：{0} ゴールド{1}|포탑 소환: 골드 {0}{1}|Призыв турели: {0} золота{1}|Invocar torreta: {0} de oro{1}
，場上已滿|, board full|、配置上限|, 전장 가득 참|, поле заполнено|, campo lleno
{0} {1} 級，{2}|{0} level {1}, {2}|{0} レベル {1}、{2}|{0} 레벨 {1}, {2}|{0}, уровень {1}, {2}|{0}, nivel {1}, {2}
已達最高等級|Maximum level|最大レベル|최대 레벨|Максимальный уровень|Nivel máximo
升級 {0} 金幣|Upgrade: {0} gold|強化：{0} ゴールド|강화: 골드 {0}|Улучшение: {0} золота|Mejorar: {0} de oro
繼續演練|Resume|再開|계속|Продолжить|Continuar
暫停演練|Pause|一時停止|일시 정지|Пауза|Pausar
欄位 {0}，{1}，{2} 星，血量 {3} / {4}{5}|Slot {0}, {1}, {2} stars, HP {3} / {4}{5}|スロット {0}、{1}、星{2}、HP {3} / {4}{5}|슬롯 {0}, {1}, {2}성, HP {3} / {4}{5}|Ячейка {0}, {1}, звёзд: {2}, HP {3} / {4}{5}|Casilla {0}, {1}, {2} estrellas, vida {3} / {4}{5}
，可融合|, merge available|、合成可能|, 합성 가능|, можно объединить|, se puede fusionar
欄位 {0}，空位|Slot {0}, empty|スロット {0}、空き|슬롯 {0}, 비어 있음|Ячейка {0}, пусто|Casilla {0}, vacía
欄位 {0}|Slot {0}|スロット {0}|슬롯 {0}|Ячейка {0}|Casilla {0}
同種同星 · 點選或拖曳融合|Same type and stars · Tap or drag to merge|同種・同星をタップかドラッグで合成|같은 종류·별 · 누르거나 끌어 합성|Один тип и звёзды · Нажмите или перетащите|Mismo tipo y estrellas · Toca o arrastra
勢均力敵|Draw|引き分け|무승부|Ничья|Empate
排位勝利|Ranked victory|ランク戦勝利|랭크전 승리|Победа в рейтинге|Victoria clasificatoria
陣地失守|Defeat|防衛失敗|방어 실패|Поражение|Derrota
{0} · 擊破 {1}|{0} · {1} defeated|{0}・撃破 {1}|{0} · 격파 {1}|{0} · Уничтожено: {1}|{0} · {1} destruidos
{0} → {1} · 連敗回升 +{2}|{0} → {1} · Comeback +{2}|{0} → {1}・連敗からの復帰 +{2}|{0} → {1} · 연패 반등 +{2}|{0} → {1} · Возвращение +{2}|{0} → {1} · Remontada +{2}
{0} → {1} · 連勝終止 −{2}|{0} → {1} · Streak ended −{2}|{0} → {1}・連勝終了 −{2}|{0} → {1} · 연승 종료 −{2}|{0} → {1} · Серия прервана −{2}|{0} → {1} · Fin de racha −{2}
本機預覽獎勵|Preview reward|プレビュー報酬|미리보기 보상|Награда в просмотре|Recompensa de muestra
回首頁同步領取|Sync rewards from home|ホームで報酬を同期|홈에서 보상 동기화|Синхронизация в главном меню|Sincroniza desde el inicio
再來一場|Play again|もう一戦|다시 대전|Ещё раз|Otra partida
召喚時會隨機選擇空位|Summons use a random empty slot.|召喚は空きスロットにランダム配置されます。|빈 슬롯에 무작위로 소환됩니다.|Турель появится в случайной пустой ячейке.|Se invoca en una casilla vacía al azar.
融合成功 · {0} ★{1}|Merged · {0} ★{1}|合成成功・{0} ★{1}|합성 성공 · {0} ★{1}|Объединение · {0} ★{1}|Fusión · {0} ★{1}
{0} HP {1} → {2} · 核心 +{3}|{0} HP {1} → {2} · Core +{3}|{0} HP {1} → {2}・コア +{3}|{0} HP {1} → {2} · 코어 +{3}|{0} HP {1} → {2} · Ядро +{3}|{0} vida {1} → {2} · Núcleo +{3}
{0}強化 Lv.{1}|{0} upgrade Lv.{1}|{0}強化 Lv.{1}|{0} 강화 Lv.{1}|{0}: улучшение ур.{1}|{0} mejorado Nv.{1}
已部署 {0} ★1|Deployed {0} ★1|{0} ★1 を配置|{0} ★1 배치|Размещено: {0} ★1|Desplegado: {0} ★1
一般模式 {0}/2 · 再完成一場領一座|Normal runs {0}/2 · One turret per run|通常モード {0}/2・次の完走で砲台獲得|일반 모드 {0}/2 · 한 판마다 포탑 획득|Обычные бои {0}/2 · Турель за бой|Modo normal {0}/2 · Una torreta por partida
已擁有 {0} 種{1}|{0} types owned{1}|{0} 種所持{1}|{0}종 보유{1}|Получено типов: {0}{1}|{0} tipos obtenidos{1}
· 已達五種門檻|· Five-type requirement met|・5種の条件達成|· 5종 조건 달성|· Есть пять типов|· Requisito de cinco cumplido
· 完成教學領取兩座|· Complete training for two turrets|・訓練完了で2種獲得|· 훈련 완료 시 2종 획득|· Две турели за обучение|· Dos torretas por el tutorial
進度讀取失敗|Could not load progress|進行状況の読込失敗|진행 상황 로드 실패|Не удалось загрузить прогресс|No se pudo cargar el progreso
開始配對|Find match|対戦相手を探す|매칭 시작|Найти соперника|Buscar partida
前往一般模式|Play normal mode|通常モードへ|일반 모드로|В обычный режим|Ir al modo normal
前往一般模式 {0}/2|Play normal mode {0}/2|通常モードへ {0}/2|일반 모드로 {0}/2|В обычный режим {0}/2|Ir al modo normal {0}/2
開始新手教學|Start tutorial|チュートリアル開始|튜토리얼 시작|Начать обучение|Iniciar tutorial
替換第 {0} 座|Replace slot {0}|スロット {0} を交換|{0}번 슬롯 교체|Заменить ячейку {0}|Cambiar casilla {0}
第 {0} 座 · {1}|Slot {0} · {1}|スロット {0}・{1}|슬롯 {0} · {1}|Ячейка {0} · {1}|Casilla {0} · {1}
尚未擁有|Not owned|未所持|미보유|Не получено|Sin obtener
沒有符合的砲台|No matching turrets|該当する砲台なし|일치하는 포탑 없음|Турели не найдены|No hay torretas coincidentes
查看{3}基礎數值|View {3} base stats|{3} の基本数値を見る|{3} 기본 수치 보기|Параметры: {3}|Ver atributos de {3}
· 出戰|· Selected|・出撃|· 출격|· В составе|· Seleccionada
初始持有|Owned from the start|初期所持|기본 보유|Доступно с начала|Disponible al inicio
完成新手教學|Complete recruit training|新兵訓練を完了|신병 훈련 완료|Пройти обучение новичка|Completar entrenamiento
完成互動教學|Complete interactive training|操作訓練を完了|조작 훈련 완료|Пройти практическое обучение|Completar tutorial práctico
完成第 1 場一般模式|Complete your first normal run|通常モードを1回完走|일반 모드 첫 판 완료|Завершить первый обычный бой|Completar primera partida normal
完成第 2 場一般模式|Complete your second normal run|通常モードを2回完走|일반 모드 두 번째 판 완료|Завершить второй обычный бой|Completar segunda partida normal
已領取|Claimed|受取済み|수령 완료|Получено|Recibido
尚未領取|Unclaimed|未受取|미수령|Не получено|Sin reclamar
待完成|Incomplete|未完了|미완료|Не выполнено|Pendiente
開始互動教學|Start training|操作訓練を開始|조작 훈련 시작|Начать обучение|Iniciar entrenamiento
召喚第一座砲台|Summon your first turret|最初の砲台を召喚|첫 포탑 소환|Призовите первую турель|Invoca tu primera torreta
點亮下方召喚鈕，部署你的第一座砲台。|Tap the highlighted Summon button below to deploy your first turret.|下の光る召喚ボタンを押して、最初の砲台を配置しましょう。|아래 강조된 소환 버튼을 눌러 첫 포탑을 배치하세요.|Нажмите выделенную кнопку призыва внизу, чтобы разместить первую турель.|Toca Invocar abajo para desplegar tu primera torreta.
再召喚一座|Summon another|もう1座召喚|한 기 더 소환|Призовите ещё одну|Invoca otra
再點一次召喚；教學先提供相同種類，練習融合。|Tap Summon again. Training gives the same type so you can practice merging.|もう一度召喚。訓練では同じ種類が出るので、合成を練習できます。|다시 소환하세요. 합성을 연습하도록 같은 종류가 나옵니다.|Нажмите призыв ещё раз. В обучении вы получите тот же тип для объединения.|Invoca otra vez. El tutorial da el mismo tipo para practicar la fusión.
合併同種同星砲台|Merge matching turrets|同種・同星の砲台を合成|같은 종류·별 포탑 합성|Объедините одинаковые турели|Fusiona torretas iguales
點選一座，再點另一座；也可以直接拖曳到另一座上。|Tap one turret, then the other, or drag one onto the other.|1座を選び、もう1座をタップ。ドラッグでも合成できます。|하나를 누른 뒤 다른 하나를 누르거나 서로 끌어 놓으세요.|Выберите одну турель, затем другую, или перетащите одну на другую.|Toca una y luego la otra, o arrastra una sobre la otra.
打開戰鬥強化|Open battle upgrades|戦闘強化を開く|전투 강화 열기|Откройте улучшения|Abre las mejoras
點下方強化鈕，查看本場可以提升的能力。|Tap Upgrades below to see this match's upgrades.|下の強化ボタンで、この対戦の強化項目を確認しましょう。|아래 강화 버튼으로 이번 대전에서 올릴 능력을 확인하세요.|Нажмите кнопку улучшений внизу, чтобы увидеть доступные параметры.|Toca Mejoras abajo para ver qué puedes mejorar en esta partida.
提升物理攻擊|Increase physical attack|物理攻撃を強化|물리 공격 강화|Повысьте физический урон|Aumenta el ataque físico
點亮物攻卡片，花費 10 金幣完成第一次強化。|Tap the highlighted physical attack card. Your first upgrade costs 10 gold.|光る物攻カードを押し、10ゴールドで初めての強化をしましょう。|강조된 물리 공격 카드를 눌러 골드 10으로 첫 강화를 하세요.|Нажмите выделенную карточку физического урона. Первое улучшение стоит 10 золота.|Toca la tarjeta de ataque físico. La primera mejora cuesta 10 de oro.
觀察砲台自動攻擊|Watch automatic fire|自動攻撃を確認|자동 공격 관찰|Наблюдайте за стрельбой|Observa el ataque automático
砲台會自動開火。擊破敵機，就會立即把它送到對面。|Turrets fire automatically. Each defeated enemy is immediately sent to your opponent.|砲台は自動攻撃。撃破した敵はすぐ相手側に送られます。|포탑은 자동으로 발사합니다. 격파한 적은 즉시 상대에게 보내집니다.|Турели стреляют автоматически. Каждый уничтоженный враг сразу отправляется сопернику.|Las torretas disparan solas. Cada enemigo destruido se envía al rival al instante.
敵機已送往對手|Enemy sent to opponent|敵を相手側へ転送|적을 상대에게 전송|Враг отправлен сопернику|Enemigo enviado al rival
擊破一隻，對面就出現一隻；同種同星融合後會隨機變換種類。|Each kill sends one enemy across. Merging the same type and stars gives a random type.|1体倒すと相手側に1体出現。同種・同星の合成で種類がランダムに変わります。|한 기를 잡으면 상대에게 한 기가 나타납니다. 같은 종류·별을 합성하면 종류가 무작위로 바뀝니다.|Каждое убийство отправляет врага сопернику. При объединении тип меняется случайно.|Cada baja envía un enemigo. Fusionar el mismo tipo y estrellas cambia el tipo al azar.
② 再點這座|② Then tap this|② 次にここをタップ|② 다음은 여기|② Теперь сюда|② Luego toca aquí
① 先點這座|① Tap this first|① まずここをタップ|① 먼저 여기|① Сначала сюда|① Primero toca aquí
點擊召喚|Tap Summon|召喚をタップ|소환 누르기|Нажмите призыв|Toca Invocar
打開強化|Open upgrades|強化を開く|강화 열기|Открыть улучшения|Abrir mejoras
點擊物攻|Tap physical attack|物攻をタップ|물리 공격 누르기|Нажмите физ. урон|Toca ataque físico
再點另一座，完成融合|Tap the other turret to merge|もう1座を選んで合成|다른 포탑을 눌러 합성|Выберите вторую турель|Toca la otra para fusionar
先選第一座砲台|Select the first turret|最初の砲台を選択|첫 포탑 선택|Выберите первую турель|Selecciona la primera torreta
第一座已選取。點亮框中的另一座 ★1，融合成隨機種類的 ★2 砲台。|First turret selected. Tap the highlighted ★1 turret to merge into a random ★2 turret.|1座目を選択済み。光る枠の★1砲台を押すと、ランダムな★2砲台に合成します。|첫 포탑을 선택했습니다. 강조된 ★1 포탑을 눌러 무작위 ★2 포탑으로 합성하세요.|Первая выбрана. Нажмите выделенную ★1, чтобы получить случайную турель ★2.|Primera seleccionada. Toca la ★1 resaltada para fusionar en una ★2 aleatoria.
點「①」亮框中的砲台，選為融合來源。接著會標示第二座。|Tap the turret highlighted with ①. The second turret will then be marked.|①の光る枠の砲台を選んでください。次に2座目が表示されます。|①로 강조된 포탑을 누르세요. 다음으로 두 번째 포탑이 표시됩니다.|Нажмите турель в рамке ①. Затем будет отмечена вторая.|Toca la torreta marcada con ①. Después se marcará la segunda.
首航訓練 {0} / 07|Training {0} / 07|初出撃訓練 {0} / 07|첫 출격 훈련 {0} / 07|Обучение {0} / 07|Entrenamiento {0} / 07
完成教學|Finish training|訓練を完了|훈련 완료|Завершить обучение|Terminar tutorial
已領過的砲台不會重複發放。|Previously claimed turrets are not granted again.|受取済みの砲台は再配布されません。|이미 받은 포탑은 다시 지급되지 않습니다.|Уже полученные турели повторно не выдаются.|Las torretas ya recibidas no se entregan otra vez.
兩座 G1 砲台，加入你的軍械庫。|Two G1 turrets for your arsenal.|2座のG1砲台が軍備に加わります。|G1 포탑 두 기를 무기고에 추가하세요.|Две турели G1 для вашего арсенала.|Dos torretas G1 para tu arsenal.
領取兩座砲台|Claim two turrets|砲台2座を受け取る|포탑 2기 받기|Получить две турели|Recibir dos torretas
無法儲存進度，獎勵尚未領取。請重試。|Progress could not be saved. Reward not claimed. Try again.|保存できません。報酬は未受取です。再試行してください。|진행 저장 실패. 보상을 아직 받지 못했습니다. 다시 시도하세요.|Не удалось сохранить прогресс. Награда не получена. Повторите попытку.|No se pudo guardar. La recompensa sigue pendiente. Reinténtalo.
排位初始 HP|Ranked HP|ランク戦初期HP|랭크 초기 HP|HP в рейтинге|Vida clasificatoria
排位初始 HP {0}|Ranked HP {0}|ランク戦初期HP {0}|랭크 초기 HP {0}|HP в рейтинге {0}|Vida clasificatoria {0}
{0} · {1}|{0} · {1}|{0}・{1}|{0} · {1}|{0} · {1}|{0} · {1}
VIP 星殿|VIP Sanctuary|VIP星殿|VIP 성전|VIP-святилище|Santuario VIP
魔攻倍率 × {0}|Magic multiplier × {0}|魔攻倍率 × {0}|마공 배율 × {0}|Множитель маг. урона × {0}|Multiplicador mágico × {0}
物攻倍率 × {0}|Physical multiplier × {0}|物攻倍率 × {0}|물공 배율 × {0}|Множитель физ. урона × {0}|Multiplicador físico × {0}
攻速倍率 × {0}|Rate multiplier × {0}|攻速倍率 × {0}|공속 배율 × {0}|Множитель скорострельности × {0}|Multiplicador de cadencia × {0}
{7}單發傷害|{7} damage per shot|{7}の単発ダメージ|{7} 단발 피해|{7}: урон за выстрел|Daño {7} por disparo
初始攻速|Base fire rate|初期攻撃速度|기본 공격 속도|Базовая скорострельность|Cadencia inicial
次 / 秒|/ second|回 / 秒|회 / 초|/ сек.|/ segundo
初始持有的標準砲台，發射單發物理彈。|Your starting cannon fires single physical rounds.|初期所持の標準砲台。物理弾を単発で発射。|처음 보유한 표준 포탑으로 단발 물리탄을 발사합니다.|Начальная пушка стреляет одиночными физическими снарядами.|El cañón inicial dispara proyectiles físicos individuales.
魔法|Magic|魔法|마법|Магический|mágico
物理|Physical|物理|물리|Физический|físico
{0}% 最大 HP|{0}% max HP|最大HPの{0}%|최대 HP {0}%|{0}% макс. HP|{0}% de vida máxima
工坊收集碎片或對應商城取得|Collect fragments in the workshop or visit its store.|工房で欠片を集めるか、対応ショップで入手。|공방에서 조각을 모으거나 해당 상점에서 획득하세요.|Собирайте фрагменты в мастерской или получите в магазине.|Consigue fragmentos en el taller o en su tienda.
· 一般模式原始核心 HP 10、物攻 10、魔攻 0、攻速 4.17 次 / 秒。|· Normal base: core HP 10, physical 10, magic 0, 4.17 shots/s.|・通常初期値：コアHP10、物攻10、魔攻0、毎秒4.17発。|· 일반 기본: 코어 HP 10, 물공 10, 마공 0, 초당 4.17발.|· Обычный режим: HP ядра 10, физ. урон 10, маг. 0, 4,17 выстрела/с.|· Base normal: vida 10, ataque físico 10, mágico 0, 4,17 disparos/s.
請先回首頁登入，再開始配對|Sign in from home before matchmaking.|ホームでログインしてから対戦検索してください。|홈에서 로그인한 후 매칭하세요.|Войдите в аккаунт из главного меню перед поиском.|Inicia sesión desde el inicio antes de buscar.
請先回首頁同步五砲陣容與教學進度|Sync your five-turret lineup and training progress from home.|ホームで5種の編成と訓練進行を同期してください。|홈에서 5종 편성과 훈련 진행을 동기화하세요.|Синхронизируйте состав из пяти турелей и обучение в главном меню.|Sincroniza tu equipo de cinco y el tutorial desde el inicio.
配對服務尚未開放，請稍後再試|Matchmaking is not available yet. Try later.|対戦サービスはまだ利用できません。後でお試しください。|매칭 서비스가 아직 열리지 않았습니다. 나중에 다시 시도하세요.|Подбор ещё недоступен. Попробуйте позже.|El emparejamiento aún no está disponible. Inténtalo más tarde.
配對連線暫時中斷|Matchmaking connection interrupted|対戦検索の接続が切れました|매칭 연결이 끊겼습니다|Соединение с поиском прервано|Conexión de búsqueda interrumpida
對戰已結束，請重新配對|Match ended. Search again.|対戦終了。再検索してください。|대전이 끝났습니다. 다시 매칭하세요.|Бой завершён. Повторите поиск.|La partida terminó. Busca de nuevo.
連線中斷，正在重新連接|Connection lost. Reconnecting…|接続切断。再接続中…|연결 끊김. 재연결 중…|Связь потеряна. Переподключение…|Sin conexión. Reconectando…
配對已逾時，請重新開始|Search expired. Please restart.|検索がタイムアウトしました。再開してください。|검색 시간이 초과되었습니다. 다시 시작하세요.|Поиск истёк. Начните снова.|La búsqueda caducó. Reiníciala.
等待連線確認|Waiting for confirmation|接続確認を待機|연결 확인 대기|Ожидание подтверждения|Esperando confirmación
操作確認中，請稍候|Confirming action. Please wait.|操作確認中。お待ちください。|동작 확인 중입니다. 기다려 주세요.|Подтверждаем действие. Подождите.|Confirmando acción. Espera.
圖鑑|Archive|図鑑|도감|Архив|Archivo
已擁有 {0} 種砲台 · {1}|{0} turret types · {1}|砲台{0}種所持・{1}|포탑 {0}종 · {1}|Типов турелей: {0} · {1}|{0} tipos de torreta · {1}
可開始排位|Ranked ready|ランク戦参加可能|랭크전 가능|Рейтинг доступен|Clasificatoria disponible
集滿五種開放排位|5 types required|5種でランク戦解放|5종 보유 시 랭크 해금|Требуется 5 типов|Se necesitan 5 tipos
排位備戰 ↗|Ranked prep ↗|ランク戦準備 ↗|랭크 준비 ↗|Подготовка ↗|Preparar equipo ↗
查看解鎖進度 ↗|Unlock progress ↗|解放進行を見る ↗|해금 진행 ↗|Прогресс открытия ↗|Ver progreso ↗
新手教學 ↗|Recruit training ↗|新兵訓練 ↗|신병 훈련 ↗|Обучение ↗|Entrenamiento ↗
新手出戰計畫|Recruit missions|新兵出撃計画|신병 출격 계획|Задания новичка|Misiones iniciales
完成一般模式，領取|Complete a normal run to earn|通常モード完走で獲得|일반 모드 완료 보상|Завершите обычный бой и получите|Completa una partida normal y obtén
戰機圖鑑|Enemy archive|敵機図鑑|적기 도감|Архив врагов|Archivo de enemigos
砲台圖鑑|Turret archive|砲台図鑑|포탑 도감|Архив турелей|Archivo de torretas
魔攻倍率|Magic multiplier|魔攻倍率|마공 배율|Множитель маг. урона|Multiplicador mágico
物攻倍率|Physical multiplier|物攻倍率|물공 배율|Множитель физ. урона|Multiplicador físico
攻速倍率|Rate multiplier|攻速倍率|공속 배율|Множитель скорострельности|Multiplicador de cadencia
一般模式：HP 10 · 物攻 10 · 魔攻 0 · 4.17 次 / 秒|Normal: HP 10 · Physical 10 · Magic 0 · 4.17/s|通常：HP10・物攻10・魔攻0・毎秒4.17発|일반: HP 10 · 물공 10 · 마공 0 · 초당 4.17발|Обычный: HP 10 · Физ. 10 · Маг. 0 · 4,17/с|Normal: vida 10 · Físico 10 · Mágico 0 · 4,17/s
砲台獎勵尚未儲存。|Turret reward has not been saved.|砲台報酬はまだ保存されていません。|포탑 보상이 저장되지 않았습니다.|Награда-турель не сохранена.|La recompensa de torreta no se ha guardado.
重試領取|Retry claim|受取を再試行|수령 재시도|Повторить получение|Reintentar
新手出戰計畫 · 永久獲得|RECRUIT REWARD · UNLOCKED|新兵報酬・永久獲得|신병 보상 · 영구 획득|НАГРАДА НОВИЧКА · НАВСЕГДА|RECOMPENSA INICIAL · PERMANENTE
一般模式 1/2 完成 · 再完成一場，領薄霜減速砲。|1/2 normal runs complete. Finish one more for the Light Frost Cannon.|通常モード1/2完了。もう1回完走で薄霜減速砲を獲得。|일반 모드 1/2 완료. 한 판 더 완료하면 서리 감속포를 받습니다.|Обычные бои 1/2. Ещё один — и вы получите пушку лёгкого инея.|Partidas normales 1/2. Completa otra para recibir el cañón de escarcha.
一般模式 2/2 完成 · 五砲到齊，排位已解鎖。|2/2 normal runs complete. Ranked unlocked.|通常モード2/2完了。5種が揃いランク戦解放。|일반 모드 2/2 완료. 5종을 모아 랭크전이 열렸습니다.|Обычные бои 2/2. Пять турелей собраны, рейтинг открыт.|Partidas normales 2/2. Clasificatoria desbloqueada.
前往排位備戰 ↗|Prepare for ranked ↗|ランク戦準備へ ↗|랭크 준비로 ↗|К подготовке рейтинга ↗|Preparar clasificatoria ↗
坦克|Tank|タンク|탱커|Танк|Tanque
重裝|Heavy|重装|중장갑|Тяжёлая|Pesada
突擊|Assault|突撃|돌격|Штурм|Asalto
爆發|Burst|瞬間火力|폭딜|Взрывной урон|Ráfaga
控制|Control|制御|제어|Контроль|Control
輔助|Support|支援|지원|Поддержка|Apoyo
`;
  for(const line of rows.trim().split('\n')){const [source,...values]=line.split('|');SpaceTowerLocale.add(source,values);}
})();
