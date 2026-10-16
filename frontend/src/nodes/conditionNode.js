import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const ConditionNode = ({
  id,
  data,
}) => {
  const updateNodeField = useStore(
    (state) => state.updateNodeField
  );

  const condition = data?.condition ?? 'value !== null';

  const handleChange = (event) => {
    const value =
      event.target.value;


    updateNodeField(
      id,
      'condition',
      value
    );
  };

  return (
    <BaseNode
      title="Condition"
      subtitle="Branch the workflow"
      icon="IF"
      color="#f97316"
      inputs={[
        {
          id: `${id}-input`,
        },
      ]}
      outputs={[
        {
          id: `${id}-true`,
          label: 'True',
          top: '45%',
        },
        {
          id: `${id}-false`,
          label: 'False',
          top: '75%',
        },
      ]}
    >
      <label className="field-label">
        Condition

        <input
          className="field-control"
          value={condition}
          onChange={handleChange}
        />
      </label>

      <div className="branch-labels">
        <span>TRUE</span>
        <span>FALSE</span>
      </div>
    </BaseNode>
  );
};