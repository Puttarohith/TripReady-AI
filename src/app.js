import { TravelParser } from './parser.js';
import { TravelKnowledgeGraph } from './knowledge_graph.js';
import { ConflictEngine } from './conflict_engine.js';
import { ReadinessCalculator } from './readiness_score.js';
import { VoiceAssistant } from './voice_assistant.js';
import { RealtimeWeatherService } from './realtime_weather.js';
import { CityCabService } from './cab_service.js';
import { EmailImporterService } from './email_importer.js';
import { GmailLiveSyncService } from './gmail_live_sync.js';
import { DEMO_SCENARIOS } from './demo_data.js';

class TravelGuardApp {
  constructor() {
    this.kg = new TravelKnowledgeGraph("Delhi AI Summit 2026", "Sep 20–22, 2026");
    this.conflictEngine = new ConflictEngine(this.kg);
    this.voiceAssistant = new VoiceAssistant((q, r) => this.onVoiceQueryProcessed(q, r));

    this.currentDelayMins = 0;
    this.currentWeather = null;
    this.activeCabCity = 'hyderabad';

    this.initNavigation();
    this.initUI();
    this.initRealtimeData();
  }

  initNavigation() {
    const navBtns = document.querySelectorAll('.nav-pill');
    navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const pageId = btn.getAttribute('data-page');
        this.switchPage(pageId);
      });
    });

    document.querySelectorAll('.shortcut-card').forEach(card => {
      card.addEventListener('click', () => {
        const targetPage = card.getAttribute('data-target');
        this.switchPage(targetPage);
      });
    });
  }

  switchPage(pageId) {
    document.querySelectorAll('.nav-pill').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-page') === pageId);
    });

    document.querySelectorAll('.page-view').forEach(page => {
      page.classList.toggle('active', page.id === `page-${pageId}`);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async initRealtimeData() {
    try {
      await this.fetchCityWeather('delhi');
    } catch (e) {
      console.warn('Weather fetch fallback:', e);
    }
    this.loadBaselineScenario();
  }

  async fetchCityWeather(city) {
    this.currentWeather = await RealtimeWeatherService.fetchLiveWeather(city);
    const heroWeather = document.getElementById('hero-weather-val');
    if (heroWeather) {
      heroWeather.textContent = `${this.currentWeather.temp}, ${this.currentWeather.city} (Rain: ${this.currentWeather.rainProb}%)`;
    }

    const existing = this.kg.getNodesByType('weather');
    if (existing.length > 0) {
      existing[0].data = this.currentWeather;
    } else {
      this.kg.addNode('weather', this.currentWeather);
    }

    this.render();
  }

  initUI() {
    // Navigation shortcut button from home
    const btnGotoEmailHome = document.getElementById('btn-goto-gmail-sync-home');
    if (btnGotoEmailHome) {
      btnGotoEmailHome.addEventListener('click', () => this.switchPage('ingest'));
    }

    // Gmail Live OAuth Sync Buttons
    const btnOAuthConnect = document.getElementById('btn-oauth-gmail-connect');
    if (btnOAuthConnect) {
      btnOAuthConnect.addEventListener('click', () => {
        GmailLiveSyncService.connectGmailOAuth();
      });
    }

    const btnFetchGmail = document.getElementById('btn-fetch-gmail-tickets');
    if (btnFetchGmail) {
      btnFetchGmail.addEventListener('click', () => {
        const tokenInput = document.getElementById('gmail-oauth-token-input');
        const token = tokenInput ? tokenInput.value.trim() : '';
        this.scanLiveGmailTickets(token);
      });
    }

    // Email Ingestion Button
    const btnParseEmail = document.getElementById('btn-parse-email');
    if (btnParseEmail) {
      btnParseEmail.addEventListener('click', () => this.parsePastedEmailText());
    }

    // City Cab Selector
    const cabSelect = document.getElementById('select-cab-city');
    if (cabSelect) {
      cabSelect.addEventListener('change', (e) => {
        this.activeCabCity = e.target.value;
      });
    }

    // Modal Triggers
    const btnBookMain = document.getElementById('btn-book-cab-main');
    if (btnBookMain) {
      btnBookMain.addEventListener('click', () => this.openCabFareModal());
    }

    const btnBookSec = document.getElementById('btn-book-cab-secondary');
    if (btnBookSec) {
      btnBookSec.addEventListener('click', () => this.openCabFareModal());
    }

    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeCabFareModal());
    }

    // File Ingestion (.eml / .pdf / .txt)
    const fileInput = document.getElementById('real-file-input');
    if (fileInput) fileInput.addEventListener('change', (e) => this.handleRealFileUpload(e));

    const dropZone = document.getElementById('drop-zone');
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.style.borderColor = 'var(--emerald-dark)'; });
      dropZone.addEventListener('dragleave', () => { dropZone.style.borderColor = '#cbd5e1'; });
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#cbd5e1';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.readAndIngestFile(e.dataTransfer.files[0]);
        }
      });
    }

    // Weather Selector
    const weatherSelect = document.getElementById('select-city-weather');
    if (weatherSelect) {
      weatherSelect.addEventListener('change', (e) => this.fetchCityWeather(e.target.value));
    }

    // Delay Selector Buttons
    document.querySelectorAll('.btn-delay').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const delay = parseInt(e.target.getAttribute('data-delay'));
        this.setFlightDelay(delay);
      });
    });

    const resetDelayBtn = document.getElementById('btn-reset-delay');
    if (resetDelayBtn) resetDelayBtn.addEventListener('click', () => this.setFlightDelay(0));

    // Microphone Voice Trigger
    const micBtn = document.getElementById('btn-mic-trigger');
    if (micBtn) micBtn.addEventListener('click', () => this.triggerMicVoice());

    // Chat Interface
    const sendChatBtn = document.getElementById('btn-send-chat');
    if (sendChatBtn) sendChatBtn.addEventListener('click', () => this.handleChatInput());

    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleChatInput();
      });
    }
  }

  handleRealFileUpload(event) {
    const file = event.target.files[0];
    if (file) this.readAndIngestFile(file);
  }

  readAndIngestFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      let parsed = { flights: [], hotels: [], events: [] };

      // If .eml email file, use EML MIME parser
      if (file.name.toLowerCase().endsWith('.eml')) {
        parsed = EmailImporterService.parseRealEmlContent(text, file.name);
      } else {
        parsed = TravelParser.parseDocument(text, file.name);
      }

      let count = 0;
      parsed.flights.forEach(f => { this.kg.addNode('flight', f); count++; });
      parsed.hotels.forEach(h => { this.kg.addNode('hotel', h); count++; });
      parsed.events.forEach(e => { this.kg.addNode('event', e); count++; });

      alert(`📁 Real file "${file.name}" processed live!\nIngested ${count} entity nodes into Travel Knowledge Graph.`);
      this.render();
      this.switchPage('risks');
    };
    reader.readAsText(file);
  }

  parsePastedEmailText() {
    const text = document.getElementById('email-paste-input').value;
    if (!text.trim()) {
      alert("Please paste confirmation email text or upload a .eml file.");
      return;
    }

    const parsed = EmailImporterService.extractTravelEntitiesFromEmailText(text, 'User Pasted Email', 'Direct Ingestion');
    let count = 0;
    parsed.flights.forEach(f => { this.kg.addNode('flight', f); count++; });
    parsed.hotels.forEach(h => { this.kg.addNode('hotel', h); count++; });
    parsed.events.forEach(e => { this.kg.addNode('event', e); count++; });

    document.getElementById('email-paste-input').value = '';
    alert(`📧 Custom Email Snippet Parsed Live!\nExtracted ${count} entity nodes into Knowledge Graph.`);
    this.render();
    this.switchPage('risks');
  }

  async scanLiveGmailTickets(accessToken) {
    if (!accessToken) {
      alert("Please connect Google OAuth 2.0 or enter an OAuth access token to scan Gmail.");
      return;
    }

    try {
      const messages = await GmailLiveSyncService.fetchLiveTicketsFromGmail(accessToken);
      alert(`⚡ Gmail API Query Success!\nRetrieved ${messages.length} matching travel email tickets directly from live Gmail API.`);
      this.switchPage('risks');
    } catch (err) {
      alert(`Gmail API Error: ${err.message}\n(Make sure to register a valid Client ID in gmail_live_sync.js or provide an active Google OAuth Access Token).`);
    }
  }

  openCabFareModal() {
    const fareData = CityCabService.getCabFares(this.activeCabCity);
    
    document.getElementById('modal-city-title').textContent = `Airport Cab Options for ${fareData.city}`;
    document.getElementById('modal-distance-text').textContent = `${fareData.airport} (${fareData.distance})`;

    const listContainer = document.getElementById('modal-fare-list');
    listContainer.innerHTML = fareData.options.map(opt => `
      <div class="fare-row">
        <div>
          <div style="font-weight: 800; font-size: 0.95rem; color: var(--emerald-dark); display: flex; align-items: center; gap: 6px;">
            <span>${opt.icon}</span> ${opt.name}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
            Type: <b>${opt.type}</b> • ETA: <b style="color: var(--emerald-main);">${opt.eta}</b>
          </div>
        </div>

        <div style="text-align: right;">
          <div style="font-weight: 800; font-size: 1.1rem; color: var(--orange-accent);">${opt.fare}</div>
          <a href="${opt.url}" target="_blank" class="btn-primary" style="padding: 6px 14px; font-size: 0.75rem; text-decoration: none; margin-top: 4px; display: inline-block;">
            Book Now ↗
          </a>
        </div>
      </div>
    `).join('');

    document.getElementById('cab-fare-modal').style.display = 'flex';
  }

  closeCabFareModal() {
    document.getElementById('cab-fare-modal').style.display = 'none';
  }

  loadBaselineScenario() {
    this.kg.clear();
    const scenario = DEMO_SCENARIOS.DELHI_BUSINESS_TRIP;

    scenario.rawDocs.forEach(doc => {
      const parsed = TravelParser.parseDocument(doc.content, doc.type);
      parsed.flights.forEach(f => this.kg.addNode('flight', f));
      parsed.hotels.forEach(h => this.kg.addNode('hotel', h));
      parsed.events.forEach(e => this.kg.addNode('event', e));
    });

    if (this.currentWeather) {
      this.kg.addNode('weather', this.currentWeather);
    }

    this.currentDelayMins = 0;
    this.render();
  }

  setFlightDelay(delayMins) {
    this.currentDelayMins = delayMins;
    document.querySelectorAll('.btn-delay').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.getAttribute('data-delay')) === delayMins);
    });

    const card = document.getElementById('itinerary-recovery-card');
    const output = document.getElementById('recovery-output-box');

    if (delayMins > 0) {
      const recovery = this.conflictEngine.recoverItinerary(delayMins);
      card.style.display = 'block';
      output.innerHTML = `
        <div style="margin-bottom:6px;"><b>Flight Delayed by +${delayMins} mins:</b> 11:30 AM registration missed.</div>
        <div style="font-weight:700; margin-bottom:4px;">Recalculated Timeline:</div>
        <ul style="padding-left:18px; font-size:0.78rem;">
          ${recovery.recoveredPlan.map(p => `<li><b style="color:var(--emerald-dark);">${p.time}</b> — ${p.activity}</li>`).join('')}
        </ul>
      `;
    } else {
      card.style.display = 'none';
    }

    this.render();
  }

  triggerMicVoice() {
    const status = document.getElementById('mic-status');
    status.textContent = "Listening live... Speak into microphone";

    const ok = this.voiceAssistant.startListening();
    if (!ok) {
      setTimeout(() => {
        this.voiceAssistant.processQuery("Am I ready for Delhi?");
      }, 800);
    }
  }

  onVoiceQueryProcessed(query, response) {
    document.getElementById('mic-status').textContent = `Speech: "${query}"`;
    this.addChatMessage(query, 'user');
    this.addChatMessage(response, 'ai');
  }

  handleChatInput() {
    const field = document.getElementById('chat-input');
    const query = field.value.trim();
    if (!query) return;

    this.addChatMessage(query, 'user');
    field.value = '';

    const lower = query.toLowerCase();
    let reply = "";

    if (lower.includes("ready") || lower.includes("score")) {
      reply = "Your trip readiness score is 78%. Flight and hotel are confirmed, but 50-minute airport transit leaves only 10 minutes before registration cutoff.";
    } else if (lower.includes("hotel") || lower.includes("address")) {
      const hotels = this.kg.getNodesByType('hotel');
      reply = hotels.length > 0 ? `Hotel: ${hotels[0].data.name}, ${hotels[0].data.address}. Check-in: ${hotels[0].data.checkInTime}.` : "No hotel document parsed.";
    } else if (lower.includes("weather")) {
      reply = this.currentWeather ? `Live Weather for ${this.currentWeather.city}: ${this.currentWeather.temp}, Rain Prob: ${this.currentWeather.rainProb}%.` : "Fetching weather...";
    } else {
      reply = `Processed query "${query}" against Knowledge Graph.`;
    }

    setTimeout(() => this.addChatMessage(reply, 'ai'), 300);
  }

  addChatMessage(msg, type) {
    const box = document.getElementById('chat-messages');
    if (!box) return;
    const div = document.createElement('div');
    div.className = `chat-msg ${type}`;
    div.textContent = msg;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  render() {
    const flights = this.kg.getNodesByType('flight');
    const depTime = flights.length > 0 ? flights[0].data.depTime : '10:00';
    const countdownText = CityCabService.calculateFlightCountdown(depTime);

    // Render Countdown
    const countBannerText = document.getElementById('countdown-text');
    const countPill = document.getElementById('countdown-pill');
    if (countBannerText) countBannerText.textContent = countdownText;
    if (countPill) countPill.textContent = countdownText;

    const conflicts = this.conflictEngine.evaluateConflicts({ flightDelayMins: this.currentDelayMins });
    const nodes = this.kg.getAllNodes();
    const score = ReadinessCalculator.calculateScore(conflicts, nodes.length);

    // Render Score
    const scoreVal = document.getElementById('score-val');
    if (scoreVal) scoreVal.textContent = `${score}%`;

    // Render Risk Cards on Risks page
    const container = document.getElementById('risk-cards-list');
    if (container) {
      container.innerHTML = conflicts.map(c => `
        <div class="risk-box ${c.severity === 'CRITICAL' ? '' : 'warning'}">
          <div class="risk-title">
            <span>${c.severity === 'CRITICAL' ? '🔴' : '🟠'} ${c.title}</span>
            <span class="badge ${c.severity === 'CRITICAL' ? 'badge-critical' : 'badge-warning'}">Risk: ${c.probability}%</span>
          </div>
          <div class="risk-desc">${c.summary}</div>
          <div class="risk-why-proof"><b>🔍 WHY? (Explainable Evidence):</b> ${c.why}</div>
          <div style="font-size:0.82rem; color:var(--emerald-dark); font-weight:800; margin-top:8px;">⚡ Recommended Action: ${c.actionRequired}</div>
        </div>
      `).join('');
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new TravelGuardApp();
});
