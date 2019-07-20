pragma solidity ^0.5.10;

contract BlockchainGuns {
    uint8 constant BANG = 1;
    uint8 constant CLICK = 2;
    uint8 constant STAY = 3;
    uint8 constant FOLD = 4;
    uint constant PASSWORD_LENGTH = 8;

    enum Phases {
        WaitingForPlayers,
        LoadoutCommit,
        LoadoutReveal,
        HoldupCommit,
        HoldupReveal,
        EndGame
    }

    struct player {
        address addr;
        string nickname;
        uint pointsCount;
        uint wounds;
        uint bangUsed;
        uint clickUsed;
    }

    struct PlayerActions {
    bytes32 rivalCommit;
    bytes32 bulletCommit;
    bytes32 isFoldCommit;
    address rival;
    uint8 bullet;
    uint isFolding;
    }

    struct RoundData {
        uint roundNum;
        mapping (address => PlayerActions) actions;
    }

    Phases currentPhase;
    RoundData currentRound;
    RoundData[] rounds;
    uint roundNum = 0;
    uint maxRound = 8;
    uint numberOfPlayers = 6;
    uint numRegistered = 0;
    uint actionCount = 0;
    uint buyIn = 1 ether;
    uint roundValue;
    address[] playersList;

    event GameStart(
        address[] players
    );
    event NextPhase();
    
    mapping (address => uint) public pointsEarned;
    mapping (address => player) public playersInfo;
    mapping (address => Phases) internal playersState;

    function register(string calldata _nickname) external payable {
        require(numRegistered <= numberOfPlayers, "The max amount of players was reached");

        // check if a player is already registered
        require(playersInfo[msg.sender].addr != msg.sender, "You're already registered.");

        // check if a player payed the buy-in
        require(msg.value == buyIn, "You have to pay the correct buy in amount.");

        // register playerInfo
        playersInfo[msg.sender].addr = msg.sender;
        playersInfo[msg.sender].nickname = _nickname;
        playersInfo[msg.sender].pointsCount = 0;
        
        // increase player count and add the player to playerList
        numRegistered++;
        playersList.push(msg.sender);

        // check if can start game
        if (numRegistered == numberOfPlayers) {
            startGame();
        }
    }

    function startGame() internal {
        roundNum++;
        RoundData memory firstRound;
        firstRound.roundNum = roundNum;
        rounds.push(firstRound);
        currentPhase = Phases.LoadoutCommit;
        currentRound = firstRound;
        emit GameStart(playersList);
    }
    
    function loadoutCommit(bytes32 _rivalCommit, bytes32 _bulletCommit) external  {
        //TODO: Validate player not sent twice
        currentRound.actions[msg.sender].rivalCommit = _rivalCommit;
        currentRound.actions[msg.sender].bulletCommit = _bulletCommit;
        actionCount++;
        if(actionCount == numberOfPlayers){
            currentPhase = Phases.LoadoutReveal;
            actionCount = 0;
            emit NextPhase();
        }
    }

    function loadoutReveal(string calldata _rivalPassword, address _rivalReveal) external {
        bytes32 rivalApprove = keccak256(abi.encodePacked(_rivalPassword,"-",_rivalReveal));
        require(currentRound.actions[msg.sender].rivalCommit == rivalApprove,"Failed Reveal");
        //TODO: Do test that this is a valid rival
        currentRound.actions[msg.sender].rival = _rivalReveal;
        if(actionCount == numberOfPlayers){
            currentPhase = Phases.HoldupCommit;
            actionCount = 0;
            emit NextPhase();
        }
    }

    function holdupCommit(bytes32 _isFoldCommit) external {
        //TODO: Validate player not sent twice
        currentRound.actions[msg.sender].isFoldCommit = _isFoldCommit;
        actionCount++;
        if(actionCount == numberOfPlayers){
            currentPhase = Phases.HoldupReveal;
            actionCount = 0;
            emit NextPhase();
        }
    }

    function holdupReveal(string calldata _bulletPassword, string calldata _isFoldPassword,
                            uint8 _bulletReveal, uint8 _isFoldReveal) external {
        bytes32 bulletApprove = keccak256(abi.encodePacked(_bulletPassword,"-",_bulletReveal));
        require(currentRound.actions[msg.sender].bulletCommit == bulletApprove,"Failed Reveal");
        bytes32 isFoldApprove = keccak256(abi.encodePacked(_isFoldPassword,"-",_isFoldReveal));
        require(currentRound.actions[msg.sender].isFoldCommit == isFoldApprove,"Failed Reveal");
        //TODO: Do test that this is a valid bullet
        currentRound.actions[msg.sender].bullet = _bulletReveal;
        currentRound.actions[msg.sender].isFolding = _isFoldReveal;
        if(actionCount == numberOfPlayers){
            endRound();
        }
    }
    
    function endRound() internal{

        // use the player actions data
        address[] memory leftoutPlayers = new address[](numberOfPlayers);
        uint8 leftoutPlayersCount;
        leftoutPlayersCount = 0;
        for(uint i = 0; i < numberOfPlayers; i++){
            address currentPlayer = playersList[i];
            PlayerActions memory currentPlayerActions = currentRound.actions[currentPlayer];
            // if player has folded, throw him out of the round pot
            if(currentPlayerActions.isFolding == FOLD){
                leftoutPlayers[leftoutPlayersCount] = currentPlayer;
                leftoutPlayersCount++;
            }
            // if player has shot a BANG bullet
            else if(currentPlayerActions.bullet == BANG){
                // if player's rival did not fold
                if(currentRound.actions[currentPlayerActions.rival].isFolding == STAY){
                    // throw the rival out of the round pot
                    leftoutPlayers[leftoutPlayersCount] = currentPlayerActions.rival;
                    leftoutPlayersCount++;
                    // add rival a wound
                    playersInfo[currentPlayerActions.rival].wounds++;
                }
            }
           // add data to playerInfo
           if(currentPlayerActions.bullet == BANG){
             playersInfo[currentPlayer].bangUsed++;
           } else {
               playersInfo[currentPlayer].clickUsed++;
           }
        }

        // deal the prize
        uint prize = roundValue / (playersList.length - leftoutPlayers.length);
        bool shouldWin = true;
        for(uint i = 0;i < playersList.length;i++){
            for(uint j = 0;j < leftoutPlayers.length;j++){
                if(leftoutPlayers[j] == playersList[i]){
                    shouldWin = false;
                }
            }
            if(shouldWin){
                pointsEarned[playersList[i]] += prize;
            }
        }

        // check if to move to next round or end game
        roundNum++;
        if(roundNum > maxRound){
            endGame();
        } else {
        RoundData memory newRound;
        newRound.roundNum = roundNum;
        rounds.push(newRound);
        currentPhase = Phases.LoadoutCommit;
        currentRound = newRound;
            emit NextPhase();
        }
    }

    function endGame() internal {
        //TODO: Deal points to money
    }
    
    function getRoundRivals() external view returns(address[] memory){
        address[] memory roundRivals = new address[](numberOfPlayers);
        for(uint i=0;i<playersList.length;i++){
            roundRivals[i] = currentRound.actions[playersList[i]].rival;
        }
        return roundRivals;
    }
    
    function getRoundBullets() external view returns(uint[] memory){
        uint[] memory roundBullets = new uint[](numberOfPlayers);
        for(uint i=0;i<playersList.length;i++){
            roundBullets[i] = currentRound.actions[playersList[i]].bullet;
        }
        return roundBullets;
    }
    
    function getRoundFolds() external view returns(uint[] memory){
        uint[] memory roundFolds = new uint[](numberOfPlayers);
        for(uint i=0;i<playersList.length;i++){
            roundFolds[i] = currentRound.actions[playersList[i]].isFolding;
        }
        return roundFolds;
    }
}