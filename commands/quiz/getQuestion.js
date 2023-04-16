const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const CardPack = require("../../database/models/CardPack");
const { getEnabledQuizzes, getQuizInformation, checkQuizIdValid } = require("../../utility/spreadsheets");

var question = [];
const questionEmbed = new EmbedBuilder()

module.exports = {
    info: {
        name: "get_question",
        description: "Get a question from your enabled packs or a specific pack",
        usage: "/get_question <quiz id>",
    },
    data: new SlashCommandBuilder()
        .setName("get_question")
        .setDescription("Get a question from your enabled quizzes")
        .addStringOption((option) =>
            option
                .setName('quiz_id')
                .setDescription('The google sheets id of the pack you want to get a question from')
                .setRequired(false)
        ),
    async checkAnswer(interaction) {
        if (interaction.customId == question.correct_answer) {
            questionEmbed.setColor(0x00ff00);
            interaction.update({content: `Correct Answer!`, embeds: [questionEmbed], components: [] });
        } else {
            questionEmbed.setColor(0xff0000).addFields({name: "Correct Answer:", value: `Option ${question.correct_answer}`})
            interaction.update({content: `Nice try, but its not right. The correct answer was: option ${question.correct_answer}`, embeds: [questionEmbed], components: []});
        }
    },
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const questions = []
        const isQuizIdValid = await CardPack.findOne({"googleSheetsId": interaction.options.getString('quiz_id')}, {googleSheetsId: 1, _id: 0});
        if (!isQuizIdValid && interaction.options.getString('quiz_id')) {
            interaction.editReply("Check your spreadsheet id and try again. I dont see any packs with that id.");
            return;
        } else {
                if (isQuizIdValid) {
                    try {
                        const questionsInQuestionPack = await getQuizInformation(isQuizIdValid.googleSheetsId);
                        for (sublist in questionsInQuestionPack) {
                            new_dict = {
                                "question": questionsInQuestionPack[sublist][0],
                                "answer1": questionsInQuestionPack[sublist][1],
                                "answer2": questionsInQuestionPack[sublist][2],
                                "answer3": questionsInQuestionPack[sublist][3],
                                "answer4": questionsInQuestionPack[sublist][4],
                                "correct_answer": questionsInQuestionPack[sublist][5],
                            }
                            questions.push(new_dict);
                        }
                    } catch (error) {
                        console.error(error)
                        await interaction.editReply('There was an error performing this command, please check your input and try again, if it persists, contact `Nexus Novaz#0862`');
                        return -1;
                    }
                } else {
                    try {
                        const enabledQuizzes = await getEnabledQuizzes(interaction);
                        if (enabledQuizzes.length == 0) {
                            await interaction.editReply("You have no quizzes enabled, please enable a quiz or run the command with a quiz id");
                            return;
                        }
                        try {
                            const questionObject = []
                            for (i in enabledQuizzes) {
                                const questionsInQuestionPack = await getQuizInformation(enabledQuizzes[i].googleSheetsId);
                                for (sublist in questionsInQuestionPack) {
                                    new_dict = {
                                        "question": questionsInQuestionPack[sublist][0],
                                        "answer1": questionsInQuestionPack[sublist][1],
                                        "answer2": questionsInQuestionPack[sublist][2],
                                        "answer3": questionsInQuestionPack[sublist][3],
                                        "answer4": questionsInQuestionPack[sublist][4],
                                        "correct_answer": questionsInQuestionPack[sublist][5],
                                    }
                                    questions.push(new_dict);
                                }
                            }
                        } catch (error) {
                            console.log(error)
                            await interaction.editReply('There was an error performing this command, please contact `Nexus Novaz#0862`')
                        }
                    } catch (error) {
                        console.error(error);
                        await interaction.editReply('There was an error performing this command, please contact `Nexus Novaz#0862`');
        
                    }
                }
                question = questions[Math.floor(Math.random()*questions.length)]
                questionEmbed
                    .setTitle(question.question)
                    .setColor(0xffc524)
                    .setTimestamp(Date.now())
                    .setFooter({ text: "Revision Bot" });
                const buttonBar = new ActionRowBuilder();
                const fields = [];
        
                if (question.answer1) {
                    fields.push({name: "Option 1", value: question.answer1});
                    buttonBar.addComponents(new ButtonBuilder().setCustomId("1").setLabel(question.answer1).setStyle(ButtonStyle.Primary));
                }
                if (question.answer2) {
                    fields.push({name: "Option 2", value: question.answer2});
                    buttonBar.addComponents(new ButtonBuilder().setCustomId("2").setLabel(question.answer2).setStyle(ButtonStyle.Primary));
                }
                if (question.answer3) {
                    fields.push({name: "Option 3", value: question.answer3});
                    buttonBar.addComponents(new ButtonBuilder().setCustomId("3").setLabel(question.answer3).setStyle(ButtonStyle.Primary));
                }
                if (question.answer4) {
                    fields.push({name: "Option 4", value: question.answer4});
                    buttonBar.addComponents(new ButtonBuilder().setCustomId("4").setLabel(question.answer4).setStyle(ButtonStyle.Primary));
                }
                questionEmbed.setFields(fields);
        
                interaction.editReply({embeds: [questionEmbed], components: [buttonBar]});
            }
        }
}