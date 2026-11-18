import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    // Firebase nous prévient à chaque connexion ou déconnexion
    const arreter = onAuthStateChanged(auth, async (utilisateur) => {
      setUser(utilisateur);
      if (utilisateur) {
        // On lit le rôle de l'utilisateur dans la base (collection "users")
        const fiche = await getDoc(doc(db, "users", utilisateur.uid));
        setRole(fiche.exists() ? fiche.data().role : null);
      } else {
        setRole(null);
      }
      setChargement(false);
    });
    return arreter;
  }, []);

  const deconnexion = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, role, chargement, deconnexion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}