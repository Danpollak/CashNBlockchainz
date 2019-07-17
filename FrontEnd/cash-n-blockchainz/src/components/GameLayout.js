import React from 'react';
import LoadoutPhase from './LoadoutPhase'
import HoldupPhase from './HoldupPhase'
import AwaitPaymentPhase from './AwaitPaymentPhase'
import WaitingForPlayersPhase from './WaitForPlayersPhase'
import RevealPhase from './RevealPhase'
import {GAME_STATES, GAME_TEXT} from '../constants'
import {encryptMessage, sendConfirmation, sendEncryptedMessage, getGameText, payForGame, getGameStatus} from '../utils'

class GameLayout extends React.Component {
    constructor(){
        super();
        this.state ={
            gameState: GAME_STATES.AWAITING_PAYMENT,
            gameData: {players: ['bill','joe','chris','baba'],
                        shootingList: {bill: 'joe', chris:'bill', joe:'baba', baba:'joe'}},
            playerData: {name: 'baba', clickBullet: 0, bangBullet: 3, waiting: false},
            commits: {}
        }
    }

    bindEvents() {
        document.addEventListener('paymentRecieved', this.waitForStartGame)
        document.addEventListener('startGame', this.startGame.bind(this))
        document.addEventListener('endLoadout', this.endLoadout)
        document.addEventListener('startHoldup', this.startHoldup)
        document.addEventListener('endHoldup', this.endHoldup)
        document.addEventListener('contractUpdated', this.updateGame)
        
    }

    componentDidMount() {
        this.bindEvents();
    }

    updateGame() {
        const gameStatus = getGameStatus();
        this.setState({gameState: gameStatus})
        if(GAME_STATES.CONFIRM_LOADOUT){
            // SEND CONFIRM MESSAGES
        }
        if(GAME_STATES.CONFIRM_HOLDUP){
            // SEND CONFIRM MESSAGES
        }
    }

    renderGameState() {
        switch (this.state.gameState){
            case GAME_STATES.AWAITING_PAYMENT:{
              return (<AwaitPaymentPhase paymentMethod={this.beginWeb3Transaction.bind(this)}/>);     
            }
            case GAME_STATES.WAITING_FOR_PLAYERS: {
                return (<WaitingForPlayersPhase />);
            }
            case GAME_STATES.LOADOUT:
            case GAME_STATES.CONFIRM_LOADOUT:
                 {
                const {gameData, playerData} = this.state;
                return (<LoadoutPhase gameData={gameData} playerData={playerData} handleLoadout={this.handleLoadout.bind(this)}/>);
            }
            case GAME_STATES.SENT_HOLD_UP:
            case GAME_STATES.CONFIRM_HOLD_UP: {
                const {gameData, playerData} = this.state;
                return (<HoldupPhase gameData={gameData} playerData={playerData} handleLoadout={this.handleLoadout.bind(this)}/>);
            }
            case GAME_STATES.REVEAL: {
                const {gameData, playerData} = this.state;
                return (<RevealPhase gameData={gameData} playerData={playerData} handleLoadout={this.handleLoadout.bind(this)}/>);
            }
            default:{
                return "I Am Groot"
            }
        }
    }

    beginWeb3Transaction(){
        payForGame()
        this.setState({gameState: GAME_STATES.WAITING_FOR_PLAYERS})
    }

    startGame(e) {
        const gameData = e.detail;
        //this.setState({gameState: GAME_STATES.LOADOUT, gameData})
        this.setState({gameState: GAME_STATES.LOADOUT})
    }

    handleLoadout(chosenLoadout){
        // create rivalCommit
        const rivalMessage = encryptMessage({sender: 'me', content: chosenLoadout.rival})
        const rivalCommit = {
            rival: chosenLoadout.rival,
            password: rivalMessage.password,
            encryptedMessage: rivalMessage.encryptedMessage
        }
        // TODO: Send rivalMessage
        // SEND ENCRYPTED MESSAGE OF RIVAL
        const bulletMessage = encryptMessage({sender: 'me', content: chosenLoadout.chosenBullet})
        // TODO: Decrease bullet of that suite
        const bulletCommit = {
            rival: chosenLoadout.rival,
            password: bulletMessage.password,
            encryptedMessage: bulletMessage.encryptedMessage
        }
        // TODO: send bulletMessage
        this.setState({rivalCommit: rivalCommit, bulletCommit: bulletCommit})

        // TODO: remove later
        this.setState({gameState: GAME_STATES.HOLD_UP})
    }

    handleHoldup(chosenHoldup) {
        const foldMessage = encryptMessage({sender: 'me', content: chosenHoldup.isFolding})
        const foldCommit = {
            rival: chosenHoldup.isFolding,
            password: foldMessage.password,
            encryptedMessage: foldMessage.encryptedMessage
        }
        // TODO: send foldMessage
        this.setState({foldCommit: foldCommit})
    }

  render(){
      return (
        <div className="GameLayout">
            {getGameText(this.state.gameState)}
            {this.renderGameState()}
        </div>
        );
    }
}

export default GameLayout;
