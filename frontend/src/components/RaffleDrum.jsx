import { useEffect, useRef, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ChevronRight, ChevronLeft, Maximize2, Minimize2 } from 'lucide-react';
import WinnerModal from './WinnerModal.jsx';

const ITEM_HEIGHT = 80;

export default function RaffleDrum({
  pool,
  spinning,
  activeIndex,
  statusLabel,
  onSpin,
  disabled,
  winnerModalData,
  onCloseWinnerModal,
}) {
  const cardRef = useRef(null);
  const reelRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [reelNames, setReelNames] = useState([]);
  const [isRevealed, setIsRevealed] = useState(false);

  // Initialize idle reel
  useEffect(() => {
    if (pool.length > 0 && reelNames.length === 0) {
      const idle = [];
      for (let i = 0; i < 15; i++) {
        idle.push(pool[Math.floor(Math.random() * pool.length)]);
      }
      setReelNames([...idle, ...idle.slice(0, 5)]);
    }
  }, [pool, reelNames.length]);

  const runReelSpin = useCallback((selectedWinner, onFinish) => {
    if (pool.length === 0) return;

    setIsRevealed(false);

    // Build spin reel sequence: 40 random items + winner + 5 padding items
    const numPreScroll = 40 + Math.floor(Math.random() * 10);
    const tempReel = [];

    for (let i = 0; i < numPreScroll; i++) {
      tempReel.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    tempReel.push(selectedWinner);
    for (let i = 0; i < 5; i++) {
      tempReel.push(pool[Math.floor(Math.random() * pool.length)]);
    }

    setReelNames(tempReel);

    setTimeout(() => {
      if (reelRef.current) {
        reelRef.current.style.animation = 'none';
        reelRef.current.style.transition = 'none';
        reelRef.current.style.transform = `translateY(0px)`;
        void reelRef.current.offsetHeight; // force reflow

        const itemElem = reelRef.current.querySelector('.slot-reel-item');
        const itemHeight = itemElem && itemElem.getBoundingClientRect().height > 0 ? itemElem.getBoundingClientRect().height : ITEM_HEIGHT;
        const totalDistance = numPreScroll * itemHeight;
        reelRef.current.style.transition = 'transform 4s cubic-bezier(0.075, 0.82, 0.165, 1)';
        reelRef.current.style.transform = `translateY(-${totalDistance}px)`;
      }
    }, 50);

    setTimeout(() => {
      setIsRevealed(true);
      try {
        const targetParent = document.fullscreenElement || document.body;
        const canvas = document.createElement('canvas');
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '999999';
        targetParent.appendChild(canvas);

        const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });
        myConfetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.55 },
          colors: ['#facc15', '#fef08a', '#eab308', '#000000'],
        });

        setTimeout(() => {
          if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        }, 4000);
      } catch (e) {
        // ignore
      }
      onFinish(selectedWinner);
    }, 4100);
  }, [pool]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      cardRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      if (reelRef.current) {
        reelRef.current.style.transition = 'none';
        reelRef.current.style.transform = `translateY(0px)`;
      }
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  const isIdle = !spinning && !isRevealed;

  return (
    <div ref={cardRef} className={`drum-card ${isFullscreen ? 'is-fullscreen' : ''}`}>
      <div className={`drum-stage ${spinning ? 'is-active-spin' : ''}`}>
        <div className="drum-header-bar">
          <div className="drum-title-badge"></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className={`drum-status-badge status-${statusLabel.replace(/\s+/g, '')}`}>
              {statusLabel}
            </div>
            <button
              type="button"
              className="fullscreen-toggle-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Full Screen'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>

        <div className="slot-machine-frame">
          <div className="slot-window-viewport">
            {pool.length === 0 ? (
              <div className="slot-empty-notice">EMPTY PARTICIPANT POOL</div>
            ) : (
              <div
                ref={reelRef}
                className={`slot-reel-track ${isIdle ? 'is-idle' : ''}`}
              >
                {reelNames.map((p, i) => (
                  <div
                    key={`slot-item-${i}`}
                    className={`slot-reel-item ${isRevealed && i === reelNames.length - 6 ? 'is-selected' : ''}`}
                  >
                    {p.name}
                  </div>
                ))}
              </div>
            )}

            {/* Selection Payline Box */}
            <div className="slot-payline-indicator">
              <ChevronRight size={24} className="slot-pointer-left" />
              <ChevronLeft size={24} className="slot-pointer-right" />
            </div>
          </div>
        </div>
      </div>

      <button
        className="spin-button"
        onClick={() => onSpin(runReelSpin)}
        disabled={disabled || spinning}
      >
        <span>{spinning ? 'Rolling...' : 'Draw'}</span>
      </button>

      {winnerModalData && (
        <WinnerModal winner={winnerModalData} onClose={onCloseWinnerModal} />
      )}
    </div>
  );
}

export function useDrumSpin({ pool, onWinner }) {
  const [spinning, setSpinning] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const runSpin = async (spinRequest, runReelSpin) => {
    if (spinning || !pool || pool.length === 0) return;
    setSpinning(true);

    try {
      const winner = await spinRequest();

      // Execute slot reel spin animation using winner
      runReelSpin(winner, (selectedWinner) => {
        setSpinning(false);
        onWinner(selectedWinner);
      });
    } catch (err) {
      setSpinning(false);
      throw err;
    }
  };

  return { spinning, activeIndex, runSpin };
}




