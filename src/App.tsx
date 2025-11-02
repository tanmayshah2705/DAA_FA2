import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { CurrencySelector } from './components/CurrencySelector';
import { CurrencyGraph } from './components/CurrencyGraph';
import { StepLog } from './components/StepLog';
import { ControlPanel } from './components/ControlPanel';
import { DistanceTable } from './components/DistanceTable';
import { CURRENCIES, fetchRealTimeRates, ExchangeRate } from './utils/exchangeRates';
import { createGraph, bellmanFordSteps, BellmanFordStep, GraphNode, GraphEdge } from './utils/bellmanFord';
import { RefreshCw, Info } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Alert, AlertDescription } from './components/ui/alert';
import { motion } from 'motion/react';

export default function App() {
  // Currency selection
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(['USD', 'EUR', 'GBP', 'JPY']);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(false);

  // Graph state
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [source, setSource] = useState<string>('USD');

  // Algorithm state
  const [allSteps, setAllSteps] = useState<BellmanFordStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Initialize or refresh rates
  const loadRates = async () => {
    setLoading(true);
    try {
      const rates = await fetchRealTimeRates(selectedCurrencies);
      setExchangeRates(rates);
      
      // Create graph
      const graph = createGraph(selectedCurrencies, rates);
      setNodes(graph.nodes);
      setEdges(graph.edges);

      // Set source to first currency
      const newSource = selectedCurrencies[0];
      setSource(newSource);

      // Run Bellman-Ford
      const steps: BellmanFordStep[] = [];
      const generator = bellmanFordSteps(selectedCurrencies, graph.edges, newSource);
      
      for (const step of generator) {
        steps.push(step);
      }
      
      setAllSteps(steps);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    } catch (error) {
      console.error('Error loading rates:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load rates when currencies change
  useEffect(() => {
    if (selectedCurrencies.length >= 2) {
      loadRates();
    }
  }, [selectedCurrencies]);

  // Auto-play
  useEffect(() => {
    if (!isPlaying || allSteps.length === 0) return;

    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev >= allSteps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, allSteps.length, speed]);

  const handlePlayPause = () => {
    if (currentStepIndex >= allSteps.length - 1) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleStepForward = () => {
    if (currentStepIndex < allSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setIsPlaying(false);
    }
  };

  const handleStepBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  };

  const currentStep = allSteps[currentStepIndex] || null;
  const currentDistances = currentStep?.distances || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-4xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Bellman-Ford Currency Arbitrage Visualizer
          </h1>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Explore how the Bellman-Ford algorithm detects arbitrage opportunities in currency exchange markets
            by finding negative cycles in weighted graphs
          </p>
        </motion.div>

        {/* Info Alert */}
        <Alert className="bg-blue-950/30 border-blue-800/50">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200 text-sm ml-2">
            <strong>How it works:</strong> Exchange rates are converted to weights using -log(rate). 
            A negative cycle in this weighted graph means multiplying exchange rates along the cycle yields profit {'>'}  1.
            This is arbitrage!
          </AlertDescription>
        </Alert>

        {/* Currency Selector */}
        <CurrencySelector
          availableCurrencies={CURRENCIES}
          selectedCurrencies={selectedCurrencies}
          onCurrenciesChange={setSelectedCurrencies}
        />

        {/* Control Panel */}
        {allSteps.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ControlPanel
                isPlaying={isPlaying}
                currentStep={currentStepIndex}
                totalSteps={allSteps.length}
                speed={speed}
                onPlayPause={handlePlayPause}
                onStepForward={handleStepForward}
                onStepBack={handleStepBack}
                onReset={handleReset}
                onSpeedChange={setSpeed}
                onStepChange={setCurrentStepIndex}
              />
            </div>
            <Button
              onClick={loadRates}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 h-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh Rates'}
            </Button>
          </div>
        )}

        {/* Main Content */}
        {allSteps.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Graph */}
            <div className="xl:col-span-2 space-y-4">
              <CurrencyGraph
                nodes={nodes}
                edges={edges}
                currentStep={currentStep}
                distances={currentDistances}
                source={source}
              />
            </div>

            {/* Right Column - Info */}
            <div className="space-y-4">
              <Tabs defaultValue="steps" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                  <TabsTrigger value="steps">Steps</TabsTrigger>
                  <TabsTrigger value="distances">Distances</TabsTrigger>
                </TabsList>
                
                <TabsContent value="steps" className="mt-4">
                  <div className="h-[600px]">
                    <StepLog steps={allSteps} currentStepIndex={currentStepIndex} />
                  </div>
                </TabsContent>
                
                <TabsContent value="distances" className="mt-4">
                  <DistanceTable
                    distances={currentDistances}
                    source={source}
                    highlightedNode={currentStep?.toNode}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">
            {selectedCurrencies.length < 2 ? (
              <p>Select at least 2 currencies to begin</p>
            ) : (
              <p>Loading algorithm...</p>
            )}
          </div>
        )}

        {/* Current Step Info */}
        {currentStep && currentStep.type === 'negative-cycle-found' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-700/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="text-4xl">🎯</div>
              <div>
                <h3 className="text-xl text-green-400">Arbitrage Opportunity Detected!</h3>
                <p className="text-green-200 mt-1">
                  {currentStep.message}
                </p>
                {currentStep.negativeCycle && (
                  <p className="text-sm text-green-300 mt-2 font-mono">
                    Path: {currentStep.negativeCycle.join(' → ')} → {currentStep.negativeCycle[0]}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
