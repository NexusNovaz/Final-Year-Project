const {
  Client,
  SlashCommandBuilder,
  EmbedBuilder,
  Collection,
  GatewayIntentBits,
  Routes,
  REST,
} = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const {
  getCommandInfo,
  getCommands,
} = require("../../utility/commandFiles.js");
const { clientId, guildId, token } = require("../../config.json");
// Create a command to list all commands if only /help is provided, otherwise, list the help for the specific command
// Add a string option with auto generated choices of all commands

const rest = new REST().setToken(token);

const commands = getCommands();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get help on a command")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("The command you want help with")
        .setRequired(false)
    ),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    try {
      if (interaction.options.getString("command")) {
        const command = interaction.options.getString("command");
        if (!commands) {
          interaction.editReply(
            "That command does not exist, please try again"
          );
          console.log(`command (${command}) not found`);
        } else {
          const commandInfo = getCommandInfo(command);
          const embed = new EmbedBuilder()
            .setTitle(`Help - ${commandInfo.name}`)
            .setDescription("Information on the command")
            .addFields(
              {name: "Name", value: commandInfo.name},
              {name: "Description", value: commandInfo.description},
              {name: "Usage", value: commandInfo.usage}
            )
            .setColor(0x00ff00)
            .setTimestamp(Date.now())
            .setFooter({text: "Revision Bot"});
          interaction.editReply({ embeds: [embed] });
        }
      } else {
        const embed = new EmbedBuilder()
          .setTitle("Help")
          .setDescription("List of commands")
          .setColor(0x00ff00)
          .setTimestamp(Date.now())
          .setFooter({ text: "Revision Bot" });
        commands.forEach((command) => {
          embed.addFields({ name: command.name, value: command.description });
        });
        embed.addFields({ name: "More Info", value: "Use `/help <command>` to get more info on a command" });
        interaction.editReply({ embeds: [embed] });
      }
    } catch (err) {
      console.error(`[ERROR] (help.js) ${err}`);
      interaction.editReply(
        "There was an error performing this command, please contact `Nexus Novaz#0862`"
      );
      return -1;
    }
  },
  info: {
    name: "help",
    description: "Get help on a command or list all commands",
    usage: "/help <command>",
  },
};
