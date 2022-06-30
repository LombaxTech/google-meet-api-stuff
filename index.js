const express = require("express");
const app = express();
const cors = require("cors");
const { google } = require("googleapis");
const e = require("express");
const stripe = require("stripe")("sk_test_KxIPs4lg5Yrc8yey28svCIuJ00RTuBa9uJ");

app.use(express.json());
app.use(cors());

const CLIENT_ID =
  "9361851045-i354b6d1lj28q91kjg52hs81tulovuj2.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
// const REDIRECT_URL = "http://localhost:3000/tokens";
const REDIRECT_URL = "http://localhost:3000/gauth-success";

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

const scopes = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
];

async function generateURL() {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });

  console.log({ url });
  return url;
}

async function getTokens(code) {
  const { tokens } = await oauth2Client.getToken(
    // "4/0AX4XfWjgxoX8nL59uh7iFnqmyK6tqe9EATdHrw6j-R8svB75_p7iK6iWvu6-IxaCMUvaBQ"
    code
  );
  console.log({ tokens });
  return tokens;
}

app.get("/gen-auth-link", async (req, res) => {
  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
    });
    res.json(url);
  } catch (error) {
    console.log(error);
  }
});

app.post("/gen-tokens", async (req, res) => {
  const { code } = req.body;

  try {
    let tokens = await getTokens(code);
    res.json(tokens);
  } catch (error) {
    console.log(error);
  }
});

app.post("/create-calendar-event", async (req, res) => {
  const { refresh_token, startTime, endTime } = req.body;

  oauth2Client.setCredentials({ refresh_token });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  // const startTime = new Date();
  // startTime.setHours(22, 0);

  // const endTime = new Date();
  // endTime.setHours(22, 30);

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

  try {
    const calendarRes = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: "1",
      sendNotifications: true,
      sendUpdates: "all",
      resource: event,
    });

    console.log(calendarRes);
    res.json(calendarRes);
    // console.log(res.data.conferenceData.entryPoints);
    console.log("created event");
  } catch (error) {
    console.log(error);
    console.log("error in creating event");
  }
});

app.post("/create-payment-intent", async (req, res) => {
  const { amount } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 10 * 100,
      currency: "GBP",

      application_fee_amount: 123,
      transfer_data: {
        destination: "acct_1LCBeeQTIYlONkER",
      },
    });

    res.status(200).json(paymentIntent);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

// TODO: Create payment intent w/ customer and payment method
app.post("/payment-method-customer-method", async (req, res) => {
  const { paymentMethod, stripeCustomerId } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 1200,
      currency: "gbp",
      customer: stripeCustomerId,
      payment_method: paymentMethod,
      off_session: true,
      confirm: true,
    });

    res.json(paymentIntent);
  } catch (error) {
    res.json(error);
  }
});

app.get("/tokens", async (req, res) => {
  // console.log(req.params);
  console.log(req.query);
  res.json("hello");
});

app.get("/redirect", (req, res) => {
  // res.redirect("http://www.google.com");
  res.json("hello");
});

// STRIPE STUFF

app.post("/connected-account", async (req, res) => {
  const { email } = req.body;

  try {
    const account = await stripe.accounts.create({
      type: "express",
      country: "GB",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      business_profile: {
        url: "rktutors.co.uk",
        mcc: 8299,
      },
      // email: "test@gmail.com",
      individual: {
        email,
        // first_name: "eren",
        // last_name: "yeager",
      },
    });

    console.log(account);
    console.log("successfully created account");
    res.json(account);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

app.post("/create-connected-account-and-link", async (req, res) => {
  try {
    const account = await stripe.accounts.create({
      type: "express",
      country: "GB",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "individual",
      business_profile: {
        url: "rktutors.co.uk",
        mcc: 8299,
        support_email: "pleasework@pleasework.com",
      },
      email: "test@gmail.com",
      individual: {
        email: "test@gmail.com",
        first_name: "eren",
        last_name: "yeager",
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: "http://localhost:5000/refresh",
      return_url: "http://localhost:5000/success",
      type: "account_onboarding",
    });

    console.log(accountLink);
    res.json({ accountLink, accountId: account.id });
  } catch (error) {
    console.log(error);
  }
});

app.post("/loginlink/:accountId", async (req, res) => {
  const accountId = req.params.accountId;
  try {
    const loginLink = await stripe.accounts.createLoginLink(accountId);
    res.json(loginLink);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

// TODO: Create just an onboarding link
app.post("/onboarding/:accountId", async (req, res) => {
  const accountId = req.params.accountId;

  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: "http://localhost:5000/refresh",
      return_url: "http://localhost:5000/success",
      type: "account_onboarding",
    });

    res.json(accountLink);
  } catch (error) {
    res.json(error);
  }
});

// TODO: Get a connected account
app.get("/connected-account/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const account = await stripe.accounts.retrieve(id);
    res.json(account);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

// TODO: Delete a connected account
app.delete("/connected-account/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const deleted = await stripe.accounts.del(id);
    console.log("successfully deleted");
    res.json(deleted);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

// TODO: Batch get all accounts and delete
app.post("/delete-all-accounts", async (req, res) => {
  try {
    let accounts = await stripe.accounts.list();
    accounts = accounts.data;
    for (const account of accounts) {
      const deleted = await stripe.accounts.del(account.id);
      console.log("deleted account...");
    }
    res.json({ success: true });
  } catch (error) {
    res.json(error);
  }
});

// TODO: Create Stripe Customer
app.post("/stripe-customer", async (req, res) => {
  const { name, email } = req.body;

  try {
    // res.send("tyring");
    const customer = await stripe.customers.create({
      name,
      email,
    });
    res.json(customer);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

// TODO: Create Set Up Intent
app.post("/setup-intent", async (req, res) => {
  const { customerId } = req.body;

  try {
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ["card"],
      customer: customerId,
    });

    // returns a client secret
    res.json(setupIntent);
  } catch (error) {
    res.json(error);
  }
});

// TODO: List payment methods
app.post("/payment-methods", async (req, res) => {
  // customer is customer id
  const { customer } = req.body;
  console.log("received");
  console.log(customer);

  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer,
      type: "card",
    });

    res.json(paymentMethods);
  } catch (error) {
    console.log(error);
    res.json(error);
  }
});

// TODO: Detach payment method from customer
app.post("/detach-payment-method", async (req, res) => {
  const { paymentMethodId } = req.body;

  try {
    const removedPaymentMethod = await stripe.paymentMethods.detach(
      paymentMethodId
    );
    res.json(removedPaymentMethod);
  } catch (error) {
    res.json(error);
  }
});

app.listen("5000", () => console.log("running"));
