import React from 'react';
import {GAME_STATES, BULLETS} from '../constants'
const _ = require('lodash')

class LoadoutPhase extends React.Component {
    constructor(){
        super();
        this.state = {rival: null, chosenBullet: null}
    }

    generateRivalButtons(){
        let {playersList, playerAddress, waiting, gameState} = this.props
        return (
            <div className='playersList'>
                {_.map(playersList, (rival) =>{
                    const {nickname, addr} = rival
                    const sentChoice = waiting || gameState === GAME_STATES.CONFIRM_LOADOUT;
                    if(playerAddress === addr){
                        return;
                    }
                    return <button
                        style={{backgroundColor: addr === this.state.rival ? 'red' : 'blue'}}
                        onClick={() => this.setState({rival: addr})}
                        key={addr}
                        disabled={sentChoice}>
                        {nickname}
                        </button>
                })}
            </div>
        )
    }
    generateBulletButtons() {
        const BULLET_TYPES = ['CLICK','BANG']
        return (
            <div className='bulletButtons' style={{display:'inline-flex'}}>
                {BULLET_TYPES.map((button) => this.createBulletButton(button))}
            </div>
        )
    }

    createBulletButton(bulletType){
        const {playerData} = this.props
        const {chosenBullet}  = this.state
        const bulletValue = BULLETS[bulletType]
        const {waiting, gameState} = this.props;
        const sentChoice = waiting || gameState === GAME_STATES.CONFIRM_LOADOUT;
        return (
            <div className='bulletButton' style={{margin: '10px'}} key= {`${bulletType}BulletButton`}>
                <img
                    alt=""
                    width="100px"
                    height="200px"
                    src={`./${bulletType}.jpeg`}
                    border={bulletValue === chosenBullet ? '3px' : '0px'}
                    onClick={() => {if(!sentChoice){this.chooseBullet(bulletType)}}}
                     />
                     <br/>
                        Remaining Bullets : {playerData[`${bulletType.toLowerCase()}Bullet`]}
                </div>
        )
    }
    chooseBullet(bulletType) {
        //TODO: Throw out error if not able to choose
        if(this.props.playerData[`${bulletType.toLowerCase()}Bullet`] > 0){
            this.setState({chosenBullet: BULLETS[bulletType.toUpperCase()]})
        }
        
    }
    generateSubmitButton(){
        const {gameState, confirmLoadout, waiting} = this.props;
        const isSent = GAME_STATES.CONFIRM_LOADOUT === gameState;
        return (
                <div className="submitButton">
                    <button
                        onClick={isSent ? confirmLoadout: this.sendLoadout.bind(this)}
                        disabled={waiting}
                        >
                        {isSent ? 'Confirm Choice' : 'Submit'}
                    </button>
                    <br/>
                </div>)
    }

    sendLoadout(){
        const {handleLoadout} = this.props;
        const {chosenBullet, rival} = this.state;
        if(!chosenBullet || !rival){
            return;
        }
        const loadout = {
            bullet: chosenBullet,
            rival : rival
        }
        handleLoadout(loadout);
    }
  render(){
      const {gameData} = this.props;
      return (
        <div className="LoadoutPhase">
        <h2> round {gameData.currentRound}</h2>
        <h3> Pot: {gameData.pot}</h3>
        {this.generateRivalButtons()}
        {this.generateBulletButtons()}
        {this.generateSubmitButton()}
        </div>
        );
    }
}

export default LoadoutPhase;
