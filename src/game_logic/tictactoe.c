void require(int cond); // external host api describes a equal constraint.
unsigned long long wasm_input(int); // external host api for fetch user inputs.

int board[9] = {
    0,0,0,
    0,0,0,
    0,0,0,
};

__attribute__((visibility("default")))
int check_winner() {
    for (int i=0; i<3; i++) {
        if (board[i*3] == board[i*3+1] && board[i*3+1] == board[i*3+2] && board[i*3] != 0) {
            return board[i*3];
        }
        if (board[i] == board[i+3] && board[i+3] == board[i+6] && board[i] != 0) {
            return board[i];
        }
    }
    if (board[0] == board[4] && board[4] == board[8] && board[0] != 0) {
        return board[0];
    }
    if (board[2] == board[4] && board[4] == board[6] && board[2] != 0) {
        return board[2];
    }
    return 0;
}

__attribute__((visibility("default")))
void move(int pos, int player) {
    require(pos >= 0 && pos < 9);
    require(player == 1 || player == 2);
    require(board[pos] == 0);
    board[pos] = player;
}

__attribute__((visibility("default")))
int getBoard(int index) {
  return board[index];
}


__attribute__((visibility("default")))
void zkmain() {
    // break up the input from wasm_input(1) into array
    wasm_input(1);
    // feed input array into tictactoe();
    int player = 1;
    for (int i=0; i<9; i++) {
        int pos = wasm_input(1);
        move(pos, player);
        int winner = check_winner();
        if (winner != 0) {
            require(winner == player);
            return;
        }
        player = 3 - player;
    }
    require(check_winner() == 0);
}