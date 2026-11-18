import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

// Lit une collection Firestore et se met à jour automatiquement à chaque changement
export default function useCollection(nomCollection) {
  const [donnees, setDonnees] = useState([]);

  useEffect(() => {
    const arreter = onSnapshot(collection(db, nomCollection), (resultat) => {
      setDonnees(resultat.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return arreter;
  }, [nomCollection]);

  return donnees;
}