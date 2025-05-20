// Game client functionality
document.addEventListener('DOMContentLoaded', () => {
    // Socket.io connection (automatically detect the correct port)
    const socket = io();
    
    // Game state
    let gameId = '';
    let playerId = '';
    let isPlayer = false;
    let isFacilitator = false;
    let playerInfo = {};
    let gameDetails = {};
    let roundActive = false;
    let timerInterval = null;
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlGameId = urlParams.get('gameId');
    const urlRole = urlParams.get('role');
    
    // Handle role-specific UI
    const roleSelection = document.querySelector('.role-selection');
    
    // If role=student parameter is present, only show the student form
    if (urlRole === 'student') {
        roleSelection.classList.add('student-only');
        document.title = 'Join Multiplier Effect Experiment';
        
        // If we also have a game ID, show the direct join message
        if (urlGameId) {
            document.getElementById('student-instructions').classList.add('hidden');
            document.getElementById('direct-join-message').classList.remove('hidden');
            
            // Make the game code field readonly since it's pre-filled
            document.getElementById('game-id').readOnly = true;
        }
    }
    
    // DOM Elements - Screens
    const homeScreen = document.getElementById('home-screen');
    const lobbyScreen = document.getElementById('lobby-screen');
    const playerGameScreen = document.getElementById('player-game-screen');
    const facilitatorGameScreen = document.getElementById('facilitator-game-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    
    // DOM Elements - Home Screen
    const joinGameForm = document.getElementById('join-game-form');
    const createGameForm = document.getElementById('create-game-form');
    const gameIdInput = document.getElementById('game-id');
    const playerNameInput = document.getElementById('player-name');
    const facilitatorNameInput = document.getElementById('facilitator-name');
    const roundsInput = document.getElementById('rounds');
    const mpcInput = document.getElementById('mpc');
    const timeLimitInput = document.getElementById('time-limit');
    
    // DOM Elements - Lobby Screen
    const lobbyGameId = document.getElementById('lobby-game-id');
    const lobbyGameCode = document.getElementById('lobby-game-code');
    const lobbyFacilitatorName = document.getElementById('lobby-facilitator-name');
    const lobbyPlayerCount = document.getElementById('lobby-player-count');
    const lobbyJoinLink = document.getElementById('lobby-join-link');
    const lobbyJoinLinkContainer = document.getElementById('lobby-join-link-container');
    const lobbyPlayersList = document.getElementById('lobby-players-list');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const playerLobbyControls = document.getElementById('player-lobby-controls');
    const facilitatorLobbyControls = document.getElementById('facilitator-lobby-controls');
    const startGameBtn = document.getElementById('start-game-btn');
    
    // DOM Elements - Player Game Screen
    const playerCurrentRound = document.getElementById('player-current-round');
    const playerTotalRounds = document.getElementById('player-total-rounds');
    const playerInvestment = document.getElementById('player-investment');
    const playerNameDisplay = document.getElementById('player-name-display');
    const playerPreviousIncome = document.getElementById('player-previous-income');
    const playerSuggestedConsumption = document.getElementById('player-suggested-consumption');
    const consumptionForm = document.getElementById('consumption-form');
    const consumptionAmount = document.getElementById('consumption-amount');
    const submitConsumptionBtn = document.getElementById('submit-consumption-btn');
    const waitingForResults = document.getElementById('waiting-for-results');
    const roundResults = document.getElementById('round-results');
    const resultConsumption = document.getElementById('result-consumption');
    const resultAverageConsumption = document.getElementById('result-average-consumption');
    const resultIncome = document.getElementById('result-income');
    const resultTargetConsumption = document.getElementById('result-target-consumption');
    const resultDeviation = document.getElementById('result-deviation');
    const resultCumulativeDeviation = document.getElementById('result-cumulative-deviation');
    const roundTimerContainer = document.getElementById('round-timer-container');
    const playerRoundTimer = document.getElementById('player-round-timer');
    
    // DOM Elements - Facilitator Game Screen
    const facilitatorCurrentRound = document.getElementById('facilitator-current-round');
    const facilitatorTotalRounds = document.getElementById('facilitator-total-rounds');
    const facilitatorInvestment = document.getElementById('facilitator-investment');
    const facilitatorPlayerCount = document.getElementById('facilitator-player-count');
    const facilitatorPlayerCount2 = document.getElementById('facilitator-player-count-2');
    const facilitatorSubmissions = document.getElementById('facilitator-submissions');
    const nextRoundBtn = document.getElementById('next-round-btn');
    const endRoundBtn = document.getElementById('end-round-btn');
    const endGameBtn = document.getElementById('end-game-btn');
    const facilitatorRoundResults = document.getElementById('facilitator-round-results');
    const facilitatorResultRound = document.getElementById('facilitator-result-round');
    const facilitatorAverageConsumption = document.getElementById('facilitator-average-consumption');
    const facilitatorIncome = document.getElementById('facilitator-income');
    const facilitatorPlayersContainer = document.getElementById('facilitator-players-container');
    const facilitatorTimerContainer = document.getElementById('facilitator-timer-container');
    const facilitatorRoundTimer = document.getElementById('facilitator-round-timer');
    
    // DOM Elements - Game Over Screen
    const playerFinalResults = document.getElementById('player-final-results');
    const facilitatorFinalResults = document.getElementById('facilitator-final-results');
    const finalCumulativeDeviation = document.getElementById('final-cumulative-deviation');
    const finalRank = document.getElementById('final-rank');
    const finalPlayerCount = document.getElementById('final-player-count');
    const playerResultsTableBody = document.getElementById('player-results-table-body');
    const leaderboardTableBody = document.getElementById('leaderboard-table-body');
    const economyResultsTableBody = document.getElementById('economy-results-table-body');
    const playAgainBtn = document.getElementById('play-again-btn');
    
    // DOM Elements - Tutorials
    const playerTutorialBtn = document.getElementById('player-tutorial-btn');
    const facilitatorTutorialBtn = document.getElementById('facilitator-tutorial-btn');
    const studentTutorialModal = document.getElementById('student-tutorial-modal');
    const instructorTutorialModal = document.getElementById('instructor-tutorial-modal');
    const closeStudentTutorial = document.getElementById('close-student-tutorial');
    const closeInstructorTutorial = document.getElementById('close-instructor-tutorial');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    // If there's a gameId in the URL, pre-fill the join form
    if (urlGameId) {
        gameIdInput.value = urlGameId;
        
        // If both gameId and role=student are present, focus on the name field for immediate input
        if (urlRole === 'student') {
            playerNameInput.focus();
        }
    }
    
    // Helper Functions
    
    // Show a specific screen and hide all others
    function showScreen(screen) {
        homeScreen.classList.add('hidden');
        lobbyScreen.classList.add('hidden');
        playerGameScreen.classList.add('hidden');
        facilitatorGameScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        
        screen.classList.remove('hidden');
    }
    
    // Format a number to 2 decimal places
    function formatNumber(num) {
        return parseFloat(num).toFixed(2);
    }
    
    // Start a countdown timer
    function startTimer(seconds, playerDisplay, facilitatorDisplay) {
        clearInterval(timerInterval);
        
        const endTime = Date.now() + seconds * 1000;
        
        timerInterval = setInterval(() => {
            const timeLeft = Math.ceil((endTime - Date.now()) / 1000);
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                if (isPlayer) {
                    playerDisplay.textContent = '0';
                    roundTimerContainer.classList.add('hidden');
                }
                if (isFacilitator) {
                    facilitatorDisplay.textContent = '0';
                    facilitatorTimerContainer.classList.add('hidden');
                }
                return;
            }
            
            if (isPlayer) {
                playerDisplay.textContent = timeLeft;
            }
            if (isFacilitator) {
                facilitatorDisplay.textContent = timeLeft;
            }
        }, 1000);
    }
    
    // Format a player card for the facilitator view
    function createPlayerCard(player) {
        const card = document.createElement('div');
        card.className = 'player-card';
        
        const nameSpan = document.createElement('div');
        nameSpan.className = 'player-name';
        nameSpan.textContent = player.nickname;
        
        const statsSpan = document.createElement('div');
        statsSpan.className = 'player-stats';
        
        const consumptionSpan = document.createElement('span');
        consumptionSpan.textContent = `Consumption: ${player.consumption || 'Not submitted'}`;
        
        const deviationSpan = document.createElement('span');
        deviationSpan.textContent = `Deviation: ${formatNumber(player.deviation || 0)}`;
        
        statsSpan.appendChild(consumptionSpan);
        statsSpan.appendChild(deviationSpan);
        
        card.appendChild(nameSpan);
        card.appendChild(statsSpan);
        
        return card;
    }
    
    // Create a lobby player item
    function createLobbyPlayerItem(playerName) {
        const item = document.createElement('div');
        item.className = 'lobby-player-item';
        item.textContent = playerName;
        return item;
    }
    
    // Modal Functions
    function showModal(modal) {
        modal.classList.remove('hidden');
    }
    
    function hideModal(modal) {
        modal.classList.add('hidden');
    }
    
    // Socket Event Handlers
    
    // Handle connection
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    // Handle errors
    socket.on('server:error', (data) => {
        alert(data.message);
    });
    
    // Handle game creation confirmation (Facilitator)
    socket.on('server:game_created', (data) => {
        console.log('Game created:', data);
        
        gameId = data.gameId;
        isFacilitator = true;
        isPlayer = false;
        gameDetails = data.gameDetails;
        
        // Update lobby UI
        lobbyGameId.textContent = gameId;
        lobbyGameCode.textContent = gameId;
        lobbyFacilitatorName.textContent = gameDetails.facilitatorName;
        lobbyPlayerCount.textContent = '0';
        
        // Show join link
        lobbyJoinLinkContainer.classList.remove('hidden');
        lobbyJoinLink.value = data.joinLink;
        
        // Show facilitator controls
        playerLobbyControls.classList.add('hidden');
        facilitatorLobbyControls.classList.remove('hidden');
        
        // Switch to lobby screen
        showScreen(lobbyScreen);
    });
    
    // Handle player joining confirmation (Player)
    socket.on('server:player_joined', (data) => {
        console.log('Player joined:', data);
        
        // If this is a confirmation for the current player
        if (data.playerId) {
            gameId = data.gameId;
            playerId = data.playerId;
            isPlayer = true;
            isFacilitator = false;
            playerInfo = data.playerInfo;
            
            // Update lobby UI
            lobbyGameId.textContent = gameId;
            lobbyFacilitatorName.textContent = data.facilitatorName;
            lobbyPlayerCount.textContent = data.playerCount;
            
            // Hide join link container (only for facilitator)
            lobbyJoinLinkContainer.classList.add('hidden');
            
            // Show player controls
            playerLobbyControls.classList.remove('hidden');
            facilitatorLobbyControls.classList.add('hidden');
            
            // Switch to lobby screen
            showScreen(lobbyScreen);
        } 
        // If this is a notification about another player
        else {
            // Update player count
            lobbyPlayerCount.textContent = data.playerCount;
            
            // Add player to lobby list
            lobbyPlayersList.appendChild(createLobbyPlayerItem(data.nickname));
            
            // Enable start game button if at least one player
            if (isFacilitator && data.playerCount > 0) {
                startGameBtn.disabled = false;
                const minPlayersNotice = document.querySelector('.min-players-notice');
                minPlayersNotice.textContent = 'Ready to start the game!';
            }
        }
    });
    
    // Handle game start
    socket.on('server:game_started', (data) => {
        console.log('Game started:', data);
        
        gameDetails = data.gameDetails;
        
        if (isPlayer) {
            // Update player game screen
            playerTotalRounds.textContent = gameDetails.totalRounds;
            playerNameDisplay.textContent = playerInfo.nickname;
            
            // Show player game screen
            showScreen(playerGameScreen);
            
            // Show tutorial first time
            if (!localStorage.getItem('multiplierEffect_tutorialShown_player')) {
                showModal(studentTutorialModal);
                localStorage.setItem('multiplierEffect_tutorialShown_player', 'true');
            }
        } else if (isFacilitator) {
            // Update facilitator game screen
            facilitatorTotalRounds.textContent = gameDetails.totalRounds;
            facilitatorPlayerCount.textContent = gameDetails.playerCount;
            facilitatorPlayerCount2.textContent = gameDetails.playerCount;
            facilitatorSubmissions.textContent = '0';
            
            // Show facilitator game screen
            showScreen(facilitatorGameScreen);
            
            // Show tutorial first time
            if (!localStorage.getItem('multiplierEffect_tutorialShown_facilitator')) {
                showModal(instructorTutorialModal);
                localStorage.setItem('multiplierEffect_tutorialShown_facilitator', 'true');
            }
        }
    });
    
    // Handle round start (Player)
    socket.on('server:round_started', (data) => {
        console.log('Round started for player:', data);
        
        roundActive = true;
        
        // Update game state and UI
        playerCurrentRound.textContent = data.roundNumber;
        playerInvestment.textContent = data.investment;
        playerPreviousIncome.textContent = formatNumber(data.previousIncome);
        playerSuggestedConsumption.textContent = formatNumber(data.suggestedConsumption);
        
        // Reset consumption input
        consumptionAmount.value = data.suggestedConsumption > 0 ? Math.round(data.suggestedConsumption) : 0;
        consumptionAmount.max = data.previousIncome * 2; // Set a reasonable max
        
        // Show consumption form, hide results
        consumptionForm.classList.remove('hidden');
        waitingForResults.classList.add('hidden');
        roundResults.classList.add('hidden');
        
        // Start timer if applicable
        if (data.timeLimit > 0) {
            roundTimerContainer.classList.remove('hidden');
            playerRoundTimer.textContent = data.timeLimit;
            startTimer(data.timeLimit, playerRoundTimer, facilitatorRoundTimer);
        }
    });
    
    // Handle round start (Facilitator)
    socket.on('server:round_started_facilitator', (data) => {
        console.log('Round started for facilitator:', data);
        
        roundActive = true;
        
        // Update game state and UI
        facilitatorCurrentRound.textContent = data.roundNumber;
        facilitatorInvestment.textContent = data.investment;
        facilitatorSubmissions.textContent = '0';
        
        // Hide next round button, show end round button
        nextRoundBtn.classList.add('hidden');
        endRoundBtn.classList.remove('hidden');
        
        // Hide round results
        facilitatorRoundResults.classList.add('hidden');
        
        // Reset players container
        facilitatorPlayersContainer.innerHTML = '';
        
        // Start timer if applicable
        if (data.timeLimit > 0) {
            facilitatorTimerContainer.classList.remove('hidden');
            facilitatorRoundTimer.textContent = data.timeLimit;
            startTimer(data.timeLimit, playerRoundTimer, facilitatorRoundTimer);
        }
    });
    
    // Handle consumption submission confirmation
    socket.on('server:consumption_submitted', (data) => {
        console.log('Consumption submitted:', data);
        
        // Hide consumption form, show waiting message
        consumptionForm.classList.add('hidden');
        waitingForResults.classList.remove('hidden');
    });
    
    // Handle player submission (Facilitator)
    socket.on('server:player_submitted', (data) => {
        console.log('Player submitted:', data);
        
        // Update submissions count
        facilitatorSubmissions.textContent = data.submissionsReceived;
    });
    
    // Handle round results (Player)
    socket.on('server:round_results', (data) => {
        console.log('Round results for player:', data);
        
        roundActive = false;
        
        // Update results display
        resultConsumption.textContent = formatNumber(data.consumption);
        resultAverageConsumption.textContent = formatNumber(data.averageConsumption);
        resultIncome.textContent = formatNumber(data.income);
        resultTargetConsumption.textContent = formatNumber(data.targetConsumption);
        resultDeviation.textContent = formatNumber(data.deviation);
        resultCumulativeDeviation.textContent = formatNumber(data.cumulativeDeviation);
        
        // Hide waiting message, show results
        waitingForResults.classList.add('hidden');
        roundResults.classList.remove('hidden');
        
        // Hide timer
        roundTimerContainer.classList.add('hidden');
        clearInterval(timerInterval);
    });
    
    // Handle round results (Facilitator)
    socket.on('server:round_results_facilitator', (data) => {
        console.log('Round results for facilitator:', data);
        
        roundActive = false;
        
        // Update results display
        facilitatorResultRound.textContent = data.roundNumber;
        facilitatorAverageConsumption.textContent = formatNumber(data.averageConsumption);
        facilitatorIncome.textContent = formatNumber(data.income);
        
        // Show round results
        facilitatorRoundResults.classList.remove('hidden');
        
        // Update players container
        facilitatorPlayersContainer.innerHTML = '';
        data.playerResults.forEach(player => {
            if (player.isConnected) {
                facilitatorPlayersContainer.appendChild(createPlayerCard(player));
            }
        });
        
        // Hide end round button, show next round button
        endRoundBtn.classList.add('hidden');
        nextRoundBtn.classList.remove('hidden');
        
        // Update next round button text
        const nextRoundNumber = data.roundNumber + 1;
        nextRoundBtn.textContent = 
            nextRoundNumber <= gameDetails.totalRounds
                ? `Start Round ${nextRoundNumber}`
                : 'End Game';
        
        // Hide timer
        facilitatorTimerContainer.classList.add('hidden');
        clearInterval(timerInterval);
    });
    
    // Handle player leave (Facilitator)
    socket.on('server:player_left', (data) => {
        console.log('Player left:', data);
        
        // Update player count
        lobbyPlayerCount.textContent = data.playerCount;
        facilitatorPlayerCount.textContent = data.playerCount;
        facilitatorPlayerCount2.textContent = data.playerCount;
    });
    
    // Handle facilitator left (Player)
    socket.on('server:facilitator_left', () => {
        alert('The instructor has left the game. Please refresh the page to join a new game.');
    });
    
    // Handle game ended
    socket.on('server:game_ended', (data) => {
        console.log('Game ended:', data);
        
        const { finalResults } = data;
        
        if (isPlayer) {
            // Find player in results
            const myResult = finalResults.playerResults.find(p => p.nickname === playerInfo.nickname);
            
            if (myResult) {
                // Update final results
                finalCumulativeDeviation.textContent = formatNumber(myResult.cumulativeDeviation);
                finalRank.textContent = myResult.rank;
                finalPlayerCount.textContent = finalResults.playerResults.length;
                
                // Populate results table
                playerResultsTableBody.innerHTML = '';
                
                for (let i = 0; i < myResult.consumptionHistory.length; i++) {
                    const row = document.createElement('tr');
                    
                    const investmentValue = i < 5 ? 100 : 200; // As per spec
                    
                    row.innerHTML = `
                        <td>${i + 1}</td>
                        <td>${investmentValue}</td>
                        <td>${formatNumber(myResult.consumptionHistory[i])}</td>
                        <td>${formatNumber(myResult.incomeHistory[i])}</td>
                        <td>${formatNumber(myResult.targetConsumptionHistory[i])}</td>
                        <td>${formatNumber(myResult.deviationHistory[i])}</td>
                    `;
                    
                    playerResultsTableBody.appendChild(row);
                }
                
                // Show player final results
                playerFinalResults.classList.remove('hidden');
                facilitatorFinalResults.classList.add('hidden');
            }
        } else if (isFacilitator) {
            // Populate leaderboard
            leaderboardTableBody.innerHTML = '';
            
            finalResults.playerResults.forEach(player => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${player.rank}</td>
                    <td>${player.nickname}</td>
                    <td>${formatNumber(player.cumulativeDeviation)}</td>
                `;
                
                leaderboardTableBody.appendChild(row);
            });
            
            // Populate economy results
            economyResultsTableBody.innerHTML = '';
            
            finalResults.roundData.forEach(round => {
                const row = document.createElement('tr');
                
                row.innerHTML = `
                    <td>${round.roundNumber}</td>
                    <td>${round.investment}</td>
                    <td>${formatNumber(round.averageConsumption)}</td>
                    <td>${formatNumber(round.income)}</td>
                `;
                
                economyResultsTableBody.appendChild(row);
            });
            
            // Show facilitator final results
            playerFinalResults.classList.add('hidden');
            facilitatorFinalResults.classList.remove('hidden');
        }
        
        // Show game over screen
        showScreen(gameOverScreen);
    });
    
    // Form Submissions
    
    // Join Game Form
    joinGameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const gameId = gameIdInput.value.trim().toUpperCase();
        const nickname = playerNameInput.value.trim();
        
        if (!gameId || !nickname) {
            alert('Please enter both game code and your name');
            return;
        }
        
        // Send join request to server
        socket.emit('player:join_game', {
            gameId,
            nickname
        });
    });
    
    // Create Game Form
    createGameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const facilitatorName = facilitatorNameInput.value.trim();
        const totalRounds = parseInt(roundsInput.value);
        const mpc = parseFloat(mpcInput.value);
        const timeLimit = parseInt(timeLimitInput.value);
        
        if (!facilitatorName) {
            alert('Please enter your name');
            return;
        }
        
        // Send create game request to server
        socket.emit('facilitator:create_game', {
            facilitatorName,
            totalRounds,
            mpc,
            timeLimit
        });
    });
    
    // Game Actions
    
    // Start Game Button (Facilitator)
    startGameBtn.addEventListener('click', () => {
        if (gameId) {
            socket.emit('facilitator:start_game', { gameId });
        }
    });
    
    // Next Round Button (Facilitator)
    nextRoundBtn.addEventListener('click', () => {
        if (gameId) {
            // Check if this is the last round
            const currentRound = parseInt(facilitatorCurrentRound.textContent);
            const totalRounds = parseInt(facilitatorTotalRounds.textContent);
            
            if (currentRound >= totalRounds) {
                // End the game
                socket.emit('facilitator:end_game', { gameId });
            } else {
                // Start next round
                socket.emit('facilitator:next_round', { gameId });
            }
        }
    });
    
    // End Round Button (Facilitator)
    endRoundBtn.addEventListener('click', () => {
        if (gameId && roundActive) {
            socket.emit('facilitator:end_round', { gameId });
        }
    });
    
    // End Game Button (Facilitator)
    endGameBtn.addEventListener('click', () => {
        if (gameId && confirm('Are you sure you want to end the game?')) {
            socket.emit('facilitator:end_game', { gameId });
        }
    });
    
    // Submit Consumption Button (Player)
    submitConsumptionBtn.addEventListener('click', () => {
        if (gameId && playerId && roundActive) {
            const consumption = parseFloat(consumptionAmount.value);
            
            if (isNaN(consumption) || consumption < 0) {
                alert('Please enter a valid consumption amount');
                return;
            }
            
            socket.emit('player:submit_consumption', {
                gameId,
                playerId,
                consumption
            });
        }
    });
    
    // Play Again Button
    playAgainBtn.addEventListener('click', () => {
        // Reset game state
        gameId = '';
        playerId = '';
        isPlayer = false;
        isFacilitator = false;
        playerInfo = {};
        gameDetails = {};
        roundActive = false;
        
        // Clear form inputs
        gameIdInput.value = urlGameId || '';
        playerNameInput.value = '';
        facilitatorNameInput.value = '';
        
        // Show home screen
        showScreen(homeScreen);
    });
    
    // Copy Link Button
    copyLinkBtn.addEventListener('click', () => {
        lobbyJoinLink.select();
        document.execCommand('copy');
        alert('Link copied to clipboard!');
    });
    
    // Tutorial Buttons
    playerTutorialBtn.addEventListener('click', () => {
        showModal(studentTutorialModal);
    });
    
    facilitatorTutorialBtn.addEventListener('click', () => {
        showModal(instructorTutorialModal);
    });
    
    closeStudentTutorial.addEventListener('click', () => {
        hideModal(studentTutorialModal);
    });
    
    closeInstructorTutorial.addEventListener('click', () => {
        hideModal(instructorTutorialModal);
    });
    
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            hideModal(modal);
        });
    });
});