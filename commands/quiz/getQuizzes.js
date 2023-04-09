const { SlashCommandBuilder, EmbedBuilder, Client} = require('discord.js');
const mongoose = require('../../database/index.js');
const CardPack = require('../../database/models/CardPack.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_quizzes')
        .setDescription('Get the a list of quizzes'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        try {
            const quizzes = await CardPack.find({}, { discordId: 1, nameOfPack: 1, googleSheetsId: 1, _id: 0 });
            const client = new Client();
            const foundQuizzesEmbed = new EmbedBuilder()
            .setColor(0x14cf03)
            .setTitle("List of Quizzes")
            .setDescription("Heres a list of quizzes I was able to find:");
            for (const quiz of quizzes) {
                foundQuizzesEmbed.addFields(
                    { name: `${quiz.nameOfPack} by ${(await client.users.fetch(quiz.discordId)).tag}`, value: `${quiz.googleSheetsId}`, inline: false }
                );
            }
            await interaction.editReply({ embeds: [foundQuizzesEmbed] });

        } catch (err) {
            console.error(`[ERROR] (getQuizzes.js) ${err}`);
            interaction.editReply('There was an error performing this command, please contact `Nexus Novaz#0862`');
            return -1;
        }
    }
}