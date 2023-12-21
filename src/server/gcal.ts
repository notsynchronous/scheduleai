import { google } from "googleapis";
import key from "creds.json"; // Import your service account key JSON file
import { startOfWeek, endOfWeek } from "date-fns";

// Define the scope for the calendar API
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

// Create a new JWT client using the key file
const auth = new google.auth.JWT({
  email: key.client_email,
  key: key.private_key,
  scopes: SCOPES,
});

// Set up the Google Calendar API with the authenticated client
const calendar = google.calendar({ version: "v3", auth });

// Example: Create events on the user's calendar
export async function createEvents() {
  // try {
  //   const event = {
  //     summary: "New Event", // Event summary/title
  //     description: "Description of the event",
  //     start: {
  //       dateTime: "2023-12-25T10:00:00", // Start time of the event
  //       timeZone: "Your-Time-Zone", // Set your desired timezone
  //     },
  //     end: {
  //       dateTime: "2023-12-25T12:00:00", // End time of the event
  //       timeZone: "Your-Time-Zone", // Set your desired timezone
  //     },
  //   };

  //   const response = await calendar.events.insert({
  //     calendarId: "primary", // Calendar ID where the event will be added
  //     resource: event,
  //   });

  //   console.log("Event created:", response.data);
  //   return response.data;
  // } catch (error) {
  //   console.error("Error:", error);
  //   throw error;
  // }
}

// Example: List the user's calendar events
export async function listEvents() {
  try {
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID, // Use the primary calendar or specific calendar ID
      timeMin: startOfWeek(new Date()).toISOString(), // Specify the minimum time for events
      timeMax: endOfWeek(new Date()).toISOString(),
      maxResults: 20,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items;
    return events;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
