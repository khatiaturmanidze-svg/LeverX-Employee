import DomTest from './DomTest';
import CanvasTest from './CanvasTest';
import WebGpuTest from './WebGpuTest';
import { useState } from 'react';

export default function TestRenderingPage() {
  const [mode, setMode] = useState<'dom' | 'canvas' | 'webgpu' | 'default'>(
    'default',
  );

  return (
    <main className="rendering-test">
      <header className="rendering-test__header">
        <h1>Rendering Test</h1>

        <div className="rendering-test__actions">
          <button
            className={
              mode === 'dom'
                ? 'rendering-test__button active'
                : 'rendering-test__button'
            }
            onClick={() => setMode('dom')}
          >
            DOM
          </button>
          <button
            className={
              mode === 'canvas'
                ? 'rendering-test__button active'
                : 'rendering-test__button'
            }
            onClick={() => setMode('canvas')}
          >
            Canvas
          </button>
          <button
            className={
              mode === 'webgpu'
                ? 'rendering-test__button active'
                : 'rendering-test__button'
            }
            onClick={() => setMode('webgpu')}
          >
            WebGPU
          </button>
        </div>
      </header>

      <section className="rendering-test__stage">
        {mode === 'default' && (
          <p className="rendering-test__empty">Choose a rendering mode.</p>
        )}
        {mode === 'dom' && <DomTest />}
        {mode === 'canvas' && <CanvasTest />}
        {mode === 'webgpu' && <WebGpuTest />}
      </section>
    </main>
  );
}
