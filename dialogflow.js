// const dialogflow = require('@google-cloud/dialogflow');
// const { WebhookClient, Suggestion } = require('dialogflow-fulfillment');
// const express = require("express");
// const cors = require("cors");
// const { google } = require('googleapis');
// const nodemailer = require('nodemailer');
// const { WebClient } = require('@slack/web-api');

// const app = express();
// app.use(express.json());
// app.use(cors());

// const PORT = process.env.PORT || 8080;

// const sheets = google.sheets('v4');
// const auth = new google.auth.GoogleAuth({
//     keyFile: 'path-to-your-service-account-file.json',
//     scopes: ['https://www.googleapis.com/auth/spreadsheets']
// });
// const sheetsClient = auth.getClient();
// const spreadsheetId = 'your-google-sheet-id';


// const slackToken = 'your-slack-token';
// const slackChannel = 'your-slack-channel-id';
// const slackClient = new WebClient(slackToken);

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'your-email@gmail.com',
//         pass: 'your-email-password'
//     }
// });

// app.post("/webhook", async (req, res) => {
//     const agent = new WebhookClient({ request: req, response: res });

//     let cowType, budget, age, location;

//     function purchaseCow(agent) {
//         const parameters = agent.parameters;
//         cowType = parameters.cowType;
//         budget = parameters.budget;
//         age = parameters.age;
//         location = parameters.location;

//         agent.add(`You have chosen the following preferences: 
//                    Cow Type: ${cowType}, 
//                    Budget: ${budget}, 
//                    Age: ${age}, 
//                    Location: ${location}. 
//                    Do you confirm these choices?`);
//         agent.add(new Suggestion('Yes'));
//         agent.add(new Suggestion('No'));
//     }

//     async function confirmPurchase(agent) {
//         const confirmation = agent.parameters.confirmation;
//         if (confirmation.toLowerCase() === 'yes') {
//             await storePreferences();
//             await sendConfirmationEmail();
//             await sendSlackNotification();

//             agent.add('Your preferences have been saved and notifications sent.');
//         } else {
//             agent.add('Purchase cancelled.');
//         }
//     }

//     async function storePreferences() {
//         const request = {
//             spreadsheetId,
//             range: 'Sheet1!A:D',
//             valueInputOption: 'USER_ENTERED',
//             insertDataOption: 'INSERT_ROWS',
//             resource: {
//                 values: [
//                     [cowType, budget, age, location]
//                 ]
//             },
//             auth: sheetsClient
//         };
//         await sheets.spreadsheets.values.append(request);
//     }

//     async function sendConfirmationEmail() {
//         const mailOptions = {
//             from: 'your-email@gmail.com',
//             to: 'user-email@gmail.com',
//             subject: 'Cow Purchase Confirmation',
//             text: `You have chosen the following preferences: 
//                    Cow Type: ${cowType}, 
//                    Budget: ${budget}, 
//                    Age: ${age}, 
//                    Location: ${location}.`
//         };
//         await transporter.sendMail(mailOptions);
//     }

//     async function sendSlackNotification() {
//         await slackClient.chat.postMessage({
//             channel: slackChannel,
//             text: `New Cow Purchase: 
//                    Cow Type: ${cowType}, 
//                    Budget: ${budget}, 
//                    Age: ${age}, 
//                    Location: ${location}.`
//         });
//     }

//     let intentMap = new Map();
//     intentMap.set('Purchase Cow', purchaseCow);
//     intentMap.set('Confirm Purchase', confirmPurchase);
//     agent.handleRequest(intentMap);
// });

// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });


const { WebhookClient, Suggestion } = require('dialogflow-fulfillment');
const express = require("express");
const cors = require("cors");
const nodemailer = require('nodemailer');
const { WebClient } = require('@slack/web-api');

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8080;

const slackToken = 'your-slack-token';
const slackChannel = 'your-slack-channel-id';
const slackClient = new WebClient(slackToken);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sherrymerry20@gmail.com',
        pass: '12qw34er'
    }
});

let cowType, budget, age, location;

function welcome(agent) {
    agent.add(`Welcome to the Cow Purchase Bot! How can I assist you today?`);
    agent.add(new Suggestion('Purchase a cow'));
}

function purchaseCow(agent) {
    const parameters = agent.parameters;
    cowType = parameters.cowType;
    budget = parameters.budget;
    age = parameters.age;
    location = parameters.location;

    agent.add(`You are looking for a ${cowType} cow in ${location} with a budget of ${budget} and age ${age}. 
               Do you confirm these choices?`);
    agent.add(new Suggestion('Yes'));
    agent.add(new Suggestion('No'));
}

async function confirmPurchase(agent) {
    const confirmation = agent.parameters.confirmation;
    if (confirmation && confirmation.toLowerCase() === 'yes') {
        await sendConfirmationEmail();
        await sendSlackNotification();

        agent.add('Your preferences have been saved and notifications sent.');
    } else {
        agent.add('Purchase cancelled.');
    }
}

async function sendConfirmationEmail() {
    const mailOptions = {
        from: 'sherrymerry20@gmail.com',
        to: 'sherrymerry20@gmail.com',
        subject: 'Cow Purchase Confirmation',
        text: `You have chosen the following preferences: 
               Cow Type: ${cowType}, 
               Budget: ${budget}, 
               Age: ${age}, 
               Location: ${location}.`
    };
    await transporter.sendMail(mailOptions);
}

async function sendSlackNotification() {
    await slackClient.chat.postMessage({
        channel: slackChannel,
        text: `New Cow Purchase: 
               Cow Type: ${cowType}, 
               Budget: ${budget}, 
               Age: ${age}, 
               Location: ${location}.`
    });
}

function fallback(agent) {
    agent.add(`I'm sorry, I didn't understand that. Can you please try again?`);
}

app.post("/webhook", (req, res) => {
    const agent = new WebhookClient({ request: req, response: res });

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Cow Purchase', purchaseCow);
    intentMap.set('Confirm Purchase', confirmPurchase);
    intentMap.set('Default Fallback Intent', fallback);

    agent.handleRequest(intentMap);
});

app.listen(PORT, () => {
    console.log(`Dialogflow Webhook Server is running on port ${PORT}`);
});
