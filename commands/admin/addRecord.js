const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const mongoose = require('../../database/index.js');

const CardPack = require('../../database/models/CardPack');

// Import functions to use googleAPI
const {getSheetId, getSheetName, getNumberOfQuestions, checkLinkValid} = require('../../utility/spreadsheets.js');

async function getSheetsInfo(interaction) {
    const sheetId = await getSheetId(interaction);

    const sheetName = await getSheetName(sheetId);
    const numberOfQuestions = getNumberOfQuestions(sheetId);

    return {sheetId, sheetName, numberOfQuestions};
}

async function addRecordToDb(interaction) {
    const {sheetId, sheetName, numberOfQuestions} = await getSheetsInfo(interaction);
    const newCard = new CardPack({
        discordId: interaction.user.id,
        nameOfPack: sheetName,
        googleSheetsId: sheetId,
        numOfQuestions: numberOfQuestions,
    });

    const savedCard = newCard.save();
    console.log(`Saved correctly.`);
}

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('add_record')
        .setDescription('Add record to database')
        //.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName('link')
                .setDescription("Link to google sheets document docs.google.com/spreadsheets/d/XXXXXXXX/edit?usp=sharing)")
                .setRequired(true)
        )
        .addBooleanOption(option =>
            option
                .setName("enable")
                .setDescription("Would you like this enabled on this server by default?")
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        try {
            if (checkLinkValid(interaction) != false) {
                await addRecordToDb(interaction);
                await interaction.editReply('Added to DB');
            } else {
                await interaction.editReply('Invalid link. Please make sure it is the full link. e.g. https://docs.google.com/spreadsheets/d/12fesLNW3vFz48_1YK8nWBM-Ink-yGDc9C6XzWh9hCTQ/edit#gid=0');
            }
        } catch (err) {
            console.log(err);
            await interaction.editReply('An error has occured. Please contact `Nexus Novaz#0862`');
        }
    },
};