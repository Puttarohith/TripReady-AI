/**
 * On-Device Speech & Voice Intelligence Assistant
 * Provides hands-free audio query & natural spoken response
 */

export class VoiceAssistant {
  constructor(onQueryProcessed) {
    this.onQueryProcessed = onQueryProcessed;
    this.isListening = false;
    this.recognition = null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.processQuery(transcript);
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        this.isListening = false;
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    }
  }

  startListening() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
        return true;
      } catch (e) {
        console.warn(e);
      }
    }
    return false;
  }

  processQuery(transcript) {
    const text = transcript.toLowerCase();
    let responseText = "";

    if (text.includes("ready") || text.includes("delhi") || text.includes("score")) {
      responseText = "Your trip readiness is at 72%. Your flight and hotel are confirmed, but I detected a tight 25-minute buffer between landing and conference registration, and heavy rain is expected around 5 PM.";
    } else if (text.includes("wrong") || text.includes("risk") || text.includes("fail")) {
      responseText = "I detected 3 active risks for your Delhi trip: First, registration cutoff is tight due to 50-minute airport transit. Second, hotel check-in starts after your meeting. Third, 80% chance of rain during outdoor evening sessions.";
    } else if (text.includes("delay") || text.includes("late")) {
      responseText = "Dynamic recovery active! If your flight is delayed by 90 minutes, I will reroute you directly to Pragati Maidan, skipping initial hotel check-in to preserve your 3 PM Keynote.";
    } else {
      responseText = `I analyzed your trip data for "${transcript}". All 3 tickets are stored offline. You have 2 pending items in your preparation queue before departure.`;
    }

    this.speak(responseText);
    if (this.onQueryProcessed) {
      this.onQueryProcessed(transcript, responseText);
    }
  }

  speak(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }
}
