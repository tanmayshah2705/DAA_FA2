import { ExchangeRate } from './exchangeRates';

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  distance: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  rate: number;
  weight: number; // -log(rate)
}

export interface BellmanFordStep {
  type: 'init' | 'relax' | 'check-negative' | 'negative-cycle-found' | 'complete';
  iteration?: number;
  edge?: GraphEdge;
  fromNode?: string;
  toNode?: string;
  oldDistance?: number;
  newDistance?: number;
  distances: { [key: string]: number };
  relaxed?: boolean;
  negativeCycle?: string[];
  message: string;
}

export function createGraph(currencies: string[], rates: ExchangeRate[]): {
  nodes: GraphNode[];
  edges: GraphEdge[];
} {
  // Position nodes in a circle
  const nodes: GraphNode[] = currencies.map((currency, index) => {
    const angle = (index / currencies.length) * 2 * Math.PI - Math.PI / 2;
    const radius = 200;
    return {
      id: currency,
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      distance: Infinity
    };
  });

  // Create edges with weights as -log(rate)
  const edges: GraphEdge[] = rates.map(rate => ({
    from: rate.from,
    to: rate.to,
    rate: rate.rate,
    weight: -Math.log(rate.rate)
  }));

  return { nodes, edges };
}

export function* bellmanFordSteps(
  currencies: string[],
  edges: GraphEdge[],
  source: string
): Generator<BellmanFordStep> {
  const distances: { [key: string]: number } = {};
  const predecessors: { [key: string]: string | null } = {};

  // Initialize
  currencies.forEach(currency => {
    distances[currency] = currency === source ? 0 : Infinity;
    predecessors[currency] = null;
  });

  yield {
    type: 'init',
    distances: { ...distances },
    message: `Initialized: ${source} distance = 0, all others = ∞`
  };

  // Relax edges |V| - 1 times
  for (let i = 0; i < currencies.length - 1; i++) {
    let relaxedAny = false;

    for (const edge of edges) {
      const oldDistance = distances[edge.to];
      const newDistance = distances[edge.from] + edge.weight;

      if (distances[edge.from] !== Infinity && newDistance < distances[edge.to]) {
        distances[edge.to] = newDistance;
        predecessors[edge.to] = edge.from;
        relaxedAny = true;

        yield {
          type: 'relax',
          iteration: i + 1,
          edge,
          fromNode: edge.from,
          toNode: edge.to,
          oldDistance,
          newDistance,
          distances: { ...distances },
          relaxed: true,
          message: `Iteration ${i + 1}: Relaxed ${edge.from} → ${edge.to}. Distance updated: ${oldDistance.toFixed(4)} → ${newDistance.toFixed(4)} (rate: ${edge.rate.toFixed(4)})`
        };
      } else {
        yield {
          type: 'relax',
          iteration: i + 1,
          edge,
          fromNode: edge.from,
          toNode: edge.to,
          oldDistance,
          newDistance,
          distances: { ...distances },
          relaxed: false,
          message: `Iteration ${i + 1}: Checked ${edge.from} → ${edge.to}. No update needed (${newDistance.toFixed(4)} ≥ ${oldDistance.toFixed(4)})`
        };
      }
    }

    if (!relaxedAny) {
      yield {
        type: 'relax',
        iteration: i + 1,
        distances: { ...distances },
        message: `Iteration ${i + 1}: No edges relaxed. Early termination.`
      };
      break;
    }
  }

  // Check for negative cycles
  const negativeCycleEdges: GraphEdge[] = [];
  for (const edge of edges) {
    if (distances[edge.from] !== Infinity && 
        distances[edge.from] + edge.weight < distances[edge.to]) {
      negativeCycleEdges.push(edge);
      
      yield {
        type: 'check-negative',
        edge,
        distances: { ...distances },
        message: `Negative cycle check: Edge ${edge.from} → ${edge.to} can still be relaxed!`
      };
    }
  }

  if (negativeCycleEdges.length > 0) {
    // Find the actual cycle
    const cycle = findCycle(negativeCycleEdges, predecessors);
    
    // Calculate profit
    const profit = calculateCycleProfit(cycle, edges);
    
    yield {
      type: 'negative-cycle-found',
      negativeCycle: cycle,
      distances: { ...distances },
      message: `🎯 ARBITRAGE FOUND! Cycle: ${cycle.join(' → ')} → ${cycle[0]}. Profit: ${((profit - 1) * 100).toFixed(2)}%`
    };
  } else {
    yield {
      type: 'complete',
      distances: { ...distances },
      message: 'Algorithm complete. No arbitrage opportunities found.'
    };
  }
}

function findCycle(edges: GraphEdge[], predecessors: { [key: string]: string | null }): string[] {
  if (edges.length === 0) return [];
  
  const visited = new Set<string>();
  const cycle: string[] = [];
  
  let current = edges[0].from;
  
  // Follow predecessors until we find a cycle
  while (!visited.has(current)) {
    visited.add(current);
    cycle.push(current);
    const next = predecessors[current];
    if (!next) break;
    current = next;
  }
  
  // Extract the actual cycle
  const cycleStart = cycle.indexOf(current);
  if (cycleStart >= 0) {
    return cycle.slice(cycleStart);
  }
  
  return cycle.slice(0, 3); // Return at least some nodes
}

function calculateCycleProfit(cycle: string[], edges: GraphEdge[]): number {
  let product = 1;
  
  for (let i = 0; i < cycle.length; i++) {
    const from = cycle[i];
    const to = cycle[(i + 1) % cycle.length];
    const edge = edges.find(e => e.from === from && e.to === to);
    if (edge) {
      product *= edge.rate;
    }
  }
  
  return product;
}
