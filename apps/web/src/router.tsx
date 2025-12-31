import App from "./App";
import PublicProfile from "./PublicProfile";

export function Router() {
  const path = window.location.pathname;

  if (path.startsWith("/u/")) {
    const username = path.replace("/u/", "");
    return <PublicProfile username={username} />;
  }

  return <App />;
}
