import React from 'react';
import {GAME_STATES, BULLETS} from '../constants'
const _ = require('lodash')

class LoadoutPhase extends React.Component {
    constructor(){
        super();
        this.state = {rival: null, chosenBullet: null}
    }

    generateRivalButtons(){
        let {playersList} = this.props
        console.log(playersList)
        //TODO: emit the current player
        return (
            <div className='playersList'>
                {_.map(playersList, (rival) =>{
                    const {nickname, addr} = rival
                    return <button
                        style={{backgroundColor: addr === this.state.rival ? 'red' : 'blue'}}
                        onClick={() => this.setState({rival: addr})}
                        key={addr}>
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
        return (
            <div className='bulletButton' style={{margin: '10px'}} key= {`${bulletType}BulletButton`}>
                <img
                    alt=""
                    width="100px"
                    height="200px"
                    src={`./${bulletType}.jpeg`}
                    border={bulletType === chosenBullet ? '3px' : '0px'}
                    onClick={() => this.chooseBullet(bulletType)}
                    
                     />
                     <br/>
                        Remaining Bullets : {playerData[`${bulletType}Bullet`]}
                </div>
        )
    }
    chooseBullet(bulletType) {
        //TODO: Throw out error if not able to choose
        if(this.props.playerData[`${bulletType}Bullet`] > 0){
            this.setState({chosenBullet: BULLETS[bulletType]})
        }
        
    }
    generateSubmitButton(){
        const {gameState} = this.props;
        const isSent = GAME_STATES.CONFIRM_LOADOUT === gameState;
        return (
                <div className="submitButton">
                    <button
                        onClick={this.sendLoadout.bind(this)}
                        disabled={isSent}
                        >
                        Submit
                    </button>
                    <br/>
                    {isSent ? "Waiting for all players" : null }
                </div>)
    }

    sendLoadout(){
        const {handleLoadout} = this.props;
        const loadout = {
            bullet: this.state.chosenBullet,
            rival : this.state.rival
        }
        handleLoadout(loadout);
        //TODO: lock choices
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
