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

function Widget({ content, onDragStart, size, onResize, maxSize, columnWidth }) {
  const stopDrag = (event) => event.stopPropagation();

  const startResizeDrag = (event) => {
    event.stopPropagation();
    event.preventDefault();

    const widgetElement = event.currentTarget.closest("[data-widget]");
    const startingWidth =
      widgetElement?.getBoundingClientRect().width || columnWidth * size || 1;
    const effectiveColumnWidth = columnWidth || startingWidth / size || 1;
    const startX = event.clientX;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = startingWidth + deltaX;
      const nextSize = Math.round(newWidth / effectiveColumnWidth);
      const clamped = Math.min(maxSize, Math.max(1, nextSize));
      onResize(clamped);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

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
          justifyContent: "space-between",
          gap: "0.75rem",
          backgroundColor: "#dfe4ea",
          borderRadius: "0 0 5px 5px",
          boxSizing: "border-box",
          borderTop: "1px solid #c8d6e5",
          userSelect: "none",
        }}
      >
        <span style={{ color: "#57606a", fontSize: "0.8rem" }}>
          Tamaño: {size} / {maxSize} columnas
        </span>
        <button
          onMouseDown={startResizeDrag}
          aria-label="Arrastra para cambiar el tamaño"
          style={{
            width: "1.5rem",
            height: "1.5rem",
            border: "1px solid #c8d6e5",
            borderRadius: "4px",
            background: "linear-gradient(135deg, transparent 50%, #ced6e0 50%)",
            backgroundColor: "#f1f2f6",
            cursor: "se-resize",
            position: "relative",
            padding: 0,
          }}
        >
          <span
            aria-hidden
            style={{
              position: "absolute",
              bottom: "0.25rem",
              right: "0.25rem",
              width: "0.75rem",
              height: "0.75rem",
              borderRight: "2px solid #a4b0be",
              borderBottom: "2px solid #a4b0be",
              boxSizing: "border-box",
            }}
          />
        </button>
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
            columnWidth={columnWidth}
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
