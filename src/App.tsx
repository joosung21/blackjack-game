import { useEffect, useCallback } from "react";
import CasinoChip from "./components/Chip/CasinoChip";
import BettingArea from "./components/Chip/BettingArea";
import SplitBettingArea from "./components/Chip/SplitBettingArea";
import SplitGameResultOverlay from "./components/Game/SplitGameResultOverlay";
import Hand from "./components/Card/Hand";
import MusicControl from "./components/Audio/MusicControl";
import { useBlackjackGame } from "./hooks/useBlackjackGame";
import {
  isBlackjack,
  createCard,
  RANKS,
  getHandDisplayValue,
} from "./utils/cardUtils";
import type { ChipValue } from "./types/card";

function App() {
  const {
    gameState,
    startNewGame,
    placeBet,
    clearBet,
    hit,
    stand,
    doubleDown,
    settleGame,
    split,
    switchToNextHand,
    canSplit,
    // Insurance 관련 함수들
    takeInsurance,
    declineInsurance,
    processInsurance,
    hideInsuranceResult,
    // Surrender 관련 함수
    surrender,
    // 개발자 모드 함수들
    toggleDevMode,
    setTestCards,
    clearTestCards,
    setTestDealerCards,
    clearTestDealerCards,
  } = useBlackjackGame();

  // 키보드 이벤트 핸들러
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // 개발자 모드에서는 키보드 조작 비활성화 (테스트 카드 설정 방해 방지)
      if (gameState.devMode) return;

      switch (event.code) {
        case "Enter":
          if (gameState.gameStatus === "waiting") {
            // 칩 배팅 상태에서 Enter: 현재 베팅이 있으면 그대로 시작, 없으면 이전 베팅금액으로 베팅하고 게임 시작
            if (gameState.bet > 0) {
              // 이미 베팅된 칩이 있다면 바로 게임 시작
              startNewGame();
            } else {
              // 베팅된 칩이 없다면 이전 베팅금액으로 베팅하고 게임 시작
              const lastBet = localStorage.getItem("lastBet");
              if (lastBet) {
                const betAmount = parseInt(lastBet);
                if (gameState.chips >= betAmount && betAmount >= 10) {
                  placeBet(betAmount as ChipValue);
                  // 약간의 지연 후 게임 시작 (베팅 애니메이션 완료 대기)
                  setTimeout(() => {
                    startNewGame();
                  }, 100);
                }
              }
            }
          } else if (
            gameState.gameStatus === "playing" &&
            !gameState.canInsurance
          ) {
            // 게임 중 Enter: HIT
            hit();
          } else if (
            ["playerWin", "dealerWin", "push", "playerBust"].includes(
              gameState.gameStatus
            )
          ) {
            // 게임 결과 오버레이 상태에서 Enter: 계속하기
            settleGame();
          }
          break;
        case "Space":
          if (gameState.gameStatus === "playing" && !gameState.canInsurance) {
            // 게임 중 스페이스: STAND
            event.preventDefault(); // 페이지 스크롤 방지
            stand();
          }
          break;
      }
    },
    [
      gameState.gameStatus,
      gameState.chips,
      gameState.canInsurance,
      gameState.devMode,
      placeBet,
      startNewGame,
      hit,
      stand,
      settleGame,
      takeInsurance,
      declineInsurance,
    ]
  );

  // 키보드 이벤트 리스너 등록
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleKeyPress]);

  // 베팅 시 마지막 베팅 금액 저장 (원래 베팅 금액만 저장)
  useEffect(() => {
    if (gameState.initialBet > 0) {
      localStorage.setItem("lastBet", gameState.initialBet.toString());
    }
  }, [gameState.initialBet]);

  // Insurance 처리 로직
  useEffect(() => {
    // Insurance 선택 후 또는 거부 후 딜러 블랙잭 체크
    if (
      (gameState.hasInsurance || !gameState.canInsurance) &&
      gameState.gameStatus === "playing" &&
      gameState.dealerHand.length === 2 &&
      gameState.dealerHand[0].rank === "ace"
    ) {
      // Insurance 결과 처리
      processInsurance();
    }
  }, [
    gameState.hasInsurance,
    gameState.canInsurance,
    gameState.gameStatus,
    gameState.dealerHand,
    processInsurance,
  ]);

  // 게임 상태 메시지
  const getGameStatusMessage = () => {
    // Insurance 결과 메시지 표시
    if (gameState.showInsuranceResult && gameState.insuranceResult) {
      if (gameState.insuranceResult === "lose") {
        const lostAmount = Math.floor(gameState.bet / 2);
        return `딜러가 블랙잭이 아닙니다. Insurance $${lostAmount}을 잃었습니다. 게임을 계속합니다.`;
      }
    }

    // Insurance 상태 체크
    if (gameState.canInsurance) {
      return "딜러가 A를 가지고 있습니다. Insurance를 선택하시겠습니까?";
    }

    if (gameState.isSplit && gameState.gameStatus === "playing") {
      if (gameState.currentHand === "main" && !gameState.mainHandComplete) {
        return "메인 핸드: HIT 또는 STAND를 선택하세요";
      } else if (
        gameState.currentHand === "split" &&
        !gameState.splitHandComplete
      ) {
        return "스플릿 핸드: HIT 또는 STAND를 선택하세요";
      }
    }

    switch (gameState.gameStatus) {
      case "waiting":
        return gameState.bet > 0
          ? "DEAL을 눌러 게임을 시작하세요"
          : "칩을 선택해 베팅하세요";
      case "playing":
        return "HIT 또는 STAND를 선택하세요";
      case "playerWin":
      case "dealerWin":
      case "push":
      case "playerBust":
        return "게임 종료";
      default:
        return "Ready";
    }
  };

  // 게임 결과 오버레이 렌더링 함수
  const renderGameResultOverlay = () => {
    // 스플릿 게임 결과 처리
    if (gameState.mainHandResult && gameState.splitHandResult) {
      return (
        <SplitGameResultOverlay
          mainHandResult={gameState.mainHandResult}
          splitHandResult={gameState.splitHandResult}
          mainBet={gameState.originalMainBet || gameState.bet}
          splitBet={gameState.originalSplitBet || gameState.splitBet}
          onClose={settleGame}
        />
      );
    }

    // 일반 게임 결과 처리
    if (
      !["playerWin", "dealerWin", "push", "playerBust"].includes(
        gameState.gameStatus
      )
    ) {
      return null;
    }

    const getResultData = () => {
      switch (gameState.gameStatus) {
        case "playerWin":
          // Surrender 결과 처리
          if (gameState.hasSurrendered) {
            const refundAmount = Math.floor(gameState.bet / 2);
            return {
              title: "Surrender",
              subtitle: `Surrender로 베팅 금액의 절반($${refundAmount})을 돌려받았습니다.`,
              color: "#f59e0b", // 노란색 (중립)
              showConfetti: false,
            };
          }

          const playerHasBlackjack = isBlackjack(gameState.playerHand);
          return {
            title: playerHasBlackjack ? "블랙잭!" : "승리!",
            subtitle: playerHasBlackjack
              ? `블랙잭! $${Math.floor(gameState.bet * 1.5)}을 획득했습니다!`
              : `축하합니다! $${gameState.bet}을 획득했습니다!`,
            color: "#22c55e",
            showConfetti: true,
          };
        case "dealerWin":
          // Insurance 결과에 따른 메시지 표시
          if (gameState.insuranceResult === "win") {
            // 딜러 블랙잭으로 Insurance 승리
            const insuranceAmount = Math.floor(gameState.bet / 2);
            const insuranceWin = insuranceAmount * 2; // 2:1 배당
            const totalInsurancePayout = insuranceAmount * 3; // 원금 + 2배 배당
            return {
              title: "딜러 블랙잭",
              subtitle: `딜러 블랙잭! Insurance로 $${insuranceWin}을 획득했습니다. (메인 베팅 $${gameState.bet} 손실, Insurance $${insuranceAmount} → $${totalInsurancePayout} 획득)`,
              color: "#f59e0b", // 노란색 (손익 상쇄)
              showConfetti: false,
            };
          }

          return {
            title: "패배",
            subtitle: `아쉽습니다. $${gameState.bet}을 잃었습니다.`,
            color: "#ef4444",
            showConfetti: false,
          };
        case "push":
          return {
            title: "무승부",
            subtitle: "베팅 금액이 반환됩니다.",
            color: "#f59e0b",
            showConfetti: false,
          };
        case "playerBust":
          return {
            title: "버스트!",
            subtitle: `21을 초과했습니다. $${gameState.bet}을 잃었습니다.`,
            color: "#ef4444",
            showConfetti: false,
          };
        default:
          return null;
      }
    };

    const resultData = getResultData();
    if (!resultData) return null;

    return (
      <div className="game-result-overlay" onClick={settleGame}>
        {/* 컴페티 효과 (승리시만) */}
        {resultData.showConfetti && (
          <>
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  top: "-20px",
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ["#22c55e", "#d4af37", "#3b82f6", "#f59e0b"][
                    Math.floor(Math.random() * 4)
                  ],
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </>
        )}

        <div className="game-result-content">
          <div
            className="game-result-title"
            style={{ color: resultData.color }}
          >
            {resultData.title}
          </div>
          <div className="game-result-subtitle" style={{ color: "white" }}>
            {resultData.subtitle}
          </div>
          <div
            style={{
              color: "rgba(255, 255, 255, 0.7)",
              fontSize: "1rem",
              fontFamily: "Orbitron, monospace",
              marginTop: "20px",
            }}
          >
            클릭하여 계속하기
          </div>
        </div>
      </div>
    );
  };

  // 게임 상태 색상
  const getStatusColor = () => {
    switch (gameState.gameStatus) {
      case "playerWin":
        return "#22c55e";
      case "dealerWin":
        return "#ef4444";
      case "playerBust":
        return "#ef4444";
      case "push":
        return "#f59e0b";
      default:
        return "#22c55e";
    }
  };
  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0d5f3c 0%, #0f7043 25%, #118149 50%, #0f7043 75%, #0d5f3c 100%)",
        position: "relative",
        fontFamily: "Funnel Display, sans-serif",
        overflow: "auto",
      }}
    >
      {/* 개발자 모드 토글 버튼 */}
      <button
        onClick={toggleDevMode}
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          padding: "8px 16px",
          backgroundColor: gameState.devMode ? "#ef4444" : "#6b7280",
          color: "white",
          border: "none",
          borderRadius: "6px",
          fontSize: "0.8rem",
          fontWeight: "600",
          cursor: "pointer",
          zIndex: 1000,
          fontFamily: "Funnel Display, sans-serif",
          transition: "all 0.2s ease",
          display: "none",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {gameState.devMode ? "DEV OFF" : "DEV ON"}
      </button>

      {/* 음악 제어 */}
      <MusicControl />

      {/* 상단 곡선 영역 - 블랙잭 규칙 */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          width: "90%",
          maxWidth: "800px",
          height: "100px",
          background: "linear-gradient(180deg, #d4af37 0%, #b8941f 100%)",
          borderRadius: "0 0 150px 150px",
          border: "2px solid #8b7355",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          fontFamily: "Funnel Display, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: "clamp(1.2rem, 4vw, 1.8rem)",
            fontWeight: "700",
            color: "#2d5016",
            textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
            marginBottom: "5px",
            fontFamily: "Funnel Display, sans-serif",
            textAlign: "center",
          }}
        >
          BLACKJACK PAYS 3 TO 2
        </div>
        <div
          style={{
            fontSize: "clamp(0.7rem, 2.5vw, 0.9rem)",
            color: "#2d5016",
            fontWeight: "500",
            fontFamily: "Funnel Display, sans-serif",
            textAlign: "center",
          }}
        >
          DEALER MUST STAND ON 17 AND DRAW TO 16
        </div>
      </div>

      {/* 하단 곡선 영역 - 인슈어런스 */}
      <div
        style={{
          position: "absolute",
          bottom: "0px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "80%",
          maxWidth: "600px",
          height: "60px",
          background: "linear-gradient(0deg, #d4af37 0%, #b8941f 100%)",
          borderRadius: "150px 150px 0 0",
          border: "2px solid #8b7355",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 -4px 15px rgba(0,0,0,0.3)",
          fontFamily: "Funnel Display, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: "clamp(1rem, 3.5vw, 1.5rem)",
            fontWeight: "700",
            color: "#2d5016",
            textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
            fontFamily: "Funnel Display, sans-serif",
            textAlign: "center",
          }}
        >
          INSURANCE PAYS 2 TO 1
        </div>
      </div>

      {/* 딜러 카드 영역 */}
      <div
        style={{
          position: "absolute",
          top: "120px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: "1rem",
            fontWeight: "600",
            fontFamily: "Funnel Display, sans-serif",
            marginBottom: "5px",
          }}
        >
          DEALER ({gameState.dealerScore})
        </div>
        <Hand
          cards={gameState.dealerHand}
          showScore={false}
          useHighRes={false}
          backColor="blue"
        />
      </div>

      {/* 베팅 영역 - 딜러와 플레이어 사이 */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1,
        }}
      >
        {gameState.isSplit ? (
          <SplitBettingArea
            mainBet={gameState.bet}
            splitBet={gameState.splitBet}
            currentHand={gameState.currentHand}
            mainHandComplete={gameState.mainHandComplete}
            splitHandComplete={gameState.splitHandComplete}
            style={{
              backgroundColor: "rgba(0,0,0,0.3)",
              padding: "20px",
              borderRadius: "15px",
              border: "2px solid rgba(212, 175, 55, 0.5)",
            }}
          />
        ) : (
          <BettingArea
            totalBet={gameState.bet}
            style={{
              backgroundColor: "rgba(0,0,0,0.3)",
              padding: "20px",
              borderRadius: "15px",
              border: "2px solid rgba(212, 175, 55, 0.5)",
              minWidth: "200px",
            }}
          />
        )}
      </div>

      {/* 플레이어 카드 영역 */}
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: gameState.isSplit ? "row" : "column",
          alignItems: "center",
          gap: gameState.isSplit ? "20px" : "10px",
        }}
      >
        {gameState.isSplit ? (
          <>
            {/* 메인 핸드 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  color: gameState.currentHand === "main" ? "#d4af37" : "#888",
                  fontSize: "1rem",
                  fontWeight: "600",
                  fontFamily: "Funnel Display, sans-serif",
                  marginBottom: "5px",
                  border:
                    gameState.currentHand === "main"
                      ? "2px solid #d4af37"
                      : "2px solid transparent",
                  padding: "5px 10px",
                  borderRadius: "8px",
                }}
              >
                메인 ({getHandDisplayValue(gameState.playerHand)})
                {gameState.mainHandComplete && (
                  <span style={{ color: "#4caf50", marginLeft: "5px" }}>✓</span>
                )}
              </div>
              <Hand
                cards={gameState.playerHand}
                showScore={false}
                useHighRes={false}
                backColor="blue"
              />
            </div>

            {/* 스플릿 핸드 */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  color: gameState.currentHand === "split" ? "#d4af37" : "#888",
                  fontSize: "1rem",
                  fontWeight: "600",
                  fontFamily: "Funnel Display, sans-serif",
                  marginBottom: "5px",
                  border:
                    gameState.currentHand === "split"
                      ? "2px solid #d4af37"
                      : "2px solid transparent",
                  padding: "5px 10px",
                  borderRadius: "8px",
                }}
              >
                스플릿 (
                {gameState.splitHand
                  ? getHandDisplayValue(gameState.splitHand)
                  : 0}
                )
                {gameState.splitHandComplete && (
                  <span style={{ color: "#4caf50", marginLeft: "5px" }}>✓</span>
                )}
              </div>
              <Hand
                cards={gameState.splitHand || []}
                showScore={false}
                useHighRes={false}
                backColor="blue"
              />
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                color: "#d4af37",
                fontSize: "1rem",
                fontWeight: "600",
                fontFamily: "Funnel Display, sans-serif",
                marginBottom: "5px",
              }}
            >
              PLAYER ({getHandDisplayValue(gameState.playerHand)})
            </div>
            <Hand
              cards={gameState.playerHand}
              showScore={false}
              useHighRes={false}
              backColor="blue"
            />
          </>
        )}
      </div>

      {/* 게임 컨트롤 버튼 */}
      <div
        style={{
          position: "absolute",
          right: "20px",
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          fontFamily: "Funnel Display, sans-serif",
        }}
        className="game-controls"
      >
        {[
          {
            action: "HIT",
            color: "#2d7d32",
            glow: "#4caf50",
            onClick: hit,
            disabled:
              gameState.gameStatus !== "playing" ||
              gameState.canInsurance ||
              (gameState.isSplit &&
                gameState.mainHandComplete &&
                gameState.splitHandComplete),
          },
          {
            action: "STAND",
            color: "#c62828",
            glow: "#f44336",
            onClick: stand,
            disabled:
              gameState.gameStatus !== "playing" || gameState.canInsurance,
          },
          {
            action: "DOUBLE",
            color: "#1565c0",
            glow: "#2196f3",
            onClick: doubleDown,
            disabled:
              gameState.gameStatus !== "playing" ||
              gameState.canInsurance ||
              gameState.playerHand.length !== 2 ||
              gameState.chips < gameState.bet ||
              (gameState.isSplit &&
                gameState.currentHand === "main" &&
                gameState.mainHandComplete) ||
              (gameState.isSplit &&
                gameState.currentHand === "split" &&
                gameState.splitHandComplete),
          },
          {
            action: "SPLIT",
            color: "#7b1fa2",
            glow: "#9c27b0",
            onClick: split,
            disabled:
              !canSplit() ||
              gameState.gameStatus !== "playing" ||
              gameState.canInsurance ||
              gameState.chips < gameState.bet,
          },
          {
            action: "SURRENDER",
            color: "#f57c00",
            glow: "#ff9800",
            onClick: surrender,
            disabled:
              !gameState.canSurrender ||
              gameState.gameStatus !== "playing" ||
              gameState.canInsurance,
          },
          // Insurance 버튼들
          ...(gameState.canInsurance
            ? [
                {
                  action: `INSURANCE ($${Math.floor(gameState.bet / 2)})`,
                  color: "#f57c00",
                  glow: "#ff9800",
                  onClick: takeInsurance,
                  disabled:
                    gameState.hasInsurance ||
                    gameState.chips < Math.floor(gameState.bet / 2),
                },
                {
                  action: "NO INSURANCE",
                  color: "#5d4037",
                  glow: "#8d6e63",
                  onClick: declineInsurance,
                  disabled: false,
                },
              ]
            : []),
          // Insurance 결과 메시지 표시 시 계속하기 버튼
          ...(gameState.showInsuranceResult
            ? [
                {
                  action: "계속하기",
                  color: "#22c55e",
                  glow: "#16a34a",
                  onClick: hideInsuranceResult,
                  disabled: false,
                },
              ]
            : []),
          ...(gameState.isSplit &&
          !gameState.mainHandComplete &&
          !gameState.splitHandComplete
            ? [
                {
                  action: "핸드 전환",
                  color: "#ff6f00",
                  glow: "#ff9800",
                  onClick: switchToNextHand,
                  disabled:
                    gameState.gameStatus !== "playing" ||
                    gameState.canInsurance,
                },
              ]
            : []),
        ].map((btn) => (
          <button
            key={btn.action}
            style={{
              padding: "16px 24px",
              background: btn.disabled
                ? `linear-gradient(145deg, #666, #333)`
                : `linear-gradient(145deg, ${btn.color}, #1a1a1a)`,
              color: btn.disabled ? "#999" : "white",
              border: `2px solid ${btn.disabled ? "#666" : btn.glow}`,
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: "700",
              fontFamily: "Orbitron, monospace",
              cursor: btn.disabled ? "not-allowed" : "pointer",
              minWidth: "100px",
              textShadow: btn.disabled ? "none" : `0 0 10px ${btn.glow}`,
              boxShadow: btn.disabled
                ? `0 0 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`
                : `0 0 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 15px ${btn.glow}40`,
              transition: "all 0.2s ease",
              position: "relative",
              overflow: "hidden",
              opacity: btn.disabled ? 0.5 : 1,
            }}
            onClick={btn.disabled ? undefined : btn.onClick}
            onMouseEnter={(e) => {
              if (btn.disabled) return;
              const target = e.target as HTMLButtonElement;
              target.style.transform = "scale(1.05)";
              target.style.boxShadow = `
                0 0 25px rgba(0,0,0,0.6),
                inset 0 1px 0 rgba(255,255,255,0.2),
                0 0 25px ${btn.glow}60
              `;
            }}
            onMouseLeave={(e) => {
              if (btn.disabled) return;
              const target = e.target as HTMLButtonElement;
              target.style.transform = "scale(1)";
              target.style.boxShadow = `
                0 0 20px rgba(0,0,0,0.5),
                inset 0 1px 0 rgba(255,255,255,0.1),
                0 0 15px ${btn.glow}40
              `;
            }}
            onMouseDown={(e) => {
              if (btn.disabled) return;
              const target = e.target as HTMLButtonElement;
              target.style.transform = "scale(0.95)";
            }}
            onMouseUp={(e) => {
              if (btn.disabled) return;
              const target = e.target as HTMLButtonElement;
              target.style.transform = "scale(1.05)";
            }}
          >
            <span
              style={{
                position: "relative",
                zIndex: 1,
              }}
            >
              {btn.action}
            </span>
            {/* 반짝이는 효과 */}
            <div
              style={{
                position: "absolute",
                top: "-50%",
                left: "-50%",
                width: "200%",
                height: "200%",
                background: `linear-gradient(45deg, transparent, ${btn.glow}20, transparent)`,
                animation: "shine 3s infinite",
                pointerEvents: "none",
              }}
            />
          </button>
        ))}
      </div>

      {/* 게임 정보 패널 */}
      <div
        style={{
          position: "absolute",
          left: "30px",
          top: "50%",
          transform: "translateY(-50%)",
          backgroundColor: "rgba(0,0,0,0.7)",
          padding: "20px",
          borderRadius: "12px",
          color: "white",
          fontFamily: "Funnel Display, sans-serif",
          minWidth: "150px",
        }}
      >
        <h3
          style={{
            margin: "0 0 15px 0",
            fontSize: "1.2rem",
            fontWeight: "600",
            color: "#d4af37",
          }}
        >
          GAME STATUS
        </h3>
        <div style={{ fontSize: "1rem", lineHeight: "1.6" }}>
          <div>
            Chips: <span style={{ color: "#d4af37" }}>${gameState.chips}</span>
          </div>
          <div>
            Bet: <span style={{ color: "#d4af37" }}>${gameState.bet}</span>
          </div>
          <div>
            Round:{" "}
            <span style={{ color: "#d4af37" }}>{gameState.gameCount}</span>
            {gameState.handCount > 1 && (
              <span style={{ color: "#ffa500" }}>
                {" "}
                ({gameState.handCount} 핸드)
              </span>
            )}
          </div>
          {gameState.hasInsurance && (
            <div>
              Insurance:{" "}
              <span style={{ color: "#ff9800" }}>
                ${gameState.insuranceBet}
              </span>
            </div>
          )}
          <div>
            Status:{" "}
            <span style={{ color: getStatusColor() }}>
              {getGameStatusMessage()}
            </span>
          </div>
        </div>
      </div>

      {/* 칩 테스트 영역 - 게임 대기 중일 때만 표시 */}
      {gameState.gameStatus === "waiting" && (
        <div
          style={{
            position: "absolute",
            right: "30px",
            bottom: "30px",
            backgroundColor: "rgba(21, 83, 44, 0.7)",
            padding: "20px",
            borderRadius: "12px",
            color: "white",
            fontFamily: "Funnel Display, sans-serif",
          }}
        >
          <h3
            style={{
              margin: "0 0 15px 0",
              fontSize: "1rem",
              fontWeight: "600",
              color: "#d4af37",
              textAlign: "center",
            }}
          >
            PLAYER CHIPS (${gameState.chips})
          </h3>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "15px",
              justifyContent: "center",
              maxWidth: "280px",
              marginBottom: "20px",
            }}
          >
            {([10, 20, 50, 100, 500, 1000] as ChipValue[]).map((value) => (
              <CasinoChip
                key={value}
                value={value}
                size="medium"
                onClick={() => {
                  if (
                    gameState.gameStatus === "waiting" &&
                    gameState.chips >= value
                  ) {
                    placeBet(value);
                  }
                }}
                style={{
                  opacity:
                    gameState.gameStatus === "waiting" &&
                    gameState.chips >= value
                      ? 1
                      : 0.5,
                  cursor:
                    gameState.gameStatus === "waiting" &&
                    gameState.chips >= value
                      ? "pointer"
                      : "not-allowed",
                }}
              />
            ))}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <button
              onClick={startNewGame}
              disabled={gameState.bet < 10}
              style={{
                padding: "10px 20px",
                backgroundColor: gameState.bet < 10 ? "#666" : "#22c55e",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.9rem",
                fontWeight: "600",
                fontFamily: "Orbitron, monospace",
                cursor: gameState.bet < 10 ? "not-allowed" : "pointer",
                boxShadow:
                  gameState.bet < 10
                    ? "none"
                    : "0 2px 8px rgba(34, 197, 94, 0.3)",
                opacity: gameState.bet < 10 ? 0.5 : 1,
              }}
            >
              DEAL {gameState.bet < 10 ? "(최소 $10)" : ""}
            </button>

            <button
              onClick={clearBet}
              style={{
                padding: "8px 16px",
                backgroundColor: "#444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: "600",
                fontFamily: "Orbitron, monospace",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
              }}
            >
              CLEAR BET
            </button>
          </div>
        </div>
      )}

      {/* 키보드 단축키 안내 */}
      {!gameState.devMode && (
        <div
          className="keyboard-shortcuts"
          style={{
            position: "fixed",
            bottom: "20px",
            left: "20px",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            color: "white",
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "0.75rem",
            lineHeight: "1.4",
            zIndex: 1000,
            maxWidth: "200px",
          }}
        >
          <div style={{ fontWeight: "600", marginBottom: "6px" }}>
            키보드 단축키
          </div>
          {gameState.gameStatus === "waiting" && (
            <div>
              <strong>Enter</strong>: 이전 베팅으로 게임 시작
              <br />
              <span style={{ fontSize: "0.65rem", opacity: 0.8 }}>
                (최소 $10 베팅 필요)
              </span>
            </div>
          )}

          {gameState.gameStatus === "playing" && !gameState.canInsurance && (
            <>
              <div>
                <strong>Enter</strong>: Hit
              </div>
              <div>
                <strong>Space</strong>: Stand
              </div>
            </>
          )}
          {["playerWin", "dealerWin", "push", "playerBust"].includes(
            gameState.gameStatus
          ) && (
            <div>
              <strong>Enter</strong>: 계속하기
            </div>
          )}
        </div>
      )}

      {/* 개발자 모드 */}
      {gameState.devMode && (
        <div
          style={{
            position: "absolute",
            left: "20px",
            top: "60px",
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            color: "white",
            padding: "15px",
            borderRadius: "8px",
            fontSize: "0.8rem",
            fontFamily: "Funnel Display, sans-serif",
            zIndex: 1000,
            minWidth: "300px",
            maxHeight: "400px",
            overflowY: "auto",
          }}
        >
          <h3 style={{ margin: "0 0 15px 0", fontSize: "1rem" }}>
            개발자 모드 - Insurance 테스트
          </h3>

          <div style={{ marginBottom: "15px" }}>
            <div style={{ marginBottom: "10px", fontWeight: "600" }}>
              플레이어 카드 설정:
            </div>

            {/* 첫 번째 카드 */}
            <div style={{ marginBottom: "10px" }}>
              <div style={{ marginBottom: "5px" }}>첫 번째 카드:</div>
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                {RANKS.map((rank) => (
                  <button
                    key={`card1-${rank}`}
                    onClick={() => {
                      const currentCard2 =
                        gameState.testCards?.[1] || createCard("spades", "2");
                      setTestCards(createCard("hearts", rank), currentCard2);
                    }}
                    style={{
                      padding: "4px 8px",
                      fontSize: "0.7rem",
                      backgroundColor:
                        gameState.testCards?.[0]?.rank === rank
                          ? "#ef4444"
                          : "#374151",
                      color: "white",
                      border: "1px solid #6b7280",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {rank.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* 두 번째 카드 */}
            <div style={{ marginBottom: "10px" }}>
              <div style={{ marginBottom: "5px" }}>두 번째 카드:</div>
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                {RANKS.map((rank) => (
                  <button
                    key={`card2-${rank}`}
                    onClick={() => {
                      const currentCard1 =
                        gameState.testCards?.[0] || createCard("hearts", "2");
                      setTestCards(currentCard1, createCard("spades", rank));
                    }}
                    style={{
                      padding: "4px 8px",
                      fontSize: "0.7rem",
                      backgroundColor:
                        gameState.testCards?.[1]?.rank === rank
                          ? "#ef4444"
                          : "#374151",
                      color: "white",
                      border: "1px solid #6b7280",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {rank.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* 빠른 스플릿 설정 버튼들 */}
            <div style={{ marginBottom: "10px" }}>
              <div style={{ marginBottom: "5px" }}>빠른 설정:</div>
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                <button
                  onClick={() =>
                    setTestCards(
                      createCard("hearts", "ace"),
                      createCard("spades", "ace")
                    )
                  }
                  style={{
                    padding: "6px 12px",
                    fontSize: "0.7rem",
                    backgroundColor: "#059669",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  A-A
                </button>
                <button
                  onClick={() =>
                    setTestCards(
                      createCard("hearts", "8"),
                      createCard("spades", "8")
                    )
                  }
                  style={{
                    padding: "6px 12px",
                    fontSize: "0.7rem",
                    backgroundColor: "#059669",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  8-8
                </button>
                <button
                  onClick={() =>
                    setTestCards(
                      createCard("hearts", "10"),
                      createCard("spades", "10")
                    )
                  }
                  style={{
                    padding: "6px 12px",
                    fontSize: "0.7rem",
                    backgroundColor: "#059669",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  10-10
                </button>
              </div>
            </div>

            {/* 딜러 카드 설정 */}
            <div
              style={{
                marginBottom: "15px",
                borderTop: "1px solid #374151",
                paddingTop: "15px",
              }}
            >
              <div style={{ marginBottom: "10px", fontWeight: "600" }}>
                딜러 카드 설정:
              </div>

              {/* 딜러 첫 번째 카드 */}
              <div style={{ marginBottom: "10px" }}>
                <div style={{ marginBottom: "5px" }}>
                  딜러 첫 번째 카드 (공개):
                </div>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {RANKS.map((rank) => (
                    <button
                      key={`dealer1-${rank}`}
                      onClick={() => {
                        const currentCard2 =
                          gameState.testDealerCards?.[1] ||
                          createCard("spades", "10");
                        setTestDealerCards(
                          createCard("hearts", rank),
                          currentCard2
                        );
                      }}
                      style={{
                        padding: "4px 8px",
                        fontSize: "0.7rem",
                        backgroundColor:
                          gameState.testDealerCards?.[0]?.rank === rank
                            ? "#f59e0b"
                            : "#374151",
                        color: "white",
                        border: "1px solid #6b7280",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      {rank.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* 딜러 두 번째 카드 */}
              <div style={{ marginBottom: "10px" }}>
                <div style={{ marginBottom: "5px" }}>
                  딜러 두 번째 카드 (숨김):
                </div>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  {RANKS.map((rank) => (
                    <button
                      key={`dealer2-${rank}`}
                      onClick={() => {
                        const currentCard1 =
                          gameState.testDealerCards?.[0] ||
                          createCard("hearts", "ace");
                        setTestDealerCards(
                          currentCard1,
                          createCard("spades", rank)
                        );
                      }}
                      style={{
                        padding: "4px 8px",
                        fontSize: "0.7rem",
                        backgroundColor:
                          gameState.testDealerCards?.[1]?.rank === rank
                            ? "#f59e0b"
                            : "#374151",
                        color: "white",
                        border: "1px solid #6b7280",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      {rank.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Insurance 테스트 빠른 설정 */}
              <div style={{ marginBottom: "10px" }}>
                <div style={{ marginBottom: "5px" }}>
                  빠른 Insurance 테스트:
                </div>
                <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => {
                      setTestDealerCards(
                        createCard("hearts", "ace"),
                        createCard("spades", "king")
                      );
                      setTestCards(
                        createCard("clubs", "10"),
                        createCard("diamonds", "5")
                      );
                    }}
                    style={{
                      padding: "6px 12px",
                      fontSize: "0.7rem",
                      backgroundColor: "#dc2626",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    딜러 블랙잭
                  </button>
                  <button
                    onClick={() => {
                      setTestDealerCards(
                        createCard("hearts", "ace"),
                        createCard("spades", "5")
                      );
                      setTestCards(
                        createCard("clubs", "10"),
                        createCard("diamonds", "8")
                      );
                    }}
                    style={{
                      padding: "6px 12px",
                      fontSize: "0.7rem",
                      backgroundColor: "#059669",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    딜러 블랙잭 X
                  </button>
                </div>
              </div>

              {/* 딜러 카드 표시 */}
              {gameState.testDealerCards && (
                <div
                  style={{
                    marginBottom: "10px",
                    padding: "8px",
                    backgroundColor: "rgba(245, 158, 11, 0.2)",
                    borderRadius: "4px",
                  }}
                >
                  <div style={{ fontSize: "0.7rem", marginBottom: "4px" }}>
                    딜러 카드:
                  </div>
                  <div style={{ fontWeight: "600" }}>
                    {gameState.testDealerCards[0].rank.toUpperCase()} ♥ +{" "}
                    {gameState.testDealerCards[1].rank.toUpperCase()} ♠
                  </div>
                </div>
              )}
            </div>

            {/* 현재 설정된 카드 표시 */}
            {gameState.testCards && (
              <div
                style={{
                  marginBottom: "10px",
                  padding: "8px",
                  backgroundColor: "rgba(34, 197, 94, 0.2)",
                  borderRadius: "4px",
                }}
              >
                <div style={{ fontSize: "0.7rem", marginBottom: "4px" }}>
                  설정된 카드:
                </div>
                <div style={{ fontWeight: "600" }}>
                  {gameState.testCards[0].rank.toUpperCase()} ♥ +{" "}
                  {gameState.testCards[1].rank.toUpperCase()} ♠
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={clearTestCards}
                style={{
                  padding: "8px 16px",
                  fontSize: "0.8rem",
                  backgroundColor: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                플레이어 초기화
              </button>
              <button
                onClick={clearTestDealerCards}
                style={{
                  padding: "8px 16px",
                  fontSize: "0.8rem",
                  backgroundColor: "#f59e0b",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                딜러 초기화
              </button>
            </div>
          </div>

          <div style={{ fontSize: "0.7rem", color: "#9ca3af" }}>
            Insurance 테스트: 딜러 첫 번째 카드를 A로 설정하고 DEAL을 눌러
            게임을 시작하세요.
            <br />
            빠른 설정 버튼을 사용하면 딜러 블랙잭 여부를 테스트할 수 있습니다.
          </div>
        </div>
      )}

      {/* 게임 결과 오버레이 */}
      {renderGameResultOverlay()}
    </div>
  );
}

export default App;
