import React, { useState, useEffect } from "react";
import type { Card } from "../../types/card";
import { getCardImageInfo } from "../../utils/cardUtils";
import { getCardImageSrc } from "../../utils/cardImages";

/**
 * 개별 카드를 렌더링하는 컴포넌트
 */
interface PlayingCardProps {
  card: Card;
  useHighRes?: boolean; // 고해상도 이미지 사용 여부
  backColor?: "blue" | "red"; // 카드 뒷면 색상
  onClick?: () => void; // 카드 클릭 이벤트
  className?: string; // 추가 CSS 클래스
  style?: React.CSSProperties; // 인라인 스타일
}

const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  useHighRes = false,
  backColor = "blue",
  onClick,
  className = "",
  style = {},
}) => {
  const [imageSrc, setImageSrc] = useState<string>("");
  const [imageError, setImageError] = useState<boolean>(false);

  // 카드 이미지 로드
  useEffect(() => {
    try {
      let filename: string;

      if (!card.isVisible) {
        // 카드 뒷면 이미지
        filename = `card-back-${backColor}.png`;
      } else {
        // 카드 앞면 이미지
        const imageInfo = getCardImageInfo(card, useHighRes, backColor);
        filename = imageInfo.filename;
      }

      // 정적 import를 사용하여 이미지 로드
      const imageSrc = getCardImageSrc(filename);
      if (imageSrc) {
        setImageSrc(imageSrc);
        setImageError(false);
      } else {
        console.error(`카드 이미지를 찾을 수 없습니다: ${filename}`);
        setImageError(true);
      }
    } catch (error) {
      console.error(`카드 이미지 로드 실패:`, error);
      setImageError(true);
    }
  }, [card, useHighRes, backColor]);

  // 카드가 보이지 않는 경우 (뒷면) - 이미지 로드가 완료되면 아래에서 처리
  if (!card.isVisible && !imageSrc && !imageError) {
    return (
      <div
        className={`card bg-blue-900 border-2 border-white rounded-lg flex items-center justify-center cursor-pointer ${className}`}
        style={style}
        onClick={onClick}
      >
        <div className="text-white text-xs font-bold">Loading...</div>
      </div>
    );
  }

  // 이미지 로드 에러 시 또는 이미지가 없을 때 대체 UI
  if (imageError || !imageSrc) {
    const suitSymbol = {
      hearts: "♥",
      diamonds: "♦",
      clubs: "♣",
      spades: "♠"
    }[card.suit];
    
    const suitColor = card.suit === "hearts" || card.suit === "diamonds" ? "text-red-500" : "text-black";
    
    return (
      <div
        className={`w-20 h-28 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer shadow-lg ${className}`}
        style={style}
        onClick={onClick}
      >
        {card.isVisible ? (
          <>
            <div className={`text-lg font-bold ${suitColor}`}>
              {card.rank.toUpperCase()}
            </div>
            <div className={`text-2xl ${suitColor}`}>
              {suitSymbol}
            </div>
          </>
        ) : (
          <div className="text-blue-600 text-xs font-bold text-center">
            CARD<br/>BACK
          </div>
        )}
      </div>
    );
  }

  // 정상적인 카드 이미지 렌더링
  return (
    <div
      className={`card cursor-pointer transition-transform hover:scale-105 ${className}`}
      style={style}
      onClick={onClick}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={
            card.isVisible
              ? `${card.rank} of ${card.suit}`
              : `Card back (${backColor})`
          }
          className="w-full h-full object-contain rounded-lg shadow-lg"
          draggable={false}
        />
      ) : (
        // 로딩 중 표시
        <div className="card bg-gray-200 border-2 border-gray-300 rounded-lg flex items-center justify-center animate-pulse">
          <div className="text-gray-500 text-xs">로딩중...</div>
        </div>
      )}
    </div>
  );
};

export default PlayingCard;
