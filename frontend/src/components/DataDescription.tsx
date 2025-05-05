import React from 'react';
import {
    FaUser, FaBasketballBall, FaTshirt, FaMapMarkerAlt, FaBirthdayCake,
    FaRulerVertical, FaWeightHanging, FaGraduationCap, FaDollarSign
} from 'react-icons/fa';

interface FieldInfo {
    icon: React.ComponentType;
    name: string;
    description: string;
}

const dataFields: FieldInfo[] = [
    { icon: FaUser, name: 'Nom', description: "Nom complet du joueur" },
    { icon: FaBasketballBall, name: 'Équipe', description: "L'équipe à laquelle le joueur appartient" },
    { icon: FaTshirt, name: 'Numéro', description: "Numéro de maillot" },
    { icon: FaMapMarkerAlt, name: 'Position', description: "Position principale (PG, SG, SF, PF, C)" },
    { icon: FaBirthdayCake, name: 'Âge', description: "Âge du joueur pendant la saison" },
    { icon: FaRulerVertical, name: 'Taille', description: "Taille du joueur (ex : 6-2)" },
    { icon: FaWeightHanging, name: 'Poids', description: "Poids du joueur en livres (lbs)" },
    { icon: FaGraduationCap, name: 'Université', description: "Université fréquentée par le joueur" },
    { icon: FaDollarSign, name: 'Salaire', description: "Salaire du joueur en USD ($)" },
];

const DataDescription: React.FC = () => {
  return (
    <div className="font-sans text-gray-800 leading-relaxed bg-gray-100 max-w-full box-border mb-5">
      <header className="bg-gradient-to-br from-[#00529B] to-[#003057] text-white px-6 py-10 text-center rounded-b-[15px] mb-8 shadow-[0_4px_10px_rgba(0,82,155,0.2)]">
        <h1 className="m-0 mb-2.5 text-[2.2rem] font-bold tracking-tight md:text-4xl">
          Explorez les Données des Joueurs NBA
        </h1>
        <p className="text-lg opacity-90 m-0 font-light md:text-xl">
          Plongez dans les statistiques et informations de la saison NBA 2015-2016.
        </p>
      </header>

      <main className="px-6 pb-8 max-w-4xl mx-auto">
        <section className="mb-10 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl text-[#00529B] mt-0 mb-5 border-b-2 border-gray-200 pb-2 font-semibold md:text-[1.6rem]">
            À Propos de cet Explorateur
          </h2>
          <p className="mb-4 text-gray-600">
            Cette application vous permet de parcourir, rechercher et visualiser un jeu de données
            contenant des informations clés sur les joueurs de la NBA. Découvrez des tendances,
            comparez des joueurs et tirez des enseignements des données.
          </p>
          <p className="mb-4 text-gray-600">
            Naviguez via la barre latérale pour voir différentes analyses statistiques ou
            consultez la liste complète des joueurs dans l'onglet 'Accueil'. Cliquez sur les
            segments des graphiques pour filtrer et voir des groupes spécifiques de joueurs.
          </p>
        </section>

        <section className="mb-10 bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl text-[#00529B] mt-0 mb-5 border-b-2 border-gray-200 pb-2 font-semibold md:text-[1.6rem]">
            Aperçu des Champs de Données
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {dataFields.map((field) => (
              <div key={field.name} className="bg-gray-50 border border-gray-200 rounded p-5 flex items-start transition-all duration-200 ease-in-out hover:-translate-y-1 hover:shadow-md">
                <field.icon {...{ className: "text-2xl text-blue-600 mr-4 flex-shrink-0 mt-0.5", "aria-hidden": "true" }} />
                <div className="flex-grow">
                  <span className="font-semibold text-lg text-gray-800 block mb-1">{field.name}</span>
                  <p className="text-sm text-gray-500 m-0 leading-snug">{field.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

       <footer className="text-center mt-8 py-4 border-t border-gray-200">
           <p className="text-xs text-gray-500">Données basées sur la saison NBA 2015-2016.</p>
       </footer>
    </div>
  );
};

export default DataDescription;