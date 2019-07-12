const GAME_STATES = {
    "AWAITING_PAYMENT": 10,
    "WAITING_FOR_PLAYERS": 11,
    "LOADOUT": 20,
    "HOLD_UP": 21,
    "COURAGE": 22,
    "REVEAL": 23,
    "END_GAME": 30
}

const GAME_TEXT = {
    [GAME_STATES.AWAITING_PAYMENT]: "Welcome! \n",
    [GAME_STATES.WAITING_FOR_PLAYERS]: "Payment Accepted "

}

export {GAME_STATES, GAME_TEXT};