import React from 'react';
import {GAME_STATES, BULLETS} from '../constants'
const _ = require('lodash')

class AwaitPaymentPhase extends React.Component {
    constructor(){
        super();
        this.state = {nickname: ''}
    }
    render() {
        const {paymentMethod, waiting} = this.props;
        const {nickname} = this.state;
        return (
            <div>
                <input type='text'
                name='nickname'
                maxLength='8'
                onChange={(e,v) => this.setState({nickname: e.target.value})}></input>
            <br/>
            <button onClick={() => paymentMethod(nickname)} disabled={waiting}>Pay 1ETH To Continue</button>
        </div>
        )
    }
}

export default AwaitPaymentPhase;