import React from 'react';
import { GAME_STATES, FOLD_STATES } from '../constants';
import {getPlayerAction} from '../utils'
const _ = require('lodash')

class HoldupPhase extends React.Component {
    constructor(){
        super();
        this.state = {isFolding: false, shootingList: {}};
    }

    async componentWillMount() {
        const {playersList} = this.props;
        let shootingList = await getPlayerAction(playersList,'rival');
        this.setState({shootingList: shootingList});
    }

    generateHoldupStatus(){
        const {playersList, playerAddress} = this.props;
        const {shootingList} = this.state;
        return (
            <div className='shootingList'>
                <table>
                    <tbody>
                        {_.map(shootingList, (val,key) =>{
                            return (<tr>
                                <td>{playerAddress === key ? 'You' : playersList[key].nickname}</td>
                                <td><img alt='' src='./pointingAt.png' width='60px'/></td>
                                <td>{playerAddress === val ? 'You' : playersList[val].nickname}</td>
                                </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        )
    }

    generateFoldingButtons() {
        return (
            <div className='bulletButtons' style={{display:'inline-flex'}}>
                {_.map(FOLD_STATES, (value, key) => this.createFoldingButton(value, key))}
            </div>
        )
    }

    createFoldingButton(value, key){
        const {waiting, gameState} = this.props;
        const sentChoice = waiting || gameState === GAME_STATES.CONFIRM_HOLDUP;
        return (
            <div className='foldingButton' style={{margin: '10px'}} key= {`${key}Button`}>
                <button disabled={sentChoice} onClick={() => this.setState({isFolding: value})}>{key}</button>
                </div>
        )
    }

    generateSubmitButton(){
        const {confirmHoldup, gameState, waiting} = this.props;
        const isSent = GAME_STATES.CONFIRM_HOLDUP === gameState;
        return (
                <div className="submitButton">
                    <button
                        onClick={isSent ? confirmHoldup : this.sendDecideFold.bind(this)}
                        disabled={waiting}
                        >
                        {isSent ? 'Confirm' : 'Submit'}
                    </button>
                </div>)
    }

    sendDecideFold(){
        const {handleHoldup} = this.props;
        const {isFolding} = this.state
        if(!isFolding){
            return;
        }
        const holdup = {
            isFolding: isFolding,
        }
        handleHoldup(holdup);
    }

    render(){
      const {gameData} = this.props;
      return (
        <div className="HoldupPhase">
            <h2> round {gameData.round}</h2>
            <h3> Pot: {gameData.pot}</h3>
            {this.generateHoldupStatus()}
            {this.generateFoldingButtons()}
            {this.generateSubmitButton()}
        </div>
        );
    }
}

export default HoldupPhase;
