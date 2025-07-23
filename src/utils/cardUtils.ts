import type { Card, Suit, Rank, Deck, CardImageInfo } from '../types/card';

/**
 * 카드 관련 유틸리티 함수들
 */

// 모든 슈트 배열
export const SUITS: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];

// 모든 랭크 배열
export const RANKS: Rank[] = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];

/**
 * 카드의 블랙잭 점수를 계산하는 함수
 * @param rank 카드 랭크
 * @returns 카드의 기본 점수 (에이스는 11로 반환, 나중에 조정)
 */
export function getCardValue(rank: Rank): number {
  switch (rank) {
    case 'ace':
      return 11; // 에이스는 기본적으로 11, 필요시 1로 조정
    case 'jack':
    case 'queen':
    case 'king':
      return 10;
    default:
      return parseInt(rank);
  }
}

/**
 * 새로운 카드를 생성하는 함수
 * @param suit 카드 슈트
 * @param rank 카드 랭크
 * @param isVisible 카드가 보이는지 여부 (기본값: true)
 * @returns 새로운 카드 객체
 */
export function createCard(suit: Suit, rank: Rank, isVisible: boolean = true): Card {
  return {
    suit,
    rank,
    value: getCardValue(rank),
    isVisible
  };
}

/**
 * 표준 52장 카드 덱을 생성하는 함수
 * @returns 새로운 카드 덱
 */
export function createDeck(): Deck {
  const deck: Deck = [];
  
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(createCard(suit, rank));
    }
  }
  
  return deck;
}

/**
 * 카드 덱을 셔플하는 함수 (Fisher-Yates 알고리즘)
 * @param deck 셔플할 카드 덱
 * @returns 셔플된 카드 덱
 */
export function shuffleDeck(deck: Deck): Deck {
  const shuffledDeck = [...deck];
  
  for (let i = shuffledDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
  }
  
  return shuffledDeck;
}

/**
 * 핸드의 총 점수를 계산하는 함수 (에이스 처리 포함)
 * @param hand 카드 핸드 배열
 * @returns 핸드의 총 점수
 */
export function calculateHandValue(hand: Card[]): number {
  let total = 0;
  let aces = 0;
  
  // 먼저 에이스가 아닌 카드들의 점수를 계산
  for (const card of hand) {
    if (card.rank === 'ace') {
      aces++;
      total += 11; // 일단 11로 계산
    } else {
      total += card.value;
    }
  }
  
  // 21을 초과하면 에이스를 1로 변경
  while (total > 21 && aces > 0) {
    total -= 10; // 11에서 1로 변경 (10 차이)
    aces--;
  }
  
  return total;
}

/**
 * 핸드 값을 표시하는 문자열을 반환하는 함수
 * @param hand 카드 핸드 배열
 * @returns 블랙잭이면 "블랙잭", Ace가 있으면 "낮은값 또는 높은값" 형태, 없으면 숫자만 반환
 */
export function getHandDisplayValue(hand: Card[]): string {
  // 블랙잭인지 먼저 확인
  if (isBlackjack(hand)) {
    return '블랙잭';
  }
  
  const hasAce = hand.some(card => card.rank === 'ace');
  
  if (!hasAce) {
    return calculateHandValue(hand).toString();
  }
  
  // Ace가 있는 경우 두 가지 값 계산
  let lowValue = 0;
  let highValue = 0;
  let aceCount = 0;
  
  // 먼저 모든 카드를 계산 (Ace는 1로)
  for (const card of hand) {
    if (card.rank === 'ace') {
      aceCount++;
      lowValue += 1;
    } else {
      lowValue += card.value;
    }
  }
  
  // 높은 값 계산 (Ace 하나를 11로)
  highValue = lowValue + 10;
  
  // 높은 값이 21을 초과하면 낮은 값만 표시
  if (highValue > 21) {
    return lowValue.toString();
  }
  
  // 두 값이 같으면 (모든 Ace가 1로 계산된 경우) 하나만 표시
  if (lowValue === highValue) {
    return lowValue.toString();
  }
  
  // 두 값이 다르면 "낮은값 또는 높은값" 형태로 표시
  return `${lowValue} 또는 ${highValue}`;
}

/**
 * 블랙잭인지 확인하는 함수
 * @param hand 카드 핸드 배열
 * @returns 블랙잭 여부
 */
export function isBlackjack(hand: Card[]): boolean {
  return hand.length === 2 && calculateHandValue(hand) === 21;
}

/**
 * 버스트인지 확인하는 함수
 * @param hand 카드 핸드 배열
 * @returns 버스트 여부
 */
export function isBust(hand: Card[]): boolean {
  return calculateHandValue(hand) > 21;
}

/**
 * 스플릿 가능 여부를 확인하는 함수
 * @param hand 카드 핸드 배열
 * @returns 스플릿 가능 여부
 */
export function canSplit(hand: Card[]): boolean {
  // 정확히 2장이어야 함
  if (hand.length !== 2) return false;
  
  const [card1, card2] = hand;
  
  // 같은 랭크이거나, 둘 다 10점 카드(10, J, Q, K)인 경우 스플릿 가능
  if (card1.rank === card2.rank) {
    return true;
  }
  
  // 10점 카드들(10, J, Q, K) 간의 스플릿 허용
  const tenValueCards = ['10', 'jack', 'queen', 'king'];
  const isBothTenValue = tenValueCards.includes(card1.rank) && tenValueCards.includes(card2.rank);
  
  return isBothTenValue;
}

/**
 * 카드 이미지 파일명을 생성하는 함수
 * @param card 카드 객체
 * @param useHighRes 고해상도 이미지 사용 여부 (기본값: false)
 * @param backColor 카드 뒷면 색상 ('blue' | 'red', 기본값: 'blue')
 * @returns 카드 이미지 정보
 */
export function getCardImageInfo(card: Card, useHighRes: boolean = false, backColor: 'blue' | 'red' = 'blue'): CardImageInfo {
  if (!card.isVisible) {
    const filename = `card-back-${backColor}.png`;
    return {
      filename,
      path: `/src/assets/images/cards/${filename}`,
      isHighRes: false
    };
  }
  
  const suffix = useHighRes && ['jack', 'queen', 'king', 'ace'].includes(card.rank) ? '2' : '';
  const filename = `${card.rank}_of_${card.suit}${suffix}.png`;
  
  return {
    filename,
    path: `/src/assets/images/cards/${filename}`,
    isHighRes: useHighRes
  };
}

/**
 * 카드 이미지를 동적으로 import하는 함수
 * @param card 카드 객체
 * @param useHighRes 고해상도 이미지 사용 여부
 * @returns 이미지 URL Promise
 */
export async function importCardImage(card: Card, useHighRes: boolean = false): Promise<string> {
  const imageInfo = getCardImageInfo(card, useHighRes);
  
  try {
    const imageModule = await import(
      /* @vite-ignore */ `../assets/images/cards/${imageInfo.filename}`
    );
    return imageModule.default;
  } catch (error) {
    console.error(`카드 이미지를 로드할 수 없습니다: ${imageInfo.filename}`, error);
    // 기본 카드 뒷면 이미지 반환 (추후 구현)
    return '';
  }
}
