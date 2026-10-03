// Sidebar structure per role: [group label, [[path, label], ...]]
export const NAV = {
  student: [
    [
      'LEARN',
      [
        ['/dash', 'Dashboard'],
        ['/learn', 'My Learning'],
        ['/diag', 'Diagnostics'],
        ['/recovery', 'Recovery Plans'],
        ['/prac', 'Practice'],
      ],
    ],
    [
      'APPLY',
      [
        ['/task', 'Applied Tasks'],
        ['/pass', 'Skill Passport'],
      ],
    ],
    [
      'SUPPORT',
      [
        ['/mist', 'My Mistakes'],
        ['/ask', 'Ask PathForge'],
      ],
    ],
  ],
  faculty: [
    [
      '',
      [
        ['/dash', 'Dashboard'],
        ['/insights', 'Class Insights'],
        ['/comp', 'Competencies'],
        ['/ftasks', 'Tasks'],
        ['/subs', 'Submissions'],
        ['/anal', 'Analytics'],
      ],
    ],
  ],
  admin: [
    [
      '',
      [
        ['/dash', 'Dashboard'],
        ['/acon', 'Concepts'],
        ['/aq', 'Questions'],
        ['/ares', 'Resources'],
        ['/atask', 'Tasks'],
        ['/ausers', 'Users'],
      ],
    ],
  ],
};

export const moreLinks = (role) => [
  ...(role === 'student' ? [['/res', 'Resources']] : []),
  ['/notif', 'Notifications'],
  ['/prof', 'Settings & Profile'],
];
