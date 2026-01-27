import { Routes, Route, Navigate, Link } from "react-router-dom";
import Home from "./pages/Home";
import CreatePage from "./pages/create/CreatePage";
import CardPage from "./pages/CardPage";
import ReceiverPage from "./pages/ReceiverPage";
export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/c/:slug" element={<CardPage />} />
        <Route path="/v/:slug" element={<ReceiverPage />} />
      </Routes>
    </div>
  );
}
