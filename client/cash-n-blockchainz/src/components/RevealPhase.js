import React from 'react';
import {getPrevPlayerAction} from '../utils'
 import {FOLD_STATES, BULLETS} from '../constants'
const _ = require('lodash')

class revealPhase extends React.Component {
    constructor(){
        super();
        this.state = {rivalActions: {},bulletActions: {}, foldActions: {}}
    }

    async componentWillMount(){
        const {playersList} = this.props;
        const rivalActions = await getPrevPlayerAction(playersList, 'rival')
        const bulletActions = await getPrevPlayerAction(playersList, 'bullet');
        const foldActions = await getPrevPlayerAction(playersList,'isFolding');
        this.setState({rivalActions:rivalActions, bulletActions:bulletActions,foldActions:foldActions})
    }
    getPlayerStatus(){
        const {playersList} = this.props;
        const {rivalActions, bulletActions, foldActions} = this.state;
        if(_.isEmpty(rivalActions) || _.isEmpty(bulletActions) || _.isEmpty(foldActions)){
            return;
        }
        
        return (
            <tbody>
  {              _.map(playersList, (playerData, playerAddr) => {
            const {nickname} = playerData;
            const isPlayerFolded = foldActions[playerAddr] === FOLD_STATES.FOLD;
            const isBulletReal = bulletActions[playerAddr] === BULLETS.BANG;
            const rival = rivalActions[playerAddr];
            const rivalNickname = playersList[rival].nickname;
            const isRivalFolded = foldActions[rival] === FOLD_STATES.FOLD;
            return(
            <tr>
                <td>{nickname}</td>
                <td>{this.getActionText(isPlayerFolded,isBulletReal)}</td>
                <td>{this.getRivalText(isPlayerFolded, isBulletReal, isRivalFolded, rivalNickname)}</td>
            </tr>)})}
            </tbody>)
    }

    getActionText(isPlayerFolded,isBulletReal){
        if(isPlayerFolded){
            return 'has chickened out and folded!';
        } else if (isBulletReal){
            return <img alt='' src='./gunBang.png' width='90px'/>;
        } else {
            return <img alt='' src='./gunClick.png' width='90px'/>;
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
      return (
        <div className="revealPhase">
            <div className="summaryTable">
                <table>
                        {this.getPlayerStatus()}
                </table>
            </div>
        {this.generateContinueButton()}
        </div>
        );
    }
}

export default revealPhase;
