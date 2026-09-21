import { useRef, useState } from 'react';
import { Users, UserPlus, UploadCloud, RotateCcw, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function ParticipantsPanel({ pendingCount, onAddNames, onUploadFile, onReset, error, notice, isExpanded: isExpandedProp, onToggleExpanded }) {
  const [nameInput, setNameInput] = useState('');
  const [internalExpanded, setInternalExpanded] = useState(false);

  const expanded = isExpandedProp !== undefined ? isExpandedProp : internalExpanded;
  const toggleExpanded = () => {
    if (onToggleExpanded) {
      onToggleExpanded(!expanded);
    } else {
      setInternalExpanded(!expanded);
    }
  };

  const fileInputRef = useRef(null);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    const names = nameInput
      .split('\n')
      .map((n) => n.trim())
      .filter(Boolean);
    onAddNames(names);
    setNameInput('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUploadFile(file);
    e.target.value = '';
  };

  return (
    <div className="panel panel-compact">
      <div className="panel-header-compact" onClick={toggleExpanded} style={{ cursor: 'pointer' }}>
        <div className="panel-title-compact">
          <Users size={18} color="#000000" />
          <span>Participants Pool</span>
          <span className="compact-count-badge">{pendingCount} Active</span>
        </div>
        <button type="button" className="compact-toggle-btn" aria-label="Toggle Panel">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {expanded && (
        <div className="compact-content">
          <form className="add-form" onSubmit={handleAdd}>
            <label htmlFor="name-input">Quick Add Names</label>
            <textarea
              id="name-input"
              rows={2}
              placeholder="Paste names (one per line)..."
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
            <button type="submit" className="btn-secondary btn-sm">
              <UserPlus size={14} />
              <span>Add to Pool</span>
            </button>
          </form>

          <div className="import-row">
            <button type="button" className="btn-outline btn-sm" onClick={() => fileInputRef.current?.click()}>
              <UploadCloud size={16} />
              <span>Import CSV / Excel</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              hidden
            />
          </div>

          {error && (
            <div className="panel-message panel-message-error">
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}
          {notice && (
            <div className="panel-message panel-message-ok">
              <CheckCircle2 size={14} />
              <span>{notice}</span>
            </div>
          )}

          <button type="button" className="btn-danger-text btn-sm" onClick={onReset}>
            <RotateCcw size={14} />
            <span>Reset Pool & Winners</span>
          </button>
        </div>
      )}
    </div>
  );
}

