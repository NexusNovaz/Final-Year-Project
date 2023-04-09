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
            console.log(matchingPack);

            const questions = await getQuizQuestions(interaction.options.getString('spreadsheet_id'));
            //const questionsArray = questions.;

            const questionsEmbed = new EmbedBuilder()
            .setColor(0x14cf03)
            .setTitle(`List of Questions in ${matchingPack.nameOfPack}`)
            .setDescription("Heres a list of questions I was able to find:");
            
            // questionsArray.forEach((question, i) => {
            //     if (i >= 25) return;
            //     questionsEmbed.addFields(
            //         {name: `Question: ${i+1}`, value: `${question[0][i+1]}`}
            //     )
            //     i++;
            // });

            await interaction.editReply({embeds: [questionsEmbed]});
        } catch (err) {
            console.error(`[ERROR] ${err}`);
            interaction.editReply('There was an error performing this command, please contact `Nexus Novaz#0862`');

            return -1;
        }
    }
}