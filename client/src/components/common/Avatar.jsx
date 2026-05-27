import { memo } from "react";

function Avatar({
  initials,
  color,
  size = 36,
  online,
  group,
}) {
  return (
    <div
      style={{
        position: "relative",
        flexShrink: 0,
        width: size,
        height: size,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: group ? "10px" : "50%",
          background: `linear-gradient(135deg, ${color}cc, ${color}55)`,
          border: `1px solid ${color}44`,
          boxShadow: `0 0 10px ${color}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
          fontSize: size * 0.33 + "px",
          color: "#fff",
          letterSpacing: "-0.02em",
          userSelect: "none",
        }}
      >
        {initials}
      </div>

      {online && !group && (
        <div
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: size * 0.28,
            height: size * 0.28,
            borderRadius: "50%",
            background: "#22c55e",
            border: "1.5px solid #050d1e",
            boxShadow: "0 0 6px #22c55e88",
          }}
        />
      )}
    </div>
  );
}

export default memo(Avatar);