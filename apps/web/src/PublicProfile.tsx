type Props = {
  username: string;
};

export default function PublicProfile({ username }: Props) {
  return (
    <div style={card}>
      <h1>{username}</h1>
      <p>Public Pi profile card.</p>
    </div>
  );
}

const card: React.CSSProperties = {
  maxWidth: 420,
  margin: "40px auto",
  padding: 24,
  border: "1px solid #ddd",
  borderRadius: 12,
  fontFamily: "sans-serif",
};
