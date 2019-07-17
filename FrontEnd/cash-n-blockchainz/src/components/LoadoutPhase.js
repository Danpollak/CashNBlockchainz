import React from 'react';

class LoadoutPhase extends React.Component {
    constructor(){
        super();
        this.state = {rival: null, chosenBullet: null}
    }

    generateRivalButtons(){
        let {players} = this.props.gameData
        //TODO: emit the current player
        return (
            <div className='playersList'>
                {players.map((rival) =>{
                    return <button
                        style={{backgroundColor: rival === this.state.rival ? 'red' : 'blue'}}
                        onClick={() => this.setState({rival: rival})}
                        key={rival}>
                        {rival}
                        </button>
                })}
            </div>
        )
    }
    generateBulletButtons() {
        const BULLET_TYPES = ['click','bang']
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
            this.setState({chosenBullet: bulletType})
        }
        
    }
    generateSubmitButton(){
        return (
                <div className="submitButton">
                    <button
                        onClick={this.sendLoadout.bind(this)}
                        >
                        Submit
                    </button>
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
        <h2> round {gameData.round}</h2>
        <h3> Pot: {gameData.pot}</h3>
        {this.generateRivalButtons()}
        {this.generateBulletButtons()}
        {this.generateSubmitButton()}
        </div>
        );
    }
}

export default LoadoutPhase;