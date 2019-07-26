import React from 'react';
import LoadoutPhase from './LoadoutPhase'
import HoldupPhase from './HoldupPhase'
import AwaitPaymentPhase from './AwaitPaymentPhase'
import WaitingForPlayersPhase from './WaitForPlayersPhase'
import RevealPhase from './RevealPhase'
import {GAME_STATES, BULLETS} from '../constants'
import * as contractActions from '../utils'

class GameLayout extends React.Component {
    constructor(){
        super();
        this.state ={
            gameState: GAME_STATES.AWAITING_PAYMENT,
            gameData: {currentRound: 0, pot:0},
            rounds: [],
            playersList: {},
            playerData: {name: 'baba', clickBullet: 5, bangBullet: 3, waiting: false},
            playerAddress: '',
            rivalCommit: {
                encryptedMessage: "0xf94ba6722c4c20fd97cbb8e9906961034d820e4521fbd33674c95b2eb202a87f",
                password: "oxahm94msdco",
                rival: "0x6216e6a3621Ccc976364F86191AE505afe41FFB7"
            }
        }
    }


    componentDidMount() {
        setInterval(this.updateGameState.bind(this), 60 * 1000)
    }

    async updateGameState() {
        const currentState = this.state.gameState;
        const newGameState = await contractActions.getGamePhase();
        if(currentState !== newGameState){
            const pot = await contractActions.getPotValue();
            const currentRound = await contractActions.getCurrentRound()
            const gameData = {pot: pot, currentRound: currentRound}
            this.setState({waiting: false, gameState: newGameState, gameData: gameData})
        }
    }

    renderGameState() {
        const {gameState, gameData, playerData, playersList, waiting, playerAddress} = this.state;
        switch (gameState){
            case GAME_STATES.AWAITING_PAYMENT:{
              return (<AwaitPaymentPhase waiting={waiting} paymentMethod={this.beginWeb3Transaction.bind(this)}/>);     
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
                    confirmLoadout={this.sendConfirmLoadout.bind(this)}
                    waiting={waiting}
                    playerAddress={playerAddress}/>);
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
                    waiting={waiting}
                    playerAddress={playerAddress}
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

    async beginWeb3Transaction(nickname){
        contractActions.setContractListeners(this.startGame.bind(this),this.updateGameState.bind(this));
        this.setState({waiting: true});
        const isPaid = await contractActions.payForGame(nickname);
        if(isPaid){
            this.setState({waiting: false, gameState: GAME_STATES.WAITING_FOR_PLAYERS});
        } else {
            this.setState({waiting: false});
        }
        
    }

    async startGame() {
        const playersList = await contractActions.getPlayersList();
        const pot = await contractActions.getPotValue();
        const gameData = {pot: pot, currentRound: 1}
        const playerAddress = await contractActions.getPlayerAccount();
        this.setState({playerAddress: playerAddress, gameState: GAME_STATES.LOADOUT, playersList: playersList, gameData: gameData})
    }

    async handleLoadout(chosenLoadout){
        // create rivalCommit
        const rivalMessage = contractActions.encryptMessage({type: 'bytes20', content: chosenLoadout.rival})
        const rivalCommit = {
            rival: chosenLoadout.rival,
            password: rivalMessage.password,
            encryptedMessage: rivalMessage.encryptedMessage
        }

        // create bulletCommit
        const bulletMessage = contractActions.encryptMessage({type: 'uint8', content: chosenLoadout.bullet})
        const bulletCommit = {
            bullet: chosenLoadout.bullet,
            password: bulletMessage.password,
            encryptedMessage: bulletMessage.encryptedMessage
        }
        
        // send commits
        this.setState({waiting: true});
        const isSent = await contractActions.sendLoadoutCommit(rivalMessage.encryptedMessage, bulletMessage.encryptedMessage);
        // if send is successful
        if(isSent){
            const {playerData} = this.state;
            let updatedPlayerData = {name: playerData.name};
            const isClick = chosenLoadout.bullet === BULLETS.CLICK;
            updatedPlayerData.clickBullet = isClick ? playerData.clickBullet -1 : playerData.clickBullet;
            updatedPlayerData.bangBullet = isClick ? playerData.bangBullet : playerData.bangBullet - 1;
            this.setState({ playerData: updatedPlayerData, rivalCommit: rivalCommit, bulletCommit: bulletCommit})
        } else {
            this.setState({waiting: false});
        }
    }

    async sendConfirmLoadout () {
        this.setState({waiting: true});
        const isSent = await contractActions.confirmLoadout(this.state.rivalCommit);
        if(!isSent){
            this.setState({waiting: false});

        }
    }

    async sendConfirmHoldup () {
        this.setState({waiting: true});
        const isSent = await contractActions.confirmHoldup(this.state.bulletCommit,this.state.foldCommit);
        if(!isSent){
            this.setState({waiting: false});

        }
    }

    async handleHoldup(chosenHoldup) {
        const foldMessage = contractActions.encryptMessage({type: 'uint8', content: chosenHoldup.isFolding})
        const foldCommit = {
            isFolding: chosenHoldup.isFolding,
            password: foldMessage.password,
            encryptedMessage: foldMessage.encryptedMessage
        }
        this.setState({foldCommit: foldCommit})

        this.setState({waiting: true});
        const isSent = await contractActions.sendHoldupCommit(foldCommit.encryptedMessage);
        // if send is successful
        if(isSent){
            this.setState({foldCommit: foldCommit})
        } else {
            this.setState({waiting: false});
        }
    }

    continueToNextRound(){
        this.setState({gameState: GAME_STATES.LOADOUT})
    }

  render(){
      return (
        <div className="GameLayout">
            {contractActions.getGameText(this.state.gameState)}
            {this.renderGameState()}
        </div>
        );
    }
}

export default GameLayout;
