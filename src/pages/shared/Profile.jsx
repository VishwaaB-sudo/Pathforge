import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useUi } from '@/context/UiContext';
import PageHeader from '@/components/ui/PageHeader';

export default function Profile() {
  const { user, role, resetData } = useApp();
  const { askConfirm } = useUi();
  const navigate = useNavigate();
  const reset = async () => {
    const ok = await askConfirm({
      title: 'Reset all demo data?',
      body: 'Every result, submission and verification will be restored to the original seed data.',
      confirmLabel: 'Reset demo data',
      danger: true,
    });
    if (!ok) return;
    resetData();
    navigate('/');
  };
  if (!user) return null;
  return (
    <>
      <PageHeader title="Settings & Profile" />
      <div className="card">
        <p>
          <b>{user.n}</b> · {user.role}
        </p>
        <p className="mu">{user.e} · Pilot: Programming Fundamentals (CSE/IT)</p>
        {role === 'student' && (
          <p className="sm">
            <b>Privacy:</b> we keep your answers, mistakes, submissions and faculty feedback.
            Faculty can see them; other students cannot. Consent given.
          </p>
        )}
        <button className="btn" onClick={reset}>
          Reset demo data
        </button>
      </div>
    </>
  );
}
