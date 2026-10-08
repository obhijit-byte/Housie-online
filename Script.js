const ticketEl = document.getElementById("ticket");
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
