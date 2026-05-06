import { useNavigate } from "react-router-dom";

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

export default function Auto() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-black font-black text-sm">MB</div>
            <span className="font-bold text-white tracking-wide hidden sm:block">Pronájem Brno</span>
          </button>
          <button onClick={() => navigate("/rezervace")}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-sm transition-colors">
            Rezervovat vůz
          </button>
        </div>
      </nav>

      <div className="pt-20">
        {/* Hero */}
        <div className="relative h-[60vh] overflow-hidden">
          <img src={PHOTOS[1]} alt="Mercedes-Benz C 220 d" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <h1 className="text-4xl md:text-5xl font-black">Mercedes-Benz <span className="text-yellow-400">C 220 d</span></h1>
            <p className="text-gray-300 mt-2 text-lg">AMG Line • 2016 • Obsidian Black</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
          {/* Tech specs */}
          <section>
            <h2 className="text-2xl font-black mb-8 text-yellow-400">Technické údaje</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                ["Motor", "2.2 CDI 170 PS"],
                ["Převodovka", "Manuální 6st."],
                ["Palivo", "Nafta"],
                ["Rok výroby", "2016"],
                ["Počet míst", "5"],
                ["Objem zavazadlového prostoru", "480 L"],
                ["Barva", "Obsidian Black metalíza"],
                ["SPZ", "7Z2 8797"],
              ].map(([k, v]) => (
                <div key={k} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <div className="text-gray-500 text-xs uppercase tracking-wide mb-2">{k}</div>
                  <div className="font-semibold text-white">{v}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Výbava */}
          <section>
            <h2 className="text-2xl font-black mb-8 text-yellow-400">Výbava</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {["Navigace", "Kožená sedadla", "Panoramatická střecha", "AMG paket", "Tempomat",
                "Parkovací senzory", "Bluetooth", "Vyhřívané sedačky", "LED světla", "Sport mód",
                "Multifunkční volant", "Ráfky 19\" sport", "Panamericana maska", "Klimatizace dvouzónová"].map(f => (
                <div key={f} className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3">
                  <span className="text-yellow-400 text-lg">✓</span>
                  <span className="text-gray-200 text-sm">{f}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Galerie */}
          <section>
            <h2 className="text-2xl font-black mb-8 text-yellow-400">Fotogalerie</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PHOTOS.map((src, i) => (
                <div key={i} className="aspect-[4/3] overflow-hidden rounded-xl">
                  <img src={src} alt={`Mercedes ${i+1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
            <h2 className="text-3xl font-black mb-4">Připraveni vyrazit?</h2>
            <p className="text-gray-400 mb-8 text-lg">Rezervujte si Mercedes-Benz C 220 d AMG jednoduše online. Platba kartou, předání v Brně.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate("/rezervace")}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl text-lg transition-all hover:scale-105">
                Rezervovat vůz →
              </button>
              <button onClick={() => navigate("/cenik")}
                className="border border-gray-600 hover:border-gray-400 text-gray-300 font-semibold px-10 py-4 rounded-xl transition-colors">
                Zobrazit ceník
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
