import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useUi } from '@/context/UiContext';
import { saveResource } from '@/lib/domain';
import PageHeader from '@/components/ui/PageHeader';

function ResourceCard({ concept }) {
  const { S, update } = useApp();
  const { toast } = useUi();
  const [notes, setNotes] = useState(S.res[concept.id]?.notes || '');
  const [ex, setEx] = useState(S.res[concept.id]?.ex || '');
  const save = () => {
    update((d) => saveResource(d, concept.id, { notes: notes.trim(), ex }));
    toast('Saved.');
  };
  return (
    <div className="card">
      <h3>{concept.name}</h3>
      <label htmlFor={`n_${concept.id}`}>Notes</label>
      <textarea
        id={`n_${concept.id}`}
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <label htmlFor={`e_${concept.id}`}>Example</label>
      <textarea
        id={`e_${concept.id}`}
        rows={3}
        value={ex}
        onChange={(e) => setEx(e.target.value)}
      />
      <button className="btn" onClick={save}>
        Save
      </button>
    </div>
  );
}

export default function AdminResources() {
  const { S } = useApp();
  return (
    <>
      <PageHeader title="Resources" sub="Approved notes power Ask PathForge." />
      {S.concepts.map((c) => (
        <ResourceCard key={c.id} concept={c} />
      ))}
    </>
  );
}
