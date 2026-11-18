import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";

// Traduit les erreurs de Firebase en messages clairs
function messageErreur(code) {
  switch (code) {
    case "auth/email-already-in-use": return "Cette adresse e-mail est déjà utilisée.";
    case "auth/invalid-email": return "L'adresse e-mail n'est pas valide.";
    case "auth/weak-password": return "Le mot de passe doit contenir au moins 6 caractères.";
    case "auth/invalid-credential": return "E-mail ou mot de passe incorrect.";
    default: return "Une erreur est survenue, veuillez réessayer.";
  }
}

export default function Connexion() {
  const [modeInscription, setModeInscription] = useState(false);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const navigate = useNavigate();

  async function envoyer(event) {
    event.preventDefault();
    setErreur("");

    // Validation avant l'envoi
    if (modeInscription && nom.trim().length < 2) {
      setErreur("Le nom doit contenir au moins 2 caractères.");
      return;
    }
    if (motDePasse.length < 6) {
      setErreur("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setEnvoiEnCours(true);
    try {
      if (modeInscription) {
        // Création du compte, puis de sa fiche avec le rôle "enseignant"
        const resultat = await createUserWithEmailAndPassword(auth, email, motDePasse);
        await setDoc(doc(db, "users", resultat.user.uid), {
          nom: nom.trim(),
          email,
          role: "enseignant",
          creeLe: serverTimestamp()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, motDePasse);
      }
      navigate("/formulaires");
    } catch (e) {
      setErreur(messageErreur(e.code));
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <main className="conteneur">
      <form className="carte-formulaire" onSubmit={envoyer}>
        <h1>{modeInscription ? "Créer un compte" : "Connexion"}</h1>

        {modeInscription && (
          <div className="champ">
            <label htmlFor="nom">Nom complet</label>
            <input id="nom" value={nom} onChange={(e) => setNom(e.target.value)} required />
          </div>
        )}

        <div className="champ">
          <label htmlFor="email">Adresse e-mail</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="champ">
          <label htmlFor="motDePasse">Mot de passe</label>
          <input id="motDePasse" type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} required />
        </div>

        {erreur && <p className="erreur" role="alert">{erreur}</p>}

        <button type="submit" className="bouton" disabled={envoiEnCours}>
          {envoiEnCours ? "Patientez…" : modeInscription ? "S'inscrire" : "Se connecter"}
        </button>

        <button type="button" className="lien" onClick={() => { setModeInscription(!modeInscription); setErreur(""); }}>
          {modeInscription ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? S'inscrire"}
        </button>
      </form>
    </main>
  );
}