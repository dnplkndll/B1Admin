import type { CSSProperties } from "react";
import React, { useEffect } from "react";
import { useDrop } from "react-dnd";
import { Locale } from "@churchapps/apphelper";

type Props = {
  children?: React.ReactNode;
  accept: any;
  onDrop: (data: any) => void;
  dndDeps?: any;
  updateIsDragging?: (isDragging: boolean) => void;
  hideWhenInactive?: boolean;
};

export function DroppableWrapper(props: Props) {
  const { accept, onDrop, dndDeps, updateIsDragging, hideWhenInactive, children } = props;

  const [isDragging, setIsDragging] = React.useState(false);

  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept,
      drop: (data) => {
        onDrop(data);
      },
      canDrop: (_item, _monitor) => {
        const canDropResult = true;
        return canDropResult;
      },
      collect: (monitor) => {
        const isOver = !!monitor.isOver({ shallow: true });
        const itemType = monitor.getItemType();
        const acceptTypes = Array.isArray(accept) ? accept : [accept];
        const matchesType = itemType ? acceptTypes.includes(itemType as string) : false;
        return { isOver, canDrop: matchesType };
      }
    }),
    [accept, onDrop, dndDeps]
  );

  // Update dragging state via effect to avoid state updates during render
  useEffect(() => {
    setIsDragging(canDrop);
  }, [canDrop]);

  useEffect(() => {
    if (updateIsDragging) updateIsDragging(isDragging);
  }, [isDragging, updateIsDragging]);

  // Reserve identical box geometry to prevent reflow when canDrop changes mid-drag (use longhand border properties to avoid React's conflicting-property error).
  const baseStyle: CSSProperties = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "transparent",
    borderRadius: "4px"
  };

  // Use opacity not visibility so hit-testing still works when hidden.
  const hidden = hideWhenInactive && !canDrop;

  const dropZoneStyle: CSSProperties = canDrop ? {
    ...baseStyle,
    zIndex: 1,
    backgroundColor: isOver ? "rgba(25, 118, 210, 0.15)" : "rgba(25, 118, 210, 0.08)",
    borderStyle: "dashed",
    borderColor: isOver ? "rgba(25, 118, 210, 0.8)" : "rgba(25, 118, 210, 0.3)",
    transition: "background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
  } : { ...baseStyle, ...(hidden ? { opacity: 0 } : {}) };

  return (
    <div ref={drop as any} style={dropZoneStyle} data-testid="droppable-wrapper" aria-label={Locale.label("components.droppableWrapper.ariaLabel")}>
      {children}
    </div>
  );
}
