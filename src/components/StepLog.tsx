import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { BellmanFordStep } from '../utils/bellmanFord';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle, Info, TrendingUp } from 'lucide-react';

interface StepLogProps {
  steps: BellmanFordStep[];
  currentStepIndex: number;
}

export function StepLog({ steps, currentStepIndex }: StepLogProps) {
  const displaySteps = steps.slice(0, currentStepIndex + 1);

  const getStepIcon = (type: BellmanFordStep['type']) => {
    switch (type) {
      case 'init':
        return <Info className="h-4 w-4" />;
      case 'relax':
        return <TrendingUp className="h-4 w-4" />;
      case 'check-negative':
        return <AlertCircle className="h-4 w-4" />;
      case 'negative-cycle-found':
        return <AlertCircle className="h-4 w-4" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getStepColor = (type: BellmanFordStep['type']) => {
    switch (type) {
      case 'init':
        return 'bg-purple-600/20 border-purple-500/30 text-purple-300';
      case 'relax':
        return 'bg-blue-600/20 border-blue-500/30 text-blue-300';
      case 'check-negative':
        return 'bg-yellow-600/20 border-yellow-500/30 text-yellow-300';
      case 'negative-cycle-found':
        return 'bg-green-600/20 border-green-500/30 text-green-300';
      case 'complete':
        return 'bg-gray-600/20 border-gray-500/30 text-gray-300';
    }
  };

  return (
    <Card className="h-full bg-gray-900/50 border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-gray-200">Algorithm Steps</h3>
        <p className="text-sm text-gray-400 mt-1">
          Step {currentStepIndex + 1} of {steps.length}
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {displaySteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`p-3 rounded-lg border ${
                    index === currentStepIndex
                      ? 'bg-blue-600/10 border-blue-500/50 ring-2 ring-blue-500/20'
                      : 'bg-gray-800/30 border-gray-700/50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <Badge className={`${getStepColor(step.type)} mt-0.5`}>
                      {getStepIcon(step.type)}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-200 break-words">
                        {step.message}
                      </p>
                      {step.iteration && (
                        <p className="text-xs text-gray-500 mt-1">
                          Iteration {step.iteration}
                        </p>
                      )}
                    </div>
                  </div>

                  {step.type === 'relax' && step.edge && (
                    <div className="mt-2 pt-2 border-t border-gray-700/50 text-xs font-mono">
                      <div className="grid grid-cols-2 gap-2 text-gray-400">
                        <div>Rate: {step.edge.rate.toFixed(4)}</div>
                        <div>Weight: {step.edge.weight.toFixed(4)}</div>
                      </div>
                    </div>
                  )}

                  {step.type === 'negative-cycle-found' && step.negativeCycle && (
                    <div className="mt-2 pt-2 border-t border-green-700/50">
                      <p className="text-xs text-green-400 font-mono">
                        Cycle: {step.negativeCycle.join(' → ')} → {step.negativeCycle[0]}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </Card>
  );
}
