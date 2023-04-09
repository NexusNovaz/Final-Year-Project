const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mongoose = require('../../database/index.js');
const CardPack = require('../../database/models/CardPack.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('get_questions')
        .setDescription('Get the questions of a spreadsheet')
        .addStringOption(option =>
            option
                .setName('spreadsheet_id')
                .setDescription('The id of the spreadsheet you want to get the questions from')
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            await interaction.deferReply({ ephemeral: true });

            const matchingPack = await CardPack.find({googleSheetsId: interaction.options.getString('spreadsheet_id')});

            const questionPackEmbed = new EmbedBuilder()
                .setTitle(`Questions for ${matchingPack.nameOfPack}`)

            await interaction.editReply(`I have found these results: ${matchingCards.map()}`)
        } catch (err) {
            console.error(`[ERROR] ${err}`);
            return -1;
        }
    }
}