import RandomString from 'randomstring'
import {GAME_TEXT} from '../constants'
import {jsonInterface} from '../contractABI'
const CONTRACT_ADDRESS = '0xd87fdca47d6008cf6a6c094199ace741eedfbbf9';
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
    contract.events.NextPhase({}, () => console.log("nextPhase"));
    console.log("listening");
}

const sendLoadoutCommit = async (rivalCommit, bulletCommit) => {
    try {
        const contract = getContract();
        const playerAccount = await getPlayerAccount();
        const receipt = await contract.methods.loadoutCommit(rivalCommit, bulletCommit).send({from: playerAccount});
        console.log(receipt);
        return true;
    } catch (e) {
        console.log(e)
        console.log('failed tx')
        return false; 
    }
}

const confirmLoadout = async (commit) => {
    try {
    const {rival, password} = commit;
    console.log(commit);
    const contract = getContract();
    const playerAccount = await getPlayerAccount();
    const receipt = await contract.methods.loadoutReveal(password, rival).send({from: playerAccount});
    console.log(receipt) 
    return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

const sendHoldupCommit = async (foldCommit) => {
    try {
        const contract = getContract();
        const playerAccount = await getPlayerAccount();
        const receipt = await contract.methods.holdupCommit(foldCommit).send({from: playerAccount});
        console.log(receipt);
        return true;
    } catch (e) {
        console.log(e)
        console.log('failed tx')
        return false; 
    }
}

const confirmHoldup = async (bulletCommit, foldCommit) => {
    try {
    const contract = getContract();
    const playerAccount = await getPlayerAccount();
    console.log(bulletCommit.password, bulletCommit.bullet, foldCommit.password, foldCommit.isFolding);
    const receipt = await contract.methods.holdupReveal(bulletCommit.password, bulletCommit.bullet, foldCommit.password, foldCommit.isFolding).send({from: playerAccount});
    console.log(receipt) 
    return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}

const getGamePhase = async () => {
    try {
        const contract = getContract();
        const gamePhase =  await contract.methods.currentPhase().call();
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

const getPlayerAction = async (playerList,action) => {
    const contract = getContract();
    let actionList = {};
    for(let playerAddress in playerList){
        const playerAction = await contract.methods.currentRound(playerAddress).call();
        actionList[playerAddress] = playerAction[action];
    }
    return actionList;
}

const getPotValue = async () => {
    const contract = getContract();
    let potValue = await contract.methods.roundValue().call();
    potValue = web3.utils.fromWei(web3.utils.toBN(potValue._hex),'ether'); 
    return potValue;
}

export {getPotValue, sendHoldupCommit, sendLoadoutCommit, getPlayersList, getContract, setContractListeners, encryptMessage, confirmLoadout, confirmHoldup, getGameText, payForGame, getGamePhase, getPlayerAction}