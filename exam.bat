@echo off
cd backend
node convert-2-json.js
cd ..
cd frontend
start cmd /c python server.py