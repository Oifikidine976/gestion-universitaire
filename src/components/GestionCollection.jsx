import { useState } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import useCollection from "../hooks/useCollection";

export default function GestionCollection({ nomCollection, titre, champs, listes }) {
  const { user, role } = useAuth();
  const elements = useCollection(nomCollection);
  const valeursVides = Object.fromEntries(champs.map((c) => [c.nom, c.type === "checkbox" ? false : ""]));

  const [valeurs, setValeurs] = useState(valeursVides);
  const [idEnModification, setIdEnModification] = useState(null);
  const [erreur, setErreur] = useState("");
  const [message, setMessage] = useState("");

  function changer(nom, valeur) {
    setValeurs({ ...valeurs, [nom]: valeur });
  }

  // Les options d'une liste déroulante : soit une liste fixe, soit une autre collection
  function options(champ) {
    if (champ.options) return champ.options.map((o) => ({ id: o, libelle: o }));
    return listes[champ.source] || [];
  }

  // Affiche le texte lisible d'une valeur (le nom au lieu de l'identifiant)
  function afficher(champ, valeur) {
    if (champ.type === "checkbox") return valeur ? "Oui" : "Non";
    if (champ.source) return options(champ).find((o) => o.id === valeur)?.libelle || "—";
    return valeur === "" || valeur === undefined ? "—" : valeur;
  }

  function valider() {
    for (const champ of champs) {
      const valeur = valeurs[champ.nom];
      if (champ.requis && (valeur === "" || valeur === undefined)) {
        return `Le champ « ${champ.label} » est obligatoire.`;
      }
      if (champ.type === "number" && valeur !== "") {
        const nombre = Number(valeur);
        if (champ.min !== undefined && nombre < champ.min) return `« ${champ.label} » doit être au moins ${champ.min}.`;
        if (champ.max !== undefined && nombre > champ.max) return `« ${champ.label} » doit être au plus ${champ.max}.`;
      }
    }
    return "";
  }

  async function noterHistorique(action, detail) {
    await addDoc(collection(db, "historique"), {
      action, collection: nomCollection, detail, par: user.email, date: serverTimestamp()
    });
  }

  async function enregistrer(event) {
    event.preventDefault();
    setMessage("");
    const probleme = valider();
    if (probleme) { setErreur(probleme); return; }
    setErreur("");

    // Les champs numériques sont enregistrés comme des nombres
    const donnees = { ...valeurs };
    champs.forEach((c) => { if (c.type === "number" && donnees[c.nom] !== "") donnees[c.nom] = Number(donnees[c.nom]); });
    const detail = afficher(champs[0], donnees[champs[0].nom]);

    try {
      if (idEnModification) {
        await updateDoc(doc(db, nomCollection, idEnModification), donnees);
        await noterHistorique("Modification", detail);
        setMessage("Modification enregistrée.");
      } else {
        await addDoc(collection(db, nomCollection), { ...donnees, creeLe: serverTimestamp() });
        await noterHistorique("Ajout", detail);
        setMessage("Ajout enregistré.");
      }
      setValeurs(valeursVides);
      setIdEnModification(null);
    } catch {
      setErreur("L'enregistrement a échoué, veuillez réessayer.");
    }
  }

  function modifier(element) {
    const nouvellesValeurs = {};
    champs.forEach((c) => { nouvellesValeurs[c.nom] = element[c.nom] ?? valeursVides[c.nom]; });
    setValeurs(nouvellesValeurs);
    setIdEnModification(element.id);
    setMessage("");
  }

  async function supprimer(element) {
    if (!window.confirm("Supprimer définitivement cet élément ?")) return;
    await deleteDoc(doc(db, nomCollection, element.id));
    await noterHistorique("Suppression", afficher(champs[0], element[champs[0].nom]));
    setMessage("Suppression effectuée.");
  }

  return (
    <section>
      <form className="formulaire-gestion" onSubmit={enregistrer}>
        <h2>{idEnModification ? `Modifier : ${titre}` : `Ajouter : ${titre}`}</h2>

        {champs.map((champ) => (
          <div className="champ" key={champ.nom}>
            {champ.type === "checkbox" ? (
              <label>
                <input type="checkbox" checked={valeurs[champ.nom]} onChange={(e) => changer(champ.nom, e.target.checked)} />
                {" "}{champ.label}
              </label>
            ) : (
              <>
                <label htmlFor={champ.nom}>{champ.label}{champ.requis && " *"}</label>
                {champ.type === "select" ? (
                  <select id={champ.nom} value={valeurs[champ.nom]} onChange={(e) => changer(champ.nom, e.target.value)}>
                    <option value="">Choisir…</option>
                    {options(champ).map((o) => <option key={o.id} value={o.id}>{o.libelle}</option>)}
                  </select>
                ) : (
                  <input id={champ.nom} type={champ.type} value={valeurs[champ.nom]} min={champ.min} max={champ.max}
                    onChange={(e) => changer(champ.nom, e.target.value)} />
                )}
              </>
            )}
          </div>
        ))}

        {erreur && <p className="erreur" role="alert">{erreur}</p>}
        {message && <p className="succes">{message}</p>}

        <div className="actions">
          <button type="submit" className="bouton">{idEnModification ? "Enregistrer les modifications" : "Ajouter"}</button>
          {idEnModification && (
            <button type="button" className="lien" onClick={() => { setValeurs(valeursVides); setIdEnModification(null); }}>
              Annuler
            </button>
          )}
        </div>
      </form>

      <table className="tableau">
        <thead>
          <tr>{champs.map((c) => <th key={c.nom}>{c.label}</th>)}<th>Actions</th></tr>
        </thead>
        <tbody>
          {elements.length === 0 && (
            <tr><td colSpan={champs.length + 1}>Aucun élément enregistré pour le moment.</td></tr>
          )}
          {elements.map((element) => (
            <tr key={element.id}>
              {champs.map((c) => <td key={c.nom}>{afficher(c, element[c.nom])}</td>)}
              <td>
                <button className="lien" onClick={() => modifier(element)}>Modifier</button>
                {role === "admin" && <button className="lien danger" onClick={() => supprimer(element)}>Supprimer</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}