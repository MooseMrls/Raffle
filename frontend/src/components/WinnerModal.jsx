import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy } from 'lucide-react';

export default function WinnerModal({ winner, onClose }) {
  useEffect(() => {
    if (!winner) return;

    // In browser fullscreen mode (Element.requestFullscreen), elements outside the fullscreen container are hidden.
    // We create a canvas, append it to document.fullscreenElement or document.body, and run confetti.
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

    const myConfetti = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });

    myConfetti({
      particleCount: 180,
      spread: 120,
      origin: { y: 0.5 },
      colors: ['#facc15', '#fef08a', '#eab308', '#22c55e', '#ffffff', '#000000'],
    });

    // Cleanup canvas after animation completes
    const timer = setTimeout(() => {
      try {
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      } catch (e) {
        // ignore cleanup error
      }
    }, 4500);

    return () => {
      clearTimeout(timer);
      try {
        if (canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      } catch (e) {
        // ignore
      }
    };
  }, [winner]);

  if (!winner) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon-badge">
          <Trophy size={36} />
        </div>
        <div>
          <span className="modal-subtitle">Winner Drawn!</span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px' }}>Congratulations!</h2>
        </div>

        <div className="modal-winner-name">{winner.name}</div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          You are the lucky winner!
        </p>

        <button type="button" className="modal-close-btn" onClick={onClose}>
           Continue
        </button>
      </div>
    </div>
  );
}
