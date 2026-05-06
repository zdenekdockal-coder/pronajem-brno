import { useNavigate } from "react-router-dom";

export default function Cenik() {
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
      <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-black mb-4">Ceník pronájmu</h1>
          <p className="text-gray-400 text-lg">Transparentní ceny. Žádné skryté poplatky.</p>
        </div>

        {/* Hlavní ceny */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "24 hodin", price: "1 990 Kč", km: "200 km v ceně", detail: "Ideální pro výlet nebo víkend", highlight: false },
            { label: "7 dní / 168 hodin", price: "7 990 Kč", km: "1 400 km v ceně", detail: "Dovolená nebo pracovní cesta", highlight: true },
            { label: "Delší pronájem", price: "Individuálně", km: "Dle domluvy", detail: "Kontaktujte nás pro nabídku", highlight: false },
          ].map((p, i) => (
            <div key={i} className={`rounded-2xl p-8 border-2 text-center ${p.highlight ? "border-yellow-500 bg-yellow-500/5" : "border-gray-700 bg-gray-900"}`}>
              {p.highlight && <div className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-3">Nejoblíbenější</div>}
              <div className="text-gray-400 text-sm mb-2">{p.label}</div>
              <div className={`text-4xl font-black mb-2 ${p.highlight ? "text-yellow-400" : "text-white"}`}>{p.price}</div>
              <div className="text-gray-400 text-sm mb-2">{p.km}</div>
              <div className="text-gray-500 text-xs mb-6">{p.detail}</div>
              {i < 2 && <button onClick={() => navigate("/rezervace")} className={`w-full py-3 rounded-xl font-bold transition-colors ${p.highlight ? "bg-yellow-500 text-black hover:bg-yellow-400" : "border border-gray-600 hover:border-yellow-500 hover:text-yellow-400"}`}>Rezervovat</button>}
              {i === 2 && <button onClick={() => navigate("/kontakt")} className="w-full py-3 rounded-xl font-bold border border-gray-600 hover:border-yellow-500 hover:text-yellow-400 transition-colors">Kontaktovat</button>}
            </div>
          ))}
        </div>

        {/* Kilometry */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-yellow-400">🛣️ Kilometry</h2>
          <div className="space-y-4">
            {[
              ["Denní pronájem (24 h)", "200 km v ceně"],
              ["Týdenní pronájem (7 dní)", "1 400 km v ceně"],
              ["Nadlimitní kilometr", "8 Kč / km"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-3 border-b border-gray-800 last:border-0">
                <span className="text-gray-300">{k}</span>
                <span className="font-bold text-white">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Místa předání */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 text-yellow-400">📍 Místa předání a vrácení</h2>
          <div className="space-y-3">
            <div className="text-sm text-gray-400 font-semibold uppercase tracking-wide mb-3">Zdarma:</div>
            {["Brno – Zvonařka", "Brno – Kamechy / Bystrc"].map(loc => (
              <div key={loc} className="flex items-center gap-3 bg-green-900/20 border border-green-800/40 rounded-xl px-4 py-3">
                <span className="text-green-400 font-bold">✓</span>
                <span className="text-gray-200">{loc}</span>
                <span className="ml-auto text-green-400 font-semibold text-sm">Zdarma</span>
              </div>
            ))}
            <div className="text-sm text-gray-400 font-semibold uppercase tracking-wide mt-6 mb-3">S příplatkem:</div>
            {[
              ["Jiné místo v rámci Brna", "500 Kč / jedna cesta"],
              ["Mimo Brno", "10 Kč / km / jedna cesta"],
            ].map(([loc, price]) => (
              <div key={loc} className="flex items-center justify-between bg-amber-900/10 border border-amber-800/30 rounded-xl px-4 py-3">
                <span className="text-gray-200">{loc}</span>
                <span className="text-amber-400 font-semibold text-sm">{price}</span>
              </div>
            ))}
            <p className="text-gray-500 text-xs mt-4">Pokud je jiné místo zvoleno pro předání i vrácení, účtuje se každá cesta zvlášť. Přesné místo a čas se domlouvá individuálně.</p>
          </div>
        </div>

        {/* Storno */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 mb-10">
          <h2 className="text-2xl font-bold mb-6 text-yellow-400">↩️ Storno podmínky</h2>
          <div className="space-y-3">
            {[
              ["Více než 72 h před začátkem", "Vrácení 100 %", "text-green-400"],
              ["24–72 h před začátkem", "Vrácení 50 %", "text-amber-400"],
              ["Méně než 24 h před začátkem", "Bez vrácení", "text-red-400"],
              ["Zrušení ze strany pronajímatele", "Vrácení 100 %", "text-green-400"],
            ].map(([k, v, c]) => (
              <div key={k} className="flex justify-between items-center py-3 border-b border-gray-800 last:border-0">
                <span className="text-gray-300 text-sm">{k}</span>
                <span className={`font-bold text-sm ${c}`}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button onClick={() => navigate("/rezervace")} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl text-lg transition-all hover:scale-105">
            Rezervovat vůz →
          </button>
        </div>
      </div>
    </div>
  );
}
