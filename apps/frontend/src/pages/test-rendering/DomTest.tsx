import { useEffect, useState } from 'react';

export default function DomTest() {
  const cols = 250;
  const rows = 200;
  const cells = Array.from({ length: cols * rows });
  const [tick, setTick] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning) return;

    const id = window.setInterval(() => {
      setTick((value) => value + 1);
    }, 80);

    return () => window.clearInterval(id);
  }, [isRunning]);

  return (
    <>
      <button
        className="rendering-test__button rendering-test__stop-button"
        onClick={() => setIsRunning((value) => !value)}
      >
        {isRunning ? 'Stop DOM updates' : 'Resume DOM updates'}
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 20px)`,
          width: cols * 20,
        }}
      >
        {cells.map((_, i) => (
          <div
            key={i}
            style={{
              width: 20,
              height: 16,
              border: '1px solid #ccc',
              boxSizing: 'border-box',
              backgroundColor: (i + tick) % 97 === 0 ? '#f97316' : '#fff',
              color: (i + tick) % 211 === 0 ? '#111827' : '#9ca3af',
              fontSize: 9,
              lineHeight: '16px',
              textAlign: 'center',
            }}
          >
            {(i + tick) % 1000}
          </div>
        ))}
      </div>
    </>
  );
}
