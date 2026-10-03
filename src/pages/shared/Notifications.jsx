import { useApp } from '@/context/AppContext';
import { date } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import Empty from '@/components/ui/Empty';

export default function Notifications() {
  const { S, role, user } = useApp();
  const items = S.notes.filter((x) => x.role === role && (!x.to || x.to === user.e)).reverse();
  return (
    <>
      <PageHeader title="Notifications" />
      {items.length ? (
        <div className="card">
          {items.map((x, i) => (
            <div className="lr sm" key={i}>
              <span>{x.t}</span>
              <span className="mu">{date(x.at)}</span>
            </div>
          ))}
        </div>
      ) : (
        <Empty title="Nothing new" text="Updates about your work will show up here." />
      )}
    </>
  );
}
