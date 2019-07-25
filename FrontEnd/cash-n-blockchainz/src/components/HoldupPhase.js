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
        const {playersList} = this.props;
        const {shootingList} = this.state;
        //let shootingList = await getPlayerAction(playersList,'rival');
        return (
            <div className='shootingList'>
                <table>
                    <tbody>
                        {_.map(shootingList, (val,key) =>{
                            return (<tr>
                                <td>{playersList[key].nickname}</td>
                                <td>points at</td>
                                <td>{playersList[val].nickname}</td>
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
        return (
            <div className='foldingButton' style={{margin: '10px'}} key= {`${key}Button`}>
                <button onClick={() => this.setState({isFolding: value})}>{key}</button>
                </div>
        )
    }

    generateSubmitButton(){
        const {confirmHoldup, gameState} = this.props;
        const isSent = GAME_STATES.CONFIRM_HOLDUP === gameState;
        return (
                <div className="submitButton">
                    <button
                        onClick={isSent ? confirmHoldup : this.sendDecideFold.bind(this)}
                        >
                        {isSent ? 'Confirm' : 'Submit'}
                    </button>
                </div>)
    }

    sendDecideFold(){
        const {handleHoldup} = this.props;
        const holdup = {
            isFolding: this.state.isFolding,
        }
        handleHoldup(holdup);
    }

    render(){
      const {gameData, gameState} = this.props;
      const isSent = GAME_STATES.CONFIRM_HOLDUP === gameState;
      return (
        <div className="LoadoutPhase">
            <h2> round {gameData.round}</h2>
            <h3> Pot: {gameData.pot}</h3>
            {this.generateHoldupStatus()}
            {this.generateFoldingButtons()}
            {this.generateSubmitButton()}
        </div>
        );
    }
}

{/* <h2> round {gameData.round}</h2>
<h3> Pot: {gameData.pot}</h3>
{this.generateHoldupStatus()}
{!isSent ? this.generateFoldingButtons() : null}
{!isSent ? this.generateSubmitButton() : "Waiting for Other Players"} */}
export default HoldupPhase;
