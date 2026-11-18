import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Accueil from "./pages/Accueil";
import Connexion from "./pages/Connexion";
import Formulaires from "./pages/Formulaires";
import Gestion from "./pages/Gestion";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/formulaires" element={<ProtectedRoute><Formulaires /></ProtectedRoute>} />
        <Route path="/gestion" element={<ProtectedRoute><Gestion /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute roles={["admin"]}><Dashboard /></ProtectedRoute>} />
      </Routes>
    </>
  );
}