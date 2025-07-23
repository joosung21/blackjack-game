import React from 'react';

interface SplitGameResultOverlayProps {
  mainHandResult: 'win' | 'lose' | 'push' | 'bust';
  splitHandResult: 'win' | 'lose' | 'push' | 'bust';
  mainBet: number;
  splitBet: number;
  onClose: () => void;
}

const SplitGameResultOverlay: React.FC<SplitGameResultOverlayProps> = ({
  mainHandResult,
  splitHandResult,
  mainBet,
  splitBet,
  onClose
}) => {
  const getResultData = (result: 'win' | 'lose' | 'push' | 'bust', bet: number) => {
    switch (result) {
      case 'win':
        return {
          title: '승리!',
          subtitle: `$${bet}을 획득했습니다!`,
          color: '#22c55e',
          winnings: bet
        };
      case 'lose':
        return {
          title: '패배',
          subtitle: `$${bet}을 잃었습니다.`,
          color: '#ef4444',
          winnings: -bet
        };
      case 'push':
        return {
          title: '무승부',
          subtitle: '베팅 금액이 반환됩니다.',
          color: '#f59e0b',
          winnings: 0
        };
      case 'bust':
        return {
          title: '버스트!',
          subtitle: `21을 초과했습니다. $${bet}을 잃었습니다.`,
          color: '#ef4444',
          winnings: -bet
        };
    }
  };

  const mainResult = getResultData(mainHandResult, mainBet);
  const splitResult = getResultData(splitHandResult, splitBet);
  const totalWinnings = mainResult.winnings + splitResult.winnings;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        cursor: 'pointer'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#1a1a1a',
          padding: '40px',
          borderRadius: '20px',
          border: '2px solid #d4af37',
          textAlign: 'center',
          minWidth: '400px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
        }}
      >
        <h2 style={{
          color: '#d4af37',
          fontSize: '2rem',
          fontFamily: 'Funnel Display, sans-serif',
          fontWeight: '700',
          marginBottom: '30px'
        }}>
          스플릿 게임 결과
        </h2>

        <div style={{
          display: 'flex',
          gap: '30px',
          marginBottom: '30px'
        }}>
          {/* 메인 핸드 결과 */}
          <div style={{
            flex: 1,
            padding: '20px',
            borderRadius: '10px',
            border: `2px solid ${mainResult.color}`,
            backgroundColor: 'rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{
              color: '#d4af37',
              fontSize: '1.2rem',
              fontFamily: 'Funnel Display, sans-serif',
              fontWeight: '600',
              marginBottom: '15px'
            }}>
              메인 핸드
            </h3>
            <div style={{
              color: mainResult.color,
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '10px'
            }}>
              {mainResult.title}
            </div>
            <div style={{
              color: 'white',
              fontSize: '1rem'
            }}>
              {mainResult.subtitle}
            </div>
          </div>

          {/* 스플릿 핸드 결과 */}
          <div style={{
            flex: 1,
            padding: '20px',
            borderRadius: '10px',
            border: `2px solid ${splitResult.color}`,
            backgroundColor: 'rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{
              color: '#d4af37',
              fontSize: '1.2rem',
              fontFamily: 'Funnel Display, sans-serif',
              fontWeight: '600',
              marginBottom: '15px'
            }}>
              스플릿 핸드
            </h3>
            <div style={{
              color: splitResult.color,
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '10px'
            }}>
              {splitResult.title}
            </div>
            <div style={{
              color: 'white',
              fontSize: '1rem'
            }}>
              {splitResult.subtitle}
            </div>
          </div>
        </div>

        {/* 총 결과 */}
        <div style={{
          padding: '20px',
          borderRadius: '10px',
          backgroundColor: totalWinnings >= 0 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          border: `2px solid ${totalWinnings >= 0 ? '#22c55e' : '#ef4444'}`,
          marginBottom: '20px'
        }}>
          <div style={{
            color: totalWinnings >= 0 ? '#22c55e' : '#ef4444',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '5px'
          }}>
            총 {totalWinnings >= 0 ? '수익' : '손실'}: ${Math.abs(totalWinnings)}
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '0.9rem'
          }}>
            {totalWinnings > 0 ? '축하합니다!' : totalWinnings < 0 ? '다음 기회에...' : '무승부입니다.'}
          </div>
        </div>

        <div style={{
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.9rem'
        }}>
          클릭하여 계속하기
        </div>
      </div>
    </div>
  );
};

export default SplitGameResultOverlay;
