export default function PowerTab({ onSend }) {
  return (
    <div style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
      <button onClick={() => onSend({ kind: 'power', on: true })}
        style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>On</button>
      <button onClick={() => onSend({ kind: 'power', on: false })}
        style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>Off</button>
    </div>
  );
}
