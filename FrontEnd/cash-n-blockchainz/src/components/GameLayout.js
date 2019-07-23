import React from 'react';
import LoadoutPhase from './LoadoutPhase'
import HoldupPhase from './HoldupPhase'
import AwaitPaymentPhase from './AwaitPaymentPhase'
import WaitingForPlayersPhase from './WaitForPlayersPhase'
import RevealPhase from './RevealPhase'
import {GAME_STATES, BULLETS, FOLD_STATES} from '../constants'
import {setContractListeners, getPlayersList, encryptMessage, sendLoadoutCommit,
    getGameText, payForGame, getGamePhase, confirmLoadout, getPotValue} from '../utils'

class GameLayout extends React.Component {
    constructor(){
        super();
        this.state ={
            gameState: GAME_STATES.AWAITING_PAYMENT,
            gameData: {currentRound: -1, pot:125},
            rounds: [],
            playersList: {},
            playerData: {name: 'baba', clickBullet: 5, bangBullet: 3, waiting: false},
            commits: {}
        }
    }


    componentDidMount() {
        document.addEventListener('goToPhase', (e) => {
            this.startGame()
        })
    }

    updateGameState() {
        const newGameState = getGamePhase();
        // Check if state switch requires sending confirms
        if(newGameState === GAME_STATES.CONFIRM_LOADOUT){
            confirmLoadout(this.state.rivalCommit)
        }
        if(newGameState === GAME_STATES.CONFIRM_HOLDUP){
            // TODO: SEND CONFIRM MESSAGES
        }
        if(newGameState !== GAME_STATES.LOADOUT){
            this.setState({gameState: newGameState})
        } else {
            // Check if its not start game
            if(newGameState === GAME_STATES.AWAITING_PAYMENT || newGameState === GAME_STATES.WAITING_FOR_PLAYERS){
                this.setState({gameState: newGameState})
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
                const {gameData, playerData, playersList} = this.state;
                return (<LoadoutPhase gameData={gameData} playersList={playersList} playerData={playerData} gameState={gameState} handleLoadout={this.handleLoadout.bind(this)}/>);
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

    async beginWeb3Transaction(){
        setContractListeners(this.startGame.bind(this),this.renderGameState.bind(this));
        const isPaid = await payForGame("bob");
        if(isPaid){
            this.setState({gameState: GAME_STATES.WAITING_FOR_PLAYERS});
        }
        
    }

    async startGame() {
        const playersList = await getPlayersList();
        const pot = await getPotValue();
        const gameData = {pot: pot, currentRound: 1}
        this.setState({gameState: GAME_STATES.LOADOUT, playersList: playersList, gameData: gameData})
    }

    async handleLoadout(chosenLoadout){
        // create rivalCommit
        const rivalMessage = encryptMessage({sender: 'me', content: chosenLoadout.rival})
        const rivalCommit = {
            rival: chosenLoadout.rival,
            password: rivalMessage.password,
            encryptedMessage: rivalMessage.encryptedMessage
        }

        // create bulletCommit
        const bulletMessage = encryptMessage({sender: 'me', content: chosenLoadout.chosenBullet})
        const bulletCommit = {
            bullet: chosenLoadout.bullet,
            password: bulletMessage.password,
            encryptedMessage: bulletMessage.encryptedMessage
        }
        
        // send commits
        const isSent = await sendLoadoutCommit(rivalMessage.encryptedMessage, bulletMessage.encryptedMessage);
        // const isSent = false;
        // if send is successful
        if(isSent){
            const {playerData} = this.state;
            let updatedPlayerData = {name: playerData.name, waiting: true};
            const isClick = chosenLoadout.chosenBullet === BULLETS.CLICK;
            updatedPlayerData.clickBullet = isClick ? playerData.clickBullet -1 : playerData.clickBullet;
            updatedPlayerData.bangBullet = isClick ? playerData.bangBullet : playerData.bangBullet - 1;
            this.setState({gameState: GAME_STATES.CONFIRM_LOADOUT, playerData: updatedPlayerData, rivalCommit: rivalCommit, bulletCommit: bulletCommit})
        }
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
