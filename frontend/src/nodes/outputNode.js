import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const OutputNode = ({ id, data }) => {
  const updateNodeField = useStore(
    (state) => state.updateNodeField
  );

  const name = data?.name ?? 'output';
  const outputType = data?.outputType ?? 'Text';

  const update = (field) => (event) =>
    updateNodeField(id, field, event.target.value);

  return (
    <BaseNode
      title="Output"
      subtitle="Pipeline destination"
      icon="OUT"
      color="#ec4899"
      inputs={[{ id: `${id}-input` }]}
    >
      <label className="field-label">
        Name

        <input
          className="field-control"
          value={name}
          onChange={update('name')}
        />
      </label>

      <label className="field-label">
        Output type

        <select
          className="field-control"
          value={outputType}
          onChange={update('outputType')}
        >
          <option>Text</option>
          <option>File</option>
          <option>JSON</option>
        </select>
      </label>
    </BaseNode>
  );
};
