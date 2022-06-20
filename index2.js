const { google } = require("googleapis");

const CLIENT_ID =
  "9361851045-i354b6d1lj28q91kjg52hs81tulovuj2.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REFRESH_TOKEN =
  "1//03uWuLMbkPZMoCgYIARAAGAMSNwF-L9Ire799iFsW2rSXipGbvHzH4vFH-b2AFLSaB0U1XZW-m5_9-eGvVICLaQ1qk7Q2ykYeFTI";
const REDIRECT_URL = "http://localhost:3000/tokens";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

const scopes = ["https://www.googleapis.com/auth/calendar.events"];

oauth2Client.setCredentials({
  refresh_token: REFRESH_TOKEN,
});

async function generateURL() {
  const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: "offline",

    // If you only need one scope you can pass it as a string
    scope: scopes,
  });

  console.log({ url });
}

async function getTokens() {
  const { tokens } = await oauth2Client.getToken(
    "4/0AX4XfWjgxoX8nL59uh7iFnqmyK6tqe9EATdHrw6j-R8svB75_p7iK6iWvu6-IxaCMUvaBQ"
  );
  console.log({ tokens });
}

// generateURL();
// getTokens();

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

// Create a new event start date instance for temp uses in our calendar.
const startTime = new Date();
startTime.setHours(22, 0);

// Create a new event end date instance for temp uses in our calendar.
const endTime = new Date();
endTime.setHours(22, 30);

// Create a dummy event for temp uses in our calendar
const event = {
  summary: `Test Event`, // Title
  description: `Test Description`,
  attendees: [
    { email: "rakib@think-engineer.com" },
    { email: "blank3141592654@gmail.com" },
    { email: "rakibacademia@gmail.com" },
  ],
  conferenceData: {
    createRequest: {
      requestId: "zzz",
      conferenceSolutionKey: {
        type: "hangoutsMeet",
      },
    },
    // entryPoints: [{ passcode: "abc" }],
  },
  start: {
    dateTime: startTime,
    timeZone: "Europe/Zurich",
  },
  end: {
    dateTime: endTime,
    timeZone: "Europe/Zurich",
  },
};

const insertEvent = async () => {
  try {
    const res = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: "1",
      sendNotifications: true,
      sendUpdates: "all",
      resource: event,
    });

    console.log(res);
    // console.log(res.data.conferenceData.entryPoints);
    console.log("created");
  } catch (error) {
    console.log(error);
    console.log("error happened ffs");
  }
};

const getEvent = async () => {
  try {
    const res = await calendar.events.get({
      calendarId: "primary",
      eventId: "9bqg28uraf4oq93k9lb9frfnig",
    });

    console.log(res);
    console.log("found");
  } catch (error) {
    console.log(error);
    console.log("there has been an error");
  }
};

insertEvent();
// getEvent();

// const express = require("express");
// const cors = require("cors");
// const app = express();

// const { google } = require("googleapis");
// const Meeting = require("google-meet-api").meet;

// app.use(express.json());
// app.use(cors());

// const useMeetingAPI = async () => {
//   const clientId =
//     "1096680089659-hm4ao2eu390kqg3m9q9gl27b4pu7fcje.apps.googleusercontent.com";
//   const clientSecret = "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";
//   const redirect_uri = "http://localhost";
//   const refreshToken =
//     "1//04bsbYZp3csUYCgYIARAAGAQSNwF-L9IrCAJP7JfkJr6U-amYESTmGGOJ6LEP5iEaaEQNilV1R3MK5IGMFzCI-Zk1uQduLwL-d9Y";

//   try {
//     Meeting({
//       clientId,
//       clientSecret,
//       refreshToken,
//       date: "2020-12-01",
//       time: "10:59",
//       summary: "summary",
//       location: "location",
//       description: "description",
//     }).then(function (result) {
//       console.log(result); //result it the final link
//     });
//   } catch (error) {
//     console.log(error);
//   }
// };

// useMeetingAPI();

// const init = async () => {
//   console.log("hello");

//   const client_id =
//     "1096680089659-hm4ao2eu390kqg3m9q9gl27b4pu7fcje.apps.googleusercontent.com";
//   const client_secret = "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";
//   const redirect_uri = "http://localhost";

//   try {
//     const oAuth2Client = new google.auth.OAuth2(
//       client_id,
//       client_secret,
//       redirect_uri
//     );

//     console.log(oAuth2Client);
//   } catch (error) {
//     console.log(error);
//   }
// };

// // init();

// // const listEvents = async (auth) => {
// //   try {
// //     const calendar = google.calendar({ version: "v3", auth });
// //     calendar.events.list(
// //       {
// //         calendarId: "primary",
// //         timeMin: new Date().toISOString(),
// //         maxResults: 10,
// //         singleEvents: true,
// //         orderBy: "startTime",
// //       },
// //       (err, res) => {
// //         if (err) return console.log("The API returned an error: " + err);
// //         const events = res.data.items;
// //         if (events.length) {
// //           console.log("Upcoming 10 events:");
// //           events.map((event, i) => {
// //             const start = event.start.dateTime || event.start.date;
// //             console.log(`${start} - ${event.summary}`);
// //           });
// //         } else {
// //           console.log("No upcoming events found.");
// //         }
// //       }
// //     );
// //   } catch (error) {
// //     console.log(error);
// //   }
// // };

// app.get("/", async (req, res) => {
//   res.send("yelo");
// });

// app.listen(3000, () => console.log("listening..."));
