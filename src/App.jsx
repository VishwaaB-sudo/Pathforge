import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { getMe } from '@/lib/domain';
import Login from '@/pages/auth/Login';
import Consent from '@/pages/auth/Consent';
import AppShell from '@/components/layout/AppShell';
import Toast from '@/components/ui/Toast';
import Dialog from '@/components/ui/Dialog';
import DiagnosticPicker from '@/components/ui/DiagnosticPicker';

export default function App() {
  const { S, role } = useApp();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false); // mobile drawer
  const [collapsed, setCollapsed] = useState(false); // desktop sidebar hidden

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  const toggleNav = () => (window.innerWidth < 801 ? setOpen((o) => !o) : setCollapsed((c) => !c));

  let content;
  if (!role) content = <Login />;
  else if (role === 'student' && !getMe(S).consent) content = <Consent />;
  else content = <AppShell onToggleNav={toggleNav} />;

  return (
    <div id="app" className={[open && 'open', collapsed && 'col'].filter(Boolean).join(' ')}>
      <div className="bgfield" aria-hidden="true">
        <i />
        <b />
      </div>
      {content}
      <div className="scrim" onClick={() => setOpen(false)} />
      <Toast />
      <Dialog />
      <DiagnosticPicker />
    </div>
  );
}