import React from "react";

export default function AuthModalWrapper({ children }) {
  return (
    <div style={backdrop}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modal = {
  width: "100%",
  maxWidth: 420,
};
