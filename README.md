# easyopenframeworks README

## Developing

- Open the folder with VSCode (`code easyopenframeworks`).
- Make adjustments as needed.
- Test the extension by running (`Debug: Start Debugging`) from the command palette.
- Run `Install OpenFrameworks` or other commands from the command palette in the new VSCode debug window.

## Commands

- `easyopenframeworks.installOF`: Installs OpenFrameworks in the selected folder along with additional dependencies. Clones the PG repo into the appropriate location int he folder. *Will throw an error if the path contains spaces.*

## Features

So far:
- Allows us to run commands by registering them in extension.js & package.json. 
- Allows us to run system processes from these commands, given they are using node in the bg.
- Draws a sidebar with info about the OF installation.
- Install OF and build project generator commandline tool.

## Issues

- We're going to have to figure out a way to make sure people have xcode installed, and in the correct way.
- Ergo having openFrameworks installed and functioning.

## TODO

X Finish implementing the builder for `commandline`.
- List out current OF projects (or available projects) in a tree view in the sidebar.
- Add buttons for common commands into the sidebary (`install OF`, `build project`, etc).
- Implement a "log" so that build error messages can be viewable and saved for the current session.
- Rewrite openFrameworks in CLASP.