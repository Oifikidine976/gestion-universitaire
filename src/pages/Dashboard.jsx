import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import useCollection from "../hooks/useCollection";

// Chart.js a besoin de connaître les types de graphiques utilisés
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
);

// Une note est « réussie » à partir de 10/20
const SEUIL = 10;

// Calcule le nombre de notes, la moyenne et le taux de réussite d'une liste d'inscriptions
function calculer(liste) {
  const notes = liste.filter((i) => typeof i.note === "number");
  const reussies = notes.filter((i) => i.note >= SEUIL).length;
  return {
    nb: notes.length,
    reussies,
    moyenne: notes.length
      ? (notes.reduce((total, i) => total + i.note, 0) / notes.length).toFixed(
          2,
        )
      : "—",
    taux: notes.length ? Math.round((reussies * 100) / notes.length) : null,
  };
}

export default function Dashboard() {
  // Les données viennent de Firestore et se mettent à jour automatiquement
  const inscriptions = useCollection("inscriptions");
  const etudiants = useCollection("etudiants");
  const cours = useCollection("cours");
  const historique = useCollection("historique");

  const [annee, setAnnee] = useState("");
  const [recherche, setRecherche] = useState("");

  // Filtre par année : tous les chiffres de la page suivent ce choix
  const annees = [...new Set(inscriptions.map((i) => i.annee))]
    .filter(Boolean)
    .sort();
  const filtrees = inscriptions.filter(
    (i) => annee === "" || i.annee === annee,
  );
  const general = calculer(filtrees);

  // Une ligne de statistiques par cours
  const statsCours = cours.map((c) => ({
    id: c.id,
    intitule: c.intitule,
    ...calculer(filtrees.filter((i) => i.coursId === c.id)),
  }));
  const coursNotes = statsCours.filter((s) => s.nb > 0);
  const coursAffiches = statsCours.filter((s) =>
    s.intitule.toLowerCase().includes(recherche.toLowerCase()),
  );

  // Les 10 dernières actions de l'historique
  const dernieres = [...historique]
    .sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0))
    .slice(0, 10);

  // Données des deux graphiques
  const donneesCours = {
    labels: coursNotes.map((s) => s.intitule),
    datasets: [
      {
        label: "Taux de réussite (%)",
        data: coursNotes.map((s) => s.taux),
        backgroundColor: "#1f3864",
      },
    ],
  };
  const donneesRepartition = {
    labels: ["Réussi", "Échec", "Non noté"],
    datasets: [
      {
        data: [
          general.reussies,
          general.nb - general.reussies,
          filtrees.length - general.nb,
        ],
        backgroundColor: ["#1a7f5a", "#b00020", "#999999"],
      },
    ],
  };

  return (
    <main className="conteneur">
      <h1>Tableau de bord</h1>

      <div className="barre-filtres">
        <div className="champ">
          <label htmlFor="annee">Année universitaire</label>
          <select
            id="annee"
            value={annee}
            onChange={(e) => setAnnee(e.target.value)}
          >
            <option value="">Toutes les années</option>
            {annees.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Indicateurs de performance (KPI) */}
      <div className="grille-cartes">
        <div className="carte-stat">
          <strong>{etudiants.length}</strong>Étudiants
        </div>
        <div className="carte-stat">
          <strong>{general.nb}</strong>Notes saisies
        </div>
        <div className="carte-stat">
          <strong>{general.moyenne}</strong>Moyenne sur 20
        </div>
        <div className="carte-stat">
          <strong>{general.taux === null ? "—" : general.taux + " %"}</strong>
          Taux de réussite
        </div>
      </div>

      {/* Graphiques */}
      {general.nb === 0 ? (
        <p>
          Aucune note saisie : les graphiques apparaîtront avec les premières
          notes.
        </p>
      ) : (
        <div className="grille-graphiques">
          <div className="graphique">
            <h2>Taux de réussite par cours</h2>
            <Bar
              data={donneesCours}
              options={{ scales: { y: { beginAtZero: true, max: 100 } } }}
            />
          </div>
          <div className="graphique">
            <h2>Répartition des résultats</h2>
            <Doughnut data={donneesRepartition} options={{ aspectRatio: 2 }} />
          </div>
        </div>
      )}

      {/* Tableau récapitulatif avec recherche */}
      <h2>Récapitulatif par cours</h2>
      <div className="barre-filtres">
        <div className="champ">
          <label htmlFor="recherche">Rechercher un cours</label>
          <input
            id="recherche"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
        </div>
      </div>
      <table className="tableau">
        <thead>
          <tr>
            <th>Cours</th>
            <th>Notes saisies</th>
            <th>Moyenne /20</th>
            <th>Taux de réussite</th>
          </tr>
        </thead>
        <tbody>
          {coursAffiches.length === 0 && (
            <tr>
              <td colSpan={4}>Aucun cours trouvé.</td>
            </tr>
          )}
          {coursAffiches.map((s) => (
            <tr key={s.id}>
              <td>{s.intitule}</td>
              <td>{s.nb}</td>
              <td>{s.moyenne}</td>
              <td>{s.taux === null ? "—" : s.taux + " %"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Historique des activités */}
      <h2>Historique des activités</h2>
      <table className="tableau">
        <thead>
          <tr>
            <th>Date</th>
            <th>Action</th>
            <th>Détail</th>
            <th>Par</th>
          </tr>
        </thead>
        <tbody>
          {dernieres.length === 0 && (
            <tr>
              <td colSpan={4}>Aucune activité enregistrée.</td>
            </tr>
          )}
          {dernieres.map((a) => (
            <tr key={a.id}>
              <td>{a.date ? a.date.toDate().toLocaleString("fr-FR") : ""}</td>
              <td>{a.action}</td>
              <td>{a.detail}</td>
              <td>{a.par}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
