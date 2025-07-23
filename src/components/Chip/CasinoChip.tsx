import React from "react";
import type { ChipValue } from '../../types/card';

// 칩 이미지 import
import chip5 from '../../assets/images/chips/chip-5.svg';
import chip10 from '../../assets/images/chips/chip-10.svg';
import chip20 from '../../assets/images/chips/chip-20.svg';
import chip50 from '../../assets/images/chips/chip-50.svg';
import chip100 from '../../assets/images/chips/chip-100.svg';
import chip500 from '../../assets/images/chips/chip-500.svg';
import chip1000 from '../../assets/images/chips/chip-1000.svg';

// 칩 이미지 매핑
const chipImages: Record<ChipValue, string> = {
  5: chip5,
  10: chip10,
  20: chip20,
  50: chip50,
  100: chip100,
  500: chip500,
  1000: chip1000,
};

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
        src={chipImages[value]}
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
