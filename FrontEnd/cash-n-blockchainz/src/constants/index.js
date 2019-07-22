const GAME_STATES = {
    "AWAITING_PAYMENT": 0,
    "WAITING_FOR_PLAYERS": 0.5,
    "LOADOUT": 1,
    "CONFIRM_LOADOUT": 2,
    "HOLDUP": 3,
    "CONFIRM_HOLDUP": 4,
    "REVEAL": 4.5,
    "END_GAME": 5
}

const GAME_TEXT = {
    [GAME_STATES.AWAITING_PAYMENT]: "Welcome! \n",
    [GAME_STATES.WAITING_FOR_PLAYERS]: "Payment Accepted ",
    [GAME_STATES.LOADOUT]: "Load your gun and decide who to point it at"

}

const BULLETS = {
    CLICK: 2,
    BANG: 1
}

const FOLD_STATES = {
    FOLD: 4,
    STAY: 3
}

export {GAME_STATES, GAME_TEXT, BULLETS, FOLD_STATES};