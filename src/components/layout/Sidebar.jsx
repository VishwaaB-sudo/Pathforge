import { NavLink } from 'react-router-dom';
import { NAV, moreLinks } from '@/config/nav';
import { useApp } from '@/context/AppContext';
import BrandMark from '@/components/ui/BrandMark';

/** Minimal inline stroke icons, keyed by route. No icon dependency required. */
const PATHS = {
  '/dash': 'M3 9.5 9 4l6 5.5M5 8.5V15h8V8.5',
  '/learn': 'M4 5.5A1.5 1.5 0 0 1 5.5 4H8a1 1 0 0 1 1 1v9a1 1 0 0 0-1-1H5.5A1.5 1.5 0 0 1 4 11.5zM14 5.5A1.5 1.5 0 0 0 12.5 4H10a1 1 0 0 0-1 1v9a1 1 0 0 1 1-1h2.5A1.5 1.5 0 0 0 14 11.5z',
  '/diag': 'M3 9h2.5l1.5-4 2.5 8L11 9h2',
  '/recovery': 'M4 9a5 5 0 0 1 8.5-3.5M14 9a5 5 0 0 1-8.5 3.5M12.5 3v2.5H10M5.5 15v-2.5H8',
  '/prac': 'M9 3v2M9 13v2M3 9h2M13 9h2M9 6.2A2.8 2.8 0 1 0 9 11.8 2.8 2.8 0 0 0 9 6.2z',
  '/task': 'M5 3.5h8v11H5zM7 7h4M7 10h4',
  '/pass': 'M9 2.5l2 1.4 2.4-.2.9 2.2 2 1.3-1 2.2 1 2.2-2 1.3-.9 2.2-2.4-.2-2 1.4-2-1.4-2.4.2-.9-2.2-2-1.3 1-2.2-1-2.2 2-1.3.9-2.2L7 3.9zM7.3 9l1.3 1.3L11 7.5',
  '/mist': 'M4 9a5 5 0 1 0 1.5-3.5M4 3v2.5h2.5',
  '/ask': 'M3.5 4.5h11v7h-4l-3 3v-3h-4z',
  '/insights': 'M3 3.5h12v11H3zM3 7h12M7 7v7.5M3 11h12',
  '/comp': 'M9 3 3.5 6 9 9l5.5-3zM3.5 9.5 9 12.5l5.5-3M3.5 12.5 9 15.5l5.5-3',
  '/ftasks': 'M5 3.5h8v11H5zM7.5 7l1 1 2-2M7.5 11h3',
  '/subs': 'M3 4.5h12v9H3zM3 10h3l1 1.8h4L12 10h3',
  '/anal': 'M4 15V8M9 15V4M14 15v-5',
  '/res': 'M4 3.5h6l4 4V15H4zM10 3.5v4h4',
  '/acon': 'M9 3 3.5 6 9 9l5.5-3zM3.5 9.5 9 12.5l5.5-3',
  '/aq': 'M9 3a6 6 0 1 0 0 12A6 6 0 0 0 9 3zM7.4 7.2a1.6 1.6 0 1 1 2.2 1.5c-.6.3-.6.8-.6 1.3M9 12.3v.1',
  '/ares': 'M4 3.5h7l3 3V15H4zM6.5 8.5h5M6.5 11h5',
  '/ausers': 'M6.5 9a2.2 2.2 0 1 0 0-4.4A2.2 2.2 0 0 0 6.5 9zM2.5 14.5c0-2 1.8-3.2 4-3.2s4 1.2 4 3.2M12 5.2a2 2 0 0 1 0 3.9M13 11.4c1.6.3 2.7 1.4 2.7 3.1',
  '/notif': 'M9 3a3.5 3.5 0 0 0-3.5 3.5c0 3-1 4-1 4h9s-1-1-1-4A3.5 3.5 0 0 0 9 3zM7.8 13a1.3 1.3 0 0 0 2.4 0',
  '/prof': 'M9 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM4 14.5c0-2.2 2.2-3.5 5-3.5s5 1.3 5 3.5',
};

function Ico({ to }) {
  const d = PATHS[to];
  if (!d) return null;
  return (
    <svg className="nav-ico" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const Item = ({ to, label }) => (
  <NavLink to={to} title={label} className={({ isActive }) => `ni${isActive ? ' on' : ''}`}>
    <Ico to={to} />
    {/* label stays in the DOM so collapsed icon-only links keep an accessible name */}
    <span className="ni-label">{label}</span>
  </NavLink>
);

export default function Sidebar({ role }) {
  const { user } = useApp();
  return (
    <aside aria-label="Main navigation">
      <div className="brand">
        <BrandMark />
        <span className="brand-text">
          PathForge
          <small>Learn · Apply · Prove</small>
        </span>
      </div>
      <nav>
        {NAV[role].map(([group, items]) => (
          <div key={group || 'main'}>
            {group ? <div className="gl">{group}</div> : null}
            {items.map(([to, label]) => (
              <Item key={to} to={to} label={label} />
            ))}
          </div>
        ))}
        <div className="sec">
          <div className="gl">More</div>
          {moreLinks(role).map(([to, label]) => (
            <Item key={to} to={to} label={label} />
          ))}
        </div>
      </nav>
      {user ? (
        <div className="side-user">
          <span className="side-user-av" aria-hidden="true">
            {user.n[0]}
          </span>
          <span className="side-user-meta">
            <b>{user.n}</b>
            <span>{role}</span>
          </span>
        </div>
      ) : null}
    </aside>
  );
}
