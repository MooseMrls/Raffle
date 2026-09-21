import { useCallback, useEffect, useState } from 'react';
import RaffleDrum, { useDrumSpin } from './components/RaffleDrum.jsx';
import ParticipantsPanel from './components/ParticipantsPanel.jsx';
import WinnersPanel from './components/WinnersPanel.jsx';
import Footer from './components/Footer.jsx';
import WinnerModal from './components/WinnerModal.jsx';
import ConfirmModal from './components/ConfirmModal.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import { getParticipants, addParticipants, uploadParticipants, spinWheel, resetAll, clearPool } from './api.js';
import { ShieldCheck, Sun, Moon, Sunset } from 'lucide-react';
import mapsaLogo from './img/MaPSA 1.png';

let toastIdCounter = 0;

function getGreetingData() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good Morning', icon: <Sun size={18} color="#000000" /> };
  if (hour < 18) return { text: 'Good Afternoon', icon: <Sunset size={18} color="#000000" /> };
  return { text: 'Good Evening', icon: <Moon size={18} color="#000000" /> };
}

export default function App() {
  const [pending, setPending] = useState([]);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [winnerModalData, setWinnerModalData] = useState(null);
  const [poolExpanded, setPoolExpanded] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { data } = await getParticipants();
      setPending(data.pending);
      setWinners(data.winners);
    } catch (err) {
      addToast('Could not reach the backend server. Make sure node server.js is running.', 'error', 6000);
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleAddNames = async (names) => {
    try {
      await addParticipants(names);
      await refresh();
      addToast(`Added ${names.length} participant${names.length === 1 ? '' : 's'} to the pool.`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add names.', 'error');
    }
  };

  const handleUploadFile = async (file) => {
    try {
      const { data } = await uploadParticipants(file);
      await refresh();
      addToast(`Imported ${data.inserted} participant${data.inserted === 1 ? '' : 's'} from ${file.name}.`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to import file.', 'error');
    }
  };

  const handleReset = () => {
    setConfirmModal({
      title: 'Reset Everything',
      message: 'This will permanently clear all participants and winner records. This action cannot be undone.',
      confirmLabel: 'Reset All',
      confirmVariant: 'danger',
      onConfirm: async () => {
        setConfirmModal(null);
        await resetAll();
        await refresh();
        addToast('Pool and winners cleared successfully.');
      },
    });
  };

  const handleClearNames = () => {
    setConfirmModal({
      title: 'Clear Names',
      message: 'This will remove all names from the participant pool. Winner records will be preserved.',
      confirmLabel: 'Clear Names',
      confirmVariant: 'warning',
      onConfirm: async () => {
        setConfirmModal(null);
        await clearPool();
        await refresh();
        addToast('Pool cleared. Winner records are preserved.');
      },
    });
  };

  const { spinning, activeIndex, runSpin } = useDrumSpin({
    pool: pending,
    onWinner: (winner) => {
      refresh();
      setWinnerModalData(winner);
    },
  });

  const handleSpin = async (runReelSpin) => {
    try {
      await runSpin(async () => {
        const { data } = await spinWheel();
        return data.winner;
      }, runReelSpin);
    } catch (err) {
      addToast(err.response?.data?.message || 'Could not spin — the pool may be empty.', 'error');
    }
  };

  const greeting = getGreetingData();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand-container">
          <img src={mapsaLogo} alt="MaPSA Logo" className="brand-logo" />
          <div>
            <h1 className="brand-title"></h1>
          </div>
        </div>

        <div className="header-center">
          <span className="header-greeting">{greeting.text}!</span>
        </div>

      </header>

      <main className="app-main">
        <RaffleDrum
          pool={pending}
          spinning={spinning}
          activeIndex={activeIndex}
          statusLabel={spinning ? 'DRAWING' : pending.length === 0 ? 'EMPTY' : 'READY'}
          onSpin={handleSpin}
          disabled={loading || pending.length === 0}
          winnerModalData={winnerModalData}
          onCloseWinnerModal={() => setWinnerModalData(null)}
        />

        <div className={`side-column ${poolExpanded ? 'is-pool-expanded' : ''}`}>
          <ParticipantsPanel
            pendingCount={pending.length}
            onAddNames={handleAddNames}
            onUploadFile={handleUploadFile}
            onReset={handleReset}
            onClearNames={handleClearNames}
            isExpanded={poolExpanded}
            onToggleExpanded={setPoolExpanded}
          />
          <WinnersPanel winners={winners} />
        </div>
      </main>

      <Footer />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <ConfirmModal
        open={!!confirmModal}
        title={confirmModal?.title}
        message={confirmModal?.message}
        confirmLabel={confirmModal?.confirmLabel}
        confirmVariant={confirmModal?.confirmVariant}
        onConfirm={confirmModal?.onConfirm}
        onCancel={() => setConfirmModal(null)}
      />
    </div>
  );
}
