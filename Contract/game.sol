    pragma solidity ^0.5.10;

    contract BlockchainGuns {
        uint8 constant BANG = 1;
        uint8 constant CLICK = 2;
        uint8 constant STAY = 3;
        uint8 constant FOLD = 4;
        uint8 constant MAX_BANG = 3;
        uint8 constant MAX_CLICK = 5;
        uint8 constant MAX_WOUNDS = 3;

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
        
        mapping (address => PlayerActions) public currentRound;

        Phases public currentPhase = Phases.WaitingForPlayers;
        uint public roundNum = 0;
        uint public maxRound = 8;
        uint numberOfPlayers = 2;
        uint numberOfPlayersAlive = numberOfPlayers;
        uint public numRegistered = 0;
        uint public actionCount = 0;
        uint public buyIn = 1 ether / 10;
        uint public roundValue = (buyIn*numberOfPlayers) / 8;
        address payable[] public playersList = new address payable[](numberOfPlayers);

        event GameStart();
        event NextPhase();
        
        mapping (address => uint) public pointsEarned;
        mapping (address => player) public playersInfo;

        function register(string calldata _nickname) external payable {
            require(numRegistered < numberOfPlayers, "The max amount of players was reached");

            // check if a player is already registered
            require(playersInfo[msg.sender].addr != msg.sender, "You're already registered.");

            // check if a player payed the buy-in
            require(msg.value == buyIn, "You have to pay the correct buy in amount.");

            // register playerInfo
            playersInfo[msg.sender].addr = msg.sender;
            playersInfo[msg.sender].nickname = _nickname;
            playersInfo[msg.sender].pointsCount = 0;
            
            // increase player count and add the player to playerList
            playersList[numRegistered] = msg.sender;
            numRegistered++;
            

            // check if can start game
            if (numRegistered == numberOfPlayers) {
                startGame();
            }
        }

        function startGame() internal {
            roundNum++;
            currentPhase = Phases.LoadoutCommit;
            emit GameStart();
        }
        
        modifier atStage(Phases _phase) {
            require(currentPhase == _phase, "This is not the current phase.");
            _;
        }
        
        modifier isPlayerAlive(address _player) {
            require(playersInfo[_player].wounds > 2, "Dead players can't participate it the game.");
            _;
        }
        
        function loadoutCommit(bytes32 _rivalCommit, bytes32 _bulletCommit) external  {
            //TODO: sender is part of the game!
            require(currentRound[msg.sender].rivalCommit == "", "Only send commits once");
            require(currentRound[msg.sender].bulletCommit == "", "Only send commits once");
            currentRound[msg.sender].rivalCommit = _rivalCommit;
            currentRound[msg.sender].bulletCommit = _bulletCommit;
            actionCount++;
            if(actionCount == numberOfPlayersAlive){
                currentPhase = Phases.LoadoutReveal;
                actionCount = 0;
                emit NextPhase();
            }
        }

        function loadoutReveal(string calldata _rivalPassword, bytes20 _rivalReveal) external {
            bytes32 rivalApprove = keccak256(abi.encode(_rivalPassword,_rivalReveal));
            require(currentRound[msg.sender].rivalCommit == rivalApprove,"Failed Reveal - doesn't match your commit.");
            currentRound[msg.sender].rival = address(_rivalReveal);
            actionCount++;
            if(actionCount == numberOfPlayersAlive){
                 currentPhase = Phases.HoldupCommit;
                 actionCount = 0;
                 emit NextPhase();
            }
        }
 
        function holdupCommit(bytes32 _isFoldCommit) external {
            //TODO: Validate player not sent twice
            require(currentRound[msg.sender].isFoldCommit == "", "Only send commits once");
            currentRound[msg.sender].isFoldCommit = _isFoldCommit;
            actionCount++;
            if(actionCount == numberOfPlayersAlive){
                currentPhase = Phases.HoldupReveal;
                actionCount = 0;
                emit NextPhase();
            }
        }

        function holdupReveal(string calldata _bulletPassword, string calldata _isFoldPassword,
                                uint8 _bulletReveal, uint8 _isFoldReveal) external {
            bytes32 bulletApprove = keccak256(abi.encodePacked(_bulletPassword,"-",_bulletReveal));
            require(currentRound[msg.sender].bulletCommit == bulletApprove,"Failed Reveal");
            bytes32 isFoldApprove = keccak256(abi.encodePacked(_isFoldPassword,"-",_isFoldReveal));
            require(currentRound[msg.sender].isFoldCommit == isFoldApprove,"Failed Reveal");
            currentRound[msg.sender].bullet = _bulletReveal;
            currentRound[msg.sender].isFolding = _isFoldReveal;
            actionCount++;
            if(actionCount == numberOfPlayersAlive){
                endRound();
            }
        }
        
        function endRound() internal{

            // use the player actions data
            address[] memory leftoutPlayers = new address[](numberOfPlayers);
            uint8 leftoutPlayersCount;
            leftoutPlayersCount = 0;
            for(uint i = 0; i < playersList.length; i++){
                if(playersInfo[playersList[i]].wounds > 2){
                    continue;
                }
                address currentPlayer = playersList[i];
                PlayerActions memory currentPlayerActions = currentRound[currentPlayer];
                // if player has folded, throw him out of the round pot
                if(currentPlayerActions.isFolding == FOLD){
                    leftoutPlayers[leftoutPlayersCount] = currentPlayer;
                    leftoutPlayersCount++;
                }
                // if player has shot a BANG bullet
                else if(currentPlayerActions.bullet == BANG){
                    // if player's rival did not fold
                    if(currentRound[currentPlayerActions.rival].isFolding == STAY){
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
                shouldWin = true;
            }

            // check if to move to next round or end game
            roundNum++;
            if(roundNum > maxRound){
                endGame();
            } else {
                //TODO: clear the currentRound data
                //RoundData memory newRound;
                //newRound.roundNum = roundNum;
                //rounds.push(newRound);
                currentPhase = Phases.LoadoutCommit;
                //currentRound = newRound;
                actionCount = 0;
                emit NextPhase();
            }
        }

        function endGame() internal {
            for(uint i = 0;i < playersList.length;i++){
                //address payable playerAddr = playersList[i];
                playersList[i].transfer(pointsEarned[playersList[i]]/100);
            }
        }
        
        function getRoundRivals() external view returns(address[] memory){
            address[] memory roundRivals = new address[](numberOfPlayers);
            for(uint i=0;i<playersList.length;i++){
                roundRivals[i] = currentRound[playersList[i]].rival;
            }
            return roundRivals;
        }
        
        function getRoundBullets() external view returns(uint[] memory){
            uint[] memory roundBullets = new uint[](numberOfPlayers);
            for(uint i=0;i<playersList.length;i++){
                roundBullets[i] = currentRound[playersList[i]].bullet;
            }
            return roundBullets;
        }
        
        function getRoundFolds() external view returns(uint[] memory){
            uint[] memory roundFolds = new uint[](numberOfPlayers);
            for(uint i=0;i<playersList.length;i++){
                roundFolds[i] = currentRound[playersList[i]].isFolding;
            }
            return roundFolds;
        }
        

    }