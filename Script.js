const ticketEl = document.getElementById("ticket");
const boardEl = document.getElementById("board");

const calledCountEl = document.getElementById("calledCount");
const remainingCountEl = document.getElementById("remainingCount");
const currentNumberEl = document.getElementById("currentNumber");

const bigNumberEl = document.getElementById("bigNumber");
const messageEl = document.getElementById("message");

const callBtn = document.getElementById("callBtn");
const newGameBtn = document.getElementById("newGameBtn");
const newTicketBtn = document.getElementById("newTicketBtn");

const claimsList = document.getElementById("claimsList");

let calledNumbers = [];
let ticket = [];
let markedNumbers = new Set();

let winners = {
  top: false,
  middle: false,
  bottom: false,
  full: false
};


// --------------------------------------------------
// SHUFFLE
// --------------------------------------------------

function shuffle(array) {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}


// --------------------------------------------------
// RANDOM NUMBER
// --------------------------------------------------

function randomNumber(min, max) {
  return Math.floor(
    Math.random() * (max - min + 1)
  ) + min;
}


// --------------------------------------------------
// CREATE PROPER HOUSIE TICKET
// --------------------------------------------------

function createTicket() {

  const grid = Array.from(
    { length: 3 },
    () => Array(9).fill(null)
  );

  // Every row has exactly 5 numbers
  const rowColumns = [];

  for (let row = 0; row < 3; row++) {

    const columns = shuffle(
      [0,1,2,3,4,5,6,7,8]
    ).slice(0, 5);

    columns.sort((a, b) => a - b);

    rowColumns.push(columns);
  }

  // Make sure every column has at least one number
  for (let col = 0; col < 9; col++) {

    if (!rowColumns.some(row => row.includes(col))) {

      const possibleRows = [0,1,2]
        .filter(row => rowColumns[row].length > 1);

      const row = possibleRows[
        randomNumber(0, possibleRows.length - 1)
      ];

      const removeIndex = randomNumber(
        0,
        rowColumns[row].length - 1
      );

      rowColumns[row].splice(removeIndex, 1);

      rowColumns[row].push(col);

      rowColumns[row].sort((a,b) => a-b);
    }
  }

  // Generate numbers column-wise
  for (let col = 0; col < 9; col++) {

    let min;
    let max;

    if (col === 0) {
      min = 1;
      max = 9;
    } else if (col === 8) {
      min = 80;
      max = 90;
    } else {
      min = col * 10;
      max = col * 10 + 9;
    }

    const rows = [0,1,2].filter(
      row => rowColumns[row].includes(col)
    );

    const numbers = shuffle(
      Array.from(
        { length: max - min + 1 },
        (_, i) => min + i
      )
    ).slice(0, rows.length);

    numbers.sort((a,b) => a-b);

    rows.forEach((row, index) => {
      grid[row][col] = numbers[index];
    });
  }

  return grid.flat();
}


// --------------------------------------------------
// NEW TICKET
// --------------------------------------------------

function newTicket() {

  ticket = createTicket();

  markedNumbers.clear();

  renderTicket();
}


// --------------------------------------------------
// RENDER TICKET
// --------------------------------------------------

function renderTicket() {

  ticketEl.innerHTML = "";

  ticket.forEach((number, index) => {

    const cell = document.createElement("div");

    cell.className = "ticket-cell";

    if (number === null) {

      cell.classList.add("empty");

    } else {

      cell.textContent = number;

      if (markedNumbers.has(number)) {
        cell.classList.add("marked");
      }

      if (calledNumbers.includes(number)) {
        cell.classList.add("called-number");
      }

      cell.addEventListener("click", () => {

        // Only called numbers can be marked
        if (!calledNumbers.includes(number)) {
          return;
        }

        if (markedNumbers.has(number)) {
          markedNumbers.delete(number);
        } else {
          markedNumbers.add(number);
        }

        renderTicket();
        checkAutomaticClaims();

      });

    }

    ticketEl.appendChild(cell);

  });

}


// --------------------------------------------------
// CREATE BOARD
// --------------------------------------------------

function createBoard() {

  boardEl.innerHTML = "";

  for (let i = 1; i <= 90; i++) {

    const cell = document.createElement("div");

    cell.className = "board-number";

    cell.id = `board-${i}`;

    cell.textContent = i;

    boardEl.appendChild(cell);
  }

}


// --------------------------------------------------
// UPDATE BOARD
// --------------------------------------------------

function updateBoard() {

  for (let i = 1; i <= 90; i++) {

    const cell = document.getElementById(`board-${i}`);

    if (!cell) continue;

    cell.classList.remove("called");
    cell.classList.remove("current");

    if (calledNumbers.includes(i)) {
      cell.classList.add("called");
    }

    if (
      calledNumbers.length > 0 &&
      calledNumbers[calledNumbers.length - 1] === i
    ) {
      cell.classList.add("current");
    }

  }

}


// --------------------------------------------------
// CALL NUMBER
// --------------------------------------------------

function callNumber() {

  if (calledNumbers.length >= 90) {

    messageEl.textContent = "All numbers called!";

    callBtn.disabled = true;

    return;
  }

  const available = [];

  for (let i = 1; i <= 90; i++) {

    if (!calledNumbers.includes(i)) {
      available.push(i);
    }

  }

  const number =
    available[
      randomNumber(0, available.length - 1)
    ];

  calledNumbers.push(number);

  currentNumberEl.textContent = number;
  bigNumberEl.textContent = number;

  messageEl.textContent =
    `Number ${number} called!`;

  calledCountEl.textContent =
    calledNumbers.length;

  remainingCountEl.textContent =
    90 - calledNumbers.length;

  updateBoard();
  renderTicket();

  if (calledNumbers.length === 90) {
    callBtn.disabled = true;
  }

}


// --------------------------------------------------
// CHECK LINE
// --------------------------------------------------

function checkLine(row) {

  const start = row * 9;

  const numbers = ticket.slice(
    start,
    start + 9
  ).filter(n => n !== null);

  return numbers.every(
    number => markedNumbers.has(number)
  );

}


// --------------------------------------------------
// FULL HOUSE
// --------------------------------------------------

function checkFullHouse() {

  const numbers = ticket.filter(
    number => number !== null
  );

  return numbers.length === 15 &&
    numbers.every(
      number => markedNumbers.has(number)
    );
}


// --------------------------------------------------
// ADD WINNER
// --------------------------------------------------

function addWinner(type, title) {

  if (winners[type]) return;

  winners[type] = true;

  const item = document.createElement("div");

  item.className = "winner";

  item.innerHTML =
    `<strong>🏆 ${title}</strong><br>
     Congratulations! You completed this claim.`;

  if (
    claimsList.querySelector(".no-winner")
  ) {
    claimsList.innerHTML = "";
  }

  claimsList.appendChild(item);

}


// --------------------------------------------------
// AUTOMATIC CLAIM CHECK
// --------------------------------------------------

function checkAutomaticClaims() {

  if (checkLine(0)) {
    addWinner("top", "Top Line");
  }

  if (checkLine(1)) {
    addWinner("middle", "Middle Line");
  }

  if (checkLine(2)) {
    addWinner("bottom", "Bottom Line");
  }

  if (checkFullHouse()) {
    addWinner("full", "FULL HOUSE");
  }

}


// --------------------------------------------------
// MANUAL CLAIM BUTTON
// --------------------------------------------------

document.querySelectorAll(
  "[data-claim]"
).forEach(button => {

  button.addEventListener("click", () => {

    const type = button.dataset.claim;

    if (type === "top") {

      if (checkLine(0)) {
        addWinner("top", "Top Line");
      } else {
        alert(
          "❌ Top Line is not complete yet."
        );
      }

    }

    if (type === "middle") {

      if (checkLine(1)) {
        addWinner("middle", "Middle Line");
      } else {
        alert(
          "❌ Middle Line is not complete yet."
        );
      }

    }

    if (type === "bottom") {

      if (checkLine(2)) {
        addWinner("bottom", "Bottom Line");
      } else {
        alert(
          "❌ Bottom Line is not complete yet."
        );
      }

    }

    if (type === "full") {

      if (checkFullHouse()) {
        addWinner("full", "FULL HOUSE");
      } else {
        alert(
          "❌ Full House is not complete yet."
        );
      }

    }

  });

});


// --------------------------------------------------
// NEW GAME
// --------------------------------------------------

function newGame() {

  calledNumbers = [];

  markedNumbers.clear();

  winners = {
    top: false,
    middle: false,
    bottom: false,
    full: false
  };

  currentNumberEl.textContent = "-";

  bigNumberEl.textContent = "-";

  messageEl.textContent =
    "Ready to play?";

  calledCountEl.textContent = "0";

  remainingCountEl.textContent = "90";

  callBtn.disabled = false;

  claimsList.innerHTML =
    `<p class="no-winner">
      No winners yet
    </p>`;

  createBoard();

  newTicket();

  updateBoard();

}


// --------------------------------------------------
// BUTTON EVENTS
// --------------------------------------------------

callBtn.addEventListener(
  "click",
  callNumber
);

newGameBtn.addEventListener(
  "click",
  newGame
);

newTicketBtn.addEventListener(
  "click",
  newTicket
);


// --------------------------------------------------
// START GAME
// --------------------------------------------------

newGame();const ticketEl = document.getElementById("ticket");
const boardEl = document.getElementById("board");
const calledEl = document.getElementById("called");

let called = [];
let ticket = [];const ticketEl = document.getElementById("ticket");
const boardEl = document.getElementById("board");
const calledEl = document.getElementById("called");

let called = [];
let ticket = [];

// =============================
// SHUFFLE
// =============================
function shuffle(array) {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

// =============================
// GET NUMBERS FOR COLUMN
// =============================
function getColumnNumbers(column) {
  if (column === 0) {
    return Array.from({ length: 9 }, (_, i) => i + 1);
  }

  if (column === 8) {
    return Array.from({ length: 11 }, (_, i) => i + 80);
  }

  return Array.from(
    { length: 10 },
    (_, i) => column * 10 + i
  );
}

// =============================
// CREATE TAMBOLA TICKET
// =============================
function makeTicket() {
  ticket = Array(27).fill(null);

  const rowColumns = [];

  // Each row gets exactly 5 columns
  for (let row = 0; row < 3; row++) {
    rowColumns[row] = shuffle(
      Array.from({ length: 9 }, (_, i) => i)
    )
      .slice(0, 5)
      .sort((a, b) => a - b);
  }

  // Make sure every column has at least one number
  for (let column = 0; column < 9; column++) {
    const rowsWithColumn = [];

    for (let row = 0; row < 3; row++) {
      if (rowColumns[row].includes(column)) {
        rowsWithColumn.push(row);
      }
    }

    if (rowsWithColumn.length === 0) {
      const possibleRows = [0, 1, 2].filter(
        row => rowColumns[row].length > 1
      );

      const row =
        possibleRows[
          Math.floor(Math.random() * possibleRows.length)
        ];

      const removeIndex = Math.floor(
        Math.random() * rowColumns[row].length
      );

      rowColumns[row].splice(removeIndex, 1);
      rowColumns[row].push(column);
      rowColumns[row].sort((a, b) => a - b);
    }
  }

  // Put numbers into columns
  for (let column = 0; column < 9; column++) {
    const rows = [];

    for (let row = 0; row < 3; row++) {
      if (rowColumns[row].includes(column)) {
        rows.push(row);
      }
    }

    const numbers = shuffle(
      getColumnNumbers(column)
    )
      .slice(0, rows.length)
      .sort((a, b) => a - b);

    rows.forEach((row, index) => {
      ticket[row * 9 + column] = numbers[index];
    });
  }

  renderTicket();
}

// =============================
// RENDER TICKET
// =============================
function renderTicket() {
  if (!ticketEl) return;

  ticketEl.innerHTML = "";

  ticket.forEach(number => {
    const cell = document.createElement("div");

    if (number === null) {
      cell.className = "cell blank";
    } else {
      cell.className = "cell";
      cell.textContent = number;

      // Manual marking
      cell.addEventListener("click", () => {
        if (called.includes(number)) {
          cell.classList.toggle("marked");
        }
      });

      // Automatically mark called numbers
      if (called.includes(number)) {
        cell.classList.add("marked");
      }
    }

    ticketEl.appendChild(cell);
  });
}

// =============================
// RENDER 1 - 90 BOARD
// =============================
function renderBoard() {
  if (!boardEl) return;

  boardEl.innerHTML = "";

  for (let number = 1; number <= 90; number++) {
    const ball = document.createElement("div");

    ball.className = "ball";

    if (called.includes(number)) {
      ball.classList.add("called");
    }

    ball.textContent = number;

    boardEl.appendChild(ball);
  }
}

// =============================
// CALL NEXT NUMBER
// =============================
function nextNumber() {
  if (called.length >= 90) {
    calledEl.textContent = "All 90 numbers called!";
    return;
  }

  const remaining = [];

  for (let number = 1; number <= 90; number++) {
    if (!called.includes(number)) {
      remaining.push(number);
    }
  }

  const number =
    remaining[
      Math.floor(Math.random() * remaining.length)
    ];

  called.push(number);

  if (calledEl) {
    calledEl.textContent = number;
  }

  renderBoard();
  renderTicket();
}

// =============================
// RESET GAME
// =============================
function resetGame() {
  called = [];

  if (calledEl) {
    calledEl.textContent = "No number called yet";
  }

  renderBoard();
  renderTicket();
}

// =============================
// BUTTONS
// =============================
const newTicketBtn =
  document.getElementById("newTicket");

const nextBtn =
  document.getElementById("next");

const resetBtn =
  document.getElementById("reset");

if (newTicketBtn) {
  newTicketBtn.addEventListener(
    "click",
    makeTicket
  );
}

if (nextBtn) {
  nextBtn.addEventListener(
    "click",
    nextNumber
  );
}

if (resetBtn) {
  resetBtn.addEventListener(
    "click",
    resetGame
  );
}

// =============================
// START
// =============================
makeTicket();
renderBoard();

// -----------------------------
// Utility
// -----------------------------

function shuffle(array) {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

// Get numbers belonging to a column
function getColumnNumbers(column) {
  if (column === 0) {
    return Array.from({ length: 9 }, (_, i) => i + 1);
  }

  if (column === 8) {
    return Array.from({ length: 11 }, (_, i) => i + 80);
  }

  return Array.from({ length: 10 }, (_, i) => column * 10 + i);
}

// -----------------------------
// Generate proper Tambola ticket
// -----------------------------

function makeTicket() {
  ticket = Array(27).fill(null);

  // Select 5 columns for every row
  let rowColumns = [];

  for (let row = 0; row < 3; row++) {
    rowColumns[row] = shuffle(
      Array.from({ length: 9 }, (_, i) => i)
    )
      .slice(0, 5)
      .sort((a, b) => a - b);
  }

  // Make sure every column has at least one number
  for (let column = 0; column < 9; column++) {
    const rows = [];

    for (let row = 0; row < 3; row++) {
      if (rowColumns[row].includes(column)) {
        rows.push(row);
      }
    }

    if (rows.length === 0) {
      // Find a row which currently has more than 1 column
      const possibleRows = [0, 1, 2].filter(
        row => rowColumns[row].length > 1
      );

      const row =
        possibleRows[
          Math.floor(Math.random() * possibleRows.length)
        ];

      const removeIndex = Math.floor(
        Math.random() * rowColumns[row].length
      );

      rowColumns[row].splice(removeIndex, 1);
      rowColumns[row].push(column);
      rowColumns[row].sort((a, b) => a - b);
    }
  }

  // Put numbers into each column
  for (let column = 0; column < 9; column++) {
    const rows = [];

    for (let row = 0; row < 3; row++) {
      if (rowColumns[row].includes(column)) {
        rows.push(row);
      }
    }

    const numbers = shuffle(
      getColumnNumbers(column)
    )
      .slice(0, rows.length)
      .sort((a, b) => a - b);

    rows.forEach((row, index) => {
      ticket[row * 9 + column] = numbers[index];
    });
  }

  renderTicket();
}

// -----------------------------
// Render Ticket
// -----------------------------

function renderTicket() {
  if (!ticketEl) return;

  ticketEl.innerHTML = "";

  ticket.forEach(number => {
    const cell = document.createElement("div");

    if (number === null) {
      cell.className = "cell blank";
      cell.textContent = "";
    } else {
      cell.className = "cell";
      cell.textContent = number;

      // Click to mark manually
      cell.addEventListener("click", () => {
        if (called.includes(number)) {
          cell.classList.toggle("marked");
        }
      });

      // Automatically mark called numbers
      if (called.includes(number)) {
        cell.classList.add("marked");
      }
    }

    ticketEl.appendChild(cell);
  });
}

// -----------------------------
// Render 1 - 90 Board
// -----------------------------

function renderBoard() {
  if (!boardEl) return;

  boardEl.innerHTML = "";

  for (let number = 1; number <= 90; number++) {
    const ball = document.createElement("div");

    ball.className = "ball";

    if (called.includes(number)) {
      ball.classList.add("called");
    }

    ball.textContent = number;

    boardEl.appendChild(ball);
  }
}

// -----------------------------
// Call Next Number
// -----------------------------

function nextNumber() {
  if (called.length >= 90) {
    calledEl.textContent = "All 90 numbers called!";
    return;
  }

  const remaining = [];

  for (let number = 1; number <= 90; number++) {
    if (!called.includes(number)) {
      remaining.push(number);
    }
  }

  const number =
    remaining[
      Math.floor(Math.random() * remaining.length)
    ];

  called.push(number);

  calledEl.textContent = number;

  renderBoard();
  renderTicket();
}

// -----------------------------
// Reset Game
// -----------------------------

function resetGame() {
  called = [];

  if (calledEl) {
    calledEl.textContent = "No number called yet";
  }

  renderBoard();
  renderTicket();
}

// -----------------------------
// Generate New Ticket
// -----------------------------

function newTicket() {
  makeTicket();
}

// -----------------------------
// Buttons
// -----------------------------

const newTicketBtn =
  document.getElementById("newTicket");

const nextBtn =
  document.getElementById("next");

const resetBtn =
  document.getElementById("reset");

if (newTicketBtn) {
  newTicketBtn.addEventListener(
    "click",
    newTicket
  );
}

if (nextBtn) {
  nextBtn.addEventListener(
    "click",
    nextNumber
  );
}

if (resetBtn) {
  resetBtn.addEventListener(
    "click",
    resetGame
  );
}

// -----------------------------
// Start
// -----------------------------

makeTicket();
renderBoard();const ticketEl = document.getElementById("ticket");
const boardEl = document.getElementById("board");
const calledEl = document.getElementById("called");

let called = [];
let ticket = [];

// Shuffle array
function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

// Generate a proper Housie/Tambola ticket
function makeTicket() {
  ticket = Array(27).fill(null);

  // Choose exactly 5 columns for each row
  const rowColumns = [];

  for (let row = 0; row < 3; row++) {
    rowColumns.push(
      shuffle([...Array(9).keys()])
        .slice(0, 5)
        .sort((a, b) => a - b)
    );
  }

  // Make sure every column has at least one number
  for (let column = 0; column < 9; column++) {
    const hasNumber = rowColumns.some(cols =>
      cols.includes(column)
    );

    if (!hasNumber) {
      const row = Math.floor(Math.random() * 3);

      // Remove one existing column from that row
      const removeIndex = Math.floor(
        Math.random() * rowColumns[row].length
      );

      rowColumns[row].splice(removeIndex, 1);
      rowColumns[row].push(column);
      rowColumns[row].sort((a, b) => a - b);
    }
  }

  // Generate numbers for each column
  for (let column = 0; column < 9; column++) {
    let min;
    let max;

    if (column === 0) {
      min = 1;
      max = 9;
    } else if (column === 8) {
      min = 80;
      max = 90;
    } else {
      min = column * 10;
      max = column * 10 + 9;
    }

    const rows = [];

    for (let row = 0; row < 3; row++) {
      if (rowColumns[row].includes(column)) {
        rows.push(row);
      }
    }

    // Generate unique numbers for this column
    const numbers = shuffle(
      Array.from(
        { length: max - min + 1 },
        (_, i) => min + i
      )
    )
      .slice(0, rows.length)
      .sort((a, b) => a - b);

    rows.forEach((row, index) => {
      ticket[row * 9 + column] = numbers[index];
    });
  }

  renderTicket();
}

// Render ticket
function renderTicket() {
  ticketEl.innerHTML = "";

  ticket.forEach((number) => {
    const cell = document.createElement("div");

    if (number === null) {
      cell.className = "cell blank";
      cell.textContent = "";
    } else {
      cell.className = "cell";
      cell.textContent = number;

      // Mark when clicked
      cell.onclick = () => {
        cell.classList.toggle("marked");
      };

      // Automatically mark called numbers
      if (called.includes(number)) {
        cell.classList.add("marked");
      }
    }

    ticketEl.appendChild(cell);
  });
}

// Render 1-90 board
function renderBoard() {
  boardEl.innerHTML = "";

  for (let number = 1; number <= 90; number++) {
    const ball = document.createElement("div");

    ball.className = "ball";

    if (called.includes(number)) {
      ball.classList.add("called");
    }

    ball.textContent = number;

    boardEl.appendChild(ball);
  }
}

// Call next random number
function nextNumber() {
  // All numbers called
  if (called.length >= 90) {
    calledEl.textContent = "All 90 numbers called!";
    return;
  }

  // Find numbers not called yet
  const remaining = [];

  for (let number = 1; number <= 90; number++) {
    if (!called.includes(number)) {
      remaining.push(number);
    }
  }

  // Pick random number
  const number =
    remaining[Math.floor(Math.random() * remaining.length)];

  // Add to called list
  called.push(number);

  // Show latest number
  calledEl.textContent = number;

  // Update board and ticket
  renderBoard();
  renderTicket();
}

// Reset game
function resetGame() {
  called = [];

  calledEl.textContent = "No number called yet";

  renderBoard();
  renderTicket();
}

// New ticket button
const newTicketBtn = document.getElementById("newTicket");

if (newTicketBtn) {
  newTicketBtn.onclick = makeTicket;
}

// Next number button
const nextBtn = document.getElementById("next");

if (nextBtn) {
  nextBtn.onclick = nextNumber;
}

// Reset button
const resetBtn = document.getElementById("reset");

if (resetBtn) {
  resetBtn.onclick = resetGame;
}

// Start game
makeTicket();
renderBoard();const ticketEl = document.getElementById("ticket");
const boardEl = document.getElementById("board");
const calledEl = document.getElementById("called");

let called = [];
let ticket = [];

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function makeTicket() {
  ticket = Array.from({ length: 27 }, () => null);

  for (let row = 0; row < 3; row++) {
    let columns = shuffle([...Array(9).keys()])
      .slice(0, 5)
      .sort((a, b) => a - b);

    columns.forEach(column => {
      let min = column === 0 ? 1 : column * 10;
      let max = column === 8 ? 90 : column * 10 + 9;

      let number;

      do {
        number =
          Math.floor(Math.random() * (max - min + 1)) + min;
      } while (
        ticket[row * 9 + column] !== null ||
        ticket.some(
          (value, index) =>
            Math.floor(index / 9) === row && value === number
        )
      );

      ticket[row * 9 + column] = number;
    });
  }

  renderTicket();
}

function renderTicket() {
  ticketEl.innerHTML = "";

  ticket.forEach((number, index) => {
    const cell = document.createElement("div");

    cell.className =
      "cell" + (number === null ? " blank" : "");

    cell.textContent = number ?? "";

    if (number !== null) {
      cell.onclick = () => {
        cell.classList.toggle("marked");
      };

      if (called.includes(number)) {
        cell.classList.add("marked");
      }
    }

    ticketEl.appendChild(cell);
  });
}

function renderBoard() {
  boardEl.innerHTML = "";

  for (let number = 1; number <= 90; number++) {
    const ball = document.createElement("div");

    ball.className =
      "ball" + (called.includes(number) ? " called" : "");

    ball.textContent = number;

    boardEl.appendChild(ball);
  }
}

function nextNumber() {
  const remaining = Array.from(
    { length: 90 },
    (_, index) => index + 1
  ).filter(number => !called.includes(number));

  if (remaining.length === 0) {
    calledEl.textContent = "All 90 numbers called!";
    return;
  }

  const number =
    remaining[Math.floor(Math.random() * remaining.length)];

  called.push(number);

  calledEl.textContent = number;

  renderBoard();
  renderTicket();
}

function resetGame() {
  called = [];

  calledEl.textContent = "No number called yet";

  renderBoard();
  renderTicket();
}

document.getElementById("newTicket").onclick = makeTicket;
document.getElementById("next").onclick = nextNumber;
document.getElementById("reset").onclick = resetGame;

makeTicket();
renderBoard();
