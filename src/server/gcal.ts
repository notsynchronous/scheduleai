import { google } from "googleapis";
import key from "creds.json"; // Import your service account key JSON file
import { startOfWeek, endOfWeek, parseJSON, formatRFC3339 } from "date-fns";
import { type Event } from "types";

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
export const createEvent = async (event: Event) => {
    if (!event.startTime || !event.endTime || !event.name) return;
    try {
      const e = {
        summary: event.name, // Event summary/title
        start: {
          dateTime: formatRFC3339(parseJSON(event.startTime)), // Start time of the event
          timeZone: "America/New_York", // Set your desired timezone
        },
        end: {
          dateTime: formatRFC3339(parseJSON(event.endTime)), // End time of the event
          timeZone: "America/New_York", // Set your desired timezone
        },
      };
      const response = await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        requestBody: {
          ...e
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
};

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
