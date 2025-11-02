import { Card } from './ui/card';
import { motion } from 'motion/react';

interface DistanceTableProps {
  distances: { [key: string]: number };
  source: string;
  highlightedNode?: string;
}

export function DistanceTable({ distances, source, highlightedNode }: DistanceTableProps) {
  const currencies = Object.keys(distances).sort();

  return (
    <Card className="p-4 bg-gray-900/50 border-gray-800">
      <div className="mb-3">
        <h3 className="text-gray-200">Distance Table</h3>
        <p className="text-sm text-gray-400 mt-1">
          Current distances from {source}
        </p>
      </div>

      <div className="space-y-2">
        {currencies.map((currency) => {
          const distance = distances[currency];
          const isHighlighted = currency === highlightedNode;
          const isSource = currency === source;

          return (
            <motion.div
              key={currency}
              layout
              className={`p-2 rounded-lg border ${
                isHighlighted
                  ? 'bg-blue-600/20 border-blue-500/50'
                  : 'bg-gray-800/30 border-gray-700/50'
              }`}
              animate={
                isHighlighted
                  ? {
                      scale: [1, 1.02, 1],
                      transition: { duration: 0.3 }
                    }
                  : {}
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`${
                    isSource ? 'text-blue-400' : 'text-gray-300'
                  }`}>
                    {currency}
                  </span>
                  {isSource && (
                    <span className="text-xs text-blue-500 bg-blue-500/20 px-2 py-0.5 rounded">
                      source
                    </span>
                  )}
                </div>
                <span className="font-mono text-gray-300">
                  {distance === Infinity ? '∞' : distance.toFixed(4)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-800 text-xs text-gray-500">
        <p>💡 Tip: Negative values indicate potential profit paths</p>
        <p className="mt-1">
          Distance = sum of -log(exchange rates) along the path
        </p>
      </div>
    </Card>
  );
}
