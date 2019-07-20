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
                        shootingList: {bill: 'joe', chris:'bill', joe:'baba', baba:'joe'},
                        prevRounds:[
                            {
                                bill: {
                                    action: 'bang',
                                    rival: 'joe',
                                    isFolding: false
                                },
                                chris: {
                                    action: 'click',
                                    rival: 'bill',
                                    isFolding: false
                                },
                                joe: {
                                    action: 'click',
                                    rival: 'baba',
                                    isFolding: true
                                },
                                baba: {
                                    action: 'click',
                                    rival: 'joe',
                                    isFolding: false
                                }
                            }
                        ],
                        },
            playerData: {name: 'baba', clickBullet: 0, bangBullet: 3, waiting: false},
            commits: {}
        }
    }

    bindEvents() {
        document.addEventListener('contractUpdated', this.updateGame.bind(this))
        
    }

    componentDidMount() {
        this.bindEvents();
    }

    updateGame(e) {
        console.log(e)
        const {gameState} = this.state;
        
        //const gameStatus = getGameStatus();
        //TODO: update gameData from updateGame
        const {gameData} = e.detail;
        const {gameStatus} = gameData;
        // Check if state switch requires sending confirms
        if(gameStatus === GAME_STATES.CONFIRM_LOADOUT){
            // SEND CONFIRM MESSAGES
        }
        if(gameStatus === GAME_STATES.CONFIRM_HOLDUP){
            // SEND CONFIRM MESSAGES
        }
        if(gameStatus !== GAME_STATES.LOADOUT){
            this.setState({gameState: gameStatus})
        } else {
            // Check if its not start game
            if(gameState === GAME_STATES.AWAITING_PAYMENT || gameState === GAME_STATES.WAITING_FOR_PLAYERS){
                this.setState({gameState: gameStatus})
            } else {
                // If updated to LOADOUT, meaning a new round started - show the REVEAL state as round summary
                this.setState({gameState: GAME_STATES.REVEAL})
            }
        }
    }

    renderGameState() {
        const {gameState} = this.state;
        switch (gameState){
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
                return (<LoadoutPhase gameData={gameData} playerData={playerData} gameState={gameState} handleLoadout={this.handleLoadout.bind(this)}/>);
            }
            case GAME_STATES.HOLDUP:
            case GAME_STATES.CONFIRM_HOLDUP: {
                const {gameData, playerData} = this.state;
                return (<HoldupPhase gameData={gameData} playerData={playerData} gameState={gameState} handleHoldup={this.handleHoldup.bind(this)}/>);
            }
            case GAME_STATES.REVEAL: {
                const {gameData, playerData} = this.state;
                return (<RevealPhase gameData={gameData} playerData={playerData} continueToNextRound={this.continueToNextRound.bind(this)}/>);
            }
            default:{
                return "I Am Groot"
            }
        }
    }

    beginWeb3Transaction(){
        payForGame()
        // TODO: wait for confirmation before moving to "wait for players"
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

        // Acknowladge that sent loadout
        this.setState({gameState: GAME_STATES.CONFIRM_LOADOUT})
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

        // Acknowladge that sent loadout
        this.setState({gameState: GAME_STATES.CONFIRM_HOLDUP})
    }

    continueToNextRound(){
        this.setState({gameState: GAME_STATES.LOADOUT})
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
