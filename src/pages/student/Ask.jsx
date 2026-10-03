import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useUi } from '@/context/UiContext';
import { useSelectors } from '@/hooks/useSelectors';
import { askPathForge } from '@/lib/askEngine';
import PageHeader from '@/components/ui/PageHeader';

const EXAMPLES = ['What is a base case?', 'How do I reverse a string?', 'Why is my code not working?'];

/**
 * Answers only from approved course notes — nothing is generated or guessed.
 * Retrieval picks the right concept, then quotes the part of the note that
 * actually answers the question asked.
 */
export default function Ask() {
  const { S } = useApp();
  const { chat, setChat } = useUi();
  const { nm } = useSelectors();
  const [q, setQ] = useState('');

  const ask = (e, preset) => {
    e?.preventDefault?.();
    const text = String(preset ?? q).trim();
    if (!text) return;
    const out = askPathForge(S.concepts, S.res, text);
    setChat((c) => [
      ...c,
      { r: 'u', t: text },
      {
        r: 'a',
        t: out.answer,
        src: out.matched ? out.conceptId : null,
        ex: out.example || null,
        matched: out.matched,
        available: out.available || [],
      },
    ]);
    setQ('');
  };

  return (
    <>
      <PageHeader
        title="Ask PathForge"
        sub="Answers come only from approved course notes. It does not grade you or decide competency."
      />
      <div className="card">
        <p className="note-inline" style={{ marginBottom: 'var(--s4)' }}>
          AI support is for learning practice. Faculty verification is required for official
          competency evidence.
        </p>
        <div className="chat" aria-live="polite">
          {chat.length ? (
            chat.map((c, i) => (
              <div className={`msg ${c.r}`} key={i}>
                <div>{c.t}</div>
                {c.ex ? <pre className="msg-pre">{c.ex}</pre> : null}
                {c.matched === false && c.available?.length ? (
                  <div className="topic-chips">
                    <span className="mu sm">Topics I can answer from:</span>
                    <div className="row">
                      {c.available.map((t) => (
                        <Link className="chip" to="/learn" key={t.id}>
                          {t.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : null}
                {c.src && (
                  <div className="mu sm">
                    Source: {nm(c.src)} notes · <Link to="/learn">open</Link>
                  </div>
                )}
              </div>
            ))
          ) : (
            <>
              <p className="mu">Ask about any course concept. Try one of these:</p>
              <div className="row">
                {EXAMPLES.map((ex) => (
                  <button key={ex} className="btn sm" onClick={() => ask(null, ex)}>
                    {ex}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <form onSubmit={ask} className="row" style={{ marginTop: 16 }}>
          <label htmlFor="aq" className="sr">
            Your question
          </label>
          <input
            id="aq"
            style={{ flex: 1, margin: 0 }}
            maxLength={200}
            placeholder="Ask about a course concept"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn p">Ask</button>
        </form>
      </div>
    </>
  );
}
