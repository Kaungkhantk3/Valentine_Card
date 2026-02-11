import { Routes, Route, Navigate, Link } from "react-router-dom";
import Home from "./pages/Home";
import CreatePage from "./pages/create/CreatePage";
import CardPage from "./pages/CardPage";
import ReceiverPage from "./pages/ReceiverPage";
import UnlockAnimationDemo from "./pages/create/UnlockAnimationDemo";
import ErrorTest from "./pages/ErrorTest";

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/unlock-demo" element={<UnlockAnimationDemo />} />
        <Route path="/c/:slug" element={<CardPage />} />
        <Route path="/r/:slug" element={<ReceiverPage />} />
        <Route path="/v/:slug" element={<ReceiverPage />} />
        {/* Test route for ErrorBoundary - remove in production */}
        {import.meta.env.DEV && (
          <Route path="/error-test" element={<ErrorTest />} />
        )}
      </Routes>
    </div>
  );
}
