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
        <span className="asbIcon">⌕</span>
        <input
          value={value}
          onChange={(e) => onChangeQ(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearch(value);
          }}
        />
      </div>
    </div>
  );
}
