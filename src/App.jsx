import { useSearchParams } from "react-router-dom"; // For reading URL params
import FullApp from "./FullApp";
import AvatarViewer from "./AvatarViewer";

function App() {
  const [searchParams] = useSearchParams();
  const avatarMode = searchParams.get("avatar"); // Check if the URL has `?avatar=true`

  return avatarMode ? <AvatarViewer /> : <FullApp />;
}

export default App;
