type PublicProfileProps = {
  username: string;
};

export default function PublicProfile({ username }: PublicProfileProps) {
  return (
    <div style={{ maxWidth: 420, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>{username}</h1>
      <p>This is a public Pi profile card.</p>
      <p>Shared via Pi Network.</p>
    </div>
  );
}
