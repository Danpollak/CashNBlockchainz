import RandomString from 'randomstring'
import {GAME_TEXT} from '../constants'
import {jsonInterface} from '../contractABI'
import {contractAddress} from '../contract'
const CONTRACT_ADDRESS = contractAddress;
const Web3 = require('web3')
const web3 = new Web3(Web3.givenProvider || new Web3.providers.WebsocketProvider('ws://localhost:8546'), null, {});
//const content = fs.readFileSync("../../../contract.json");


export function generatePassword(){
    return RandomString.generate({length: 12 }).toLowerCase()
}

export function encryptMessage ({content, type}) {
    const password = generatePassword();
    const message = web3.eth.abi.encodeParameters(['string',type],[password, content]);
    const encryptedMessage = web3.utils.keccak256(message);
    return {
        encryptedMessage, password
    }
}

export function getGameText (gameState) {
    return GAME_TEXT[gameState];
}


/** WEB3 FUNCTIONS */

export function getContract() {
    return web3.eth.Contract(jsonInterface, CONTRACT_ADDRESS, {transactionConfirmationBlocks: 3});
}

export async function getPlayerAccount() {
    let accounts = await web3.eth.getAccounts();
    return accounts[0];
}

export async function payForGame(nickname){
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

export function setContractListeners (gameStart, nextPhase) {
    const contract = getContract();
    contract.events.GameStart({}, gameStart);
    contract.events.NextPhase({}, nextPhase);
    contract.events.NextPhase({}, () => console.log("nextPhase"));
    console.log("listening");
}

export async function sendLoadoutCommit(rivalCommit, bulletCommit) {
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

export async function confirmLoadout(commit){
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

export async function sendHoldupCommit(foldCommit){
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

export async function confirmHoldup (bulletCommit, foldCommit) {
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

export async function getGamePhase() {
    try {
        const contract = getContract();
        const gamePhase =  await contract.methods.currentPhase().call();
        return gamePhase;
    } catch (e) {
        console.log(e)
        return false;
    }
}

export async function getPlayersList(){
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

export async function  getPlayerAction(playerList,action){
    const contract = getContract();
    let actionList = {};
    for(let playerAddress in playerList){
        const playerAction = await contract.methods.currentRound(playerAddress).call();
        actionList[playerAddress] = playerAction[action];
    }
    return actionList;
}

export async function  getPrevPlayerAction(playerList,action){
    const contract = getContract();
    let actionList = {};
    for(let playerAddress in playerList){
        const playerAction = await contract.methods.prevRound(playerAddress).call();
        actionList[playerAddress] = playerAction[action];
    }
    return actionList;
}

export async function  getPotValue() {
    const contract = getContract();
    let potValue = await contract.methods.roundValue().call();
    potValue = web3.utils.fromWei(web3.utils.toBN(potValue._hex),'ether'); 
    return potValue;
}

export async function  getCurrentRound () {
    const contract = getContract();
    let roundNum = await contract.methods.roundNum().call();
    roundNum = web3.utils.fromWei(web3.utils.toBN(roundNum._hex),'wei'); 
    return roundNum;
}

//export default {getCurrentRound, getPotValue, sendHoldupCommit, sendLoadoutCommit, getPlayersList, getContract, setContractListeners, encryptMessage, confirmLoadout, confirmHoldup, getGameText, payForGame, getGamePhase, getPlayerAction}