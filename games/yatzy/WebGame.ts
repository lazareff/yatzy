import IWebGame from '../../core/utils/IWebGame';
import { IGameData, GameScene } from '../../core/utils/common';
import WebGameHelper from '../../core/utils/WebGameHelper';
import { INTERNET_STATE, PING_TYPE } from '../../core/utils/enums';
import { PacketType } from './enums';

export class WebGame implements IWebGame {
    gameHelper: WebGameHelper | null = null;
    private INDEX_TO_POS;
    private headerText;
    private gameStarted = false;
    private turn = false;
    private playerPos;
    private playerTurn = false;
    private game: GameScene;

    constructor(game) {
        this.game = game;
    }

    onInternetStateUpdate(state: INTERNET_STATE) {
        if (state === INTERNET_STATE.DISCONNECTED) {
            // show loader
        } else if (state === INTERNET_STATE.CONNECTED) {
            // hide loader

        }
    }

    static preload(game: GameScene) {
        game.load.image('O', './assets/images/O.png');
        game.load.image('X', './assets/images/X.png');
        game.load.image('-', './assets/images/-.png');
    }

    onPreloadComplete() {
        this.createBoard();
    }

    initialise(gameHelper: WebGameHelper, gameData: IGameData) {
        const { config, playersData } = gameData;
        this.gameHelper = gameHelper;
    }

    onMessageFromServer(data: any) {
        if (data.type === PacketType.CHANGE_TURN) {
            this.updateBoard(data.board);
            this.setPlayerTurn(data.currentPlayerTurn);
        } else if (data.type === PacketType.GAME_OVER) {            
            this.setGameOver(data.winner);
        }
    }

    setInitialGameState(data: any) {
        this.updateBoard(data.board);
        this.setPlayerTurn(data.currentPlayerTurn);
    }

    setCurrentGameState(data: any) {
        this.updateBoard(data.board);
        this.setPlayerTurn(data.currentPlayerTurn);
        if (data.gameOver) {
            this.setGameOver(data.winner);
        }
    }

    onPingUpdate(ping: PING_TYPE) {
        // update UI as per the ping type
        console.log('ping', ping);
    }

    private updateBoard(board) {
        board.forEach((element, index) => {
            let newImage = this.INDEX_TO_POS[index];
            if (element === 1) {
                this.game.add.image(newImage.x, newImage.y, 'X').setScale(3);
            } else if (element === 2) {
                this.game.add.image(newImage.x, newImage.y, 'O').setScale(3);
            } else if (element === 3) {
                this.game.add.image(newImage.x, newImage.y, '-').setScale(3);
            }
        });
    }

    private setPlayerTurn(userTurn) {
        let userId = window.userId;
        if (userId == userTurn) {
            this.playerTurn = true;
            this.playerPos = 1;
            this.headerText.setText('Your turn!');
        } else {
            this.playerPos = 2;
            this.headerText.setText('Opponents turn!');
        }
    }

    private setGameOver(winner) {
        let userId = window.userId;
        if (parseInt(winner) === Number(userId)) {
            this.headerText.setText('You Win!');
        } else if (winner === '') {
            this.headerText.setText('Draw!');
        } else {
            this.headerText.setText('You loose :(');
        }        
    }

    private createBoard() {
        this.headerText = this.game.add
            .text(window.config.GAME_WIDTH / 2, 125, 'Waiting for game to start', {
                fontFamily: 'Arial',
                fontSize: '36px',
            })
            .setOrigin(0.5);

        const gridWidth = window.config.GAME_WIDTH;
        const gridCellWidth = gridWidth / 3;

        const grid = this.game.add.grid(
            window.config.GAME_WIDTH / 2,

            window.config.GAME_HEIGHT / 2,
            gridWidth,
            gridWidth,
            gridCellWidth,
            gridCellWidth,
            0xffffff,
            0,
            0xffca27
        );

        const gridCenterX = grid.getCenter().x;
        const gridCenterY = grid.getCenter().y;

        const topY = gridCenterY - gridCellWidth;
        const bottomY = gridCenterY + gridCellWidth;

        const gridLeft = gridCenterX - gridCellWidth;
        const gridRight = gridCenterX + gridCellWidth;

        this.INDEX_TO_POS = {
            0: { x: gridLeft, y: topY },
            1: { x: gridCenterX, y: topY },
            2: { x: gridRight, y: topY },

            3: { x: gridLeft, y: gridCenterY },
            4: { x: gridCenterX, y: gridCenterY },
            5: { x: gridRight, y: gridCenterY },

            6: { x: gridLeft, y: bottomY },
            7: { x: gridCenterX, y: bottomY },
            8: { x: gridRight, y: bottomY },
        };

        this.game.add
            .rectangle(gridCenterX - gridCellWidth, topY, gridCellWidth, gridCellWidth)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', async () => {                
                this.gameHelper!.sendMessageToServer({ type: PacketType.MOVE, pos: 0 });
            });

        this.game.add
            .rectangle(gridCenterX, topY, gridCellWidth, gridCellWidth)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.gameHelper!.sendMessageToServer({ type: PacketType.MOVE, pos: 1 });
            });

        this.game.add
            .rectangle(gridCenterX + gridCellWidth, topY, gridCellWidth, gridCellWidth)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.gameHelper!.sendMessageToServer({ type: PacketType.MOVE, pos: 2 });
            });

        this.game.add
            .rectangle(gridCenterX - gridCellWidth, gridCenterY, gridCellWidth, gridCellWidth)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.gameHelper!.sendMessageToServer({ type: PacketType.MOVE, pos: 3 });
            });

        this.game.add
            .rectangle(gridCenterX, gridCenterY, gridCellWidth, gridCellWidth)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.gameHelper!.sendMessageToServer({ type: PacketType.MOVE, pos: 4 });
            });

        this.game.add
            .rectangle(gridCenterX + gridCellWidth, gridCenterY, gridCellWidth, gridCellWidth)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.gameHelper!.sendMessageToServer({ type: PacketType.MOVE, pos: 5 });
            });

        this.game.add
            .rectangle(gridCenterX - gridCellWidth, bottomY, gridCellWidth, gridCellWidth)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.gameHelper!.sendMessageToServer({ type: PacketType.MOVE, pos: 6 });
            });

        this.game.add
            .rectangle(gridCenterX, bottomY, gridCellWidth, gridCellWidth)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.gameHelper!.sendMessageToServer({ type: PacketType.MOVE, pos: 7 });
            });

        this.game.add
            .rectangle(gridCenterX + gridCellWidth, bottomY, gridCellWidth, gridCellWidth)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.gameHelper!.sendMessageToServer({ type: PacketType.MOVE, pos: 8 });
            });
    }
}
