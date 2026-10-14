import { useState } from 'react';
import { useStore } from './store';

const API_URL =
  process.env.REACT_APP_API_URL ||
  'http://127.0.0.1:8000';

export const SubmitButton = () => {
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);

  const [status, setStatus] = useState('idle');

  const handleSubmit = async () => {
    // ---------------------------------------------------------
    // Basic client-side validation
    // ---------------------------------------------------------

    if (!Array.isArray(nodes) || nodes.length === 0) {
      window.alert(
        'Add at least one node before running the pipeline.'
      );

      return;
    }

    if (!Array.isArray(edges)) {
      window.alert(
        'Invalid pipeline edges.'
      );

      return;
    }

    setStatus('loading');

    try {
      console.log('Sending pipeline to backend...');
      console.log('Nodes:', nodes);
      console.log('Edges:', edges);

      // -------------------------------------------------------
      // Send request to FastAPI
      // -------------------------------------------------------

      const response = await fetch(
        `${API_URL}/pipelines/parse`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },

          body: JSON.stringify({
            nodes,
            edges,
          }),
        }
      );

      // -------------------------------------------------------
      // Read response body
      // -------------------------------------------------------

      const responseText =
        await response.text();

      let result = null;

      try {
        result =
          responseText
            ? JSON.parse(responseText)
            : null;
      } catch {
        result = null;
      }

      // -------------------------------------------------------
      // Backend returned an error
      // -------------------------------------------------------

      if (!response.ok) {
        const backendMessage =
          result?.detail ||
          result?.message ||
          responseText ||
          'Unknown backend error';

        throw new Error(
          `Backend returned ${response.status}: ${backendMessage}`
        );
      }

      // -------------------------------------------------------
      // Validate backend response
      // -------------------------------------------------------

      if (
        !result ||
        typeof result.num_nodes !== 'number' ||
        typeof result.num_edges !== 'number' ||
        typeof result.is_dag !== 'boolean'
      ) {
        throw new Error(
          'Backend returned an invalid pipeline analysis response.'
        );
      }

      console.log(
        'Pipeline analysis:',
        result
      );

      setStatus('success');

      // -------------------------------------------------------
      // Show result
      // -------------------------------------------------------

      window.alert(
        [
          'Pipeline Analysis',
          '',
          `Nodes: ${result.num_nodes}`,
          `Edges: ${result.num_edges}`,
          `DAG: ${
            result.is_dag
              ? 'Yes — valid acyclic pipeline'
              : 'No — cycle detected'
          }`,
        ].join('\n')
      );

    } catch (error) {

      console.error(
        'Pipeline analysis failed:',
        error
      );

      setStatus('error');

      // -------------------------------------------------------
      // Show the REAL error instead of hiding it
      // -------------------------------------------------------

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      window.alert(
        [
          'Pipeline analysis failed.',
          '',
          message,
          '',
          'Backend:',
          `${API_URL}`,
          '',
          'Open the browser console (F12) for details.',
        ].join('\n')
      );

    } finally {

      // -------------------------------------------------------
      // Always return button to normal state
      // -------------------------------------------------------

      setStatus('idle');
    }
  };

  return (
    <button
      type="button"
      className="submit-button"
      onClick={handleSubmit}
      disabled={status === 'loading'}
    >
      {status === 'loading'
        ? 'Analyzing...'
        : 'Run Pipeline'}
    </button>
  );
};