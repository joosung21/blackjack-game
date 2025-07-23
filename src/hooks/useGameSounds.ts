import { useCallback, useRef } from 'react';

// 게임 사운드 타입 정의
export type GameSoundType = 'win' | 'lose' | 'card' | 'chip';

export const useGameSounds = () => {
  // 오디오 객체들을 저장할 ref
  const audioRefs = useRef<Record<GameSoundType, HTMLAudioElement>>({
    win: new Audio('/audio/win.wav'),
    lose: new Audio('/audio/lose.wav'),
    card: new Audio('/audio/card.wav'),
    chip: new Audio('/audio/chip.wav'),
  });

  // 사운드 재생 함수
  const playSound = useCallback((soundType: GameSoundType) => {
    try {
      const audio = audioRefs.current[soundType];
      // 이전 재생 중인 사운드가 있다면 정지하고 처음부터 재생
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.warn(`사운드 재생 실패 (${soundType}):`, error);
      });
    } catch (error) {
      console.warn(`사운드 로드 실패 (${soundType}):`, error);
    }
  }, []);

  // 게임 결과에 따른 사운드 재생
  const playResultSound = useCallback((result: 'win' | 'lose' | 'push') => {
    if (result === 'win') {
      playSound('win');
    } else {
      // 패배와 무승부는 같은 소리 사용
      playSound('lose');
    }
  }, [playSound]);

  // 카드 뽑는 소리
  const playCardSound = useCallback(() => {
    playSound('card');
  }, [playSound]);

  // 칩 베팅 소리
  const playChipSound = useCallback(() => {
    playSound('chip');
  }, [playSound]);

  return {
    playSound,
    playResultSound,
    playCardSound,
    playChipSound,
  };
};
