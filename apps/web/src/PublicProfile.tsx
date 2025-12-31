export default function PublicProfile() {
  return (
    <div style={container}>
      <h1 style={title}>Profile Pi Card</h1>
      <p style={text}>Public profile loaded successfully.</p>
    </div>
  );
}

const container: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

const title: React.CSSProperties = {
  fontSize: "32px",
  fontWeight: 700,
  marginBottom: "12px",
};

const text: React.CSSProperties = {
  fontSize: "16px",
  opacity: 0.8,
};
