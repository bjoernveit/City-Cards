import React from 'react';
import { Building2, Trees, Box, HelpCircle, Skull } from 'lucide-react';
import { ElementType } from '@/src/types';

interface ElementIconProps {
  type: ElementType;
  className?: string;
}

export const ElementIcon: React.FC<ElementIconProps> = ({ type, className = "" }) => {
  switch (type) {
    case 'city':
      return <Building2 className={`text-slate-400 ${className}`} />;
    case 'nature':
      return <Trees className={`text-emerald-400 ${className}`} />;
    case 'wood':
      return <Box className={`text-amber-600 ${className}`} />;
    case 'bricks':
      return <Box className={`text-red-600 ${className}`} />;
    case 'steel':
      return <Box className={`text-blue-400 ${className}`} />;
    case 'desert':
      return <Skull className={`text-yellow-700/40 ${className}`} />;
    default:
      return <HelpCircle className={`text-gray-300 ${className}`} />;
  }
};
