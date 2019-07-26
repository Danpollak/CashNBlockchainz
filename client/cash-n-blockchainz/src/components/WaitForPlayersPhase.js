import React from 'react';

const WaitForPlayersPhase = (props) => {
    const playersLoggedIn = 5;
    return (
        <div>
            There are {playersLoggedIn} players logged in.
    </div>
    )
}

export default WaitForPlayersPhase;