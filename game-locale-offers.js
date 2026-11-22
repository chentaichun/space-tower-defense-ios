/* Value packs, monthly pass, nine new turrets, onboarding refresh, bottom-bar "More" and battle juice copy. */
(() => {
const rows=String.raw`
暴擊 {0}|CRIT {0}|会心 {0}|치명 {0}|КРИТ {0}|CRÍTICO {0}
致命 {0}|LETHAL {0}|致命 {0}|치명타 {0}|СМЕРТЬ {0}|LETAL {0}
致命|LETHAL|致命|치명타|СМЕРТЬ|LETAL
點它！|Tap it!|タップ！|탭!|Жми!|¡Tócalo!
更多|More|その他|더보기|Ещё|Más
先點選「更多」→「{0}」|First tap “More” → “{0}”|まず「その他」→「{0}」をタップ|먼저 “더보기” → “{0}” 탭|Нажмите «Ещё» → «{0}»|Toca «Más» → «{0}»
元氣聚能砲|Spirit Charger|元気チャージ砲|원기 집속포|Пушка духа|Cañón de Espíritu
蓄積元氣，周期性為核心回復並強化周圍砲台。|Gathers spirit energy to heal the core and boost nearby turrets.|元気を溜め、定期的にコアを回復し周囲の砲台を強化。|원기를 모아 코어를 회복하고 주변 포탑을 강화합니다.|Копит энергию, лечит ядро и усиливает соседние турели.|Acumula energía, cura el núcleo y potencia torretas cercanas.
每 8 秒回復核心 6% 血量，周圍砲台攻速 +10%。|Every 8s heals the core for 6% HP; nearby turrets +10% attack speed.|8秒ごとにコアHPを6%回復、周囲の砲台の攻撃速度+10%。|8초마다 코어 HP 6% 회복, 주변 포탑 공격 속도 +10%.|Каждые 8 с лечит ядро на 6%; соседние турели +10% к скорости атаки.|Cada 8 s cura el 6% del núcleo; torretas cercanas +10% de cadencia.
冰牆結界砲|Frost Wall Cannon|氷壁結界砲|빙벽 결계포|Пушка ледяной стены|Cañón Muro Helado
豎起冰晶牆，阻擋並凍結衝向核心的敵機。|Raises an ice wall that blocks and freezes enemies rushing the core.|氷晶の壁を築き、コアへ迫る敵機を阻んで凍らせる。|얼음벽을 세워 코어로 돌진하는 적을 막고 얼립니다.|Возводит ледяную стену, сдерживая и замораживая врагов.|Alza un muro de hielo que frena y congela a los enemigos.
每 6 秒在前方築起冰牆 4 秒，擋住敵機並減速 40%，碎裂時造成範圍傷害。|Every 6s raises an ice wall for 4s that holds enemies and slows them 40%, then shatters for area damage.|6秒ごとに前方へ4秒間の氷壁、敵を足止めして40%減速、砕ける時に範囲ダメージ。|6초마다 4초간 빙벽 생성, 적을 붙잡고 40% 감속, 부서질 때 범위 피해.|Каждые 6 с ледяная стена на 4 с держит врагов и замедляет на 40%, а раскалываясь, бьёт по области.|Cada 6 s, muro de hielo de 4 s que retiene y ralentiza un 40%; al romperse daña en área.
爆彈副砲|Bomb Sub-cannon|爆弾サブ砲|폭탄 보조포|Бомбовая подпушка|Subcañón Bomba
大|Large|大|대형|Большая|Grande
拋射爆彈，炸毀的敵機會連鎖再爆。|Lobbed bombs blast an area; ships they destroy explode in turn.|放物線の爆弾が範囲を爆破し、倒した敵が連鎖爆発。|포물선 폭탄이 범위를 폭파하고, 격파된 적이 연쇄 폭발합니다.|Навесные бомбы бьют по области; уничтоженные корабли взрываются следом.|Bombas en parábola que estallan en área; las naves destruidas explotan en cadena.
爆炸追加最大血量 4% 傷害，炸毀的敵機連鎖爆炸。|Blasts add 4% of max HP as damage; destroyed ships chain-explode.|爆発で最大HPの4%を追加、倒した敵が連鎖爆発。|폭발이 최대 HP 4% 추가 피해, 격파된 적은 연쇄 폭발.|Взрыв добавляет 4% макс. здоровья; уничтоженные корабли взрываются цепью.|La explosión añade un 4% de la vida máxima; las naves destruidas estallan en cadena.
火鳳烈焰砲|Phoenix Blaze Cannon|火鳳烈炎砲|화봉 열염포|Пушка огненного феникса|Cañón Fénix Ardiente
火鳳展翼，射出火元素砲彈並灼燒敵群。|The phoenix spreads its wings, firing flame shells that burn enemy swarms.|火の鳳凰が翼を広げ、炎の弾で敵群を焼き尽くす。|불사조가 날개를 펴 화염탄으로 적 무리를 태웁니다.|Феникс расправляет крылья и сжигает врагов огненными снарядами.|El fénix despliega sus alas y abrasa al enemigo con proyectiles de fuego.
火彈範圍灼燒，每 10 秒火鳳俯衝掠過整條航道。|Flame shells scorch an area; every 10s the phoenix dives across the whole lane.|炎の弾が範囲を焼き、10秒ごとに火鳳が航路全体へ急降下。|화염탄이 범위를 태우고, 10초마다 화봉이 항로 전체로 강하합니다.|Огненные снаряды жгут область; каждые 10 с феникс пикирует через весь маршрут.|Los proyectiles queman en área; cada 10 s el fénix cruza toda la ruta en picado.
殘像幻影砲|Afterimage Cannon|残像ファントム砲|잔상 환영포|Призрачная пушка|Cañón Espejismo
11 道紫色殘像環繞砲台，碰觸即傷。|11 violet afterimages circle the turret and cut whatever they touch.|11の紫の残像が砲台を旋回し、触れた敵を斬る。|11개의 보라색 잔상이 포탑을 돌며 닿는 적을 벱니다.|11 фиолетовых призраков кружат у башни и режут всех, кого коснутся.|11 espejismos violetas giran alrededor de la torreta y cortan lo que tocan.
11 道殘像環繞砲台，碰到敵機造成最大血量 0.5% 的傷害。|11 afterimages circle the turret; each touch deals 0.5% of the enemy's max HP.|11の残像が砲台を旋回し、触れた敵に最大HPの0.5%ダメージ。|11개의 잔상이 포탑을 돌며 닿은 적에게 최대 HP 0.5% 피해.|11 призраков кружат вокруг башни; касание наносит 0,5% макс. здоровья врага.|11 espejismos giran alrededor de la torreta; cada toque inflige un 0,5% de la vida máxima.
千刃劍匣|Thousand-Blade Case|千刃剣匣|천인검갑|Ларец тысячи клинков|Cofre de Mil Hojas
水墨古劍，御劍成河。|Ink-wash ancient swords that flow like a river of blades.|水墨の古剣、剣の河となって舞う。|수묵의 고검이 검의 강처럼 흐릅니다.|Древние клинки в стиле туши текут рекой мечей.|Espadas antiguas a tinta que fluyen como un río de hojas.
12 把古劍依序出匣如劍河追敵；每第 3 次化為金劍陣齊發。|12 swords stream out like a river onto enemies; every 3rd volley becomes a golden sword array.|12本の古剣が剣の河となって敵を追う。3回ごとに金の剣陣が一斉発射。|12자루의 고검이 검의 강처럼 적을 추격하고, 3번째마다 금빛 검진이 일제히 발사됩니다.|12 мечей рекой летят к врагам; каждый 3-й залп — золотой строй мечей.|12 espadas fluyen como un río hacia los enemigos; cada 3.ª andanada es una formación dorada.
五芒飛彈艙|Pentagram Missile Pod|五芒ミサイル艙|오망 미사일 포드|Пентаграммный ракетный отсек|Cápsula Pentagrama
一次五發，排成正五邊形齊射。|Five missiles per volley in a perfect pentagon.|5発を正五角形に並べて一斉射撃。|5발을 정오각형으로 일제 사격.|Пять ракет залпом правильным пятиугольником.|Cinco misiles por ráfaga en pentágono perfecto.
每 4 秒 5 發飛彈排成正五邊形飛出，落成五芒星陣引爆並定身。|Every 4s, 5 missiles fly in a pentagon and drop into a pentagram seal that detonates and pins enemies.|4秒ごとに5発が正五角形で飛び、五芒星陣となって起爆し敵を拘束。|4초마다 5발이 정오각형으로 날아가 오망성 진으로 폭발하며 적을 묶습니다.|Каждые 4 с 5 ракет летят пятиугольником и взрываются печатью-пентаграммой, сковывая врагов.|Cada 4 s, 5 misiles vuelan en pentágono y estallan en un sello de pentagrama que inmoviliza.
六芒忍刃砲|Hexagram Shuriken Cannon|六芒忍刃砲|육망 인검포|Гексаграммная пушка сюрикенов|Cañón Shuriken Hexagrama
六枚迴旋手裏劍，劃出六瓣花。|Six returning shuriken trace a six-petal flower.|6枚の回旋手裏剣が六弁の花を描く。|6개의 회전 수리검이 여섯 잎 꽃을 그립니다.|Шесть возвращающихся сюрикенов рисуют шестилепестковый цветок.|Seis shuriken que regresan trazan una flor de seis pétalos.
每 3 秒擲出 6 枚迴旋手裏劍，去回各斬一次。|Every 3s throws 6 returning shuriken that cut once going out and once coming back.|3秒ごとに回旋手裏剣6枚、行きと帰りで1回ずつ斬る。|3초마다 회전 수리검 6개, 갈 때와 올 때 한 번씩 벱니다.|Каждые 3 с — 6 возвращающихся сюрикенов, режут туда и обратно.|Cada 3 s, 6 shuriken que regresan y cortan a la ida y a la vuelta.
冰蝕寒霜砲|Frostbite Cannon|氷蝕フロスト砲|빙식 서리포|Пушка ледяной эрозии|Cañón Escarcha Corrosiva
冰蝕層層疊加，凍結後碎裂。|Frostbite builds stack by stack, freezes, then shatters.|氷蝕が積み重なり、凍りつき、砕ける。|빙식이 겹겹이 쌓여 얼어붙고 부서집니다.|Обморожение копится, сковывает и раскалывается.|La escarcha se acumula, congela y luego se rompe.
冰蝕疊滿 5 層凍成冰塊，冰裂造成最大血量 12% 傷害並擴散。|At 5 frostbite stacks the enemy freezes, then shatters for 12% of its max HP and spreads the frost.|氷蝕5層で氷漬けにし、砕けて最大HPの12%ダメージ、さらに拡散。|빙식 5겹이면 얼어붙고, 깨지며 최대 HP 12% 피해를 주고 퍼집니다.|На 5 стаках враг замерзает и раскалывается на 12% макс. здоровья, распространяя лёд.|Con 5 acumulaciones se congela y se rompe con un 12% de su vida máxima, propagando el hielo.
本月已購買|Bought this month|今月は購入済み|이번 달 구매 완료|Уже куплено в этом месяце|Comprado este mes
處理中…|Processing…|処理中…|처리 중…|Обработка…|Procesando…
付款處理中，完成後會自動發放。|Payment pending — rewards arrive automatically once it completes.|決済処理中です。完了後に自動で付与されます。|결제 처리 중입니다. 완료되면 자동으로 지급됩니다.|Платёж обрабатывается — награды придут автоматически.|Pago pendiente: los premios llegarán automáticamente.
購買暫時無法完成，請稍後再試。|The purchase couldn't be completed. Please try again later.|購入を完了できませんでした。しばらくしてから再試行してください。|구매를 완료할 수 없습니다. 잠시 후 다시 시도하세요.|Не удалось завершить покупку. Повторите позже.|No se pudo completar la compra. Inténtalo más tarde.
購買完成|Purchase complete|購入完了|구매 완료|Покупка завершена|Compra completada
獎勵已發放|Rewards delivered|報酬を付与しました|보상이 지급되었습니다|Награды выданы|Premios entregados
禮包限定|Pack exclusive|パック限定|패키지 한정|Только в наборе|Exclusivo de pack
元氣啟程包|Spirit Starter Pack|元気スターターパック|원기 출발 팩|Набор «Старт духа»|Pack Inicio Espíritu
冰火雙砲包|Fire & Ice Pack|氷炎ダブルパック|얼음불 쌍포 팩|Набор «Огонь и лёд»|Pack Fuego y Hielo
傳說六砲包|Legendary Six Pack|伝説シックスパック|전설 6포 팩|Легендарный набор шести|Pack Legendario Seis
超值禮包|Value Packs|お得パック|특가 패키지|Выгодные наборы|Packs de valor
三大超值禮包|Three Value Packs|3大お得パック|3대 특가 패키지|Три выгодных набора|Tres packs de valor
US$1.99 起|From US$1.99|US$1.99から|US$1.99부터|От US$1.99|Desde US$1.99
US$1.99 起 · 9 座新砲台|From US$1.99 · 9 new turrets|US$1.99から・新砲台9種|US$1.99부터 · 신규 포탑 9종|От US$1.99 · 9 новых турелей|Desde US$1.99 · 9 torretas nuevas
限時 · 每月限購|Limited · Once per month|期間限定・毎月1回|기간 한정 · 월 1회|Ограничено · раз в месяц|Limitado · una vez al mes
每月重置|Resets monthly|毎月リセット|매월 초기화|Сброс каждый месяц|Se reinicia cada mes
每月限購一次|Once per month|毎月1回限定|매월 1회 한정|Раз в месяц|Una vez al mes
本月剩 {0} 天|{0} days left this month|今月残り{0}日|이번 달 {0}일 남음|Осталось дней: {0}|Quedan {0} días este mes
{0} 月 · 剩 {1} 天|Month {0} · {1} days left|{0}月・残り{1}日|{0}월 · {1}일 남음|Месяц {0} · осталось {1} дн.|Mes {0} · quedan {1} días
{0} 抽|{0} pulls|{0}連|{0}회 뽑기|{0} попыток|{0} tiradas
{0} 次/秒|{0}/s|{0}回/秒|{0}회/초|{0}/с|{0}/s
點我看特效與數值|Tap for effects & stats|タップでエフェクトと数値|탭해서 효과·수치 보기|Нажмите: эффекты и характеристики|Toca para ver efectos y datos
每座專屬晶核|Exclusive core per turret|各砲台専用コア|포탑별 전용 코어|Уникальное ядро для каждой турели|Núcleo exclusivo por torreta
星隕補給艙|Meteor Supply|星隕補給|유성 보급|Метеоритное снабжение|Suministro meteórico
皇極星庫|Imperial Vault|皇極星庫|황극 성고|Имперское хранилище|Bóveda imperial
本機預覽：付款與發獎尚未接上伺服器，點特典價位可模擬開通。|Local preview: payment and rewards are not yet connected to the server. Tap a tier price to simulate unlocking.|ローカルプレビュー：決済と報酬はまだサーバー未接続。特典価格をタップすると開通を試せます。|로컬 미리보기: 결제·보상이 아직 서버와 연결되지 않았습니다. 특전 가격을 탭하면 개통을 시뮬레이션합니다.|Локальный просмотр: оплата и награды ещё не подключены к серверу. Нажмите цену, чтобы симулировать.|Vista local: pagos y premios aún no conectados al servidor. Toca un precio para simular la activación.
無敵月卡|Invincible Pass|無敵マンスリーパス|무적 월간 패스|Непобедимый пропуск|Pase Invencible
每日登入 +60 · 一般模式每過 1 波 +1（每日最多 60）|Daily login +60 · +1 per wave cleared in Normal (max 60/day)|毎日ログイン+60・通常モード1ウェーブごと+1（1日最大60）|매일 접속 +60 · 일반 모드 웨이브당 +1 (하루 최대 60)|Вход +60 в день · +1 за волну в обычном режиме (до 60 в день)|Inicio diario +60 · +1 por oleada en Normal (máx. 60/día)
貴族特典|Noble Perks|貴族特典|귀족 특전|Привилегии знати|Ventajas nobles
貴族特典已啟用|Noble Perks active|貴族特典有効|귀족 특전 활성화|Привилегии знати активны|Ventajas nobles activas
右欄獎勵 ×{0}|Right-column rewards ×{0}|右列報酬×{0}|오른쪽 보상 ×{0}|Награды справа ×{0}|Premios de la derecha ×{0}
解鎖右欄 30 級獎勵，含星隕 10 抽、皇極 10 抽|Unlock the right-column 30-level rewards, incl. 10 Meteor and 10 Imperial pulls|右列30レベル報酬を解放、星隕10連・皇極10連入り|오른쪽 30레벨 보상 해제, 성운 10회·황극 10회 포함|Откройте 30 уровней наград справа, включая 10 попыток в каждом пуле|Desbloquea 30 niveles de premios a la derecha, incl. 10 tiradas meteóricas y 10 imperiales
解鎖特典|Unlock Perks|特典を解放|특전 해제|Открыть привилегии|Desbloquear ventajas
全部 ×2|All ×2|すべて×2|전체 ×2|Всё ×2|Todo ×2
全部 ×4|All ×4|すべて×4|전체 ×4|Всё ×4|Todo ×4
最划算|Best value|最もお得|최고 가성비|Выгоднее всего|Mejor valor
免費|Free|無料|무료|Бесплатно|Gratis
一鍵領取|Claim all|一括受取|모두 받기|Забрать всё|Reclamar todo
已滿級|Max level|最大レベル|최대 레벨|Макс. уровень|Nivel máximo
月卡每月重置等級與獎勵。|The pass resets its levels and rewards every month.|パスのレベルと報酬は毎月リセットされます。|월간 패스 레벨과 보상은 매월 초기화됩니다.|Уровни и награды пропуска сбрасываются каждый месяц.|El pase reinicia niveles y premios cada mes.
隨機砲台碎片|Random turret shards|ランダム砲台欠片|무작위 포탑 조각|Случайные осколки турели|Fragmentos de torreta aleatorios
復活券|Revive ticket|復活券|부활권|Билет воскрешения|Ticket de revivir
黑曜石雙倍券|Double Obsidian ticket|黒曜石2倍券|흑요석 2배권|Билет двойного обсидиана|Ticket de obsidiana doble
跳回合券|Wave skip ticket|ウェーブスキップ券|웨이브 건너뛰기권|Билет пропуска волны|Ticket de saltar oleada
Boss 封印券|Boss seal ticket|ボス封印券|보스 봉인권|Билет печати босса|Ticket de sello de jefe
金幣翻倍券|Double coin ticket|コイン2倍券|코인 2배권|Билет двойных монет|Ticket de monedas dobles
黑曜石骰子|Obsidian dice|黒曜石ダイス|흑요석 주사위|Обсидиановые кости|Dado de obsidiana
傷害倍率|Damage multiplier|ダメージ倍率|피해 배율|Множитель урона|Multiplicador de daño
射程|Range|射程|사거리|Дальность|Alcance
技能|Skill|スキル|스킬|Навык|Habilidad
上場位置|Slot|配置|배치 위치|Позиция|Posición
一般模式主砲 · 排位可出戰|Normal-mode main cannon · Ranked-ready|通常モード主砲・ランク出撃可|일반 모드 주포 · 랭크 출전 가능|Главная пушка обычного режима · доступна в рейтинге|Cañón principal (Normal) · válido en clasificatoria
一般模式副砲 · 排位可出戰|Normal-mode sub-cannon · Ranked-ready|通常モード副砲・ランク出撃可|일반 모드 보조포 · 랭크 출전 가능|Подпушка обычного режима · доступна в рейтинге|Subcañón (Normal) · válido en clasificatoria
取得方式|How to get|入手方法|획득 방법|Как получить|Cómo obtener
元氣啟程包 US$1.99|Spirit Starter Pack US$1.99|元気スターターパック US$1.99|원기 출발 팩 US$1.99|Набор «Старт духа» US$1.99|Pack Inicio Espíritu US$1.99
冰火雙砲包 US$2.99|Fire & Ice Pack US$2.99|氷炎ダブルパック US$2.99|얼음불 쌍포 팩 US$2.99|Набор «Огонь и лёд» US$2.99|Pack Fuego y Hielo US$2.99
傳說六砲包 US$4.99|Legendary Six Pack US$4.99|伝説シックスパック US$4.99|전설 6포 팩 US$4.99|Легендарный набор шести US$4.99|Pack Legendario Seis US$4.99
數值為草案，實戰版本上線前會依平衡再調整。|Stats are a draft and will be rebalanced before launch.|数値は暫定で、実装前にバランス調整されます。|수치는 초안이며 출시 전 밸런스 조정됩니다.|Значения предварительные и будут сбалансированы до релиза.|Los valores son provisionales y se ajustarán antes del lanzamiento.
查看元氣啟程包|View Spirit Starter Pack|元気スターターパックを見る|원기 출발 팩 보기|Открыть «Старт духа»|Ver Pack Inicio Espíritu
查看冰火雙砲包|View Fire & Ice Pack|氷炎ダブルパックを見る|얼음불 쌍포 팩 보기|Открыть «Огонь и лёд»|Ver Pack Fuego y Hielo
查看傳說六砲包|View Legendary Six Pack|伝説シックスパックを見る|전설 6포 팩 보기|Открыть легендарный набор|Ver Pack Legendario Seis
立即購買|Buy now|今すぐ購入|지금 구매|Купить|Comprar ya
新砲台|New turrets|新砲台|신규 포탑|Новые турели|Torretas nuevas
砲台實戰特效模擬|Turret effect simulation|砲台エフェクトシミュレーション|포탑 효과 시뮬레이션|Симуляция эффектов турели|Simulación de efectos
開場戰鬥|Opening battle|オープニングバトル|오프닝 전투|Вступительный бой|Batalla inicial
跳過 ›|Skip ›|スキップ ›|건너뛰기 ›|Пропустить ›|Saltar ›
守住核心，打得越遠越強。|Guard the core — the further you go, the stronger you get.|コアを守れ。進むほど強くなる。|코어를 지켜라. 멀리 갈수록 강해집니다.|Защищайте ядро — чем дальше, тем сильнее.|Defiende el núcleo: cuanto más avances, más fuerte serás.
親手開火|Open fire yourself|自ら撃て|직접 사격|Огонь своими руками|Dispara tú mismo
先強化，再點大傢伙發射轟炸！|Upgrade first, then tap the big one to call a strike!|まず強化、次に大物をタップして砲撃！|먼저 강화하고, 큰 놈을 탭해 포격!|Сначала усиление, потом жмите на здоровяка для удара!|¡Mejora primero y toca al grande para bombardear!
02 / 11 · 試用傳說砲台|02 / 11 · Legendary turret trial|02 / 11・伝説砲台お試し|02 / 11 · 전설 포탑 체험|02 / 11 · Пробная легендарная турель|02 / 11 · Prueba de torreta legendaria
試用中：千刃劍匣 · 傳說六砲包限定|Trial: Thousand-Blade Case · Legendary Six Pack exclusive|お試し中：千刃剣匣・伝説シックスパック限定|체험 중: 천인검갑 · 전설 6포 팩 한정|Пробная: Ларец тысячи клинков · только в легендарном наборе|Prueba: Cofre de Mil Hojas · exclusivo del Pack Legendario
核心 HP {0} / {1}|Core HP {0} / {1}|コアHP {0} / {1}|코어 HP {0} / {1}|Ядро HP {0} / {1}|Núcleo HP {0} / {1}
擊破 {0} / {1}|Kills {0} / {1}|撃破 {0} / {1}|격파 {0} / {1}|Сбито {0} / {1}|Derribos {0} / {1}
金幣 {0}|Coins {0}|コイン {0}|코인 {0}|Монеты {0}|Monedas {0}
強化：啟動千刃劍匣|Upgrade: activate Thousand-Blade Case|強化：千刃剣匣を起動|강화: 천인검갑 가동|Усиление: активировать Ларец клинков|Mejora: activar Cofre de Mil Hojas
{0} 金幣 · 點我|{0} coins · Tap|{0}コイン・タップ|{0} 코인 · 탭|{0} монет · жмите|{0} monedas · toca
擊破全部敵機後繼續|Destroy every enemy to continue|敵機を全滅させて続行|적을 모두 격파하면 계속|Уничтожьте всех врагов, чтобы продолжить|Destruye a todos para continuar
千刃劍匣 已啟動|Thousand-Blade Case online|千刃剣匣 起動|천인검갑 가동|Ларец клинков активен|Cofre de Mil Hojas activo
蓄力中…|Charging…|チャージ中…|충전 중…|Заряд…|Cargando…
三種戰場|Three battlefields|3つの戦場|세 가지 전장|Три поля боя|Tres campos de batalla
點選圖示，看看每種玩法。|Tap an icon to see each mode.|アイコンをタップして各モードを確認。|아이콘을 탭해 각 모드를 확인하세요.|Нажмите значок, чтобы узнать о режиме.|Toca un icono para ver cada modo.
一波波敵機湧來，強化、轟炸、超載，打得越遠越強。|Waves keep coming: upgrade, strike, overdrive — the further you go, the stronger you get.|押し寄せる敵機を強化・砲撃・オーバードライブで迎え撃て。進むほど強くなる。|몰려오는 적을 강화·포격·오버드라이브로 막아라. 멀리 갈수록 강해집니다.|Волна за волной: усиливайте, бомбите, форсируйте — чем дальше, тем сильнее.|Oleada tras oleada: mejora, bombardea, sobrecarga — cuanto más lejos, más fuerte.
黑曜石與砲台成長資源|Obsidian and turret growth resources|黒曜石と砲台育成素材|흑요석과 포탑 성장 자원|Обсидиан и ресурсы для турелей|Obsidiana y recursos de mejora
五砲配隊，即時對決|Five-turret lineup, live duels|5砲編成でリアルタイム対決|5포 편성 실시간 대결|Пять турелей, живые дуэли|Cinco torretas, duelos en vivo
召喚、融合砲台；擊破的敵機送給對手，存滿反擊一口氣反打。|Summon and merge turrets; kills are sent to your rival, and a full counter strikes back at once.|砲台を召喚・融合。撃破した敵機は相手へ、反撃が溜まれば一気に逆襲。|포탑을 소환·융합하고, 격파한 적은 상대에게. 반격이 차면 한 번에 반격!|Призывайте и сливайте турели; сбитые враги летят к сопернику, а полный контрудар бьёт разом.|Invoca y fusiona torretas; tus derribos van al rival y el contraataque lleno golpea de una vez.
杯數與結算獎勵|Cups and match rewards|カップと精算報酬|컵과 정산 보상|Кубки и награды за матч|Copas y premios de partida
每天 3 次，專打首領，衝上每週排行。|3 runs a day, bosses only — climb the weekly ranking.|1日3回、ボス専門で週間ランキングを目指せ。|하루 3회, 보스 전용 — 주간 랭킹에 도전.|3 попытки в день, только боссы — к вершине недели.|3 intentos al día, solo jefes: sube en la clasificación semanal.
週榜碎片與補給抽卡|Weekly shards and supply pulls|週間欠片と補給ガチャ|주간 조각과 보급 뽑기|Недельные осколки и попытки|Fragmentos semanales y tiradas
組好你的陣容|Build your lineup|編成を組もう|라인업을 짜라|Соберите отряд|Arma tu alineación
收集、組裝、裝備出戰。|Collect, assemble, deploy.|集めて、組んで、出撃。|모으고, 조립하고, 출전.|Собирайте, снаряжайте, в бой.|Reúne, equipa y despliega.
認識砲台與敵機|Know your turrets and enemies|砲台と敵機を知る|포탑과 적 알아보기|Изучите турели и врагов|Conoce torretas y enemigos
能力、血量、取得方式都在這。|Abilities, HP and how to get them — all here.|能力・HP・入手方法はここ。|능력, HP, 획득 방법이 모두 여기에.|Способности, здоровье и способы получения — здесь.|Habilidades, vida y cómo obtenerlas: todo aquí.
任務領補給|Missions for supplies|ミッションで補給|임무로 보급 받기|Задания за припасы|Misiones por suministros
完成目標，回來領獎。|Complete goals, come back to claim.|目標を達成して報酬を受け取ろう。|목표를 달성하고 보상을 받으세요.|Выполняйте цели и забирайте награды.|Cumple objetivos y vuelve a reclamar.
關鍵時刻放絕招|Ultimates for the key moment|ここぞで必殺技|결정적 순간에 필살기|Ульты в решающий момент|Definitivas en el momento clave
一招逆轉戰局。|One move turns the battle.|一撃で戦況を逆転。|한 방으로 전세 역전.|Один приём меняет ход боя.|Un movimiento cambia la batalla.
永久變強|Grow stronger for good|永久に強くなる|영구 강화|Сильнее навсегда|Más fuerte para siempre
黑曜石投入永久強化。|Spend obsidian on permanent upgrades.|黒曜石を永久強化に投資。|흑요석을 영구 강화에 투자.|Тратьте обсидиан на постоянные улучшения.|Invierte obsidiana en mejoras permanentes.
補給站|Supply station|補給ステーション|보급소|Станция снабжения|Estación de suministros
禮包、月卡、卡池都在這。|Packs, pass and pulls — all here.|パック・パス・ガチャはここ。|팩, 패스, 뽑기가 모두 여기에.|Наборы, пропуск и попытки — здесь.|Packs, pase y tiradas: todo aquí.
爬上排行|Climb the ranks|ランキングを駆け上がれ|랭킹을 올려라|Поднимайтесь в рейтинге|Escala la clasificación
突破波數，挑戰全球。|Push your wave record against the world.|ウェーブ記録で世界に挑め。|웨이브 기록으로 세계에 도전.|Бейте рекорд волн против всего мира.|Supera tu récord de oleadas contra el mundo.
排位對決|Ranked duel|ランク対決|랭크 대결|Рейтинговая дуэль|Duelo clasificatorio
集滿五砲出戰：擊破送給對手，存滿反擊反打！|Field five turrets: kills go to your rival, and a full counter hits back!|5砲揃えて出撃：撃破は相手へ、反撃満タンで逆襲！|5포로 출전: 격파는 상대에게, 반격이 차면 역습!|Пять турелей в бой: сбитые — сопернику, полный контрудар — в ответ!|Cinco torretas: tus derribos van al rival y el contraataque lleno responde.
09 / 11 · 補給站 {0} / 4|09 / 11 · Supply {0} / 4|09 / 11・補給 {0} / 4|09 / 11 · 보급 {0} / 4|09 / 11 · Снабжение {0} / 4|09 / 11 · Suministros {0} / 4
超值禮包與無敵月卡|Value Packs & Invincible Pass|お得パックと無敵パス|특가 패키지와 무적 패스|Выгодные наборы и пропуск|Packs de valor y Pase Invencible
三大超值禮包每月限購，共 9 座新砲台；無敵月卡登入、遊玩就升級，30 級獎勵逐級領取。|Three value packs, once a month, with 9 new turrets; the Invincible Pass levels up as you log in and play, with 30 levels of rewards.|3大お得パックは毎月1回、新砲台9種。無敵パスはログインとプレイでレベルアップ、30レベル分の報酬。|3대 특가 패키지는 월 1회, 신규 포탑 9종. 무적 패스는 접속·플레이로 레벨업, 30레벨 보상.|Три выгодных набора раз в месяц — 9 новых турелей; пропуск растёт за вход и игру, 30 уровней наград.|Tres packs al mes con 9 torretas nuevas; el pase sube al jugar e iniciar sesión, con 30 niveles de premios.
9 座|9|9種|9종|9|9
月卡|Pass|パス|패스|Пропуск|Pase
30 級獎勵|30 reward levels|30レベル報酬|30레벨 보상|30 уровней наград|30 niveles
入口|Where|入口|입구|Где|Acceso
首頁活動列|Home event bar|ホームのイベント欄|홈 이벤트 바|Панель событий|Barra de eventos
每次登入會先顯示活動，按 × 即可關閉；之後隨時從首頁活動列或商店打開。|Events show at each login — tap × to close; open them anytime from the home event bar or the store.|ログイン時にイベントを表示、×で閉じられます。ホームのイベント欄やショップからいつでも開けます。|접속 시 이벤트가 표시되며 ×로 닫을 수 있습니다. 홈 이벤트 바나 상점에서 언제든 열 수 있어요.|События показываются при входе — закройте ×; открыть можно с панели событий или из магазина.|Los eventos aparecen al entrar; ciérralos con × y ábrelos cuando quieras desde la barra de eventos o la tienda.
認識超值禮包與月卡|See the packs and pass|パックとパスを見る|패키지와 패스 보기|Наборы и пропуск|Ver packs y pase
反擊充能中|Counter charging|反撃チャージ中|반격 충전 중|Контрудар заряжается|Contraataque cargando
發動反擊，剩餘 {0} 發|Launch counter, {0} left|反撃発動、残り{0}発|반격 발동, {0}발 남음|Контрудар, осталось {0}|Contraataque, quedan {0}
反擊充能中，再擊破 {0} 隻|Counter charging, {0} more kills|反撃チャージ中、あと{0}体撃破|반격 충전 중, {0}기 더 격파|Контрудар заряжается: ещё {0}|Contraataque cargando: faltan {0}
逆轉加成|Comeback bonus|逆転ボーナス|역전 보너스|Бонус камбэка|Bonus de remontada
禮包限定砲台|Pack-exclusive turrets|パック限定砲台|패키지 한정 포탑|Турели из наборов|Torretas exclusivas de packs
9 座 · 點選看特效與數值|9 turrets · Tap for effects & stats|9種・タップでエフェクトと数値|9종 · 탭해서 효과·수치 보기|9 турелей · нажмите для эффектов|9 torretas · toca para ver efectos
可領 {0} 項|{0} to claim|受取可能 {0}件|받을 수 있는 보상 {0}개|Можно забрать: {0}|{0} por reclamar
一鍵領取 {0} 項|Claim all ({0})|一括受取（{0}件）|모두 받기 ({0})|Забрать всё ({0})|Reclamar todo ({0})
LV {0} / 30　·　可領 {1} 項|LV {0} / 30 · {1} to claim|LV {0} / 30・受取可能 {1}件|LV {0} / 30 · 받을 보상 {1}개|LV {0} / 30 · можно забрать: {1}|LV {0} / 30 · {1} por reclamar
限定|Exclusive|限定|한정|Эксклюзив|Exclusivo
本機預覽 · 不會付款|Local preview · no payment|ローカルプレビュー・支払いなし|로컬 미리보기 · 결제 없음|Локальный просмотр · без оплаты|Vista local · sin pago
關閉|Close|閉じる|닫기|Закрыть|Cerrar
關閉試煉|Close trial|試練を閉じる|시련 닫기|Закрыть испытание|Cerrar prueba
帳號操作|Account actions|アカウント操作|계정 관리|Действия с аккаунтом|Acciones de cuenta
本機模式|Local mode|ローカルモード|로컬 모드|Локальный режим|Modo local
切換|Switch|切替|전환|Сменить|Cambiar
玩家名稱|Player name|プレイヤー名|플레이어 이름|Имя игрока|Nombre del jugador
商店分類|Store categories|ショップカテゴリ|상점 분류|Разделы магазина|Categorías de la tienda
恢復購買|Restore purchases|購入を復元|구매 복원|Восстановить покупки|Restaurar compras
敵機|Enemy|敵機|적기|Враг|Enemigo
撞擊|Impact|衝突|충돌|Таран|Impacto
觀看廣告重新抽卡|Watch an ad to redraw|広告を見て引き直す|광고 보고 다시 뽑기|Реклама — новая попытка|Mira un anuncio para volver a tirar
本次獲得 {0} Space Coins|Earned {0} Space Coins this run|今回の獲得 {0} Space Coins|이번 획득 {0} Space Coins|Получено {0} Space Coins|Ganaste {0} Space Coins
觀看廣告獎勵加倍|Watch an ad to double rewards|広告を見て報酬2倍|광고 보고 보상 2배|Реклама — двойная награда|Mira un anuncio para duplicar
VIP 砲台|VIP turrets|VIP砲台|VIP 포탑|VIP-турели|Torretas VIP
`;
for(const line of rows.trim().split('\n')){const [source,...values]=line.split('|');SpaceTowerLocale.add(source,values);}
})();
