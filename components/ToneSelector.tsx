
import React from 'react';
import { ToneType } from '../types';

interface ToneSelectorProps {
  selectedTone: ToneType;
  onSelect: (tone: ToneType) => void;
}

const ToneSelector: React.FC<ToneSelectorProps> = ({ selectedTone, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {Object.values(ToneType).map((tone) => (
        <button
          key={tone}
          onClick={() => onSelect(tone)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selectedTone === tone
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
          }`}
        >
          {tone}
        </button>
      ))}
    </div>
  );
};

export default ToneSelector;
