import { Navigate, Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <BottomNav />
    </>
  );
}