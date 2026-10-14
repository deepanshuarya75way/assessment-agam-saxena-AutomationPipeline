import { useState } from 'react';

import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const NoteNode = ({ id, data }) => {
  const updateNodeField = useStore(
    (state) => state.updateNodeField
  );

  const [note, setNote] = useState(
    data?.note ||
      'Add documentation for this workflow...'
  );

  const handleChange = (event) => {
    const value =
      event.target.value;

    setNote(value);

    updateNodeField(
      id,
      'note',
      value
    );
  };

  return (
    <BaseNode
      title="Note"
      subtitle="Document your workflow"
      icon="N"
      color="#eab308"
    >
      <label className="field-label">
        Note

        <textarea
          className="field-control text-area"
          rows={5}
          value={note}
          onChange={handleChange}
        />
      </label>
    </BaseNode>
  );
};