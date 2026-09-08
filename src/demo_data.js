/**
 * Hackathon Demo Data & Shortlisting Test Scenarios
 * Provides preset realistic travel payloads for screening jury verification
 */

export const DEMO_SCENARIOS = {
  DELHI_BUSINESS_TRIP: {
    tripName: "Delhi AI Summit & Pitch",
    tripDates: "Sep 20–22, 2026",
    rawDocs: [
      {
        type: "Flight Ticket PDF",
        content: `FLIGHT CONFIRMATION - VISTARA UK-814
Route: HYD (Hyderabad) -> DEL (Delhi)
Date: 20 Sep 2026
Departure: 08:20 AM (Rajiv Gandhi Intl)
Arrival: 10:35 AM (Indira Gandhi Intl - T3)
Baggage Allowance: 15 kg Checked, 7 kg Cabin
Status: Confirmed`
      },
      {
        type: "Hotel Confirmation Email",
        content: `BOOKING VOUCHER - GRAND HYATT AEROCITY
Guest: Alex Kumar
Check-in Date: 20 Sep 2026 (Check-in starts: 14:00 / 2:00 PM)
Check-out Date: 22 Sep 2026 (Check-out by: 11:00 AM)
Address: Asset 1, Aerocity, New Delhi 110037`
      },
      {
        type: "Conference Pass PDF",
        content: `EVENT PASS: India AI Builders Summit 2026
Venue: Hall 5, Pragati Maidan, New Delhi
Registration Cutoff: 11:00 AM Sharp
Opening Keynote: 11:30 AM
Outdoor Networking Evening: 05:00 PM - 07:00 PM (Main Lawn)`
      }
    ],
    weather: {
      temp: "31°C",
      rainProb: 80,
      rainTime: "17:00"
    }
  }
};
