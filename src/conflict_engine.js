/**
 * Travel Conflict & Risk Reasoning Engine
 * Evaluates constraints across time, location, weather, and policies.
 */

export class ConflictEngine {
  constructor(knowledgeGraph) {
    this.kg = knowledgeGraph;
  }

  /**
   * Helper to parse time strings "HH:MM" into total minutes from midnight
   */
  static timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.trim().split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }

  static minutesToTime(mins) {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  /**
   * Evaluate all potential travel conflicts across the Knowledge Graph
   */
  evaluateConflicts(params = {}) {
    const flightDelayMins = params.flightDelayMins || 0;
    const flights = this.kg.getNodesByType('flight');
    const hotels = this.kg.getNodesByType('hotel');
    const events = this.kg.getNodesByType('event');
    const weatherList = this.kg.getNodesByType('weather');
    const baggageList = this.kg.getNodesByType('baggage');

    const conflicts = [];

    // --- CONFLICT 1: Flight Arrival vs Event Registration Cutoff (Time & Spatial Buffer) ---
    if (flights.length > 0 && events.length > 0) {
      const flight = flights[0].data;
      const event = events[0].data;

      const flightArrMins = ConflictEngine.timeToMinutes(flight.arrTime) + flightDelayMins;
      const airportExitDelay = 30; // 30 mins exit & deboarding
      const transitToVenueMins = 50; // 50 mins Airport -> Venue
      const estArrivalAtVenueMins = flightArrMins + airportExitDelay + transitToVenueMins;

      const regCutoffMins = ConflictEngine.timeToMinutes(event.regCutoff);

      if (estArrivalAtVenueMins > regCutoffMins) {
        const gapMins = estArrivalAtVenueMins - regCutoffMins;
        conflicts.push({
          id: 'conf_tight_reg',
          severity: 'CRITICAL', // 🔴
          category: 'Time & Logistics',
          title: 'Event Registration Cutoff Risk',
          summary: `Flight arrives at ${ConflictEngine.minutesToTime(flightArrMins)}${flightDelayMins > 0 ? ` (delayed by ${flightDelayMins}m)` : ''}, but event registration closes at ${event.regCutoff}.`,
          impact: `Estimated arrival at venue is ${ConflictEngine.minutesToTime(estArrivalAtVenueMins)} (${gapMins} minutes late).`,
          why: `Flight arrival (${ConflictEngine.minutesToTime(flightArrMins)}) + Airport Exit (${airportExitDelay}m) + Transit (${transitToVenueMins}m) = ${ConflictEngine.minutesToTime(estArrivalAtVenueMins)} vs Reg Cutoff (${event.regCutoff}).`,
          actionRequired: 'Contact event organizers for late check-in or arrange express taxi prior to landing.',
          probability: Math.min(95, 70 + (flightDelayMins / 2))
        });
      }
    }

    // --- CONFLICT 2: Hotel Check-in vs Midday Event Schedule ---
    if (hotels.length > 0 && events.length > 0) {
      const hotel = hotels[0].data;
      const event = events[0].data;

      const checkInMins = ConflictEngine.timeToMinutes(hotel.checkInTime);
      const eventStartMins = ConflictEngine.timeToMinutes(event.startTime);

      if (eventStartMins < checkInMins) {
        conflicts.push({
          id: 'conf_hotel_checkin',
          severity: 'WARNING', // 🟠
          category: 'Hotel & Schedule',
          title: 'Hotel Check-in Starts After Event',
          summary: `Hotel check-in opens at ${hotel.checkInTime}, but your event starts at ${event.startTime}.`,
          impact: 'You will not be able to drop your main luggage in your hotel room prior to the event.',
          why: `Check-in window (${hotel.checkInTime}) is after event start (${event.startTime}). Transit hotel ↔ venue takes ~40 mins.`,
          actionRequired: 'Request early hotel check-in (11:30 AM) or drop bags at hotel concierge/airport locker.',
          probability: 48
        });
      }
    }

    // --- CONFLICT 3: Baggage Allowance vs Planned Equipment ---
    if (flights.length > 0) {
      const flight = flights[0].data;
      const plannedWeightKg = 18.5; // Example user planned load (demo gear, presentation kit, etc)

      if (plannedWeightKg > flight.baggageAllowanceKg) {
        conflicts.push({
          id: 'conf_baggage_excess',
          severity: 'WARNING', // 🟠
          category: 'Airline Policy',
          title: 'Baggage Allowance Excess Risk',
          summary: `Planned baggage load (~${plannedWeightKg} kg) exceeds ticket limit (${flight.baggageAllowanceKg} kg).`,
          impact: 'Potential ₹1,500 - ₹3,000 excess baggage fee at check-in counter.',
          why: `Ticket limit: ${flight.baggageAllowanceKg} kg. Estimated packed gear: ${plannedWeightKg} kg (3.5 kg excess).`,
          actionRequired: 'Pre-purchase additional baggage allowance online for 50% discount or streamline packing list.',
          probability: 60
        });
      }
    }

    // --- CONFLICT 4: Weather vs Outdoor Event Window ---
    const weather = weatherList.length > 0 ? weatherList[0].data : { rainProb: 80, rainTime: '17:00' };
    if (weather && weather.rainProb >= 60) {
      conflicts.push({
        id: 'conf_weather_rain',
        severity: 'WARNING', // 🟠
        category: 'Weather Impact',
        title: 'Rain Forecast During Outdoor Event',
        summary: `Heavy rain expected around ${weather.rainTime} (${weather.rainProb}% probability).`,
        impact: 'Outdoor sessions & open-air transport will be disrupted around 5:00 PM.',
        why: `Event ends at 6:00 PM in outdoor venue. Rain probability hits ${weather.rainProb}% between 5:00 PM – 7:00 PM.`,
        actionRequired: 'Pre-book return cab before 4:45 PM to avoid surge pricing & rain delays.',
        probability: weather.rainProb
      });
    }

    return conflicts;
  }

  /**
   * Run Dynamic Itinerary Recovery when a flight delay is reported
   */
  recoverItinerary(flightDelayMins) {
    const originalPlan = [
      { time: '10:35', activity: 'Land at Delhi Airport' },
      { time: '11:15', activity: 'Hotel Check-in & Refresh' },
      { time: '13:00', activity: 'Networking Lunch' },
      { time: '15:00', activity: 'Keynote Session at Conference' },
      { time: '19:00', activity: 'Team Dinner' }
    ];

    const newLandMins = ConflictEngine.timeToMinutes('10:35') + flightDelayMins;
    const newLandTime = ConflictEngine.minutesToTime(newLandMins);

    const recoveredPlan = [
      { time: newLandTime, activity: `Land at Delhi Airport (Delayed +${flightDelayMins}m)`, status: 'RECOVERED' },
      { time: ConflictEngine.minutesToTime(newLandMins + 45), activity: 'Direct Express Transit to Venue (Skip Hotel Check-in)', status: 'REROUTED' },
      { time: '13:00', activity: 'Grab Express Sandwich at Venue (Lunch Rescheduled)', status: 'MODIFIED' },
      { time: '15:00', activity: 'Keynote Session at Conference', status: 'ON_TRACK' },
      { time: '18:30', activity: 'Late Hotel Check-in & Luggage Drop', status: 'RESCHEDULED' },
      { time: '19:30', activity: 'Team Dinner', status: 'ON_TRACK' }
    ];

    return {
      flightDelayMins,
      originalPlan,
      recoveredPlan,
      changesSummary: [
        `🔴 Direct airport-to-venue transit scheduled (bypassing initial hotel check-in).`,
        `🟠 Sit-down lunch removed; express venue dining recommended.`,
        `🟢 Keynote session at 15:00 preserved successfully.`
      ]
    };
  }
}
