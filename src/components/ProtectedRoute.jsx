import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, role, chargement } = useAuth();

  if (chargement) return <p className="conteneur">Chargement…</p>;
  // Pas connecté : on renvoie vers la page de connexion
  if (!user) return <Navigate to="/connexion" />;
  // Connecté, mais sans le bon rôle
  if (roles && !roles.includes(role)) {
    return <p className="conteneur">Accès réservé aux rôles : {roles.join(", ")}.</p>;
  }
  return children;
}