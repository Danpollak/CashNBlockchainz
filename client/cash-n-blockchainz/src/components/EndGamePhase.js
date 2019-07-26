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
                <td>has Earned</td>
                <td>{`${endGameResults[playerAddr]} ether`}</td>
            </tr>)})}
            </tbody>)
    }

    getActionText(isPlayerFolded,isBulletReal){
        if(isPlayerFolded){
            return 'has chickened out and folded!';
        } else if (isBulletReal){
            return 'shot';
        } else {
            return 'shot blank at';
        }
    }

    getRivalText(isPlayerFolded, isBulletReal, isRivalFolded, rival){
        if(isPlayerFolded){
            return '';
        } else if (isRivalFolded) {
            return `${rival}, but he ducked!`;
        } else if (isBulletReal) {
            return `${rival} and he got wounded!`
        } else {
            return rival;
        }
    }
  render(){
      return (
        <div className="endGamePhase">
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
