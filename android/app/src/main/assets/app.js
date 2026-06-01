const $ = (id) => document.getElementById(id);

const ui = {
  home: $("homeScreen"),
  library: $("libraryScreen"),
  gameScreen: $("gameScreen"),
  gameTitle: $("gameTitle"),
  categoryTitle: $("categoryTitle"),
  libraryBack: $("libraryBackBtn"),
  settingsButton: $("settingsBtn"),
  settingsModal: $("settingsModal"),
  settingsSummary: $("settingsSummary"),
  resume: $("resumeBtn"),
  settingsRestart: $("settingsRestartBtn"),
  settingsHome: $("settingsHomeBtn"),
  hudScore: $("hudScore"),
  hudStatus: $("hudStatus"),
  boardTip: $("boardTip"),
  score: $("score"),
  best: $("best"),
  turn: $("turn"),
  level: $("level"),
  status: $("statusLabel"),
  game: $("gameLabel"),
  helpTitle: $("helpTitle"),
  helpText: $("helpText"),
  start: $("startBtn"),
  reset: $("resetBtn"),
  fall: $("fallBtn"),
  tetrisLeft: $("tetrisLeft"),
  tetrisRight: $("tetrisRight"),
  tetrisRotate: $("tetrisRotate"),
  tetrisControls: $("tetrisControls"),
  arcadeLeft: $("arcadeLeft"),
  arcadeRight: $("arcadeRight"),
  arcadeAction: $("arcadeAction"),
  arcadeControls: $("arcadeControls"),
  snakeStick: $("snakeStick"),
  joystickKnob: $("joystickKnob"),
  speedControl: $("speedControl"),
  modeControl: $("modeControl"),
  difficultyControl: $("difficultyControl"),
  snakeSpeed: $("snakeSpeed"),
  battleMode: $("battleMode"),
  aiLevel: $("aiLevel"),
  modal: $("resultModal"),
  modalTitle: $("modalTitle"),
  modalMessage: $("modalMessage"),
  modalRestart: $("modalRestart"),
};

const bestScores = JSON.parse(localStorage.getItem("miniArcadeBest") || "{}");
let activeGame = "snake";
let runningLoop = null;

function saveBest() {
  localStorage.setItem("miniArcadeBest", JSON.stringify(bestScores));
}

function setStats({ score = 0, turn = "-", level = 1, status = "准备开始" } = {}) {
  ui.score.textContent = score;
  ui.best.textContent = bestScores[activeGame] || 0;
  ui.turn.textContent = turn;
  ui.level.textContent = level;
  ui.status.textContent = status;
  ui.hudScore.textContent = `${score} 分`;
  ui.hudStatus.textContent = turn !== "-" && (activeGame === "gomoku" || activeGame === "xiangqi") ? `${turn} · ${status}` : status;
  ui.boardTip.textContent = turn !== "-" ? `${turn} · ${status}` : status;
}

function setBest(score) {
  if (score > (bestScores[activeGame] || 0)) {
    bestScores[activeGame] = score;
    saveBest();
  }
  ui.best.textContent = bestScores[activeGame] || 0;
}

function clearTimer() {
  if (runningLoop) clearInterval(runningLoop);
  runningLoop = null;
}

function hideResult() {
  ui.modal.classList.remove("show");
}

function showResult(title, message) {
  clearTimer();
  ui.modalTitle.textContent = title;
  ui.modalMessage.textContent = `${message} 本局已经无法继续进行。`;
  ui.modal.classList.add("show");
}

window.addEventListener("load", () => {
  setTimeout(() => $("splash")?.remove(), 6200);
});

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function bindHoldButton(button, action) {
  let timer = null;
  const stop = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };
  const start = (e) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    stop();
    timer = setInterval(action, 105);
  };
  button.addEventListener("pointerdown", start);
  button.addEventListener("pointerup", stop);
  button.addEventListener("pointercancel", stop);
  button.addEventListener("pointerleave", stop);
}

const snake = {
  canvas: $("snakeCanvas"),
  size: 30,
  cells: 16,
  dir: { x: 1, y: 0 },
  nextDir: { x: 1, y: 0 },
  body: [],
  food: { x: 12, y: 12 },
  score: 0,
  ended: false,
  reset() {
    clearTimer();
    hideResult();
    this.body = [{ x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.score = 0;
    this.ended = false;
    this.placeFood();
    setStats({ score: 0, level: 1, status: "准备开始" });
    this.draw();
  },
  start() {
    if (this.ended || runningLoop) return;
    setStats({ score: this.score, status: "进行中" });
    runningLoop = setInterval(() => this.step(), Number(ui.snakeSpeed.value));
  },
  placeFood() {
    do {
      this.food = { x: Math.floor(Math.random() * this.cells), y: Math.floor(Math.random() * this.cells) };
    } while (this.body.some((p) => p.x === this.food.x && p.y === this.food.y));
  },
  step() {
    this.dir = this.nextDir;
    const head = { x: this.body[0].x + this.dir.x, y: this.body[0].y + this.dir.y };
    const hit = head.x < 0 || head.y < 0 || head.x >= this.cells || head.y >= this.cells ||
      this.body.some((p) => p.x === head.x && p.y === head.y);
    if (hit) {
      this.ended = true;
      setBest(this.score);
      setStats({ score: this.score, status: "游戏结束" });
      this.draw();
      showResult("贪吃蛇结束", `最终分数：${this.score}。`);
      return;
    }
    this.body.unshift(head);
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      this.placeFood();
    } else {
      this.body.pop();
    }
    setStats({ score: this.score, status: "进行中" });
    this.draw();
  },
  turn(x, y) {
    if (this.ended || this.dir.x + x === 0 && this.dir.y + y === 0) return;
    this.nextDir = { x, y };
  },
  draw() {
    const ctx = this.canvas.getContext("2d");
    const s = this.size;
    ctx.clearRect(0, 0, 480, 480);
    ctx.fillStyle = "#12181b";
    ctx.fillRect(0, 0, 480, 480);
    ctx.strokeStyle = "rgba(255,255,255,.06)";
    for (let i = 0; i <= this.cells; i++) {
      ctx.beginPath(); ctx.moveTo(i * s, 0); ctx.lineTo(i * s, 480); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * s); ctx.lineTo(480, i * s); ctx.stroke();
    }
    ctx.fillStyle = "#ef7866";
    roundRect(ctx, this.food.x * s + 4, this.food.y * s + 4, s - 8, s - 8, 7);
    this.body.forEach((p, i) => {
      ctx.fillStyle = i === 0 ? "#e8b653" : "#54c7a0";
      roundRect(ctx, p.x * s + 3, p.y * s + 3, s - 6, s - 6, 6);
    });
  },
  tap(e) {
    if (this.ended) return;
    const r = this.canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const cx = r.width / 2;
    const cy = r.height / 2;
    if (Math.abs(x - cx) > Math.abs(y - cy)) {
      this.turn(x > cx ? 1 : -1, 0);
    } else {
      this.turn(0, y > cy ? 1 : -1);
    }
  },
};

const tetris = {
  canvas: $("tetrisCanvas"),
  nextCanvas: $("nextCanvas"),
  cols: 10,
  rows: 20,
  board: [],
  piece: null,
  nextPiece: null,
  score: 0,
  lines: 0,
  over: false,
  shapes: [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[0, 1, 0], [1, 1, 1]],
    [[1, 0, 0], [1, 1, 1]],
    [[0, 0, 1], [1, 1, 1]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]],
  ],
  colors: ["#66c2ff", "#e8b653", "#bd80ff", "#ef7866", "#54c7a0", "#f06aa9", "#8ddb66"],
  reset() {
    clearTimer();
    hideResult();
    this.board = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    this.score = 0;
    this.lines = 0;
    this.over = false;
    this.nextPiece = this.randomPiece();
    this.spawn();
    setStats({ score: 0, level: 1, status: "准备开始" });
    this.draw();
  },
  start() {
    if (runningLoop || this.over) return;
    setStats({ score: this.score, level: this.level(), status: "进行中" });
    runningLoop = setInterval(() => this.drop(), Math.max(120, 620 - this.level() * 55));
  },
  level() {
    return Math.floor(this.lines / 5) + 1;
  },
  randomPiece() {
    const id = Math.floor(Math.random() * this.shapes.length) + 1;
    return { x: 3, y: 0, shape: this.shapes[id - 1].map((r) => [...r]), id };
  },
  spawn() {
    this.piece = this.nextPiece || this.randomPiece();
    this.piece.x = 3;
    this.piece.y = 0;
    this.nextPiece = this.randomPiece();
    if (this.collide(this.piece.x, this.piece.y, this.piece.shape)) {
      this.over = true;
    }
  },
  collide(x, y, shape) {
    return shape.some((row, dy) => row.some((v, dx) => {
      if (!v) return false;
      const nx = x + dx;
      const ny = y + dy;
      return nx < 0 || nx >= this.cols || ny >= this.rows || (ny >= 0 && this.board[ny][nx]);
    }));
  },
  merge() {
    this.piece.shape.forEach((row, dy) => row.forEach((v, dx) => {
      if (v) this.board[this.piece.y + dy][this.piece.x + dx] = this.piece.id;
    }));
  },
  clearLines() {
    let cleared = 0;
    this.board = this.board.filter((row) => {
      if (row.every(Boolean)) {
        cleared++;
        return false;
      }
      return true;
    });
    while (this.board.length < this.rows) this.board.unshift(Array(this.cols).fill(0));
    if (cleared) {
      this.lines += cleared;
      this.score += [0, 100, 300, 500, 800][cleared] * this.level();
    }
  },
  drop() {
    if (this.over) return;
    if (!this.move(0, 1, false)) {
      this.merge();
      this.clearLines();
      this.spawn();
      if (this.over) {
        setBest(this.score);
        setStats({ score: this.score, level: this.level(), status: "游戏结束" });
        this.draw();
        showResult("俄罗斯方块结束", `最终分数：${this.score}。`);
        return;
      }
    }
    setStats({ score: this.score, level: this.level(), status: "进行中" });
    this.draw();
  },
  move(dx, dy, redraw = true) {
    if (this.over || this.collide(this.piece.x + dx, this.piece.y + dy, this.piece.shape)) return false;
    this.piece.x += dx;
    this.piece.y += dy;
    if (redraw) this.draw();
    return true;
  },
  rotate() {
    if (this.over) return;
    const rotated = this.piece.shape[0].map((_, i) => this.piece.shape.map((r) => r[i]).reverse());
    const kicks = [0, -1, 1, -2, 2];
    const offset = kicks.find((kick) => !this.collide(this.piece.x + kick, this.piece.y, rotated));
    if (offset !== undefined) {
      this.piece.x += offset;
      this.piece.shape = rotated;
    }
    this.draw();
  },
  hardDrop() {
    if (this.over) return;
    while (this.move(0, 1, false));
    this.drop();
  },
  tap() {
    this.rotate();
  },
  ghostY() {
    let y = this.piece.y;
    while (!this.collide(this.piece.x, y + 1, this.piece.shape)) y++;
    return y;
  },
  drawPiece(ctx, piece, offsetX, offsetY, block, alpha = 1, ghostY = null) {
    ctx.globalAlpha = alpha;
    piece.shape.forEach((row, dy) => row.forEach((v, dx) => {
      if (!v) return;
      ctx.fillStyle = this.colors[piece.id - 1];
      const y = ghostY === null ? piece.y + dy : ghostY + dy;
      roundRect(ctx, (piece.x + dx + offsetX) * block + 2, (y + offsetY) * block + 2, block - 4, block - 4, 5);
    }));
    ctx.globalAlpha = 1;
  },
  drawNext() {
    const ctx = this.nextCanvas.getContext("2d");
    ctx.clearRect(0, 0, 150, 150);
    ctx.fillStyle = "#101416";
    ctx.fillRect(0, 0, 150, 150);
    if (!this.nextPiece) return;
    const block = 28;
    const w = this.nextPiece.shape[0].length;
    const h = this.nextPiece.shape.length;
    const ox = (150 - w * block) / 2;
    const oy = (150 - h * block) / 2;
    this.nextPiece.shape.forEach((row, y) => row.forEach((v, x) => {
      if (!v) return;
      ctx.fillStyle = this.colors[this.nextPiece.id - 1];
      roundRect(ctx, ox + x * block + 2, oy + y * block + 2, block - 4, block - 4, 5);
    }));
  },
  draw() {
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, 300, 600);
    ctx.fillStyle = "#101416";
    ctx.fillRect(0, 0, 300, 600);
    ctx.strokeStyle = "rgba(255,255,255,.08)";
    for (let y = 0; y <= 20; y++) {
      ctx.beginPath(); ctx.moveTo(0, y * 30); ctx.lineTo(300, y * 30); ctx.stroke();
    }
    this.board.forEach((row, y) => row.forEach((id, x) => {
      if (!id) return;
      ctx.fillStyle = this.colors[id - 1];
      roundRect(ctx, x * 30 + 2, y * 30 + 2, 26, 26, 5);
    }));
    if (this.piece) {
      this.drawPiece(ctx, this.piece, 0, 0, 30, 0.23, this.ghostY());
      this.drawPiece(ctx, this.piece, 0, 0, 30);
    }
    this.drawNext();
  },
};

const gomoku = {
  canvas: $("gomokuCanvas"),
  board: [],
  current: 1,
  winner: 0,
  thinking: false,
  reset() {
    clearTimer();
    hideResult();
    this.board = Array.from({ length: 15 }, () => Array(15).fill(0));
    this.current = 1;
    this.winner = 0;
    this.thinking = false;
    setStats({ score: 0, turn: "黑棋", level: 1, status: "落子中" });
    this.draw();
  },
  start() {
    if (!this.winner) setStats({ score: 0, turn: this.current === 1 ? "黑棋" : "白棋", status: "落子中" });
  },
  click(e) {
    if (activeGame !== "gomoku" || this.winner || this.thinking) return;
    const r = this.canvas.getBoundingClientRect();
    const scale = this.canvas.width / r.width;
    const x = Math.round(((e.clientX - r.left) * scale - 40) / 34.28);
    const y = Math.round(((e.clientY - r.top) * scale - 40) / 34.28);
    if (x < 0 || y < 0 || x >= 15 || y >= 15 || this.board[y][x]) return;
    this.place(x, y);
    if (ui.battleMode.value === "ai" && !this.winner && this.current === -1) {
      this.thinking = true;
      setStats({ score: 0, turn: "白棋", status: "电脑思考中" });
      setTimeout(() => {
        const move = this.bestAIMove(ui.aiLevel.value);
        if (move) this.place(move.x, move.y);
        this.thinking = false;
      }, 180);
    }
  },
  place(x, y) {
    this.board[y][x] = this.current;
    if (this.check(x, y, this.current)) {
      this.winner = this.current;
      const name = this.current === 1 ? "黑棋" : "白棋";
      setStats({ score: 0, turn: name, status: "胜利" });
      this.draw();
      showResult(`${name}胜利`, `${name}五子连线获胜。`);
      return;
    }
    this.current *= -1;
    setStats({ score: 0, turn: this.current === 1 ? "黑棋" : "白棋", status: "落子中" });
    this.draw();
  },
  check(x, y, player = this.current) {
    const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
    return dirs.some(([dx, dy]) => {
      let count = 1;
      for (const sign of [-1, 1]) {
        let nx = x + dx * sign;
        let ny = y + dy * sign;
        while (this.board[ny]?.[nx] === player) {
          count++;
          nx += dx * sign;
          ny += dy * sign;
        }
      }
      return count >= 5;
    });
  },
  bestAIMove(level) {
    const moves = this.candidateMoves().slice(0, level === "master" ? 12 : 18);
    if (!moves.length) return { x: 7, y: 7 };
    const immediate = this.findWinningMove(-1) || this.findWinningMove(1);
    if (immediate) return immediate;
    if (level === "beginner") {
      const top = moves.sort((a, b) => this.scoreMove(b, -1) - this.scoreMove(a, -1)).slice(0, 5);
      return top[Math.floor(Math.random() * top.length)];
    }
    if (level === "medium") {
      return moves.sort((a, b) => this.scoreMove(b, -1) - this.scoreMove(a, -1))[0];
    }
    let best = moves[0];
    let bestScore = -Infinity;
    for (const move of moves) {
      this.board[move.y][move.x] = -1;
      const score = this.gomokuMinimax(1, false, -Infinity, Infinity);
      this.board[move.y][move.x] = 0;
      if (score > bestScore) {
        bestScore = score;
        best = move;
      }
    }
    return best;
  },
  gomokuMinimax(depth, maximizing, alpha, beta) {
    if (depth === 0) return this.evaluateBoard(-1) - this.evaluateBoard(1);
    const player = maximizing ? -1 : 1;
    const moves = this.candidateMoves().slice(0, 8);
    if (!moves.length) return 0;
    let best = maximizing ? -Infinity : Infinity;
    for (const move of moves) {
      this.board[move.y][move.x] = player;
      const terminal = this.check(move.x, move.y, player);
      const score = terminal
        ? (player === -1 ? 1000000 : -1000000)
        : this.gomokuMinimax(depth - 1, !maximizing, alpha, beta);
      this.board[move.y][move.x] = 0;
      if (maximizing) {
        best = Math.max(best, score);
        alpha = Math.max(alpha, best);
      } else {
        best = Math.min(best, score);
        beta = Math.min(beta, best);
      }
      if (beta <= alpha) break;
    }
    return best;
  },
  candidateMoves() {
    const moves = [];
    let hasStone = false;
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 15; x++) {
        if (this.board[y][x]) hasStone = true;
        if (!this.board[y][x] && this.hasNeighbor(x, y, 2)) {
          moves.push({ x, y, rank: this.scoreMove({ x, y }, -1) + this.scoreMove({ x, y }, 1) * 0.9 });
        }
      }
    }
    if (!hasStone) return [{ x: 7, y: 7 }];
    return moves.sort((a, b) => b.rank - a.rank);
  },
  hasNeighbor(x, y, radius) {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx === 0 && dy === 0) continue;
        if (this.board[y + dy]?.[x + dx]) return true;
      }
    }
    return false;
  },
  findWinningMove(player) {
    return this.candidateMoves().find((move) => {
      this.board[move.y][move.x] = player;
      const win = this.check(move.x, move.y, player);
      this.board[move.y][move.x] = 0;
      return win;
    });
  },
  scoreMove(move, player) {
    let score = 0;
    for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
      let count = 1;
      let open = 0;
      for (const sign of [-1, 1]) {
        let nx = move.x + dx * sign;
        let ny = move.y + dy * sign;
        while (this.board[ny]?.[nx] === player) {
          count++;
          nx += dx * sign;
          ny += dy * sign;
        }
        if (this.board[ny]?.[nx] === 0) open++;
      }
      score += this.shapeScore(count, open);
    }
    const center = 14 - (Math.abs(move.x - 7) + Math.abs(move.y - 7));
    return score + center;
  },
  shapeScore(count, open) {
    if (count >= 5) return 100000;
    if (count === 4 && open === 2) return 20000;
    if (count === 4 && open === 1) return 6000;
    if (count === 3 && open === 2) return 1600;
    if (count === 3 && open === 1) return 350;
    if (count === 2 && open === 2) return 160;
    if (count === 2 && open === 1) return 40;
    return count * 8;
  },
  evaluateBoard(player) {
    let score = 0;
    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 15; x++) {
        if (!this.board[y][x]) score += this.scoreMove({ x, y }, player) * 0.04;
      }
    }
    return score;
  },
  draw() {
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, 560, 560);
    ctx.fillStyle = "#d8a45d";
    ctx.fillRect(0, 0, 560, 560);
    ctx.strokeStyle = "#59351d";
    ctx.lineWidth = 2;
    for (let i = 0; i < 15; i++) {
      const p = 40 + i * 34.28;
      ctx.beginPath(); ctx.moveTo(40, p); ctx.lineTo(520, p); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p, 40); ctx.lineTo(p, 520); ctx.stroke();
    }
    [[3, 3], [11, 3], [7, 7], [3, 11], [11, 11]].forEach(([x, y]) => {
      ctx.fillStyle = "#59351d";
      ctx.beginPath(); ctx.arc(40 + x * 34.28, 40 + y * 34.28, 5, 0, Math.PI * 2); ctx.fill();
    });
    this.board.forEach((row, y) => row.forEach((v, x) => {
      if (!v) return;
      const px = 40 + x * 34.28;
      const py = 40 + y * 34.28;
      const g = ctx.createRadialGradient(px - 5, py - 7, 2, px, py, 17);
      g.addColorStop(0, v === 1 ? "#5c5c5c" : "#fff7e2");
      g.addColorStop(1, v === 1 ? "#080808" : "#c9bca5");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py, 15, 0, Math.PI * 2); ctx.fill();
    }));
  },
};

const xiangqi = {
  el: $("xiangqiBoard"),
  board: [],
  selected: null,
  current: "r",
  ended: false,
  thinking: false,
  padX: 7,
  padY: 5.8,
  reset() {
    clearTimer();
    hideResult();
    this.board = Array.from({ length: 10 }, () => Array(9).fill(null));
    const red = ["车", "马", "相", "仕", "帅", "仕", "相", "马", "车"];
    const black = ["车", "马", "象", "士", "将", "士", "象", "马", "车"];
    red.forEach((n, x) => this.board[9][x] = { side: "r", n });
    black.forEach((n, x) => this.board[0][x] = { side: "b", n });
    [1, 7].forEach((x) => {
      this.board[7][x] = { side: "r", n: "炮" };
      this.board[2][x] = { side: "b", n: "炮" };
    });
    [0, 2, 4, 6, 8].forEach((x) => {
      this.board[6][x] = { side: "r", n: "兵" };
      this.board[3][x] = { side: "b", n: "卒" };
    });
    this.current = "r";
    this.selected = null;
    this.ended = false;
    this.thinking = false;
    setStats({ score: 0, turn: "红方", level: 1, status: "对弈中" });
    this.draw();
  },
  start() {
    if (!this.ended) setStats({ score: 0, turn: this.current === "r" ? "红方" : "黑方", status: "对弈中" });
  },
  draw() {
    this.el.innerHTML = '<div class="x-river">楚河&nbsp;&nbsp;汉界</div>';
    for (let i = 0; i < 10; i++) this.line(0, i, 8, i);
    for (let i = 0; i < 9; i++) {
      this.line(i, 0, i, 4);
      this.line(i, 5, i, 9);
    }
    [[3, 0, 5, 2], [5, 0, 3, 2], [3, 7, 5, 9], [5, 7, 3, 9]].forEach((l) => this.line(...l));
    this.board.forEach((row, y) => row.forEach((p, x) => {
      if (!p) return;
      const b = document.createElement("button");
      b.className = `piece ${p.side === "r" ? "red" : ""}`;
      if (this.selected?.x === x && this.selected?.y === y) b.classList.add("selected");
      b.textContent = p.n;
      const point = this.boardPoint(x, y);
      b.style.left = `${point.x}%`;
      b.style.top = `${point.y}%`;
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        this.pick(x, y);
      });
      this.el.appendChild(b);
    }));
    if (this.selected) {
      this.legalTargets(this.selected.x, this.selected.y).forEach(({ x, y, capture }) => {
        const point = this.boardPoint(x, y);
        const dot = document.createElement("button");
        dot.className = `move-dot ${capture ? "capture" : ""}`;
        dot.style.left = `${point.x}%`;
        dot.style.top = `${point.y}%`;
        dot.addEventListener("click", (e) => {
          e.stopPropagation();
          this.moveTo(x, y);
        });
        this.el.appendChild(dot);
      });
    }
    this.el.onclick = (e) => {
      const point = this.eventToBoard(e);
      if (point) this.moveTo(point.x, point.y);
    };
  },
  boardPoint(x, y) {
    return {
      x: this.padX + (x / 8) * (100 - this.padX * 2),
      y: this.padY + (y / 9) * (100 - this.padY * 2),
    };
  },
  eventToBoard(e) {
    const rect = this.el.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    const bx = Math.round(((px - this.padX) / (100 - this.padX * 2)) * 8);
    const by = Math.round(((py - this.padY) / (100 - this.padY * 2)) * 9);
    if (bx < 0 || bx > 8 || by < 0 || by > 9) return null;
    return { x: bx, y: by };
  },
  line(x1, y1, x2, y2) {
    const l = document.createElement("div");
    l.className = "x-line";
    const a = this.boardPoint(x1, y1);
    const b = this.boardPoint(x2, y2);
    const ax = a.x;
    const ay = a.y;
    const bx = b.x;
    const by = b.y;
    const len = Math.hypot(bx - ax, by - ay);
    const ang = Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
    l.style.left = `${ax}%`;
    l.style.top = `${ay}%`;
    l.style.width = `${len}%`;
    l.style.height = "3px";
    l.style.transformOrigin = "0 0";
    l.style.transform = `rotate(${ang}deg)`;
    this.el.appendChild(l);
  },
  pick(x, y) {
    if (this.ended || this.thinking) return;
    const p = this.board[y][x];
    if (p?.side === this.current) {
      this.selected = { x, y };
      this.draw();
    } else {
      this.moveTo(x, y);
    }
  },
  legalTargets(x, y) {
    const piece = this.board[y][x];
    if (!piece) return [];
    const out = [];
    for (let ty = 0; ty < 10; ty++) {
      for (let tx = 0; tx < 9; tx++) {
        const target = this.board[ty][tx];
        if (target?.side === piece.side) continue;
        const move = { fromX: x, fromY: y, toX: tx, toY: ty };
        if (this.isLegal(piece, x, y, tx, ty) && this.isMoveSafe(move, piece.side)) {
          out.push({ x: tx, y: ty, capture: !!target });
        }
      }
    }
    return out;
  },
  moveTo(x, y) {
    if (this.ended || this.thinking || !this.selected || x < 0 || x > 8 || y < 0 || y > 9) return;
    const from = this.selected;
    const piece = this.board[from.y][from.x];
    const target = this.board[y][x];
    if (target?.side === piece.side) {
      this.selected = { x, y };
      this.draw();
      return;
    }
    if (!this.isLegal(piece, from.x, from.y, x, y) || !this.isMoveSafe({ fromX: from.x, fromY: from.y, toX: x, toY: y }, piece.side)) {
      setStats({ score: 0, turn: this.current === "r" ? "红方" : "黑方", status: "走法无效" });
      return;
    }
    this.makeMove({ fromX: from.x, fromY: from.y, toX: x, toY: y });
    this.selected = null;
    if (target?.n === "将" || target?.n === "帅") {
      const winner = piece.side === "r" ? "红方" : "黑方";
      this.ended = true;
      setStats({ score: 0, turn: winner, status: "胜利" });
      this.draw();
      showResult(`${winner}胜利`, `${winner}吃掉将帅获胜。`);
      return;
    }
    this.current = this.current === "r" ? "b" : "r";
    setStats({ score: 0, turn: this.current === "r" ? "红方" : "黑方", status: "对弈中" });
    this.draw();
    if (ui.battleMode.value === "ai" && this.current === "b") {
      this.thinking = true;
      setStats({ score: 0, turn: "黑方", status: "电脑思考中" });
      setTimeout(() => this.aiMove(), 220);
    }
  },
  aiMove() {
    if (this.ended) return;
    const move = this.bestXiangqiMove(ui.aiLevel.value);
    this.thinking = false;
    if (!move) return;
    const target = this.makeMove(move);
    if (target?.n === "帅") {
      this.ended = true;
      setStats({ score: 0, turn: "黑方", status: "胜利" });
      this.draw();
      showResult("黑方胜利", "黑方吃掉将帅获胜。");
      return;
    }
    this.current = "r";
    setStats({ score: 0, turn: "红方", status: "对弈中" });
    this.draw();
  },
  makeMove(move) {
    const piece = this.board[move.fromY][move.fromX];
    const target = this.board[move.toY][move.toX];
    this.board[move.toY][move.toX] = piece;
    this.board[move.fromY][move.fromX] = null;
    return target;
  },
  undoMove(move, target) {
    this.board[move.fromY][move.fromX] = this.board[move.toY][move.toX];
    this.board[move.toY][move.toX] = target;
  },
  bestXiangqiMove(level) {
    const engineMove = this.bestXqwlightMove(level);
    if (engineMove) return engineMove;
    const moves = this.generateMoves("b");
    if (!moves.length) return null;
    if (level === "beginner") {
      const pool = moves.slice(0, Math.min(10, moves.length));
      return pool[Math.floor(Math.random() * pool.length)];
    }
    let best = moves[0];
    let bestScore = -Infinity;
    const depth = level === "master" ? 3 : 2;
    const searchMoves = moves.slice(0, level === "master" ? 34 : 24);
    for (const move of searchMoves) {
      const target = this.makeMove(move);
      const score = this.isGeneral(target)
        ? 10000000
        : -this.xiangqiSearch(depth - 1, "r", -10000000, 10000000);
      this.undoMove(move, target);
      if (score > bestScore) {
        bestScore = score;
        best = move;
      }
    }
    return best;
  },
  bestXqwlightMove(level) {
    if (typeof Position !== "function" || typeof Search !== "function" || typeof MOVE !== "function") {
      return null;
    }
    const config = {
      beginner: { depth: 2, millis: 350, hash: 10 },
      medium: { depth: 4, millis: 900, hash: 12 },
      master: { depth: 6, millis: 1800, hash: 14 },
    }[level] || { depth: 4, millis: 900, hash: 12 };
    try {
      const pos = new Position();
      pos.fromFen(this.toXqwFen("b"));
      const mv = new Search(pos, config.hash).searchMain(config.depth, config.millis);
      if (!mv) return null;
      return this.xqwMoveToMove(mv);
    } catch (error) {
      console.warn("xqwlight failed, using fallback AI", error);
      return null;
    }
  },
  toXqwFen(sideToMove) {
    const map = {
      "r车": "R", "r马": "N", "r相": "B", "r仕": "A", "r帅": "K", "r炮": "C", "r兵": "P",
      "b车": "r", "b马": "n", "b象": "b", "b士": "a", "b将": "k", "b炮": "c", "b卒": "p",
    };
    const rows = [];
    for (let y = 0; y < 10; y++) {
      let row = "";
      let empty = 0;
      for (let x = 0; x < 9; x++) {
        const piece = this.board[y][x];
        if (!piece) {
          empty++;
          continue;
        }
        if (empty) {
          row += String(empty);
          empty = 0;
        }
        row += map[piece.side + piece.n] || "1";
      }
      if (empty) row += String(empty);
      rows.push(row);
    }
    return `${rows.join("/")} ${sideToMove === "b" ? "b" : "w"}`;
  },
  xqwMoveToMove(mv) {
    const from = this.xqwSquareToXY(SRC(mv));
    const to = this.xqwSquareToXY(DST(mv));
    if (!from || !to) return null;
    const piece = this.board[from.y]?.[from.x];
    if (!piece || piece.side !== "b") return null;
    const move = { fromX: from.x, fromY: from.y, toX: to.x, toY: to.y };
    if (!this.isLegal(piece, move.fromX, move.fromY, move.toX, move.toY)) return null;
    return move;
  },
  xqwSquareToXY(square) {
    if (typeof FILE_X !== "function" || typeof RANK_Y !== "function") return null;
    const x = FILE_X(square) - 3;
    const y = RANK_Y(square) - 3;
    if (x < 0 || x > 8 || y < 0 || y > 9) return null;
    return { x, y };
  },
  xiangqiSearch(depth, side, alpha, beta) {
    if (depth === 0) return this.quiescence(side, alpha, beta, 2);
    const moves = this.generateMoves(side).slice(0, 32);
    if (!moves.length) return this.isKingSafe(side) ? -800000 : -9000000;
    let best = -Infinity;
    const next = side === "r" ? "b" : "r";
    for (const move of moves) {
      const target = this.makeMove(move);
      const score = this.isGeneral(target) ? 10000000 : -this.xiangqiSearch(depth - 1, next, -beta, -alpha);
      this.undoMove(move, target);
      best = Math.max(best, score);
      alpha = Math.max(alpha, score);
      if (alpha >= beta) break;
    }
    return best;
  },
  quiescence(side, alpha, beta, depth) {
    const stand = this.evaluateXiangqi(side);
    if (stand >= beta) return beta;
    alpha = Math.max(alpha, stand);
    if (depth === 0) return alpha;
    const next = side === "r" ? "b" : "r";
    const captures = this.generateMoves(side).filter((move) => this.board[move.toY][move.toX]).slice(0, 12);
    for (const move of captures) {
      const target = this.makeMove(move);
      const score = this.isGeneral(target) ? 10000000 : -this.quiescence(next, -beta, -alpha, depth - 1);
      this.undoMove(move, target);
      if (score >= beta) return beta;
      alpha = Math.max(alpha, score);
    }
    return alpha;
  },
  generateMoves(side) {
    const moves = [];
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 9; x++) {
        const piece = this.board[y][x];
        if (!piece || piece.side !== side) continue;
        for (const [tx, ty] of this.destinationsFor(piece, x, y)) {
          const target = this.board[ty][tx];
          const move = { fromX: x, fromY: y, toX: tx, toY: ty, score: this.moveHintScore(piece, target, tx, ty) };
          if (target?.side !== side && this.isLegal(piece, x, y, tx, ty) && this.isMoveSafe(move, side)) {
            moves.push(move);
          }
        }
      }
    }
    return moves.sort((a, b) => b.score - a.score);
  },
  moveHintScore(piece, target, x, y) {
    const center = 8 - Math.abs(x - 4) + (piece.side === "b" ? y : 9 - y) * 0.6;
    const capture = target ? this.pieceValue(target.n) * 12 - this.pieceValue(piece.n) * 0.08 : 0;
    const checkBonus = this.givesPressure({ fromX: -1, fromY: -1, toX: x, toY: y }, piece.side) ? 35 : 0;
    return capture + center + checkBonus + this.positionBonus(piece, x, y);
  },
  evaluateXiangqi(side) {
    let score = 0;
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 9; x++) {
        const piece = this.board[y][x];
        if (!piece) continue;
        const value = this.pieceValue(piece.n) + this.positionBonus(piece, x, y);
        score += piece.side === side ? value : -value;
      }
    }
    score += this.generateAttackScore(side) - this.generateAttackScore(side === "r" ? "b" : "r");
    return score;
  },
  pieceValue(name) {
    return { 帅: 10000, 将: 10000, 车: 620, 马: 300, 炮: 285, 相: 125, 象: 125, 仕: 125, 士: 125, 兵: 80, 卒: 80 }[name] || 0;
  },
  positionBonus(piece, x, y) {
    if (piece.n === "兵" || piece.n === "卒") {
      const advanced = piece.side === "r" ? 9 - y : y;
      const crossed = piece.side === "r" ? y <= 4 : y >= 5;
      return advanced * 12 + (crossed ? 45 + (4 - Math.abs(x - 4)) * 4 : 0);
    }
    if (piece.n === "马") return 24 - Math.abs(x - 4) * 3 - Math.abs(y - 5) * 2;
    if (piece.n === "炮") return 18 - Math.abs(x - 4) * 2 + this.cannonFilePressure(x, y, piece.side);
    if (piece.n === "车") return 18 - Math.abs(x - 4) * 2;
    return 0;
  },
  destinationsFor(piece, x, y) {
    const name = piece.n;
    const out = [];
    const add = (tx, ty) => {
      if (tx >= 0 && tx <= 8 && ty >= 0 && ty <= 9) out.push([tx, ty]);
    };
    if (name === "车" || name === "炮") {
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        for (let step = 1; step < 10; step++) add(x + dx * step, y + dy * step);
      }
    } else if (name === "马") {
      [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]].forEach(([dx, dy]) => add(x + dx, y + dy));
    } else if (name === "相" || name === "象") {
      [[2, 2], [2, -2], [-2, 2], [-2, -2]].forEach(([dx, dy]) => add(x + dx, y + dy));
    } else if (name === "仕" || name === "士") {
      [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dx, dy]) => add(x + dx, y + dy));
    } else if (name === "帅" || name === "将") {
      [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => add(x + dx, y + dy));
      for (let ty = 0; ty <= 9; ty++) add(x, ty);
    } else if (name === "兵" || name === "卒") {
      const forward = piece.side === "r" ? -1 : 1;
      add(x, y + forward);
      const crossed = piece.side === "r" ? y <= 4 : y >= 5;
      if (crossed) {
        add(x - 1, y);
        add(x + 1, y);
      }
    }
    return out;
  },
  isMoveSafe(move, side) {
    const target = this.makeMove(move);
    const safe = this.isKingSafe(side);
    this.undoMove(move, target);
    return safe;
  },
  isKingSafe(side) {
    const king = this.findKing(side);
    if (!king || this.kingsFacing()) return false;
    const other = side === "r" ? "b" : "r";
    return !this.isSquareAttacked(king.x, king.y, other);
  },
  findKing(side) {
    const target = side === "r" ? "帅" : "将";
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 9; x++) {
        if (this.board[y][x]?.n === target) return { x, y };
      }
    }
    return null;
  },
  kingsFacing() {
    const red = this.findKing("r");
    const black = this.findKing("b");
    if (!red || !black || red.x !== black.x) return false;
    return this.countBetween(red.x, red.y, black.x, black.y) === 0;
  },
  isSquareAttacked(x, y, bySide) {
    for (let sy = 0; sy < 10; sy++) {
      for (let sx = 0; sx < 9; sx++) {
        const piece = this.board[sy][sx];
        if (!piece || piece.side !== bySide) continue;
        if (this.isLegal(piece, sx, sy, x, y)) return true;
      }
    }
    return false;
  },
  generateAttackScore(side) {
    let score = 0;
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 9; x++) {
        const piece = this.board[y][x];
        if (!piece || piece.side !== side) continue;
        score += this.destinationsFor(piece, x, y).filter(([tx, ty]) => {
          const target = this.board[ty][tx];
          return target?.side !== side && this.isLegal(piece, x, y, tx, ty);
        }).length * 1.5;
      }
    }
    return score;
  },
  cannonFilePressure(x, y, side) {
    const enemyKing = this.findKing(side === "r" ? "b" : "r");
    if (!enemyKing || enemyKing.x !== x) return 0;
    const between = this.countBetween(x, y, enemyKing.x, enemyKing.y);
    return between === 1 ? 35 : 0;
  },
  givesPressure(move, side) {
    const king = this.findKing(side === "r" ? "b" : "r");
    return !!king && Math.abs(move.toX - king.x) + Math.abs(move.toY - king.y) <= 3;
  },
  isGeneral(piece) {
    return piece?.n === "帅" || piece?.n === "将";
  },
  isLegal(piece, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);
    const name = piece.n;
    const side = piece.side;
    const between = this.countBetween(x1, y1, x2, y2);
    if (name === "车") return (dx === 0 || dy === 0) && between === 0;
    if (name === "炮") {
      const target = this.board[y2][x2];
      return (dx === 0 || dy === 0) && between === (target ? 1 : 0);
    }
    if (name === "马") {
      if (!((adx === 1 && ady === 2) || (adx === 2 && ady === 1))) return false;
      const blockX = x1 + (adx === 2 ? Math.sign(dx) : 0);
      const blockY = y1 + (ady === 2 ? Math.sign(dy) : 0);
      return !this.board[blockY][blockX];
    }
    if (name === "相" || name === "象") {
      if (adx !== 2 || ady !== 2) return false;
      if (side === "r" && y2 < 5) return false;
      if (side === "b" && y2 > 4) return false;
      return !this.board[y1 + dy / 2][x1 + dx / 2];
    }
    if (name === "仕" || name === "士") return adx === 1 && ady === 1 && this.inPalace(side, x2, y2);
    if (name === "帅" || name === "将") {
      const target = this.board[y2][x2];
      if ((target?.n === "帅" || target?.n === "将") && dx === 0) return between === 0;
      return adx + ady === 1 && this.inPalace(side, x2, y2);
    }
    if (name === "兵" || name === "卒") {
      const forward = side === "r" ? -1 : 1;
      const crossed = side === "r" ? y1 <= 4 : y1 >= 5;
      if (dx === 0 && dy === forward) return true;
      return crossed && adx === 1 && dy === 0;
    }
    return false;
  },
  inPalace(side, x, y) {
    return x >= 3 && x <= 5 && (side === "r" ? y >= 7 && y <= 9 : y >= 0 && y <= 2);
  },
  countBetween(x1, y1, x2, y2) {
    if (x1 !== x2 && y1 !== y2) return -1;
    const sx = Math.sign(x2 - x1);
    const sy = Math.sign(y2 - y1);
    let x = x1 + sx;
    let y = y1 + sy;
    let count = 0;
    while (x !== x2 || y !== y2) {
      if (this.board[y][x]) count++;
      x += sx;
      y += sy;
    }
    return count;
  },
};

function arcadeLoop(game, fn, ms = 33) {
  clearTimer();
  runningLoop = setInterval(fn, ms);
  setStats({ score: game.score || 0, status: "进行中" });
}

const shooter = {
  canvas: $("shooterCanvas"),
  score: 0,
  hero: { x: 80, y: 360, vx: 0 },
  bullets: [],
  enemies: [],
  tick: 0,
  reset() {
    clearTimer();
    hideResult();
    this.score = 0;
    this.hero = { x: 80, y: 360, vx: 0 };
    this.bullets = [];
    this.enemies = [];
    this.tick = 0;
    setStats({ score: 0, status: "准备开始" });
    this.draw();
  },
  start() {
    arcadeLoop(this, () => this.step());
  },
  move(dir) {
    this.hero.vx = dir * 6;
  },
  stop() {
    this.hero.vx = 0;
  },
  action() {
    this.bullets.push({ x: this.hero.x + 34, y: this.hero.y - 18, vx: 11 });
  },
  step() {
    this.tick++;
    this.hero.x = Math.max(24, Math.min(650, this.hero.x + this.hero.vx));
    if (this.tick % 42 === 0) this.enemies.push({ x: 720, y: 332 + Math.random() * 80, vx: 2.3 + Math.random() * 1.4 });
    this.bullets.forEach((b) => b.x += b.vx);
    this.enemies.forEach((e) => e.x -= e.vx);
    this.bullets = this.bullets.filter((b) => b.x < 740);
    for (const e of this.enemies) {
      for (const b of this.bullets) {
        if (Math.abs(e.x - b.x) < 24 && Math.abs(e.y - b.y) < 24) {
          e.hit = true;
          b.hit = true;
          this.score += 20;
        }
      }
      if (Math.abs(e.x - this.hero.x) < 34 && Math.abs(e.y - this.hero.y) < 34) {
        this.end();
        return;
      }
    }
    this.enemies = this.enemies.filter((e) => !e.hit && e.x > -40);
    this.bullets = this.bullets.filter((b) => !b.hit);
    setStats({ score: this.score, status: "进行中" });
    this.draw();
  },
  end() {
    setBest(this.score);
    setStats({ score: this.score, status: "游戏结束" });
    showResult("像素突击结束", `最终分数：${this.score}。`);
  },
  draw() {
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, 720, 480);
    ctx.fillStyle = "#9ee7ff";
    ctx.fillRect(0, 0, 720, 480);
    ctx.fillStyle = "#74c365";
    ctx.fillRect(0, 390, 720, 90);
    ctx.fillStyle = "#263238";
    roundRect(ctx, this.hero.x - 22, this.hero.y - 48, 44, 54, 8);
    ctx.fillStyle = "#ffc83d";
    roundRect(ctx, this.hero.x + 14, this.hero.y - 28, 34, 10, 5);
    ctx.fillStyle = "#ff6b5f";
    this.bullets.forEach((b) => roundRect(ctx, b.x, b.y, 18, 6, 3));
    this.enemies.forEach((e) => {
      ctx.fillStyle = "#7b4dff";
      roundRect(ctx, e.x - 22, e.y - 22, 44, 44, 8);
      ctx.fillStyle = "#fff";
      ctx.fillRect(e.x - 8, e.y - 8, 6, 6);
      ctx.fillRect(e.x + 5, e.y - 8, 6, 6);
    });
  },
};

const hoops = {
  canvas: $("hoopsCanvas"),
  score: 0,
  power: 0,
  charging: false,
  ball: null,
  reset() {
    clearTimer();
    hideResult();
    this.score = 0;
    this.power = 0;
    this.charging = false;
    this.ball = null;
    setStats({ score: 0, status: "准备开始" });
    this.draw();
  },
  start() {
    arcadeLoop(this, () => this.step());
  },
  move() {},
  stop() {},
  action() {
    if (this.ball) return;
    if (!this.charging) {
      this.charging = true;
      this.power = 0;
    } else {
      const p = 10 + this.power * 0.18;
      this.ball = { x: 88, y: 438, vx: 6.2, vy: -p };
      this.charging = false;
    }
  },
  step() {
    if (this.charging) this.power = (this.power + 3) % 100;
    if (this.ball) {
      this.ball.x += this.ball.vx;
      this.ball.y += this.ball.vy;
      this.ball.vy += 0.42;
      if (this.ball.x > 423 && this.ball.x < 484 && this.ball.y > 170 && this.ball.y < 220 && this.ball.vy > 0) {
        this.score += 30;
        this.ball = null;
      } else if (this.ball.y > 580 || this.ball.x > 590) {
        this.ball = null;
      }
    }
    setStats({ score: this.score, status: this.charging ? "蓄力中" : "进行中" });
    this.draw();
  },
  draw() {
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, 560, 560);
    ctx.fillStyle = "#ffe9b5";
    ctx.fillRect(0, 0, 560, 560);
    ctx.fillStyle = "#efb166";
    ctx.fillRect(0, 430, 560, 130);
    ctx.strokeStyle = "#1f2a33";
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(470, 120); ctx.lineTo(470, 430); ctx.stroke();
    ctx.strokeStyle = "#ff6b5f";
    ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(455, 200, 36, 0, Math.PI, false); ctx.stroke();
    ctx.fillStyle = "#243224";
    roundRect(ctx, 56, 368, 42, 70, 10);
    ctx.fillStyle = "#f47b20";
    const ball = this.ball || { x: 88, y: 438 };
    ctx.beginPath(); ctx.arc(ball.x, ball.y, 17, 0, Math.PI * 2); ctx.fill();
    if (this.charging) {
      ctx.fillStyle = "#58cc02";
      roundRect(ctx, 40, 40, 4 * this.power, 18, 9);
    }
  },
};

const galaxy = {
  canvas: $("galaxyCanvas"),
  score: 0,
  ship: { x: 280, y: 470, vx: 0 },
  bullets: [],
  rocks: [],
  tick: 0,
  reset() {
    clearTimer();
    hideResult();
    this.score = 0;
    this.ship = { x: 280, y: 470, vx: 0 };
    this.bullets = [];
    this.rocks = [];
    this.tick = 0;
    setStats({ score: 0, status: "准备开始" });
    this.draw();
  },
  start() {
    arcadeLoop(this, () => this.step());
  },
  move(dir) {
    this.ship.vx = dir * 7;
  },
  stop() {
    this.ship.vx = 0;
  },
  action() {
    this.bullets.push({ x: this.ship.x, y: this.ship.y - 20, vy: -9 });
  },
  step() {
    this.tick++;
    this.ship.x = Math.max(30, Math.min(530, this.ship.x + this.ship.vx));
    if (this.tick % 30 === 0) this.rocks.push({ x: 35 + Math.random() * 490, y: -20, vy: 2.5 + Math.random() * 2 });
    this.bullets.forEach((b) => b.y += b.vy);
    this.rocks.forEach((r) => r.y += r.vy);
    for (const r of this.rocks) {
      for (const b of this.bullets) {
        if (Math.hypot(r.x - b.x, r.y - b.y) < 24) {
          r.hit = true; b.hit = true; this.score += 15;
        }
      }
      if (Math.hypot(r.x - this.ship.x, r.y - this.ship.y) < 28) {
        setBest(this.score);
        showResult("银河守卫结束", `最终分数：${this.score}。`);
        return;
      }
    }
    this.rocks = this.rocks.filter((r) => !r.hit && r.y < 590);
    this.bullets = this.bullets.filter((b) => !b.hit && b.y > -20);
    setStats({ score: this.score, status: "进行中" });
    this.draw();
  },
  draw() {
    const ctx = this.canvas.getContext("2d");
    ctx.clearRect(0, 0, 560, 560);
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, 560, 560);
    ctx.fillStyle = "#1cb0f6";
    ctx.beginPath();
    ctx.moveTo(this.ship.x, this.ship.y - 26);
    ctx.lineTo(this.ship.x - 22, this.ship.y + 22);
    ctx.lineTo(this.ship.x + 22, this.ship.y + 22);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#ffc83d";
    this.bullets.forEach((b) => roundRect(ctx, b.x - 3, b.y - 12, 6, 18, 3));
    this.rocks.forEach((r) => {
      ctx.fillStyle = "#a78bfa";
      ctx.beginPath(); ctx.arc(r.x, r.y, 20, 0, Math.PI * 2); ctx.fill();
    });
  },
};

const games = {
  snake: {
    name: "贪吃蛇",
    help: "方向键、WASD 或移动端摇杆控制移动，摇杆轻推即可转向。",
    canvas: snake.canvas,
    reset: () => snake.reset(),
    start: () => snake.start(),
  },
  tetris: {
    name: "俄罗斯方块",
    help: "方向键移动，↑ 或 W 旋转。安卓端可用左右键移动，点击棋盘空白处旋转，点击下落快速落下。",
    canvas: $("tetrisWrap"),
    reset: () => tetris.reset(),
    start: () => tetris.start(),
  },
  gomoku: {
    name: "五子棋",
    help: "黑白双方轮流点击棋盘落子，横竖斜任意五子连线获胜。",
    canvas: gomoku.canvas,
    reset: () => gomoku.reset(),
    start: () => gomoku.start(),
  },
  xiangqi: {
    name: "象棋",
    help: "点击棋子选中，再点击目标位置移动。人机模式使用本地 xqwlight 引擎离线计算。",
    canvas: xiangqi.el,
    reset: () => xiangqi.reset(),
    start: () => xiangqi.start(),
  },
  shooter: {
    name: "像素突击",
    help: "左右移动，动作键射击。原创街机风横版突击。",
    canvas: shooter.canvas,
    reset: () => shooter.reset(),
    start: () => shooter.start(),
  },
  hoops: {
    name: "街头投篮",
    help: "点击动作键开始蓄力，再点一次投篮。",
    canvas: hoops.canvas,
    reset: () => hoops.reset(),
    start: () => hoops.start(),
  },
  galaxy: {
    name: "银河守卫",
    help: "左右移动，动作键射击，击落陨石。",
    canvas: galaxy.canvas,
    reset: () => galaxy.reset(),
    start: () => galaxy.start(),
  },
};

const categoryNames = {
  mini: "小游戏",
  board: "棋牌类",
  arcade: "街机类",
};

function showLibrary(category) {
  clearTimer();
  hideResult();
  ui.home.classList.remove("active");
  ui.gameScreen.classList.remove("active");
  ui.library.classList.add("active");
  ui.categoryTitle.textContent = categoryNames[category] || "游戏";
  document.querySelectorAll(".game-choice").forEach((card) => {
    card.style.display = card.dataset.category === category ? "" : "none";
  });
}

function switchGame(id) {
  clearTimer();
  hideResult();
  activeGame = id;
  ui.home.classList.remove("active");
  ui.library.classList.remove("active");
  ui.gameScreen.classList.add("active");
  document.querySelectorAll(".game-choice").forEach((b) => b.classList.toggle("active", b.dataset.game === id));
  document.querySelectorAll(".game-canvas, .xiangqi-board, .tetris-wrap").forEach((c) => c.classList.remove("active"));
  games[id].canvas.classList.add("active");
  ui.game.textContent = games[id].name;
  ui.gameTitle.textContent = games[id].name;
  ui.helpTitle.textContent = "操作";
  ui.helpText.textContent = games[id].help;
  ui.speedControl.classList.toggle("hidden", id !== "snake");
  ui.modeControl.classList.toggle("hidden", id !== "gomoku" && id !== "xiangqi");
  ui.difficultyControl.classList.toggle("hidden", id !== "gomoku" && id !== "xiangqi");
  ui.snakeStick.classList.toggle("show", id === "snake");
  ui.tetrisControls.classList.toggle("show", id === "tetris");
  ui.arcadeControls.classList.toggle("show", id === "shooter" || id === "hoops" || id === "galaxy");
  ui.boardTip.classList.toggle("show", id === "gomoku" || id === "xiangqi");
  games[id].reset();
  games[id].start();
}

function showHome() {
  clearTimer();
  hideResult();
  ui.settingsModal.classList.remove("show");
  ui.gameScreen.classList.remove("active");
  ui.library.classList.remove("active");
  ui.home.classList.add("active");
  ui.snakeStick.classList.remove("show");
  ui.tetrisControls.classList.remove("show");
  ui.arcadeControls.classList.remove("show");
  ui.boardTip.classList.remove("show");
  document.querySelectorAll(".game-canvas, .xiangqi-board, .tetris-wrap").forEach((c) => c.classList.remove("active"));
  document.querySelectorAll(".game-choice").forEach((b) => b.classList.remove("active"));
}

function openSettings() {
  clearTimer();
  ui.settingsSummary.textContent = `${games[activeGame].name} 已暂停。`;
  ui.settingsModal.classList.add("show");
}

function resumeGame() {
  ui.settingsModal.classList.remove("show");
  games[activeGame].start();
}

document.querySelectorAll(".category-card").forEach((b) => b.addEventListener("click", () => showLibrary(b.dataset.category)));
document.querySelectorAll(".game-choice").forEach((b) => b.addEventListener("click", () => switchGame(b.dataset.game)));
ui.libraryBack.addEventListener("click", showHome);
ui.settingsButton.addEventListener("click", openSettings);
ui.resume.addEventListener("click", resumeGame);
ui.settingsRestart.addEventListener("click", () => {
  ui.settingsModal.classList.remove("show");
  games[activeGame].reset();
  games[activeGame].start();
});
ui.settingsHome.addEventListener("click", showHome);
ui.start.addEventListener("click", () => games[activeGame].start());
ui.reset.addEventListener("click", () => games[activeGame].reset());
ui.modalRestart.addEventListener("click", () => {
  games[activeGame].reset();
  games[activeGame].start();
});
ui.fall.addEventListener("click", (e) => {
  e.stopPropagation();
  if (activeGame === "tetris") tetris.hardDrop();
});
bindHoldButton(ui.tetrisLeft, () => {
  if (activeGame === "tetris") tetris.move(-1, 0);
});
bindHoldButton(ui.tetrisRight, () => {
  if (activeGame === "tetris") tetris.move(1, 0);
});
ui.tetrisRotate.addEventListener("click", (e) => {
  e.stopPropagation();
  if (activeGame === "tetris") tetris.rotate();
});
bindHoldButton(ui.arcadeLeft, () => {
  if (games[activeGame]?.move) games[activeGame].move(-1);
});
bindHoldButton(ui.arcadeRight, () => {
  if (games[activeGame]?.move) games[activeGame].move(1);
});
["pointerup", "pointercancel", "pointerleave"].forEach((eventName) => {
  ui.arcadeLeft.addEventListener(eventName, () => games[activeGame]?.stop?.());
  ui.arcadeRight.addEventListener(eventName, () => games[activeGame]?.stop?.());
});
ui.arcadeAction.addEventListener("click", (e) => {
  e.stopPropagation();
  games[activeGame]?.action?.();
});
ui.snakeSpeed.addEventListener("change", () => {
  if (activeGame !== "snake" || snake.ended || !runningLoop) return;
  clearTimer();
  runningLoop = setInterval(() => snake.step(), Number(ui.snakeSpeed.value));
});
snake.canvas.addEventListener("click", (e) => snake.tap(e));
tetris.canvas.addEventListener("click", () => tetris.tap());
gomoku.canvas.addEventListener("click", (e) => gomoku.click(e));

let joystickActive = false;
function updateJoystick(e) {
  if (activeGame !== "snake" || snake.ended) return;
  const rect = ui.snakeStick.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = e.clientX - cx;
  const dy = e.clientY - cy;
  const distance = Math.hypot(dx, dy);
  const max = rect.width * 0.3;
  const ratio = distance > max ? max / distance : 1;
  const kx = dx * ratio;
  const ky = dy * ratio;
  ui.joystickKnob.style.transform = `translate(calc(-50% + ${kx}px), calc(-50% + ${ky}px))`;
  if (distance < 10) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    snake.turn(dx > 0 ? 1 : -1, 0);
  } else {
    snake.turn(0, dy > 0 ? 1 : -1);
  }
}

ui.snakeStick.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  joystickActive = true;
  ui.snakeStick.setPointerCapture?.(e.pointerId);
  updateJoystick(e);
});
ui.snakeStick.addEventListener("pointermove", (e) => {
  if (joystickActive) updateJoystick(e);
});
["pointerup", "pointercancel", "lostpointercapture"].forEach((eventName) => {
  ui.snakeStick.addEventListener(eventName, () => {
    joystickActive = false;
    ui.joystickKnob.style.transform = "translate(-50%, -50%)";
  });
});

document.addEventListener("keydown", (e) => {
  if (ui.modal.classList.contains("show")) return;
  if (activeGame === "snake") {
    if (["ArrowUp", "w", "W"].includes(e.key)) snake.turn(0, -1);
    if (["ArrowDown", "s", "S"].includes(e.key)) snake.turn(0, 1);
    if (["ArrowLeft", "a", "A"].includes(e.key)) snake.turn(-1, 0);
    if (["ArrowRight", "d", "D"].includes(e.key)) snake.turn(1, 0);
  }
  if (activeGame === "tetris") {
    if (["ArrowLeft", "a", "A"].includes(e.key)) tetris.move(-1, 0);
    if (["ArrowRight", "d", "D"].includes(e.key)) tetris.move(1, 0);
    if (["ArrowDown", "s", "S"].includes(e.key)) tetris.drop();
    if (["ArrowUp", "w", "W"].includes(e.key)) tetris.rotate();
    if (e.code === "Space") {
      e.preventDefault();
      tetris.hardDrop();
    }
  }
  if (["shooter", "hoops", "galaxy"].includes(activeGame)) {
    if (["ArrowLeft", "a", "A"].includes(e.key)) games[activeGame].move?.(-1);
    if (["ArrowRight", "d", "D"].includes(e.key)) games[activeGame].move?.(1);
    if (e.code === "Space" || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
      e.preventDefault();
      games[activeGame].action?.();
    }
  }
});

document.addEventListener("keyup", (e) => {
  if (["shooter", "hoops", "galaxy"].includes(activeGame) && ["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(e.key)) {
    games[activeGame].stop?.();
  }
});

showHome();
