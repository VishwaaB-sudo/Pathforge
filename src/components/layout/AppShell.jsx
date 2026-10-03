import { useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import RoleRoutes from '@/routes/RoleRoutes';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/** Signed-in layout: sidebar, top bar and the routed page. */
export default function AppShell({ onToggleNav }) {
  const { role } = useApp();
  const { pathname } = useLocation();
  if (!role) return null;
  return (
    <>
      <Sidebar role={role} />
      <div className="main">
        <Topbar onToggleNav={onToggleNav} />
        {/* key restarts the page entrance animation on every navigation.
            The quiz route gets a narrow, distraction-free column. */}
        <main
          className={pathname === '/run' ? 'page focus' : 'page'}
          id="main"
          key={pathname}
        >
          <RoleRoutes role={role} />
        </main>
      </div>
    </>
  );
}
