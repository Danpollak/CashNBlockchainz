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
        bool isOut;
        bool sentAction;
        }
        
        mapping (address => PlayerActions) public currentRound;
        mapping (address => PlayerActions) public prevRound;

        Phases public currentPhase = Phases.WaitingForPlayers;
        uint public roundNum = 0;
        uint public maxRound = 1;
        uint numberOfPlayers = 1;
        uint numberOfPlayersAlive = numberOfPlayers;
        uint public numRegistered = 0;
        uint public actionCount = 0;
        uint public buyIn = 1 ether / 10;
        uint public roundValue = (buyIn*numberOfPlayers) / maxRound;
        address payable[] public playersList = new address payable[](numberOfPlayers);
        uint public prize;

        event GameStart();
        event NextPhase();
        
        mapping (address => uint) public pointsEarned;
        mapping (address => player) public playersInfo;

        function register(string calldata _nickname) atStage(Phases.WaitingForPlayers) external payable {
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

        modifier atStage(Phases _phase) {
            require(currentPhase == _phase, "This is not the current phase.");
            _;
        }
        
        modifier canPlayerPlay() {
            require(playersInfo[msg.sender].wounds < 3);
            require(playersInfo[msg.sender].addr == msg.sender);
            require(!currentRound[msg.sender].sentAction);
            _;
        }
        
        function startGame() internal {
            roundNum++;
            currentPhase = Phases.LoadoutCommit;
            emit GameStart();
        }
        
        function loadoutCommit(bytes32 _rivalCommit, bytes32 _bulletCommit) canPlayerPlay() external  {
            currentRound[msg.sender].rivalCommit = _rivalCommit;
            currentRound[msg.sender].bulletCommit = _bulletCommit;
            actionCount++;
            currentRound[msg.sender].sentAction = true;
            if(actionCount == numberOfPlayersAlive){
                currentPhase = Phases.LoadoutReveal;
                clearActions();
                emit NextPhase();
            }
        }

        function loadoutReveal(string calldata _rivalPassword, bytes20 _rivalReveal) atStage(Phases.LoadoutReveal) canPlayerPlay() external {
            bytes32 rivalApprove = keccak256(abi.encode(_rivalPassword,_rivalReveal));
            require(currentRound[msg.sender].rivalCommit == rivalApprove);
            currentRound[msg.sender].rival = address(_rivalReveal);
            actionCount++;
            currentRound[msg.sender].sentAction = true;
             if(actionCount == numberOfPlayersAlive){
                  currentPhase = Phases.HoldupCommit;
                  clearActions();
                  emit NextPhase();
             }
        }
 
        function holdupCommit(bytes32 _isFoldCommit) atStage(Phases.HoldupCommit) canPlayerPlay() external {
            currentRound[msg.sender].isFoldCommit = _isFoldCommit;
            actionCount++;
            currentRound[msg.sender].sentAction = true;
            if(actionCount == numberOfPlayersAlive){
                currentPhase = Phases.HoldupReveal;
                clearActions();
                emit NextPhase();
            }
        }

        function holdupReveal(string calldata _bulletPassword, uint8 _bulletReveal,
                                string calldata _isFoldPassword, uint8 _isFoldReveal) atStage(Phases.HoldupReveal) canPlayerPlay() external {
            bytes32 bulletApprove = keccak256(abi.encode(_bulletPassword,_bulletReveal));
            require(currentRound[msg.sender].bulletCommit == bulletApprove);
            bytes32 isFoldApprove = keccak256(abi.encode(_isFoldPassword,_isFoldReveal));
            require(currentRound[msg.sender].isFoldCommit == isFoldApprove);
            currentRound[msg.sender].bullet = _bulletReveal;
            currentRound[msg.sender].isFolding = _isFoldReveal;
            actionCount++;
            currentRound[msg.sender].sentAction = true;
            if(actionCount == numberOfPlayersAlive){
                endRound();
            }
        }
        
        function endRound() internal{

            // use the player actions data
            // address[] memory leftoutPlayers = new address[](numberOfPlayers);
            uint8 leftoutPlayersCount;
            leftoutPlayersCount = 0;
            for(uint i = 0; i < numberOfPlayers; i++){
                address currentPlayer = playersList[i];
                if(playersInfo[currentPlayer].wounds > 2){
                    leftoutPlayersCount++;
                }
                // if player has folded, throw him out of the round pot
                else if(currentRound[currentPlayer].isFolding == FOLD){
                    currentRound[currentPlayer].isOut = true;
                    leftoutPlayersCount++;
                }
                // if player has shot a BANG bullet
                else if(currentRound[currentPlayer].bullet == BANG){
                    // if player's rival did not fold
                    address rival = currentRound[currentPlayer].rival;
                    if(currentRound[rival].isFolding == STAY){
                        // throw the rival out of the round pot
                        currentRound[rival].isOut = true;
                        leftoutPlayersCount++;
                        // add rival a wound
                        playersInfo[rival].wounds++;
                    }
                }
            // add data to playerInfo
            if(currentRound[currentPlayer].bullet == BANG){
                playersInfo[currentPlayer].bangUsed++;
             } else {
                 playersInfo[currentPlayer].clickUsed++;
             }
            }

            // // deal the prize
            if(numberOfPlayers - leftoutPlayersCount == 0){
                prize = 0;
            } else {
                prize = roundValue / (numberOfPlayers - leftoutPlayersCount);
            }
            for(uint i = 0;i < numberOfPlayers;i++){
                address currentPlayer = playersList[i];
                if((!currentRound[currentPlayer].isOut) || (playersInfo[currentPlayer].wounds < 3)){
                    pointsEarned[currentPlayer]+=prize;
                }
            }

            // check if to move to next round or end game
             roundNum++;
            for(uint i = 0; i < numberOfPlayers; i++){
                address currentPlayer = playersList[i];
                if(roundNum > 1){
                    delete prevRound[currentPlayer];
                }
                prevRound[currentPlayer] = currentRound[currentPlayer];
                delete currentRound[currentPlayer];
            }
            if(roundNum > maxRound){
                endGame();
            } else  {
                currentPhase = Phases.LoadoutCommit;
                actionCount = 0;
                emit NextPhase();
            }
        }

        function endGame() internal {
            for(uint i = 0;i < numberOfPlayers;i++){
                address payable currentPlayer = playersList[i];
                currentPlayer.transfer(pointsEarned[currentPlayer]);
            }
            currentPhase = Phases.EndGame;
        }
        
        function clearActions() internal {
            for(uint i = 0; i < numberOfPlayers; i++){
                address currentPlayer = playersList[i];
                currentRound[currentPlayer].sentAction = false;
            } 
            actionCount = 0;
        }
        
        

    }