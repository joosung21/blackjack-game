import React from "react";
import type { Card } from "../../types/card";
import { calculateHandValue } from "../../utils/cardUtils";
import PlayingCard from "./PlayingCard";

/**
 * 카드 핸드(여러 장의 카드)를 렌더링하는 컴포넌트
 */
interface HandProps {
  cards: Card[];
  title?: string; // 핸드 제목 (예: "플레이어", "딜러")
  showScore?: boolean; // 점수 표시 여부
  useHighRes?: boolean; // 고해상도 이미지 사용 여부
  backColor?: "blue" | "red"; // 카드 뒷면 색상
  onCardClick?: (cardIndex: number) => void; // 카드 클릭 이벤트
  className?: string; // 추가 CSS 클래스
}

const Hand: React.FC<HandProps> = ({
  cards,
  title,
  showScore = true,
  useHighRes = false,
  backColor = "blue",
  onCardClick,
  className = "",
}) => {
  const visibleCards = cards.filter((card) => card.isVisible);
  const visibleHandValue = calculateHandValue(visibleCards);

  return (
    <div className={`hand-container ${className}`}>
      {/* 핸드 제목과 점수 */}
      {title && (
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          {showScore && (
            <div className="text-lg text-white">
              점수:{" "}
              <span className="font-bold text-yellow-300">
                {visibleHandValue}
              </span>
              {visibleCards.length !== cards.length && (
                <span className="text-gray-300 text-sm ml-2">
                  (숨겨진 카드 있음)
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* 카드들 */}
      <div className="flex flex-wrap gap-2 justify-center">
        {cards.length === 0 ? (
          <div className="text-gray-400 text-center py-8 opacity-30">
            카드가 없습니다
          </div>
        ) : (
          cards.map((card, index) => (
            <div
              key={`${card.suit}-${card.rank}-${index}`}
              className="relative"
              style={{
                marginLeft: index > 0 ? "-35px" : "0", // 카드 겹치기 효과 (더 큰 카드에 맞게 조정)
                zIndex: index,
              }}
            >
              <PlayingCard
                card={card}
                useHighRes={useHighRes}
                backColor={backColor}
                onClick={() => onCardClick?.(index)}
                className="transition-all duration-200 hover:translate-y-[-10px] hover:z-50"
              />
            </div>
          ))
        )}
      </div>

      {/* 추가 정보 */}
      {cards.length > 0 && showScore && (
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-300">카드 수: {cards.length}장</div>
          {visibleHandValue > 21 && (
            <div className="text-red-400 font-bold text-lg mt-2">
              버스트! 🎯
            </div>
          )}
          {visibleHandValue === 21 && cards.length === 2 && (
            <div className="text-yellow-400 font-bold text-lg mt-2">
              블랙잭! 🎉
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Hand;
