import { GameData } from '../../core/utils/common';
import { GameHelper } from '../../core/utils/GameServerHelper';
import IGameServer from '../../core/utils/IGameServer';
import { PacketType } from './enums';

export default class YatzyGame implements IGameServer {
    private board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    private currentPlayerTurn = '';
    private gameWinner = '';
    private gameHelper: GameHelper;
    private players = [];

    async initialise(gameHelper: GameHelper, gameData: GameData) {
        // initialise tic tac toe board
        this.board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.players = gameData.joinedPlayers;
        this.currentPlayerTurn = this.players[0];
        this.gameHelper = gameHelper;
    }
    async onMessageFromClient(userId: string, data: any) {
        if (userId !== this.currentPlayerTurn) {
            return;
        }
        if (this.board[data.pos] !== 0) {
            return;
        }
        if (this.isGameOver()) {
            return;
        }
        if (data.type === PacketType.MOVE) {
             this.board[data.pos] = this.players.indexOf(userId) + 1;
        }

        const isGameOver = this.isGameOver();

        // Change Turn and send the updated board to all players
        console.log('currentPlayerTurn before', this.currentPlayerTurn);
        let next = this.getNextElement(this.players, userId);
        if(next !== '') {
            this.currentPlayerTurn = next;
        }

        this.players.forEach((player) => {
            this.gameHelper.sendMessageToClient(player, {
                type: PacketType.CHANGE_TURN,
                board: this.board,
                currentPlayerTurn: this.currentPlayerTurn                           
            });
        });

        // Send Game Over packet to all players if game is over
        if (isGameOver) {
            this.players.forEach((player) => {
                this.gameHelper.sendMessageToClient(player, {
                    type: PacketType.GAME_OVER,
                    winner: this.gameWinner
                });
            });
            await this.gameHelper.finishGame(this.gameWinner);
        }
    }    

    async onInitialGameStateSent() {}
    async getInitialGameState() {
        return {
            board: this.board,
            currentPlayerTurn: this.currentPlayerTurn,
        };
    }
    async getCurrentGameState(userId: string) {
        return {
            board: this.board,
            currentPlayerTurn: this.currentPlayerTurn,
            gameOver: this.isGameOver(),
        };
    }
    async getPlayerScore(userId: string): Promise<number> {
        // Winner is decided based on the last score
        if (this.gameWinner === userId) {
            return 1;
        } else {
            return 0;
        }
    }
    async onGameTimeOver(userId: string) {
        throw new Error('Method not implemented since this is not a time based game.');
    }

    async onPlayerLeave(userId: string) {
        this.players = this.players.filter((player) => player !== userId);
        this.currentPlayerTurn = this.players[0];
    }

    private isGameOver(): boolean {
        const winPatterns = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8], // rows
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8], // columns
            [0, 4, 8],
            [2, 4, 6], // diagonals
        ];

        const isWinner = winPatterns.some((pattern) => {
            const [a, b, c] = pattern;
            return this.board[a] !== 0 && this.board[a] === this.board[b] && this.board[a] === this.board[c];
        });

        if (isWinner || this.board.every((cell) => cell !== 0)) {
            if (isWinner) {
                this.gameWinner = this.currentPlayerTurn;
            }
            return true;
        } else {
            return false;
        }
    }

    private getNextElement(array: (string | number)[], currentElement: string | number): string {
        // Проверка, что массив не пустой
        if (!Array.isArray(array) || array.length === 0) {
            console.error('Массив должен быть непустым');
            return '';
        }

        // Находим индекс текущего элемента
        const index = array.indexOf(currentElement);

        // Проверка, что элемент найден
        if (index === -1) {
            console.error(`Элемент "${currentElement}" не найден в массиве`);
            return '';
        }

        // Вычисляем индекс следующего элемента
        const nextIndex = (index + 1) % array.length;

        // Возвращаем следующий элемент
        return array[nextIndex].toString();
    }
}
