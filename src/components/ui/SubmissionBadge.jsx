import StatusIcon from './StatusIcon';

const SHORT = {
  pending: ['info', 'dot', 'Pending'],
  verified: ['ok', 'check', 'Verified'],
  revise: ['warn', 'alert', 'Revision'],
};
const LONG = { pending: 'Pending review', verified: 'Verified', revise: 'Revision requested' };

export default function SubmissionBadge({ status, long = false }) {
  const key = SHORT[status] ? status : 'revise';
  const [cls, shape, label] = SHORT[key];
  return (
    <span className={`bd ${cls}`}>
      <StatusIcon shape={shape} />
      {long ? LONG[key] : label}
    </span>
  );
}
