import React, { useEffect, useRef, useState } from "react";

const WIDGET_LIST = [
  { id: "a", content: "A", size: 1 },
  { id: "b", content: "B", size: 1 },
  { id: "c", content: "C", size: 1 },
  { id: "d", content: "D", size: 1 },
  { id: "e", content: "E", size: 2 },
  { id: "f", content: "F", size: 1 },
  { id: "g", content: "G", size: 1 },
  { id: "h", content: "H", size: 2 },
  { id: "i", content: "I", size: 1 },
  { id: "j", content: "J", size: 1 },
];

function Widget({ content, onDragStart, size, onResize, maxSize }) {
  const handleResize = (event) => {
    event.stopPropagation();
    onResize(Number(event.target.value));
  };

  const stopDrag = (event) => event.stopPropagation();

  return (
    <div
      data-widget
      style={{
        backgroundColor: "#eeeeee",
        borderRadius: "5px",
        minHeight: "5rem",
        display: "grid",
        gridTemplateRows: "1fr auto",
        alignItems: "stretch",
        fontSize: "2rem",
        position: "relative",
      }}
      onDragStart={onDragStart}
      draggable
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {content}
      </div>
      <div
        onMouseDown={stopDrag}
        onClick={stopDrag}
        style={{
          fontSize: "0.9rem",
          padding: "0.5rem 0.75rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          backgroundColor: "#dfe4ea",
          borderRadius: "0 0 5px 5px",
          boxSizing: "border-box",
          borderTop: "1px solid #c8d6e5",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.85rem",
          }}
        >
          <span style={{ color: "#57606a" }}>Tamaño</span>
          <input
            type="range"
            min={1}
            max={maxSize}
            value={size}
            onChange={handleResize}
          />
        </label>
        <span style={{ color: "#57606a", fontSize: "0.8rem" }}>
          {size} / {maxSize} columnas
        </span>
      </div>
    </div>
  );
}

function WidgetContainer({
  onDrop,
  children,
  onDragEnter,
  onDragLeave,
  isDraggedOver,
  size,
}) {
  return (
    <div
      style={
        isDraggedOver
          ? {
              border: "dashed 2px #abcdef",
              borderRadius: "5px",
              minHeight: "5rem",
              boxSizing: "border-box",
              gridColumn: `span ${size}`,
            }
          : { gridColumn: `span ${size}` }
      }
      onDrop={onDrop}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={(e) => e.preventDefault()}
    >
      {!isDraggedOver && children}
    </div>
  );
}

export function Dashboard() {
  const GRID_COLUMNS = 3;
  const [widgets, setWidgets] = useState(WIDGET_LIST);
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [draggedOverContainerId, setDraggedOverContainerId] = useState(null);
  const containerRef = useRef(null);
  const [columnWidth, setColumnWidth] = useState(0);

  useEffect(() => {
    const updateColumnWidth = () => {
      if (!containerRef.current) return;
      setColumnWidth(containerRef.current.offsetWidth / GRID_COLUMNS);
    };

    updateColumnWidth();
    window.addEventListener("resize", updateColumnWidth);
    return () => window.removeEventListener("resize", updateColumnWidth);
  }, []);

  const handleDragStart = (id) => setDraggedItemId(id);
  const handleDragEntered = (id) => setDraggedOverContainerId(id);
  const handleDragLeave = () => setDraggedOverContainerId(null);

  const handleDrop = () => {
    if (!draggedOverContainerId) {
      clearState();
      return;
    }

    const fromIndex = widgets.findIndex((w) => w.id === draggedItemId);
    const toIndex = widgets.findIndex((w) => w.id === draggedOverContainerId);
    setWidgets((w) => moveItem(w, fromIndex, toIndex));

    clearState();
  };

  const clearState = () => {
    setDraggedItemId(null);
    setDraggedOverContainerId(null);
  };

  const handleResize = (id, newSize) => {
    const nextSize = Math.min(GRID_COLUMNS, Math.max(1, newSize));
    setWidgets((current) =>
      current.map((widget) =>
        widget.id === id ? { ...widget, size: nextSize } : widget
      )
    );
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${GRID_COLUMNS}, 1fr)`,
        gridGap: "1rem",
      }}
      ref={containerRef}
    >
      {widgets.map((w, i) => (
        <WidgetContainer
          key={w.id}
          onDrop={handleDrop}
          onDragEnter={() => handleDragEntered(w.id)}
          onDragLeave={handleDragLeave}
          isDraggedOver={w.id === draggedOverContainerId}
          size={w.size}
        >
          <Widget
            content={w.content}
            size={w.size}
            maxSize={GRID_COLUMNS}
            onDragStart={() => handleDragStart(w.id)}
            onResize={(value) => handleResize(w.id, value)}
          />
        </WidgetContainer>
      ))}
    </div>
  );
}

export function moveItem(list, from, to) {
  const listClone = [...list];
  if (from < to) {
    listClone.splice(to + 1, 0, listClone[from]);
    listClone.splice(from, 1);
  } else if (to < from) {
    listClone.splice(to, 0, listClone[from]);
    listClone.splice(from + 1, 1);
  }
  return listClone;
}

// export function moveItemOriginal(list, from, to) {
//   console.log(`Swapping from ${from} to ${to}`);
//   if (from < to) {
//     return [
//       ...list.slice(0, from),
//       ...list.slice(from + 1, to + 1),
//       list[from],
//       ...list.slice(to + 1),
//     ];
//   } else if (to < from) {
//     return [
//       ...list.slice(0, to),
//       list[from],
//       ...list.slice(to, from),
//       ...list.slice(from + 1),
//     ];
//   }
//   return [...list];
// }
