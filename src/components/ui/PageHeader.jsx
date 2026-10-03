export default function PageHeader({ title, sub, action }) {
  return (
    <div className="hd">
      <div>
        <h1>{title}</h1>
        {sub ? <p className="mu">{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}
