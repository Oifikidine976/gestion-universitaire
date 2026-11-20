import { useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import useCollection from "../hooks/useCollection";

// Une note est « réussie » à partir de 10/20
const SEUIL = 10;

// Classe CSS du badge de couleur pour chaque statut
const classes = { Réussi: "reussi", Échec: "echec", "Non noté": "nonnote" };

// Transforme une note en statut : Réussi, Échec ou Non noté
function trouverStatut(note) {
  if (typeof note !== "number") return "Non noté";
  return note >= SEUIL ? "Réussi" : "Échec";
}

export default function Gestion() {
  const { user, role } = useAuth();
  const inscriptions = useCollection("inscriptions");
  const etudiants = useCollection("etudiants");
  const cours = useCollection("cours");

  const [recherche, setRecherche] = useState("");
  const [filtreCours, setFiltreCours] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");

  // On relie chaque inscription à son étudiant et à son cours
  const resultats = inscriptions.map((i) => ({
    ...i,
    nomEtudiant:
      etudiants.find((e) => e.id === i.etudiantId)?.nom || "Étudiant supprimé",
    nomCours:
      cours.find((c) => c.id === i.coursId)?.intitule || "Cours supprimé",
    statut: trouverStatut(i.note),
  }));

  // On garde seulement les résultats qui correspondent à la recherche et aux filtres
  const texte = recherche.toLowerCase();
  const affiches = resultats.filter(
    (r) =>
      (r.nomEtudiant.toLowerCase().includes(texte) ||
        r.nomCours.toLowerCase().includes(texte)) &&
      (filtreCours === "" || r.coursId === filtreCours) &&
      (filtreStatut === "" || r.statut === filtreStatut),
  );

  // Statistiques des résultats affichés
  const notes = affiches.filter((r) => typeof r.note === "number");
  const reussis = notes.filter((r) => r.note >= SEUIL).length;
  const moyenne = notes.length
    ? (notes.reduce((total, r) => total + r.note, 0) / notes.length).toFixed(2)
    : "—";
  const taux = notes.length
    ? Math.round((reussis * 100) / notes.length) + " %"
    : "—";

  // Même format d'historique que dans GestionCollection.jsx
  async function noterHistorique(action, detail) {
    await addDoc(collection(db, "historique"), {
      action,
      collection: "inscriptions",
      detail,
      par: user.email,
      date: serverTimestamp(),
    });
  }

  async function modifierNote(r) {
    const saisie = window.prompt(
      `Note de ${r.nomEtudiant} en ${r.nomCours} (de 0 à 20) :`,
      r.note ?? "",
    );
    if (saisie === null) return; // l'utilisateur a annulé
    const note = Number(saisie.replace(",", "."));
    if (saisie.trim() === "" || isNaN(note) || note < 0 || note > 20) {
      alert("La note doit être un nombre compris entre 0 et 20.");
      return;
    }
    await updateDoc(doc(db, "inscriptions", r.id), { note });
    await noterHistorique(
      "Modification",
      `${r.nomEtudiant} – ${r.nomCours} : ${note}/20`,
    );
  }

  async function supprimer(r) {
    if (!window.confirm("Supprimer cette inscription ?")) return;
    await deleteDoc(doc(db, "inscriptions", r.id));
    await noterHistorique("Suppression", `${r.nomEtudiant} – ${r.nomCours}`);
  }

  return (
    <main className="conteneur">
      <h1>Résultats académiques</h1>

      {/* Cartes de présentation : elles suivent la recherche et les filtres */}
      <div className="grille-cartes">
        <div className="carte-stat">
          <strong>{affiches.length}</strong>Résultats affichés
        </div>
        <div className="carte-stat">
          <strong>{moyenne}</strong>Moyenne sur 20
        </div>
        <div className="carte-stat">
          <strong>{taux}</strong>Taux de réussite
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="barre-filtres">
        <div className="champ">
          <label htmlFor="recherche">Rechercher</label>
          <input
            id="recherche"
            placeholder="Étudiant ou cours"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </div>
        <div className="champ">
          <label htmlFor="filtre-cours">Cours</label>
          <select
            id="filtre-cours"
            value={filtreCours}
            onChange={(e) => setFiltreCours(e.target.value)}
          >
            <option value="">Tous les cours</option>
            {cours.map((c) => (
              <option key={c.id} value={c.id}>
                {c.intitule}
              </option>
            ))}
          </select>
        </div>
        <div className="champ">
          <label htmlFor="filtre-statut">Résultat</label>
          <select
            id="filtre-statut"
            value={filtreStatut}
            onChange={(e) => setFiltreStatut(e.target.value)}
          >
            <option value="">Tous</option>
            <option value="Réussi">Réussi</option>
            <option value="Échec">Échec</option>
            <option value="Non noté">Non noté</option>
          </select>
        </div>
      </div>

      {/* Tableau des résultats */}
      <table className="tableau">
        <thead>
          <tr>
            <th>Étudiant</th>
            <th>Cours</th>
            <th>Année</th>
            <th>Note /20</th>
            <th>Résultat</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {affiches.length === 0 && (
            <tr>
              <td colSpan={6}>Aucun résultat trouvé.</td>
            </tr>
          )}
          {affiches.map((r) => (
            <tr key={r.id}>
              <td>{r.nomEtudiant}</td>
              <td>{r.nomCours}</td>
              <td>{r.annee}</td>
              <td>{typeof r.note === "number" ? r.note : "—"}</td>
              <td>
                <span className={`badge ${classes[r.statut]}`}>{r.statut}</span>
              </td>
              <td>
                <button className="lien" onClick={() => modifierNote(r)}>
                  Modifier la note
                </button>
                {role === "admin" && (
                  <button className="lien danger" onClick={() => supprimer(r)}>
                    Supprimer
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
