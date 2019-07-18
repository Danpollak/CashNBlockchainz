import React from 'react';
import {PLAYER_STATUS} from '../constants'
const _ = require('lodash')

class revealPhase extends React.Component {
    getPlayerStatus(playerData){
        if(playerData.isFolding){
            return 'chickened out!';
        }
        switch(playerData.action){
        case PLAYER_STATUS.BANG: return 'shot';
        case PLAYER_STATUS.CLICK: return 'shot blanks at';
        default: return '???'
        }
        return '???'
    }
    generateContinueButton(){
        const {continueToNextRound} = this.props;
        return (
                <div className="continueButton">
                    <button
                        onClick={continueToNextRound}
                        >
                        Continue to Next Round
                    </button>
                </div>)
    }
  render(){
      const {gameData} = this.props;
      const roundSummary = gameData.prevRounds[gameData.prevRounds.length-1];
      return (
        <div className="revealPhase">
            <h2> round {gameData.round}</h2>
            <h3> Pot: {gameData.pot}</h3>
            <div className="summaryTable">
                <table>
                    <tbody>
                        {_.map(roundSummary, (data, playerName) => {
                            return (
                                <tr>
                                    <td>{playerName}</td>
                                    <td>{this.getPlayerStatus(data)}</td>
                                    <td>{data.isFolding ? null : data.rival}</td>
                                </tr>
                            )
                        })}
                    </tbody>            
                </table>
            </div>
        {this.generateContinueButton()}
        </div>
        );
    }
}

export default revealPhase;
