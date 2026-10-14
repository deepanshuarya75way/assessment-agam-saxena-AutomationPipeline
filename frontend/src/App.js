import { useEffect } from 'react';

import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import { useStore } from './store';

import './index.css';

const STORAGE_KEY =
  'vectorshift-pipeline';

function App() {
  const nodes = useStore(
    (state) => state.nodes
  );

  const edges = useStore(
    (state) => state.edges
  );

  const setPipeline = useStore(
    (state) => state.setPipeline
  );

  const clearPipeline =
    useStore(
      (state) =>
        state.clearPipeline
    );

  /*
   * Restore saved pipeline.
   */
  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      if (!saved) {
        return;
      }

      const parsed =
        JSON.parse(saved);

      if (
        Array.isArray(
          parsed.nodes
        ) &&
        Array.isArray(
          parsed.edges
        )
      ) {
        setPipeline(
          parsed.nodes,
          parsed.edges
        );
      }
    } catch (error) {
      console.error(
        'Failed to restore pipeline:',
        error
      );
    }
  }, [setPipeline]);

  /*
   * Save pipeline.
   */
  const savePipeline = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        nodes,
        edges,
      })
    );

    window.alert(
      'Pipeline saved successfully.'
    );
  };

  /*
   * Clear pipeline.
   */
  const clear = () => {
    const confirmed =
      window.confirm(
        'Clear the entire pipeline?'
      );

    if (!confirmed) {
      return;
    }

    clearPipeline();

    localStorage.removeItem(
      STORAGE_KEY
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">
            V
          </div>

          <div>
            <div className="brand-name">
              VectorShift
            </div>

            <div className="brand-product">
              Pipeline Builder
            </div>
          </div>
        </div>

        <div className="header-meta">
          <span className="status-dot" />

          <span>
            Local workspace
          </span>

          <span className="header-divider" />

          <span>
            {nodes.length} nodes
            {' · '}
            {edges.length} edges
          </span>
        </div>

        <div className="header-actions">
          <button
            className="header-button secondary"
            onClick={clear}
          >
            Clear
          </button>

          <button
            className="header-button"
            onClick={savePipeline}
          >
            Save
          </button>
        </div>
      </header>

      <div className="workspace">
        <PipelineToolbar />

        <main className="canvas-area">
          <div className="canvas-topbar">
            <div>
              <div className="canvas-title">
                Workflow canvas
              </div>

              <div className="canvas-subtitle">
                Design your pipeline by
                connecting nodes together.
              </div>
            </div>

            <div className="run-card">
              <span className="run-card-label">
                STATUS
              </span>

              <span className="run-card-value">
                {nodes.length > 0
                  ? 'Ready'
                  : 'Empty'}
              </span>
            </div>
          </div>

          <PipelineUI />

          <div className="submit-area">
            <SubmitButton />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;