document.addEventListener("DOMContentLoaded", () => {
  // Laad initiële bordstatus bij het opstarten
  fetchBoard();

  // Functie: Haalt het bord op van de server
  async function fetchBoard() {
    try {
      const res = await fetch("/board");
      const data = await res.json();
      drawBoard(data.board, data.turn, data.winner, data.draw);
    } catch (error) {
      console.error("Fout bij ophalen van bord:", error);
    }
  }

  // Functie: Tekent het bord in de HTML
  function drawBoard(board, turn, winner, draw) {
    const boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";
    document.getElementById("turn").textContent = turn;

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.textContent = board[i][j];

        // Voeg klik-event toe als vakje leeg is en spel nog niet voorbij
        if (board[i][j] === "" && !winner && !draw) {
          cell.addEventListener("click", () => makeMove(i, j));
        }

        // Optioneel: styling per symbool
        if (board[i][j] === "O") {
          cell.style.color = "lime";
          cell.style.fontWeight = "bold";
        } else if (board[i][j] === "X") {
          cell.style.color = "crimson";
          cell.style.fontWeight = "bold";
        }

        boardDiv.appendChild(cell);
      }
    }

    const status = document.getElementById("status");
    if (winner) {
      status.textContent = `🎉 Speler ${winner} wint!`;
    } else if (draw) {
      status.textContent = `⛔ Gelijkspel!`;
    } else {
      status.textContent = "";
    }
  }

  // Functie: Verstuurt een zet naar de server
  async function makeMove(i, j) {
    try {
      const res = await fetch("/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ row: i, col: j })
      });
      const data = await res.json();
      drawBoard(data.board, data.next, data.winner, data.draw);
    } catch (error) {
      console.error("Fout bij zetten van een vakje:", error);
    }
  }

  // Globaal beschikbaar maken van reset-functie
  window.resetGame = async () => {
    try {
      await fetch("/reset", { method: "POST" });
      fetchBoard();
    } catch (error) {
      console.error("Fout bij resetten van spel:", error);
    }
  };
});
