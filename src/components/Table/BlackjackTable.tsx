import React from 'react';
import tableFabricPattern from '../../assets/patterns/table-fabric.svg';

/**
 * 블랙잭 테이블 컴포넌트 (Top View)
 */
interface BlackjackTableProps {
  children?: React.ReactNode; // 테이블 위에 올릴 컴포넌트들 (카드, 칩 등)
  className?: string;
}

const BlackjackTable: React.FC<BlackjackTableProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div 
      className={`blackjack-table relative w-full h-screen overflow-hidden ${className}`}
      style={{
        backgroundImage: `url(${tableFabricPattern})`,
        backgroundRepeat: 'repeat',
        backgroundSize: '100px 100px'
      }}
    >
      {/* 테이블 테두리 효과 */}
      <div className="absolute inset-0 shadow-inner pointer-events-none">
        {/* 상단 곡선 (딜러 영역) */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-4/5 h-32">
          <div 
            className="w-full h-full border-4 border-amber-700 rounded-b-full"
            style={{
              background: 'linear-gradient(180deg, #92400e 0%, #78350f 50%, #92400e 100%)',
              boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.3), 0 4px 12px rgba(0,0,0,0.4)'
            }}
          >
            {/* 딜러 영역 라벨 */}
            <div className="flex items-center justify-center h-full">
              <span className="text-yellow-200 font-bold text-lg tracking-wider">
                DEALER
              </span>
            </div>
          </div>
        </div>

        {/* 하단 곡선 (플레이어 영역) */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-24">
          <div 
            className="w-full h-full border-4 border-amber-700 rounded-t-full"
            style={{
              background: 'linear-gradient(0deg, #92400e 0%, #78350f 50%, #92400e 100%)',
              boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.3), 0 -4px 12px rgba(0,0,0,0.4)'
            }}
          >
            {/* 플레이어 영역 라벨 */}
            <div className="flex items-center justify-center h-full">
              <span className="text-yellow-200 font-bold text-lg tracking-wider">
                PLAYER
              </span>
            </div>
          </div>
        </div>

        {/* 좌측 테두리 */}
        <div 
          className="absolute left-0 top-0 w-8 h-full border-r-4 border-amber-700"
          style={{
            background: 'linear-gradient(90deg, #92400e 0%, #78350f 100%)',
            boxShadow: 'inset -4px 0 8px rgba(0,0,0,0.3)'
          }}
        />

        {/* 우측 테두리 */}
        <div 
          className="absolute right-0 top-0 w-8 h-full border-l-4 border-amber-700"
          style={{
            background: 'linear-gradient(270deg, #92400e 0%, #78350f 100%)',
            boxShadow: 'inset 4px 0 8px rgba(0,0,0,0.3)'
          }}
        />
      </div>

      {/* 테이블 중앙 게임 영역 */}
      <div className="absolute inset-8 top-32 bottom-24">
        {/* 베팅 영역 표시 */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
          <div 
            className="w-32 h-20 border-2 border-yellow-400 rounded-lg flex items-center justify-center"
            style={{
              background: 'rgba(255, 215, 0, 0.1)',
              boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
            }}
          >
            <span className="text-yellow-300 font-bold text-sm">
              BETTING<br/>AREA
            </span>
          </div>
        </div>

        {/* 카드 영역들 */}
        <div className="relative w-full h-full">
          {/* 딜러 카드 영역 */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-80 h-32">
            <div className="w-full h-full border-2 border-dashed border-white border-opacity-30 rounded-lg flex items-center justify-center">
              <span className="text-white text-opacity-50 text-sm">딜러 카드 영역</span>
            </div>
          </div>

          {/* 플레이어 카드 영역 */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-80 h-32">
            <div className="w-full h-full border-2 border-dashed border-white border-opacity-30 rounded-lg flex items-center justify-center">
              <span className="text-white text-opacity-50 text-sm">플레이어 카드 영역</span>
            </div>
          </div>
        </div>

        {/* 게임 컨텐츠 */}
        <div className="relative w-full h-full z-10">
          {children}
        </div>
      </div>

      {/* 테이블 조명 효과 */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.1) 70%, rgba(0,0,0,0.3) 100%)'
        }}
      />
    </div>
  );
};

export default BlackjackTable;
