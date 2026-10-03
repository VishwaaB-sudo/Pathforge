import { useSelectors } from '@/hooks/useSelectors';
import PageHeader from '@/components/ui/PageHeader';
import DemoTag from '@/components/ui/DemoTag';
import Empty from '@/components/ui/Empty';
import Heatmap from '@/components/Heatmap';

export default function Insights() {
  const { rost } = useSelectors();
  const rows = rost().filter((r) => r.pre);

  return (
    <>
      <PageHeader
        title="Class Insights"
        sub={
          <>
            Misconception heatmap <DemoTag />
          </>
        }
      />
      {rows.length ? (
        <div className="card">
          <Heatmap rows={rows} />
        </div>
      ) : (
        <Empty
          title="No assessed students yet"
          text="The heatmap fills in as students complete the starting diagnostic. Demo class data is already loaded."
        />
      )}
    </>
  );
}
