import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car, CarImage, Booking } from "../api/entities";

const PHOTOS = [
  "https://media.base44.com/images/public/69b8340cf8cbeef9719b6c07/7726cf2e4_IMG_0676.jpg",
  "https://media.base44.com/images/public/69b8340cf8cbeef9719b6c07/0cbc64507_IMG_0677.jpg",
  "https://media.base44.com/images/public/69b8340cf8cbeef9719b6c07/34d91a4ff_IMG_0679.jpg",
  "https://media.base44.com/images/public/69b8340cf8cbeef9719b6c07/687951f3a_IMG_0681.jpg",
  "https://media.base44.com/images/public/69b8340cf8cbeef9719b6c07/d2a0f1cd3_IMG_0683.jpg",
  "https://media.base44.com/images/public/69b8340cf8cbeef9719b6c07/d86cd9eed_IMG_0673.jpg",
  "https://media.base44.com/images/public/69b8340cf8cbeef9719b6c07/f7ae83873_IMG_0675.jpg",
  "https://media.base44.com/images/public/69b8340cf8cbeef9719b6c07/b340856a9_IMG_0663.jpg",
  "https://media.base44.com/images/public/69b8340cf8cbeef9719b6c07/849d59520_IMG_0660.jpg",
  "https://media.base44.com/images/public/69b8340cf8cbeef9719b6c07/d9b36dfd0_IMG_0657.jpg",
];

const VYHODY = [
  { icon: "📱", title: "Online rezervace", desc: "Rezervujte kdykoliv, odkudkoliv. Bez čekání, bez telefonátů." },
  { icon: "💳", title: "Bezpečná platba", desc: "Platba kartou přes Stripe. Vaše údaje jsou v bezpečí." },
  { icon: "🔓", title: "Bez kauce", desc: "Žádná kauce, žádné blokování peněz na kartě." },
  { icon: "📍", title: "Předání v Brně", desc: "Předáme auto na dohodnutém místě v Brně." },
  { icon: "🛣️", title: "200 km v ceně", desc: "200 km denně zahrnuto v ceně. Nadlimitní km: 8 Kč/km." },
  { icon: "🛡️", title: "Havarijní pojištění", desc: "Vozidlo je plně havarijně pojištěno." },
];

export default function Home() {
  const navigate = useNavigate();
  const [heroIdx, setHeroIdx] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % 3), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-black font-black text-sm">MB</div>
            <span className="font-bold text-white tracking-wide hidden sm:block">Pronájem Brno</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <button onClick={() => navigate("/auto")} className="hover:text-white transition-colors">Auto</button>
            <button onClick={() => navigate("/galerie")} className="hover:text-white transition-colors">Galerie</button>
            <button onClick={() => navigate("/cenik")} className="hover:text-white transition-colors">Ceník</button>
            <button onClick={() => navigate("/podmínky")} className="hover:text-white transition-colors">Podmínky</button>
            <button onClick={() => navigate("/kontakt")} className="hover:text-white transition-colors">Kontakt</button>
          </div>
          <button onClick={() => navigate("/rezervace")}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors">
            Rezervovat vůz
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        {PHOTOS.slice(0, 3).map((src, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === heroIdx ? "opacity-100" : "opacity-0"}`}>
            <img src={src} alt="Mercedes-Benz C 220 d" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-gray-950/60 via-gray-950/40 to-gray-950" />
          </div>
        ))}
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <div className="inline-block bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-widest uppercase">
            Mercedes-Benz C 220 d AMG • Brno
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Pronájem auta v Brně<br />
            <span className="text-yellow-400">jednoduše a online</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed">
            Rezervujte si vůz online, zaplaťte bezpečně kartou<br className="hidden md:block" />
            a vyzvedněte si ho v Brně.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate("/rezervace")}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 shadow-lg shadow-yellow-500/20">
              Rezervovat vůz →
            </button>
            <button onClick={() => navigate("/auto")}
              className="border border-gray-600 hover:border-gray-400 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors">
              Detail auta
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-10">
            {[0,1,2].map(i => (
              <button key={i} onClick={() => setHeroIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === heroIdx ? "bg-yellow-500 w-6" : "bg-gray-600"}`} />
            ))}
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-gray-500 text-2xl">↓</div>
      </div>

      {/* VÝHODY */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Proč pronajmout u nás?</h2>
            <p className="text-gray-400 text-lg">Prémiový vůz, jednoduché podmínky, žádné překvapení</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VYHODY.map((v, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-yellow-500/40 transition-colors group">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-yellow-400 transition-colors">{v.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUTO PREVIEW */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-yellow-400 text-sm font-semibold uppercase tracking-widest mb-4">Náš vůz</div>
              <h2 className="text-3xl md:text-4xl font-black mb-6">Mercedes-Benz<br /><span className="text-yellow-400">C 220 d AMG Line</span></h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                Prémiový sedan v exkluzivním AMG provedení. Černá obsidiánová metalíza, sportovní ráfky 19", 
                upravená maska chladiče Panamericana. Elegantní a výkonné auto pro každou příležitost.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  ["Motor", "2.2 CDI 170 PS"],
                  ["Převodovka", "Manuální 6st."],
                  ["Palivo", "Nafta"],
                  ["Rok", "2016"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-800 rounded-xl p-4">
                    <div className="text-gray-500 text-xs uppercase tracking-wide mb-1">{k}</div>
                    <div className="font-semibold text-white">{v}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => navigate("/auto")}
                  className="border border-yellow-500 text-yellow-400 font-semibold px-6 py-3 rounded-xl hover:bg-yellow-500 hover:text-black transition-all">
                  Více informací
                </button>
                <button onClick={() => navigate("/rezervace")}
                  className="bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition-colors">
                  Rezervovat
                </button>
              </div>
            </div>
            <div className="relative">
              <img src={PHOTOS[1]} alt="Mercedes-Benz" className="rounded-2xl w-full object-cover h-80 lg:h-96" />
              <div className="absolute -bottom-4 -right-4 bg-yellow-500 text-black font-black text-2xl px-6 py-4 rounded-xl shadow-xl">
                od 1 990 Kč / den
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CENÍK PREVIEW */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Ceník pronájmu</h2>
            <p className="text-gray-400">Transparentní ceny bez skrytých poplatků</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "24 hodin", price: "1 990 Kč", km: "200 km v ceně", highlight: false },
              { label: "7 dní", price: "7 990 Kč", km: "1 400 km v ceně", highlight: true },
              { label: "Delší pronájem", price: "Individuálně", km: "Dle domluvy", highlight: false },
            ].map((p, i) => (
              <div key={i} className={`rounded-2xl p-8 border-2 text-center transition-all ${
                p.highlight ? "border-yellow-500 bg-yellow-500/5" : "border-gray-700 bg-gray-900"
              }`}>
                {p.highlight && <div className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-3">Nejoblíbenější</div>}
                <div className="text-gray-400 text-sm mb-3">{p.label}</div>
                <div className={`text-3xl font-black mb-3 ${p.highlight ? "text-yellow-400" : "text-white"}`}>{p.price}</div>
                <div className="text-gray-500 text-sm">{p.km}</div>
                {i < 2 && (
                  <button onClick={() => navigate("/rezervace")}
                    className={`mt-6 w-full py-3 rounded-xl font-bold transition-colors ${
                      p.highlight ? "bg-yellow-500 text-black hover:bg-yellow-400" : "border border-gray-600 hover:border-yellow-500 hover:text-yellow-400"
                    }`}>
                    Rezervovat
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-gray-500 text-sm mt-6">
            Nadlimitní kilometr: 8 Kč/km • Předání v Brně zdarma na vybraných místech
          </p>
        </div>
      </section>

      {/* GALERIE */}
      <section className="py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Galerie</h2>
            <p className="text-gray-400">Podívejte se na naše auto zblízka</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {PHOTOS.slice(0, 8).map((src, i) => (
              <div key={i} onClick={() => setGalleryOpen(i)}
                className="aspect-square overflow-hidden rounded-xl cursor-pointer group relative">
                <img src={src} alt={`Mercedes ${i+1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <span className="text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity">🔍</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button onClick={() => navigate("/galerie")}
              className="border border-gray-600 hover:border-yellow-500 text-gray-400 hover:text-yellow-400 font-semibold px-8 py-3 rounded-xl transition-all">
              Zobrazit celou galerii →
            </button>
          </div>
        </div>
      </section>

      {/* KONTAKT */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">Máte otázky?</h2>
          <p className="text-gray-400 mb-10">Jsme tu pro vás. Kontaktujte nás telefonicky nebo e-mailem.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: "📞", label: "Telefon", value: "+420 XXX XXX XXX" },
              { icon: "✉️", label: "E-mail", value: "info@example.com" },
              { icon: "📍", label: "Lokalita", value: "Brno, Česká republika" },
            ].map((c) => (
              <div key={c.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <div className="text-3xl mb-3">{c.icon}</div>
                <div className="text-gray-400 text-sm mb-1">{c.label}</div>
                <div className="font-semibold text-white">{c.value}</div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/rezervace")}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl text-lg transition-all hover:scale-105 shadow-lg shadow-yellow-500/20">
            Rezervovat vůz →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-800 py-10 px-4 text-center text-gray-500 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>© 2024 Pronájem Brno. Všechna práva vyhrazena.</div>
          <div className="flex gap-6">
            <button onClick={() => navigate("/gdpr")} className="hover:text-white transition-colors">Ochrana osobních údajů</button>
            <button onClick={() => navigate("/podmínky")} className="hover:text-white transition-colors">Podmínky pronájmu</button>
            <button onClick={() => navigate("/kontakt")} className="hover:text-white transition-colors">Kontakt</button>
          </div>
        </div>
      </footer>

      {/* LIGHTBOX */}
      {galleryOpen !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setGalleryOpen(null)}>
          <img src={PHOTOS[galleryOpen]} alt="" className="max-h-screen max-w-full object-contain rounded-xl" onClick={e => e.stopPropagation()} />
          <button className="absolute top-4 right-4 text-white text-3xl hover:text-yellow-400" onClick={() => setGalleryOpen(null)}>×</button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-yellow-400 px-4"
            onClick={e => { e.stopPropagation(); setGalleryOpen((galleryOpen - 1 + PHOTOS.length) % PHOTOS.length); }}>‹</button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl hover:text-yellow-400 px-4"
            onClick={e => { e.stopPropagation(); setGalleryOpen((galleryOpen + 1) % PHOTOS.length); }}>›</button>
        </div>
      )}
    </div>
  );
}
