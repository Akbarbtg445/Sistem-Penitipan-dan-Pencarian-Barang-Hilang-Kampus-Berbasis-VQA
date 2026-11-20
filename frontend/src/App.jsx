import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import FoundList from "./pages/FoundList";
import ReportChoice from "./pages/ReportChoice";
import ReportFound from "./pages/ReportFound";
import ReportLost from "./pages/ReportLost";
import History from "./pages/History";
import Vqa from "./pages/Vqa";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/daftar-temuan" element={<FoundList />} />
        <Route path="/lapor" element={<ReportChoice />} />
        <Route path="/lapor/temuan" element={<ReportFound />} />
        <Route path="/lapor/kehilangan" element={<ReportLost />} />
        <Route path="/riwayat" element={<History />} />
        <Route path="/vqa" element={<Vqa />} />
        <Route path="/profil" element={<Profile />} />
      </Route>
    </Routes>
  );
}