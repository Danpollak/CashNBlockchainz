import React from 'react';
import { GAME_STATES } from '../constants';
const _ = require('lodash')

class HoldupPhase extends React.Component {
    constructor(){
        super();
        this.state = {isFolding: false}
    }

    generateHoldupStatus(){
        let {shootingList} = this.props.gameData
        //TODO: highlight the current player choice
        return (
            <div className='shootingList'>
                <table>
                    <tbody>
                        {_.map(shootingList, (val,key) =>{
                            return (<tr>
                                <td>{key}</td>
                                <td>points at</td>
                                <td>{val}</td>
                                </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        )
    }

    generateFoldingButtons() {
        const BUTTON_TYPES = {fold: true, stay: false}
        return (
            <div className='bulletButtons' style={{display:'inline-flex'}}>
                {_.map(BUTTON_TYPES, (value, key) => this.createFoldingButton(value, key))}
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
        return (
                <div className="submitButton">
                    <button
                        onClick={this.sendLDecideFold.bind(this)}
                        >
                        Submit
                    </button>
                </div>)
    }

    sendLDecideFold(){
        const {handleHoldup} = this.props;
        const holdup = {
            isFolding: this.state.isFolding,
        }
        handleHoldup(holdup);
        //TODO: lock choices
    }

    shouldDecideFold() {
        let {shootingList} = this.props.gameData;
        const me = this.props.playerData.name;
        for( let val in shootingList){
            if(shootingList[val] === me){
                return true;
            }
        }
        return false;
    }
  render(){
      //const shouldDecideFold = this.shouldDecideFold()
      const {gameData, gameState} = this.props;
      const isSent = GAME_STATES.CONFIRM_HOLDUP === gameState;
      return (
        <div className="LoadoutPhase">
        <h2> round {gameData.round}</h2>
        <h3> Pot: {gameData.pot}</h3>
        {this.generateHoldupStatus()}
        {!isSent ? this.generateFoldingButtons() : null}
        {!isSent ? this.generateSubmitButton() : "Waiting for Other Players"}
        </div>
        );
    }
}

export default HoldupPhase;
