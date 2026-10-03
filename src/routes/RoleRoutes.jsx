import { Navigate, Route, Routes } from 'react-router-dom';

import StudentDashboard from '@/pages/student/Dashboard';
import { Learn, Resources } from '@/pages/student/Learn';
import Diagnostics from '@/pages/student/Diagnostics';
import Result from '@/pages/student/Result';
import Recovery from '@/pages/student/Recovery';
import Practice from '@/pages/student/Practice';
import Run from '@/pages/student/Run';
import Task from '@/pages/student/Task';
import Passport from '@/pages/student/Passport';
import Mistakes from '@/pages/student/Mistakes';
import Ask from '@/pages/student/Ask';

import FacultyDashboard from '@/pages/faculty/Dashboard';
import Insights from '@/pages/faculty/Insights';
import Competencies from '@/pages/faculty/Competencies';
import FacultyTasks from '@/pages/faculty/Tasks';
import Submissions from '@/pages/faculty/Submissions';
import Analytics from '@/pages/faculty/Analytics';
import StudentDetail from '@/pages/faculty/StudentDetail';

import AdminDashboard from '@/pages/admin/Dashboard';
import Concepts from '@/pages/admin/Concepts';
import Questions from '@/pages/admin/Questions';
import AdminResources from '@/pages/admin/Resources';
import AdminTask from '@/pages/admin/Task';
import Users from '@/pages/admin/Users';

import Notifications from '@/pages/shared/Notifications';
import Profile from '@/pages/shared/Profile';
import Search from '@/pages/shared/Search';

const shared = [
  ['/notif', Notifications],
  ['/prof', Profile],
];

const ROUTES = {
  student: [
    ['/dash', StudentDashboard],
    ['/learn', Learn],
    ['/res', Resources],
    ['/diag', Diagnostics],
    ['/result/:which', Result],
    ['/recovery', Recovery],
    ['/prac', Practice],
    ['/run', Run],
    ['/task', Task],
    ['/task/:tid/:tab?', Task],
    ['/pass', Passport],
    ['/mist', Mistakes],
    ['/ask', Ask],
    ['/search', Search],
    ...shared,
  ],
  faculty: [
    ['/dash', FacultyDashboard],
    ['/insights', Insights],
    ['/comp', Competencies],
    ['/ftasks', FacultyTasks],
    ['/subs/:id?', Submissions],
    ['/anal', Analytics],
    ['/stu/:name', StudentDetail],
    ['/search', Search],
    ...shared,
  ],
  admin: [
    ['/dash', AdminDashboard],
    ['/acon', Concepts],
    ['/aq', Questions],
    ['/ares', AdminResources],
    ['/atask', AdminTask],
    ['/ausers', Users],
    ...shared,
  ],
};

/** Routes available to a role. Anything else falls back to the dashboard. */
export default function RoleRoutes({ role }) {
  return (
    <Routes>
      {ROUTES[role].map(([path, Page]) => (
        <Route key={path} path={path} element={<Page />} />
      ))}
      <Route path="*" element={<Navigate to="/dash" replace />} />
    </Routes>
  );
}
