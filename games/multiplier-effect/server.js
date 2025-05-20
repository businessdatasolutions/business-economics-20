const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Initialize app and server
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Game sessions storage
const gameSessions = {};

// Game params
const DEFAULT_ROUND_COUNT = 10;
const DEFAULT_MPC = 0.8; // Marginal Propensity to Consume
const DEFAULT_TIME_LIMIT = 60; // seconds

// Socket connection handling
io.on('connection', (socket) => {
  console.log('New connection:', socket.id);
  
  // FACILITATOR: Create a new game session
  socket.on('facilitator:create_game', (data) => {
    const gameId = uuidv4().substring(0, 6).toUpperCase(); // Shorter, easier to share
    const facilitatorName = data?.facilitatorName || 'Facilitator';
    
    // Create game session
    gameSessions[gameId] = {
      id: gameId,
      facilitatorId: socket.id,
      facilitatorName,
      players: {},
      playerCount: 0,
      currentRound: 0,
      totalRounds: data?.totalRounds || DEFAULT_ROUND_COUNT,
      mpc: data?.mpc || DEFAULT_MPC,
      timeLimit: data?.timeLimit || DEFAULT_TIME_LIMIT,
      roundActive: false,
      investment: 0, // Will be set per round
      roundData: [],
      submissionsForCurrentRound: 0
    };
    
    // Subscribe facilitator to game room
    socket.join(gameId);
    
    // Send game creation confirmation to facilitator
    socket.emit('server:game_created', {
      gameId,
      joinLink: `${process.env.BASE_URL || 'http://localhost:3000'}?gameId=${gameId}&role=student`,
      gameDetails: gameSessions[gameId]
    });
    
    console.log(`Game created: ${gameId} by facilitator ${socket.id}`);
  });
  
  // PLAYER: Join an existing game
  socket.on('player:join_game', (data) => {
    const { gameId, nickname } = data;
    
    // Check if game exists
    if (!gameSessions[gameId]) {
      socket.emit('server:error', { message: 'Game not found. Please check the game code and try again.' });
      return;
    }
    
    // Check if game is in progress
    if (gameSessions[gameId].currentRound > 0) {
      socket.emit('server:error', { message: 'Game already in progress. Please join a new game.' });
      return;
    }
    
    // Generate player ID
    const playerId = uuidv4();
    
    // Add player to game
    gameSessions[gameId].players[playerId] = {
      id: playerId,
      socketId: socket.id,
      nickname: nickname || `Player ${Object.keys(gameSessions[gameId].players).length + 1}`,
      consumption: [],
      income: [],
      targetConsumption: [],
      deviation: [],
      cumulativeDeviation: 0,
      isConnected: true
    };
    
    gameSessions[gameId].playerCount++;
    
    // Subscribe player to game room
    socket.join(gameId);
    
    // Send confirmation to player
    socket.emit('server:player_joined', {
      gameId,
      playerId,
      playerInfo: gameSessions[gameId].players[playerId],
      facilitatorName: gameSessions[gameId].facilitatorName,
      playerCount: gameSessions[gameId].playerCount
    });
    
    // Notify facilitator and other players
    socket.to(gameId).emit('server:player_joined', {
      nickname: gameSessions[gameId].players[playerId].nickname,
      playerCount: gameSessions[gameId].playerCount
    });
    
    console.log(`Player ${nickname} (${playerId}) joined game: ${gameId}`);
  });
  
  // FACILITATOR: Start the game
  socket.on('facilitator:start_game', (data) => {
    const { gameId } = data;
    
    // Check if game exists and socket is the facilitator
    if (!gameSessions[gameId] || gameSessions[gameId].facilitatorId !== socket.id) {
      socket.emit('server:error', { message: 'Unauthorized or game not found' });
      return;
    }
    
    // Check if there are players
    if (gameSessions[gameId].playerCount === 0) {
      socket.emit('server:error', { message: 'Cannot start game with no players' });
      return;
    }
    
    // Initialize game data
    gameSessions[gameId].currentRound = 0;
    
    // Initialize round data array with empty objects for each round
    gameSessions[gameId].roundData = Array(gameSessions[gameId].totalRounds).fill().map(() => ({
      investment: 0,
      averageConsumption: 0,
      totalConsumption: 0,
      income: 0,
      submissions: 0,
      complete: false
    }));
    
    // Notify all players in the game
    io.to(gameId).emit('server:game_started', {
      gameDetails: {
        facilitatorName: gameSessions[gameId].facilitatorName,
        totalRounds: gameSessions[gameId].totalRounds,
        mpc: gameSessions[gameId].mpc,
        timeLimit: gameSessions[gameId].timeLimit,
        playerCount: gameSessions[gameId].playerCount
      }
    });
    
    console.log(`Game ${gameId} started by facilitator ${socket.id}`);
  });
  
  // FACILITATOR: Start next round
  socket.on('facilitator:next_round', (data) => {
    const { gameId } = data;
    
    // Check if game exists and socket is the facilitator
    if (!gameSessions[gameId] || gameSessions[gameId].facilitatorId !== socket.id) {
      socket.emit('server:error', { message: 'Unauthorized or game not found' });
      return;
    }
    
    const game = gameSessions[gameId];
    const nextRound = game.currentRound + 1;
    
    // Check if we've reached the end of the game
    if (nextRound > game.totalRounds) {
      socket.emit('server:error', { message: 'Game has already completed all rounds' });
      return;
    }
    
    // Set investment based on round number (Rounds 1-5: 100, Rounds 6-10: 200)
    const investmentPerHousehold = nextRound <= 5 ? 100 : 200;
    const investment = investmentPerHousehold;
    
    // Update game state
    game.currentRound = nextRound;
    game.roundActive = true;
    game.investment = investment;
    game.submissionsForCurrentRound = 0;
    game.roundData[nextRound - 1].investment = investment;
    
    // For each player, calculate what to send
    Object.keys(game.players).forEach(playerId => {
      const player = game.players[playerId];
      
      // Only send data for connected players
      if (player.isConnected) {
        // Get previous round's income (if exists)
        const previousIncome = player.income.length > 0 ? player.income[player.income.length - 1] : 0;
        
        // Calculate suggested consumption target
        const suggestedConsumption = previousIncome > 0 ? Math.round(game.mpc * previousIncome) : 0;
        
        // Send round start to player
        io.to(player.socketId).emit('server:round_started', {
          roundNumber: nextRound,
          investment,
          previousIncome,
          suggestedConsumption,
          timeLimit: game.timeLimit
        });
      }
    });
    
    // Also send to facilitator
    socket.emit('server:round_started_facilitator', {
      roundNumber: nextRound,
      investment,
      playerCount: game.playerCount,
      submissionsReceived: 0,
      timeLimit: game.timeLimit
    });
    
    console.log(`Round ${nextRound} started in game ${gameId}`);
    
    // Optional: Set a timeout for the round
    if (game.timeLimit > 0) {
      setTimeout(() => {
        // Check if the round is still active
        if (game.roundActive && game.currentRound === nextRound) {
          endRound(gameId);
        }
      }, game.timeLimit * 1000);
    }
  });
  
  // PLAYER: Submit consumption
  socket.on('player:submit_consumption', (data) => {
    const { gameId, playerId, consumption } = data;
    
    // Validate the consumption value
    const consumptionValue = parseFloat(consumption);
    if (isNaN(consumptionValue) || consumptionValue < 0) {
      socket.emit('server:error', { message: 'Invalid consumption value' });
      return;
    }
    
    // Check if game and player exist
    if (!gameSessions[gameId] || !gameSessions[gameId].players[playerId]) {
      socket.emit('server:error', { message: 'Game or player not found' });
      return;
    }
    
    const game = gameSessions[gameId];
    
    // Check if round is active
    if (!game.roundActive) {
      socket.emit('server:error', { message: 'No active round for submissions' });
      return;
    }
    
    // Check if player already submitted for this round
    const player = game.players[playerId];
    if (player.consumption.length >= game.currentRound) {
      socket.emit('server:error', { message: 'You have already submitted for this round' });
      return;
    }
    
    // Record player's consumption
    player.consumption.push(consumptionValue);
    
    // Update submission count
    game.submissionsForCurrentRound++;
    game.roundData[game.currentRound - 1].submissions = game.submissionsForCurrentRound;
    
    // Add to total consumption for the round
    game.roundData[game.currentRound - 1].totalConsumption += consumptionValue;
    
    // Acknowledge submission
    socket.emit('server:consumption_submitted', {
      roundNumber: game.currentRound,
      consumption: consumptionValue
    });
    
    // Notify facilitator about the submission
    io.to(game.facilitatorId).emit('server:player_submitted', {
      nickname: player.nickname,
      submissionsReceived: game.submissionsForCurrentRound,
      playerCount: game.playerCount
    });
    
    // Check if all players have submitted or time has expired
    if (game.submissionsForCurrentRound >= game.playerCount) {
      // Process end of round
      endRound(gameId);
    }
  });
  
  // FACILITATOR: Force end current round
  socket.on('facilitator:end_round', (data) => {
    const { gameId } = data;
    
    // Check if game exists and socket is the facilitator
    if (!gameSessions[gameId] || gameSessions[gameId].facilitatorId !== socket.id) {
      socket.emit('server:error', { message: 'Unauthorized or game not found' });
      return;
    }
    
    const game = gameSessions[gameId];
    
    // Check if a round is active
    if (!game.roundActive) {
      socket.emit('server:error', { message: 'No active round to end' });
      return;
    }
    
    // End the round
    endRound(gameId);
  });
  
  // FACILITATOR: End game
  socket.on('facilitator:end_game', (data) => {
    const { gameId } = data;
    
    // Check if game exists and socket is the facilitator
    if (!gameSessions[gameId] || gameSessions[gameId].facilitatorId !== socket.id) {
      socket.emit('server:error', { message: 'Unauthorized or game not found' });
      return;
    }
    
    const game = gameSessions[gameId];
    
    // Calculate final results
    const finalResults = calculateFinalResults(gameId);
    
    // Send game ended notification to all players
    io.to(gameId).emit('server:game_ended', {
      finalResults
    });
    
    // Optional: clean up the game after some time
    setTimeout(() => {
      delete gameSessions[gameId];
      console.log(`Game ${gameId} cleaned up`);
    }, 3600000); // Clean up after 1 hour
    
    console.log(`Game ${gameId} ended by facilitator ${socket.id}`);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Check if disconnected client is a facilitator of any game
    for (const gameId in gameSessions) {
      if (gameSessions[gameId].facilitatorId === socket.id) {
        // Optional: Notify all players that the facilitator has left
        io.to(gameId).emit('server:facilitator_left');
        
        // Optional: keep the game or clean it up
        // Here we'll keep it for reconnection possibility
        console.log(`Facilitator ${socket.id} disconnected from game ${gameId}`);
      }
      
      // Check if disconnected client is a player in this game
      for (const playerId in gameSessions[gameId].players) {
        if (gameSessions[gameId].players[playerId].socketId === socket.id) {
          gameSessions[gameId].players[playerId].isConnected = false;
          gameSessions[gameId].playerCount--;
          
          // Notify facilitator
          io.to(gameSessions[gameId].facilitatorId).emit('server:player_left', {
            nickname: gameSessions[gameId].players[playerId].nickname,
            playerCount: gameSessions[gameId].playerCount
          });
          
          console.log(`Player ${playerId} disconnected from game ${gameId}`);
        }
      }
    }
  });
});

// Helper function to end a round and calculate results
function endRound(gameId) {
  const game = gameSessions[gameId];
  
  // Mark round as inactive
  game.roundActive = false;
  
  // Calculate average consumption
  const roundIndex = game.currentRound - 1;
  const totalPlayers = Object.keys(game.players).filter(id => game.players[id].isConnected).length;
  
  // Get total consumption for the round
  const totalConsumption = game.roundData[roundIndex].totalConsumption;
  
  // Calculate average (if no submissions, default to 0)
  const averageConsumption = totalPlayers > 0 ? totalConsumption / totalPlayers : 0;
  
  // Calculate income for this round (same for all players)
  const income = averageConsumption + game.investment;
  
  // Update round data
  game.roundData[roundIndex].averageConsumption = averageConsumption;
  game.roundData[roundIndex].income = income;
  game.roundData[roundIndex].complete = true;
  
  // Calculate and update results for each player
  Object.keys(game.players).forEach(playerId => {
    const player = game.players[playerId];
    
    // Skip disconnected players
    if (!player.isConnected) return;
    
    // Handle players who didn't submit
    if (player.consumption.length < game.currentRound) {
      // Default behavior: set consumption to 0
      player.consumption.push(0);
    }
    
    // Get player's consumption for this round
    const playerConsumption = player.consumption[game.currentRound - 1];
    
    // Add income for this round
    player.income.push(income);
    
    // Calculate target consumption (MPC * income)
    const targetConsumption = game.mpc * income;
    player.targetConsumption.push(targetConsumption);
    
    // Calculate deviation
    const deviation = Math.abs(playerConsumption - targetConsumption);
    player.deviation.push(deviation);
    
    // Update cumulative deviation
    player.cumulativeDeviation += deviation;
    
    // Send round results to player
    if (player.isConnected) {
      io.to(player.socketId).emit('server:round_results', {
        roundNumber: game.currentRound,
        consumption: playerConsumption,
        income,
        averageConsumption,
        investment: game.investment,
        targetConsumption,
        deviation,
        cumulativeDeviation: player.cumulativeDeviation
      });
    }
  });
  
  // Send aggregate results to facilitator
  io.to(game.facilitatorId).emit('server:round_results_facilitator', {
    roundNumber: game.currentRound,
    averageConsumption,
    income,
    investment: game.investment,
    playerResults: Object.keys(game.players).map(id => ({
      nickname: game.players[id].nickname,
      consumption: game.players[id].consumption[game.currentRound - 1] || 0,
      deviation: game.players[id].deviation[game.currentRound - 1] || 0,
      cumulativeDeviation: game.players[id].cumulativeDeviation,
      isConnected: game.players[id].isConnected
    }))
  });
  
  console.log(`Round ${game.currentRound} ended in game ${gameId}`);
}

// Calculate final results and rankings
function calculateFinalResults(gameId) {
  const game = gameSessions[gameId];
  
  // Collect player results
  const playerResults = [];
  Object.keys(game.players).forEach(playerId => {
    const player = game.players[playerId];
    
    // Skip players who never connected or submitted
    if (player.consumption.length === 0) return;
    
    playerResults.push({
      nickname: player.nickname,
      consumptionHistory: player.consumption,
      incomeHistory: player.income,
      targetConsumptionHistory: player.targetConsumption,
      deviationHistory: player.deviation,
      cumulativeDeviation: player.cumulativeDeviation,
      isConnected: player.isConnected
    });
  });
  
  // Sort by cumulative deviation (lowest to highest)
  playerResults.sort((a, b) => a.cumulativeDeviation - b.cumulativeDeviation);
  
  // Add rank
  playerResults.forEach((player, index) => {
    player.rank = index + 1;
  });
  
  // Collect round data
  const roundData = game.roundData.filter(round => round.complete).map((round, index) => ({
    roundNumber: index + 1,
    investment: round.investment,
    averageConsumption: round.averageConsumption,
    income: round.income
  }));
  
  return {
    playerResults,
    roundData,
    gameDetails: {
      totalRounds: game.currentRound,
      mpc: game.mpc,
      facilitatorName: game.facilitatorName
    }
  };
}

// Start server
const PORT = process.env.PORT || 54321;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});