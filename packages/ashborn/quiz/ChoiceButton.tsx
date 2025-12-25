import React from 'react';

export interface ChoiceButtonProps {
  label: string;
  value: number;
  selected: boolean;
  onPress: (value: number) => void;
}

export const ChoiceButton: React.FC<ChoiceButtonProps> = ({
  label,
  value,
  selected,
  onPress,
}) => {
  return (
    <button
      onClick={() => onPress(value)}
      className={`
        p-4 rounded-xl font-medium transition-all duration-300
        ${selected ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/70'}
      `}
    >
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-xs">{label}</div>
    </button>
  );
};

export default ChoiceButton;
