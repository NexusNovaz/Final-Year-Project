const { Events, InteractionType } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}
	
			try {
				await command.execute(interaction);
			} catch (error) {
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({content: `Something went wrong executing this command... ${error}`, ephemeral: true});
				} else {
					await interaction.reply({content: `Something went wrong executing this command... ${error}`, ephemeral: true});
				}
				console.error(`Error executing ${interaction.commandName}`);
				console.error(error);
			}
		} else if (interaction.type == InteractionType.ApplicationCommandAutocomplete) {
			const { commands } = interaction.client;
			const { commandName } = interaction
			const command = commands.get(commandName)

			if (!command) return;

			try {
				await command.autocomplete(interaction, interaction.client);
			} catch (error) {
				console.error(error);
			}
		}

	},
};