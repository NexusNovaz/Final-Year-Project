const { Events, InteractionType, ActionRowBuilder, ButtonBuilder } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isButton()) {
			console.log(interaction);
		}
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: `Something went wrong executing this command... ${error}`, ephemeral: true });
			} else {
				await interaction.reply({ content: `Something went wrong executing this command... ${error}`, ephemeral: true });
			}
			console.error(`Error executing ${interaction.commandName}`);
			console.error(error);
		}

	},
};