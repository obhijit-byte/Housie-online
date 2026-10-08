const ticketEl = document.getElementById("ticket");
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
