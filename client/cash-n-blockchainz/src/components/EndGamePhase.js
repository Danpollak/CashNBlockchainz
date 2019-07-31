import React from 'react';
import {getEndGame} from '../utils'
import {FOLD_STATES, BULLETS} from '../constants'
const _ = require('lodash')

class EndGamePhase extends React.Component {
    constructor(){
        super();
        this.state = {endGameResults: {},bulletActions: {}, foldActions: {}}
    }

    async componentWillMount(){
        const {playersList} = this.props;
        const endGameResults = await getEndGame(playersList);
        this.setState({endGameResults:endGameResults});
    }
    getResults(){
        const {playersList} = this.props;
        const {endGameResults} = this.state;
        if(_.isEmpty(endGameResults)){
            return;
        }
        return (
            <tbody>
  {              _.map(playersList, (playerData, playerAddr) => {
            const {nickname} = playerData;
            return(
            <tr key={playerAddr}>
                <td>{nickname}</td>
                <td>has earned</td>
                <td>{`${endGameResults[playerAddr]} ether`}</td>
            </tr>)})}
            </tbody>)
    }
  render(){
      return (
        <div className="endGamePhase">
            <h2>Game Over!</h2>
            <div className="summaryTable">
                <table>
                        {this.getResults()}
                </table>
            </div>
        </div>
        );
    }
}

export default EndGamePhase
;
