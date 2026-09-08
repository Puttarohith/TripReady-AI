/**
 * Trip Readiness Calculator & Preparation Intelligence
 * Computes Readiness Score (0-100%) and derives Action Queue & Packing List
 */

export class ReadinessCalculator {
  static calculateScore(conflicts, nodesCount) {
    let score = 100;

    conflicts.forEach(c => {
      if (c.severity === 'CRITICAL') {
        score -= 20;
      } else if (c.severity === 'WARNING') {
        score -= 9;
      } else if (c.severity === 'INFO') {
        score -= 3;
      }
    });

    if (nodesCount < 3) {
      score -= 10; // Missing basic information completeness
    }

    return Math.max(10, Math.min(100, score));
  }

  static generateActionQueue(conflicts) {
    const actions = [];

    conflicts.forEach(c => {
      actions.push({
        id: 'act_' + c.id,
        priority: c.severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
        title: c.actionRequired,
        relatedConflict: c.title,
        status: 'PENDING'
      });
    });

    // Add baseline verified checks
    actions.push({ id: 'act_flight_pass', priority: 'DONE', title: 'Flight UK-814 Ticket & PNR Verified', status: 'COMPLETED' });
    actions.push({ id: 'act_hotel_vouch', priority: 'DONE', title: 'Grand Hyatt Hotel Voucher Saved Offline', status: 'COMPLETED' });
    actions.push({ id: 'act_id_doc', priority: 'DONE', title: 'Govt Photo ID / Conference QR Code Saved', status: 'COMPLETED' });

    return actions;
  }

  static generateContextualPackingList() {
    return {
      essential: [
        { item: 'Laptop & Charger (iQOO + Laptop Bridge)', checked: true },
        { item: 'Government ID Card & Conference QR Pass', checked: true },
        { item: 'Business Cards & Digital Portfolio link', checked: false },
        { item: 'Formal Business Casual Attire (2 sets)', checked: true }
      ],
      derivedFromItinerary: [
        { item: 'Compact Umbrella / Rain Shell (Rain forecast at 5 PM)', checked: false, reason: 'Weather forecast' },
        { item: '10,000mAh Power Bank (30-hr hackathon build session)', checked: false, reason: 'Long event schedule' },
        { item: 'Noise-Canceling Earbuds (Flight & Transit)', checked: true, reason: 'Travel comfort' }
      ]
    };
  }
}
