const { ModalSubmitFields } = require("discord.js");
const { googleAPIKey } = require("../config.json");
const { google } = require("googleapis");
const CardPack = require("../database/models/CardPack");

async function getSheetId(interaction) {
  const regex = /\/d\/([a-zA-Z0-9-_]+)\//;
  const link = interaction.options.getString("link");
  const match = link.match(regex);
  const spreadsheetId = match[1];
  return spreadsheetId;
}

async function getSheetName(spreadsheetId) {
  const sheets = google.sheets({
    version: "v4",
    auth: googleAPIKey,
  });

  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    includeGridData: false,
  });

  return response.data.properties.title;
}

async function getNumberOfQuestions(spreadsheetId) {
  const sheets = google.sheets({
    version: "v4",
    auth: googleAPIKey,
  });

  const range = "Sheet1!A1:A51";

  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get(
      {
        spreadsheetId,
        range,
      },
      (err, res) => {
        if (err) {
          console.error(`[ERROR] ${err}`);
          reject(err);
        }

        const rows = res.data.values;
        
        if (rows.length) {
          resolve(rows.length-1);
        } else {
          console.log("No data found.");
          reject(new Error("No data found."));
        }
      }
    );
  });
}

function checkLinkValid(link) {
  //if (interaction.user.id == 153284216228937728) return true; // Check if Nexus Novaz#0862 (Me) will allow me to send anything
  const regex =
    /^https:\/\/docs.google.com\/spreadsheets\/d\/([a-zA-Z0-9-_]+)\/?/;
  test = regex.test(link);
  return test;
}

async function checkQuizIdValid(quiz_id) {
  const base = "https://docs.google.com/spreadsheets/d/";
  const end = "/?";
  const full_link = base + quiz_id + end;

  try {
    const sheets = google.sheets({
      version: "v4",
      auth: googleAPIKey,
    });
  
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      includeGridData: false,
    });
  
    return response.data.properties.title;
  } catch (error) {
    return "invalid_link";
  }
}

async function getQuizQuestions(spreadsheetId) {
  const sheets = google.sheets({
    version: "v4",
    auth: googleAPIKey,
  });

  const range = "Sheet1!A2:A51";


  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get(
      {
        spreadsheetId,
        range,
      },
      (err, res) => {
        if (err) {
          console.error(`[ERROR] ${err}`);
          reject(err);
        }

        const rows = res.data.values;
        
        if (rows.length) {
          resolve(rows);
        } else {
          console.log("No data found.");
          reject(new Error("No data found."));
        }
      }
    );
  });
}

async function getEnabledQuizzes(interaction) {
  const enabledPacks = await CardPack.find({"enabledFor": interaction.user.id}, {googleSheetsId: 1, _id: 0});
  return enabledPacks;
}

async function getQuizInformation(spreadsheetId) {
  const sheets = google.sheets({
    version: "v4",
    auth: googleAPIKey,
  });

  const range = "Sheet1!A2:F51"; // cells. 


  return new Promise((resolve, reject) => {
    sheets.spreadsheets.values.get(
      {
        spreadsheetId,
        range,
      },
      (err, res) => {
        if (err) {
          console.error(`[ERROR] ${err}`);
          reject(err);
        }

        const rows = res.data.values;
        
        if (rows.length) {
          resolve(rows);
        } else {
          console.log("No data found.");
          reject(new Error("No data found."));
        }
      }
    );
  });
}


module.exports = {
  getSheetId,
  getSheetName,
  getNumberOfQuestions,
  checkLinkValid,
  getQuizQuestions,
  getEnabledQuizzes,
  getQuizInformation,
  checkQuizIdValid,
};
