import { Handle, Position } from 'reactflow';

const DEFAULT_COLOR = '#6366f1';

const createHandleStyle = (position, color, top) => ({
  width: 11,
  height: 11,
  top,
  background: color,
  border: '2px solid #ffffff',
  boxShadow: `0 0 0 1px ${color}55`,
  ...(position === Position.Left
    ? { left: -7 }
    : { right: -7 }),
});

export const BaseNode = ({
  title,
  subtitle,
  icon,
  color = DEFAULT_COLOR,
  children,
  inputs = [],
  outputs = [],
  width = 260,
  minHeight,
}) => {
  const renderHandle = (
    handle,
    index,
    defaultPosition,
    defaultType
  ) => {
    const position =
      handle.position || defaultPosition;

    const type =
      handle.type || defaultType;

    const top =
      handle.top ||
      `${55 + index * 30}px`;

    return (
      <Handle
        key={handle.id}
        id={handle.id}
        type={type}
        position={position}
        title={handle.label || handle.id}
        style={createHandleStyle(
          position,
          color,
          top
        )}
      />
    );
  };

  return (
    <div
      className="pipeline-node"
      style={{
        width,
        minHeight,
        '--node-color': color,
      }}
    >
      {/* INPUT HANDLES */}

      {inputs.map((handle, index) =>
        renderHandle(
          handle,
          index,
          Position.Left,
          'target'
        )
      )}

      {/* OUTPUT HANDLES */}

      {outputs.map((handle, index) =>
        renderHandle(
          handle,
          index,
          Position.Right,
          'source'
        )
      )}

      {/* HEADER */}

      <div className="node-header">
        <div
          className="node-icon"
          style={{
            background: color,
          }}
        >
          {icon || title.charAt(0)}
        </div>

        <div className="node-heading">
          <div className="node-title">
            {title}
          </div>

          {subtitle && (
            <div className="node-subtitle">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}

      <div className="node-body">
        {children}
      </div>
    </div>
  );
};