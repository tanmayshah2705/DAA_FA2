import { Button } from './ui/button';
import { Card } from './ui/card';
import { Slider } from './ui/slider';
import { Play, Pause, SkipForward, SkipBack, RotateCcw } from 'lucide-react';

interface ControlPanelProps {
  isPlaying: boolean;
  currentStep: number;
  totalSteps: number;
  speed: number;
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onStepChange: (step: number) => void;
}

export function ControlPanel({
  isPlaying,
  currentStep,
  totalSteps,
  speed,
  onPlayPause,
  onStepForward,
  onStepBack,
  onReset,
  onSpeedChange,
  onStepChange
}: ControlPanelProps) {
  return (
    <Card className="p-4 bg-gray-900/50 border-gray-800">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <Button
            onClick={onReset}
            variant="outline"
            size="sm"
            className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={onStepBack}
              variant="outline"
              size="sm"
              disabled={currentStep === 0}
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300 disabled:opacity-30"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              onClick={onPlayPause}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>

            <Button
              onClick={onStepForward}
              variant="outline"
              size="sm"
              disabled={currentStep >= totalSteps - 1}
              className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300 disabled:opacity-30"
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Progress</span>
            <span className="text-gray-300">
              {currentStep + 1} / {totalSteps}
            </span>
          </div>
          <Slider
            value={[currentStep]}
            onValueChange={([value]) => onStepChange(value)}
            max={totalSteps - 1}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Animation Speed</span>
            <span className="text-gray-300">{speed.toFixed(1)}x</span>
          </div>
          <Slider
            value={[speed]}
            onValueChange={([value]) => onSpeedChange(value)}
            min={0.5}
            max={3}
            step={0.5}
            className="w-full"
          />
        </div>
      </div>
    </Card>
  );
}
