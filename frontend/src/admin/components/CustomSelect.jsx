import React, { useState, useEffect, useRef } from "react";
import "./CustomSelect.css";

export default function CustomSelect({ value, onChange, options, placeholder = "Select..." }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="csWrap" ref={ref}>
      <button
        type="button"
        className="csBtn"
        onClick={() => setOpen((v) => !v)}
      >
        <span className={value ? "csVal" : "csPh"}>
          {value || placeholder}
        </span>
        <span className="csArrow">▾</span>
      </button>

      {open && (
        <div className="csMenu">
          {options.map((opt) => (
            <button
              type="button"
              key={opt}
              className={"csItem" + (opt === value ? " selected" : "")}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
