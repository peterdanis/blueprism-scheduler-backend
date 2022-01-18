@echo off

echo.
echo Important!
echo.
echo If you did not customize the .env file yet please close this window and do so.
echo.
echo.
echo.

PAUSE

Blue_Prism_scheduler_installer.exe install
Blue_Prism_scheduler_installer.exe start
Blue_Prism_scheduler_installer.exe status

PAUSE