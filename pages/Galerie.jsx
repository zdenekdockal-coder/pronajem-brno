import { useState } from "react";
import { useNavigate } from "react-router-dom";

const PHOTOS = [
  { url: "https://media.base44.com/images/public/69b8340cf8cbeef9719b6c07/7726cf2e4_IMG_0676.jpg", caption: "Boční pohled — sportovní linie" },
  { url: "https://media.base44.com/images/public/69b8340cf8cbeef9719b6c07/0cbc64507_IMG_0677.jpg", caption: "Přední pohled — Panamericana maska" },
  { url: "https://media.base44.com/images/public/69b8340cf8cbeef9719b6c07/34d91a4ff_IMG_0679.jpg", caption: "Detail předku — AMG styling" },
  { url: "https://media.base44.com/images/public/69b8340cf8cbeef9719b6c07/687951f3a_IMG_0681.jpg", caption: "Přední pohled — sportovní nárazník" },
  { url: "https://media.base44.com/images/public/69b8340cf8cbeef9719b6c07/d2a0f1cd3_IMG_0683.jpg", caption: "Čtvrtinový pohled — elegantní silueta" },
  { url: "https://media.base44.com/images/public/69b8340cf8cbeef9719b6c07/d86cd9eed_IMG_0673.jpg", caption: "Zadní pohled — černá metalíza" },
  { url: "https://media.base44.com/images/public/69b8340cf8cbeef9719b6c07/f7ae83873_IMG_0675.jpg", caption: "Boční pohled — ráfky 19\"" },
  { url: "https://media.base44.com/images/public/69b8340cf8cbeef9719b6c07/b340856a9_IMG_0663.jpg", caption: "Přední pravý pohled" },
  { url: "https://media.base44.com/images/public/69b8340cf8cbeef9719b6c07/849d59520_IMG_0660.jpg", caption: "Boční levý pohled" },
  { url: "https://media.base44.com/images/public/69b8340cf8cbeef9719b6c07/d9b36dfd0_IMG_0657.jpg", caption: "Interiér — palubní deska a kokpit" },
];

export default function Galerie() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);

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

      <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-4">Galerie</h1>
          <p className="text-gray-400">Mercedes-Benz C 220 d AMG Line • Obsidian Black</p>
        </div>

        {/* Hero foto */}
        <div className="mb-6 rounded-2xl overflow-hidden cursor-pointer" onClick={() => setOpen(1)}>
          <img src={PHOTOS[1].url} alt={PHOTOS[1].caption} className="w-full h-72 md:h-96 object-cover hover:scale-105 transition-transform duration-700" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PHOTOS.filter((_, i) => i !== 1).map((photo, idx) => {
            const realIdx = idx >= 1 ? idx + 1 : idx;
            return (
              <div key={idx} onClick={() => setOpen(realIdx)}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl cursor-pointer">
                <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-start p-3">
                  <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity font-medium">{photo.caption}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <button onClick={() => navigate("/rezervace")} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-10 py-4 rounded-xl text-lg transition-all hover:scale-105">
            Rezervovat vůz →
          </button>
        </div>
      </div>

      {/* Lightbox */}
      {open !== null && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setOpen(null)}>
          <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            <img src={PHOTOS[open].url} alt={PHOTOS[open].caption} className="w-full max-h-[80vh] object-contain rounded-xl" />
            <div className="text-center text-gray-400 text-sm mt-3">{PHOTOS[open].caption}</div>
            <div className="text-center text-gray-600 text-xs mt-1">{open + 1} / {PHOTOS.length}</div>
          </div>
          <button className="absolute top-4 right-4 text-white text-3xl hover:text-yellow-400 w-10 h-10 flex items-center justify-center" onClick={() => setOpen(null)}>×</button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-5xl hover:text-yellow-400 px-2 py-4"
            onClick={e => { e.stopPropagation(); setOpen((open - 1 + PHOTOS.length) % PHOTOS.length); }}>‹</button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-5xl hover:text-yellow-400 px-2 py-4"
            onClick={e => { e.stopPropagation(); setOpen((open + 1) % PHOTOS.length); }}>›</button>
        </div>
      )}
    </div>
  );
}
