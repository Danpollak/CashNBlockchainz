import React from 'react';
import LoadoutPhase from './LoadoutPhase'
import HoldupPhase from './HoldupPhase'
import AwaitPaymentPhase from './AwaitPaymentPhase'
import WaitingForPlayersPhase from './WaitForPlayersPhase'
import RevealPhase from './RevealPhase'
import {GAME_STATES, BULLETS, FOLD_STATES} from '../constants'
import {setContractListeners, getPlayersList, encryptMessage, sendLoadoutCommit,
    getGameText, payForGame, getGamePhase, confirmLoadout, confirmHoldup, getPotValue, sendHoldupCommit} from '../utils'

class GameLayout extends React.Component {
    constructor(){
        super();
        this.state ={
            gameState: GAME_STATES.AWAITING_PAYMENT,
            gameData: {currentRound: -1, pot:125},
            rounds: [],
            playersList: {},
            playerData: {name: 'baba', clickBullet: 5, bangBullet: 3, waiting: false},
            rivalCommit: {
                encryptedMessage: "0xf94ba6722c4c20fd97cbb8e9906961034d820e4521fbd33674c95b2eb202a87f",
                password: "oxahm94msdco",
                rival: "0x6216e6a3621Ccc976364F86191AE505afe41FFB7"
            }
        }
    }


    componentDidMount() {
        setInterval(this.updateGameState.bind(this), 60 * 1000)
        document.addEventListener('goToPhase', (e) => {
            setContractListeners(this.startGame.bind(this),this.updateGameState.bind(this));
            this.startGame().then(() =>this.updateGameState());
        })
    }

    async updateGameState() {
        const newGameState = await getGamePhase();
        this.setState({gameState: newGameState})
    }

    renderGameState() {
        const {gameState, gameData, playerData, playersList} = this.state;
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
                return (<LoadoutPhase gameData={gameData}
                    playersList={playersList}
                    playerData={playerData}
                    gameState={gameState}
                    handleLoadout={this.handleLoadout.bind(this)}
                    confirmLoadout={this.sendConfirmLoadout.bind(this)}/>);
            }
            case GAME_STATES.HOLDUP:
            case GAME_STATES.CONFIRM_HOLDUP: {
                const {gameData, playerData} = this.state;
                return (<HoldupPhase gameData={gameData}
                    playersList={playersList}
                    playerData={playerData}
                    gameState={gameState}
                    handleHoldup={this.handleHoldup.bind(this)}
                    confirmHoldup={this.sendConfirmHoldup.bind(this)}
                    />);
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
        setContractListeners(this.startGame.bind(this),this.updateGameState.bind(this));
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
        const rivalMessage = encryptMessage({type: 'bytes20', content: chosenLoadout.rival})
        const rivalCommit = {
            rival: chosenLoadout.rival,
            password: rivalMessage.password,
            encryptedMessage: rivalMessage.encryptedMessage
        }

        // create bulletCommit
        const bulletMessage = encryptMessage({type: 'uint8', content: chosenLoadout.bullet})
        const bulletCommit = {
            bullet: chosenLoadout.bullet,
            password: bulletMessage.password,
            encryptedMessage: bulletMessage.encryptedMessage
        }
        
        // send commits
        const isSent = await sendLoadoutCommit(rivalMessage.encryptedMessage, bulletMessage.encryptedMessage);
        // if send is successful
        if(isSent){
            const {playerData} = this.state;
            let updatedPlayerData = {name: playerData.name, waiting: true};
            const isClick = chosenLoadout.chosenBullet === BULLETS.CLICK;
            updatedPlayerData.clickBullet = isClick ? playerData.clickBullet -1 : playerData.clickBullet;
            updatedPlayerData.bangBullet = isClick ? playerData.bangBullet : playerData.bangBullet - 1;
            this.setState({playerData: updatedPlayerData, rivalCommit: rivalCommit, bulletCommit: bulletCommit})
        }
    }

    async sendConfirmLoadout () {
        await confirmLoadout(this.state.rivalCommit);
    }

    async sendConfirmHoldup () {
        await confirmHoldup(this.state.bulletCommit,this.state.foldCommit);
    }

    async handleHoldup(chosenHoldup) {
        const foldMessage = encryptMessage({type: 'uint8', content: chosenHoldup.isFolding})
        const foldCommit = {
            isFolding: chosenHoldup.isFolding,
            password: foldMessage.password,
            encryptedMessage: foldMessage.encryptedMessage
        }
        // TODO: send foldMessage
        this.setState({foldCommit: foldCommit})

        const isSent = await sendHoldupCommit(foldCommit.encryptedMessage);
        // if send is successful
        if(isSent){
            this.setState({foldCommit: foldCommit})
        }
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
