import React from 'react';
import CasinoChip from './CasinoChip';
import type { ChipValue } from '../../types/card';

interface BettingAreaProps {
  totalBet: number;
  style?: React.CSSProperties;
}

const BettingArea: React.FC<BettingAreaProps> = ({ totalBet, style = {} }) => {
  // 베팅 금액을 칩으로 분해하는 함수
  const getChipBreakdown = (amount: number): { value: ChipValue; count: number }[] => {
    const chipValues: ChipValue[] = [1000, 500, 100, 50, 20, 10, 5];
    const breakdown: { value: ChipValue; count: number }[] = [];
    let remaining = amount;

    for (const value of chipValues) {
      if (remaining >= value) {
        const count = Math.floor(remaining / value);
        breakdown.push({ value, count });
        remaining -= count * value;
      }
    }

    return breakdown;
  };

  if (totalBet === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80px',
          ...style
        }}
      >
        <div style={{
          color: 'rgba(255,255,255,0.4)',
          fontSize: '1rem',
          fontFamily: 'Funnel Display, sans-serif',
          fontWeight: '500'
        }}>
          베팅 영역
        </div>
      </div>
    );
  }

  const chipBreakdown = getChipBreakdown(totalBet);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        minHeight: '80px',
        ...style
      }}
    >
      <div style={{
        color: '#d4af37',
        fontSize: '1.2rem',
        fontFamily: 'Funnel Display, sans-serif',
        fontWeight: '600',
        marginBottom: '5px'
      }}>
        ${totalBet}
      </div>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '5px',
        justifyContent: 'center',
        maxWidth: '200px'
      }}>
        {chipBreakdown.map(({ value, count }) => (
          <div key={value} style={{ position: 'relative' }}>
            {/* 칩 스택 효과 */}
            {Array.from({ length: Math.min(count, 5) }).map((_, index) => (
              <div
                key={index}
                style={{
                  position: index === 0 ? 'relative' : 'absolute',
                  left: index === 0 ? 0 : `${index * 2}px`,
                  top: index === 0 ? 0 : `${-index * 3}px`,
                  zIndex: 5 - index
                }}
              >
                <CasinoChip
                  value={value}
                  size="small"
                  style={{
                    filter: index > 0 ? 'brightness(0.9)' : 'none'
                  }}
                />
              </div>
            ))}
            {/* 칩 개수 표시 (5개 이상일 때) */}
            {count > 5 && (
              <div style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                zIndex: 10
              }}>
                {count}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BettingArea;
