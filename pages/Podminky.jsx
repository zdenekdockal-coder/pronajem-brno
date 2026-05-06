import { useNavigate } from "react-router-dom";

const SECTIONS = [
  { title: "1. Cena pronájmu", items: [
    "24 hodin: 1 990 Kč",
    "7 dní / 168 hodin: 7 990 Kč",
    "Delší pronájem: individuálně po domluvě",
    "V ceně je zahrnuto 200 km / den",
    "Nadlimitní kilometr: 8 Kč / km",
  ]},
  { title: "2. Rezervace a platba", items: [
    "Rezervace je závazná až po uhrazení celé ceny pronájmu online přes Stripe.",
    "Do úspěšné platby není termín potvrzen.",
    "Pokud platba neproběhne, rezervace se nepotvrdí.",
    "Rezervaci je možné vytvořit nejpozději 24 hodin před začátkem pronájmu.",
    "Rezervace kratší než 24 hodin před začátkem se řeší telefonicky.",
  ]},
  { title: "3. Storno podmínky", items: [
    "Více než 72 hodin před začátkem pronájmu: vrácení 100 %.",
    "24 až 72 hodin před začátkem pronájmu: vrácení 50 %.",
    "Méně než 24 hodin před začátkem pronájmu: cena se nevrací.",
    "Pokud vozidlo nemůže předat pronajímatel, zákazník dostane 100 % zpět.",
    "Změna termínu je možná pouze po domluvě a podle dostupnosti.",
  ]},
  { title: "4. Řidič a doklady", items: [
    "Minimální věk řidiče je 20 let.",
    "Řidič musí mít platný řidičský průkaz skupiny B minimálně 1 rok.",
    "Při rezervaci zákazník vyplní údaje z OP a ŘP.",
    "Při předání proběhne fyzická kontrola OP a ŘP.",
    "Vozidlo smí řídit pouze osoba uvedená v rezervaci / smlouvě.",
    "Další řidič je možný pouze po předchozím schválení.",
    "Pronájem, zapůjčení nebo předání vozidla třetí osobě je zakázáno.",
  ]},
  { title: "5. Kauce a pojištění", items: [
    "Kauce se nevyžaduje.",
    "Vozidlo je havarijně pojištěno.",
    "Spoluúčast zákazníka při škodě činí minimálně 10 000 Kč nebo 5 %.",
    "Zákazník odpovídá za škody vzniklé jeho jednáním, porušením podmínek nebo nesprávným užíváním vozidla.",
  ]},
  { title: "6. Palivo", items: [
    "Vozidlo se předává s plnou nádrží.",
    "Vozidlo musí být vráceno s plnou nádrží.",
    "Pokud vozidlo nebude vráceno s plnou nádrží, zákazník hradí chybějící palivo a manipulační poplatek 500 Kč.",
  ]},
  { title: "7. Předání a vrácení", items: [
    "Základní místa bez příplatku: Brno – Zvonařka, Brno – Kamechy / Bystrc.",
    "Jiné místo v rámci Brna: 500 Kč / jedna cesta.",
    "Mimo Brno: 10 Kč / km / jedna cesta.",
    "Přesné místo a čas předání se domlouvá individuálně.",
  ]},
  { title: "8. Zahraničí", items: [
    "Cesty do zahraničí jsou možné pouze po předchozím nahlášení a schválení.",
    "Zákazník musí předem uvést cílové země.",
    "Bez schválení není cesta do zahraničí povolena.",
  ]},
  { title: "9. Zvířata", items: [
    "Přeprava zvířat je zakázána.",
    "Výjimkou jsou malá zvířata v uzavřené přepravce / kleci.",
    "Taková přeprava musí být předem nahlášena a schválena.",
  ]},
  { title: "10. Zákazy", items: [
    "Zákaz kouření ve vozidle.",
    "Zákaz použití na závodním okruhu.",
    "Zákaz driftu, závodů, soutěží a sportovní jízdy.",
    "Zákaz taxislužby, rozvozu osob, rozvozu jídla, kurýrních služeb a jiného komerčního užití bez předchozího souhlasu.",
    "Zákaz předání vozidla třetí osobě.",
    "Zákaz podnájmu vozidla.",
  ]},
  { title: "11. Pokuty a poplatky", items: [
    "Veškeré pokuty, parkovné, mýtné, dálniční poplatky, správní poplatky a jiné sankce vzniklé v období pronájmu hradí zákazník.",
    "Pokud bude pronajímateli doručena pokuta nebo výzva k úhradě, zákazník je povinen ji uhradit do 3 dnů od oznámení.",
    "Zákazník hradí také administrativní náklady spojené s řešením takových výzev.",
  ]},
  { title: "12. Předávací protokol", items: [
    "Při předání bude zaznamenán stav vozidla, počet kilometrů, palivo a případné vady.",
    "Bude vytvořena fotodokumentace exteriéru a interiéru.",
    "Při vrácení bude vytvořen návratový protokol.",
    "Případné nové škody, nadlimitní kilometry, chybějící palivo nebo mimořádné čištění mohou být zákazníkovi vyúčtovány.",
  ]},
];

export default function Podminky() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-black font-black text-sm">MB</div>
            <span className="font-bold hidden sm:block">Pronájem Brno</span>
          </button>
          <button onClick={() => navigate("/rezervace")} className="bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg text-sm">Rezervovat</button>
        </div>
      </nav>
      <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-4">Podmínky pronájmu</h1>
          <p className="text-gray-400">Platné pro všechny rezervace vozidla Mercedes-Benz C 220 d AMG</p>
        </div>
        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <div key={s.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-yellow-400 mb-4">{s.title}</h2>
              <ul className="space-y-2">
                {s.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed">
                    <span className="text-yellow-500 mt-1 flex-shrink-0">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <button onClick={() => navigate("/rezervace")} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl text-lg transition-all">
            Souhlasím — Rezervovat vůz →
          </button>
        </div>
      </div>
    </div>
  );
}
