# The Multiplier Effect - Economic Experiment

A multiplayer web application designed to demonstrate the economic multiplier effect for business management students. This interactive experiment allows students to experience how individual consumption decisions affect the overall economy.

## Overview

Based on the CORE Econ teaching module "The multiplier process," this application simulates how spending in an economy creates a cascade of additional economic activity through the multiplier effect. It supports up to 50 students participating simultaneously in a facilitator-led experiment.

## Features

- Real-time multiplayer interaction using Socket.io
- Separate interfaces for instructors (facilitators) and students (participants)
- Configurable number of rounds, marginal propensity to consume, and time limits
- Two-phase investment schedule (changes halfway through the game)
- Round-based gameplay with guided decision-making
- Real-time feedback and results tracking
- Leaderboard and detailed performance statistics
- Mobile-responsive design
- Interactive tutorials for both instructors and students

## Game Mechanics

### Core Concept
- Students act as households making consumption decisions
- Each round, students decide how much to consume (spend)
- Income = Average Consumption + Current Investment
- The target consumption = MPC × Income (where MPC is Marginal Propensity to Consume)
- The goal is for students to match their consumption with the target
- The player with the lowest cumulative deviation wins

### Game Flow

1. **Setup:** Instructor creates a game and shares a code with students
2. **Joining:** Students join using the provided code
3. **Rounds:** The game proceeds through multiple rounds (default: 10)
   - Rounds 1-5: Investment = 100 per household
   - Rounds 6-10: Investment = 200 per household
4. **Each Round:**
   - Students see their previous income and a suggested consumption target
   - Students submit their consumption decisions
   - After all submissions, income is calculated based on average consumption
   - Results show each player's deviation from their optimal target
5. **Game End:** Final scores and rankings are displayed

## Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```
   
   Or specify a custom port:
   ```
   PORT=5000 npm start
   ```
   
4. For development (with auto-reload):
   ```
   npm run dev
   ```
   
   Or specify a custom port:
   ```
   PORT=5000 npm run dev
   ```

5. Access the application at http://localhost:3000 (or your specified port)

## Deployment to Digital Ocean

### Prerequisites
- A Digital Ocean account
- Basic knowledge of server administration

### Deployment Options

#### Option 1: Deploy as a Droplet

1. Create a new Droplet on Digital Ocean (Basic Plan is sufficient)
2. Choose Ubuntu as the operating system
3. SSH into your server:
   ```
   ssh root@your_server_ip
   ```
4. Install Node.js:
   ```
   curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
   apt install -y nodejs
   ```
5. Clone the repository and install dependencies:
   ```
   git clone https://github.com/yourusername/multiplier-effect.git
   cd multiplier-effect
   npm install
   ```
6. Use PM2 to run the server as a background service:
   ```
   npm install pm2 -g
   pm2 start server.js
   pm2 startup
   pm2 save
   ```

#### Option 2: Deploy with Docker

1. Create a new Droplet with Docker installed
2. Clone the repository and navigate to it:
   ```
   git clone https://github.com/yourusername/multiplier-effect.git
   cd multiplier-effect
   ```
3. Build and run with Docker Compose:
   ```
   docker-compose up -d
   ```

#### Option 3: Use Digital Ocean App Platform

1. Connect your GitHub repository to Digital Ocean App Platform
2. Create a new app from the repository
3. Configure as a Node.js app
4. Deploy

## Usage Instructions

### For Instructors (Facilitators)

1. Create a new game by entering your name and configuring game parameters
2. Share the generated game code with your students
3. Wait for students to join the lobby
4. Start the game when ready
5. For each round:
   - Start the round
   - Monitor student submissions
   - End the round (manually or wait for timer)
   - Review the results with students
6. After all rounds, review the final results and leaderboard
7. Facilitate a discussion about the observed economic patterns

### For Students (Participants)

1. Join using the code provided by your instructor
2. Wait for the instructor to start the game
3. For each round:
   - Note your previous income and suggested consumption target
   - Enter your consumption decision
   - Submit before the time limit expires
   - Review the round results
4. At the end of the game, review your performance and ranking

## Learning Objectives

This experiment helps students understand:

1. The multiplier effect in economics
2. How individual decisions affect aggregate outcomes
3. The circular flow of income in an economy
4. The impact of investment changes on economic activity
5. Strategic decision-making in an interconnected economy

## License

This project is licensed under the MIT License.