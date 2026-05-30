export default function ResetHeader({
  title = "Reset your password",
  description = "Enter your email and we'll send you a secure reset link.",
}) {
  return (
    <div style={{ marginBottom: "28px" }}>
      <h1
        style={{
          fontWeight: 700,
          fontSize: "28px",
          color: "#fff",
          marginBottom: "8px",
        }}
      >
        {title}
      </h1>

      <p
        style={{
          fontSize: "14px",
          color: "rgba(148,163,184,0.8)",
          lineHeight: 1.6,
        }}
      >
        {description}
      </p>
    </div>
  );
}