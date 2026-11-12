@echo off
echo Starting Mantaro Frost Alert Backend (.NET 8 Clean Architecture)...
cd /d "%~dp0backend\MantaroFrostAlert.API"
dotnet run --launch-profile http
pause
