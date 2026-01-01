type Props = {
  username: string;
  uid: string;
};

export default function IdentityCard({ username, uid }: Props) {
  return (
    <div style={{ marginTop: 40, textAlign: "center" }}>
      <h2>Pi Identity Verified</h2>
      <p><strong>Username:</strong> {username}</p>
      <p><strong>UID:</strong> {uid}</p>
      <p style={{ marginTop: 20, color: "#666" }}>
        This session can now be used by Pi utilities.
      </p>
    </div>
  );
}
