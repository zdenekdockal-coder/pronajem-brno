import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Kontakt() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // Simulace odeslání — v reálném nasazení napojit na email
    setSent(true);
  }

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

      <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h1 className="text-4xl font-black mb-4">Kontakt</h1>
          <p className="text-gray-400 text-lg">Máte dotaz? Ozvěte se nám.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Kontaktní info */}
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <h2 className="text-xl font-bold mb-6 text-yellow-400">Kontaktní údaje</h2>
              <div className="space-y-5">
                {[
                  { icon: "📞", label: "Telefon", value: "+420 XXX XXX XXX", sub: "Po–Ne 8:00–20:00" },
                  { icon: "✉️", label: "E-mail", value: "info@example.com", sub: "Odpovídáme do 2 hodin" },
                  { icon: "📍", label: "Lokalita", value: "Brno, Česká republika", sub: "Předání dle domluvy" },
                ].map(c => (
                  <div key={c.label} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">{c.icon}</div>
                    <div>
                      <div className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">{c.label}</div>
                      <div className="font-semibold text-white">{c.value}</div>
                      <div className="text-gray-500 text-xs">{c.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <h2 className="text-xl font-bold mb-4 text-yellow-400">Místa předání</h2>
              <div className="space-y-3 text-sm">
                {["Brno – Zvonařka", "Brno – Kamechy / Bystrc", "Jiné místo v Brně (+500 Kč)", "Mimo Brno (+10 Kč/km)"].map(loc => (
                  <div key={loc} className="flex items-center gap-3 text-gray-300">
                    <span className="text-yellow-500">📍</span> {loc}
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-xs mt-4">Přesné místo a čas předání se domlouvá individuálně po potvrzení rezervace.</p>
            </div>

            {/* Mapa placeholder */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden h-48 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">🗺️</div>
                <div className="text-sm">Brno, Česká republika</div>
                <div className="text-xs mt-1">Mapa bude doplněna</div>
              </div>
            </div>
          </div>

          {/* Kontaktní formulář */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-6 text-yellow-400">Napište nám</h2>
            {sent ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold mb-2">Zpráva odeslána!</h3>
                <p className="text-gray-400 text-sm">Ozveme se vám co nejdříve.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {[["name","Jméno","text","Jan Novák"],["email","E-mail","email","jan@example.com"],["phone","Telefon","tel","+420 xxx xxx xxx"]].map(([k,l,t,ph]) => (
                  <div key={k}>
                    <label className="block text-sm text-gray-400 mb-1">{l}</label>
                    <input type={t} placeholder={ph} value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} required={k!=="phone"}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Zpráva</label>
                  <textarea rows={4} placeholder="Váš dotaz nebo zpráva..." value={form.message} onChange={e => setForm(f=>({...f,message:e.target.value}))} required
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none resize-none" />
                </div>
                <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl transition-colors">
                  Odeslat zprávu →
                </button>
                <p className="text-gray-500 text-xs text-center">Pro rychlou odpověď volejte přímo: +420 XXX XXX XXX</p>
              </form>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <p className="text-gray-400 mb-6">Nebo rovnou rezervujte online — rychle a jednoduše.</p>
          <button onClick={() => navigate("/rezervace")} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl text-lg transition-all hover:scale-105">
            Rezervovat vůz online →
          </button>
        </div>
      </div>
    </div>
  );
}
