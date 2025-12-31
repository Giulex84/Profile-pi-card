type Props = {
  username: string;
};

export default function PublicProfile({ username }: Props) {
  return (
    <div style={styles.container}>
      <h1>{username}</h1>
      <p>This is your public profile card.</p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "480px",
    margin: "40px auto",
    padding: "24px",
    border: "1px solid #ddd",
    borderRadius: "12px",
    textAlign: "center" as const,
  },
};
