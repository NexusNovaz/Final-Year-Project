const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const CardPack = require('../../database/models/CardPack.js');
const {getQuizQuestions} = require('../../utility/spreadsheets.js');

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
        await interaction.deferReply({ ephemeral: true });
        try {

            const matchingPack = await CardPack.find({googleSheetsId: interaction.options.getString('spreadsheet_id')});

            const questions = await getQuizQuestions(interaction.options.getString('spreadsheet_id'));

            const questionsEmbed = new EmbedBuilder()
            .setColor(0x14cf03)
            .setTitle(`List of Questions in ${matchingPack[0].nameOfPack}`)
            .setDescription("Heres a list of questions I was able to find:");
            for (let i = 1; i < eval(Math.min(24, questions.length)); i++) {
                questionsEmbed.addFields({name: `Question ${i}`, value: `${questions[i][0]}`});
            }

            await interaction.editReply({embeds: [questionsEmbed]});
        } catch (err) {
            console.error(`[ERROR] ${err}`);
            interaction.editReply('There was an error performing this command, please contact `Nexus Novaz#0862`');

            return -1;
        }
    }
}