import { useApp } from '@/context/AppContext';
import PageHeader from '@/components/ui/PageHeader';

export default function AdminDashboard() {
  const { S } = useApp();
  return (
    <>
      <PageHeader title="Admin" sub="Manage course content." />
      <div className="mets">
        <div className="met">
          <span className="mu sm">Concepts</span>
          <b>{S.concepts.length}</b>
        </div>
        <div className="met">
          <span className="mu sm">Questions</span>
          <b>{S.qs.length}</b>
        </div>
        <div className="met">
          <span className="mu sm">Users</span>
          <b>{S.users.length + S.roster.length}</b>
        </div>
        <div className="met">
          <span className="mu sm">Applied tasks</span>
          <b>1</b>
        </div>
      </div>
    </>
  );
}
