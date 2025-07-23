import React from "react";
import type { ChipValue } from '../../types/card';

interface CasinoChipProps {
  value: ChipValue;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  size?: "small" | "medium" | "large";
}

const CasinoChip: React.FC<CasinoChipProps> = ({
  value,
  onClick,
  className = "",
  style = {},
  size = "medium",
}) => {
  const sizeMap = {
    small: { width: "60px", height: "60px" },
    medium: { width: "80px", height: "80px" },
    large: { width: "100px", height: "100px" },
  };

  const chipSize = sizeMap[size];

  return (
    <div
      className={`casino-chip cursor-pointer transition-all duration-200 hover:scale-110 hover:drop-shadow-lg ${className}`}
      style={{
        ...chipSize,
        ...style,
      }}
      onClick={onClick}
    >
      <img
        src={`/src/assets/images/chips/chip-${value}.svg`}
        alt={`$${value} chip`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
        draggable={false}
      />
    </div>
  );
};

export default CasinoChip;
