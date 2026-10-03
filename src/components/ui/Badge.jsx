import StatusIcon from './StatusIcon';

/**
 * Semantic status: neutral = not started, blue = learning, amber = needs practice,
 * blue = practiced, violet = applied, green = faculty verified.
 * Colour is never the only signal: each state has a shape and a text label.
 */
const STATUS = {
  'Not Started': ['mute', 'ring'],
  Learning: ['info', 'dot'],
  'Needs Practice': ['warn', 'alert'],
  Practiced: ['info', 'dot'],
  Applied: ['violet', 'dot'],
  'Faculty Verified': ['ok', 'check'],
};

export default function Badge({ status }) {
  const [cls, shape] = STATUS[status] || ['mute', 'dot'];
  return (
    <span className={`bd ${cls}`}>
      <StatusIcon shape={shape} />
      {status}
    </span>
  );
}
