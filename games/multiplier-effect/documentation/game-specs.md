# Multiplayer Multiplier Process Game - Technical Specification

**Version:** 1.0
**Date:** May 15, 2025
**Project Goal:** To develop a web-based multiplayer game simulating the economic multiplier process, allowing students to experience the interdependence of consumption decisions and their impact on aggregate income.

## 1. Introduction & Overview

This document outlines the specifications for building a multiplayer online version of "The Multiplier Process Game." The game is based on an economic experiment detailed in "The multiplier process – Experiencing Economics.pdf" (CORE Econ). Students, acting as households, will make consumption decisions over several rounds. Their collective decisions, along with a predetermined level of investment, will determine the income for each household in the economy. The game aims to provide an interactive learning experience about macroeconomic concepts like the multiplier effect, aggregate demand, and the circular flow of income.

The existing single-player HTML version (`multiplier_game_v1`) serves as a visual and functional baseline for the user interface and core single-player logic. This specification focuses on adapting it for a true multiplayer experience.

## 2. Core Game Mechanics (Multiplayer)

### 2.1. Roles

- **Player (Household):** Represents a household in the economy. Makes consumption decisions.
- **Facilitator (Admin/Instructor):** Sets up the game, starts/ends rounds, monitors progress, and can view aggregate results.

### 2.2. Game Setup (Facilitator Controlled)

- **Game Lobby:** Facilitator creates a game session, which generates a unique join code/link for players.
- **Number of Players:** The system should support a configurable number of players (e.g., 3 to 50+).
- **Number of Rounds:** Default to 10 rounds (as per the experiment). Potentially configurable by the facilitator.
- **Marginal Propensity to Consume (MPC):** Default to 0.8 (80%). Potentially configurable.
- **Investment Schedule:**
  - Rounds 1-5: Investment = 100 per household.
  - Rounds 6-10: Investment = 200 per household.
  - This schedule should be fixed as per the experiment but the system could allow for future configurability.
- **Player Naming:** Players should be able to enter a nickname upon joining.

### 2.3. Game Flow (Per Round)

1.  **Start Round (Facilitator):** The facilitator initiates each round.
2.  **Information Display (Player):**
    - Current Round number.
    - Current level of Investment for the economy.
    - Guidance: Their _own_ income from the _previous_ round.
    - Guidance: A suggested consumption target based on their _own_ previous round's income (e.g., `MPC * Previous_Own_Income`).
3.  **Consumption Decision (Player):**
    - Each player submits their individual consumption decision for the current round within a time limit (e.g., 60 seconds, configurable by facilitator).
    - If a player fails to submit, their consumption for that round could be set to a default (e.g., 0, or their previous round's consumption, or an average). This needs a defined rule.
4.  **Data Aggregation (Server):**
    - Once all players have submitted or the time limit expires, the server collects all individual consumption decisions.
    - The server calculates the **Average Consumption** for the round: `Average_Consumption = (Sum of all players' consumption) / (Number of players)`.
5.  **Income Calculation (Server):**
    - The server calculates the **Income** for _each player_ for the current round:
      `Player_Income_Current_Round = Average_Consumption + Current_Investment`.
      _(Note: In the multiplayer version, every player receives the same income, which is based on the average consumption of the group and the fixed investment.)_
6.  **Target & Deviation Calculation (Server):**
    - For each player, the server calculates:
      - `Target_Consumption = MPC * Player_Income_Current_Round`
      - `Deviation = ABS(Player_Submitted_Consumption - Target_Consumption)`
      - `Cumulative_Deviation = Previous_Cumulative_Deviation + Deviation`
7.  **Results Display (Player):**
    - After server calculations, each player's screen updates to show:
      - Their submitted consumption.
      - Their actual income for the round.
      - Their target consumption for the round.
      - Their deviation for the round.
      - Their cumulative deviation so far.
    - Optional: Display average consumption for the round to all players.
8.  **Facilitator View:** The facilitator sees an overview of the round: average consumption, distribution of consumption choices (optional), and perhaps a list of players who haven't submitted.
9.  **Next Round:** The facilitator initiates the next round, or the game ends if all rounds are complete.

### 2.4. End of Game

- After the final round, the game ends.
- **Player View:** Shows a final summary table of their performance across all rounds (similar to the single-player version) and their final cumulative deviation.
- **Facilitator View:** Shows aggregate results, potentially including:
  - Average cumulative deviation for the group.
  - A leaderboard of players ranked by their total deviation (lowest is best).
  - Graphs showing the evolution of average consumption and average income over rounds.
- **Winning Condition:** The player with the smallest total cumulative deviation over all rounds is the "winner" or "most accurate household."

## 3. User Interface (UI) & User Experience (UX)

The UI should be clean, intuitive, and responsive, adapting well to desktop and mobile devices. Styling should take inspiration from the provided `group.jpg` (modern, collaborative, with blues and greens) and the existing single-player HTML game. Tailwind CSS is preferred for styling.

### 3.1. Facilitator Interface

- **Dashboard/Lobby Creation:**
  - Button to "Create New Game."
  - Input fields for game parameters (if configurable, otherwise display defaults).
  - Display unique Game ID/Join Link to share with players.
  - List of connected players in the lobby.
  - "Start Game" button (enabled when a minimum number of players, e.g., 1 or 3, have joined).
- **In-Game View:**
  - Display current round number and investment level.
  - "Start Next Round" / "End Round" button.
  - "End Game" button.
  - Real-time count of players who have submitted their consumption for the current round.
  - View of aggregate statistics (e.g., average consumption, income for the current round).
  - (Optional) Ability to manually advance round if players are taking too long.
- **Post-Game View:**
  - Summary statistics for the entire game.
  - Leaderboard.
  - Option to export results (e.g., as CSV).

### 3.2. Player Interface

- **Join Game Screen:**
  - Input field for Game ID.
  - Input field for Player Nickname.
  - "Join Game" button.
- **Lobby/Waiting Screen:**
  - Message: "Waiting for facilitator to start the game..."
  - Display number of players currently in the lobby.
- **Instructions Modal:**
  - Accessible via a button. Content similar to the single-player version, but updated for multiplayer mechanics (especially how income is determined by _average_ consumption).
- **Game Interface (During a Round):**
  - Clear display of: Current Round, Current Investment.
  - Guidance: "Last Round's Income: [value]", "Aim for Consumption around: [value]".
  - Input field for consumption (`type="number"`, min="0").
  - "Submit Consumption" button.
  - Timer counting down (if implemented).
- **Round Result Display:**
  - Modal or section showing: Your Consumption, Actual Income, Target Consumption, Deviation, Cumulative Deviation.
  - Message: "Waiting for next round..." or similar.
- **End Game Summary:**
  - Display final cumulative deviation.
  - Table summarizing their performance for each round (Round, Investment, Your Consumption, Income, Target Consumption, Deviation).
  - (Optional) Rank/Position on the leaderboard.
  - "Play Again" or "Exit" option (Play Again might take them back to join screen).

## 4. Technical Requirements

### 4.1. Frontend

- **Framework/Libraries:** HTML5, CSS3, JavaScript (ES6+).
- **Styling:** Tailwind CSS (ensure consistency with the single-player prototype).
- **Real-time Communication:** Client-side library for WebSockets (e.g., Socket.IO client, or native WebSocket API).
- **Responsiveness:** Must be usable on various screen sizes (desktop, tablet, mobile).

### 4.2. Backend

- **Language/Framework (Suggestions):**
  - Node.js with Express.js (integrates well with Socket.IO).
  - Python with Flask or Django (using Channels for WebSockets with Django, or Flask-SocketIO).
  - Other suitable backend frameworks capable of handling WebSockets.
- **Real-time Communication:** WebSocket server (e.g., Socket.IO, or a library compatible with the chosen framework).
  - **Key WebSocket Events:**
    - `player:join_game` (data: { gameId, nickname })
    - `facilitator:create_game`
    - `facilitator:start_game` (data: { gameId })
    - `facilitator:next_round` (data: { gameId })
    - `player:submit_consumption` (data: { gameId, playerId, consumptionValue })
    - `server:game_created` (to facilitator: { gameId, joinLink })
    - `server:player_joined` (to facilitator & other players in lobby: { nickname, playerCount })
    - `server:game_started` (to all in game: { initialGameState })
    - `server:round_started` (to all in game: { roundNumber, investment, previousPlayerIncome })
    - `server:round_results` (to individual player: { yourConsumption, income, target, deviation, cumulativeDeviation })
    - `server:all_round_results_for_facilitator` (to facilitator: { list of player results, averages })
    - `server:game_ended` (to all: { finalSummary, leaderboard })
    - `server:error` (e.g., game not found, invalid input)
- **State Management:**
  - Manage game state for multiple concurrent games (e.g., in-memory objects, or a database for more persistence).
  - Each game session needs to store: game ID, facilitator ID, list of players (ID, nickname, socket ID, consumption history, deviation history), current round, current investment, game parameters.
- **No Database Requirement (for MVP):** For a basic version, a persistent database is not strictly necessary if game data is managed in memory for the duration of an active game. However, for features like saving game configurations, user accounts, or long-term result storage, a database (e.g., PostgreSQL, MongoDB) would be needed.

### 4.3. Deployment

- The application should be deployable on a cloud platform like DigitalOcean (e.g., App Platform for both frontend and backend, or Droplets).
- Clear deployment instructions and scripts should be provided.

## 5. Non-Functional Requirements

- **Usability:** The game should be easy to understand and play for non-technical users (students).
- **Scalability:** The backend should be designed to handle a reasonable number of concurrent game sessions and players per session (e.g., 5-10 active games with up to 30 players each).
- **Reliability:** Stable connections and consistent game state.
- **Security:** Basic input validation. If user accounts were added, proper authentication/authorization would be needed.

## 6. Deliverables

- Fully functional multiplayer game application as per this specification.
- Well-commented source code for frontend and backend.
- Detailed build and deployment instructions.
- (Optional) API documentation if backend APIs are designed to be consumed by other clients.

## 7. Future Considerations / Optional Features

- **Advanced Facilitator Controls:** Pause/resume game, manually edit player consumption, kick players.
- **More Game Parameters:** Configurable MPC, investment schedules, number of rounds.
- **Different Game Modes:** E.g., introducing taxes or net exports as in "The Economy 1.0" Section 14.5.
- **Visualizations:** Charts showing the evolution of economic variables over rounds (e.g., using Chart.js or D3.js).
- **Player Authentication:** User accounts for facilitators to save game configurations or track history.
- **Chat Functionality:** In-game chat for players or between players and facilitator.
- **Localization:** Support for multiple languages.

This specification should provide a solid foundation for the development of the multiplayer Multiplier Process Game.
