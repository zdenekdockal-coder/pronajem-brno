import { useNavigate } from "react-router-dom";

export default function Gdpr() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-black font-black text-sm">MB</div>
            <span className="font-bold hidden sm:block">Pronájem Brno</span>
          </button>
        </div>
      </nav>
      <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-4">Zásady ochrany osobních údajů</h1>
          <p className="text-gray-400">Informace o zpracování osobních údajů dle GDPR</p>
        </div>

        <div className="space-y-6 text-gray-300 leading-relaxed">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-yellow-400 mb-4">Správce osobních údajů</h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-400">Název / jméno: </span><span className="font-semibold">[NÁZEV PODNIKATELE / FIRMY]</span></div>
              <div><span className="text-gray-400">IČO: </span><span className="font-semibold">[IČO]</span></div>
              <div><span className="text-gray-400">Adresa: </span><span className="font-semibold">[ADRESA], Brno, Česká republika</span></div>
              <div><span className="text-gray-400">E-mail: </span><span className="font-semibold">[KONTAKTNÍ E-MAIL]</span></div>
              <div><span className="text-gray-400">Telefon: </span><span className="font-semibold">[TELEFON]</span></div>
            </div>
          </div>

          {[
            {
              title: "Jaké údaje zpracováváme",
              content: "V rámci rezervačního procesu zpracováváme následující osobní údaje: jméno a příjmení, e-mailová adresa, telefonní číslo, datum narození, adresa bydliště, číslo občanského průkazu, číslo řidičského průkazu, údaje o platbě (pouze stav platby, částka, Stripe ID — nikdy číslo karty), IP adresa, čas a datum rezervace."
            },
            {
              title: "Účely zpracování",
              content: null,
              list: [
                "Vyřízení rezervace a uzavření smlouvy o pronájmu vozidla",
                "Příprava a plnění smlouvy o pronájmu",
                "Ověření totožnosti a způsobilosti k řízení motorového vozidla",
                "Potvrzení platby a vedení účetní evidence",
                "Komunikace se zákazníkem před, během a po pronájmu",
                "Ochrana majetku a vozidla pronajímatele",
                "Řešení škod, pokut, přestupků a právních nároků",
                "Plnění zákonných povinností pronajímatele",
              ]
            },
            {
              title: "Právní základ zpracování",
              content: "Osobní údaje zpracováváme na základě: (a) plnění smlouvy — zpracování je nezbytné pro uzavření a plnění smlouvy o pronájmu; (b) oprávněného zájmu — ochrana majetku, prevence podvodů a řešení škod; (c) zákonné povinnosti — vedení účetnictví a daňové evidence."
            },
            {
              title: "Doba uchování údajů",
              content: "Osobní údaje uchováváme po dobu [DOPLŇTE DOBU UCHOVÁNÍ, např. 3 roky] od ukončení smluvního vztahu, nebo po dobu stanovenou právními předpisy (zejména zákon o účetnictví — 5 let). Po uplynutí této doby jsou údaje bezpečně smazány."
            },
            {
              title: "Příjemci osobních údajů",
              content: "Vaše osobní údaje sdílíme s: Stripe, Inc. (zpracování plateb, platforma Stripe je certifikována PCI DSS Level 1); Base44 (technická platforma pro provoz rezervačního systému); případně s orgány činnými v trestním řízení nebo správními orgány, pokud to vyžaduje zákon."
            },
            {
              title: "Vaše práva",
              list: [
                "Právo na přístup k osobním údajům — můžete požádat o kopii vašich údajů",
                "Právo na opravu nepřesných údajů",
                "Právo na výmaz (\"být zapomenut\") — pokud pominul účel zpracování",
                "Právo na omezení zpracování",
                "Právo na přenositelnost údajů",
                "Právo vznést námitku proti zpracování",
                "Právo podat stížnost u Úřadu pro ochranu osobních údajů (www.uoou.cz)",
              ]
            },
            {
              title: "Zabezpečení údajů",
              content: "Přijímáme technická a organizační opatření k ochraně vašich osobních údajů, včetně šifrovaného přenosu dat (HTTPS), bezpečného uložení v databázi s omezeným přístupem a pravidelné kontroly bezpečnostních opatření. Platební údaje (čísla karet) nikdy neukládáme — platby jsou zpracovávány přímo přes zabezpečenou bránu Stripe."
            },
            {
              title: "Soubory cookie",
              content: "Naše webová aplikace používá pouze nezbytné technické cookies pro správnou funkci rezervačního systému a přihlášení. Nepoužíváme analytické ani marketingové cookies třetích stran."
            },
          ].map(s => (
            <div key={s.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-yellow-400 mb-4">{s.title}</h2>
              {s.content && <p className="text-sm leading-relaxed">{s.content}</p>}
              {s.list && (
                <ul className="space-y-2">
                  {s.list.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="text-yellow-500 mt-1 flex-shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-yellow-400 mb-4">Kontakt pro uplatnění práv</h2>
            <p className="text-sm">Pro uplatnění vašich práv nebo dotazy ohledně zpracování osobních údajů nás kontaktujte na: <span className="text-yellow-400 font-semibold">[KONTAKTNÍ E-MAIL]</span></p>
          </div>

          <p className="text-gray-500 text-xs text-center">Tyto zásady jsou platné od [DATUM]. Vyhrazujeme si právo zásady aktualizovat. O změnách vás budeme informovat.</p>
        </div>
      </div>
    </div>
  );
}
