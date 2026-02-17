import { useState, useRef } from 'react';

const TONES = [
  { id: 'friendly',    label: '😊 Friendly',         desc: 'Warm and approachable' },
  { id: 'motherly',   label: '🤍 Motherly',          desc: 'Nurturing and caring' },
  { id: 'direct',     label: '🎯 Direct',            desc: 'Clear and to the point' },
  { id: 'formal',     label: '🏛️ Formal',            desc: 'Professional and polished' },
  { id: 'encouraging',label: '✨ Encouraging',        desc: 'Uplifting and supportive' },
  { id: 'firm',       label: '🛡️ Firm & Respectful', desc: 'Assertive but kind' },
];

const C = {
  bg: '#fdf6f0', card: '#fff8f3', primary: '#c97d6e', primaryLight: '#f2c4b8',
  accent: '#e8a598', soft: '#fdeee8', text: '#4a3728', muted: '#9b7b6e',
  border: '#f0d5cc', success: '#7dab8a', successLight: '#e8f5ec',
};

// ── License Screen ────────────────────────────────────────────────────────────
function LicenseScreen({ onUnlock }) {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verify = async () => {
    if (!key.trim()) return setError('Please enter your license key.');
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: key.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('mc_license', key.trim());
        onUnlock();
      } else {
        setError(data.error || 'Invalid license key. Please check and try again.');
      }
    } catch {
      setError('Could not connect. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: C.card, borderRadius: 24, padding: 40, maxWidth: 420, width: '100%', boxShadow: '0 8px 32px rgba(201,125,110,0.12)', border: `1px solid ${C.border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌸</div>
          <h1 style={{ color: C.text, fontSize: 26, fontWeight: 700, margin: 0 }}>Manner Coach</h1>
          <p style={{ color: C.muted, marginTop: 8, fontSize: 15 }}>Speak with confidence, kindness & clarity</p>
        </div>
        <label style={{ color: C.text, fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 8 }}>Gumroad License Key</label>
        <input
          value={key}
          onChange={e => setKey(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && verify()}
          placeholder="Paste your license key here…"
          style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.soft, color: C.text, fontSize: 14, outline: 'none' }}
        />
        {error && <p style={{ color: '#c0392b', fontSize: 13, marginTop: 8 }}>{error}</p>}
        <button
          onClick={verify}
          disabled={loading}
          style={{ width: '100%', marginTop: 16, padding: 13, background: loading ? C.accent : C.primary, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Verifying…' : 'Unlock App →'}
        </button>
        <p style={{ color: C.muted, fontSize: 12, textAlign: 'center', marginTop: 16 }}>
          Purchase a license at <strong>Gumroad</strong> to access Manner Coach
        </p>
      </div>
    </div>
  );
}

// ── Tone Selector ─────────────────────────────────────────────────────────────
function ToneSelector({ selected, onSelect }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
      {TONES.map(t => (
        <button key={t.id} onClick={() => onSelect(t.id)} style={{
          padding: '10px 6px', borderRadius: 12,
          border: `2px solid ${selected === t.id ? C.primary : C.border}`,
          background: selected === t.id ? C.soft : C.card,
          color: selected === t.id ? C.primary : C.muted,
          fontSize: 12, fontWeight: selected === t.id ? 700 : 400,
          cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
        }}>
          <div style={{ fontSize: 18 }}>{t.label.split(' ')[0]}</div>
          <div style={{ marginTop: 2 }}>{t.label.split(' ').slice(1).join(' ')}</div>
        </button>
      ))}
    </div>
  );
}

// ── Coach Response ────────────────────────────────────────────────────────────
function CoachResponse({ result, onSave }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(result.rewrite);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const save = () => { onSave(); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div style={{ background: C.successLight, border: `1.5px solid ${C.success}`, borderRadius: 16, padding: 20, marginTop: 20 }}>
      <div style={{ color: C.success, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>✅ Your Coached Response</div>
      <p style={{ color: C.text, fontSize: 15, lineHeight: 1.7, margin: 0, background: '#fff', borderRadius: 10, padding: 14 }}>{result.rewrite}</p>
      {result.coaching && (
        <div style={{ marginTop: 12, background: C.soft, borderRadius: 10, padding: 12 }}>
          <div style={{ color: C.primary, fontWeight: 600, fontSize: 12, marginBottom: 4 }}>💡 Coaching Note</div>
          <p style={{ color: C.muted, fontSize: 13, margin: 0, lineHeight: 1.6 }}>{result.coaching}</p>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={copy} style={{ flex: 1, padding: 9, background: C.primary, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          {copied ? 'Copied! ✓' : 'Copy Text'}
        </button>
        <button onClick={save} style={{ flex: 1, padding: 9, background: saved ? C.success : C.accent, color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          {saved ? 'Saved! ✓' : 'Save to History'}
        </button>
      </div>
    </div>
  );
}

// ── History Panel ─────────────────────────────────────────────────────────────
function HistoryPanel({ history, onClose, onClear }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(74,55,40,0.35)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ background: C.card, borderRadius: '20px 20px 0 0', padding: 24, width: '100%', maxWidth: 520, maxHeight: '75vh', overflowY: 'auto', boxShadow: '0 -8px 32px rgba(201,125,110,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ color: C.text, margin: 0, fontSize: 18 }}>📋 History</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClear} style={{ color: C.muted, background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', fontSize: 12, cursor: 'pointer' }}>Clear All</button>
            <button onClick={onClose} style={{ color: C.primary, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>✕</button>
          </div>
        </div>
        {history.length === 0 && <p style={{ color: C.muted, textAlign: 'center', padding: 24 }}>No history yet. Start coaching!</p>}
        {[...history].reverse().map((item, i) => (
          <div key={i} style={{ border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 10, background: C.bg }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: C.primary, fontWeight: 600, textTransform: 'capitalize' }}>{item.tone} tone</span>
              <span style={{ fontSize: 11, color: C.muted }}>{item.date}</span>
            </div>
            <p style={{ color: C.muted, fontSize: 12, margin: '0 0 6px', fontStyle: 'italic' }}>Original: {item.original}</p>
            <p style={{ color: C.text, fontSize: 13, margin: 0 }}>{item.rewrite}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function Home() {
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('mc_license');
  });
  const [mode, setMode] = useState('text');
  const [tone, setTone] = useState('friendly');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('mc_history') || '[]'); } catch { return []; }
  });
  const [showHistory, setShowHistory] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [helpFinish, setHelpFinish] = useState(false);
  const recRef = useRef(null);

  const saveHistory = items => {
    setHistory(items);
    localStorage.setItem('mc_history', JSON.stringify(items));
  };

  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Your browser doesn't support voice recording. Try Chrome.");
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = e => { const t = e.results[0][0].transcript; setTranscript(t); setText(t); };
    rec.onend = () => setRecording(false);
    rec.start();
    recRef.current = rec;
    setRecording(true);
  };

  const stopRecording = () => { recRef.current?.stop(); setRecording(false); };

  const toneLabel = TONES.find(t => t.id === tone)?.label || tone;

  const coach = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, tone: toneLabel, helpFinish }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ rewrite: 'Sorry, there was an error. Please try again.', coaching: '' });
    }
    setLoading(false);
  };

  const addToHistory = () => {
    if (!result) return;
    saveHistory([...history, { original: text, rewrite: result.rewrite, tone, date: new Date().toLocaleDateString() }]);
  };

  if (!unlocked) return <LicenseScreen onUnlock={() => setUnlocked(true)} />;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingBottom: 40 }}>
      {showHistory && <HistoryPanel history={history} onClose={() => setShowHistory(false)} onClear={() => { saveHistory([]); setShowHistory(false); }} />}

      {/* Header */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div><span style={{ fontSize: 20 }}>🌸</span><span style={{ color: C.text, fontWeight: 700, fontSize: 17, marginLeft: 8 }}>Manner Coach</span></div>
        <button onClick={() => setShowHistory(true)} style={{ background: C.soft, border: `1px solid ${C.border}`, borderRadius: 10, padding: '7px 14px', color: C.primary, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          📋 History {history.length > 0 && `(${history.length})`}
        </button>
      </div>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '24px 16px' }}>
        {/* Mode Toggle */}
        <div style={{ display: 'flex', background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 4, marginBottom: 24 }}>
          {['text', 'voice'].map(m => (
            <button key={m} onClick={() => { setMode(m); setResult(null); setText(''); setTranscript(''); }}
              style={{ flex: 1, padding: 10, borderRadius: 10, border: 'none', background: mode === m ? C.primary : 'transparent', color: mode === m ? '#fff' : C.muted, fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
              {m === 'text' ? '✍️ Write' : '🎙️ Speak'}
            </button>
          ))}
        </div>

        {/* Tone Selector */}
        <h3 style={{ color: C.text, fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Choose Your Tone</h3>
        <ToneSelector selected={tone} onSelect={setTone} />

        {/* Input */}
        <div style={{ background: C.card, border: `1.5px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
          {mode === 'voice' && (
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <button onClick={recording ? stopRecording : startRecording}
                style={{ width: 72, height: 72, borderRadius: '50%', background: recording ? '#e74c3c' : C.primary, border: 'none', fontSize: 28, color: '#fff', cursor: 'pointer', boxShadow: recording ? '0 0 0 8px rgba(231,76,60,0.2)' : 'none', transition: 'all 0.2s' }}>
                {recording ? '⏹' : '🎙️'}
              </button>
              <p style={{ color: C.muted, fontSize: 13, marginTop: 8 }}>{recording ? 'Recording… tap to stop' : 'Tap to start recording'}</p>
              {transcript && <p style={{ color: C.text, fontSize: 13, fontStyle: 'italic', background: C.soft, borderRadius: 8, padding: 10, marginTop: 8 }}>Heard: "{transcript}"</p>}
            </div>
          )}
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder={mode === 'voice' ? 'Your speech will appear here, or type to edit…' : 'Type what you want to say — rough, incomplete, or full…'}
            rows={5}
            style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 10, padding: 12, background: C.soft, color: C.text, fontSize: 14, resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: 1.6 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.muted, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={helpFinish} onChange={e => setHelpFinish(e.target.checked)} style={{ accentColor: C.primary }} />
              Help me finish this
            </label>
            <button onClick={coach} disabled={loading || !text.trim()}
              style={{ padding: '10px 22px', background: loading || !text.trim() ? C.accent : C.primary, color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: loading || !text.trim() ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Coaching…' : 'Coach Me ✨'}
            </button>
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 30, color: C.muted }}>
            <div style={{ fontSize: 32 }}>🌸</div>
            <p style={{ marginTop: 10 }}>Crafting your coached response…</p>
          </div>
        )}
        {result && !loading && <CoachResponse result={result} onSave={addToHistory} />}

        {!result && !loading && (
          <div style={{ marginTop: 24, background: C.soft, borderRadius: 14, padding: 16 }}>
            <p style={{ color: C.primary, fontWeight: 600, fontSize: 13, margin: '0 0 8px' }}>💬 Tips for using Manner Coach</p>
            <p style={{ color: C.muted, fontSize: 13, margin: 0, lineHeight: 1.7 }}>
              Speak or write naturally — even if it's rough or unfinished. Choose the tone that fits your situation, and let the coach help you find the right words. Your history is always saved so you can revisit and learn from past sessions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
