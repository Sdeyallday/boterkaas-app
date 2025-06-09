from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Initialiseer spelstatus
board = [["" for _ in range(3)] for _ in range(3)]
current_player = "O"

# Winconditie controleren
def check_winner(player):
    for i in range(3):
        if all(cell == player for cell in board[i]):
            return True
        if all(row[i] == player for row in board):
            return True
    if all(board[i][i] == player for i in range(3)):
        return True
    if all(board[i][2 - i] == player for i in range(3)):
        return True
    return False

# Gelijkspel controleren
def check_draw():
    return all(cell != "" for row in board for cell in row)

# Homepage
@app.route("/")
def index():
    return render_template("index.html")

# Borddata ophalen (voor script.js)
@app.route("/board")
def get_board():
    winner = check_winner(current_player)
    return jsonify({
        "board": board,
        "turn": current_player,
        "winner": current_player if winner else None,
        "draw": check_draw() if not winner else False
    })

# Zet verwerken
@app.route("/move", methods=["POST"])
def move():
    global current_player
    data = request.json
    i, j = data.get("row"), data.get("col")

    # Alleen zetten als vakje leeg is
    if board[i][j] == "":
        board[i][j] = current_player
        winner = check_winner(current_player)
        draw = check_draw()

        response = {
            "board": board,
            "winner": current_player if winner else None,
            "draw": draw,
            "next": current_player
        }

        if not winner and not draw:
            current_player = "X" if current_player == "O" else "O"
            response["next"] = current_player

        return jsonify(response)

    return jsonify({"error": "Vakje is al bezet"}), 400

# Spel resetten
@app.route("/reset", methods=["POST"])
def reset():
    global board, current_player
    board = [["" for _ in range(3)] for _ in range(3)]
    current_player = "O"
    return jsonify({"status": "reset"})

# Start de app
if __name__ == "__main__":
    app.run(debug=True)
