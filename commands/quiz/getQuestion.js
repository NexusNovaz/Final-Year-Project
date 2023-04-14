const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getQuizInformation } = require("../../utility/spreadsheets");


module.exports = {
    info: {
        name: "get_question",
        description: "Get a question from your enabled packs or a specific pack",
        usage: "/get_question <command>",
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
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const questionPacks = []
        const questions = []
        if (interaction.options.getString("quiz_id")) {
            try {
                const questionsInQuestionPack = await getQuizInformation(interaction.options.getString("quiz_id"));
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
                await interaction.editReply('There was an error performing this command, please contact `Nexus Novaz#0862`');
            }
        } else {
            try {
                // handle no input
                // get enabled quizzes,
                // get question from quizzes

            } catch (error) {
                console.error(error);
                await interaction.editReply('There was an error performing this command, please contact `Nexus Novaz#0862`');

            }
        }
        const question = questions[Math.floor(Math.random()*questions.length)]
        const questionEmbed = new EmbedBuilder()
            .setTitle(question.question)
            .setColor(0x00ff00)
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

        const collector = msg.createMessageComponentCollector({ filter, time: 15000 });
    }
}