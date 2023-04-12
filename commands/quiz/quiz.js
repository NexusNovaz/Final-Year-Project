const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const CardPack = require('../../database/models/CardPack.js');
const {
    getSheetId,
    getSheetName,
    getNumberOfQuestions,
    checkLinkValid,
    getQuizQuestions,
    getEnabledQuizzes,
} = require('../../utility/spreadsheets.js');

module.exports = {
    info: {
        name: 'quiz',
        description: 'Get information on quizzes and add a quiz',
        usage: '/quiz <enable|disable|add|list> <quiz_id>',
    },
    data: new SlashCommandBuilder()
        .setName('quiz')
        .setDescription('Get information on quizzes and add a quiz')
        .addSubcommand(subcommand => // enable
            subcommand
                .setName('enable')
                .setDescription('Enable a Quiz')
                .addStringOption(option => 
                    option
                        .setName('quiz_id')
                        .setDescription('The ID of the quiz you want to enable')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand => // disable
            subcommand
                .setName('disable')
                .setDescription('Disable a Quiz')
                .addStringOption(option => 
                    option
                        .setName('quiz_id')
                        .setDescription('The ID of the quiz you want to disable')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand => // add
            subcommand
                .setName('add')
                .setDescription('Add a Quiz')
                .addStringOption(option => 
                    option
                        .setName('link')
                        .setDescription('The google sheets link of the quiz you want to add')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand => // get question
            subcommand
                .setName('get_question')
                .setDescription('Get a question from your enabled packs')
        )
        // Make a sub command group for list. list will have the following subcommands. list quizzes and list questions
        .addSubcommandGroup(subcommandGroup => // list group
            subcommandGroup
                .setName('list')
                .setDescription('List quizzes and questions')
                .addSubcommand(subcommand => // quizzes
                    subcommand
                        .setName('quizzes')
                        .setDescription('List all quizzes')
                )
                .addSubcommand(subcommand => // questions
                    subcommand
                        .setName('questions')
                        .setDescription('List all questions')
                        .addStringOption(option =>
                            option
                                .setName('quiz_id')
                                .setDescription('The ID of the quiz you want to list questions from')
                                .setRequired(true)
                        )
                )

        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        try {
            if (interaction.options.getSubcommand() === 'enable') {
                // Check if the quiz is already enabled for the discord user
                if (await CardPack.findOne({googleSheetsId: interaction.options.getString('quiz_id'), enabledFor: interaction.user.id})) {
                    await interaction.editReply(`You have already enabled ${await getSheetName(interaction.options.getString('quiz_id'))}!`);
                    return;
                } else {
                    await CardPack.updateOne({googleSheetsId: interaction.options.getString('quiz_id')}, {$addToSet: {enabledFor: interaction.user.id}});
                    await interaction.editReply(`You have enabled ${await getSheetName(interaction.options.getString('quiz_id'))} for ${interaction.user.tag} (${interaction.user.id})}`);
                }
            }
            else if (interaction.options.getSubcommand() === 'disable') {
                // Check if the quiz is enabled for the discord user
                if (!await CardPack.findOne({googleSheetsId: interaction.options.getString('quiz_id'), enabledFor: interaction.user.id})) {
                    await interaction.editReply(`You have not enabled ${await getSheetName(interaction.options.getString('quiz_id'))}!`);
                    return;
                } else {
                    await CardPack.updateOne({googleSheetsId: interaction.options.getString('quiz_id')}, {$pull: {enabledFor: interaction.user.id}});
                await interaction.editReply(`You have disabled ${await getSheetName(interaction.options.getString('quiz_id'))} for ${interaction.user.tag} (${interaction.user.id})}`);
                }   
            } 
            else if (interaction.options.getSubcommand() === 'add') {
                // Check if the link is valid
                if (!await checkLinkValid(interaction.options.getString('link'))) {
                    await interaction.editReply('The link you provided is not a valid google sheets link!');
                    return;
                }
                // Check if the quiz is already added
                if (await CardPack.findOne({googleSheetsId: await getSheetId(interaction)})) {
                    await interaction.editReply('The quiz you are trying to add is already added!');
                    return;
                }
                // Get the name of the quiz
                try {
                    const nameOfPack = await getSheetName(await getSheetId(interaction));
                    // Get the number of questions in the quiz
                    const numberOfQuestions = await getNumberOfQuestions(await getSheetId(interaction));
                    // Create a new card pack
                    const newCardPack = new CardPack({
                        nameOfPack: nameOfPack,
                        googleSheetsId: await getSheetId(interaction),
                        numberOfQuestions: numberOfQuestions,
                        userInfo: {
                            discordId: `${interaction.user.id}`, discordTag: `${interaction.user.tag}`
                        }
                    });
                    // Save the new card pack
                    await newCardPack.save();
                    await interaction.editReply('Saved Successfully. Do /quiz list quizzes to view it');
                } catch (error) {
                    await interaction.editReply('Something failed. Have you made the google sheets link publically accessable?');
                    console.error(error);
                }

            }
            else if (interaction.options.getSubcommand() === 'get_question') {
                const enabledQuizzes = await getEnabledQuizzes(interaction);
                if (!enabledQuizzes) {
                    interaction.editReply('You have no enabled quizzes! Run `/quiz list quizzes` to see available quizzes then `/quiz enable <quiz_id>` to enable one!')
                    return;
                } else {
                    const questions = []
                    console.log(`enabledQuizzes = ${enabledQuizzes}`);
                    enabledQuizzes.forEach(async(sheetId) => {
                        const questionPack = await getQuizQuestions(sheetId.googleSheetsId);
                        questions.push(questionPack);
                        console.log(`questions = ${questions}`);
                    })
                    // console.log(`questionPool = ${questionPool}`);
                    interaction.editReply('In Testing...');
                }
            }
            else if (interaction.options.getSubcommandGroup() === 'list') {
                if (interaction.options.getSubcommand() === 'quizzes') {
                    const quizzes = await CardPack.find({}, { userInfo: 1, nameOfPack: 1, googleSheetsId: 1, _id: 0 });
                    const foundQuizzesEmbed = new EmbedBuilder()
                    .setColor(0x14cf03)
                    .setTitle("List of Quizzes")
                    .setDescription("Heres a list of quizzes I was able to find:");
                    for (const quiz of quizzes) {
                        foundQuizzesEmbed.addFields(
                            { name: `${quiz.nameOfPack} by ${quiz.userInfo.discordTag}`, value: `${quiz.googleSheetsId}`, inline: false }
                        );
                    }
                    await interaction.editReply({ embeds: [foundQuizzesEmbed] });
                }
                
                else if (interaction.options.getSubcommand() === 'questions') {
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
                }
            }

        } catch (err) {
            console.error(`[ERROR] (quiz.js) ${err}`);
            interaction.editReply('There was an error performing this command, please contact `Nexus Novaz#0862`');
            return -1;
        }
    }
}