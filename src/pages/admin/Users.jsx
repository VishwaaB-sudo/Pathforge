import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useUi } from '@/context/UiContext';
import { addUser, removeUser } from '@/lib/domain';
import PageHeader from '@/components/ui/PageHeader';

const EMAIL_RE = /^[\w.+-]+@[\w-]+(\.[\w-]+)+$/;
const EMPTY = { n: '', e: '', role: 'student', d: 'CSE' };

export default function Users() {
  const { S, update } = useApp();
  const { toast, askConfirm } = useUi();
  const [f, setF] = useState(EMPTY);
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));

  const add = () => {
    const n = f.n.trim();
    const e = f.e.trim().toLowerCase();
    if (n.length < 2 || !EMAIL_RE.test(e)) return toast('Enter a name and a valid email.');
    if (S.users.some((u) => u.e === e)) return toast('That email already exists.');
    update((d) => addUser(d, { e, n, role: f.role, d: f.d }));
    setF(EMPTY);
    toast('User added. Password: demo123');
  };
  const remove = async (email) => {
    const ok = await askConfirm({
      title: 'Delete this user?',
      body: `${email} will no longer be able to sign in.`,
      confirmLabel: 'Delete user',
      danger: true,
    });
    if (ok) update((d) => removeUser(d, email));
  };

  return (
    <>
      <PageHeader
        title="Users"
        sub="Add faculty, admin or student accounts. New accounts use password demo123."
      />
      <div className="card tw">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Dept</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {S.users.map((u, i) => (
              <tr key={u.e}>
                <td>{u.n}</td>
                <td>{u.e}</td>
                <td>{u.role}</td>
                <td>{u.d || 'CSE'}</td>
                <td>
                  {i > 2 && (
                    <button className="btn sm" onClick={() => remove(u.e)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mu sm" style={{ marginTop: 8 }}>
          Plus {S.roster.length} demo students (DEMO DATA).
        </p>
      </div>
      <div className="card">
        <h3>Add user</h3>
        <label htmlFor="un">Name</label>
        <input id="un" maxLength={40} value={f.n} onChange={set('n')} />
        <label htmlFor="ue">Email</label>
        <input id="ue" type="email" maxLength={60} value={f.e} onChange={set('e')} />
        <label htmlFor="ur">Role</label>
        <select id="ur" value={f.role} onChange={set('role')}>
          <option value="student">student</option>
          <option value="faculty">faculty</option>
          <option value="admin">admin</option>
        </select>
        <label htmlFor="ud">Department</label>
        <select id="ud" value={f.d} onChange={set('d')}>
          <option>CSE</option>
          <option>IT</option>
        </select>
        <button className="btn p" onClick={add}>
          Add user
        </button>
      </div>
    </>
  );
}
