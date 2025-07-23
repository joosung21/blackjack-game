import { useEffect, useRef, useState } from 'react';

export const useBackgroundMusic = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3); // 기본 볼륨 30%
  const [canAutoPlay, setCanAutoPlay] = useState(false);

  useEffect(() => {
    // 오디오 객체 생성
    audioRef.current = new Audio('/audio/background-music.mp3');
    audioRef.current.loop = true; // 반복 재생
    audioRef.current.volume = volume;

    // 사용자 상호작용 감지를 위한 이벤트 리스너
    const handleUserInteraction = async () => {
      if (!canAutoPlay && audioRef.current) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          setCanAutoPlay(true);
          // 이벤트 리스너 제거 (한 번만 실행)
          document.removeEventListener('click', handleUserInteraction);
          document.removeEventListener('keydown', handleUserInteraction);
          document.removeEventListener('touchstart', handleUserInteraction);
        } catch (error) {
          console.log('음악 재생 실패:', error);
        }
      }
    };

    // 사용자 상호작용 이벤트 등록
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    // 자동 재생 시도 (실패할 가능성 높음)
    const tryAutoPlay = async () => {
      try {
        await audioRef.current?.play();
        setIsPlaying(true);
        setCanAutoPlay(true);
      } catch (error) {
        console.log('자동 재생이 차단되었습니다. 화면을 클릭하면 음악이 재생됩니다.');
      }
    };

    tryAutoPlay();

    // 컴포넌트 언마운트 시 정리
    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 볼륨 변경 시 적용
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleMusic = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('음악 재생/정지 중 오류:', error);
    }
  };

  const setMusicVolume = (newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
  };

  return {
    isPlaying,
    volume,
    canAutoPlay,
    toggleMusic,
    setMusicVolume,
  };
};
