const GAME_STATES = {
    "AWAITING_PAYMENT": 10,
    "WAITING_FOR_PLAYERS": 11,
    "LOADOUT": 20,
    "CONFIRM_LOADOUT": 21,
    "HOLDUP": 30,
    "CONFIRM_HOLDUP": 31,
    "REVEAL": 40,
    "END_GAME": 50
}

const GAME_TEXT = {
    [GAME_STATES.AWAITING_PAYMENT]: "Welcome! \n",
    [GAME_STATES.WAITING_FOR_PLAYERS]: "Payment Accepted ",
    [GAME_STATES.LOADOUT]: "Load your gun and decide who to point it at"

}

export {GAME_STATES, GAME_TEXT};