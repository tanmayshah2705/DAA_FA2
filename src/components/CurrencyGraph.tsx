import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { GraphNode, GraphEdge, BellmanFordStep } from '../utils/bellmanFord';
import { Card } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface CurrencyGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  currentStep: BellmanFordStep | null;
  distances: { [key: string]: number };
  source: string;
}

export function CurrencyGraph({
  nodes,
  edges,
  currentStep,
  distances,
  source
}: CurrencyGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Center offset for the graph
  const centerX = 400;
  const centerY = 300;

  const isEdgeActive = (edge: GraphEdge): boolean => {
    if (!currentStep) return false;
    if (currentStep.type === 'relax' && currentStep.edge) {
      return (
        currentStep.edge.from === edge.from &&
        currentStep.edge.to === edge.to
      );
    }
    return false;
  };

  const isEdgeInCycle = (edge: GraphEdge): boolean => {
    if (!currentStep || currentStep.type !== 'negative-cycle-found' || !currentStep.negativeCycle) {
      return false;
    }
    const cycle = currentStep.negativeCycle;
    for (let i = 0; i < cycle.length; i++) {
      const from = cycle[i];
      const to = cycle[(i + 1) % cycle.length];
      if (edge.from === from && edge.to === to) {
        return true;
      }
    }
    return false;
  };

  const getNodeColor = (nodeId: string): string => {
    if (nodeId === source) return '#3b82f6'; // blue
    if (distances[nodeId] === Infinity) return '#6b7280'; // gray
    if (currentStep?.toNode === nodeId && currentStep?.relaxed) return '#10b981'; // green
    return '#8b5cf6'; // purple
  };

  const shouldPulse = (nodeId: string): boolean => {
    return currentStep?.toNode === nodeId && currentStep?.relaxed === true;
  };

  return (
    <Card className="bg-gray-900/50 border-gray-800 p-6 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-gray-200">Currency Exchange Graph</h3>
        <p className="text-sm text-gray-400 mt-1">
          Nodes represent currencies, edges show exchange rates
        </p>
      </div>

      <div ref={containerRef} className="flex-1 flex items-center justify-center overflow-hidden">
        <TooltipProvider>
          <svg
            ref={svgRef}
            width="800"
            height="600"
            viewBox="0 0 800 600"
            className="max-w-full h-auto"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3, 0 6"
                  fill="#4b5563"
                />
              </marker>
              <marker
                id="arrowhead-active"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3, 0 6"
                  fill="#3b82f6"
                />
              </marker>
              <marker
                id="arrowhead-cycle"
                markerWidth="10"
                markerHeight="10"
                refX="9"
                refY="3"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3, 0 6"
                  fill="#10b981"
                />
              </marker>

              <filter id="glow">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Edges */}
            {edges.map((edge, index) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              
              if (!fromNode || !toNode) return null;

              const x1 = centerX + fromNode.x;
              const y1 = centerY + fromNode.y;
              const x2 = centerX + toNode.x;
              const y2 = centerY + toNode.y;

              // Calculate offset for bidirectional edges
              const dx = x2 - x1;
              const dy = y2 - y1;
              const length = Math.sqrt(dx * dx + dy * dy);
              const offsetX = (dy / length) * 10;
              const offsetY = (-dx / length) * 10;

              const active = isEdgeActive(edge);
              const inCycle = isEdgeInCycle(edge);

              // Shorten the line to not overlap with node
              const shortenFactor = 30 / length;
              const x1Short = x1 + dx * shortenFactor + offsetX;
              const y1Short = y1 + dy * shortenFactor + offsetY;
              const x2Short = x2 - dx * shortenFactor + offsetX;
              const y2Short = y2 - dy * shortenFactor + offsetY;

              const midX = (x1Short + x2Short) / 2;
              const midY = (y1Short + y2Short) / 2;

              return (
                <g key={`${edge.from}-${edge.to}-${index}`}>
                  <motion.line
                    x1={x1Short}
                    y1={y1Short}
                    x2={x2Short}
                    y2={y2Short}
                    stroke={inCycle ? '#10b981' : active ? '#3b82f6' : '#4b5563'}
                    strokeWidth={inCycle ? 3 : active ? 2.5 : 1}
                    markerEnd={
                      inCycle
                        ? 'url(#arrowhead-cycle)'
                        : active
                        ? 'url(#arrowhead-active)'
                        : 'url(#arrowhead)'
                    }
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: 1,
                      opacity: inCycle ? 1 : active ? 0.9 : 0.3,
                    }}
                    transition={{ duration: 0.5 }}
                    filter={inCycle ? 'url(#glow)' : undefined}
                  />

                  {/* Animated dot for cycle */}
                  {inCycle && (
                    <circle
                      r="4"
                      fill="#10b981"
                      filter="url(#glow)"
                    >
                      <animateMotion
                        dur="2s"
                        repeatCount="indefinite"
                        path={`M ${x1Short} ${y1Short} L ${x2Short} ${y2Short}`}
                      />
                    </circle>
                  )}

                  {/* Edge label */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <g>
                        <rect
                          x={midX - 25}
                          y={midY - 10}
                          width="50"
                          height="20"
                          fill="#1f2937"
                          stroke={active ? '#3b82f6' : '#374151'}
                          strokeWidth={active ? 2 : 1}
                          rx="4"
                          opacity={0.9}
                        />
                        <text
                          x={midX}
                          y={midY + 4}
                          fill={active ? '#60a5fa' : '#9ca3af'}
                          fontSize="10"
                          textAnchor="middle"
                        >
                          {edge.rate.toFixed(3)}
                        </text>
                      </g>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-800 border-gray-700">
                      <div className="text-xs space-y-1">
                        <div>
                          <span className="text-gray-400">Rate:</span>{' '}
                          <span className="text-gray-200">{edge.rate.toFixed(4)}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Weight (-log):</span>{' '}
                          <span className="text-gray-200">{edge.weight.toFixed(4)}</span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const x = centerX + node.x;
              const y = centerY + node.y;
              const distance = distances[node.id];
              const pulse = shouldPulse(node.id);

              return (
                <Tooltip key={node.id}>
                  <TooltipTrigger asChild>
                    <g>
                      <motion.circle
                        cx={x}
                        cy={y}
                        r="25"
                        fill={getNodeColor(node.id)}
                        stroke={pulse ? '#10b981' : '#1f2937'}
                        strokeWidth={pulse ? 3 : 2}
                        initial={{ scale: 0 }}
                        animate={{
                          scale: pulse ? [1, 1.2, 1] : 1,
                        }}
                        transition={{
                          scale: pulse
                            ? { duration: 0.5, repeat: 2 }
                            : { duration: 0.5 }
                        }}
                        filter={pulse ? 'url(#glow)' : undefined}
                      />
                      <text
                        x={x}
                        y={y + 5}
                        fill="white"
                        fontSize="14"
                        textAnchor="middle"
                      >
                        {node.id}
                      </text>
                      <text
                        x={x}
                        y={y + 45}
                        fill="#9ca3af"
                        fontSize="10"
                        textAnchor="middle"
                      >
                        {distance === Infinity ? '∞' : distance.toFixed(2)}
                      </text>
                    </g>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 border-gray-700">
                    <div className="text-xs space-y-1">
                      <div className="text-gray-200">{node.id}</div>
                      <div>
                        <span className="text-gray-400">Distance:</span>{' '}
                        <span className="text-gray-200">
                          {distance === Infinity ? '∞' : distance.toFixed(4)}
                        </span>
                      </div>
                      {node.id === source && (
                        <div className="text-blue-400 text-xs">Source Node</div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </svg>
        </TooltipProvider>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-800 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-600"></div>
          <span className="text-gray-400">Source Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-purple-600"></div>
          <span className="text-gray-400">Reachable Node</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gray-600"></div>
          <span className="text-gray-400">Unreachable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-green-600"></div>
          <span className="text-gray-400">Arbitrage Cycle</span>
        </div>
      </div>
    </Card>
  );
}
