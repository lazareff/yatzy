import { IGameData } from './core/utils/common';

enum Games {
    TicTacToe,
    Yatzy,
}

export const gamesData: { [key: number]: IGameData } = {
    [Games.TicTacToe]: {
        name: 'tic-tac-toe',
        config: {
            country: 'IN',
            language: 'en',
            currency: '₹',
            totalWinnings: 100,
            menus: ['sound', 'vibration', 'quitGame'],
            noOfPlayers: 2
        },
        playersData: {
            currentPlayerInfo: {
                uid: '1',
                name: 'Player 1',
                profilePic: 'player1.png',
            },
            opponentPlayersInfo: [
                {
                    uid: '2',
                    name: 'Player 2',
                    profilePic: 'player2.png',
                },
            ],
        },
    },
    [Games.Yatzy]: {
        name: 'yatzy',
        config: {
            country: 'IN',
            language: 'en',
            currency: '₹',
            totalWinnings: 100,
            menus: ['sound', 'vibration', 'quitGame'],
            noOfPlayers: 3
        },
        playersData: {
            currentPlayerInfo: {
                uid: '1',
                name: 'Player 1',
                profilePic: 'player1.png',
            },
            opponentPlayersInfo: [
                {
                    uid: '2',
                    name: 'Player 2',
                    profilePic: 'player2.png',
                },
            ],
        },
    },
};

export const gameToRun = Games.Yatzy;
