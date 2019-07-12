import React from 'react';
import {GAME_STATES, GAME_TEXT} from '../constants'

class GameLayout extends React.Component {
    constructor(){
        super();
        this.state ={
            gameState: GAME_STATES.AWAITING_PAYMENT
        }
    }
    getGameText() {
        return GAME_TEXT[this.state.gameState];
    }
    renderGameState() {
        switch (this.state.gameState){
            case GAME_STATES.AWAITING_PAYMENT:{
              return (
                <button onClick={this.beginWeb3Transaction.bind(this)}>Pay 1ETH To Continue</button>
              );     
            }
            case GAME_STATES.WAITING_FOR_PLAYERS: {
                return (
                    <button disabled onClick={()=>console.log("Connect with Web3")}>Waiting For Players</button>
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
  render(){
      return (
        <div className="GameLayout">
            {this.getGameText()}
            <br />
            {this.renderGameState()}
        </div>
        );
    }
}

export default GameLayout;
