const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	info: {
		name: 'ping',
		description: 'Replies with Pong!',
		usage: '/ping',
	},
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction) {
		return interaction.reply({ content: 'Pong! Check out [my website](https://httpd.tylerstaples.uk)', ephemeral: true });
	},
};