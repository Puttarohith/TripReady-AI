/**
 * Travel Knowledge Graph
 * Maintains nodes (flights, hotels, events, weather, luggage) and edges (relational & temporal constraints)
 */

export class TravelKnowledgeGraph {
  constructor(tripName = "Delhi Business Trip", tripDates = "Sep 20–22, 2026") {
    this.trip = {
      id: 'trip_01',
      name: tripName,
      dates: tripDates,
      created: new Date().toISOString()
    };
    this.nodes = new Map(); // id -> node
    this.edges = []; // [{ from, to, relationship, metadata }]
  }

  addNode(type, data) {
    const node = {
      id: data.id || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: type, // 'flight', 'hotel', 'event', 'weather', 'baggage'
      data: data,
      updatedAt: new Date().toISOString()
    };
    this.nodes.set(node.id, node);
    return node;
  }

  addEdge(fromId, toId, relationship, metadata = {}) {
    this.edges.push({
      from: fromId,
      to: toId,
      relationship: relationship, // 'TRANSIT_TO', 'CHECKIN_BEFORE', 'SCHEDULED_DURING', 'DEPENDS_ON'
      metadata: metadata
    });
  }

  getNodesByType(type) {
    return Array.from(this.nodes.values()).filter(n => n.type === type);
  }

  getAllNodes() {
    return Array.from(this.nodes.values());
  }

  clear() {
    this.nodes.clear();
    this.edges = [];
  }

  /**
   * Export full knowledge graph view for explainability dashboard
   */
  exportGraphSummary() {
    const summary = [];
    this.nodes.forEach(node => {
      summary.push({
        id: node.id,
        type: node.type.toUpperCase(),
        details: node.data
      });
    });
    return {
      trip: this.trip,
      totalNodes: summary.length,
      totalEdges: this.edges.length,
      nodes: summary,
      edges: this.edges
    };
  }
}
