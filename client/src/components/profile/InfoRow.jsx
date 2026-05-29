export default function InfoRow({
  icon,
  label,
  value,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "11px 14px",
        borderRadius: "14px",
        background:
          "rgba(255,255,255,0.03)",
        border:
          "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "10px",
          flexShrink: 0,
          background:
            "rgba(14,165,233,0.1)",
          border:
            "1px solid rgba(34,211,238,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "center",
          color:
            "rgba(34,211,238,0.75)",
        }}
      >
        {icon}
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontFamily:
              "'Inter', sans-serif",
            fontSize: "10px",
            color:
              "rgba(100,116,139,0.55)",
            letterSpacing:
              "0.1em",
            textTransform:
              "uppercase",
            fontWeight: 600,
            marginBottom: "2px",
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontFamily:
              "'Inter', sans-serif",
            fontSize: "13.5px",
            color:
              "rgba(148,163,184,0.9)",
            fontWeight: 400,
            overflow: "hidden",
            textOverflow:
              "ellipsis",
            whiteSpace:
              "nowrap",
          }}
        >
          {value || "—"}
        </div>
      </div>
    </div>
  );
}