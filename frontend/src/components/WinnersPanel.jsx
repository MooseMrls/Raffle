import { Trophy, Medal, Award, Sparkles } from 'lucide-react';

export default function WinnersPanel({ winners }) {
  const getRankBadge = (rank) => {
    return <div className="winner-rank winner-rank-default">#{rank}</div>;
  };

  return (
    <div className="panel winners-panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <Trophy size={20} color="#000000" />
          <span>Hall of Winners</span>
        </h2>
        {winners.length > 0 && (
          <span className="user-pill" style={{ background: 'var(--border-color)', color: '#000000', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800 }}>
            {winners.length} Drawn
          </span>
        )}
      </div>

      {winners.length === 0 ? (
        <div className="winners-empty">
          <Sparkles size={32} opacity={0.4} />
          <p>No winners drawn yet.</p>
          <span style={{ fontSize: '0.78rem' }}>Spin the drum to draw the first lucky winner!</span>
        </div>
      ) : (
        <ol className="winners-list">
          {winners.map((w, i) => {
            const rank = winners.length - i;
            return (
              <li key={w._id} className="winner-item">
                <div className="winner-left">
                  {getRankBadge(rank)}
                  <span className="winner-name">{w.name}</span>
                </div>
                {/* <div className="winner-tag">
                  <span>Draw #{rank}</span>
                </div> */}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
