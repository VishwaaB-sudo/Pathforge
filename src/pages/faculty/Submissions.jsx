import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import PageHeader from '@/components/ui/PageHeader';
import DemoTag from '@/components/ui/DemoTag';
import SubmissionBadge from '@/components/ui/SubmissionBadge';
import ReviewForm from './ReviewForm';

/** /subs = list of submissions, /subs/:id = review screen. */
export default function Submissions() {
  const { S } = useApp();
  const { id } = useParams();
  const navigate = useNavigate();
  const selected = id && S.subs.find((x) => x.id === id);

  if (selected) return <ReviewForm key={selected.id + selected.status} submission={selected} />;

  return (
    <>
      <PageHeader
        title="Submissions"
        sub={
          <>
            Applied task reviews <DemoTag />
          </>
        }
      />
      <div className="card tw">
        <table>
          <thead>
            <tr>
              <th>Student</th>
              <th>Applied task</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {S.subs
              .slice()
              .reverse()
              .map((s) => (
                <tr key={s.id}>
                  <td>{s.who}</td>
                  <td>{S.tasks.find((t) => t.id === s.tid)?.title || '—'}</td>
                  <td>
                    <SubmissionBadge status={s.status} long />
                  </td>
                  <td>
                    <button className="btn sm" onClick={() => navigate('/subs/' + s.id)}>
                      {s.status === 'pending' ? 'Review' : 'Open'}
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
