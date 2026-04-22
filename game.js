// ========================================
//  Mystery Merge Puzzle - メインロジック
// ========================================

// ========================================
// データ定義
// ========================================

// マージチェーン定義（10種類×最大15段階）
// 各チェーンは emoji と name の配列
const CHAINS = [
  // チェーン0：炎系
  { name: '炎',    stages: ['🔥','🕯️','🪔','🔆','☀️','🌟','✨','💫','🌠','🌌','⚡','🌋','☄️','🌞','🌈'] },
  // チェーン1：水系
  { name: '水',    stages: ['💧','🌊','🫧','🧊','❄️','🌨️','🌧️','⛈️','🌩️','🌀','🌫️','☁️','🌤️','🌥️','🌦️'] },
  // チェーン2：植物系
  { name: '植物',  stages: ['🌱','🌿','🍀','🌾','🌻','🌸','💐','🌺','🌹','🌷','🪷','🍄','🌲','🌳','🌴'] },
  // チェーン3：鉱石系
  { name: '鉱石',  stages: ['🪨','🔩','⚙️','🔧','🪛','🔨','⚒️','🛠️','⚔️','🗡️','🏹','🪃','🛡️','⚜️','👑'] },
  // チェーン4：食べ物系
  { name: '食物',  stages: ['🫐','🍇','🍓','🍒','🍑','🥭','🍍','🥝','🍋','🍊','🍎','🍏','🍐','🍈','🥑'] },
  // チェーン5：動物系
  { name: '動物',  stages: ['🐣','🐥','🐦','🦜','🦚','🦩','🦢','🕊️','🦅','🦁','🐯','🐻','🦊','🐺','🐉'] },
  // チェーン6：宝石系
  { name: '宝石',  stages: ['🪙','💰','💵','💴','💶','💷','💳','💎','🔮','🪄','🎩','🏺','🗝️','🔑','🪬'] },
  // チェーン7：星系
  { name: '星',    stages: ['⭐','🌟','💫','✨','🌠','🌌','🔭','🪐','🌙','🌛','🌜','🌝','🌕','🌑','☀️'] },
  // チェーン8：体力回復系（マージ可能・使用は2回タップ）
  { name: '体力',  stages: ['💊','🧪','🍵','🧃','🥤','💉','🩺','🏥','❤️‍🔥','💖','💗','💓','💞','💝','❤️'], special: 'energy',
    recovery: [1, 4, 8, 32, 100] },
  // チェーン9：魔法系
  { name: '魔法',  stages: ['🪄','🔮','🧿','📿','🪬','🧲','💡','🔦','🕯️','🪔','🔆','🌟','✨','💥','🌈'] },
  // チェーン10：第一章（チュートリアル・メインゲーム共通）
  { name: '第一章', stages: ['📝','🐱','📔','📒','📕','📗','📘','📙','📚','🗂️','🗃️','🏆'],
    stageImages: [
      'img/image_merge_icon1_01.png','img/image_merge_icon1_02.png',
      'img/image_merge_icon1_03.png','img/image_merge_icon1_04.png',
      'img/image_merge_icon1_05.png','img/image_merge_icon1_06.png',
      'img/image_merge_icon1_07.png','img/image_merge_icon1_08.png',
      'img/image_merge_icon1_09.png','img/image_merge_icon1_10.png',
      'img/image_merge_icon1_11.png','img/image_merge_icon1_12.png',
    ],
    stageNames: [
      'メモ帳','猫','猫のおもちゃ','足跡',
      'スニーカー','ダンボール','謎の石','カメラ',
      '証拠写真','破られた写真','相関図のボード','何かを示すボード',
    ]
  },
  // チェーン11：第二章（製造機アイテム）
  { name: '第二章',
    stages: ['🔧','⚙️','🪛','🔩','🛠️','⚒️','⚔️','🗡️','🏹','🪃','🛡️','⚜️','👑','🏆','✨'],
    stageImages: [
      'img/image_merge_icon2_01.png','img/image_merge_icon2_02.png',
      'img/image_merge_icon2_03.png','img/image_merge_icon2_04.png',
      'img/image_merge_icon2_05.png','img/image_merge_icon2_06.png',
      'img/image_merge_icon2_07.png','img/image_merge_icon2_08.png',
      'img/image_merge_icon2_09.png','img/image_merge_icon2_10.png',
      'img/image_merge_icon2_11.png','img/image_merge_icon2_12.png',
      'img/image_merge_icon2_13.png','img/image_merge_icon2_14.png',
      'img/image_merge_icon2_15.png',
    ],
    stageNames: [
      '鍵','鍵束','ICカード','ドアノブ','ドアチェーン',
      '監視カメラ','モニター','双眼鏡','スマートフォン','通知',
      '子供用リュック','スケッチブック','色鉛筆','マンション模型','設計図',
    ]
  },
];

// 出力上限（stage 5 まで、6以降は出力不可）
const MAX_OUTPUT_STAGE = 5;

// ジェネレーター解放チェーン（triggerChainId の Lv8 発見 → unlockChainId のジェネレーター解放）
const UNLOCK_CHAIN = [
  { triggerChainId: 0, unlockChainId: 1 }, // 炎 Lv8 → 水
  { triggerChainId: 1, unlockChainId: 2 }, // 水 Lv8 → 植物
  { triggerChainId: 2, unlockChainId: 3 }, // 植物 Lv8 → 鉱石
  { triggerChainId: 3, unlockChainId: 4 }, // 鉱石 Lv8 → 食物
  { triggerChainId: 4, unlockChainId: 5 }, // 食物 Lv8 → 動物
  { triggerChainId: 5, unlockChainId: 6 }, // 動物 Lv8 → 宝石
  { triggerChainId: 6, unlockChainId: 7 }, // 宝石 Lv8 → 星
  { triggerChainId: 7, unlockChainId: 9 }, // 星 Lv8 → 魔法
];

// ジェネレーター定義（10種類、最初は1種類のみ解放）
// chainId: どのチェーンからアイテムを出すか
const GENERATORS = [
  { id: 0, emoji: '🏭', name: 'ファクトリー', chainId: 10, unlocked: true  },
  { id: 1, emoji: '🌊', name: 'ウォーター',   chainId: 1, unlocked: false },
  { id: 2, emoji: '🌱', name: 'ガーデン',     chainId: 2, unlocked: false },
  { id: 3, emoji: '⛏️', name: 'マイン',       chainId: 3, unlocked: false },
  { id: 4, emoji: '🍎', name: 'ファーム',     chainId: 4, unlocked: false },
  { id: 5, emoji: '🐾', name: 'アニマル',     chainId: 5, unlocked: false },
  { id: 6, emoji: '💎', name: 'トレジャー',   chainId: 6, unlocked: false },
  { id: 7, emoji: '🔭', name: 'オブザーバ',   chainId: 7, unlocked: false },
  { id: 8, emoji: '❤️', name: 'ヒーラー',     chainId: 8, unlocked: false }, // 無効化
  { id: 9, emoji: '🧙', name: 'ウィザード',   chainId: 9, unlocked: false },
];

// パワーアップ段階ごとの設定
// powerLevel: 0=通常, 1〜4=パワーアップ
const POWER_CONFIG = [
  { startStage: 1, costMult: 1  },
  { startStage: 2, costMult: 2  },
  { startStage: 4, costMult: 4  },
  { startStage: 5, costMult: 8  },
  { startStage: 6, costMult: 16 }, // 6番目以降は出力不可なので実質使用不可
];

// ステージ別体力消耗（1始まり）
const ENERGY_COST = [1, 2, 4, 8, 16];

// Lucky!判定：ボタンLvごとの確率・倍率設定（確率は毎回10%〜40%でランダム）
const LUCKY_CONFIG = [
  { probMin: 0.10, probMax: 0.40, multMin: 2.0,  multMax: 2.0  }, // Lv1ボタン: ×2固定
  { probMin: 0.10, probMax: 0.40, multMin: 1.5,  multMax: 2.0  }, // Lv2ボタン: ×1.5〜2.0
  { probMin: 0.10, probMax: 0.40, multMin: 1.5,  multMax: 2.0  }, // Lv4ボタン: ×1.5〜2.0
  { probMin: 0.10, probMax: 0.40, multMin: 1.5,  multMax: 2.0  }, // Lv8ボタン: ×1.5〜2.0
  { probMin: 0.10, probMax: 0.40, multMin: 1.1,  multMax: 1.25 }, // Lv16ボタン: ×1.1〜1.25
];

// Power: Lv4/Lv8/Lv16ボタンから確率で高Lvアイテムを出力（確率は10%〜40%ランダム）
const GEN_POWER_BONUS = [
  null,            // powerLv 0 (Lv1ボタン): Powerなし
  null,            // powerLv 1 (Lv2ボタン): Powerなし
  { outStage: 16 },           // powerLv 2 (Lv4ボタン): Lv16出力
  { outStage: 16 },           // powerLv 3 (Lv8ボタン): Lv16出力
  { outStage: null },         // powerLv 4 (Lv16ボタン): 最大Lv出力
];

// しゃぼん玉を割るためのダイヤコスト（インデックス = マージアイテムLv）
const BUBBLE_DIAMOND_COST = [
  0, 0,  // Lv0,1 (未使用)
  2, 4, 6, 8, 16, 32, 64, 128,  // Lv2〜9
  160, 176, 192, 208, 224, 240, 256, 272, 288, 304, 320, // Lv10〜20
];

// コインアイテム定数
const COIN_MAX_LV   = 5;
const COIN_REWARD   = [0, 10, 20, 30, 40, 100]; // インデックス = coinLv
const COIN_EMOJI    = ['', '🪙', '🪙', '🪙', '🪙', '💰'];
const COIN_IMAGES   = [
  null,
  'img/image_merge_icon_coin01.png',
  'img/image_merge_icon_coin02.png',
  'img/image_merge_icon_coin03.png',
  'img/image_merge_icon_coin04.png',
  'img/image_merge_icon_coin04.png', // Lv5: Lv4画像 + 煙アニメーション
];
// しゃぼん玉がコインに変わるまでの時間（ミリ秒）
const BUBBLE_COIN_DELAY_MS = 40000;

// ========================================
// プレイヤーレベル設定
// ========================================
// 現在のレベルでストーリー1話を進めるのに必要なコイン
function getStoryCost(level) {
  if (level <= 11) return 2000;
  if (level <= 21) return 4000;
  if (level <= 31) return 8000;
  return 16000; // Lv32-41+
}
// 現在のレベルからレベルアップに必要な経験値（コイン換算）
function getLevelUpXP(level) {
  if (level <= 10) return 10000;
  if (level <= 20) return 20000;
  return 40000; // Lv21-40+
}

// ========================================
// ゲーム状態
// ========================================
const COLS = 7;
const ROWS = 9;
const TOTAL_CELLS = COLS * ROWS;

let state = {
  board: Array(TOTAL_CELLS).fill(null), // null or { chainId, stage }
  energy: 100,
  maxEnergy: 100,
  energyTimer: 0,
  coin: 0,
  diamond: 0,
  generators: [],
  requests: [],      // 最大5件 { chainId, stage, coin }
  chainFirstFillDone: {}, // チェーンごとの初回依頼完了フラグ { chainId: bool }
  chainInitialStages: {}, // チェーンごとの完了済み初期ステージ { chainId: Set<1|2|3> }
  recentlyCompletedStages: new Set(), // 直前の依頼完了で使ったステージ（次の補充で除外）
  permanentlyExcluded: new Set(),    // 二度と出さない依頼 "chainId-stage" 形式（Lv4-9完了済み）
  usedOnceCharIds: new Set(),        // 1回出現したら二度と出さないキャラID（ミユなど）
  selectedCell: null,
  playerLevel: 1,   // プレイヤーレベル
  playerXP: 0,      // 現レベル内の経験値（コイン換算）
  pendingUse: null,
  // 発見済みアイテム管理: discovered[chainId][stage] = true
  discovered: {},
  requestCompletedTotal: 0, // 累計依頼完了数（10回ごとに体力+25）
  shop: {
    lastFreeEnergy:    0, // 無料体力の最終取得時刻（ms）
    lastCoinEnergy:    0, // コイン購入の最終時刻
    lastDiamondEnergy: 0, // ダイヤ購入の最終時刻
  },
};

let catalogCurrentChain = 0;

// ========================================
// 初期化
// ========================================
function initGame() {
  // ボードをリセット
  state.board = Array(TOTAL_CELLS).fill(null);

  // ジェネレーター状態初期化
  state.generators = GENERATORS.map(g => ({
    ...g,
    powerLevel: 0,         // パワーアップ段階（現在値）
    maxPowerLevel: 0,      // 過去最高Lv（DOWNしても下がらない）
    everLeveledUp: false,  // 一度でもLvアップ（マージ or UP）した履歴
    downgraded: false,     // DOWNされた後まだ元のLvに戻っていない状態
    originalPowerLevel: 0, // DOWN前のLv（複数回DOWNしても元Lvまで追跡）
  }));

  // 解放済みジェネレーターをボードに配置
  state.generators.filter(g => g.unlocked).forEach(gen => {
    const emptyIdx = state.board.findIndex(c => c === null);
    if (emptyIdx !== -1) {
      state.board[emptyIdx] = { isGenerator: true, genId: gen.id };
    }
  });

  // 発見済みアイテム初期化
  state.discovered = {};
  CHAINS.forEach((_, i) => { state.discovered[i] = {}; });

  // 体力回復タイマー
  state.energyTimer = 30;

  // 累計依頼・ショップリセット
  state.requestCompletedTotal = 0;
  state.shop = { lastFreeEnergy: 0, lastCoinEnergy: 0, lastDiamondEnergy: 0 };
  state.chainInitialStages = {};
  state.recentlyCompletedStages = new Set();
  state.permanentlyExcluded = new Set();

  // リクエスト初期化
  state.requests = [];
  fillRequests();

  renderAll();
  startEnergyTimer();
}

// ========================================
// レンダリング
// ========================================
function renderAll() {
  renderBoard();
  renderGenerators();
  renderHeader();
  renderRequest();
}

// ドラッグ状態管理
let drag = {
  active: false,
  fromIdx: null,
  ghost: null,      // ドラッグ中の幽霊要素
  tapHandled: false, // endDragでタップ処理済みフラグ（click二重発火防止）
};

function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';

  // 同Lvペアの検出（chainId-stage の組み合わせで2個以上あるものをマーク）
  const pairSet = new Set();
  const countMap = {};
  state.board.forEach(item => {
    if (item && !item.isGenerator) {
      const key = `${item.chainId}-${item.stage}`;
      countMap[key] = (countMap[key] || 0) + 1;
      if (countMap[key] >= 2) pairSet.add(key);
    }
  });

  for (let i = 0; i < TOTAL_CELLS; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;

    const item = state.board[i];
    if (item) {
      cell.classList.add('has-item');

      if (item.isGenerator) {
        // ジェネレータータイル
        const gen = state.generators.find(g => g.id === item.genId);
        cell.classList.add('has-generator');
        cell.innerHTML = `
          <span class="item-emoji">${gen.emoji}</span>
          <span class="item-stage">Lv${gen.powerLevel + 1}</span>
        `;
        // マージ可能ハイライト（同種ジェネレーター）
        if (state.selectedCell !== null && state.selectedCell !== i) {
          const sel = state.board[state.selectedCell];
          if (sel && sel.isGenerator && sel.genId === item.genId) {
            cell.classList.add('merge-target');
          }
        }
        if (i === state.selectedCell) cell.classList.add('selected');
      } else {
        // 通常アイテム
        const chain = CHAINS[item.chainId];
        const emoji = chain.stages[item.stage - 1] || '❓';
        const imgSrc = chain.stageImages?.[item.stage - 1];
        cell.innerHTML = imgSrc
          ? `<img class="item-img item-img-lg" src="${imgSrc}" alt="${emoji}">`
          : `<span class="item-emoji">${emoji}</span>`;
        if (i === state.selectedCell) cell.classList.add('selected');
        // マージ可能ハイライト
        if (state.selectedCell !== null && state.selectedCell !== i) {
          const sel = state.board[state.selectedCell];
          if (sel && !sel.isGenerator && sel.chainId === item.chainId && sel.stage === item.stage) {
            cell.classList.add('merge-target');
          }
        }
        // 同Lvペアがあればシェイクヒント
        if (pairSet.has(`${item.chainId}-${item.stage}`)) {
          cell.classList.add('merge-hint');
        }
      }

      // ドラッグ開始（マウス）
      cell.addEventListener('mousedown', (e) => startDrag(e, i));
      // ドラッグ開始（タッチ）
      cell.addEventListener('touchstart', (e) => startDragTouch(e, i), { passive: false });
    }

    cell.addEventListener('click', () => onCellClick(i));
    board.appendChild(cell);
  }
}

// ========================================
// ドラッグ＆ドロップ
// ========================================
function startDrag(e, fromIdx) {
  if (!state.board[fromIdx]) return;
  e.preventDefault();
  drag.active = true;
  drag.fromIdx = fromIdx;
  drag.tapHandled = false;
  createGhost(e.clientX, e.clientY, fromIdx);

  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);
}

function startDragTouch(e, fromIdx) {
  if (!state.board[fromIdx]) return;
  e.preventDefault();
  drag.active = true;
  drag.fromIdx = fromIdx;
  drag.tapHandled = false;
  const t = e.touches[0];
  createGhost(t.clientX, t.clientY, fromIdx);

  document.addEventListener('touchmove', onDragMoveTouch, { passive: false });
  document.addEventListener('touchend', onDragEndTouch);
  document.addEventListener('touchcancel', onDragEndTouch);
}

function createGhost(x, y, fromIdx) {
  const item = state.board[fromIdx];
  const ghost = document.createElement('div');
  ghost.id = 'drag-ghost';
  ghost.style.cssText = `
    position:fixed; pointer-events:none; z-index:999;
    opacity:0.85;
    transform:translate(-50%,-50%);
    left:${x}px; top:${y}px;
  `;

  if (item.isGenerator) {
    const gen = state.generators.find(g => g.id === item.genId);
    ghost.textContent = gen.emoji;
    ghost.style.fontSize = '36px';
  } else {
    const chain = CHAINS[item.chainId];
    const imgSrc = chain.stageImages?.[item.stage - 1];
    if (imgSrc) {
      const img = document.createElement('img');
      img.src = imgSrc;
      img.style.cssText = 'width:52px;height:52px;object-fit:contain;display:block;';
      ghost.appendChild(img);
    } else {
      ghost.textContent = chain.stages[item.stage - 1] || '❓';
      ghost.style.fontSize = '36px';
    }
  }

  document.body.appendChild(ghost);
  drag.ghost = ghost;
}

function onDragMove(e) {
  if (!drag.ghost) return;
  drag.ghost.style.left = e.clientX + 'px';
  drag.ghost.style.top  = e.clientY + 'px';
  highlightDropTarget(e.clientX, e.clientY);
}

function onDragMoveTouch(e) {
  e.preventDefault();
  if (!drag.ghost) return;
  const t = e.touches[0];
  drag.ghost.style.left = t.clientX + 'px';
  drag.ghost.style.top  = t.clientY + 'px';
  highlightDropTarget(t.clientX, t.clientY);
}

function onDragEnd(e) {
  endDrag(e.clientX, e.clientY);
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragEnd);
}

function onDragEndTouch(e) {
  const t = e.changedTouches?.[0];
  if (t) endDrag(t.clientX, t.clientY);
  else { if (drag.ghost) { drag.ghost.remove(); drag.ghost = null; } drag.active = false; drag.fromIdx = null; }
  document.removeEventListener('touchmove', onDragMoveTouch);
  document.removeEventListener('touchend', onDragEndTouch);
  document.removeEventListener('touchcancel', onDragEndTouch);
}

function endDrag(x, y) {
  if (drag.ghost) { drag.ghost.remove(); drag.ghost = null; }
  if (!drag.active) return;

  const toIdx = getCellIndexAt(x, y);
  const fromIdx = drag.fromIdx;

  drag.active = false;
  drag.fromIdx = null;
  document.querySelectorAll('.cell').forEach(c => c.classList.remove('drop-over'));

  if (toIdx !== null && toIdx !== fromIdx) {
    // 別セルへのドロップ
    dropItem(fromIdx, toIdx);
  } else {
    // タップ（同一セル）→ ジェネレーターはここで直接処理
    // touchstartのpreventDefault後はclickイベントが発火しないため
    const item = state.board[fromIdx];
    if (item && item.isGenerator) {
      drag.tapHandled = true; // clickイベントでの二重処理を防ぐ
      onGeneratorClick(item.genId);
      return;
    }
    renderBoard();
  }
}

function highlightDropTarget(x, y) {
  document.querySelectorAll('.cell').forEach(c => c.classList.remove('drop-over'));
  const idx = getCellIndexAt(x, y);
  if (idx !== null && idx !== drag.fromIdx) {
    const cells = document.querySelectorAll('.cell');
    cells[idx]?.classList.add('drop-over');
  }
}

function getCellIndexAt(x, y) {
  const cells = document.querySelectorAll('.cell');
  for (const cell of cells) {
    const rect = cell.getBoundingClientRect();
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return parseInt(cell.dataset.index);
    }
  }
  return null;
}

function dropItem(fromIdx, toIdx) {
  const fromItem = state.board[fromIdx];
  const toItem   = state.board[toIdx];

  if (!fromItem) return;

  if (!toItem) {
    // 空きセルに移動
    state.board[toIdx]   = fromItem;
    state.board[fromIdx] = null;
  } else if (fromItem.isGenerator && toItem.isGenerator && fromItem.genId === toItem.genId) {
    // 同種ジェネレーター → マージでLvアップ
    mergeGenerators(fromIdx, toIdx);
    return;
  } else if (!fromItem.isGenerator && !toItem.isGenerator &&
             toItem.chainId === fromItem.chainId && toItem.stage === fromItem.stage) {
    // 同種・同段階アイテム → マージ
    state.selectedCell = fromIdx;
    mergeItems(fromIdx, toIdx);
    return;
  } else {
    // 異種 → 入れ替え
    state.board[toIdx]   = fromItem;
    state.board[fromIdx] = toItem;
  }

  state.selectedCell = null;
  renderAll();
}

// ========================================
// ジェネレーターマージ処理（Lvアップ）
// ========================================
function mergeGenerators(fromIdx, toIdx) {
  const item = state.board[fromIdx];
  const gen = state.generators.find(g => g.id === item.genId);
  if (!gen || gen.powerLevel >= 4) {
    showToast('最大レベルです');
    state.selectedCell = null;
    renderAll();
    return;
  }
  gen.powerLevel++;
  gen.maxPowerLevel = Math.max(gen.maxPowerLevel, gen.powerLevel);
  gen.everLeveledUp = true;
  gen.downgraded = false;
  state.board[fromIdx] = null;
  state.selectedCell = null;
  showToast(`${gen.emoji} ${gen.name} Lv${gen.powerLevel + 1} にパワーアップ！`);
  // 体力ボーナス
  if (gen.powerLevel === 4) addEnergy(100, '最大レベル達成ボーナス！');
  else addEnergy(25, 'Lvアップボーナス！');

  setTimeout(() => {
    const cells = document.querySelectorAll('.cell');
    cells[toIdx]?.classList.add('merge-pop');
    setTimeout(() => cells[toIdx]?.classList.remove('merge-pop'), 300);
  }, 10);

  renderAll();
}


function renderGenerators() {
  const container = document.getElementById('generators');
  container.innerHTML = '';

  state.generators.filter(g => g.unlocked && g.id !== 8).forEach(gen => {
    const canDown = gen.powerLevel > 0;
    // UPボタンはDOWNした後のみ表示（通常のLvアップはタイルマージのみ）
    const canUp = gen.downgraded && canGeneratorLevelUp(gen);

    if (!canDown && !canUp) return;

    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:3px;';

    // ジェネレーター名ラベル
    const label = document.createElement('div');
    label.style.cssText = 'font-size:9px;color:#aaa;text-align:center;white-space:nowrap;';
    label.textContent = `${gen.emoji} Lv${gen.powerLevel + 1}`;
    wrap.appendChild(label);

    // UPボタン（DOWN後のみ表示）
    if (canUp) {
      const upBtn = document.createElement('button');
      upBtn.textContent = '▲ UP';
      upBtn.style.cssText = `
        font-size:9px; padding:2px 6px; background:#2a3a6a; border:1px solid #f1c40f;
        border-radius:4px; color:#f1c40f; cursor:pointer; width:60px;
      `;
      upBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onGeneratorLevelUp(gen.id);
      });
      wrap.appendChild(upBtn);
    }

    // DOWNボタン
    if (canDown) {
      const downBtn = document.createElement('button');
      downBtn.textContent = '▼ DOWN';
      downBtn.style.cssText = `
        font-size:9px; padding:2px 6px; background:#333; border:1px solid #666;
        border-radius:4px; color:#aaa; cursor:pointer; width:60px;
      `;
      downBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onGeneratorLevelDown(gen.id);
      });
      wrap.appendChild(downBtn);
    }

    container.appendChild(wrap);
  });
}

function renderHeader() {
  document.getElementById('energy-text').textContent = `${Math.floor(state.energy)}`;
  document.getElementById('coin-display').textContent = `💰 ${state.coin}`;
  document.getElementById('diamond-display').textContent = `💎 ${state.diamond}`;
}

// ========================================
// セルクリック処理
// ========================================
function onCellClick(index) {
  const item = state.board[index];

  // 何もない場合
  if (!item) {
    state.selectedCell = null;
    renderBoard();
    return;
  }

  // ジェネレータータイル → タップでアイテム生成
  if (item.isGenerator) {
    // endDragで既に処理済みの場合はスキップ（デスクトップのclick二重発火防止）
    if (drag.tapHandled) {
      drag.tapHandled = false;
      return;
    }
    // 選択状態をリセットしてアイテム生成
    state.selectedCell = null;
    onGeneratorClick(item.genId);
    return;
  }

  const chain = CHAINS[item.chainId];

  // 選択中のセルがある場合
  if (state.selectedCell !== null && state.selectedCell !== index) {
    const selItem = state.board[state.selectedCell];
    if (selItem && selItem.chainId === item.chainId && selItem.stage === item.stage) {
      // マージ実行
      mergeItems(state.selectedCell, index);
      return;
    }
    // 別アイテムを選択
    state.selectedCell = index;
    renderBoard();
    return;
  }

  // 同じセルを2回タップ
  if (state.selectedCell === index) {
    // 体力回復アイテムは2回タップで使用確認
    if (chain.special === 'energy') {
      showUseModal(index);
      return;
    }
    // それ以外は選択解除
    state.selectedCell = null;
    renderBoard();
    return;
  }

  // 新規選択
  state.selectedCell = index;
  renderBoard();
}

// ========================================
// マージ処理
// ========================================
function mergeItems(fromIdx, toIdx) {
  const item = state.board[fromIdx];
  const nextStage = item.stage + 1;

  if (nextStage > 15) {
    // 最大段階
    state.selectedCell = null;
    renderBoard();
    return;
  }

  // マージ後のアイテムを配置
  state.board[toIdx] = { chainId: item.chainId, stage: nextStage };
  state.board[fromIdx] = null;
  state.selectedCell = null;
  discoverItem(item.chainId, nextStage);

  // マージ演出
  setTimeout(() => {
    const cells = document.querySelectorAll('.cell');
    cells[toIdx].classList.add('merge-pop');
    setTimeout(() => cells[toIdx].classList.remove('merge-pop'), 300);
  }, 10);

  // リクエスト完了チェック
  checkRequestComplete();

  renderAll();
}

// ========================================
// ジェネレーターレベルアップ条件チェック
// ========================================

// 各レベルに必要なマージアイテムのステージ（いずれかのチェーンで発見済みが条件）
const GEN_LEVELUP_STAGE = [4, 8, 12, 16]; // Lv1→2, Lv2→3, Lv3→4, Lv4→5

function canGeneratorLevelUp(gen) {
  if (gen.powerLevel >= 4) return false;

  // 自チェーンで該当ステージを発見済みであること
  const requiredStage = GEN_LEVELUP_STAGE[gen.powerLevel];
  const chainDisc = state.discovered[gen.chainId] || {};
  if (!chainDisc[requiredStage]) return false;

  return true;
}

// ========================================
// ジェネレーターレベルアップ・ダウン
// ========================================
function onGeneratorLevelUp(genId) {
  const gen = state.generators.find(g => g.id === genId);
  if (!gen) return;
  if (!canGeneratorLevelUp(gen)) {
    showToast('レベルアップ条件を満たしていません');
    return;
  }

  if (!gen.everLeveledUp) {
    // 未Lvアップ: マージ用タイルをもう1枚ボードに出現（自動出現の補完）
    const tilesOnBoard = state.board.filter(c => c?.isGenerator && c.genId === genId).length;
    if (tilesOnBoard < 2) {
      const emptyIdx = state.board.findIndex(c => c === null);
      if (emptyIdx === -1) {
        const genCellIdx = state.board.findIndex(c => c?.isGenerator && c.genId === genId);
        showCellToast('ボードが満杯です', genCellIdx, false);
        return;
      }
      state.board[emptyIdx] = { isGenerator: true, genId };
      showToast(`${gen.emoji} ${gen.name} がボードに出現！マージしてLvアップ！`);
      renderAll();
      return;
    }
  }
  // Lvアップ済み or 2枚あり: タイル出現なし、既存タイルを直接Lvアップ
  const giveBonus = !gen.downgraded;
  let kept = 0;
  for (let i = 0; i < state.board.length; i++) {
    if (state.board[i]?.isGenerator && state.board[i].genId === genId) {
      if (kept === 0) kept++;
      else state.board[i] = null;
    }
  }
  gen.powerLevel++;
  gen.maxPowerLevel = Math.max(gen.maxPowerLevel, gen.powerLevel);
  gen.everLeveledUp = true;
  // 元のLvまで戻ったら downgraded を解除
  if (gen.powerLevel >= gen.originalPowerLevel) {
    gen.downgraded = false;
    gen.originalPowerLevel = gen.powerLevel;
  }
  showToast(`${gen.emoji} ${gen.name} Lv${gen.powerLevel + 1} にレベルアップ！`);
  // 体力ボーナス（DOWNからの復帰は除外）
  if (giveBonus) {
    if (gen.powerLevel === 4) addEnergy(100, '最大レベル達成ボーナス！');
    else addEnergy(25, 'Lvアップボーナス！');
  }
  renderAll();
}

function onGeneratorLevelDown(genId) {
  const gen = state.generators.find(g => g.id === genId);
  if (!gen || gen.powerLevel <= 0) return;
  // 初回DOWNのとき元のLvを記録
  if (!gen.downgraded) gen.originalPowerLevel = gen.powerLevel;
  gen.powerLevel--;
  gen.downgraded = true;
  showToast(`${gen.name} Lv${gen.powerLevel + 1} にレベルダウン`);
  renderAll();
}

// ========================================
// ジェネレータークリック（アイテム生成）
// ========================================
function onGeneratorClick(genId) {
  const gen = state.generators.find(g => g.id === genId);
  if (!gen) return;

  const cfg = POWER_CONFIG[gen.powerLevel];
  const startStage = cfg.startStage;
  const cost = ENERGY_COST[gen.powerLevel]; // Lv1=1, Lv2=2, Lv3=4, Lv4=8, Lv5=16

  // 出力不可チェック（stage6以上）
  if (startStage > MAX_OUTPUT_STAGE) {
    showToast('出力できません（段階上限）');
    return;
  }

  // 体力チェック（テスト中は無限）
  // if (state.energy < cost) {
  //   showToast(`体力が足りません（必要: ${cost}）`);
  //   return;
  // }

  // 空きセルを探す
  const emptyIdx = state.board.findIndex(c => c === null);
  if (emptyIdx === -1) {
    const genCellIdx = state.board.findIndex(c => c?.isGenerator && c.genId === genId);
    showCellToast('ボードが満杯です', genCellIdx, false);
    return;
  }

  // Power → Lucky の順で判定（Power優先、どちらも発動しない場合は通常出力）
  const chainMaxStage = CHAINS[gen.chainId].stages.length;
  let outputStage = startStage;
  let isLucky = false, isPower = false;

  const powerStage = rollPower(gen.powerLevel, chainMaxStage);
  if (powerStage !== null) {
    outputStage = powerStage;
    isPower = true;
  } else {
    const luckyMult = rollLucky(gen.powerLevel);
    if (luckyMult !== null) {
      const ls = Math.min(Math.floor(startStage * luckyMult), chainMaxStage);
      if (ls > startStage) { outputStage = ls; isLucky = true; }
    }
  }

  // 体力消耗・アイテム配置
  state.energy -= cost;
  state.board[emptyIdx] = { chainId: gen.chainId, stage: outputStage };
  discoverItem(gen.chainId, outputStage);

  // ジェネレータータイルから対象セルへ飛び出す演出
  const genCellIdx = state.board.findIndex((c, i) => i !== emptyIdx && c?.isGenerator && c.genId === genId);
  const showCellId = genCellIdx !== -1 ? genCellIdx : emptyIdx;
  const emoji = CHAINS[gen.chainId].stages[outputStage - 1];
  flyItemAnimation(showCellId, emptyIdx, emoji);
  if (isPower) showPowerOnCell(showCellId, 'board');
  else if (isLucky) showLuckyOnCell(showCellId, 'board');

  renderAll();
}

// Lucky! テキストをアイテムセルの上にフェードアウト表示
// Lucky判定ヘルパー：倍率を返す（発動しない場合はnull）
function rollLucky(powerLv) {
  const cfg = LUCKY_CONFIG[powerLv] ?? LUCKY_CONFIG[0];
  const prob = cfg.probMin + Math.random() * (cfg.probMax - cfg.probMin);
  if (Math.random() < prob) {
    return cfg.multMin + Math.random() * (cfg.multMax - cfg.multMin);
  }
  return null;
}

// Power判定ヘルパー：出力ステージを返す（発動しない場合はnull）
function rollPower(powerLv, chainMaxStage) {
  const bonus = GEN_POWER_BONUS[powerLv];
  if (!bonus) return null;
  if (Math.random() < 0.05) {  // Power確率 5% 固定
    return bonus.outStage !== null ? Math.min(bonus.outStage, chainMaxStage) : chainMaxStage;
  }
  return null;
}

// ジェネレーターセル近くに特殊テキスト（Lucky!/Power!）を表示
function showSpecialOnCell(cellIdx, boardId, text, color) {
  setTimeout(() => {
    const cells = document.querySelectorAll(`#${boardId} .cell`);
    const cell = cells[cellIdx];
    if (!cell) return;
    const rect = cell.getBoundingClientRect();
    const el = document.createElement('div');
    el.textContent = text;
    el.style.cssText = `
      position: fixed;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top}px;
      transform: translate(-50%, -100%) scale(1.2);
      color: ${color};
      font-size: 13px;
      font-weight: bold;
      pointer-events: none;
      z-index: 200;
      text-shadow: 0 1px 4px #000;
      white-space: nowrap;
      animation: lucky-fade 1.4s ease-out forwards;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  }, 750);
}

function showLuckyOnCell(cellIdx, boardId = 'board') {
  showSpecialOnCell(cellIdx, boardId, '🍀 Lucky!', '#ffd700');
}

function showPowerOnCell(cellIdx, boardId = 'board') {
  showSpecialOnCell(cellIdx, boardId, '⚡ Power!', '#e74c3c');
}

// アイテムが fromIdx セルから toIdx セルへ湾曲しながら飛ぶアニメーション
function flyItemAnimation(fromIdx, toIdx, emoji) {
  const cells = document.querySelectorAll('.cell');
  const fromCell = cells[fromIdx];
  const toCell   = cells[toIdx];
  if (!fromCell || !toCell) return;

  const fromRect = fromCell.getBoundingClientRect();
  const toRect   = toCell.getBoundingClientRect();

  // 始点・終点の中心座標
  const startX = fromRect.left + fromRect.width  / 2;
  const startY = fromRect.top  + fromRect.height / 2;
  const endX   = toRect.left   + toRect.width    / 2;
  const endY   = toRect.top    + toRect.height   / 2;

  // ベジェ曲線の制御点：距離に比例して上方向にアーチを張る
  const dist      = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
  const arcHeight = Math.max(50, dist * 0.45);
  const cpX = (startX + endX) / 2;
  const cpY = (startY + endY) / 2 - arcHeight;

  const el = document.createElement('div');
  el.textContent = emoji;
  el.style.cssText = `
    position: fixed;
    left: 0; top: 0;
    font-size: 30px;
    line-height: 1;
    pointer-events: none;
    z-index: 100;
    opacity: 0;
    will-change: transform, opacity;
  `;
  document.body.appendChild(el);

  const DURATION = 750; // ms（ゆっくり）
  const startTime = performance.now();

  function animate(now) {
    const raw = Math.min((now - startTime) / DURATION, 1);

    // 二次ベジェ曲線で位置を計算
    const x = (1 - raw) * (1 - raw) * startX + 2 * (1 - raw) * raw * cpX + raw * raw * endX;
    const y = (1 - raw) * (1 - raw) * startY + 2 * (1 - raw) * raw * cpY + raw * raw * endY;

    // スケール：ふわっと膨らんで着地で縮む
    const scale = raw < 0.4
      ? 0.5 + raw * 2.5          // 0.5 → 1.5（膨らむ）
      : 1.5 - (raw - 0.4) * 1.2; // 1.5 → 0.9（縮む）

    // 不透明度：最初にふわっと現れ、終盤でフェードアウト
    const opacity = raw < 0.15
      ? raw / 0.15               // 0→1 フェードイン
      : raw > 0.75
        ? (1 - raw) / 0.25       // 1→0 フェードアウト
        : 1;

    el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`;
    el.style.opacity   = opacity;

    if (raw < 1) {
      requestAnimationFrame(animate);
    } else {
      el.remove();
    }
  }

  requestAnimationFrame(animate);
}

// ========================================
// リクエスト処理
// ========================================

// ジェネレーターの最大パワーレベルを取得（そのチェーンの中で最高）
function getMaxPowerLevel(chainId) {
  const gen = state.generators.find(g => g.chainId === chainId && g.unlocked);
  return gen ? gen.powerLevel : 0;
}

// パワーレベルに対応するステージ範囲
// Lv1(0): 1〜4, Lv2(1): 4〜8, Lv3(2): 8〜12, Lv4(3): 12〜16, Lv5(4): 16〜20
// 依頼人定義（画像対応）
const REQUESTERS = [
  // 第一章（id: 0-5）
  { id: 0, name: '依頼人①', img: 'img/image_merge_order_chara_00.png' },
  { id: 1, name: '依頼人②', img: 'img/image_merge_order_chara_01a.png' },
  { id: 2, name: '依頼人③', img: 'img/image_merge_order_chara_02.png' },
  { id: 3, name: '依頼人④', img: 'img/image_merge_order_chara_03.png' },
  { id: 4, name: '依頼人⑤', img: 'img/image_merge_order_chara_04.png' },
  { id: 5, name: '依頼人⑥', img: 'img/image_merge_order_chara_05.png' },
  // 第二章（id: 6-10）
  { id: 6,  name: 'ジン',   img: 'img/image_merge_order_chara_06.png' },
  { id: 7,  name: 'リナ',   img: 'img/image_merge_order_chara_07.png' },
  { id: 8,  name: 'ユウ',   img: 'img/image_merge_order_chara_08.png' },
  { id: 9,  name: 'ハルト', img: 'img/image_merge_order_chara_09.png' },
  { id: 10, name: 'タツオ', img: 'img/image_merge_order_chara_10.png' },
];

const STAGE_RANGE = [
  [1,  4 ],
  [4,  8 ],
  [8,  12],
  [12, 16],
  [16, 20],
];

// ジェネレーター最大Lvに応じた依頼ステージのティア設定
// permanentMax: このLv以下は完了後二度と出ない
// repeatMax:    このLv以下は繰り返し可（但し直後は出ない）
const STAGE_TIER_CONFIG = [
  { permanentMin: 4, permanentMax:  8, repeatMin:  9, repeatMax: 12 }, // Tier1: gen最大Lv1-2
  { permanentMin: 9, permanentMax: 13, repeatMin: 14, repeatMax: 17 }, // Tier2: gen最大Lv3
  { permanentMin:14, permanentMax: 17, repeatMin: 18, repeatMax: 20 }, // Tier3: gen最大Lv4-5
];

function getStageTierConfig(gen) {
  const m = gen.maxPowerLevel; // 0=Lv1, 1=Lv2, 2=Lv3, 3=Lv4, 4=Lv5
  if (m <= 1) return STAGE_TIER_CONFIG[0];
  if (m === 2) return STAGE_TIER_CONFIG[1];
  return STAGE_TIER_CONFIG[2];
}

// コイン報酬計算（ステージ範囲に応じて100〜20,000）、1の位は四捨五入
function calcCoinReward(stage) {
  const ratio = (stage - 1) / 19; // stage 1〜20 を 0〜1 に正規化
  const raw = 100 + (20000 - 100) * Math.pow(ratio, 1.5);
  return Math.round(raw / 10) * 10;
}

// ランダムに1つのアイテムを生成（チェーン・ステージ）
// アイテムを1つ生成。
// ・チェーンのイントロ（Lv1-3）が未完了なら Lv1-3 の未完了ステージを生成
// ・イントロ完了済みチェーンは Lv4+ を生成
// excludeStages: 生成を禁止するstageの集合（イントロのLv重複防止）
// lv4Only: true の場合 Lv4+ のみ生成（2個目アイテム用）
function generateOneItem(excludeStages, lv4Only = false) {
  const unlocked = state.generators.filter(g => g.unlocked && g.chainId !== 8);
  if (unlocked.length === 0) return null;

  // 依頼に絶対出さないアイテム（chain10のstage1とstage2）
  const BLOCKED_ITEMS = new Set(['10-1', '10-2']);

  for (let attempt = 0; attempt < 60; attempt++) {
    const gen = unlocked[Math.floor(Math.random() * unlocked.length)];
    const chainIntroSet  = state.chainInitialStages[gen.chainId] || new Set();
    const chainIntroDone = chainIntroSet.size >= 3;

    if (!chainIntroDone && !lv4Only) {
      // このチェーンのイントロ未完了 → Lv1-3 の未完了ステージをピック
      const candidates = [1, 2, 3].filter(
        s => !chainIntroSet.has(s) && !excludeStages.has(s)
      );
      if (candidates.length === 0) continue;
      const stage = candidates[Math.floor(Math.random() * candidates.length)];
      if (BLOCKED_ITEMS.has(`${gen.chainId}-${stage}`)) continue;
      return { chainId: gen.chainId, stage, isInitial: true };
    } else {
      // イントロ完了済み or 2個目 → ティア設定に基づくLv4+
      const tierCfg = getStageTierConfig(gen);
      const minS = tierCfg.permanentMin;
      const maxS = Math.min(tierCfg.repeatMax, CHAINS[gen.chainId].stages.length);
      if (minS >= maxS) continue; // チェーン長が足りなければスキップ
      const stage = Math.floor(Math.random() * (maxS - minS)) + minS;
      if (excludeStages.has(stage)) continue;
      if (state.permanentlyExcluded.has(`${gen.chainId}-${stage}`)) continue;
      if (BLOCKED_ITEMS.has(`${gen.chainId}-${stage}`)) continue;
      return { chainId: gen.chainId, stage, isInitial: false };
    }
  }
  return null;
}

// 依頼人1人分の依頼を生成
// イントロ依頼（Lv1-3）は1アイテム固定、Lv4+ はランダムに1〜2アイテム
function generateRequesterRequest(characterId, excludeStages) {
  const firstItem = generateOneItem(excludeStages);
  if (!firstItem) return null;
  const items = [{ chainId: firstItem.chainId, stage: firstItem.stage }];
  if (!firstItem.isInitial && Math.random() < 0.5) {
    const exclude2 = new Set([...excludeStages, firstItem.stage]);
    const second = generateOneItem(exclude2, true); // 2個目はLv4+のみ
    if (second) items.push({ chainId: second.chainId, stage: second.stage });
  }
  const coin = items.reduce((sum, item) => sum + calcCoinReward(item.stage), 0);
  return { characterId, items, coin };
}

// 依頼を補充
// ・いずれかのチェーンのイントロ（Lv1-3全完了）が済んでいれば最大5人、未済なら最大3人
// ・イントロ未完了チェーンのLv1-3は重複Lv禁止、Lv4+は重複チェックなし
// ・イントロ完了済みチェーンのLv1-3残存依頼は除去
function fillRequests() {
  const MIN_SLOTS = 3;
  // いずれか1チェーンでもイントロ完了 → Lv4+モード（最大5人）
  const anyIntroDone = Object.values(state.chainInitialStages).some(s => s && s.size >= 3);
  const maxSlots = anyIntroDone ? 5 : 3;

  // イントロ完了済みチェーンのLv1-3依頼を除去（古い依頼の掃除）
  state.requests = state.requests.filter(r =>
    r.items.every(it => {
      const introSet  = state.chainInitialStages[it.chainId] || new Set();
      return it.stage >= 4 || introSet.size < 3; // Lv4+ or そのチェーンがまだイントロ中
    })
  );

  // 補充ヘルパー（extraExclude: 追加で除外するステージ集合）
  function doFill(extraExclude) {
    const usedCharIds = new Set(state.requests.map(r => r.characterId));
    const usedStages = new Set([
      ...state.requests.flatMap(r => r.items.map(it => it.stage)),
      ...extraExclude,
    ]);
    const available = REQUESTERS.filter(r => !usedCharIds.has(r.id) && !state.usedOnceCharIds.has(r.id));
    let retry = 0;
    while (state.requests.length < maxSlots && available.length > 0 && retry < 50) {
      const ci = Math.floor(Math.random() * available.length);
      const character = available[ci];
      const req = generateRequesterRequest(character.id, usedStages);
      if (!req) { retry++; continue; }
      state.requests.push(req);
      req.items.forEach(it => usedStages.add(it.stage));
      available.splice(ci, 1);
      retry = 0;
    }
  }

  // まず「直前完了ステージ除外」付きで補充
  doFill(state.recentlyCompletedStages);

  // 最低3件に満たない場合、除外を緩めて再補充
  if (state.requests.length < MIN_SLOTS) {
    doFill(new Set());
  }

  // 補充完了後にリセット（次回以降は再び候補に戻す）
  state.recentlyCompletedStages = new Set();
}

// 依頼が達成可能か確認（同じアイテムが複数要求される場合も考慮）
function requestCompletable(req) {
  const boardCopy = state.board.map(x => x);
  for (const item of req.items) {
    const idx = boardCopy.findIndex(b => b && !b.isGenerator && b.chainId === item.chainId && b.stage === item.stage);
    if (idx === -1) return false;
    boardCopy[idx] = null;
  }
  return true;
}

function checkRequestComplete() {
  renderRequest();
}

// ========================================
// 依頼レンダリング
// ========================================
function renderRequest() {
  const panel = document.getElementById('request-panel');
  panel.innerHTML = '<div id="request-label">依頼</div>';

  state.requests.forEach((req, i) => {
    const character = REQUESTERS[req.characterId];
    const completable = requestCompletable(req);

    const itemsHtml = req.items.map(item => {
      const chain = CHAINS[item.chainId];
      const emoji = chain.stages[item.stage - 1] || '❓';
      const imgSrc = chain.stageImages?.[item.stage - 1];
      const icon = imgSrc
        ? `<img class="req-item-img" src="${imgSrc}" alt="${emoji}">`
        : emoji;
      return `<span class="req-item-badge">${icon}</span>`;
    }).join('');

    const charHtml = character?.img
      ? `<img class="req-char-img" src="${character.img}" alt="${character.name}">`
      : `<div class="req-char-figure">${character?.emoji || '👤'}</div>`;

    const div = document.createElement('div');
    div.className = 'request-slot' + (completable ? ' completable' : '');
    div.innerHTML = `
      <div class="req-char-wrap">
        ${charHtml}
      </div>
      <div class="req-slot-frame">
        <div class="req-items">${itemsHtml}</div>
        <div class="req-coin-row">
          <span class="req-coin">💰${req.coin.toLocaleString()}</span>
          ${completable ? `<button class="req-complete-btn">依頼済</button>` : ''}
        </div>
      </div>
    `;
    if (completable) {
      div.querySelector('.req-complete-btn').addEventListener('click', e => {
        e.stopPropagation();
        completeRequest(i);
      });
    }
    panel.appendChild(div);
  });
}

function completeRequest(index) {
  const req = state.requests[index];
  if (!req) return;

  if (!requestCompletable(req)) {
    showToast('該当アイテムがありません');
    return;
  }

  // ボードからアイテムを消費（重複対応）
  const boardCopy = [...state.board];
  for (const item of req.items) {
    const idx = boardCopy.findIndex(b => b && !b.isGenerator && b.chainId === item.chainId && b.stage === item.stage);
    if (idx !== -1) {
      state.board[idx] = null;
      boardCopy[idx] = null;
    }
  }

  state.coin += req.coin;
  state.requestCompletedTotal++;
  showToast(`依頼完了！ 💰+${req.coin.toLocaleString()}`);
  if (state.requestCompletedTotal % 10 === 0) {
    addEnergy(25, `依頼${state.requestCompletedTotal}回達成ボーナス！`);
  }

  // チェーンごとのイントロ完了ステージを記録
  req.items.forEach(item => {
    state.chainFirstFillDone[item.chainId] = true;
    if (item.stage >= 1 && item.stage <= 3) {
      if (!state.chainInitialStages[item.chainId]) state.chainInitialStages[item.chainId] = new Set();
      state.chainInitialStages[item.chainId].add(item.stage);
    }
    // 直前に完了したステージとして記録（次の補充で除外）
    state.recentlyCompletedStages.add(item.stage);
    // ティアのpermanent範囲なら完了後二度と出さない
    if (item.stage >= 4) {
      const gen = state.generators.find(g => g.chainId === item.chainId && g.unlocked);
      if (gen) {
        const tierCfg = getStageTierConfig(gen);
        if (item.stage >= tierCfg.permanentMin && item.stage <= tierCfg.permanentMax) {
          state.permanentlyExcluded.add(`${item.chainId}-${item.stage}`);
        }
      }
    }
  });

  // 1回限りキャラクター（ミユ id:1）は完了後に永続除外
  const ONCE_ONLY_CHAR_IDS = new Set([1]);
  if (ONCE_ONLY_CHAR_IDS.has(req.characterId)) {
    state.usedOnceCharIds.add(req.characterId);
  }

  state.requests.splice(index, 1);
  fillRequests();
  renderAll();
}

// ========================================
// 体力回復アイテム使用
// ========================================
function showUseModal(cellIndex) {
  const item = state.board[cellIndex];
  const chain = CHAINS[item.chainId];
  const recovery = chain.recovery[item.stage - 1];
  const emoji = chain.stages[item.stage - 1];

  state.pendingUse = { cellIndex };

  document.getElementById('use-item-icon').textContent = emoji;
  document.getElementById('use-item-name').textContent = `${chain.name} Lv${item.stage}`;
  document.getElementById('use-item-desc').textContent = `体力を ${recovery} 回復します`;
  document.getElementById('use-modal').classList.remove('hidden');
}

document.getElementById('use-btn').addEventListener('click', () => {
  if (!state.pendingUse) return;
  const { cellIndex } = state.pendingUse;
  const item = state.board[cellIndex];
  const chain = CHAINS[item.chainId];
  const recovery = chain.recovery[item.stage - 1];

  state.energy += recovery;
  state.board[cellIndex] = null;
  state.pendingUse = null;
  state.selectedCell = null;

  document.getElementById('use-modal').classList.add('hidden');
  showToast(`体力 +${recovery}！`);
  renderAll();
});

document.getElementById('cancel-btn').addEventListener('click', () => {
  state.pendingUse = null;
  state.selectedCell = null;
  document.getElementById('use-modal').classList.add('hidden');
  renderBoard();
});

// ========================================
// 体力回復タイマー
// ========================================
function startEnergyTimer() {
  setInterval(() => {
    if (state.energy < state.maxEnergy) {
      state.energyTimer--;
      if (state.energyTimer <= 0) {
        state.energy = Math.min(state.maxEnergy, state.energy + 1);
        state.energyTimer = 30;
        renderHeader();
      }
      document.getElementById('energy-timer').textContent = `${state.energyTimer}s`;
    } else {
      document.getElementById('energy-timer').textContent = 'MAX';
    }
  }, 1000);
}

// ========================================
// アイテム発見処理
// ========================================
function discoverItem(chainId, stage) {
  if (state.discovered[chainId][stage]) return; // 既発見
  state.discovered[chainId][stage] = true;
  state.diamond += 1;
  const chain = CHAINS[chainId];
  const emoji = chain.stages[stage - 1];
  showToast(`新発見！ ${emoji} ${chain.name} Lv${stage}  💎+1`);
  renderHeader();

  // Lv8発見で次のジェネレーターを解放（UNLOCK_CHAINに基づく）
  if (stage >= 8) {
    const unlock = UNLOCK_CHAIN.find(u => u.triggerChainId === chainId);
    if (unlock) {
      const nextGen = state.generators.find(g => g.chainId === unlock.unlockChainId);
      if (nextGen && !nextGen.unlocked) {
        nextGen.unlocked = true;
        // ボードにジェネレータータイルを配置
        const emptyIdx = state.board.findIndex(c => c === null);
        if (emptyIdx !== -1) {
          state.board[emptyIdx] = { isGenerator: true, genId: nextGen.id };
        }
        showToast(`${nextGen.emoji} ${nextGen.name}ジェネレーター解放！`);
        // 既存の依頼はそのまま、空きスロットだけ補充
        fillRequests();
      }
    }
  }

  // ジェネレーターLvアップ条件達成 → 対象ジェネレーターのタイルを自動出現
  state.generators.filter(g => g.unlocked && g.chainId === chainId).forEach(gen => {
    const reqStage = GEN_LEVELUP_STAGE[gen.powerLevel];
    if (stage === reqStage && canGeneratorLevelUp(gen)) {
      const tilesOnBoard = state.board.filter(c => c?.isGenerator && c.genId === gen.id).length;
      if (tilesOnBoard < 2) {
        const emptyIdx = state.board.findIndex(c => c === null);
        if (emptyIdx !== -1) {
          state.board[emptyIdx] = { isGenerator: true, genId: gen.id };
          showToast(`${gen.emoji} ${gen.name} がボードに出現！マージしてLvアップ！`);
        }
      }
    }
  });

  // UPボタン・依頼の更新
  renderGenerators();
  fillRequests();
}

// ========================================
// アイテムリスト 発見・解放システム
// ========================================

// 第一章マージアイテムを発見（初回のみ）
function discoverEventItem(stage) {
  if (eventState.discovered[stage]) return;
  eventState.discovered[stage] = true;
  updateCatalogBadge();
}

// 第二章マージアイテムを発見（初回のみ）
function discoverSeizoItem(stage) {
  if (eventState.seizoDiscovered[stage]) return;
  eventState.seizoDiscovered[stage] = true;
  checkSeizoGenLevelUp(stage);
  updateCatalogBadge();
}

// ジェネレーターのレベルを発見（初回のみ）
// genType: 'ch1' / 'ch2', level: 0始まり
function discoverGen(genType, level) {
  const key = `${genType}_${level}`;
  if (eventState.genDiscovered[key]) return;
  eventState.genDiscovered[key] = true;
  updateCatalogBadge();
}

// 未解放アイテムがあるか確認
function hasUnrevealedItems() {
  for (const s of Object.keys(eventState.discovered)) {
    if (eventState.discovered[s] && !eventState.revealed[s]) return true;
  }
  for (const s of Object.keys(eventState.seizoDiscovered)) {
    if (eventState.seizoDiscovered[s] && !eventState.seizoRevealed[s]) return true;
  }
  for (const k of Object.keys(eventState.genDiscovered)) {
    if (eventState.genDiscovered[k] && !eventState.genRevealed[k]) return true;
  }
  return false;
}

// カタログボタンのアテンション演出を更新
function updateCatalogBadge() {
  const active = hasUnrevealedItems();
  document.querySelectorAll('.catalog-access-btn').forEach(btn => {
    btn.classList.toggle('catalog-badge-active', active);
  });
}

// アイテムリスト内の「？」をタップして解放（💎+1）
// itemType: 'event' | 'seizo' | 'ch1gen' | 'ch2gen', id: stage or level（0始まり）
function revealCatalogItem(itemType, id) {
  if (itemType === 'event') {
    if (!eventState.discovered[id] || eventState.revealed[id]) return;
    eventState.revealed[id] = true;
  } else if (itemType === 'seizo') {
    if (!eventState.seizoDiscovered[id] || eventState.seizoRevealed[id]) return;
    eventState.seizoRevealed[id] = true;
  } else if (itemType === 'ch1gen') {
    const k = `ch1_${id}`;
    if (!eventState.genDiscovered[k] || eventState.genRevealed[k]) return;
    eventState.genRevealed[k] = true;
  } else if (itemType === 'ch2gen') {
    const k = `ch2_${id}`;
    if (!eventState.genDiscovered[k] || eventState.genRevealed[k]) return;
    eventState.genRevealed[k] = true;
  } else { return; }

  state.diamond += 1;
  showToast('💎+1 アイテムを解放しました！');
  renderHeader();
  renderEventHeader();
  updateCatalogBadge();
  renderCatalog();
}

// ========================================
// アイテムリスト レンダリング
// ========================================
function renderCatalog() {
  // タブ：第一章（EVENT_CHAIN）と第二章（CHAINS[11]）のみ
  const tabsEl = document.getElementById('catalog-gen-tabs');
  tabsEl.innerHTML = '';

  const evTab = document.createElement('div');
  evTab.className = 'catalog-tab' + (catalogCurrentChain === 'event' ? ' active' : '');
  evTab.textContent = EVENT_CHAIN.name;
  evTab.addEventListener('click', () => { catalogCurrentChain = 'event'; renderCatalog(); });
  tabsEl.appendChild(evTab);

  if (eventState.fireGenUnlocked) {
    const tab2 = document.createElement('div');
    tab2.className = 'catalog-tab' + (catalogCurrentChain === SEIZO_CHAIN_ID ? ' active' : '');
    tab2.textContent = CHAINS[SEIZO_CHAIN_ID].name;
    tab2.addEventListener('click', () => { catalogCurrentChain = SEIZO_CHAIN_ID; renderCatalog(); });
    tabsEl.appendChild(tab2);
  }

  const listEl = document.getElementById('catalog-list');
  listEl.innerHTML = '';

  // アイテムカード生成ヘルパー
  // state: 'locked' | 'pending' | 'revealed'
  function makeCard(imgSrc, emoji, lvLabel, name, state, onReveal) {
    const div = document.createElement('div');
    if (state === 'revealed') {
      div.className = 'catalog-item discovered';
      div.innerHTML = imgSrc
        ? `<img class="catalog-img" src="${imgSrc}" alt="${emoji}">`
        : `<span class="catalog-emoji">${emoji}</span>`;
      div.innerHTML += `<span class="catalog-stage">${lvLabel}</span>
                        <span class="catalog-name">${name}</span>`;
    } else if (state === 'pending') {
      div.className = 'catalog-item catalog-pending';
      div.innerHTML = `<button class="catalog-reveal-btn">？</button>
                       <span class="catalog-stage">${lvLabel}</span>
                       <span class="catalog-name">???</span>`;
      div.querySelector('.catalog-reveal-btn').addEventListener('click', onReveal);
    } else {
      // locked
      div.className = 'catalog-item undiscovered';
      div.innerHTML = `<span class="catalog-emoji catalog-locked-q">？</span>
                       <span class="catalog-stage">${lvLabel}</span>
                       <span class="catalog-name">???</span>`;
    }
    return div;
  }

  if (catalogCurrentChain === 'event') {
    // ── ジェネレーター（第一章）
    const genHeader = document.createElement('div');
    genHeader.className = 'catalog-section-header';
    genHeader.textContent = 'ジェネレーター';
    listEl.appendChild(genHeader);

    EVENT_GEN_IMAGES.forEach((imgSrc, idx) => {
      const key = `ch1_${idx}`;
      const disc = !!eventState.genDiscovered[key];
      const rev  = !!eventState.genRevealed[key];
      const lvLabel = `Lv${idx + 1}`;
      const name    = EVENT_GEN_NAMES[idx] ?? lvLabel;
      const itemState = rev ? 'revealed' : disc ? 'pending' : 'locked';
      const card = makeCard(imgSrc, '🗂️', lvLabel, name, itemState, () => revealCatalogItem('ch1gen', idx));
      listEl.appendChild(card);
    });

    // ── マージアイテム（第一章）
    const itemHeader = document.createElement('div');
    itemHeader.className = 'catalog-section-header';
    itemHeader.textContent = 'マージアイテム';
    listEl.appendChild(itemHeader);

    EVENT_CHAIN.stages.forEach((emoji, idx) => {
      const stage = idx + 1;
      const disc  = !!eventState.discovered[stage];
      const rev   = !!eventState.revealed[stage];
      const imgSrc   = EVENT_CHAIN.stageImages[idx];
      const stageName = EVENT_CHAIN.stageNames?.[idx] ?? `${EVENT_CHAIN.name} Lv${stage}`;
      const itemState = rev ? 'revealed' : disc ? 'pending' : 'locked';
      const card = makeCard(imgSrc, emoji, `Lv${stage}`, stageName, itemState, () => revealCatalogItem('event', stage));
      listEl.appendChild(card);
    });

  } else if (catalogCurrentChain === SEIZO_CHAIN_ID) {
    // ── ジェネレーター（第二章）
    const genHeader = document.createElement('div');
    genHeader.className = 'catalog-section-header';
    genHeader.textContent = 'ジェネレーター';
    listEl.appendChild(genHeader);

    SEIZO_GEN_IMAGES.forEach((imgSrc, idx) => {
      const key = `ch2_${idx}`;
      const disc = !!eventState.genDiscovered[key];
      const rev  = !!eventState.genRevealed[key];
      const lvLabel = `Lv${idx + 1}`;
      const name    = SEIZO_GEN_NAMES[idx] ?? lvLabel;
      const itemState = rev ? 'revealed' : disc ? 'pending' : 'locked';
      const card = makeCard(imgSrc, '⚙️', lvLabel, name, itemState, () => revealCatalogItem('ch2gen', idx));
      listEl.appendChild(card);
    });

    // ── マージアイテム（第二章）
    const itemHeader = document.createElement('div');
    itemHeader.className = 'catalog-section-header';
    itemHeader.textContent = 'マージアイテム';
    listEl.appendChild(itemHeader);

    const chain = CHAINS[SEIZO_CHAIN_ID];
    chain.stages.forEach((emoji, idx) => {
      const stage = idx + 1;
      const disc  = !!eventState.seizoDiscovered[stage];
      const rev   = !!eventState.seizoRevealed[stage];
      const imgSrc    = chain.stageImages?.[idx];
      const stageName = chain.stageNames?.[idx] ?? `${chain.name} Lv${stage}`;
      const itemState = rev ? 'revealed' : disc ? 'pending' : 'locked';
      const card = makeCard(imgSrc, emoji, `Lv${stage}`, stageName, itemState, () => revealCatalogItem('seizo', stage));
      listEl.appendChild(card);
    });
  }
}

// ========================================
// 体力加算ヘルパー
// ========================================
function addEnergy(amount, reason) {
  state.energy += amount;
  showToast(`⚡ +${amount} ${reason}`);
  renderHeader();
}

// 24時間残り時間を返す（null = 取得可能）
const SHOP_COOLDOWN = 24 * 60 * 60 * 1000;
function shopRemaining(lastTs) {
  const rem = SHOP_COOLDOWN - (Date.now() - lastTs);
  if (rem <= 0) return null;
  const h = Math.floor(rem / 3600000);
  const m = Math.floor((rem % 3600000) / 60000);
  return `${h}時間${m}分`;
}

// ========================================
// トースト通知
// ========================================
function showToast(msg) {
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `
    position: fixed; bottom: 14px; left: 50%; transform: translateX(-50%);
    background: rgba(0,0,0,0.82); color: #fff; padding: 6px 14px;
    border-radius: 16px; font-size: 12px; z-index: 500;
    pointer-events: none; max-width: 80vw; text-align: center;
    white-space: normal; word-break: break-all;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

// ジェネレータータイルの直上にトーストを表示（ボード満杯などの通知用）
// パネル要素のすぐ下にトーストを表示（依頼完了など）
function showToastNearPanel(msg, panelEl) {
  if (!panelEl) { showToast(msg); return; }
  const rect = panelEl.getBoundingClientRect();
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `
    position:fixed;
    left:${rect.left + rect.width / 2}px;
    top:${rect.bottom + 8}px;
    transform:translate(-50%, 0);
    background:rgba(10,30,70,0.92);
    color:#fff;
    padding:6px 18px;
    border-radius:20px;
    font-size:14px;
    font-weight:bold;
    pointer-events:none;
    z-index:9999;
    white-space:nowrap;
    animation:toast-pop 2s ease-out forwards;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2100);
}

// ナビパネルの直上（盤面下部）にトーストを表示（ジェネレーターLvアップ体力ボーナスなど）
function showAboveNaviToast(msg) {
  const panel = document.getElementById('navi-hint-panel');
  let topY;
  if (panel && !panel.classList.contains('hidden')) {
    const rect = panel.getBoundingClientRect();
    topY = rect.top - 8;
  } else {
    const board = document.getElementById('event-board-wrap');
    const rect = board?.getBoundingClientRect();
    topY = rect ? rect.bottom - 40 : window.innerHeight - 80;
  }
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `
    position:fixed; left:50%; top:${topY}px;
    transform:translate(-50%, -100%);
    background:rgba(0,0,0,0.82); color:#fff; padding:6px 14px;
    border-radius:16px; font-size:12px; z-index:500;
    pointer-events:none; max-width:80vw; text-align:center;
    white-space:normal; word-break:break-all;
    animation:toast-pop 0.25s ease-out;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

// 依頼人パネルの中央にトーストを表示（依頼完了メッセージ）
function showRewardInPanel(msg, panelEl) {
  if (!panelEl) { showToast(msg); return; }
  const rect = panelEl.getBoundingClientRect();
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `
    position:fixed;
    left:${rect.left + rect.width / 2}px;
    top:${rect.top + rect.height / 2}px;
    transform:translate(-50%, -50%);
    background:rgba(10,30,70,0.92); color:#fff; padding:8px 18px;
    border-radius:20px; font-size:14px; font-weight:bold;
    pointer-events:none; z-index:9999; white-space:nowrap;
    animation:toast-pop 2s ease-out forwards;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2100);
}

function showCellToast(msg, cellIdx, isEventBoard) {
  const boardId = isEventBoard ? 'event-board' : 'board';
  const cells = document.querySelectorAll(`#${boardId} .cell`);
  const cell = (cellIdx !== null && cellIdx >= 0) ? cells[cellIdx] : null;
  if (!cell) { showToast(msg); return; }
  const rect = cell.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = Math.max(rect.top - 8, 10);
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.cssText = `
    position: fixed; left: ${x}px; top: ${y}px;
    transform: translate(-50%, -100%);
    background: rgba(0,0,0,0.82); color: #fff; padding: 6px 14px;
    border-radius: 16px; font-size: 12px; z-index: 500;
    pointer-events: none; max-width: 80vw; text-align: center;
    white-space: normal; word-break: break-all;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}

// ========================================
// 登場人物データ
// ========================================
const CHARACTERS = [
  { img: 'img/image_merge_order_chara_00.png',  name: 'ヤス',     age: '29歳', desc: '探偵事務所の助手' },
  { img: 'img/image_merge_order_chara_01a.png', name: 'ミユ',     age: '9歳',  desc: '猫を探している女の子' },
  { img: 'img/image_merge_order_chara_02.png',  name: 'ナナコ',   age: '28歳', desc: 'ケンイチの妻' },
  { img: 'img/image_merge_order_chara_03.png',  name: 'ケンイチ', age: '34歳', desc: 'ナナコの夫' },
  { img: 'img/image_merge_order_chara_04.png',  name: 'ミサキ',   age: '27歳', desc: '会社員' },
  { img: 'img/image_merge_order_chara_05.png',  name: 'シンジ',   age: '27歳', desc: '配達員' },
  { img: 'img/image_merge_order_chara_06.png',  name: 'ジン',     age: '39歳', desc: '不動産管理会社勤務' },
  { img: 'img/image_merge_order_chara_07.png',  name: 'リナ',     age: '37歳', desc: 'シングルマザー' },
  { img: 'img/image_merge_order_chara_08.png',  name: 'ユウ',     age: '10歳', desc: 'リナの子供' },
  { img: 'img/image_merge_order_chara_09.png',  name: 'ハルト',   age: '20歳', desc: '大学生' },
  { img: 'img/image_merge_order_chara_10.png',  name: 'タツオ',   age: '44歳', desc: '警備員' },
];

function renderCharacters() {
  const list = document.getElementById('characters-list');
  list.innerHTML = '';
  const ch2Unlocked = !!eventState.fireGenUnlocked;
  CHARACTERS.forEach((c, idx) => {
    // 第二章キャラクター（idx 6〜）は製造機解放後のみ表示
    if (idx >= 6 && !ch2Unlocked) return;
    // 第一章・第二章ラベルを挿入
    if (idx === 1) {
      const label = document.createElement('div');
      label.className = 'character-chapter-label';
      label.textContent = '第一章';
      list.appendChild(label);
    } else if (idx === 6) {
      const label = document.createElement('div');
      label.className = 'character-chapter-label';
      label.textContent = '第二章';
      list.appendChild(label);
    }
    const card = document.createElement('div');
    card.className = 'character-card';
    card.innerHTML = `
      <img class="character-img" src="${c.img}" alt="${c.name}">
      <div class="character-info">
        <div class="character-name">${c.name}</div>
        <div class="character-age">${c.age}</div>
        <div class="character-desc">${c.desc}</div>
      </div>
    `;
    list.appendChild(card);
  });
}

document.getElementById('characters-close').addEventListener('click', () => {
  document.getElementById('characters-screen').classList.add('hidden');
});

// ========================================
// 設定ページ
// ========================================
document.getElementById('settings-btn').addEventListener('click', () => {
  hideNaviHint();
  document.getElementById('settings-screen').classList.remove('hidden');
});

document.getElementById('ev-settings-btn').addEventListener('click', () => {
  hideNaviHint();
  document.getElementById('settings-screen').classList.remove('hidden');
});

// ========================================
// デバッグモード
// ========================================
const debugState = {
  infiniteEnergy:  false,
  infiniteCoin:    false,
  infiniteDiamond: false,
};

document.getElementById('debug-btn').addEventListener('click', () => {
  document.getElementById('debug-screen').classList.remove('hidden');
});
document.getElementById('debug-close').addEventListener('click', () => {
  document.getElementById('debug-screen').classList.add('hidden');
});

document.getElementById('debug-infinite-energy').addEventListener('change', function() {
  debugState.infiniteEnergy = this.checked;
  if (this.checked) { state.energy = 99999; state.maxEnergy = 99999; renderEventHeader(); }
});
document.getElementById('debug-infinite-coin').addEventListener('change', function() {
  debugState.infiniteCoin = this.checked;
  if (this.checked) { state.coin = 9999999; renderEventHeader(); }
});
document.getElementById('debug-infinite-diamond').addEventListener('change', function() {
  debugState.infiniteDiamond = this.checked;
  if (this.checked) { state.diamond = 9999999; renderEventHeader(); }
});

document.getElementById('debug-gen-lv-up').addEventListener('click', () => {
  // パワーレベルをLv1→Lv2→Lv4→Lv8→Lv16→Lv1とループ
  const genTile = eventState.board.find(c => c && c.isEventGen && !c.isFireGen);
  if (!genTile) { showToast('第一章ジェネレーターがありません'); return; }
  const next = (eventState.genPowerLevel + 1) % POWER_COSTS.length;
  eventState.genPowerLevel = next;
  const cost = POWER_COSTS[next];
  showToast(`出力Lv → ${cost}⚡`);
  renderEventBoard();
  renderEventHeader();
});

document.getElementById('debug-firegen-lv-up').addEventListener('click', () => {
  if (!eventState.fireGenUnlocked) { showToast('第二章ジェネレーターはまだ解放されていません'); return; }
  // 最初の製造機タイルをループLvアップ
  const fireTile = eventState.board.find(c => c && c.isFireGen);
  if (!fireTile) { showToast('第二章ジェネレータータイルがありません'); return; }
  const maxLv = SEIZO_GEN_IMAGES.length - 1;
  fireTile.seizoLevel = ((fireTile.seizoLevel ?? 0) + 1) % (maxLv + 1);
  eventState.seizoGenLevel  = fireTile.seizoLevel;
  eventState.firePowerLevel = getFireGenMaxAvailablePowerLv(fireTile.seizoLevel);
  showToast(`第二章ジェネレーター Lv${fireTile.seizoLevel + 1} に！`);
  renderEventBoard();
});

document.getElementById('debug-spawn-coin5').addEventListener('click', () => {
  const emptyIdx = eventState.board.findIndex(c => c === null);
  if (emptyIdx === -1) { showToast('ボードが満杯です'); return; }
  eventState.board[emptyIdx] = { isCoin: true, coinLv: COIN_MAX_LV };
  renderEventBoard();
  showToast(`💰 Lv5コインを出しました`);
});

// ========================================
// アドベンチャーシーン
// ========================================
const ADV_SCENES = {
  // デバッグ確認用テストシーン
  test: {
    title:         'アドベンチャーシーンテスト',
    leftImg:       'img/image_merge_order_chara_00.png',
    rightImg:      'img/image_merge_order_chara_01a.png',
    rightEntrance: 'slide',  // 右からスライドイン
    autoClose:     false,
    script: [
      { speaker: 'ヤス', text: 'ヤスです',             side: 'left'  },
      { speaker: 'ミユ', text: '猫を探しています',       side: 'right' },
      { speaker: 'ヤス', text: 'わかりました！探します', side: 'left'  },
    ],
  },
  // チュートリアル#2の直後に挿入されるシーン
  scene01: {
    title:         '',
    leftImg:       'img/image_merge_order_chara_00.png',
    rightImg:      'img/image_merge_order_chara_01a.png',
    leftEntrance:  'slide',  // ヤスは左からスライドイン
    flipLeft:      true,     // ヤスは左右反転で表示
    rightEntrance: 'none',   // ミユは最初非表示・セリフ時にスライドイン
    autoClose:     false,
    script: [
      { speaker: 'ヤス', text: 'ご依頼内容をお聞かせください。',                          side: 'left'                               },
      { speaker: 'ミユ', text: '猫が居なくなっちゃったの・・・。\n探してもらえますか？',   side: 'right', showRight: true, slideRight: true },
      { speaker: 'ヤス', text: 'それは、困りましたね。\n早速、探しましょう。',              side: 'left'                               },
      { speaker: 'ミユ', text: 'ありがとうございます！',                                   side: 'right'                              },
    ],
  },
  // 第一章スライド01（2,000コインで解放）
  scene02: {
    title:         '',
    leftImg:       'img/image_merge_order_chara_00.png',
    rightImg:      'img/image_merge_order_chara_01a.png',
    bg:            'img/image_merge_bg_light.png',
    rightEntrance: 'slide',   // ミユが右からスライドイン
    leftEntrance:  'none',    // ヤスは後から登場
    autoClose:     false,
    script: [
      // ─── フェーズ1: 依頼事務所 ───
      // [0] ミユ（右スライドイン後）が話す
      { speaker: 'ミユ', text: 'すみません…！ミケがいなくなっちゃって…！', side: 'right' },
      // [1] ミユ暗転 + ヤス（左右反転）が左からスライドイン
      { speaker: 'ヤス', text: 'なるほど...最後に見かけたのは、どちらですか？', side: 'left',
        showLeft: true, slideLeft: true, flipLeft: true },
      // [2] ヤス暗転 ミユ明転
      { speaker: 'ミユ', text: 'こっちです！', side: 'right' },
      // [3] 両キャラ消去 → 背景チェンジ（自動進行）
      { hideAll: true, changeBg: 'img/image_merge_bg_road_light.png',
        autoAdvance: true },
      // ─── フェーズ2: 道路 ───
      // [4] ミユが右からスライドイン（再登場）
      { speaker: 'ミユ', text: 'この道です…さっきまでいたのに…', side: 'right',
        showRight: true, slideRight: true },
      // [5] ミユ暗転 + ヤス（左右反転）が左からスライドイン
      { speaker: 'ヤス', text: '急に居なくなったのですか？', side: 'left',
        showLeft: true, slideLeft: true, flipLeft: true },
      // [6] ヤス暗転 ミユ明転
      { speaker: 'ミユ', text: 'はい...', side: 'right' },
      // [7] ミユ暗転 ヤス明転
      { speaker: 'ヤス', text: 'わかりました...すぐに探しましょう！', side: 'left' },
    ],
  },
};

let advMsgIdx       = 0;
let advCurrentScene = null;
let advCallback     = null;
let advTextPending  = false;

function openAdventureScene(sceneId, callback = null) {
  const scene = ADV_SCENES[sceneId];
  if (!scene) return;
  advCurrentScene = scene;
  advCallback     = callback;
  advMsgIdx       = 0;
  advTextPending  = false;

  const screen = document.getElementById('adventure-screen');
  screen.classList.remove('hidden', 'adv-fade-out');

  // タイトルバー
  const titleBar = document.getElementById('adv-title-bar');
  if (titleBar) {
    titleBar.textContent   = scene.title;
    titleBar.style.display = scene.title ? '' : 'none';
  }

  // キャラ画像セット
  document.querySelector('#adv-chara-left img').src  = scene.leftImg;
  document.querySelector('#adv-chara-right img').src = scene.rightImg;

  const charaLeft  = document.getElementById('adv-chara-left');
  const charaRight = document.getElementById('adv-chara-right');

  // 状態リセット（インラインスタイルも含めてクリア）
  charaLeft.classList.remove('adv-char-shown', 'adv-chara-dim', 'adv-slide-ready', 'adv-slide-active');
  charaRight.classList.remove('adv-char-shown', 'adv-chara-dim', 'adv-slide-ready', 'adv-slide-active');
  charaLeft.style.cssText  = '';
  charaRight.style.cssText = '';
  // 反転フラグリセット
  charaLeft.querySelector('img').classList.remove('adv-img-flip');
  charaRight.querySelector('img').classList.remove('adv-img-flip');

  // 背景設定（scene.bg が指定されている場合は上書き、未指定は CSS デフォルト）
  const bgEl = document.getElementById('adv-bg');
  if (bgEl) {
    bgEl.style.transition = '';
    bgEl.style.opacity    = '1';
    bgEl.style.background = scene.bg ? `url('${scene.bg}') center / cover no-repeat` : '';
  }

  // スライドイン共通ヘルパー（インラインスタイル不使用・CSSクラスのみ）
  function _slideIn(el, onComplete) {
    el.classList.add('adv-slide-ready');   // 初期位置へ（opacity:0, off-screen）
    void el.offsetHeight;                  // リフロー強制
    el.classList.add('adv-slide-active');  // ターゲット位置へ（transition 発動）
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.classList.remove('adv-slide-ready', 'adv-slide-active');
      el.classList.add('adv-char-shown');  // opacity:1 を確保してから slide クラスを外す
      onComplete();
    };
    el.addEventListener('transitionend', finish, { once: true });
    setTimeout(finish, 700);
  }

  // メッセージ開始を一度だけ呼ぶためのフラグ
  let _msgStarted = false;
  function _startMessages() {
    if (_msgStarted) return;
    _msgStarted = true;
    advTextPending = false;
    showAdvMessage(0);
  }

  // 右キャラ: entrance に応じた処理
  if (scene.rightEntrance === 'slide') {
    advTextPending = true;
    _slideIn(charaRight, () => {
      const cur = advCurrentScene?.script[advMsgIdx];
      if (cur) charaRight.classList.toggle('adv-chara-dim', cur.side !== 'right');
      // leftEntrance が 'none' なら右スライド完了後にメッセージ開始
      if (scene.leftEntrance === 'none') _startMessages();
    });
  } else if (scene.rightEntrance === 'fade') {
    void charaRight.offsetHeight;
    charaRight.classList.add('adv-char-shown');
  }
  // 'none': 非表示のまま（showRight/slideRight で後から登場）

  // 左キャラ: entrance に応じた処理
  if (scene.leftEntrance === 'slide') {
    advTextPending = true;
    if (scene.flipLeft) charaLeft.querySelector('img').classList.add('adv-img-flip');
    _slideIn(charaLeft, () => {
      _startMessages();
    });
  } else if (scene.leftEntrance === 'none') {
    // 非表示のまま。メッセージ開始は右キャラのスライド完了後に委譲
    // rightEntrance が 'slide' でない場合は即開始
    if (scene.rightEntrance !== 'slide') _startMessages();
  } else {
    // default/fade: 即表示
    void charaLeft.offsetHeight;
    charaLeft.classList.add('adv-char-shown');
    _startMessages();
  }
}

function showAdvMessage(idx) {
  const scene  = advCurrentScene;
  const msg    = scene.script[idx];
  const isLast = idx >= scene.script.length - 1;

  const charaLeft  = document.getElementById('adv-chara-left');
  const charaRight = document.getElementById('adv-chara-right');

  function _applyText() {
    document.getElementById('adv-speaker').textContent  = msg.speaker;
    document.getElementById('adv-text').textContent     = msg.text;
    document.getElementById('adv-tap-hint').textContent = '▼ タップで続ける';
    if (isLast && scene.autoClose) {
      setTimeout(closeAdventureScene, 1500);
    }
  }

  // ─── 新機能: 両キャラ消去 + 背景チェンジ（hideAll）───
  if (msg.hideAll) {
    advTextPending = true;
    document.getElementById('adv-speaker').textContent  = '';
    document.getElementById('adv-text').textContent     = '';
    document.getElementById('adv-tap-hint').textContent = '';
    // 両キャラをフェードアウト（adv-char-shown を外すと opacity:0 に戻る）
    charaLeft.classList.remove('adv-char-shown', 'adv-chara-dim');
    charaRight.classList.remove('adv-char-shown', 'adv-chara-dim');
    // flip リセット
    charaLeft.querySelector('img').classList.remove('adv-img-flip');
    charaRight.querySelector('img').classList.remove('adv-img-flip');

    if (msg.changeBg) {
      // 背景フェードアウト → 画像差し替え → フェードイン
      const bgEl = document.getElementById('adv-bg');
      bgEl.style.transition = 'opacity 0.5s ease';
      bgEl.style.opacity    = '0';
      setTimeout(() => {
        bgEl.style.background = `url('${msg.changeBg}') center / cover no-repeat`;
        bgEl.style.opacity = '1';
        if (msg.autoAdvance) {
          setTimeout(() => { advTextPending = false; advMsgIdx++; showAdvMessage(advMsgIdx); }, 600);
        }
      }, 600);
    } else if (msg.autoAdvance) {
      setTimeout(() => {
        advTextPending = false; advMsgIdx++; showAdvMessage(advMsgIdx);
      }, msg.advanceDelay ?? 800);
    }
    return;
  }

  // ─── 右キャラの登場（初回のみ）───
  if (msg.showRight && !charaRight.classList.contains('adv-char-shown')) {
    if (msg.slideRight) {
      // スライドインしてからテキスト表示（CSSクラスのみ・インラインスタイル不使用）
      if (charaLeft.classList.contains('adv-char-shown'))
        charaLeft.classList.toggle('adv-chara-dim', msg.side !== 'left');
      document.getElementById('adv-speaker').textContent  = '';
      document.getElementById('adv-text').textContent     = '';
      document.getElementById('adv-tap-hint').textContent = '';
      charaRight.classList.add('adv-slide-ready');
      void charaRight.offsetHeight;
      charaRight.classList.add('adv-slide-active');
      advTextPending = true;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        charaRight.classList.remove('adv-slide-ready', 'adv-slide-active');
        charaRight.classList.add('adv-char-shown');
        charaRight.classList.toggle('adv-chara-dim', msg.side !== 'right');
        advTextPending = false;
        _applyText();
      };
      charaRight.addEventListener('transitionend', finish, { once: true });
      setTimeout(finish, 700);
      return;
    } else {
      void charaRight.offsetWidth;
      charaRight.classList.add('adv-char-shown');
    }
  }

  // ─── 左キャラの登場（初回のみ）← showLeft/slideLeft/flipLeft ───
  if (msg.showLeft && !charaLeft.classList.contains('adv-char-shown')) {
    // flip フラグを img に適用（スライド前に設定して反転状態でスライドイン）
    const leftImg = charaLeft.querySelector('img');
    if (msg.flipLeft) leftImg.classList.add('adv-img-flip');
    else              leftImg.classList.remove('adv-img-flip');
    if (msg.slideLeft) {
      if (charaRight.classList.contains('adv-char-shown')) {
        charaRight.classList.toggle('adv-chara-dim', msg.side !== 'right');
      }
      document.getElementById('adv-speaker').textContent  = '';
      document.getElementById('adv-text').textContent     = '';
      document.getElementById('adv-tap-hint').textContent = '';
      charaLeft.classList.add('adv-slide-ready');
      void charaLeft.offsetHeight;
      charaLeft.classList.add('adv-slide-active');
      advTextPending = true;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        charaLeft.classList.remove('adv-slide-ready', 'adv-slide-active');
        charaLeft.classList.add('adv-char-shown');
        charaLeft.classList.toggle('adv-chara-dim', msg.side !== 'left');
        advTextPending = false;
        _applyText();
      };
      charaLeft.addEventListener('transitionend', finish, { once: true });
      setTimeout(finish, 700);
      return;
    } else {
      void charaLeft.offsetWidth;
      charaLeft.classList.add('adv-char-shown');
    }
  }

  // 話者ハイライト / 非話者ディム
  if (charaLeft.classList.contains('adv-char-shown'))
    charaLeft.classList.toggle('adv-chara-dim', msg.side !== 'left');
  if (charaRight.classList.contains('adv-char-shown')) {
    charaRight.classList.toggle('adv-chara-dim', msg.side !== 'right');
  }

  _applyText();
}

function closeAdventureScene() {
  const screen = document.getElementById('adventure-screen');
  if (screen.classList.contains('hidden') || screen.classList.contains('adv-fade-out')) return;
  screen.classList.add('adv-fade-out');
  const cb = advCallback;
  setTimeout(() => {
    screen.classList.add('hidden');
    screen.classList.remove('adv-fade-out');
    advCurrentScene = null;
    advCallback     = null;
    advTextPending  = false;
    if (cb) cb();
  }, 800);
}

document.getElementById('adventure-screen').addEventListener('click', () => {
  if (!advCurrentScene || advTextPending) return;
  const isLast = advMsgIdx >= advCurrentScene.script.length - 1;
  if (isLast) {
    const msg = advCurrentScene.script[advMsgIdx];
    if (msg.tapCloseDelay != null) {
      setTimeout(closeAdventureScene, msg.tapCloseDelay);
    } else if (!advCurrentScene.autoClose) {
      closeAdventureScene();
    }
    return;
  }
  advMsgIdx++;
  showAdvMessage(advMsgIdx);
});

document.getElementById('debug-adv-test').addEventListener('click', () => {
  document.getElementById('debug-screen').classList.add('hidden');
  openAdventureScene('test');
});

document.getElementById('story-btn').addEventListener('click', () => {
  progressStory();
});

document.getElementById('settings-close').addEventListener('click', () => {
  document.getElementById('settings-screen').classList.add('hidden');
});

document.getElementById('settings-catalog-btn').addEventListener('click', () => {
  hideNaviHint();
  document.getElementById('settings-screen').classList.add('hidden');
  openCatalog();
});

document.getElementById('settings-shop-btn').addEventListener('click', () => {
  hideNaviHint();
  document.getElementById('settings-screen').classList.add('hidden');
  renderShop();
  document.getElementById('shop-screen').classList.remove('hidden');
});

document.getElementById('settings-characters-btn').addEventListener('click', () => {
  hideNaviHint();
  document.getElementById('settings-screen').classList.add('hidden');
  renderCharacters();
  document.getElementById('characters-screen').classList.remove('hidden');
});

// ========================================
// アイテムリストボタン（複数箇所）
// ========================================
function openCatalog() {
  catalogCurrentChain = 'event';
  renderCatalog();
  document.getElementById('catalog-screen').classList.remove('hidden');
}
document.getElementById('catalog-btn').addEventListener('click', openCatalog);
document.getElementById('main-catalog-btn').addEventListener('click', openCatalog);
document.getElementById('ev-catalog-btn').addEventListener('click', openCatalog);

document.getElementById('catalog-close').addEventListener('click', () => {
  document.getElementById('catalog-screen').classList.add('hidden');
});

// ========================================
// ショップ
// ========================================
function renderShop() {
  const list = document.getElementById('shop-list');
  list.innerHTML = '';

  const items = [
    {
      icon: '⚡',
      title: '無料 体力回復',
      detail: '体力 +25',
      badge: '無料',
      badgeClass: 'badge-free',
      remaining: () => shopRemaining(state.shop.lastFreeEnergy),
      canBuy: () => !shopRemaining(state.shop.lastFreeEnergy),
      btnLabel: '無料でもらう',
      action() {
        state.shop.lastFreeEnergy = Date.now();
        addEnergy(25, '無料体力ゲット！');
        renderShop();
      },
    },
    {
      icon: '⚡',
      title: '体力大回復',
      detail: '体力 +100',
      badge: '💰 10,000',
      badgeClass: 'badge-coin',
      remaining: () => shopRemaining(state.shop.lastCoinEnergy),
      canBuy: () => !shopRemaining(state.shop.lastCoinEnergy) && state.coin >= 10000,
      btnLabel: '💰 10,000で購入',
      action() {
        if (state.coin < 10000) { showToast('コインが足りません'); return; }
        state.shop.lastCoinEnergy = Date.now();
        state.coin -= 10000;
        addEnergy(100, 'コイン購入 体力+100！');
        renderShop();
        renderHeader();
      },
    },
    {
      icon: '⚡',
      title: '体力大回復',
      detail: '体力 +100',
      badge: '💎 10',
      badgeClass: 'badge-diamond',
      remaining: () => shopRemaining(state.shop.lastDiamondEnergy),
      canBuy: () => !shopRemaining(state.shop.lastDiamondEnergy) && state.diamond >= 10,
      btnLabel: '💎 10で購入',
      action() {
        if (state.diamond < 10) { showToast('ダイヤが足りません'); return; }
        state.shop.lastDiamondEnergy = Date.now();
        state.diamond -= 10;
        addEnergy(100, 'ダイヤ購入 体力+100！');
        renderShop();
        renderHeader();
      },
    },
  ];

  items.forEach(item => {
    const rem = item.remaining();
    const ok  = item.canBuy();
    const card = document.createElement('div');
    card.className = 'shop-item';
    card.innerHTML = `
      <div class="shop-item-left">
        <span class="shop-item-icon">${item.icon}</span>
        <div class="shop-item-info">
          <div class="shop-item-title">${item.title}</div>
          <div class="shop-item-detail">${item.detail}</div>
        </div>
      </div>
      <div class="shop-item-right">
        <span class="shop-badge ${item.badgeClass}">${item.badge}</span>
        ${rem ? `<div class="shop-timer">⏳ ${rem}</div>` : ''}
        <button class="shop-btn${ok ? '' : ' shop-btn-disabled'}">${ok ? item.btnLabel : (rem ? 'クールダウン中' : item.btnLabel)}</button>
      </div>
    `;
    if (ok) card.querySelector('.shop-btn').addEventListener('click', () => item.action());
    list.appendChild(card);
  });
}

// ショップ表示中タイマー（残り時間更新）
let shopTimerInterval = null;

document.getElementById('shop-btn').addEventListener('click', () => {
  renderShop();
  document.getElementById('shop-screen').classList.remove('hidden');
  shopTimerInterval = setInterval(renderShop, 60000); // 1分ごと更新
});

document.getElementById('shop-close').addEventListener('click', () => {
  document.getElementById('shop-screen').classList.add('hidden');
  clearInterval(shopTimerInterval);
  shopTimerInterval = null;
});

// ========================================
// イベントマップ① - メモ帳チュートリアル
// ========================================

const EVENT_CHAIN = {
  name: '第一章',
  stages: ['📝','🐱','📔','📒','📕','📗','📘','📙','📚','🗂️','🗃️','🏆'],
  stageImages: [
    'img/image_merge_icon1_01.png', // Lv1
    'img/image_merge_icon1_02.png', // Lv2
    'img/image_merge_icon1_03.png', // Lv3
    'img/image_merge_icon1_04.png', // Lv4
    'img/image_merge_icon1_05.png', // Lv5
    'img/image_merge_icon1_06.png', // Lv6
    'img/image_merge_icon1_07.png', // Lv7
    'img/image_merge_icon1_08.png', // Lv8
    'img/image_merge_icon1_09.png', // Lv9
    'img/image_merge_icon1_10.png', // Lv10
    'img/image_merge_icon1_11.png', // Lv11
    'img/image_merge_icon1_12.png', // Lv12
  ],
  stageNames: [
    'メモ帳','猫','猫のおもちゃ','足跡',
    'スニーカー','ダンボール','謎の石','カメラ',
    '証拠写真','破られた写真','相関図のボード','何かを示すボード',
  ],
};

// イベントマップ ジェネレーター画像（Lv別）
const EVENT_GEN_IMAGES = [
  'img/image_merge_gene1_01.png', // Lv1
  'img/image_merge_gene1_02.png', // Lv2
  'img/image_merge_gene1_03.png', // Lv3
  'img/image_merge_gene1_04.png', // Lv4
];
// 第一章ジェネレーター名（Lv1〜4）
const EVENT_GEN_NAMES = ['メモ机', '観察キット', '調査バッグ', '調査バッグ+'];

// 第二章チェーンID（CHAINS配列のインデックス）
const SEIZO_CHAIN_ID = 11;

// 製造機ジェネレーター画像（Lv1〜7）
const SEIZO_GEN_IMAGES = [
  'img/image_merge_gene2_01.png', // Lv1
  'img/image_merge_gene2_02.png', // Lv2
  'img/image_merge_gene2_03.png', // Lv3
  'img/image_merge_gene2_04.png', // Lv4
  'img/image_merge_gene2_05.png', // Lv5
  'img/image_merge_gene2_06.png', // Lv6
  'img/image_merge_gene2_07.png', // Lv7
];
// 第二章ジェネレーター名（Lv1〜7）
const SEIZO_GEN_NAMES = ['鍵製造機', 'ICカード製造機', '鍛冶製造機', '監視室', 'レーダー探知機', 'マンション模型', '3Dプリンター'];

// 第二章ジェネレーター Lvボタン別出力設定（Lucky/PowerはLUCKY_CONFIG/GEN_POWER_BONUSを使用）
const FIRE_POWER_CONFIG = [
  { outStage: 1 }, // Lv1ボタン ⚡1
  { outStage: 2 }, // Lv2ボタン ⚡2
  { outStage: 4 }, // Lv4ボタン ⚡4
  { outStage: 5 }, // Lv8ボタン ⚡8
  { outStage: 6 }, // Lv16ボタン ⚡16
];

// 製造機ジェネレーター出力設定（旧・互換のため残存）
const SEIZO_GEN_CONFIG = [
  { outStage: 1, luckyProb: 0.01, luckyMult: 2.0 },
  { outStage: 2, luckyProb: 0.03, luckyMult: 1.5 },
  { outStage: 3, luckyProb: 0.05, luckyMult: 2.0 },
  { outStage: 4, luckyProb: 0.07, luckyMult: 2.0 },
  { outStage: 5, luckyProb: 0.09, luckyMult: 1.2 },
  { outStage: 6, luckyProb: 0.07, luckyMult: 1.5 },
  { outStage: 7, luckyProb: 0.05, luckyMult: 1.2 },
];

// 製造機ジェネレーターLvアップ条件（製造機アイテムが特定Lvに達したときLvアップ）
const SEIZO_GEN_LEVELUP_TRIGGERS = [
  { triggerStage: 3,  toLevel: 2 },
  { triggerStage: 5,  toLevel: 3 },
  { triggerStage: 7,  toLevel: 4 },
  { triggerStage: 8,  toLevel: 5 },
  { triggerStage: 9,  toLevel: 6 },
  { triggerStage: 10, toLevel: 7 },
];

const EVENT_COLS = 7;
const EVENT_ROWS = 9;
const EVENT_TOTAL = EVENT_COLS * EVENT_ROWS;

// 霧セル → 埋め込みステージ (1/2/3) のマップ
// 行列は1-indexed で指定:
//   Lv1: 5行目3-5列, 6-8行目2・6列, 9行目3-5列
//   Lv2: 5行目1-2・6-7列, 6-8行目1・7列, 9行目1-2・6-7列
//   Lv3: それ以外の霧セル（行0-3、全列）
function buildFogItemMap() {
  const map = new Map(); // index → stage
  const lv1Set = new Set([30,31,32, 36,40, 43,47, 50,54, 58,59,60]);
  const lv2Set = new Set([28,29,33,34, 35,41, 42,48, 49,55, 56,57,61,62]);

  // 行0-3 全列 (indices 0-27) → Lv3
  for (let i = 0; i < 28; i++) map.set(i, 3);
  // 行4 (indices 28-34)
  for (let i = 28; i <= 34; i++) {
    if (lv1Set.has(i))      map.set(i, 1);
    else if (lv2Set.has(i)) map.set(i, 2);
  }
  // 行5-7 の霧列 (col 0,1,5,6)
  for (let row = 5; row <= 7; row++) {
    [0, 1, 5, 6].forEach(col => {
      const idx = row * 7 + col;
      if (lv1Set.has(idx))      map.set(idx, 1);
      else if (lv2Set.has(idx)) map.set(idx, 2);
    });
  }
  // 行8 全列 (indices 56-62)
  for (let i = 56; i < 63; i++) {
    if (lv1Set.has(i))      map.set(i, 1);
    else if (lv2Set.has(i)) map.set(i, 2);
  }
  return map;
}
const EVENT_FOG_ITEM_MAP = buildFogItemMap();

// 初期状態でマージ可能な霧セル（ボード外周の霧：5行3-5列 / 6-8行2・6-7列 / 9行3-5列）
const INITIAL_UNLOCKED_FOG = new Set([30,31,32, 36,40, 43,47, 50,54, 58,59,60]);

// ジェネレーターマージ誘導チュートリアルのステップ定義
const GEN_MERGE_TUT_STEPS = [
  { type: 'focus', text: 'もうひとつの"メモ机"が出ました。\n"メモ机"と"メモ机"を組み合わせてください。' },
  { type: 'msg',   text: '"メモ机"がレベルアップしました。\n出せるアイテムのLvが上がります。' },
  { type: 'msg',   text: '出すアイテムレベルを上下したい時は、"メモ机"を選択するとメッセージの横にレベルボタンが出るので、タップしてレベルを変更してください。' },
];

// アイテムヒントテキスト（アイテム名は後で差し替え）
const ITEM_HINT_TEXT = '？？？？をマージさせて次のレベルにアップしましょう。';

// ========================================
// チュートリアルステップ定義
// type: 'blocking_msg' → オーバーレイ表示・タップで次へ
//       'gen_focus'    → ジェネレーターのみ操作可（2回タップで自動進行）
//       'merge_focus'  → 2個のLv1アイテムのみ操作可（マージで自動進行）
// ========================================
const TUTORIAL_STEPS = [
  { type: 'blocking_msg', text: '私は、アナタの助手のヤスヒコと申します。\nヤスと呼んでください。' },
  { type: 'blocking_msg', text: 'アナタは、新米探偵です。' },
  { type: 'blocking_msg', text: 'これから、様々なご依頼を解決して頂きます。' },
  // ↑ #2 完了後にアドベンチャーシーン01が自動挿入される
  { type: 'gen_focus',    text: 'まずは、"メモ帳"を\n２回タップしてみてください。' },
  { type: 'merge_focus',  text: '新しい"アイテム"が出ましたね？\nその同じ"アイテム"を重ねてみてください。' },
  { type: 'blocking_msg', text: '重ねると新しい"アイテム"に\nなりましたね？' },
  { type: 'blocking_msg', text: '重ねた"アイテム"で\n"依頼"を解決することができます。' },
  // 依頼解決チュートリアル
  { type: 'blocking_msg', text: '先ほどの依頼人が依頼をしてきています。', showRequest: true, noOverlay: true },
  { type: 'request_focus', text: '"依頼解決"ボタンをタップして、\n依頼を解決してください。' },
  // 依頼解決後
  { type: 'blocking_msg', text: '依頼を解決すると、報酬を頂けます。' },
  { type: 'blocking_msg', text: '引き続き、たくさんの依頼を解決して頂きます。' },
  { type: 'blocking_msg', text: 'それでは、探偵業のはじまりです。' },
];

let eventState = {
  board: Array(EVENT_TOTAL).fill(null),
  selectedCell: null,
  tutorialStep: 0,       // TUTORIAL_STEPS.length に達したら完了
  tutorialGenTaps: 0,    // gen_focusフェーズのタップカウント
  discovered: {},        // 発見済みイベントアイテム { stage: true }
  requests: [],          // イベントマップ用依頼リスト
  genLevelUpReady: false, // （旧フラグ、互換のため残存）
  fireGenUnlocked: false, // 製造機ジェネレーター解放済み
  seizoGenLevel: 0,       // 製造機ジェネレーターの現在Lv（0=Lv1, 6=Lv7）
  seizoDiscovered: {},    // 発見済み製造機アイテム { stage: true }
  seizoLvTriggered: new Set(), // 製造機LvアップのトリガーになったステージSet
  genUpTriggered: new Set(), // Lvアップ用タイル出現済みステージ {4, 8, 12}
  completedLowStages: new Set(), // 一度解決したLv1-5のステージキー（永久に再出現しない）
  recentlySolvedKeys: new Set(), // 直前に解決したLv6+キー（次の補充で1回スキップ）
  unlockedFogCells: new Set(),  // マージ可能な霧セルのインデックス
  genMergeTutStep: null,        // ジェネレーターマージ誘導チュート: null=非アクティブ, 0/1/2=ステップ
  genMergeTutDone: false,       // 一度完了したら二度と出さない
  genPowerLevel: 0,             // 第一章ジェネレーター 現在選択中の出力パワーレベル
  firePowerLevel: 0,            // 第二章ジェネレーター 現在選択中の出力パワーレベル
  revealed: {},            // 第一章アイテム: stage→true（ダイヤ取得済み）
  seizoRevealed: {},       // 第二章アイテム: stage→true
  genDiscovered: {},       // ジェネレーター: 'ch1_N'/'ch2_N'→true（出現済み）
  genRevealed: {},         // ジェネレーター: 同キー→true（ダイヤ取得済み）
};

// タッチデバイス判定
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

let evDrag = {
  active: false,
  fromIdx: null,
  ghost: null,
  tapHandled: false,
  startX: 0,
  startY: 0,
  hasMoved: false, // 指/マウスが閾値以上動いたか（ドラッグ vs タップ判定）
};

let mainGameStarted = false; // チュートリアル → メインゲーム移行済みフラグ

function initEventMap() {
  eventState.board = Array(EVENT_TOTAL).fill(null);
  eventState.selectedCell = null;
  eventState.tutorialStep = 0;
  eventState.tutorialGenTaps = 0;
  eventState.requests = [];
  eventState.genLevelUpReady   = false;
  eventState.fireGenUnlocked   = false;
  eventState.seizoGenLevel     = 0;
  eventState.seizoDiscovered   = {};
  eventState.seizoLvTriggered  = new Set();
  eventState.genUpTriggered    = new Set();
  eventState.completedLowStages = new Set();
  eventState.recentlySolvedKeys = new Set();
  eventState.unlockedFogCells   = new Set(INITIAL_UNLOCKED_FOG);
  eventState.genMergeTutStep    = null;
  eventState.genMergeTutDone    = false;
  eventState.genPowerLevel      = 0;
  eventState.firePowerLevel     = 0;
  eventState.revealed           = {};
  eventState.seizoRevealed      = {};
  eventState.genDiscovered      = {};
  eventState.genRevealed        = {};

  // 霧アイテム配置（Lv1/2/3）
  EVENT_FOG_ITEM_MAP.forEach((stage, i) => {
    eventState.board[i] = { isFog: true, stage };
  });

  // メモ帳ジェネレーターを配置（霧でないセルの最初の空きに）
  const genIdx = eventState.board.findIndex(c => c === null);
  if (genIdx !== -1) {
    eventState.board[genIdx] = { isEventGen: true, genLevel: 0 };
    discoverGen('ch1', 0); // Lv1 を発見
  }
}

// ========================================
// チュートリアル制御
// ========================================
function isTutorialComplete() {
  return eventState.tutorialStep >= TUTORIAL_STEPS.length;
}

function currentTutStep() {
  return isTutorialComplete() ? null : TUTORIAL_STEPS[eventState.tutorialStep];
}

function advanceTutorial() {
  eventState.tutorialStep++;

  // ステップ#2→#3 の間にアドベンチャーシーン01を挿入
  if (eventState.tutorialStep === 3) {
    document.getElementById('tutorial-panel')?.classList.add('hidden');
    document.getElementById('tutorial-overlay')?.classList.add('hidden');
    openAdventureScene('scene01', () => {
      renderTutorialPanel();
      renderEventBoard();
      renderEventRequest();
      renderEventHeader();
    });
    return;
  }

  renderTutorialPanel();
  renderEventBoard();
  renderEventRequest();
  renderEventHeader();
}

function transitionToMainGame() {
  if (mainGameStarted) return;
  mainGameStarted = true;

  // チュートリアル完了後にイベントマップ本編へ移行
  const genItem = eventState.board.find(c => c && c.isEventGen);
  eventState.board = Array(EVENT_TOTAL).fill(null);
  // 霧アイテムを再配置（Lv1/2/3）
  EVENT_FOG_ITEM_MAP.forEach((stage, i) => { eventState.board[i] = { isFog: true, stage }; });
  // 初期解放霧セルをリセット
  eventState.unlockedFogCells = new Set(INITIAL_UNLOCKED_FOG);
  // メモ帳ジェネレーターを再配置（Lvは引き継ぐ）
  const genIdx = eventState.board.findIndex(c => c === null);
  if (genIdx !== -1) {
    eventState.board[genIdx] = { isEventGen: true, genLevel: genItem?.genLevel ?? 0 };
  }
  // Lv3+ で依頼を補充（Lv2固定依頼・chara_01.png は廃止）
  eventState.requests = [];
  fillEventRequests();
  renderEventBoard();
  renderEventGenerators();
  renderEventRequest();
  renderEventHeader();
}

function renderTutorialPanel() {
  const overlay = document.getElementById('tutorial-overlay');
  const panel   = document.getElementById('tutorial-panel');
  const msgEl   = document.getElementById('tutorial-msg-text');
  const hintEl  = document.getElementById('tutorial-tap-hint');
  if (!overlay || !panel) return;

  if (isTutorialComplete()) {
    transitionToMainGame();
    // メインチュートリアル完了後はジェネレーターマージ誘導チュートに引き継ぐ
    renderGenMergeTutPanel();
    return;
  }

  const step = currentTutStep();
  panel.classList.remove('hidden');
  hideNaviHint(); // チュートリアルパネル表示中はナビヒントを隠す
  msgEl.textContent = step.text;

  if (step.type === 'blocking_msg') {
    // noOverlay フラグがある場合はオーバーレイを出さない（依頼パネルを見せたい場合など）
    if (step.noOverlay) overlay.classList.add('hidden');
    else                overlay.classList.remove('hidden');
    hintEl.style.display = '';
  } else {
    // gen_focus / merge_focus / request_focus: ヒントバーのみ表示
    overlay.classList.add('hidden');
    hintEl.style.display = 'none';
  }
}

function onTutorialTap() {
  // ジェネレーターマージ誘導チュートリアルのメッセージステップはタップで進める
  if (isGenMergeTutActive()) {
    const gmStep = currentGenMergeTutStep();
    if (gmStep && gmStep.type === 'msg') { advanceGenMergeTut(); return; }
    return; // focus ステップ中はタップ進行しない
  }
  const step = currentTutStep();
  if (!step || step.type !== 'blocking_msg') return;
  advanceTutorial();
}

// ========================================
// ジェネレーターマージ誘導チュートリアル制御
// ========================================
function isGenMergeTutActive() {
  return eventState.genMergeTutStep !== null;
}
function currentGenMergeTutStep() {
  if (eventState.genMergeTutStep === null) return null;
  return GEN_MERGE_TUT_STEPS[eventState.genMergeTutStep] ?? null;
}
function startGenMergeTut() {
  if (eventState.genMergeTutDone) return;
  eventState.genMergeTutStep = 0;
  hideNaviHint(); // チュートリアル開始時はナビヒントを非表示
  eventState.selectedCell = null;
  renderGenMergeTutPanel();
  renderEventBoard();
}
function advanceGenMergeTut() {
  if (eventState.genMergeTutStep === null) return;
  eventState.genMergeTutStep++;
  if (eventState.genMergeTutStep >= GEN_MERGE_TUT_STEPS.length) {
    eventState.genMergeTutStep = null;
    eventState.genMergeTutDone = true;
  }
  renderGenMergeTutPanel();
  renderEventBoard();
}
function renderGenMergeTutPanel() {
  const overlay = document.getElementById('tutorial-overlay');
  const panel   = document.getElementById('tutorial-panel');
  const msgEl   = document.getElementById('tutorial-msg-text');
  const hintEl  = document.getElementById('tutorial-tap-hint');
  if (!overlay || !panel) return;

  const gmStep = currentGenMergeTutStep();
  if (!gmStep) {
    overlay.classList.add('hidden');
    panel.classList.add('hidden');
    return;
  }
  panel.classList.remove('hidden');
  msgEl.textContent = gmStep.text;
  if (gmStep.type === 'focus') {
    // フォーカス: オーバーレイ非表示、ジェネレーターだけ操作可
    overlay.classList.add('hidden');
    hintEl.style.display = 'none';
  } else {
    // メッセージ: オーバーレイで他の操作をブロック
    overlay.classList.remove('hidden');
    hintEl.style.display = '';
  }
}

// ========================================
// パワーレベル管理
// ========================================
const POWER_COSTS = [1, 2, 4, 8, 16]; // インデックス → 消費体力

function isGenPowerLvAvailable(powerIdx, genLevel) {
  if (powerIdx === 0) return true;
  if (powerIdx === 1) return genLevel >= 1;
  if (powerIdx === 2) return genLevel >= 2;
  if (powerIdx === 3) return genLevel >= 3 && state.energy >= 200;
  if (powerIdx === 4) return genLevel >= 3 && state.energy >= 400;
  return false;
}

function getGenMaxAvailablePowerLv(genLevel) {
  for (let i = 4; i >= 0; i--) {
    if (isGenPowerLvAvailable(i, genLevel)) return i;
  }
  return 0;
}

function cycleGenPowerLevel(genLevel) {
  let next = (eventState.genPowerLevel + 1) % 5;
  for (let tries = 0; tries < 5; tries++) {
    if (isGenPowerLvAvailable(next, genLevel)) {
      eventState.genPowerLevel = next;
      return next;
    }
    next = (next + 1) % 5;
  }
  eventState.genPowerLevel = 0;
  return 0;
}

// --- 第二章ジェネレーター Lvボタン関連 ---
function isFireGenPowerLvAvailable(powerIdx, seizoLevel) {
  if (powerIdx === 0) return true;
  if (powerIdx === 1) return seizoLevel >= 1;                                  // Lv2+
  if (powerIdx === 2) return seizoLevel >= 3;                                  // Lv4+
  if (powerIdx === 3) return seizoLevel >= 3 && state.energy >= 200;           // Lv4+ + 200⚡
  if (powerIdx === 4) return seizoLevel >= 3 && state.energy >= 400;           // Lv4+ + 400⚡
  return false;
}

function getFireGenMaxAvailablePowerLv(seizoLevel) {
  for (let i = 4; i >= 0; i--) {
    if (isFireGenPowerLvAvailable(i, seizoLevel)) return i;
  }
  return 0;
}

function cycleFireGenPowerLevel(seizoLevel) {
  let next = (eventState.firePowerLevel + 1) % 5;
  for (let tries = 0; tries < 5; tries++) {
    if (isFireGenPowerLvAvailable(next, seizoLevel)) {
      eventState.firePowerLevel = next;
      return next;
    }
    next = (next + 1) % 5;
  }
  eventState.firePowerLevel = 0;
  return 0;
}

function updateFireNaviLvBtn(seizoLevel) {
  const lvLabel = document.getElementById('navi-lv-label');
  const lvCrown = document.getElementById('navi-lv-crown');
  if (!lvLabel || !lvCrown) return;
  const curPL = eventState.firePowerLevel;
  const maxPL = getFireGenMaxAvailablePowerLv(seizoLevel);
  lvLabel.textContent = `${POWER_COSTS[curPL]}⚡`;
  lvCrown.textContent = curPL === maxPL ? '👑' : '';
}

// ========================================
// ナビゲーターヒント表示（非ブロッキング）
// ========================================
let naviHintTimer = null;
let naviHintPersistent = false; // 持続表示中フラグ
let lastCoinTapTime = 0;
let lastCoinTapIdx  = -1;

function hideNaviHint() {
  if (naviHintTimer) { clearTimeout(naviHintTimer); naviHintTimer = null; }
  naviHintPersistent = false;
  document.getElementById('navi-hint-panel')?.classList.add('hidden');
  document.getElementById('navi-diamond-btn')?.classList.add('hidden');
  document.getElementById('navi-trash-btn')?.classList.add('hidden');
  document.getElementById('navi-coin-btn')?.classList.add('hidden');
}

function _showNaviHintPanel(text, showLvBtn, persistent = false) {
  const panel  = document.getElementById('navi-hint-panel');
  const textEl = document.getElementById('navi-hint-text');
  const lvBtn  = document.getElementById('navi-lv-btn');
  if (!panel || !textEl) return;
  // チュートリアル中は表示しない
  if (!isTutorialComplete() || isGenMergeTutActive()) return;
  const tutPanel = document.getElementById('tutorial-panel');
  if (tutPanel && !tutPanel.classList.contains('hidden')) return;
  // 持続表示中（ジェネレーター選択など）は非持続の呼び出しを無視
  if (naviHintPersistent && !persistent) return;
  textEl.textContent = text;
  if (lvBtn) lvBtn.classList.toggle('hidden', !showLvBtn);
  document.getElementById('navi-diamond-btn')?.classList.add('hidden');
  document.getElementById('navi-trash-btn')?.classList.add('hidden');
  document.getElementById('navi-coin-btn')?.classList.add('hidden');
  panel.classList.remove('hidden');
  naviHintPersistent = persistent;
  if (naviHintTimer) clearTimeout(naviHintTimer);
  if (persistent) {
    naviHintTimer = null; // hideNaviHint() が呼ばれるまで表示し続ける
  } else {
    naviHintTimer = setTimeout(() => {
      panel.classList.add('hidden');
      naviHintPersistent = false;
      naviHintTimer = null;
    }, 3000);
  }
}

function updateNaviLvBtn(genLevel) {
  const lvLabel = document.getElementById('navi-lv-label');
  const lvCrown = document.getElementById('navi-lv-crown');
  if (!lvLabel || !lvCrown) return;
  const curPL = eventState.genPowerLevel;
  const maxPL = getGenMaxAvailablePowerLv(genLevel);
  lvLabel.textContent = `${POWER_COSTS[curPL]}⚡`;
  lvCrown.textContent = curPL === maxPL ? '👑' : '';
}

function showNaviHintForGen(genLevel, persistent = false) {
  const maxGenLevel = EVENT_GEN_IMAGES.length - 1;
  const isMaxGen = genLevel >= maxGenLevel;
  const text = isMaxGen
    ? '第一章ジェネレーターは最大Lvです。もう一度タップでアイテムを生成！'
    : '第一章ジェネレーターをマージしてLvアップ！もう一度タップでアイテム生成。';
  if (!isMaxGen) updateNaviLvBtn(genLevel);
  _showNaviHintPanel(text, !isMaxGen, persistent);
}

function showNaviHintForFireGen(item, persistent = false) {
  const sLv = item.seizoLevel ?? 0;
  const maxSLv = SEIZO_GEN_IMAGES.length - 1;
  const isMax = sLv >= maxSLv;
  const text = isMax
    ? '第二章ジェネレーターは最大Lvです。もう一度タップでアイテムを生成！'
    : '第二章ジェネレーターをマージしてLvアップ！もう一度タップでアイテム生成。';
  if (!isMax) updateFireNaviLvBtn(sLv);
  _showNaviHintPanel(text, !isMax, persistent);
}

function showNaviHintForItem(item, persistent = false) {
  const chainInfo = item.chainId !== undefined ? CHAINS[item.chainId] : EVENT_CHAIN;
  const idx  = item.stage - 1;
  const name = chainInfo.stageNames?.[idx] ?? chainInfo.stages?.[idx] ?? 'アイテム';
  const isMax = item.stage >= chainInfo.stages.length;
  const text = isMax
    ? `${name}は、最大Lvに達しています`
    : `${name}をマージさせて次のレベルにアップしましょう。`;
  _showNaviHintPanel(text, false, persistent);
  // Lv1: ゴミ箱ボタン、Lv2以降: コイン獲得ボタン
  const trashBtn = document.getElementById('navi-trash-btn');
  const coinBtn  = document.getElementById('navi-coin-btn');
  const coinLbl  = document.getElementById('navi-coin-label');
  if (item.stage === 1) {
    trashBtn?.classList.remove('hidden');
    coinBtn?.classList.add('hidden');
  } else {
    trashBtn?.classList.add('hidden');
    const reward = item.stage * 10;
    if (coinLbl) coinLbl.textContent = `💰 ${reward}`;
    coinBtn?.classList.remove('hidden');
  }
}

function showNaviHintForCoin(item) {
  const lv     = item.coinLv ?? 1;
  const reward = COIN_REWARD[lv] ?? 0;
  const isMax  = lv >= COIN_MAX_LV;
  const text   = isMax
    ? `コインLv${lv}（最大）: ダブルタップで💰+${reward}`
    : `コインLv${lv}: ダブルタップで💰+${reward}。同じLvと重ねてLvアップ！`;
  _showNaviHintPanel(text, false, true);
}

// しゃぼん玉アイテム用ナビヒント（ダイヤボタンを表示）
function showNaviHintForBubble(item) {
  const stage = item.stage ?? 1;
  const cost  = BUBBLE_DIAMOND_COST[stage] ?? 0;
  const panel  = document.getElementById('navi-hint-panel');
  const textEl = document.getElementById('navi-hint-text');
  const lvBtn  = document.getElementById('navi-lv-btn');
  const diaBtn = document.getElementById('navi-diamond-btn');
  const diaLbl = document.getElementById('navi-diamond-label');
  if (!panel || !textEl) return;
  textEl.textContent = `しゃぼん玉に包まれています。💎${cost} で割ることができます。`;
  if (lvBtn)  lvBtn.classList.add('hidden');
  if (diaBtn) diaBtn.classList.remove('hidden');
  if (diaLbl) diaLbl.textContent = `💎 ${cost}`;
  document.getElementById('navi-trash-btn')?.classList.add('hidden');
  document.getElementById('navi-coin-btn')?.classList.add('hidden');
  panel.classList.remove('hidden');
  naviHintPersistent = true;
  if (naviHintTimer) clearTimeout(naviHintTimer);
  naviHintTimer = null;
}

// しゃぼん玉を割るアニメーション + ダイヤ消費
function popBubble(cellIdx) {
  const cells = document.querySelectorAll('#event-board .cell');
  const cell  = cells[cellIdx];
  const overlay = cell?.querySelector('.bubble-overlay');
  const finish = () => {
    if (eventState.board[cellIdx]) {
      delete eventState.board[cellIdx].isBubble;
    }
    hideNaviHint();
    eventState.selectedCell = null;
    renderEventBoard();
    renderEventHeader();
  };
  if (overlay) {
    overlay.style.animation = 'bubble-pop 0.35s ease-out forwards';
    setTimeout(finish, 350);
  } else {
    finish();
  }
}

// 後方互換（既存の showNaviHint 呼び出し箇所があれば利用）
function showNaviHint(text) { _showNaviHintPanel(text, false); }

// ========================================
// イベントボード描画
// ========================================

// ボードアイテムの表示情報を取得（chainId あり → メインチェーン、なし → EVENT_CHAIN）
function getEvItemDisplay(item) {
  if (item.isCoin) {
    const lv = item.coinLv ?? 1;
    return { emoji: COIN_EMOJI[lv] ?? '🪙', imgSrc: COIN_IMAGES[lv] ?? null };
  }
  if (item.chainId !== undefined) {
    const chain = CHAINS[item.chainId];
    return {
      emoji:  chain.stages[item.stage - 1] || '❓',
      imgSrc: chain.stageImages?.[item.stage - 1] ?? null,
    };
  }
  return {
    emoji:  EVENT_CHAIN.stages[item.stage - 1] || '❓',
    imgSrc: EVENT_CHAIN.stageImages?.[item.stage - 1] ?? null,
  };
}

// 2つのボードアイテムがマージ可能か（同チェーン・同ステージ）
function evItemCanMerge(a, b) {
  if (!a || !b) return false;
  if (a.isEventGen || b.isEventGen) return false;
  if (a.isBubble || b.isBubble) return false; // しゃぼん玉はマージ不可
  // コイン同士のマージ（同Lv かつ Lv5未満）
  if (a.isCoin && b.isCoin) return a.coinLv === b.coinLv && a.coinLv < COIN_MAX_LV;
  if (a.isCoin || b.isCoin) return false;
  return a.stage === b.stage && (a.chainId ?? 'ev') === (b.chainId ?? 'ev');
}

function renderEventBoard() {
  const board = document.getElementById('event-board');
  if (!board) return;
  board.innerHTML = '';

  const step = currentTutStep();

  // 同Lvペアの検出（霧アイテムも対象）
  const evPairMap = {};   // key="chainKey-stage" → count
  const evPairSet = new Set();
  eventState.board.forEach(item => {
    if (!item || item.isEventGen) return;
    const key = item.isCoin
      ? `coin-${item.coinLv}`
      : `${item.chainId ?? 'ev'}-${item.stage}`;
    evPairMap[key] = (evPairMap[key] || 0) + 1;
    if (evPairMap[key] >= 2) evPairSet.add(key);
  });

  // 選択中アイテム
  const selItem = eventState.selectedCell !== null ? eventState.board[eventState.selectedCell] : null;

  for (let i = 0; i < EVENT_TOTAL; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.dataset.index = i;

    const item = eventState.board[i];

    if (item) {
      if (item.isFog) {
        // ──────────────────────────────
        // 霧アイテム（Lv1/2/3）
        // ──────────────────────────────
        cell.classList.add('has-item', 'fog-item');
        const fogUnlocked = eventState.unlockedFogCells.has(i);
        if (!fogUnlocked) cell.classList.add('fog-locked');
        const { emoji, imgSrc } = getEvItemDisplay(item);
        const iconHtml = imgSrc
          ? `<img class="item-img${item.stage === 1 ? ' item-img-lg' : ''}" src="${imgSrc}" alt="${emoji}">`
          : `<span class="item-emoji">${emoji}</span>`;
        cell.innerHTML = iconHtml;

        // マージターゲット判定（解放済み霧のみ）
        if (fogUnlocked && selItem && i !== eventState.selectedCell && evItemCanMerge(selItem, item)) {
          cell.classList.add('merge-target');
        }
        // 霧アイテムはシェイクしない（ヒント不要）

        if (step || isGenMergeTutActive()) cell.classList.add('tutorial-dim');

        // 霧アイテムはドラッグ不可（merge-target としてドロップ受け）
        cell.addEventListener('mousedown', (e) => startEvDrag(e, i));
        cell.addEventListener('touchstart', (e) => startEvDragTouch(e, i), { passive: false });

      } else if (item.isEventGen) {
        // ──────────────────────────────
        // ジェネレーター（メモ帳 or 炎）
        // ──────────────────────────────
        cell.classList.add('has-item', 'has-generator');
        const starsHtml = Array.from({length: 5}, (_, si) => {
          const sw  = 14;
          const x   = 15 + si * sw + Math.floor(Math.random() * sw);
          const d   = (si * 0.3).toFixed(1);
          const dur = (1.1 + Math.random() * 0.8).toFixed(2);
          const ris = 160 + Math.floor(Math.random() * 100);
          return `<span class="gen-star" style="--x:${x}%;--delay:${d}s;--duration:${dur}s;--rise:${ris}%"></span>`;
        }).join('');

        if (item.isFireGen) {
          // 製造機ジェネレーター（per-tile seizoLevel）
          const sLv  = item.seizoLevel ?? eventState.seizoGenLevel ?? 0;
          const sImg = SEIZO_GEN_IMAGES[Math.min(sLv, SEIZO_GEN_IMAGES.length - 1)];
          cell.innerHTML = `
            <img class="item-img item-img-lg" src="${sImg}" alt="製造機">
            <div class="gen-stars">${starsHtml}</div>
            <span class="gen-energy-badge">⚡</span>
          `;
          // 選択・マージターゲット表示
          if (!step) {
            if (i === eventState.selectedCell) cell.classList.add('selected');
            if (selItem && selItem.isFireGen && i !== eventState.selectedCell &&
                (selItem.seizoLevel ?? 0) === sLv) {
              cell.classList.add('merge-target');
            }
          }
          if (step) cell.classList.add('tutorial-dim');
          else if (isGenMergeTutActive()) cell.classList.add('tutorial-dim');
          cell.addEventListener('touchstart', (e) => startEvDragTouch(e, i), { passive: false });
          cell.addEventListener('mousedown', (e) => startEvDrag(e, i));
        } else {
          // メモ帳ジェネレーター
          cell.innerHTML = `
            <img class="item-img item-img-lg" src="${EVENT_GEN_IMAGES[Math.min(item.genLevel ?? 0, EVENT_GEN_IMAGES.length - 1)]}" alt="ジェネレーター">
            <div class="gen-stars">${starsHtml}</div>
            <span class="gen-energy-badge">⚡</span>
          `;

          // チュートリアル完了後: 選択・マージターゲット表示
          if (!step) {
            if (i === eventState.selectedCell) cell.classList.add('selected');
            // 同Lvの別ジェネレータータイルが選ばれていればマージターゲット
            if (selItem && selItem.isEventGen && !selItem.isFireGen &&
                i !== eventState.selectedCell &&
                (selItem.genLevel ?? 0) === (item.genLevel ?? 0)) {
              cell.classList.add('merge-target');
            }
          }

          if (step) {
            if (step.type === 'gen_focus') cell.classList.add('tutorial-spotlight');
            else                          cell.classList.add('tutorial-dim');
          } else if (isGenMergeTutActive()) {
            const gmStep = currentGenMergeTutStep();
            if (gmStep?.type === 'focus' && !item.isFireGen) {
              cell.classList.add('tutorial-spotlight');
            } else if (gmStep?.type === 'msg' && !item.isFireGen && (item.genLevel ?? 0) >= 1) {
              // Lv2ジェネレーター（genLevel=1）をメッセージ中にスポットライト表示
              cell.classList.add('tutorial-spotlight');
            } else {
              cell.classList.add('tutorial-dim');
            }
          }
          cell.addEventListener('touchstart', (e) => startEvDragTouch(e, i), { passive: false });
          cell.addEventListener('mousedown', (e) => startEvDrag(e, i));
          if (!isTouchDevice) {
            cell.addEventListener('mouseenter', () => {
              if (step || isGenMergeTutActive()) return;
              showNaviHintForGen(item.genLevel ?? 0, false);
            });
          }
        }

      } else {
        // ──────────────────────────────
        // 通常マージアイテム（メモ帳 or 炎）
        // ──────────────────────────────
        cell.classList.add('has-item');
        const { emoji, imgSrc } = getEvItemDisplay(item);
        const iconHtml = imgSrc
          ? `<img class="item-img${item.stage === 1 ? ' item-img-lg' : ''}" src="${imgSrc}" alt="${emoji}">`
          : `<span class="item-emoji">${emoji}</span>`;
        cell.innerHTML = iconHtml;

        // しゃぼん玉オーバーレイ
        if (item.isBubble) {
          cell.classList.add('has-bubble');
          const overlay = document.createElement('div');
          overlay.className = 'bubble-overlay';
          cell.appendChild(overlay);
        }
        // コインLv5: 水蒸気アニメーションオーバーレイ
        if (item.isCoin && item.coinLv >= COIN_MAX_LV) {
          cell.classList.add('has-coin-smoke');
          const smoke = document.createElement('div');
          smoke.className = 'coin-smoke-overlay';
          for (let s = 0; s < 3; s++) {
            const p = document.createElement('span');
            p.className = 'steam-particle';
            smoke.appendChild(p);
          }
          cell.appendChild(smoke);
        }

        if (i === eventState.selectedCell) cell.classList.add('selected');
        // マージターゲット
        if (selItem && i !== eventState.selectedCell && evItemCanMerge(selItem, item)) {
          cell.classList.add('merge-target');
        }
        // ヒントシェイク（最大Lv・しゃぼん玉はシェイクしない）
        const normalKey = item.isCoin
          ? `coin-${item.coinLv}`
          : `${item.chainId ?? 'ev'}-${item.stage}`;
        let canMergeItem = false;
        if (item.isCoin) {
          canMergeItem = item.coinLv < COIN_MAX_LV;
        } else if (!item.isBubble) {
          const chainForMax = item.chainId !== undefined ? CHAINS[item.chainId] : EVENT_CHAIN;
          canMergeItem = item.stage < (chainForMax.stages?.length ?? 99);
        }
        if (evPairSet.has(normalKey) && canMergeItem) cell.classList.add('merge-hint');

        // チュートリアルの見た目
        if (step) {
          const spotlightCat = eventState.tutorialStep >= 5 && eventState.tutorialStep <= 8;
          if (step.type === 'merge_focus') {
            cell.classList.add('tutorial-spotlight');
          } else if (spotlightCat && item.stage === 2) {
            cell.classList.add('tutorial-spotlight');
          } else {
            cell.classList.add('tutorial-dim');
          }
        } else if (isGenMergeTutActive()) {
          // ジェネレーターマージ誘導中: 通常アイテムはすべてディム
          cell.classList.add('tutorial-dim');
        }
        cell.addEventListener('mousedown', (e) => { startEvDrag(e, i); });
        cell.addEventListener('touchstart', (e) => { startEvDragTouch(e, i); }, { passive: false });
      }
    }

    cell.addEventListener('click', () => onEventCellClick(i));
    board.appendChild(cell);
  }
}

// ========================================
// イベントヘッダー・依頼描画
// ========================================
function renderEventHeader() {
  const el = document.getElementById('ev-energy');
  if (el) el.textContent = `⚡${Math.floor(state.energy)}`;
  const ec = document.getElementById('ev-coin');
  if (ec) ec.textContent = `💰${state.coin}`;
  const ed = document.getElementById('ev-diamond');
  if (ed) ed.textContent = `💎${state.diamond}`;
  renderPlayerLevel();
}

// プレイヤーレベルアイコン・ストーリーボタンの表示更新
function renderPlayerLevel() {
  const numEl    = document.getElementById('player-level-num');
  const ringEl   = document.getElementById('player-level-ring');
  const storyBtn = document.getElementById('story-btn');
  if (!numEl || !ringEl) return;

  numEl.textContent = state.playerLevel;

  const xp     = state.playerXP;
  const needed = getLevelUpXP(state.playerLevel);
  const pct    = Math.min(100, (xp / needed) * 100);
  ringEl.style.background =
    `conic-gradient(#f9c846 ${pct}%, #2a3a6a ${pct}%)`;

  if (storyBtn) {
    const cost       = getStoryCost(state.playerLevel);
    const canProgress = state.coin >= cost;
    storyBtn.disabled = !canProgress;
    storyBtn.classList.toggle('story-btn-active', canProgress);
  }
}

// ストーリー進行処理（コイン消費 → 経験値加算 → レベルアップ判定 → シーン再生）
function progressStory() {
  const cost = getStoryCost(state.playerLevel);
  if (state.coin < cost) { showToast('コインが足りません'); return; }
  state.coin    -= cost;
  state.playerXP += cost;

  // レベルアップ判定（複数回上がる場合も対応）
  let leveledUp = false;
  while (state.playerXP >= getLevelUpXP(state.playerLevel)) {
    state.playerXP -= getLevelUpXP(state.playerLevel);
    state.playerLevel++;
    leveledUp = true;
  }
  if (leveledUp) {
    showToast(`プレイヤー Lv${state.playerLevel} になりました！`);
    // レベルアップ時にリングを一瞬フラッシュ
    const ringEl = document.getElementById('player-level-ring');
    if (ringEl) {
      ringEl.classList.add('player-level-up-flash');
      setTimeout(() => ringEl.classList.remove('player-level-up-flash'), 800);
    }
  }

  renderEventHeader();
  openAdventureScene('scene02');
}

// ========================================
// イベントマップ専用 依頼システム
// ========================================

// イベントアイテムのチェーン一致判定（chainId なし = EVENT_CHAIN）
function eventItemMatchesReq(boardItem, reqItem) {
  if (reqItem.chainId !== undefined) {
    // 炎など特定チェーン指定
    return boardItem.chainId === reqItem.chainId && boardItem.stage === reqItem.stage;
  } else {
    // EVENT_CHAIN（メモ帳）指定
    return boardItem.chainId === undefined && boardItem.stage === reqItem.stage;
  }
}

// イベントボード上のアイテムで依頼が達成可能か確認
function eventRequestCompletable(req) {
  const boardCopy = [...eventState.board];
  for (const reqItem of req.items) {
    const idx = boardCopy.findIndex(b =>
      b && !b.isFog && !b.isEventGen && !b.isBubble && eventItemMatchesReq(b, reqItem)
    );
    if (idx === -1) return false;
    boardCopy[idx] = null;
  }
  return true;
}

// イベントボードのアイテムを消費して依頼を完了
function showRewardNearBtn(text, btnEl) {
  const rect = btnEl.getBoundingClientRect();
  const el = document.createElement('div');
  el.textContent = text;
  el.style.cssText = `
    position:fixed;
    left:${rect.left + rect.width / 2}px;
    top:${rect.top - 8}px;
    transform:translate(-50%,-100%);
    background:rgba(10,30,70,0.92);
    color:#fff;
    padding:6px 18px;
    border-radius:20px;
    font-size:14px;
    font-weight:bold;
    pointer-events:none;
    z-index:9999;
    white-space:nowrap;
    animation:toast-pop 2s ease-out forwards;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2100);
}

function completeEventRequest(index) {
  const req = eventState.requests[index];
  if (!req) return;
  if (!eventRequestCompletable(req)) { showToast('該当アイテムがありません'); return; }

  const boardCopy = [...eventState.board];
  for (const reqItem of req.items) {
    const idx = boardCopy.findIndex(b =>
      b && !b.isFog && !b.isEventGen && !b.isBubble && eventItemMatchesReq(b, reqItem)
    );
    if (idx !== -1) {
      eventState.board[idx] = null;
      boardCopy[idx] = null;
    }
  }

  state.coin += req.coin;
  state.requestCompletedTotal++;
  showRewardInPanel(`依頼完了！ 💰+${req.coin.toLocaleString()}`, document.getElementById('event-req-panel'));
  if (state.requestCompletedTotal % 10 === 0) {
    addEnergy(25, `依頼${state.requestCompletedTotal}回達成ボーナス！`);
  }

  // 完了履歴を記録
  const newRecent = new Set();
  for (const it of req.items) {
    const key = it.chainId !== undefined ? `${it.chainId}-${it.stage}` : `ev-${it.stage}`;
    if (it.stage <= 5) {
      eventState.completedLowStages.add(key); // Lv1-5: 永久に再出現しない
    } else {
      newRecent.add(key); // Lv6+: 次の補充で1回スキップ
    }
  }
  eventState.recentlySolvedKeys = newRecent;

  eventState.requests.splice(index, 1);
  fillEventRequests();
  renderEventBoard();
  renderEventRequest();
  renderEventHeader();
}

// イベントマップ専用の依頼を補充
// ・最初の1件（Lv2固定）は transitionToMainGame で事前設定
// ・ここでは Lv3+ かつ同ステージ重複なしで補充
// ・Lv1-5は一度解決したら永久に再出現しない
// ・Lv6以降は1個か2個かランダム（同Lv2個は不可、直前完了キーは1回スキップ）
function fillEventRequests() {
  const MAX_SLOTS = 5;

  // メモ帳ジェネレーターの現在Lv（最も高いものを使う）
  const genItem = eventState.board.find(c => c && c.isEventGen && !c.isFireGen);
  const genLv   = genItem ? (genItem.genLevel ?? 0) : 0;

  // ステージ範囲: 最低 Lv3、最高はジェネレーターLvに応じて伸びる
  const stageMin = Math.max(3, genLv * 2 + 3);
  const stageMax = Math.min(EVENT_CHAIN.stages.length, genLv * 3 + 5);

  // 既存依頼で使用済みのステージキー（重複防止）
  const usedStageKeys = new Set(
    eventState.requests.flatMap(r =>
      r.items.map(it => `${it.chainId ?? 'ev'}-${it.stage}`)
    )
  );
  const usedCharIds = new Set(eventState.requests.map(r => r.characterId));

  // ランダムなステージキーを1つ選ぶ内部ヘルパー
  // 除外条件: usedKeys, completedLowStages, recentlySolvedKeys（Lv6+のみ）
  function pickRandomItem(excludeKeys) {
    for (let t = 0; t < 30; t++) {
      let item;
      // 製造機ジェネレーター解放済みかつLv3以上なら製造機アイテム依頼も混ぜる（30%）
      const seizoAvailable = eventState.fireGenUnlocked && eventState.seizoGenLevel >= 2;
      if (seizoAvailable && Math.random() < 0.3) {
        const maxSeizoStage = Math.min(CHAINS[SEIZO_CHAIN_ID].stages.length, (eventState.seizoGenLevel + 1) * 2);
        const seizoStage = Math.floor(Math.random() * maxSeizoStage) + 1;
        item = { chainId: SEIZO_CHAIN_ID, stage: seizoStage };
      } else {
        if (stageMin > stageMax) continue;
        const stage = Math.floor(Math.random() * (stageMax - stageMin + 1)) + stageMin;
        item = { stage };
      }
      const key = item.chainId !== undefined ? `${item.chainId}-${item.stage}` : `ev-${item.stage}`;
      if (excludeKeys.has(key)) continue;
      if (item.stage <= 2 && tutDone) continue; // チュートリアル後はLv1-2を依頼から除外
      if (eventState.completedLowStages.has(key)) continue; // Lv1-5完了済みはスキップ
      if (item.stage >= 6 && eventState.recentlySolvedKeys.has(key)) continue; // Lv6+連続スキップ
      return { item, key };
    }
    return null;
  }

  const tutDone = eventState.tutorialStep >= TUTORIAL_STEPS.length;
  let retry = 0;
  while (eventState.requests.length < MAX_SLOTS && retry < 40) {
    // 製造機Lv3以上になったら第二章依頼人（id:6-10）も解放
    const maxCharId = (eventState.seizoGenLevel >= 2) ? 10 : 5;
    // チュートリアル後はミユ（id:1）を依頼人から除外
    const available = REQUESTERS.filter(r =>
      r.id <= maxCharId &&
      !usedCharIds.has(r.id) &&
      !(tutDone && r.id === 1)
    );
    if (available.length === 0) break;

    const result1 = pickRandomItem(usedStageKeys);
    if (!result1) { retry++; continue; }
    const { item: reqItem1, key: key1 } = result1;

    const items = [reqItem1];
    let totalCoin = calcCoinReward(reqItem1.stage);

    // Lv6以上かつ50%で2個依頼
    if (reqItem1.stage >= 6 && Math.random() < 0.5) {
      const exclude2 = new Set([...usedStageKeys, key1]);
      const result2 = pickRandomItem(exclude2);
      if (result2) {
        const { item: reqItem2, key: key2 } = result2;
        // 同Lvは不可
        if (reqItem2.stage !== reqItem1.stage) {
          items.push(reqItem2);
          totalCoin += calcCoinReward(reqItem2.stage);
          usedStageKeys.add(key2);
        }
      }
    }

    const char = available[Math.floor(Math.random() * available.length)];
    eventState.requests.push({
      characterId: char.id,
      items,
      coin: totalCoin,
    });
    usedStageKeys.add(key1);
    usedCharIds.add(char.id);
    retry = 0;
  }
}

function renderEventRequest() {
  const panel = document.getElementById('event-req-panel');
  if (!panel) return;
  panel.innerHTML = '';

  const step = currentTutStep();

  // チュートリアル依頼（showRequest フラグ or request_focus フェーズ）
  if (step && (step.showRequest || step.type === 'request_focus')) {
    const hasLv2      = eventState.board.some(c => c && !c.isFog && !c.isEventGen && c.stage === 2);
    const completable = hasLv2 && step.type === 'request_focus';
    const emoji       = EVENT_CHAIN.stages[1];
    const badgeImgSrc = EVENT_CHAIN.stageImages?.[1];
    const badgeIcon   = badgeImgSrc
      ? `<img class="req-item-img" src="${badgeImgSrc}" alt="${emoji}">`
      : emoji;

    const div = document.createElement('div');
    div.className = 'request-slot' + (completable ? ' completable' : '');
    div.innerHTML = `
      <div class="req-char-wrap">
        <img class="req-char-img" src="img/image_merge_order_chara_01.png" alt="依頼人">
      </div>
      <div class="req-slot-frame">
        <div class="req-items">
          <span class="req-item-badge">${badgeIcon}</span>
        </div>
        <div class="req-coin-row">
          <span class="req-coin">💰100</span>
          ${completable ? `<button class="req-complete-btn">依頼解決</button>` : ''}
        </div>
      </div>
    `;
    if (completable) {
      div.querySelector('.req-complete-btn').addEventListener('click', e => {
        e.stopPropagation();
        completeTutorialRequest();
      });
    }
    panel.appendChild(div);
    return;
  }

  // チュートリアル中（依頼不要なステップ）は空表示
  if (!isTutorialComplete()) return;

  // チュートリアル完了後：eventState.requests を表示
  eventState.requests.forEach((req, i) => {
    const character   = REQUESTERS[req.characterId];
    const completable = eventRequestCompletable(req);

    const itemsHtml = req.items.map(reqItem => {
      // chainId あり → メインチェーン画像、なし → EVENT_CHAIN 画像
      let emoji, imgSrc;
      if (reqItem.chainId !== undefined) {
        const chain = CHAINS[reqItem.chainId];
        emoji  = chain.stages[reqItem.stage - 1] || '❓';
        imgSrc = chain.stageImages?.[reqItem.stage - 1];
      } else {
        emoji  = EVENT_CHAIN.stages[reqItem.stage - 1] || '❓';
        imgSrc = EVENT_CHAIN.stageImages?.[reqItem.stage - 1];
      }
      const icon = imgSrc
        ? `<img class="req-item-img" src="${imgSrc}" alt="${emoji}">`
        : emoji;
      return `<span class="req-item-badge">${icon}</span>`;
    }).join('');

    // charImg が直接指定されている場合（最初の依頼など）を優先
    const charHtml = req.charImg
      ? `<img class="req-char-img" src="${req.charImg}" alt="依頼人">`
      : (character?.img
        ? `<img class="req-char-img" src="${character.img}" alt="${character.name}">`
        : `<div class="req-char-figure">${character?.emoji || '👤'}</div>`);

    const div = document.createElement('div');
    div.className = 'request-slot' + (completable ? ' completable' : '');
    div.innerHTML = `
      <div class="req-char-wrap">${charHtml}</div>
      <div class="req-slot-frame">
        <div class="req-items">${itemsHtml}</div>
        <div class="req-coin-row">
          <span class="req-coin">💰${req.coin.toLocaleString()}</span>
          ${completable ? `<button class="req-complete-btn">依頼解決</button>` : ''}
        </div>
      </div>
    `;
    if (completable) {
      div.querySelector('.req-complete-btn').addEventListener('click', e => {
        e.stopPropagation();
        completeEventRequest(i);
      });
    }
    panel.appendChild(div);
  });
}

// ========================================
// ========================================
// モバイル用ジェネレーター2タップシステム
// ========================================
// 統一ジェネレータータップハンドラー
// 1回目タップ → 選択、2回目タップ（選択中）→ アイテム生成
// チュートリアル中・マージ操作は別処理
// ========================================
function handleAnyGenTap(i) {
  const item = eventState.board[i];
  if (!item || !item.isEventGen) return;
  const isFireGen = item.isFireGen;

  // メインチュートリアル中（gen_focus）→ 選択なしで直接生成
  const step = currentTutStep();
  if (step) {
    if (!isFireGen) onEventGenTap(i);
    return;
  }

  // ジェネレーターマージチュートリアル中（メモ帳のみ）
  if (!isFireGen && isGenMergeTutActive()) {
    if (eventState.selectedCell !== null && eventState.selectedCell !== i) {
      const selItem = eventState.board[eventState.selectedCell];
      if (selItem && selItem.isEventGen && !selItem.isFireGen &&
          (selItem.genLevel ?? 0) === (item.genLevel ?? 0)) {
        mergeEventGenerators(eventState.selectedCell, i);
        eventState.selectedCell = null;
        return;
      }
    }
    eventState.selectedCell = (eventState.selectedCell === i) ? null : i;
    renderEventBoard();
    return;
  }

  // 他のジェネレーターが選択中 → マージ判定
  if (eventState.selectedCell !== null && eventState.selectedCell !== i) {
    const selItem = eventState.board[eventState.selectedCell];
    if (selItem && selItem.isEventGen) {
      if (!isFireGen && !selItem.isFireGen &&
          (selItem.genLevel ?? 0) === (item.genLevel ?? 0)) {
        mergeEventGenerators(eventState.selectedCell, i);
        eventState.selectedCell = null;
        return;
      }
      if (isFireGen && selItem.isFireGen &&
          (selItem.seizoLevel ?? 0) === (item.seizoLevel ?? 0)) {
        mergeFireGenerators(eventState.selectedCell, i);
        eventState.selectedCell = null;
        return;
      }
    }
    // 種類違い or レベル違いなら選択切替
    eventState.selectedCell = i;
    if (isFireGen) showNaviHintForFireGen(item, true);
    else           showNaviHintForGen(item.genLevel ?? 0, true);
    renderEventBoard();
    return;
  }

  // 2タップ：選択中→生成（選択・ナビヒント維持） / 未選択→選択
  if (eventState.selectedCell === i) {
    // 選択はそのまま・ナビヒントも維持して生成
    if (isFireGen) onEventFireGenTap(i);
    else           onEventGenTap(i);
  } else {
    eventState.selectedCell = i;
    if (isFireGen) showNaviHintForFireGen(item, true);
    else           showNaviHintForGen(item.genLevel ?? 0, true);
    renderEventBoard();
  }
}

// 後方互換ラッパー
function handleGenTapMobile(i)     { handleAnyGenTap(i); }
function handleFireGenTapMobile(i) { handleAnyGenTap(i); }

// ジェネレータータップ
// ジェネレーターセルから最も近い空きセルを返す（Manhattanデイスタンス）
function findNearestEmptyEventCell(fromIdx) {
  const COLS = 7;
  const fromRow = Math.floor(fromIdx / COLS);
  const fromCol = fromIdx % COLS;
  let bestIdx = -1;
  let bestDist = Infinity;
  eventState.board.forEach((cell, i) => {
    if (cell !== null) return;
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    const dist = Math.abs(row - fromRow) + Math.abs(col - fromCol);
    if (dist < bestDist) { bestDist = dist; bestIdx = i; }
  });
  return bestIdx;
}

// ========================================
// tappedCellIdx: タップされたジェネレーターセルのインデックス（アニメーション始点）
function onEventGenTap(tappedCellIdx = null) {
  const step = currentTutStep();

  // チュートリアル中: gen_focusフェーズのみ許可
  if (step && step.type !== 'gen_focus') return;
  if (step && eventState.tutorialGenTaps >= 2) return;

  // チュートリアル中は powerLevel 0 固定、通常時はプレイヤー選択の genPowerLevel を使用
  const powerLv    = step ? 0 : eventState.genPowerLevel;
  const cfg        = POWER_CONFIG[powerLv] ?? POWER_CONFIG[0];
  const outStage   = cfg.startStage;
  const energyCost = POWER_COSTS[powerLv] ?? 1;

  // チュートリアル中は Lv1 固定・体力消費 1
  const baseCost = step ? 1 : energyCost;
  if (!debugState.infiniteEnergy && state.energy < baseCost) { showToast(`体力が足りません（必要: ${baseCost}）`); return; }

  // アニメーション始点: タップされたセル（不明なら最初のジェネレーターセル）
  const animFrom = tappedCellIdx !== null
    ? tappedCellIdx
    : eventState.board.findIndex(c => c && c.isEventGen && !c.isFireGen);

  const emptyIdx = animFrom !== -1 ? findNearestEmptyEventCell(animFrom) : eventState.board.findIndex(c => c === null);
  if (emptyIdx === -1) { showCellToast('ボードが満杯です', animFrom !== -1 ? animFrom : null, true); return; }

  // Power → Lucky の順で判定（チュートリアル中はスキップ）
  let finalStage = step ? 1 : outStage;
  let isLucky = false, isPower = false;
  if (!step) {
    const evMaxStage = EVENT_CHAIN.stages.length;
    const powerStage = rollPower(powerLv, evMaxStage);
    if (powerStage !== null) {
      finalStage = powerStage;
      isPower = true;
    } else if (outStage >= 2) { // Lv1出力時はLucky不可
      const luckyMult = rollLucky(powerLv);
      if (luckyMult !== null) {
        const ls = Math.min(Math.floor(outStage * luckyMult), evMaxStage);
        if (ls > outStage) { finalStage = ls; isLucky = true; }
      }
    }
  }

  if (!debugState.infiniteEnergy) state.energy -= baseCost;
  eventState.board[emptyIdx] = { stage: finalStage };
  discoverEventItem(finalStage);

  // アイテム飛び出しアニメーション
  const stageContent = EVENT_CHAIN.stageImages?.[finalStage - 1] || EVENT_CHAIN.stages[finalStage - 1];
  const genShowIdx = animFrom !== -1 ? animFrom : emptyIdx;
  flyEventItemAnimation(genShowIdx, emptyIdx, stageContent);
  if (isPower) showPowerOnCell(genShowIdx, 'event-board');
  else if (isLucky) showLuckyOnCell(genShowIdx, 'event-board');

  if (step && step.type === 'gen_focus') {
    eventState.tutorialGenTaps++;
    if (eventState.tutorialGenTaps >= 2) {
      setTimeout(() => advanceTutorial(), 450);
    }
  }

  renderEventHeader();
  renderEventBoard();
  renderEventRequest();
}

// イベントボード専用：アイテム飛び出しアニメーション
function flyEventItemAnimation(fromIdx, toIdx, emoji) {
  const cells    = document.querySelectorAll('#event-board .cell');
  const fromCell = cells[fromIdx];
  const toCell   = cells[toIdx];
  if (!fromCell || !toCell) return;

  const fromRect = fromCell.getBoundingClientRect();
  const toRect   = toCell.getBoundingClientRect();

  const startX = fromRect.left + fromRect.width  / 2;
  const startY = fromRect.top  + fromRect.height / 2;
  const endX   = toRect.left   + toRect.width    / 2;
  const endY   = toRect.top    + toRect.height   / 2;

  const dist      = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
  const arcHeight = Math.max(40, dist * 0.45);
  const cpX = (startX + endX) / 2;
  const cpY = (startY + endY) / 2 - arcHeight;

  const el = document.createElement('div');
  const isImg = typeof emoji === 'string' && emoji.startsWith('img/');
  if (isImg) {
    const img = document.createElement('img');
    img.src = emoji;
    img.style.cssText = 'width:52px;height:52px;object-fit:contain;display:block;';
    el.appendChild(img);
  } else {
    el.textContent = emoji;
  }
  el.style.cssText = `
    position: fixed;
    left: 0; top: 0;
    font-size: ${isImg ? '0' : '28px'};
    line-height: 1;
    pointer-events: none;
    z-index: 200;
    opacity: 0;
    will-change: transform, opacity;
  `;
  document.body.appendChild(el);

  const DURATION = 350;
  const startTime = performance.now();

  function animate(now) {
    const raw = Math.min((now - startTime) / DURATION, 1);

    const x = (1 - raw) * (1 - raw) * startX + 2 * (1 - raw) * raw * cpX + raw * raw * endX;
    const y = (1 - raw) * (1 - raw) * startY + 2 * (1 - raw) * raw * cpY + raw * raw * endY;

    const scale = raw < 0.4
      ? 0.5 + raw * 2.5
      : 1.5 - (raw - 0.4) * 1.2;

    const opacity = raw < 0.15
      ? raw / 0.15
      : raw > 0.75
        ? (1 - raw) / 0.25
        : 1;

    el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`;
    el.style.opacity   = opacity;

    if (raw < 1) requestAnimationFrame(animate);
    else         el.remove();
  }

  requestAnimationFrame(animate);
}

// ========================================
// セルクリック
// ========================================
function onEventCellClick(index) {
  // ドラッグ直後のクリックイベント（タッチ→クリック二重発火）をブロック
  if (evDrag.tapHandled) { evDrag.tapHandled = false; return; }

  const item = eventState.board[index];

  // ジェネレーターマージ誘導チュートリアル中の制御
  if (isGenMergeTutActive()) {
    const gmStep = currentGenMergeTutStep();
    if (!gmStep) { /* 完了直後 */ }
    else if (gmStep.type === 'msg') {
      // メッセージ中はタップで次へ進める（オーバーレイタップも同様）
      advanceGenMergeTut();
      return;
    } else if (gmStep.type === 'focus') {
      // focus: 空白セルタップは無視
      if (!item) return;
      // ジェネレータータイル以外は操作不可
      if (!item.isEventGen || item.isFireGen) return;
      // ジェネレータータイルの選択・マージは通常ロジックに流す
    }
  }

  if (!item) {
    hideNaviHint();
    eventState.selectedCell = null;
    renderEventBoard();
    return;
  }

  if (item.isEventGen) {
    if (evDrag.tapHandled) { evDrag.tapHandled = false; return; }
    handleAnyGenTap(index);
    return;
  }

  // チュートリアル中: 霧アイテムは操作不可、merge_focus のみ通常アイテム操作許可
  const step = currentTutStep();
  if (step) {
    if (item.isFog) return; // 霧はチュートリアル中は触れない
    if (step.type !== 'merge_focus') return;
  }

  // 霧アイテムはタップ操作一切不可
  if (item.isFog) return;

  // しゃぼん玉アイテムのタップ → ダイヤボタン表示
  if (item.isBubble) {
    eventState.selectedCell = index;
    showNaviHintForBubble(item);
    renderEventBoard();
    return;
  }

  // コインアイテムのタップ / ダブルタップ
  if (item.isCoin) {
    const now = Date.now();
    if (now - lastCoinTapTime < 400 && lastCoinTapIdx === index) {
      // ダブルタップ: コイン獲得してアイテム消去
      const reward = COIN_REWARD[item.coinLv ?? 1] ?? 0;
      state.coin += reward;
      eventState.board[index] = null;
      eventState.selectedCell = null;
      hideNaviHint();
      showToast(`💰 +${reward}`);
      renderEventBoard();
      renderEventHeader();
      lastCoinTapTime = 0; lastCoinTapIdx = -1;
      return;
    }
    lastCoinTapTime = now; lastCoinTapIdx = index;
    // シングルタップ: 選択 + ナビヒント
    if (eventState.selectedCell !== null && eventState.selectedCell !== index) {
      const sel = eventState.board[eventState.selectedCell];
      if (sel && evItemCanMerge(sel, item)) {
        doEventMerge(eventState.selectedCell, index);
        return;
      }
    }
    eventState.selectedCell = index;
    showNaviHintForCoin(item);
    renderEventBoard();
    return;
  }

  if (eventState.selectedCell !== null && eventState.selectedCell !== index) {
    const sel = eventState.board[eventState.selectedCell];
    if (sel && evItemCanMerge(sel, item)) {
      doEventMerge(eventState.selectedCell, index);
      return;
    }
    // 別アイテムへ選択切替 + ナビヒント更新
    eventState.selectedCell = index;
    if (!item.isFog) showNaviHintForItem(item, true);
    renderEventBoard();
    return;
  }

  if (eventState.selectedCell === index) {
    // 同じアイテムをタップ → 選択・ナビヒント維持（ジェネレーターと同仕様）
    return;
  }

  // 新しいアイテムを選択 + ナビヒント表示
  eventState.selectedCell = index;
  if (!item.isFog) showNaviHintForItem(item, true);
  renderEventBoard();
}

// チュートリアル依頼解決
function completeTutorialRequest() {
  const idx = eventState.board.findIndex(c => c && !c.isFog && !c.isEventGen && c.stage === 2);
  if (idx === -1) { showToast('アイテムがありません'); return; }
  eventState.board[idx] = null;
  state.coin += 100;
  showToastNearPanel('依頼完了！ 💰+100', document.getElementById('event-req-panel'));
  renderEventHeader();
  renderEventBoard();
  advanceTutorial();
}

// 霧セルがマージされた後、隣接する霧セルをアンロック
function unlockAdjacentFogCells(idx) {
  const col = idx % EVENT_COLS;
  const candidates = [];
  if (idx >= EVENT_COLS)              candidates.push(idx - EVENT_COLS); // 上
  if (idx < EVENT_TOTAL - EVENT_COLS) candidates.push(idx + EVENT_COLS); // 下
  if (col > 0)                        candidates.push(idx - 1);           // 左
  if (col < EVENT_COLS - 1)           candidates.push(idx + 1);           // 右
  for (const n of candidates) {
    if (eventState.board[n] && eventState.board[n].isFog) {
      eventState.unlockedFogCells.add(n);
    }
  }
}

// マージ処理（共通）
function doEventMerge(fromIdx, toIdx) {
  const fromItem = eventState.board[fromIdx];
  const toItem   = eventState.board[toIdx];

  // ── コインマージの特別処理 ──
  if (fromItem.isCoin && toItem?.isCoin) {
    const newLv = Math.min((fromItem.coinLv ?? 1) + 1, COIN_MAX_LV);
    eventState.board[toIdx]   = { isCoin: true, coinLv: newLv };
    eventState.board[fromIdx] = null;
    eventState.selectedCell   = null;
    hideNaviHint();
    setTimeout(() => {
      const cells = document.querySelectorAll('#event-board .cell');
      cells[toIdx]?.classList.add('merge-pop');
      setTimeout(() => cells[toIdx]?.classList.remove('merge-pop'), 300);
    }, 10);
    renderEventBoard();
    return;
  }

  // chainId 継承（片方が霧アイテムでも chainId は引き継ぐ）
  // 霧アイテムは chainId なし（EVENT_CHAIN）、炎アイテムは chainId:0
  const chainId = fromItem.chainId ?? toItem?.chainId;

  const nextStage = fromItem.stage + 1;
  const maxStage  = chainId !== undefined ? CHAINS[chainId].stages.length : EVENT_CHAIN.stages.length;

  if (nextStage > maxStage) {
    showToast('最大レベルです');
    eventState.selectedCell = null;
    renderEventBoard();
    return;
  }

  // 結果アイテム（霧フラグなし＝通常アイテム）
  const toWasFog = !!toItem?.isFog;
  const tutStepNow = currentTutStep();
  // 第一章Lv1はアップもしゃぼん玉もしない
  const isLv1Ch1 = chainId === undefined && nextStage === 1;

  // 5%〜10%の確率でワンランクアップ（Lv1/チュートリアル/霧マージは除外）
  let finalStage = nextStage;
  if (!tutStepNow && !isGenMergeTutActive() && !toWasFog && !isLv1Ch1) {
    const upProb = 0.05 + Math.random() * 0.05;
    if (Math.random() < upProb) {
      const up = Math.min(nextStage + 1, maxStage);
      if (up > nextStage) finalStage = up;
    }
  }

  eventState.board[toIdx]   = chainId !== undefined ? { chainId, stage: finalStage } : { stage: finalStage };
  eventState.board[fromIdx] = null;
  eventState.selectedCell   = null;
  // 霧セルがマージされたら隣接霧セルをアンロック
  if (toWasFog) unlockAdjacentFogCells(toIdx);

  if (chainId === undefined) {
    discoverEventItem(finalStage);
    if (finalStage !== nextStage) discoverEventItem(nextStage);

    // Lv4/8/12 初回到達でジェネレーター2枚目タイルを自動出現（ベースnextStageで判定）
    if ((nextStage === 4 || nextStage === 8 || nextStage === 12) &&
        !eventState.genUpTriggered.has(nextStage)) {
      eventState.genUpTriggered.add(nextStage); // 同じステージでは二度と出現しない
      const genTileCount = eventState.board.filter(c => c && c.isEventGen && !c.isFireGen).length;
      if (genTileCount < 2) {
        const curGenLv  = eventState.board.find(c => c && c.isEventGen && !c.isFireGen)?.genLevel ?? 0;
        const emptyIdx2 = eventState.board.findIndex(c => c === null);
        if (emptyIdx2 !== -1) {
          eventState.board[emptyIdx2] = { isEventGen: true, genLevel: curGenLv };
          // 初回（nextStage===4）のみマージ誘導チュートリアルを起動
          if (nextStage === 4) {
            hideNaviHint(); // Lv1×2出現時にナビヒントを消す
            setTimeout(() => startGenMergeTut(), 400);
          } else {
            showToast('ジェネレーターが2枚出現！重ねてLvアップ！');
          }
        }
      }
    }

    // Lv8 到達で製造機ジェネレーター解放（ベースnextStageで判定）
    if (nextStage === 8 && !eventState.fireGenUnlocked) {
      unlockFireGenerator();
    }
  }

  // 製造機アイテム（第二章）の発見トラッキングとLvアップ判定
  if (chainId === SEIZO_CHAIN_ID) {
    discoverSeizoItem(finalStage); // 内部で checkSeizoGenLevelUp も呼ぶ
  }

  // 5%〜10%の確率でしゃぼん玉アイテムを追加出現（Lv1/チュートリアル/霧マージは除外）
  const bubbleProb = 0.05 + Math.random() * 0.05;
  if (!tutStepNow && !isGenMergeTutActive() && !toWasFog && !isLv1Ch1 && Math.random() < bubbleProb) {
    const bubbleSlot = findNearestEmptyEventCell(toIdx);
    if (bubbleSlot !== -1) {
      eventState.board[bubbleSlot] = chainId !== undefined
        ? { chainId, stage: finalStage, isBubble: true, bubbleTimestamp: Date.now() }
        : { stage: finalStage, isBubble: true, bubbleTimestamp: Date.now() };
    }
  }

  setTimeout(() => {
    const cells = document.querySelectorAll('#event-board .cell');
    cells[toIdx]?.classList.add('merge-pop');
    setTimeout(() => cells[toIdx]?.classList.remove('merge-pop'), 300);
  }, 10);

  const step = currentTutStep();
  if (step && step.type === 'merge_focus') {
    setTimeout(() => advanceTutorial(), 500);
  }

  renderEventBoard();
  renderEventGenerators();
  renderEventRequest(); // 依頼達成可否を更新
}

// ========================================
// イベントジェネレーターパネル描画
// ========================================
function renderEventGenerators() {
  const container = document.getElementById('event-generators');
  if (!container) return;
  container.innerHTML = '';
  // 現在はボード上のタイルマージでLvアップする方式のため、パネルは空で問題なし
}

// ========================================
// イベントジェネレータータイルのマージ（Lvアップ）
// ========================================
function mergeEventGenerators(fromIdx, toIdx) {
  const toItem  = eventState.board[toIdx];
  const newLevel = (toItem.genLevel ?? 0) + 1;
  eventState.board[toIdx]   = { isEventGen: true, genLevel: newLevel };
  eventState.board[fromIdx] = null;
  eventState.selectedCell   = null;
  discoverGen('ch1', newLevel); // Lvアップで新レベルを発見
  showCellToast(`第一章ジェネレーター Lv${newLevel + 1} にレベルアップ！`, toIdx, true);
  state.energy += 25; renderHeader();
  showAboveNaviToast('⚡ +25 ジェネレーターLvアップボーナス！');
  // Lvアップ時に出力Lvを自動で新しい最大値に設定
  eventState.genPowerLevel = getGenMaxAvailablePowerLv(newLevel);
  // ジェネレーターマージ誘導チュートリアルのフォーカスステップを完了
  if (eventState.genMergeTutStep === 0) {
    setTimeout(() => advanceGenMergeTut(), 400);
  }

  setTimeout(() => {
    const cells = document.querySelectorAll('#event-board .cell');
    cells[toIdx]?.classList.add('merge-pop');
    setTimeout(() => cells[toIdx]?.classList.remove('merge-pop'), 300);
  }, 10);

  // Lvアップで依頼ステージ上限が上がるので再補充
  fillEventRequests();
  renderEventBoard();
  renderEventGenerators();
  renderEventRequest();
  renderEventHeader();
}

// 製造機ジェネレーター解放（メモ帳アイテムLv8到達時）
function unlockFireGenerator() {
  eventState.fireGenUnlocked = true;
  eventState.seizoGenLevel   = 0; // Lv1からスタート
  const emptyIdx = eventState.board.findIndex(c => c === null);
  if (emptyIdx === -1) { showToast('ボードが満杯で第二章ジェネレーターを配置できません'); return; }
  eventState.board[emptyIdx] = { isEventGen: true, isFireGen: true, seizoLevel: 0 };
  discoverGen('ch2', 0); // Lv1 を発見
  showToast('第二章ジェネレーター解放！');
  renderEventBoard();
  renderEventRequest();
}

// 製造機ジェネレーターLvアップ判定（マージ用タイルを追加配置）
function checkSeizoGenLevelUp(discoveredStage) {
  for (const trig of SEIZO_GEN_LEVELUP_TRIGGERS) {
    if (discoveredStage === trig.triggerStage &&
        !eventState.seizoLvTriggered.has(trig.triggerStage)) {
      // 既存の製造機タイルを探す
      const existingIdx = eventState.board.findIndex(c => c && c.isFireGen);
      if (existingIdx === -1) break;
      const existingTile = eventState.board[existingIdx];
      const currentLv = existingTile.seizoLevel ?? 0;
      // 同Lvの複製タイルを近くに配置（マージして昇格させる）
      const emptyIdx = findNearestEmptyEventCell(existingIdx);
      if (emptyIdx === -1) { showCellToast('ボードが満杯です', existingIdx, true); break; }
      eventState.board[emptyIdx] = { isEventGen: true, isFireGen: true, seizoLevel: currentLv };
      eventState.seizoLvTriggered.add(trig.triggerStage);
      showToast('第二章ジェネレータータイルが増えた！マージしてLvアップ！');
      renderEventBoard();
      break;
    }
  }
}

// ========================================
// 製造機ジェネレータータイル同士のマージ（Lvアップ）
// ========================================
function mergeFireGenerators(fromIdx, toIdx) {
  const toItem   = eventState.board[toIdx];
  const newLevel = (toItem.seizoLevel ?? 0) + 1;
  const maxLevel = SEIZO_GEN_IMAGES.length - 1;
  if (newLevel > maxLevel) { showToast('第二章ジェネレーターは最大レベルです'); return; }
  eventState.board[toIdx]   = { isEventGen: true, isFireGen: true, seizoLevel: newLevel };
  eventState.board[fromIdx] = null;
  eventState.selectedCell   = null;
  // グローバルレベルも最高値に更新
  eventState.seizoGenLevel = Math.max(eventState.seizoGenLevel, newLevel);
  discoverGen('ch2', newLevel); // Lvアップで新レベルを発見
  showCellToast(`第二章ジェネレーター Lv${newLevel + 1} にレベルアップ！`, toIdx, true);
  addEnergy(25, '第二章ジェネレーターLvアップボーナス！');
  // Lvアップ時に出力Lvを自動で新しい最大値に設定
  eventState.firePowerLevel = getFireGenMaxAvailablePowerLv(newLevel);

  setTimeout(() => {
    const cells = document.querySelectorAll('#event-board .cell');
    cells[toIdx]?.classList.add('merge-pop');
    setTimeout(() => cells[toIdx]?.classList.remove('merge-pop'), 300);
  }, 10);

  fillEventRequests();
  renderEventBoard();
  renderEventRequest();
  renderEventHeader();
}

// 製造機ジェネレータータップ（tappedCellIdx: タップされたセルのインデックス）
function onEventFireGenTap(tappedCellIdx = null) {
  // firePowerLevel に応じた出力設定
  const powerLv    = eventState.firePowerLevel;
  const cfg        = FIRE_POWER_CONFIG[powerLv] ?? FIRE_POWER_CONFIG[0];
  const outStage   = cfg.outStage;
  const energyCost = POWER_COSTS[powerLv] ?? 1;

  if (!debugState.infiniteEnergy && state.energy < energyCost) {
    showToast(`体力が足りません（必要: ${energyCost}）`);
    return;
  }

  // 空きセル確認
  if (eventState.board.every(c => c !== null)) {
    const fireGenIdx = tappedCellIdx !== null ? tappedCellIdx : eventState.board.findIndex(c => c && c.isEventGen && c.isFireGen);
    showCellToast('ボードが満杯です', fireGenIdx, true);
    return;
  }

  const animFrom = tappedCellIdx !== null
    ? tappedCellIdx
    : eventState.board.findIndex(c => c && c.isEventGen && c.isFireGen);

  // Power → Lucky の順で判定
  const chain = CHAINS[SEIZO_CHAIN_ID];
  let finalStage = outStage;
  let isLucky = false, isPower = false;

  const powerStage = rollPower(powerLv, chain.stages.length);
  if (powerStage !== null) {
    finalStage = powerStage;
    isPower = true;
  } else {
    const luckyMult = rollLucky(powerLv);
    if (luckyMult !== null) {
      const ls = Math.min(Math.floor(outStage * luckyMult), chain.stages.length);
      if (ls > outStage) { finalStage = ls; isLucky = true; }
    }
  }

  if (!debugState.infiniteEnergy) state.energy -= energyCost;

  const slot = animFrom !== -1 ? findNearestEmptyEventCell(animFrom) : eventState.board.findIndex(c => c === null);
  if (slot !== -1) {
    eventState.board[slot] = { chainId: SEIZO_CHAIN_ID, stage: finalStage };
    discoverSeizoItem(finalStage); // 生成時に発見登録
    const imgSrc = chain.stageImages?.[finalStage - 1];
    flyEventItemAnimation(animFrom !== -1 ? animFrom : slot, slot, imgSrc || chain.stages[finalStage - 1]);
  }
  const genShowIdx = animFrom !== -1 ? animFrom : (slot !== -1 ? slot : 0);
  if (isPower) showPowerOnCell(genShowIdx, 'event-board');
  else if (isLucky) showLuckyOnCell(genShowIdx, 'event-board');

  renderEventHeader();
  renderEventBoard();
  renderEventRequest();
}

// ========================================
// ドラッグ＆ドロップ
// ========================================
function startEvDrag(e, fromIdx) {
  const item = eventState.board[fromIdx];
  if (!item || item.isFog) return; // 霧アイテムはドラッグ元にならない

  // ジェネレーターマージ誘導チュートリアル中の制御
  if (isGenMergeTutActive()) {
    const gmStep = currentGenMergeTutStep();
    if (!gmStep || gmStep.type === 'msg') return; // メッセージ中は全操作不可
    // focus ステップ: ジェネレータータイルのドラッグのみ許可
    if (!item.isEventGen || item.isFireGen) return;
  }

  const step = currentTutStep();
  if (step) {
    if (step.type === 'blocking_msg') return;
    if (step.type === 'request_focus') return;
    if (step.type === 'gen_focus') {
      // gen_focus: ジェネレーターはタップ扱い、アイテムはブロック
      if (item.isEventGen) { onEventGenTap(fromIdx); return; }
      return;
    }
    if (step.type === 'merge_focus' && item.isEventGen) return;
  }

  // ドラッグ開始時にナビヒントを表示（選択状態は変更しない）
  if (item.isEventGen) {
    if (item.isFireGen) showNaviHintForFireGen(item, true);
    else showNaviHintForGen(item.genLevel ?? 0, true);
  } else if (item.isBubble) {
    showNaviHintForBubble(item);
  } else if (item.isCoin) {
    showNaviHintForCoin(item);
  } else if (!item.isFog) {
    showNaviHintForItem(item, true);
  }

  e.preventDefault();
  evDrag.active = true;
  evDrag.fromIdx = fromIdx;
  evDrag.tapHandled = false;
  evDrag.startX = e.clientX;
  evDrag.startY = e.clientY;
  evDrag.hasMoved = false;
  createEvGhost(e.clientX, e.clientY, fromIdx);
  document.addEventListener('mousemove', onEvDragMove);
  document.addEventListener('mouseup', onEvDragEnd);
}

function startEvDragTouch(e, fromIdx) {
  const item = eventState.board[fromIdx];
  if (!item || item.isFog) return; // 霧アイテムはドラッグ元にならない

  // ジェネレーターマージ誘導チュートリアル中の制御
  if (isGenMergeTutActive()) {
    const gmStep = currentGenMergeTutStep();
    if (!gmStep || gmStep.type === 'msg') return;
    if (!item.isEventGen || item.isFireGen) return;
  }

  const step = currentTutStep();
  if (step) {
    if (step.type === 'blocking_msg') return;
    if (step.type === 'request_focus') return;
    if (step.type === 'gen_focus') return;
    if (step.type === 'merge_focus' && item.isEventGen) return;
  }

  // ドラッグ開始時にナビヒントを表示（選択状態は変更しない）
  if (item.isEventGen) {
    if (item.isFireGen) showNaviHintForFireGen(item, true);
    else showNaviHintForGen(item.genLevel ?? 0, true);
  } else if (item.isBubble) {
    showNaviHintForBubble(item);
  } else if (item.isCoin) {
    showNaviHintForCoin(item);
  } else if (!item.isFog) {
    showNaviHintForItem(item, true);
  }

  e.preventDefault();
  evDrag.active = true;
  evDrag.fromIdx = fromIdx;
  evDrag.tapHandled = false;
  const t = e.touches[0];
  evDrag.startX = t.clientX;
  evDrag.startY = t.clientY;
  evDrag.hasMoved = false;
  createEvGhost(t.clientX, t.clientY, fromIdx);
  document.addEventListener('touchmove', onEvDragMoveTouch, { passive: false });
  document.addEventListener('touchend', onEvDragEndTouch);
  document.addEventListener('touchcancel', onEvDragEndTouch);
}

function createEvGhost(x, y, fromIdx) {
  const item = eventState.board[fromIdx];
  const ghost = document.createElement('div');
  ghost.id = 'ev-drag-ghost';
  ghost.style.cssText = `
    position:fixed; pointer-events:none; z-index:999;
    opacity:0.85;
    transform:translate(-50%,-50%);
    left:${x}px; top:${y}px;
  `;

  // 画像があれば画像、なければ絵文字
  let imgSrc = null;
  let fallbackEmoji = '❓';
  if (item.isCoin) {
    const lv = item.coinLv ?? 1;
    imgSrc = COIN_IMAGES[lv] ?? null;
    fallbackEmoji = COIN_EMOJI[lv] ?? '🪙';
  } else if (item.isEventGen && item.isFireGen) {
    const sLv = item.seizoLevel ?? 0;
    imgSrc = SEIZO_GEN_IMAGES[Math.min(sLv, SEIZO_GEN_IMAGES.length - 1)];
  } else if (item.isEventGen) {
    imgSrc = EVENT_GEN_IMAGES[Math.min(item.genLevel ?? 0, EVENT_GEN_IMAGES.length - 1)];
  } else if (item.chainId !== undefined) {
    const chain = CHAINS[item.chainId];
    imgSrc = chain.stageImages?.[item.stage - 1] ?? null;
    fallbackEmoji = chain.stages[item.stage - 1] || '❓';
  } else {
    imgSrc = EVENT_CHAIN.stageImages?.[item.stage - 1] || null;
    fallbackEmoji = EVENT_CHAIN.stages[item.stage - 1] || '❓';
  }

  if (imgSrc) {
    const img = document.createElement('img');
    img.src = imgSrc;
    img.style.cssText = 'width:52px;height:52px;object-fit:contain;display:block;';
    ghost.appendChild(img);
  } else {
    ghost.textContent = fallbackEmoji;
    ghost.style.fontSize = '36px';
  }

  document.body.appendChild(ghost);
  evDrag.ghost = ghost;
}

function onEvDragMove(e) {
  if (!evDrag.ghost) return;
  if (!evDrag.hasMoved) {
    const dx = e.clientX - evDrag.startX, dy = e.clientY - evDrag.startY;
    if (dx * dx + dy * dy > 25) evDrag.hasMoved = true; // 5px閾値
  }
  evDrag.ghost.style.left = e.clientX + 'px';
  evDrag.ghost.style.top  = e.clientY + 'px';
  highlightEvDropTarget(e.clientX, e.clientY);
}

function onEvDragMoveTouch(e) {
  e.preventDefault();
  if (!evDrag.ghost) return;
  const t = e.touches[0];
  if (!evDrag.hasMoved) {
    const dx = t.clientX - evDrag.startX, dy = t.clientY - evDrag.startY;
    if (dx * dx + dy * dy > 25) evDrag.hasMoved = true; // 5px閾値
  }
  evDrag.ghost.style.left = t.clientX + 'px';
  evDrag.ghost.style.top  = t.clientY + 'px';
  highlightEvDropTarget(t.clientX, t.clientY);
}

function onEvDragEnd(e) {
  endEvDrag(e.clientX, e.clientY);
  document.removeEventListener('mousemove', onEvDragMove);
  document.removeEventListener('mouseup', onEvDragEnd);
}

function onEvDragEndTouch(e) {
  const t = e.changedTouches?.[0];
  if (t) endEvDrag(t.clientX, t.clientY);
  else { if (evDrag.ghost) { evDrag.ghost.remove(); evDrag.ghost = null; } evDrag.active = false; evDrag.fromIdx = null; document.querySelectorAll('#event-board .cell').forEach(c => c.classList.remove('drop-over')); }
  document.removeEventListener('touchmove', onEvDragMoveTouch);
  document.removeEventListener('touchend', onEvDragEndTouch);
  document.removeEventListener('touchcancel', onEvDragEndTouch);
}

function highlightEvDropTarget(x, y) {
  document.querySelectorAll('#event-board .cell').forEach(c => c.classList.remove('drop-over'));
  const idx = getEvCellIndexAt(x, y);
  if (idx !== null && idx !== evDrag.fromIdx) {
    document.querySelectorAll('#event-board .cell')[idx]?.classList.add('drop-over');
  }
}

function getEvCellIndexAt(x, y) {
  const cells = document.querySelectorAll('#event-board .cell');
  for (const cell of cells) {
    const rect = cell.getBoundingClientRect();
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return parseInt(cell.dataset.index);
    }
  }
  return null;
}

function endEvDrag(x, y) {
  if (evDrag.ghost) { evDrag.ghost.remove(); evDrag.ghost = null; }
  if (!evDrag.active) return;

  const toIdx   = getEvCellIndexAt(x, y);
  const fromIdx = evDrag.fromIdx;
  evDrag.active  = false;
  evDrag.fromIdx = null;
  document.querySelectorAll('#event-board .cell').forEach(c => c.classList.remove('drop-over'));

  // 同一セルへのドロップ = タップ相当
  if (toIdx === null || toIdx === fromIdx) {
    const item = eventState.board[fromIdx];
    evDrag.tapHandled = true; // 後続clickをブロック（全ケース）

    if (item && item.isEventGen) {
      // ジェネレーターマージチュートリアル中（第一章のみ）は選択のみ
      if (!item.isFireGen && isGenMergeTutActive()) {
        eventState.selectedCell = (eventState.selectedCell === fromIdx) ? null : fromIdx;
        renderEventBoard();
        return;
      }
      handleAnyGenTap(fromIdx);
      return;
    }

    // 通常アイテムのタップ（touch では click が来ないためここで処理）
    if (item && !item.isFog) {
      // 指を動かしていた場合はドラッグ扱い → 選択しない（ナビヒントは startEvDragTouch で表示済み）
      if (evDrag.hasMoved) { renderEventBoard(); return; }

      // しゃぼん玉アイテムのタップ → ダイヤボタン表示
      if (item.isBubble) {
        eventState.selectedCell = fromIdx;
        showNaviHintForBubble(item);
        renderEventBoard();
        return;
      }

      // コインアイテムのタップ / ダブルタップ
      if (item.isCoin) {
        const now = Date.now();
        if (now - lastCoinTapTime < 400 && lastCoinTapIdx === fromIdx) {
          const reward = COIN_REWARD[item.coinLv ?? 1] ?? 0;
          state.coin += reward;
          eventState.board[fromIdx] = null;
          eventState.selectedCell   = null;
          hideNaviHint();
          showToast(`💰 +${reward}`);
          renderEventBoard();
          renderEventHeader();
          lastCoinTapTime = 0; lastCoinTapIdx = -1;
          return;
        }
        lastCoinTapTime = now; lastCoinTapIdx = fromIdx;
        if (eventState.selectedCell !== null && eventState.selectedCell !== fromIdx) {
          const sel = eventState.board[eventState.selectedCell];
          if (sel && evItemCanMerge(sel, item)) {
            doEventMerge(eventState.selectedCell, fromIdx);
            return;
          }
        }
        eventState.selectedCell = fromIdx;
        showNaviHintForCoin(item);
        renderEventBoard();
        return;
      }

      const tutStep = currentTutStep();
      if (tutStep && tutStep.type !== 'merge_focus') { renderEventBoard(); return; }
      if (isGenMergeTutActive()) { renderEventBoard(); return; }

      if (eventState.selectedCell !== null && eventState.selectedCell !== fromIdx) {
        const sel = eventState.board[eventState.selectedCell];
        if (sel && evItemCanMerge(sel, item)) {
          doEventMerge(eventState.selectedCell, fromIdx);
          return;
        }
        eventState.selectedCell = fromIdx;
        showNaviHintForItem(item, true);
        renderEventBoard();
        return;
      }
      if (eventState.selectedCell === fromIdx) {
        // 同一アイテム再タップ → 選択・ナビヒント維持
        return;
      }
      eventState.selectedCell = fromIdx;
      showNaviHintForItem(item, true);
      renderEventBoard();
      return;
    }

    // 空マス or 霧
    hideNaviHint();
    eventState.selectedCell = null;
    renderEventBoard();
    return;
  }

  // 実際にドラッグが発生した（別セルへ移動���→ 後続のclickイベントをブロック
  evDrag.tapHandled = true;

  const fromItem = eventState.board[fromIdx];
  const toItem   = eventState.board[toIdx];
  if (!fromItem || fromItem.isFog) return; // 霧アイテムはドラッグ元にならない

  const step = currentTutStep();

  if (!toItem) {
    // 空きセルへ移動（merge_focus またはチュートリアル完了後のみ）
    if (!step || step.type === 'merge_focus') {
      eventState.board[toIdx]   = fromItem;
      eventState.board[fromIdx] = null;
    }
  } else if (!fromItem.isFireGen && !toItem.isFireGen &&
             fromItem.isEventGen && toItem.isEventGen &&
             (fromItem.genLevel ?? 0) === (toItem.genLevel ?? 0)) {
    // メモ帳ジェネレータータイル同士のマージ → Lvアップ
    mergeEventGenerators(fromIdx, toIdx);
    return;
  } else if (fromItem.isFireGen && toItem.isFireGen &&
             (fromItem.seizoLevel ?? 0) === (toItem.seizoLevel ?? 0)) {
    // 製造機ジェネレータータイル同士のマージ → Lvアップ
    mergeFireGenerators(fromIdx, toIdx);
    return;
  } else if (!fromItem.isEventGen && evItemCanMerge(fromItem, toItem)) {
    // 通常/霧アイテムのマージ（ロック済み霧はターゲット不可）
    if (toItem.isFog && !eventState.unlockedFogCells.has(toIdx)) {
      eventState.selectedCell = null;
      renderEventBoard();
      return;
    }
    doEventMerge(fromIdx, toIdx);
    return;
  } else if (!step && !toItem.isEventGen && !fromItem.isEventGen && !toItem.isFog) {
    // チュートリアル完了後のみ通常アイテム同士の入れ替え許可
    eventState.board[toIdx]   = fromItem;
    eventState.board[fromIdx] = toItem;
  }

  // ドラッグ後の選択状態更新
  // ジェネレーター: 選択中タイルを移動した場合は新位置を追跡
  // マージアイテム: 残像・誤マージ防止のためリセット
  if (fromItem.isEventGen) {
    if (eventState.selectedCell === fromIdx) {
      eventState.selectedCell = !toItem ? toIdx : null; // 空きへ移動→新位置, 入れ替え→解除
      if (eventState.selectedCell === null) hideNaviHint();
    }
  } else {
    if (eventState.selectedCell !== null) {
      eventState.selectedCell = null;
      hideNaviHint();
    }
  }
  renderEventBoard();
  renderEventRequest(); // 依頼達成可否を更新
}

// ========================================
// イベント画面ナビゲーション
// ========================================
document.getElementById('event-btn').addEventListener('click', () => {
  document.getElementById('event-screen').classList.remove('hidden');
  renderEventBoard();
  renderEventHeader();
  renderEventRequest();
  renderTutorialPanel();
});

document.getElementById('event-close').addEventListener('click', () => {
  document.getElementById('event-screen').classList.add('hidden');
  document.getElementById('tutorial-overlay').classList.add('hidden');
  document.getElementById('tutorial-panel').classList.add('hidden');
});

// チュートリアルオーバーレイ・パネルのタップで次へ
document.getElementById('tutorial-overlay').addEventListener('click', onTutorialTap);
document.getElementById('tutorial-panel').addEventListener('click', onTutorialTap);

// ナビキャラタップでヒント表示（チュートリアル外のみ）
document.getElementById('tutorial-char').addEventListener('click', (e) => {
  e.stopPropagation();
  if (!isTutorialComplete() || isGenMergeTutActive()) return;
  const genItem = eventState.board.find(c => c && c.isEventGen && !c.isFireGen);
  const genLevel = genItem ? (genItem.genLevel ?? 0) : 0;
  showNaviHintForGen(genLevel);
});

// LvアップダウンボタンのクリックでgenPowerLevelをサイクル
document.getElementById('navi-lv-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  // 選択中ジェネレーターの種類に応じてサイクル
  const selIdx  = eventState.selectedCell;
  const selItem = selIdx !== null ? eventState.board[selIdx] : null;
  if (selItem && selItem.isFireGen) {
    // 第二章ジェネレーター
    const sLv = selItem.seizoLevel ?? 0;
    cycleFireGenPowerLevel(sLv);
    updateFireNaviLvBtn(sLv);
  } else {
    // 第一章ジェネレーター
    const genItem  = eventState.board.find(c => c && c.isEventGen && !c.isFireGen);
    const genLevel = genItem ? (genItem.genLevel ?? 0) : 0;
    cycleGenPowerLevel(genLevel);
    updateNaviLvBtn(genLevel);
  }
  // 持続中はタイマーをリセットしない（選択中は消えない）
  if (!naviHintPersistent) {
    if (naviHintTimer) clearTimeout(naviHintTimer);
    naviHintTimer = setTimeout(() => {
      document.getElementById('navi-hint-panel')?.classList.add('hidden');
      naviHintTimer = null;
    }, 3500);
  }
});

// ダイヤボタン（しゃぼん玉を割る）
document.getElementById('navi-diamond-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  const selIdx  = eventState.selectedCell;
  const selItem = selIdx !== null ? eventState.board[selIdx] : null;
  if (!selItem || !selItem.isBubble) return;
  const cost = BUBBLE_DIAMOND_COST[selItem.stage] ?? 0;
  if (state.diamond < cost) {
    showToast(`ダイヤが足りません（必要: 💎${cost}）`);
    return;
  }
  state.diamond -= cost;
  renderEventHeader();
  popBubble(selIdx);
});

// ゴミ箱ボタン（Lv1マージアイテムを削除）
document.getElementById('navi-trash-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  const selIdx  = eventState.selectedCell;
  if (selIdx === null) return;
  const selItem = eventState.board[selIdx];
  if (!selItem || selItem.stage !== 1 || selItem.isFog || selItem.isBubble || selItem.isCoin || selItem.isEventGen) return;
  eventState.board[selIdx] = null;
  eventState.selectedCell  = null;
  hideNaviHint();
  renderEventBoard();
});

// コインボタン（Lv2以上のマージアイテムをコインに換金）
document.getElementById('navi-coin-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  const selIdx  = eventState.selectedCell;
  if (selIdx === null) return;
  const selItem = eventState.board[selIdx];
  if (!selItem || selItem.stage < 2 || selItem.isFog || selItem.isBubble || selItem.isCoin || selItem.isEventGen) return;
  const reward = selItem.stage * 10;
  state.coin += reward;
  eventState.board[selIdx] = null;
  eventState.selectedCell  = null;
  hideNaviHint();
  showToast(`💰 +${reward}`);
  renderEventBoard();
  renderEventHeader();
});

// ========================================
// ヘッダー高さをCSS変数に反映（sticky top のズレ防止）
// ========================================
function updateStickyHeights() {
  const mainHeader  = document.getElementById('header');
  const eventHeader = document.getElementById('event-header-bar');
  const mh = mainHeader  ? mainHeader.getBoundingClientRect().height  : 0;
  const eh = eventHeader ? eventHeader.getBoundingClientRect().height : 0;
  if (mh > 0) document.documentElement.style.setProperty('--main-header-h',  mh + 'px');
  if (eh > 0) document.documentElement.style.setProperty('--event-header-h', eh + 'px');
}
window.addEventListener('resize', updateStickyHeights);

// ========================================
// 起動
// ========================================
initGame();
initEventMap();

// 起動時にイベントマップ①を最初に表示
document.getElementById('event-screen').classList.remove('hidden');
renderEventBoard();
renderEventGenerators();
renderEventHeader();
renderEventRequest();
renderTutorialPanel();

// DOM描画完了後にヘッダー高さを計測（2段RFAで確実にレイアウト後に実行）
requestAnimationFrame(() => requestAnimationFrame(updateStickyHeights));
setTimeout(updateStickyHeights, 300);

// しゃぼん玉 → コイン変換タイマー（5秒ごとにチェック、60秒経過でLv1コインに変換）
setInterval(() => {
  let changed = false;
  eventState.board.forEach((item, i) => {
    if (!item || !item.isBubble) return;
    const ts = item.bubbleTimestamp ?? Date.now();
    if (Date.now() - ts >= BUBBLE_COIN_DELAY_MS) {
      eventState.board[i] = { isCoin: true, coinLv: 1 };
      // 選択中だったらナビヒントをリセット
      if (eventState.selectedCell === i) {
        eventState.selectedCell = null;
        hideNaviHint();
      }
      changed = true;
    }
  });
  if (changed) {
    const screen = document.getElementById('event-screen');
    if (!screen?.classList.contains('hidden')) renderEventBoard();
  }
}, 5000);
