export default function Empty({ title, text, action, onAction }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p className="mu">{text}</p>
      {action ? (
        <button className="btn p" onClick={onAction}>
          {action}
        </button>
      ) : null}
    </div>
  );
}
