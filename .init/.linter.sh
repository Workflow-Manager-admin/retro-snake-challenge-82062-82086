#!/bin/bash
cd /home/kavia/workspace/code-generation/retro-snake-challenge-82062-82086/snake_game_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

