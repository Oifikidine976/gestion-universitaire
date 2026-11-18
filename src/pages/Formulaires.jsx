import { useState } from "react";
import GestionCollection from "../components/GestionCollection";
import useCollection from "../hooks/useCollection";

export default function Formulaires() {
  const [onglet, setOnglet] = useState("etudiants");

  // Les données des autres collections, pour remplir les listes déroulantes
  const departements = useCollection("departements");
  const enseignants = useCollection("enseignants");
  const cours = useCollection("cours");
  const etudiants = useCollection("etudiants");

  const listes = {
    departements: departements.map((d) => ({ id: d.id, libelle: d.nom })),
    enseignants: enseignants.map((e) => ({ id: e.id, libelle: e.nom })),
    cours: cours.map((c) => ({ id: c.id, libelle: c.intitule })),
    etudiants: etudiants.map((e) => ({ id: e.id, libelle: e.nom }))
  };

  const configurations = {
    departements: { titre: "Département", champs: [
      { nom: "nom", label: "Nom du département", type: "text", requis: true }
    ]},
    enseignants: { titre: "Enseignant", champs: [
      { nom: "nom", label: "Nom complet", type: "text", requis: true },
      { nom: "email", label: "E-mail", type: "email", requis: true },
      { nom: "departementId", label: "Département", type: "select", source: "departements", requis: true },
      { nom: "actif", label: "Enseignant actif", type: "checkbox" }
    ]},
    cours: { titre: "Cours", champs: [
      { nom: "intitule", label: "Intitulé", type: "text", requis: true },
      { nom: "credits", label: "Crédits", type: "number", min: 1, max: 30, requis: true },
      { nom: "departementId", label: "Département", type: "select", source: "departements", requis: true },
      { nom: "enseignantId", label: "Enseignant", type: "select", source: "enseignants", requis: true }
    ]},
    etudiants: { titre: "Étudiant", champs: [
      { nom: "nom", label: "Nom complet", type: "text", requis: true },
      { nom: "email", label: "E-mail", type: "email", requis: true },
      { nom: "departementId", label: "Filière", type: "select", source: "departements", requis: true },
      { nom: "niveau", label: "Niveau", type: "select", options: ["Licence 1", "Licence 2", "Licence 3", "Master 1", "Master 2"], requis: true },
      { nom: "boursier", label: "Boursier", type: "checkbox" }
    ]},
    inscriptions: { titre: "Inscription", champs: [
      { nom: "etudiantId", label: "Étudiant", type: "select", source: "etudiants", requis: true },
      { nom: "coursId", label: "Cours", type: "select", source: "cours", requis: true },
      { nom: "annee", label: "Année", type: "select", options: ["2025-2026", "2026-2027"], requis: true },
      { nom: "note", label: "Note sur 20", type: "number", min: 0, max: 20 }
    ]}
  };

  const config = configurations[onglet];

  return (
    <main className="conteneur">
      <h1>Enregistrement des informations</h1>
      <div className="onglets">
        {Object.keys(configurations).map((cle) => (
          <button key={cle} className={cle === onglet ? "onglet actif" : "onglet"} onClick={() => setOnglet(cle)}>
            {configurations[cle].titre}s
          </button>
        ))}
      </div>
      {/* key force un formulaire neuf à chaque changement d'onglet */}
      <GestionCollection key={onglet} nomCollection={onglet} titre={config.titre} champs={config.champs} listes={listes} />
    </main>
  );
}