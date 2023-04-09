const { ModalSubmitFields } = require('discord.js');
const {googleAPIKey} = require('../config.json');
const { google } = require('googleapis');

async function getSheetId(interaction) {
    const regex = /\/d\/([a-zA-Z0-9-_]+)\//;
    const link = interaction.options.getString('link');
    const match = link.match(regex);
    const spreadsheetId = match[1];
    return spreadsheetId;
}

async function getSheetName(spreadsheetId) {
    const sheets = google.sheets({
        version: 'v4',
        auth: googleAPIKey
    });

    const response = await sheets.spreadsheets.get({
        spreadsheetId,
        includeGridData: false,
    });

    return response.data.properties.title;
}

function getNumberOfQuestions(spreadsheetId) {
    const sheets = google.sheets({
        version: 'v4',
        auth: googleAPIKey
    });

    const range = "Sheet1!A1:F51"
    try {
        sheets.spreadsheets.values.get({
            spreadsheetId,
            range
        }, (err, res) => {
            if (err) return -1;
            
            const rows = res.data.values;
            const spreadsheetName = res.data;

            if (rows.length) {
            
                return rows.length;
            
            } else {
                
                console.log('No data found.');
                return -2;
            
            }
        });
    } catch (err) {
        console.error(`[ERROR] ${err}`);
        return -1;
    }
}

function checkLinkValid(interaction) {
    if (interaction.user.id == 153284216228937728) return true; // Check if Nexus Novaz#0862 (Me) will allow me to send anything
    const regex = /^https:\/\/docs.google.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/?/;
    test = regex.test(interaction.options.getString('link'))
    console.log(`regex.text(link) = ${test}`);
    return test;
}

module.exports = {getSheetId, getSheetName, getNumberOfQuestions, checkLinkValid};