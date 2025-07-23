/**
 * 카드 게임에서 사용되는 타입 정의
 */

// 카드 슈트(무늬) 타입
export type Suit = 'clubs' | 'diamonds' | 'hearts' | 'spades';

// 카드 랭크(숫자/문자) 타입
export type Rank = 'ace' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'jack' | 'queen' | 'king';

// 카드 인터페이스
export interface Card {
  suit: Suit;
  rank: Rank;
  value: number; // 블랙잭에서의 점수 값
  isVisible: boolean; // 카드가 앞면인지 뒷면인지
}

// 카드 덱 타입
export type Deck = Card[];

// 칩 관련 타입
export type ChipValue = 5 | 10 | 20 | 50 | 100 | 500 | 1000;

export interface Chip {
  value: ChipValue;
  color: string;
  count: number;
}

export interface ChipStack {
  chips: Chip[];
  totalValue: number;
}

// 게임 플레이어 타입
export interface Player {
  id: string;
  name: string;
  hand: Card[];
  score: number;
  bet: number;
  chips: number;
  isDealer: boolean;
}

// 게임 상태 타입
export interface GameState {
  playerHand: Card[];
  dealerHand: Card[];
  deck: Card[];
  playerScore: number;
  dealerScore: number;
  gameStatus: 'waiting' | 'playing' | 'dealerTurn' | 'playerWin' | 'dealerWin' | 'push' | 'playerBust' | 'dealerBust';
  bet: number;
  initialBet: number; // 게임 시작 시 원래 베팅 금액 (더블다운/스플릿 전)
  chips: number;
  // 게임 카운터
  gameCount: number; // 총 게임 수 (스플릿도 하나의 게임으로 카운트)
  handCount: number; // 현재 게임에서 플레이 중인 핸드 수 (메인=1, 스플릿=2)
  // 스플릿 관련 필드
  isSplit: boolean;
  splitHand: Card[];
  splitScore: number;
  currentHand: 'main' | 'split'; // 현재 플레이 중인 손
  splitBet: number; // 스플릿 핸드의 베팅 금액 (필수)
  mainHandComplete: boolean; // 메인 손 완료 여부
  splitHandComplete: boolean; // 스플릿 손 완료 여부
  // 각 핸드별 게임 결과
  mainHandResult?: 'win' | 'lose' | 'push' | 'bust';
  splitHandResult?: 'win' | 'lose' | 'push' | 'bust';
  // 결과 표시용 원래 베팅 금액 저장
  originalMainBet?: number;
  originalSplitBet?: number;
  // Insurance 관련 필드
  canInsurance: boolean; // Insurance 가능 여부
  hasInsurance: boolean; // Insurance 선택 여부
  insuranceBet: number; // Insurance 베팅 금액
  insuranceResult?: 'win' | 'lose'; // Insurance 결과 (딜러 블랙잭 여부)
  showInsuranceResult?: boolean; // Insurance 결과 메시지 표시 여부
  // Surrender 관련 필드
  canSurrender: boolean; // Surrender 가능 여부 (첫 두 장일 때만)
  hasSurrendered: boolean; // Surrender 선택 여부
  surrenderResult?: 'surrendered'; // Surrender 결과
  // 개발자 모드 필드
  devMode: boolean;
  testCards?: [Card, Card]; // 테스트용 플레이어 시작 카드
  testDealerCards?: [Card, Card]; // 테스트용 딜러 시작 카드
}

// 게임 상태 타입
export type GameStatus = 'waiting' | 'betting' | 'dealing' | 'playing' | 'dealer-turn' | 'finished';

// 게임 결과 타입
export type GameResult = 'win' | 'lose' | 'push' | 'blackjack' | 'bust';

// 블랙잭 게임 인터페이스
export interface BlackjackGame {
  player: Player;
  dealer: Player;
  deck: Deck;
  gameState: GameState;
  currentBet: number;
  gameResult?: GameResult;
}

// 카드 이미지 경로 생성을 위한 유틸리티 타입
export interface CardImageInfo {
  filename: string;
  path: string;
  isHighRes: boolean;
}
