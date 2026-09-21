import { useCallback, useEffect, useState } from 'react';
import RaffleDrum, { useDrumSpin } from './components/RaffleDrum.jsx';
import ParticipantsPanel from './components/ParticipantsPanel.jsx';
import WinnersPanel from './components/WinnersPanel.jsx';
import Footer from './components/Footer.jsx';
import WinnerModal from './components/WinnerModal.jsx';
import { getParticipants, addParticipants, uploadParticipants, spinWheel, resetAll } from './api.js';
import { ShieldCheck, Sun, Moon, Sunset } from 'lucide-react';
import mapsaLogo from './img/MaPSA 1.png';

function getGreetingData() {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good Morning', icon: <Sun size={18} color="#000000" /> };
  if (hour < 18) return { text: 'Good Afternoon', icon: <Sunset size={18} color="#000000" /> };
  return { text: 'Good Evening', icon: <Moon size={18} color="#000000" /> };
}

export default function App() {
  const [pending, setPending] = useState([]);
  const [winners, setWinners] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [winnerModalData, setWinnerModalData] = useState(null);
  const [poolExpanded, setPoolExpanded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const { data } = await getParticipants();
      setPending(data.pending);
      setWinners(data.winners);
    } catch (err) {
      setError('Could not reach the backend server. Make sure node server.js is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const flash = (setter, msg) => {
    setter(msg);
    setTimeout(() => setter(''), 4000);
  };

  const handleAddNames = async (names) => {
    setError('');
    try {
      await addParticipants(names);
      await refresh();
      flash(setNotice, `Added ${names.length} participant${names.length === 1 ? '' : 's'} to the pool.`);
    } catch (err) {
      flash(setError, err.response?.data?.message || 'Failed to add names.');
    }
  };

  const handleUploadFile = async (file) => {
    setError('');
    try {
      const { data } = await uploadParticipants(file);
      await refresh();
      flash(setNotice, `Imported ${data.inserted} participant${data.inserted === 1 ? '' : 's'} from ${file.name}.`);
    } catch (err) {
      flash(setError, err.response?.data?.message || 'Failed to import file.');
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Clear all participants and winners?')) return;
    await resetAll();
    await refresh();
    flash(setNotice, 'Pool and winners cleared successfully.');
  };

  const { spinning, activeIndex, runSpin } = useDrumSpin({
    pool: pending,
    onWinner: (winner) => {
      refresh();
      setWinnerModalData(winner);
    },
  });

  const handleSpin = async (runReelSpin) => {
    setError('');
    try {
      await runSpin(async () => {
        const { data } = await spinWheel();
        return data.winner;
      }, runReelSpin);
    } catch (err) {
      flash(setError, err.response?.data?.message || 'Could not spin — the pool may be empty.');
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
            error={error}
            notice={notice}
            isExpanded={poolExpanded}
            onToggleExpanded={setPoolExpanded}
          />
          <WinnersPanel winners={winners} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

