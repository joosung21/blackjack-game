import { useState, useCallback, useEffect } from "react";
import type { Card, GameState, ChipValue } from "../types/card";
import {
  createDeck,
  shuffleDeck,
  calculateHandValue,
  isBlackjack,
  isBust,
  canSplit,
} from "../utils/cardUtils";
import { useGameSounds } from "./useGameSounds";

export const useBlackjackGame = () => {
  const { playResultSound, playCardSound, playChipSound } = useGameSounds();
  
  const [gameState, setGameState] = useState<GameState>({
    playerHand: [],
    dealerHand: [],
    deck: [],
    playerScore: 0,
    dealerScore: 0,
    gameStatus: "waiting",
    bet: 0,
    initialBet: 0, // 게임 시작 시 원래 베팅 금액
    chips: 1000, // 시작 칩
    // 게임 카운터
    gameCount: 0,
    handCount: 1,
    // 스플릿 초기값
    isSplit: false,
    splitHand: [],
    splitScore: 0,
    splitBet: 0,
    currentHand: "main",
    mainHandComplete: false,
    splitHandComplete: false,
    // Insurance 초기값
    canInsurance: false,
    hasInsurance: false,
    insuranceBet: 0,
    // Surrender 초기값
    canSurrender: false,
    hasSurrendered: false,
    // 개발자 모드 초기값
    devMode: false,
  });

  // 새 게임 시작
  const startNewGame = useCallback(() => {
    setGameState((prev) => {
      const newDeck = shuffleDeck(createDeck());

      // 개발자 모드에서 테스트 카드가 설정되어 있으면 사용
      const playerHand: Card[] =
        prev.devMode && prev.testCards
          ? [
              { ...prev.testCards[0], isVisible: true },
              { ...prev.testCards[1], isVisible: true },
            ]
          : [
              { ...newDeck[0], isVisible: true },
              { ...newDeck[1], isVisible: true },
            ];

      const dealerHand: Card[] =
        prev.devMode && prev.testDealerCards
          ? [
              { ...prev.testDealerCards[0], isVisible: true },
              { ...prev.testDealerCards[1], isVisible: false }, // 딜러 두 번째 카드는 뒷면
            ]
          : [
              { ...newDeck[2], isVisible: true },
              { ...newDeck[3], isVisible: false }, // 딜러 두 번째 카드는 뒷면
            ];

      const playerScore = calculateHandValue(playerHand);
      const dealerScore = calculateHandValue([dealerHand[0]]); // 첫 번째 카드만 계산
      const fullDealerScore = calculateHandValue(dealerHand); // 딜러의 전체 점수

      // 블랙잭 체크
      const playerHasBlackjack = isBlackjack(playerHand);
      const dealerHasBlackjack = isBlackjack(dealerHand);

      // Insurance 가능 여부 확인 (딜러 첫 번째 카드가 A인 경우)
      const canInsurance = dealerHand[0].rank === 'ace' && !playerHasBlackjack;

      let gameStatus: GameState["gameStatus"] = "playing";

      // Insurance가 가능한 경우 게임을 즉시 끝내지 않음
      if (canInsurance) {
        // Insurance 단계로 진행 - 딜러 블랙잭 여부는 나중에 확인
        gameStatus = "playing";
      } else if (playerHasBlackjack && dealerHasBlackjack) {
        // 둘 다 블랙잭: 무승부
        gameStatus = "push";
      } else if (playerHasBlackjack) {
        // 플레이어만 블랙잭: 플레이어 승 (1.5배 배당)
        gameStatus = "playerWin";
      } else if (dealerHasBlackjack) {
        // 딜러만 블랙잭: 딜러 승 (Insurance 불가능한 상황에서만)
        gameStatus = "dealerWin";
      }

      // Insurance가 가능한 경우 딜러 카드를 공개하지 않음
      const finalDealerHand = canInsurance 
        ? dealerHand  // Insurance 단계에서는 두 번째 카드 숨김 유지
        : (playerHasBlackjack || dealerHasBlackjack)
          ? dealerHand.map((card) => ({ ...card, isVisible: true }))
          : dealerHand;
      
      const finalDealerScore = canInsurance 
        ? dealerScore  // Insurance 단계에서는 첫 번째 카드만 점수 계산
        : (playerHasBlackjack || dealerHasBlackjack)
          ? fullDealerScore
          : dealerScore;

      return {
        ...prev,
        playerHand,
        dealerHand: finalDealerHand,
        playerScore,
        dealerScore: finalDealerScore,
        gameStatus,
        deck: newDeck.slice(4), // 처음 4장 제거
        gameStarted: true,
        initialBet: prev.bet, // 게임 시작 시 원래 베팅 금액 저장
        // 스플릿 관련 초기화
        isSplit: false,
        splitHand: [],
        splitScore: 0,
        splitBet: 0,
        currentHand: "main",
        mainHandComplete: false,
        splitHandComplete: false,
        mainHandResult: undefined,
        splitHandResult: undefined,
        // 결과 표시용 원래 베팅 금액 초기화
        originalMainBet: undefined,
        originalSplitBet: undefined,
        // Insurance 관련 초기화
        canInsurance,
        hasInsurance: false,
        insuranceBet: 0,
        insuranceResult: undefined,
        showInsuranceResult: false,
        // Surrender 관련 초기화 (첫 두 장일 때만 가능, 블랙잭이나 Insurance 상황 아닐 때)
        canSurrender: !playerHasBlackjack && !dealerHasBlackjack && !canInsurance,
        hasSurrendered: false,
        surrenderResult: undefined,
        // 게임 카운터 업데이트
        gameCount: prev.gameCount + 1,
        handCount: 1, // 새 게임 시작 시 메인 핸드만 있음
        // 게임 시작 시 테스트 카드 초기화 (한 번만 사용)
        testCards: undefined,
        testDealerCards: undefined,
      };
    });
  }, []);

  // 베팅
  const placeBet = useCallback((chipValue: ChipValue) => {
    // 칩 베팅 소리 재생
    playChipSound();
    
    setGameState((prev) => ({
      ...prev,
      bet: prev.bet + chipValue,
      chips: prev.chips - chipValue,
    }));
  }, [playChipSound]);

  // 베팅 초기화
  const clearBet = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      chips: prev.chips + prev.bet,
      bet: 0,
    }));
  }, []);

  // HIT
  const hit = useCallback(() => {
    // 카드 뽑는 소리 재생
    playCardSound();
    
    setGameState((prev) => {
      if (prev.gameStatus !== "playing" || prev.deck.length === 0) return prev;

      const newCard = { ...prev.deck[0], isVisible: true };
      const newDeck = prev.deck.slice(1);

      let newPlayerHand: Card[];
      let newSplitHand: Card[] = prev.splitHand;
      let newPlayerScore: number;
      let newSplitScore: number = prev.splitScore;
      let newGameStatus: GameState["gameStatus"] = prev.gameStatus;
      let newCurrentHand = prev.currentHand;
      let newMainHandComplete = prev.mainHandComplete;
      let newSplitHandComplete = prev.splitHandComplete;

      if (prev.isSplit) {
        if (prev.currentHand === "main" && !prev.mainHandComplete) {
          // 메인 핸드에 카드 추가
          newPlayerHand = [...prev.playerHand, newCard];
          newPlayerScore = calculateHandValue(newPlayerHand);

          if (isBust(newPlayerHand)) {
            newMainHandComplete = true;
            newCurrentHand = "split";
          }
        } else if (prev.currentHand === "split" && !prev.splitHandComplete) {
          // 스플릿 핸드에 카드 추가
          newPlayerHand = prev.playerHand;
          newPlayerScore = prev.playerScore;
          newSplitHand = [...prev.splitHand, newCard];
          newSplitScore = calculateHandValue(newSplitHand);

          if (isBust(newSplitHand)) {
            newSplitHandComplete = true;
          }
        } else {
          return prev; // 이미 완료된 핸드
        }

        // 두 핸드 모두 완료되면 딜러 턴
        if (newMainHandComplete && newSplitHandComplete) {
          newGameStatus = "dealerTurn";
        }
      } else {
        // 일반 게임
        newPlayerHand = [...prev.playerHand, newCard];
        newPlayerScore = calculateHandValue(newPlayerHand);

        if (isBust(newPlayerHand)) {
          newGameStatus = "playerBust";
        }
      }

      return {
        ...prev,
        playerHand: newPlayerHand,
        splitHand: newSplitHand,
        playerScore: newPlayerScore,
        splitScore: newSplitScore,
        deck: newDeck,
        gameStatus: newGameStatus,
        currentHand: newCurrentHand,
        mainHandComplete: newMainHandComplete,
        splitHandComplete: newSplitHandComplete,
        // HIT 후에는 Surrender 불가능
        canSurrender: false,
      };
    });
  }, [playCardSound]);

  // STAND
  const stand = useCallback(() => {
    setGameState((prev) => {
      if (prev.gameStatus !== "playing") return prev;

      let newCurrentHand = prev.currentHand;
      let newMainHandComplete = prev.mainHandComplete;
      let newSplitHandComplete = prev.splitHandComplete;
      let newGameStatus: GameState["gameStatus"] = prev.gameStatus;

      if (prev.isSplit) {
        if (prev.currentHand === "main" && !prev.mainHandComplete) {
          newMainHandComplete = true;
          newCurrentHand = "split";
        } else if (prev.currentHand === "split" && !prev.splitHandComplete) {
          newSplitHandComplete = true;
        }

        // 두 핸드 모두 완료되면 딜러 턴
        if (newMainHandComplete && newSplitHandComplete) {
          newGameStatus = "dealerTurn";
        }
      } else {
        // 일반 게임에서는 바로 딜러 턴
        newGameStatus = "dealerTurn";
      }

      return {
        ...prev,
        gameStatus: newGameStatus,
        currentHand: newCurrentHand,
        mainHandComplete: newMainHandComplete,
        splitHandComplete: newSplitHandComplete,
        // STAND 후에는 Surrender 불가능
        canSurrender: false,
      };
    });
  }, []);

  // 딜러 턴 처리
  const processDealerTurn = useCallback(() => {
    setGameState((prev) => {
      if (prev.gameStatus !== "dealerTurn") return prev;

      let dealerHand = prev.dealerHand.map((card) => ({
        ...card,
        isVisible: true,
      }));
      let deck = prev.deck;

      // 딜러는 17 이상이 될 때까지 카드를 뽑음
      while (calculateHandValue(dealerHand) < 17 && deck.length > 0) {
        const newCard = { ...deck[0], isVisible: true };
        dealerHand = [...dealerHand, newCard];
        deck = deck.slice(1);
      }

      const dealerScore = calculateHandValue(dealerHand);
      const playerScore = prev.playerScore;
      const splitScore = prev.splitScore;

      // 게임 결과 결정
      let gameStatus: GameState["gameStatus"];

      if (prev.isSplit) {
        // 스플릿 게임의 정확한 결과 계산
        const mainBust = isBust(prev.playerHand);
        const splitBust = isBust(prev.splitHand);
        const dealerBust = isBust(dealerHand);

        // 각 핸드별 결과 계산
        let mainResult: "win" | "lose" | "push";
        let splitResult: "win" | "lose" | "push";

        // 메인 핸드 결과
        if (mainBust) {
          mainResult = "lose";
        } else if (dealerBust) {
          mainResult = "win";
        } else if (playerScore > dealerScore) {
          mainResult = "win";
        } else if (playerScore < dealerScore) {
          mainResult = "lose";
        } else {
          mainResult = "push"; // 동점
        }

        // 스플릿 핸드 결과
        if (splitBust) {
          splitResult = "lose";
        } else if (dealerBust) {
          splitResult = "win";
        } else if (splitScore > dealerScore) {
          splitResult = "win";
        } else if (splitScore < dealerScore) {
          splitResult = "lose";
        } else {
          splitResult = "push"; // 동점
        }

        // 전체 게임 상태 결정
        if (mainResult === "win" && splitResult === "win") {
          gameStatus = "playerWin";
        } else if (mainResult === "lose" && splitResult === "lose") {
          gameStatus = "dealerWin";
        } else if (mainResult === "push" && splitResult === "push") {
          gameStatus = "push"; // 둘 다 동점
        } else {
          // 스플릿에서 승부가 갈린 경우 (승리+패배, 승리+동점, 패배+동점 등)
          // 이런 경우는 실제로는 각 핸드별로 개별 처리되어야 하지만,
          // 현재 UI 구조상 전체 결과가 필요하므로 동점으로 처리
          gameStatus = "push";
        }
      } else {
        // 일반 게임
        const playerBust = isBust(prev.playerHand);
        const dealerBust = isBust(dealerHand);

        if (playerBust) {
          gameStatus = "playerBust";
        } else if (dealerBust) {
          gameStatus = "playerWin";
        } else if (playerScore > dealerScore) {
          gameStatus = "playerWin";
        } else if (playerScore < dealerScore) {
          gameStatus = "dealerWin";
        } else {
          gameStatus = "push";
        }
      }

      return {
        ...prev,
        dealerHand,
        dealerScore,
        deck,
        gameStatus,
      };
    });
  }, []);

  // dealerTurn 상태일 때 자동으로 딜러 턴 처리
  useEffect(() => {
    if (gameState.gameStatus === "dealerTurn") {
      const timer = setTimeout(() => {
        processDealerTurn();
      }, 100); // 딜레이로 자연스러운 게임 진행

      return () => clearTimeout(timer);
    }
  }, [gameState.gameStatus, processDealerTurn]);

  // 게임 결과에 따른 사운드 재생
  useEffect(() => {
    const playGameResultSound = () => {
      switch (gameState.gameStatus) {
        case "playerWin":
          playResultSound("win");
          break;
        case "dealerWin":
        case "playerBust":
          playResultSound("lose");
          break;
        case "push":
          playResultSound("lose"); // 무승부도 패배 소리 사용
          break;
      }
    };

    // 게임이 끝났을 때만 사운드 재생
    if (['playerWin', 'dealerWin', 'playerBust', 'push'].includes(gameState.gameStatus)) {
      // 약간의 딜레이를 두어 자연스럽게 재생
      const timer = setTimeout(playGameResultSound, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.gameStatus, playResultSound]);

  // DOUBLE DOWN
  const doubleDown = useCallback(() => {
    setGameState((prev) => {
      if (
        prev.gameStatus !== "playing" ||
        prev.playerHand.length !== 2 ||
        prev.chips < prev.bet
      ) {
        return prev;
      }

      // 현재 베팅 금액을 저장 (칩에서 차감하기 위해)
      const currentBet = prev.bet;

      const newCard = { ...prev.deck[0], isVisible: true };
      const newPlayerHand = [...prev.playerHand, newCard];
      const newPlayerScore = calculateHandValue(newPlayerHand);
      const newDeck = prev.deck.slice(1);

      let gameStatus: GameState["gameStatus"];
      if (isBust(newPlayerHand)) {
        gameStatus = "playerBust";
      } else {
        gameStatus = "dealerTurn";
      }

      // 베팅 금액을 두 배로 늘리고, 추가 베팅 금액만큼 칩에서 차감
      return {
        ...prev,
        playerHand: newPlayerHand,
        playerScore: newPlayerScore,
        deck: newDeck,
        bet: currentBet * 2, // 베팅 금액 두 배로 증가
        chips: prev.chips - currentBet, // 추가 베팅 금액만큼 칩에서 차감
        gameStatus,
        // DOUBLE DOWN 후에는 Surrender 불가능
        canSurrender: false,
      };
    });
  }, []);

  // 게임 정산
  const settleGame = useCallback(() => {
    setGameState((prev) => {
      let winnings = 0;

      if (prev.isSplit) {
        // 스플릿 게임의 경우 각 핸드별로 개별 계산
        const dealerScore = prev.dealerScore;
        const mainBust = isBust(prev.playerHand);
        const splitBust = isBust(prev.splitHand);
        const dealerBust = isBust(prev.dealerHand);

        // 메인 핸드 결과 및 상금
        let mainWinnings = 0;
        let mainHandResult: "win" | "lose" | "push" | "bust";
        if (mainBust) {
          mainWinnings = 0;
          mainHandResult = "bust";
        } else if (dealerBust) {
          const mainHasBlackjack = isBlackjack(prev.playerHand);
          mainWinnings = mainHasBlackjack
            ? Math.floor(prev.bet * 2.5)
            : prev.bet * 2;
          mainHandResult = "win";
        } else if (prev.playerScore > dealerScore) {
          const mainHasBlackjack = isBlackjack(prev.playerHand);
          mainWinnings = mainHasBlackjack
            ? Math.floor(prev.bet * 2.5)
            : prev.bet * 2;
          mainHandResult = "win";
        } else if (prev.playerScore === dealerScore) {
          mainWinnings = prev.bet;
          mainHandResult = "push";
        } else {
          mainWinnings = 0;
          mainHandResult = "lose";
        }

        // 스플릿 핸드 결과 및 상금
        let splitWinnings = 0;
        let splitHandResult: "win" | "lose" | "push" | "bust";
        if (splitBust) {
          splitWinnings = 0;
          splitHandResult = "bust";
        } else if (dealerBust) {
          const splitHasBlackjack = isBlackjack(prev.splitHand);
          splitWinnings = splitHasBlackjack
            ? Math.floor(prev.splitBet * 2.5)
            : prev.splitBet * 2;
          splitHandResult = "win";
        } else if (prev.splitScore > dealerScore) {
          const splitHasBlackjack = isBlackjack(prev.splitHand);
          splitWinnings = splitHasBlackjack
            ? Math.floor(prev.splitBet * 2.5)
            : prev.splitBet * 2;
          splitHandResult = "win";
        } else if (prev.splitScore === dealerScore) {
          splitWinnings = prev.splitBet;
          splitHandResult = "push";
        } else {
          splitWinnings = 0;
          splitHandResult = "lose";
        }

        winnings = mainWinnings + splitWinnings;

        // 디버깅 로그
        console.log("스플릿 게임 정산:", {
          bet: prev.bet,
          splitBet: prev.splitBet,
          dealerScore,
          playerScore: prev.playerScore,
          splitScore: prev.splitScore,
          dealerBust,
          mainBust,
          splitBust,
          mainWinnings,
          splitWinnings,
          totalWinnings: winnings,
          currentChips: prev.chips,
          mainHandResult,
          splitHandResult,
        });

        return {
          ...prev,
          // 카드들 리셋
          playerHand: [],
          dealerHand: [],
          splitHand: [],
          playerScore: 0,
          dealerScore: 0,
          splitScore: 0,
          splitBet: 0,
          // 스플릿 상태 리셋
          isSplit: false,
          currentHand: "main",
          mainHandComplete: false,
          splitHandComplete: false,
          mainHandResult,
          splitHandResult,
          // 결과 표시용 원래 베팅 금액 저장
          originalMainBet: prev.bet,
          originalSplitBet: prev.splitBet,
          // 게임 상태 리셋
          chips: prev.chips + winnings,
          bet: 0,
          gameStatus: "waiting",
          gameStarted: false,
        };
      } else {
        // 일반 게임
        switch (prev.gameStatus) {
          case "playerWin":
            const playerHasBlackjack = isBlackjack(prev.playerHand);
            winnings = playerHasBlackjack
              ? Math.floor(prev.bet * 2.5)
              : prev.bet * 2;
            break;
          case "push":
            winnings = prev.bet;
            break;
          case "dealerWin":
          case "playerBust":
            winnings = 0;
            break;
        }

        return {
          ...prev,
          // 카드들 리셋
          playerHand: [],
          dealerHand: [],
          splitHand: [],
          playerScore: 0,
          dealerScore: 0,
          splitScore: 0,
          splitBet: 0,
          // 스플릿 상태 리셋
          isSplit: false,
          currentHand: "main",
          mainHandComplete: false,
          splitHandComplete: false,
          mainHandResult: undefined,
          splitHandResult: undefined,
          // 결과 표시용 원래 베팅 금액 초기화
          originalMainBet: undefined,
          originalSplitBet: undefined,
          // 게임 상태 리셋
          chips: prev.chips + winnings,
          bet: 0,
          gameStatus: "waiting",
          gameStarted: false,
        };
      }
    });
  }, []);

  // 스플릿
  const split = useCallback(() => {
    if (!canSplit(gameState.playerHand) || gameState.chips < gameState.bet)
      return;

    setGameState((prev) => ({
      ...prev,
      isSplit: true,
      splitHand: [prev.playerHand[1]],
      playerHand: [prev.playerHand[0]],
      splitScore: calculateHandValue([prev.playerHand[1]]),
      playerScore: calculateHandValue([prev.playerHand[0]]),
      splitBet: prev.bet, // 스플릿 핸드에 동일한 베팅 금액 설정
      currentHand: "main",
      mainHandComplete: false,
      splitHandComplete: false,
      mainHandResult: undefined,
      splitHandResult: undefined,
      chips: prev.chips - prev.bet, // 추가 베팅
      handCount: 2, // 스플릿 시 핸드 수 2개로 설정
      // SPLIT 후에는 Surrender 불가능
      canSurrender: false,
    }));
  }, [gameState.playerHand, gameState.chips, gameState.bet]);

  // 다음 핸드로 전환
  const switchToNextHand = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      currentHand: prev.currentHand === "main" ? "split" : "main",
    }));
  }, []);

  // 개발자 모드 토글
  const toggleDevMode = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      devMode: !prev.devMode,
      testCards: undefined, // 개발자 모드 끄면 테스트 카드 초기화
    }));
  }, []);

  // 테스트 카드 설정 (스플릿 테스트용)
  const setTestCards = useCallback((card1: Card, card2: Card) => {
    setGameState((prev) => ({
      ...prev,
      testCards: [card1, card2],
    }));
  }, []);

  // 테스트 카드 초기화
  const clearTestCards = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      testCards: undefined,
    }));
  }, []);

  // 딜러 테스트 카드 설정
  const setTestDealerCards = useCallback((card1: Card, card2: Card) => {
    setGameState((prev) => ({
      ...prev,
      testDealerCards: [card1, card2],
    }));
  }, []);

  // 딜러 테스트 카드 초기화
  const clearTestDealerCards = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      testDealerCards: undefined,
    }));
  }, []);

  // Insurance 선택
  const takeInsurance = useCallback(() => {
    setGameState((prev) => {
      if (!prev.canInsurance || prev.hasInsurance) return prev;
      
      const insuranceBet = Math.floor(prev.bet / 2); // 베팅 금액의 절반
      
      if (prev.chips < insuranceBet) return prev; // 칩이 부족하면 반환
      
      return {
        ...prev,
        hasInsurance: true,
        insuranceBet,
        chips: prev.chips - insuranceBet,
      };
    });
  }, []);

  // Insurance 거부
  const declineInsurance = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      canInsurance: false,
      hasInsurance: false, // No Insurance 선택 시 hasInsurance를 false로 설정
    }));
  }, []);

  // Insurance 결과 처리
  const processInsurance = useCallback(() => {
    setGameState((prev) => {
      const dealerHasBlackjack = isBlackjack(prev.dealerHand);
      
      if (dealerHasBlackjack) {
        // 딜러가 블랙잭이면:
        // 1. Insurance 베팅에 2:1 배당 (원금 + 2배)
        // 2. 메인 베팅은 잃음 (게임 종료)
        let newChips = prev.chips;
        
        if (prev.hasInsurance) {
          newChips += prev.insuranceBet * 3; // Insurance 원금 + 2배 배당
        }
        
        // 플레이어도 블랙잭이면 메인 베팅은 무승부
        const playerHasBlackjack = isBlackjack(prev.playerHand);
        if (playerHasBlackjack) {
          newChips += prev.bet; // 메인 베팅 반환
        }
        
        return {
          ...prev,
          chips: newChips,
          gameStatus: playerHasBlackjack ? "push" : "dealerWin",
          dealerHand: prev.dealerHand.map(card => ({ ...card, isVisible: true })), // 딜러 카드 공개
          canInsurance: false,
          hasInsurance: false,
          insuranceBet: 0,
          insuranceResult: prev.hasInsurance ? 'win' : undefined, // Insurance를 선택했을 때만 승리 표시
        };
      } else {
        // 딜러가 블랙잭이 아니면:
        // 1. Insurance 베팅은 잃음 (이미 칩에서 차감됨)
        // 2. 게임 계속 진행
        return {
          ...prev,
          canInsurance: false,
          hasInsurance: false,
          insuranceBet: 0,
          insuranceResult: prev.hasInsurance ? 'lose' : undefined, // Insurance가 있었다면 패배
          showInsuranceResult: prev.hasInsurance, // Insurance가 있었다면 결과 메시지 표시
        };
      }
    });
  }, []);

  // Insurance 결과 메시지 숨기기
  const hideInsuranceResult = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      showInsuranceResult: false,
      insuranceResult: undefined,
    }));
  }, []);

  // Surrender - 베팅 금액의 절반을 돌려받고 게임 종료
  const surrender = useCallback(() => {
    setGameState((prev) => {
      if (!prev.canSurrender || prev.hasSurrendered) {
        return prev;
      }

      // 베팅 금액의 절반을 돌려받음
      const refundAmount = Math.floor(prev.bet / 2);
      
      return {
        ...prev,
        hasSurrendered: true,
        surrenderResult: 'surrendered',
        gameStatus: 'playerWin', // Surrender로 인한 종료는 플레이어 승리로 처리 (절반 환불)
        chips: prev.chips + refundAmount,
        canSurrender: false, // Surrender 후에는 더 이상 불가능
      };
    });

    // 결과 사운드 재생
    playResultSound('push'); // Surrender는 무승부 사운드로 처리
  }, [playResultSound]);

  return {
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
    canSplit: () => canSplit(gameState.playerHand),
    processDealerTurn,
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
  };
};
