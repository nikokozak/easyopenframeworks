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

## Issues

- We want to use the OF Project Generator, but *not* the `frontend` version, rather the `commandline` version; in order to do this, we have to clone the `PG` repo and build the `commandline` tool. This fails on macOS at the moment. I've already filed an issue in the PG repo.
- We're going to have to figure out a way to make sure people have xcode installed, and in the correct way.

## TODO

- Finish implementing the builder for `commandline`.
- List out current OF projects (or available projects) in a tree view in the sidebar.
- Add buttons for common commands into the sidebary (`install OF`, `build project`, etc).
- Implement a "log" so that build error messages can be viewable and saved for the current session.