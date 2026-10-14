import { useState } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const OutputNode = ({ id, data }) => {
  const updateNodeField = useStore(
    (state) => state.updateNodeField
  );

  const [name, setName] = useState(
    data?.name || 'output'
  );

  const [outputType, setOutputType] =
    useState(
      data?.outputType || 'Text'
    );

  const update = (field, setter) => (event) => {
    const value = event.target.value;

    setter(value);

    updateNodeField(
      id,
      field,
      value
    );
  };

  return (
    <BaseNode
      title="Output"
      subtitle="Pipeline destination"
      icon="OUT"
      color="#ec4899"
      inputs={[
        {
          id: `${id}-input`,
        },
      ]}
    >
      <label className="field-label">
        Name

        <input
          className="field-control"
          value={name}
          onChange={update(
            'name',
            setName
          )}
        />
      </label>

      <label className="field-label">
        Output type

        <select
          className="field-control"
          value={outputType}
          onChange={update(
            'outputType',
            setOutputType
          )}
        >
          <option>Text</option>
          <option>File</option>
          <option>JSON</option>
        </select>
      </label>
    </BaseNode>
  );
};