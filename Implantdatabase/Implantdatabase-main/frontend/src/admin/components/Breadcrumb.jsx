import React from "react";
import { useNavigate } from "react-router-dom";
import "./Breadcrumb.css";

export default function Breadcrumb({ items }) {
  const navigate = useNavigate();

  return (
    <div className="breadcrumb">
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx > 0 && <span className="separator">&gt;</span>}
          {item.href ? (
            <button
              className="breadcrumbLink"
              onClick={() => navigate(item.href)}
            >
              {item.label}
            </button>
          ) : (
            <span className="breadcrumbText">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
