import React from 'react';
import { GameConfig } from '@/src/types';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { buttonVariants } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfigPanelProps {
  config: GameConfig;
  onChange: (config: GameConfig) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange }) => {
  return (
    <Popover>
      <PopoverTrigger className={cn(buttonVariants({ variant: "outline", size: "icon" }), "fixed top-4 right-4 z-50 bg-slate-900/50 border-slate-800")}>
        <Settings2 className="w-5 h-5 text-slate-400" />
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-slate-900 border-slate-800 text-slate-200">
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Game Configuration</h4>
            <p className="text-sm text-slate-400">Adjust the proof-of-concept parameters.</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Hand Size</Label>
                <span className="text-xs font-mono text-slate-500">{config.handSize}</span>
              </div>
              <Slider 
                value={[config.handSize]} 
                min={1} 
                max={10} 
                step={1} 
                onValueChange={(val: number[]) => onChange({ ...config, handSize: val[0] })}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Overlap Required</Label>
                <span className="text-xs font-mono text-slate-500">{config.overlapRequired}</span>
              </div>
              <Slider 
                value={[config.overlapRequired]} 
                min={0} 
                max={6} 
                step={1} 
                onValueChange={(val: number[]) => onChange({ ...config, overlapRequired: val[0] })}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
