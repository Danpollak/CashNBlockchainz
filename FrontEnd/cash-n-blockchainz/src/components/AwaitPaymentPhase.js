import React from 'react';

const AwaitPaymentPhase = (props) => {
    return (
        <div>
        <br/>
        <button onClick={props.paymentMethod}>Pay 1ETH To Continue</button>
    </div>
    )
}

export default AwaitPaymentPhase;