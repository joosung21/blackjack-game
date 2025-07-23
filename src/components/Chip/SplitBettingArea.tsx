import React from "react";
import BettingArea from "./BettingArea";

interface SplitBettingAreaProps {
  mainBet: number;
  splitBet: number;
  currentHand: "main" | "split";
  mainHandComplete: boolean;
  splitHandComplete: boolean;
  style?: React.CSSProperties;
}

const SplitBettingArea: React.FC<SplitBettingAreaProps> = ({
  mainBet,
  splitBet,
  currentHand,
  mainHandComplete,
  splitHandComplete,
  style = {},
}) => {
  return (
    <div
      style={{
        display: "flex",
        gap: "40px",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    >
      {/* 메인 핸드 베팅 영역 */}
      <div style={{ position: "relative" }}>
        <div
          style={{
            color: "#d4af37",
            fontSize: "0.9rem",
            fontFamily: "Funnel Display, sans-serif",
            fontWeight: "600",
            textAlign: "center",
            marginBottom: "8px",
            opacity: currentHand === "main" ? 1 : 0.6,
          }}
        >
          메인 핸드
        </div>
        <BettingArea
          totalBet={mainBet}
          style={{
            border:
              currentHand === "main"
                ? "2px solid #d4af37"
                : "2px solid rgba(212, 175, 55, 0.3)",
            borderRadius: "10px",
            padding: "10px",
            backgroundColor:
              currentHand === "main"
                ? "rgba(212, 175, 55, 0.1)"
                : "rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s ease",
            opacity: mainHandComplete ? 0.7 : 1,
          }}
        />
        {/* 완료 표시 */}
        {mainHandComplete && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              color: "#22c55e",
              padding: "5px 10px",
              borderRadius: "5px",
              fontSize: "0.8rem",
              fontWeight: "bold",
              zIndex: 10,
              whiteSpace: "nowrap",
            }}
          >
            완료
          </div>
        )}
      </div>

      {/* 스플릿 핸드 베팅 영역 */}
      <div style={{ position: "relative" }}>
        <div
          style={{
            color: "#d4af37",
            fontSize: "0.9rem",
            fontFamily: "Funnel Display, sans-serif",
            fontWeight: "600",
            textAlign: "center",
            marginBottom: "8px",
            opacity: currentHand === "split" ? 1 : 0.6,
          }}
        >
          스플릿 핸드
        </div>
        <BettingArea
          totalBet={splitBet}
          style={{
            border:
              currentHand === "split"
                ? "2px solid #d4af37"
                : "2px solid rgba(212, 175, 55, 0.3)",
            borderRadius: "10px",
            padding: "10px",
            backgroundColor:
              currentHand === "split"
                ? "rgba(212, 175, 55, 0.1)"
                : "rgba(0, 0, 0, 0.2)",
            transition: "all 0.3s ease",
            opacity: splitHandComplete ? 0.7 : 1,
          }}
        />
        {/* 완료 표시 */}
        {splitHandComplete && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              color: "#22c55e",
              padding: "5px 10px",
              borderRadius: "5px",
              fontSize: "0.8rem",
              fontWeight: "bold",
              zIndex: 10,
              whiteSpace: "nowrap",
            }}
          >
            완료
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitBettingArea;
