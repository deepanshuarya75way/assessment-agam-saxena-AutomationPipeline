import { useState } from 'react';

import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const DelayNode = ({ id, data }) => {
  const updateNodeField = useStore(
    (state) => state.updateNodeField
  );

  const [seconds, setSeconds] =
    useState(
      data?.seconds ?? '1'
    );

  const handleChange = (event) => {
    const value =
      event.target.value;

    setSeconds(value);

    updateNodeField(
      id,
      'seconds',
      value
    );
  };

  return (
    <BaseNode
      title="Delay"
      subtitle="Pause pipeline execution"
      icon="⏱"
      color="#64748b"
      inputs={[
        {
          id: `${id}-input`,
        },
      ]}
      outputs={[
        {
          id: `${id}-output`,
        },
      ]}
    >
      <label className="field-label">
        Delay seconds

        <input
          className="field-control"
          type="number"
          min="0"
          max="3600"
          value={seconds}
          onChange={handleChange}
        />
      </label>

      <div className="node-info">
        Execution continues after the
        configured delay.
      </div>
    </BaseNode>
  );
};