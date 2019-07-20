import RandomString from 'randomstring'
import {GAME_TEXT} from '../constants'
const crypto = require('crypto');
const Web3 = require('web3')

const generatePassword = () => {
    return RandomString.generate({length: 12 }).toLowerCase()
}

const encryptMessage = ({sender, content}) => {
    const password = generatePassword();
    const message = `${sender}-${content}-${password}`
    const encryptedMessage = crypto.createHash('sha256').update(message).digest('base64');
    return {
        encryptedMessage, password
    }
}

const getGameText = (gameState) => {
    return GAME_TEXT[gameState];
}


/** WEB3 FUNCTIONS */

const payForGame = () => {
    return;
}
const sendEncryptedMessage = (type, message) => {
    return;
}

const sendConfirmation = (commit) => {
    return;
}

const getGameStatus = () => {
    return;
}
export {encryptMessage, sendEncryptedMessage, sendConfirmation, getGameText, payForGame, getGameStatus}