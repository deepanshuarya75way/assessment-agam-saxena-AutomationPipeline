const nodeColors = {
  customInput: '#6366f1',
  llm: '#7c3aed',
  customOutput: '#ec4899',
  text: '#f59e0b',
  note: '#eab308',
  delay: '#64748b',
  transform: '#06b6d4',
  condition: '#f97316',
  merge: '#8b5cf6',
};

const nodeIcons = {
  customInput: 'IN',
  llm: 'AI',
  customOutput: 'OUT',
  text: 'TXT',
  note: 'N',
  delay: '⏱',
  transform: 'T',
  condition: 'IF',
  merge: 'M',
};

export const DraggableNode = ({
  type,
  label,
}) => {
  const color =
    nodeColors[type] ||
    '#6366f1';

  const icon =
    nodeIcons[type] ||
    label.charAt(0);

  const onDragStart = (
    event
  ) => {
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({
        nodeType: type,
      })
    );

    event.dataTransfer.effectAllowed =
      'move';
  };

  return (
    <div
      draggable
      className="palette-node"
      onDragStart={onDragStart}
      style={{
        '--palette-color': color,
      }}
    >
      <span
        className="palette-icon"
        style={{
          background: color,
        }}
      >
        {icon}
      </span>

      <span className="palette-label">
        {label}
      </span>

      <span className="drag-grip">
        ⋮⋮
      </span>
    </div>
  );
};