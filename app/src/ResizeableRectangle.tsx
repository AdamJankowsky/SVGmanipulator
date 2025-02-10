import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";

const ResizableRectangle = () => {
  const [rect, setRect] = useState({
    x: 50,
    y: 50,
    width: 200,
    height: 100,
  });

  const [isResizing, setIsResizing] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [validate, setValidate] = useState(false);

  const [message, setMessage] = useState<string | undefined>(undefined);

  useEffect(() => {
    axios.get("settings").then((resp) => {
      setSettingsLoaded(true);
      setRect((old) => ({
        ...old,
        width: resp.data.width,
        height: resp.data.height,
      }));
    });
  }, []);

  useEffect(() => {
    if (validate) {
      const intErnalcontroller = new AbortController();
      axios
        .put(
          "rectangle/validate",
          { width: Math.round(rect.width), height: Math.round(rect.height) },
          { signal: intErnalcontroller.signal }
        )
        .catch((e) => setMessage(e?.response?.data))
        .then((r) => {
          if (r?.status !== 200) return;
          updateSettings();
          setValidate(false);
        });
      return () => {
        intErnalcontroller.abort();
      };
    }
  }, [validate]);

  const updateSettings = useCallback(() => {
    axios.put("settings", {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    });
    setMessage("Settings saved");
  }, [rect.height, rect.width]);

  const handleMouseDown = () => {
    setIsResizing(true);
    setValidate(false);
    setMessage(undefined);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!isResizing) return;

    const svg = (e.target as Element).closest("svg");
    const svgRect = svg!.getBoundingClientRect();
    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;

    const newWidth = mouseX - rect.x;
    const newHeight = mouseY - rect.y;

    if (newWidth > 0 && newHeight > 0) {
      setRect((prev) => ({
        ...prev,
        width: newWidth,
        height: newHeight,
      }));
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setValidate(true);
  };

  const perimeter = (2* Math.round(rect.height)) + (2 * Math.round(rect.width));

  return (
    <div>
      {!settingsLoaded ? (
        <p>Loading...</p>
      ) : (
        <svg
          width="600"
          height="600"
          style={{ border: "1px solid #ddd" }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <rect
            x={rect.x}
            y={rect.y}
            width={rect.width}
            height={rect.height}
            fill="#add8e6"
            stroke="#000"
            strokeWidth="2"
          />
          <circle
            cx={rect.x + rect.width}
            cy={rect.y + rect.height}
            r="6"
            fill="black"
            style={{ cursor: "pointer" }}
            onMouseDown={handleMouseDown}
          />
        </svg>
      )}
      <p>Perimeter: {perimeter}</p>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ResizableRectangle;
