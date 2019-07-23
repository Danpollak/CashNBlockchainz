import RandomString from 'randomstring'
import {GAME_TEXT} from '../constants'
import {jsonInterface} from '../contractABI'
const keccak256 = require('js-sha3').keccak_256;
const CONTRACT_ADDRESS = '0x6037a4eee4fda579b89bab188bf76520450f7654';
const Web3 = require('web3')
const web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider('ws://localhost:8546'), null, {});

const generatePassword = () => {
    return RandomString.generate({length: 12 }).toLowerCase()
}

const encryptMessage = ({content, type}) => {
    const password = generatePassword();
    const message = web3.eth.abi.encodeParameters(['string',type],[password, content]);
    const encryptedMessage = web3.utils.keccak256(message);
    return {
        encryptedMessage, password
    }
}

const getGameText = (gameState) => {
    return GAME_TEXT[gameState];
}


/** WEB3 FUNCTIONS */

const getContract = () => {
    return web3.eth.Contract(jsonInterface, CONTRACT_ADDRESS, {transactionConfirmationBlocks: 3});
}

const getPlayerAccount = async () =>  {
    let accounts = await web3.eth.getAccounts();
    return accounts[0];
}

const payForGame = async (nickname) => {
    try {
    const contract = getContract();
    const playerAccount = await getPlayerAccount();
    let buyIn = await contract.methods.buyIn().call();
    buyIn =  web3.utils.fromWei(web3.utils.toBN(buyIn._hex), 'wei');
    const receipt = await contract.methods.register(nickname).send({value:buyIn, from:playerAccount});
    console.log(receipt);
    } catch (e) {
        console.log(e)
        console.log('failed tx')
        return false;
    }
}

const setContractListeners = (gameStart, nextPhase) => {
    const contract = getContract();
    contract.events.GameStart({}, gameStart);
    contract.events.NextPhase({}, nextPhase);
}

const sendLoadoutCommit = async (rivalCommit, bulletCommit) => {
    try {
        const contract = getContract();
        const convertedRival = `0x${rivalCommit}`;
        const convertedBullet = `0x${bulletCommit}`
        const playerAccount = await getPlayerAccount();
        console.log(convertedRival, convertedBullet)
        const receipt = await contract.methods.loadoutCommit(convertedRival, convertedBullet).send({from: playerAccount});
    } catch (e) {
        console.log(e)
        console.log('failed tx')
        return false; 
    } finally {
        return true;
    }

}

const confirmLoadout = async (commit) => {
    try {
    const {rival, password} = commit;
    const contract = getContract();
    const receipt = await contract.methods.loadoutReveal(password, rival).call(); 
    return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

const getGamePhase = async () => {
    try {
        const contract = getContract();
        const gamePhase =  await contract.methods.getGamePhase().call();
        return gamePhase;
    } catch (e) {
        console.log(e)
        return false;
    }
}

const getPlayersList = async () => {
    const contract = getContract();
    const amountOfPlayers = await contract.methods.numRegistered().call();
    let playerList = {};
    for(let i = 0; i < amountOfPlayers;i++){
        const player = await contract.methods.playersList(i).call();
        const playerInfo = await contract.methods.playersInfo(player).call();
        playerList[player] = playerInfo;
    }
    return playerList;
}

const getRivalList = async () => {
    const contract = getContract();
    const rivalList = await contract.methods.getRoundRivals().call();
    console.log(rivalList)
    return rivalList;
}

const getPotValue = async () => {
    const contract = getContract();
    let potValue = await contract.methods.roundValue().call();
    potValue = web3.utils.fromWei(web3.utils.toBN(potValue._hex),'ether'); 
    return potValue;
}
export {getPotValue, sendLoadoutCommit, getPlayersList, getContract, setContractListeners, encryptMessage, confirmLoadout, getGameText, payForGame, getGamePhase}