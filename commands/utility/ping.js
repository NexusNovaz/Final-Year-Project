const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		return interaction.reply({ content: 'Pong! Check out [my website](https://httpd.tylerstaples.uk)', ephemeral: true });
	},
};