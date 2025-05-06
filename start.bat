@echo off
title Lightning Bot - CodeJS V1.0
color 0A

:start
echo ============================================
echo           Lightning Bot - CodeJS
echo ============================================
echo.
echo Starting the bot...
echo.
node index.js
echo.
echo Bot stopped! Restarting in 5 seconds...
timeout /t 5 /nobreak > nul
goto start
