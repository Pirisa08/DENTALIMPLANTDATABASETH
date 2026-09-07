import React from "react";
import "./AdminSearchBar.css";

export default function AdminSearchBar({
  placeholder = "Search",
  value = "",
  onChangeQ = () => {},
  onSearch = () => {},
}) {
  return (
    <div className="asbWrap">
      <div className="asbSearch">
        <span className="asbIcon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M20 20L17 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </span>

        <input
          type="text"
          value={value}
          onChange={(e) => onChangeQ(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSearch(value);
            }
          }}
        />

        {value ? (
          <button
            type="button"
            className="asbClear"
            onClick={() => onChangeQ("")}
            aria-label="Clear search"
            title="Clear search"
          >
            ✕
          </button>
        ) : null}
      </div>
    </div>
  );
}