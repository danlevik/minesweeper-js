const container = document.querySelector(".container");
const panel = document.querySelector(".panel");
const smile = document.querySelector(".sprite-smile");

const closeCellClasses = [
  "sprite-field__def",
  "sprite-field__question",
  "sprite-field__flag",
];

let field = [];
let bombs = [];
let counter = 40;
let closedCells = 216;
let time = 0;
let game = false;

function drawField() {
  let field = document.createElement("div");
  field.classList.add("field");

  for (let i = 0; i < 16; i++) {
    let row = document.createElement("div");
    row.classList.add("row");
    for (let j = 0; j < 16; j++) {
      let cell = document.createElement("div");
      cell.classList.add("cell");
      cell.classList.add("sprite-field");
      cell.classList.add("sprite-field__def");

      cell.setAttribute("i", i);
      cell.setAttribute("j", j);

      row.appendChild(cell);
    }
    field.appendChild(row);
  }

  container.appendChild(field);
}

function drawCounter() {
  if (document.querySelector(".counter")) {
    document.querySelector(".counter").remove();
  }

  let counterEl = document.createElement("div");
  counterEl.classList.add("scoreboard");
  counterEl.classList.add("counter");
  let one = document.createElement("div");
  one.classList.add("sprite-num");
  one.classList.add("sprite-num__0");
  let two = document.createElement("div");
  two.classList.add("sprite-num");
  two.classList.add(`sprite-num__${Math.floor(counter / 10)}`);
  let three = document.createElement("div");
  three.classList.add("sprite-num");
  three.classList.add(`sprite-num__${counter % 10}`);

  counterEl.appendChild(one);
  counterEl.appendChild(two);
  counterEl.appendChild(three);

  panel.prepend(counterEl);
}

function drawTimer() {
  if (document.querySelector(".timer")) {
    document.querySelector(".timer").remove();
  }

  let timerEl = document.createElement("div");
  timerEl.classList.add("scoreboard");
  timerEl.classList.add("timer");
  let one = document.createElement("div");
  one.classList.add("sprite-num");
  one.classList.add(`sprite-num__${Math.floor(time / 100)}`);
  let two = document.createElement("div");
  two.classList.add("sprite-num");
  two.classList.add(`sprite-num__${Math.floor((time % 100) / 10)}`);
  let three = document.createElement("div");
  three.classList.add("sprite-num");
  three.classList.add(`sprite-num__${time % 10}`);

  timerEl.appendChild(one);
  timerEl.appendChild(two);
  timerEl.appendChild(three);

  panel.append(timerEl);
}

function drawAllBombs() {
  for (let k = 0; k < 40; k++) {
    const i = Math.floor(bombs[k] / 16);
    const j = bombs[k] % 16;
    let el = document.querySelector(`.cell[i='${i}'][j='${j}']`);
    if (
      el.classList.contains("sprite-field__def") ||
      el.classList.contains("sprite-field__question")
    ) {
      el.classList.remove("sprite-field__def");
      el.classList.remove("sprite-field__question");
      el.classList.add("sprite-field__mine");
    } else if (el.classList.contains("sprite-field__flag")) {
      el.classList.remove("sprite-field__flag");
      el.classList.add("sprite-field__mine_defected");
    }
  }

  smile.classList.remove("sprite-smile__def");
  smile.classList.add("sprite-smile__lose");
}

function hasNeighbourBomb(i, j) {
  return field[i][j] > 0;
}

function openCell(cell) {
  if (closeCellClasses.some((el) => cell.classList.contains(el))) {
    cell.classList.remove("sprite-field__def");
    cell.classList.remove("sprite-field__question");
    if (cell.classList.contains("sprite-field__flag")) {
      cell.classList.remove("sprite-field__flag");
      counter += 1;
      if (counter > 40) {
        counter = 40;
      }
      drawCounter();
    }
    let i = parseInt(cell.getAttribute("i"));
    let j = parseInt(cell.getAttribute("j"));
    if (field[i][j] >= 9) {
      cell.classList.add("sprite-field__mine_pressed");
      return;
    } else if (field[i][j] == 0) {
      cell.classList.add(`sprite-field__empty`);
    } else {
      cell.classList.add(`sprite-field__${field[i][j]}`);
    }

    closedCells -= 1;

    if (!hasNeighbourBomb(i, j)) {
      for (let k = i - 1; k < i + 2; k++) {
        for (let m = j - 1; m < j + 2; m++) {
          if (k >= 0 && k <= 15 && m >= 0 && m <= 15) {
            let el = document.querySelector(`.cell[i='${k}'][j='${m}']`);
            openCell(el);
          }
        }
      }
    }
  }
}

drawField();
drawCounter();
drawTimer();

// Перезапуск игры
smile.addEventListener("click", function (e) {
  resetGame();
});

smile.addEventListener("mousedown", function () {
  smile.classList.remove("sprite-smile__lose");
  smile.classList.remove("sprite-smile__win");

  smile.classList.remove("sprite-smile__def");
  smile.classList.add("sprite-smile__pressed");
});

smile.addEventListener("mouseup", function () {
  smile.classList.add("sprite-smile__def");
  smile.classList.remove("sprite-smile__pressed");
});

// Открытие ячейки
container.addEventListener("click", function (e) {
  const clicked = e.target.closest(".sprite-field");

  if (!clicked) return;

  if (!game) {
    game = true;
    initGame(clicked);
  }
  openCell(clicked);

  if (clicked.classList.contains("sprite-field__mine_pressed")) {
    stopTimer();
    drawAllBombs();
  } else if (closedCells == 0) {
    stopTimer();
    smile.classList.remove("sprite-smile__def");
    smile.classList.add("sprite-smile__win");
  }
  console.log(closedCells);
});

// Установить флаг/вопрос
container.addEventListener("contextmenu", function (e) {
  e.preventDefault();
  const clicked = e.target.closest(".sprite-field");

  if (
    !clicked ||
    !closeCellClasses.some((el) => clicked.classList.contains(el))
  )
    return;

  if (!clicked.classList.contains("sprite-field__empty")) {
    if (clicked.classList.contains("sprite-field__def")) {
      clicked.classList.remove("sprite-field__def");
      clicked.classList.add("sprite-field__flag");
      counter -= 1;
      if (counter < 0) {
        counter = 0;
      }
    } else if (clicked.classList.contains("sprite-field__flag")) {
      clicked.classList.remove("sprite-field__flag");
      clicked.classList.add("sprite-field__question");

      counter += 1;

      if (counter > 40) {
        counter = 40;
      }
    } else {
      clicked.classList.remove("sprite-field__question");
      clicked.classList.add("sprite-field__def");
    }

    drawCounter();
  }
});

// Зажатие/отжатие ячейки
function changeSmileOnCellClick(e) {
  const clicked = e.target.closest(".sprite-field");
  const smile = document.querySelector(".sprite-smile");

  if (!clicked) return;

  smile.classList.toggle("sprite-smile__def");
  smile.classList.toggle("sprite-smile__wait");
}

container.addEventListener("mousedown", changeSmileOnCellClick);
container.addEventListener("mouseup", changeSmileOnCellClick);

function fillAroundBomb(i, j) {
  for (let k = i - 1; k < i + 2; k++) {
    for (let m = j - 1; m < j + 2; m++) {
      if (k >= 0 && k <= 15 && m >= 0 && m <= 15) {
        field[k][m] += 1;
      }
    }
  }
}

function fillField() {
  initField();

  for (let k = 0; k < 40; k++) {
    const i = Math.floor(bombs[k] / 16);
    const j = bombs[k] % 16;
    field[i][j] = 9;
    fillAroundBomb(i, j);
  }
}

function shuffle(array) {
  let i = array.length;
  let j = 0;
  let temp;

  while (i--) {
    j = Math.floor(Math.random() * (i + 1));

    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  return array;
}

function initField() {
  field = [];
  for (let i = 0; i < 16; i++) {
    field.push([]);
    for (let j = 0; j < 16; j++) {
      field[i].push(0);
    }
  }
}

function initGame(cell) {
  let i = cell.getAttribute("i");
  let j = cell.getAttribute("j");

  while (true) {
    field = [];
    bombs = [];

    timer = 0;
    initField();
    drawCounter();

    for (let i = 0; i < 256; i++) {
      bombs.push(i);
    }

    shuffle(bombs);
    fillField(bombs);

    if (field[i][j] == 0) {
      break;
    }
  }

  startTimer();
}

function startTimer() {
  countdown = setInterval(function () {
    time += 1;
    if (time >= 999) {
      time = 999;
    }
    drawTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(countdown);
}

function resetTimer() {
  time = 0;
}

function resetGame() {
  game = false;
  field = [];
  initField();
  bombs = [];
  counter = 40;
  closedCells = 216;
  stopTimer();
  resetTimer();
  drawTimer();
  drawCounter();

  document.querySelector(".field").remove();

  drawField();
}
