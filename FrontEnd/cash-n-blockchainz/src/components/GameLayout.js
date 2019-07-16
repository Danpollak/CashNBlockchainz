import React from 'react';
import LoadoutPhase from './LoadoutPhase'
import {GAME_STATES, GAME_TEXT} from '../constants'
import {encryptMessage} from '../utils'

class GameLayout extends React.Component {
    constructor(){
        super();
        this.state ={
            gameState: GAME_STATES.AWAITING_PAYMENT,
            gameData: {players: ['bill','joe','chris','baba']},
            playerData: {clickBullet: 0, bangBullet: 3},
            commits: {}
        }
    }

    componentDidMount() {
        document.addEventListener('paymentRecieved', () => {
            console.log("Payment Recieved event caught")
            //TODO: Catch payment recieved
        })
        document.addEventListener('startGame', this.startGame.bind(this))
    }
    getGameText() {
        return GAME_TEXT[this.state.gameState];
    }
    renderGameState() {
        switch (this.state.gameState){
            case GAME_STATES.AWAITING_PAYMENT:{
              return (
                <div>
                    {this.getGameText()}
                    <br/>
                    <button onClick={this.beginWeb3Transaction.bind(this)}>Pay 1ETH To Continue</button>
                </div>
              );     
            }
            case GAME_STATES.WAITING_FOR_PLAYERS: {
                return (
                    <div>
                        {this.getGameText()}   
                        <br/>
                        <button disabled onClick={()=>console.log("Connect with Web3")}>Waiting For Players</button>
                    </div>
                  );
            }
            case GAME_STATES.LOADOUT: {
                const {gameData, playerData} = this.state;
                return (
                    <div>
                        <h2> round {gameData.round}</h2>
                        <h3> Pot: {gameData.pot}</h3>
                        {this.getGameText()}
                        <LoadoutPhase gameData={gameData} playerData={playerData} handleLoadout={this.handleLoadout.bind(this)}/>
                    </div>
                );
            }
            default:{
                return "I Am Groot"
            }
        }
    }

    beginWeb3Transaction(){
        //TODO: Web3 Transaction
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
        // SEND ENCRYPTED MESSAGE OF RIVAL
        const bulletMessage = encryptMessage({sender: 'me', content: chosenLoadout.chosenBullet})
        // TODO: Decrease bullet of that suite
        const bulletCommit = {
            rival: chosenLoadout.rival,
            password: rivalMessage.password,
            encryptedMessage: rivalMessage.encryptedMessage
        }
    }
  render(){
      return (
        <div className="GameLayout">
            {this.renderGameState()}
        </div>
        );
    }
}

export default GameLayout;
