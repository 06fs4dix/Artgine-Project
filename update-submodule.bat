@echo off
cd /d "%~dp0"

git submodule sync --recursive
git submodule foreach --recursive "git reset --hard && git clean -fdx"
git submodule update --init --remote --recursive --force

pause