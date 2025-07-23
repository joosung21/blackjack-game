import React from "react";
import { useBackgroundMusic } from "../../hooks/useBackgroundMusic";

const MusicControl: React.FC = () => {
  const { isPlaying, volume, canAutoPlay, toggleMusic, setMusicVolume } =
    useBackgroundMusic();

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        left: "20px",
        zIndex: 1000,
        backgroundColor: "rgba(0, 0, 0, 0.50)",
        borderRadius: "8px",
        padding: "12px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        minWidth: "130px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {/* 음악 재생/정지 버튼 */}
        <button
          onClick={toggleMusic}
          className={`btn btn-xs ${
            isPlaying ? "btn-success" : "btn-secondary"
          }`}
          title={isPlaying ? "음악 정지" : "음악 재생"}
        >
          {isPlaying ? (
            // 정지 아이콘
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5.5 3.5A1.5 1.5 0 0 1 7 2h2a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 9 14H7a1.5 1.5 0 0 1-1.5-1.5v-9z" />
            </svg>
          ) : (
            // 재생 아이콘
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
              <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
            </svg>
          )}
        </button>

        {/* 볼륨 조절 슬라이더 */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <svg width="20" height="20" fill="white" viewBox="0 0 16 16">
            <path d="M9 4a.5.5 0 0 0-.812-.39L5.825 5.5H3.5A.5.5 0 0 0 3 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 9 12V4zM6.312 6.39 8 5.04v5.92L6.312 9.61A.5.5 0 0 0 6 9.5H4v-3h2a.5.5 0 0 0 .312-.11zM12.025 8a4.486 4.486 0 0 1-1.318 3.182L10 10.475A3.489 3.489 0 0 0 11.025 8 3.49 3.49 0 0 0 10 5.525l.707-.707A4.486 4.486 0 0 1 12.025 8z" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
            className="form-range"
            style={{ width: "60px" }}
            title={`볼륨: ${Math.round(volume * 100)}%`}
          />
        </div>

        {/* 자동재생 상태 표시 */}
        {!canAutoPlay && (
          <small
            style={{
              fontSize: "9px",
              color: "rgba(255, 255, 0, 0.8)",
              marginLeft: "4px",
            }}
          >
            클릭으로 재생
          </small>
        )}
      </div>
    </div>
  );
};

export default MusicControl;
