import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, role, deconnexion } = useAuth();

  return (
    <header className="entete">
      <NavLink to="/" className="marque">Université Horizon</NavLink>
      <nav>
        <NavLink to="/">Accueil</NavLink>
        {user && <NavLink to="/formulaires">Enregistrement</NavLink>}
        {user && <NavLink to="/gestion">Gestion</NavLink>}
        {user && role === "admin" && <NavLink to="/dashboard">Tableau de bord</NavLink>}
        {user ? (
          <button onClick={deconnexion}>Déconnexion</button>
        ) : (
          <NavLink to="/connexion">Connexion</NavLink>
        )}
      </nav>
    </header>
  );
}