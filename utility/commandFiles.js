const fs = require("fs");
const path = require("path");

function getCommands() {
  const foldersPath = path.join(__dirname, "../commands");
  const commandFolders = fs.readdirSync(foldersPath);

  const commands = [];

  for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ("info" in command) {
        commands.push(command.info);
      } else {
        console.log(
          `[WARNING commandFiles.js] The command at ${filePath} is missing a required "info" property.`
        );
      }
    }
  }

  return commands;
}

function getCommandInfo(command) {
  const commands = getCommands();
  const commandInfo = commands.find((cmd) => cmd.name === command);
  return commandInfo;
}

module.exports = { getCommands, getCommandInfo };
