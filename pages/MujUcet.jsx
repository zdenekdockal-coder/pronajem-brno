import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Booking, HandoverReport, ReturnReport, AdditionalCharge, useCurrentUser } from "../api/entities";

const STATUS_LABELS = {
  ceka_na_platbu: { label: "Čeká na platbu", color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  potvrzeno: { label: "Potvrzeno ✓", color: "text-green-400 bg-green-400/10 border-green-400/30" },
  probiha: { label: "Probíhá 🚗", color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
  dokonceno: { label: "Dokončeno", color: "text-gray-400 bg-gray-400/10 border-gray-400/30" },
  zruseno: { label: "Zrušeno", color: "text-red-400 bg-red-400/10 border-red-400/30" },
  nedorazil: { label: "Nedorazil", color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
};

export default function MujUcet() {
  const navigate = useNavigate();
  const { data: user, loading: userLoading } = useCurrentUser();
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [handover, setHandover] = useState(null);
  const [returnRep, setReturnRep] = useState(null);
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoading && user) {
      loadData();
    }
  }, [user, userLoading]);

  async function loadData() {
    setLoading(true);
    try {
      const b = await Booking.filter({ customer_email: user.email });
      setBookings(b.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function selectBooking(b) {
    setSelected(b);
    try {
      const [h, r, c] = await Promise.all([
        HandoverReport.filter({ booking_id: b.id }),
        ReturnReport.filter({ booking_id: b.id }),
        AdditionalCharge.filter({ booking_id: b.id }),
      ]);
      setHandover(h[0] || null);
      setReturnRep(r[0] || null);
      setCharges(c);
    } catch (e) {}
  }

  if (userLoading || loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
      <div className="text-center"><div className="text-4xl animate-spin mb-4">⌛</div><p className="text-gray-400">Načítám...</p></div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="text-2xl font-black mb-4">Přihlášení vyžadováno</h2>
        <p className="text-gray-400 mb-8">Pro zobrazení vašeho účtu se prosím přihlaste.</p>
        <button onClick={() => navigate("/rezervace")} className="bg-yellow-500 text-black font-bold px-8 py-3 rounded-xl hover:bg-yellow-400">Rezervovat bez přihlášení</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-black font-black text-sm">MB</div>
            <span className="font-bold hidden sm:block">Pronájem Brno</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm hidden sm:block">{user.email}</span>
            <button onClick={() => navigate("/rezervace")} className="bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg text-sm">Nová rezervace</button>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black mb-1">Můj účet</h1>
          <p className="text-gray-400">{user.email}</p>
        </div>

        {selected ? (
          <div className="space-y-6">
            <button onClick={() => { setSelected(null); setHandover(null); setReturnRep(null); setCharges([]); }}
              className="text-gray-400 hover:text-white flex items-center gap-2 text-sm">
              ← Všechny rezervace
            </button>

            {/* Header rezervace */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <span className="text-yellow-400 font-black text-xl">{selected.booking_number}</span>
                  <span className="text-gray-400 ml-3 text-sm">Mercedes-Benz C 220 d AMG</span>
                </div>
                <span className={`text-sm px-3 py-1 rounded-full border ${STATUS_LABELS[selected.status]?.color}`}>
                  {STATUS_LABELS[selected.status]?.label}
                </span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-400">Začátek: </span>{selected.start_datetime && new Date(selected.start_datetime).toLocaleString("cs-CZ")}</div>
                <div><span className="text-gray-400">Konec: </span>{selected.end_datetime && new Date(selected.end_datetime).toLocaleString("cs-CZ")}</div>
                <div><span className="text-gray-400">Místo předání: </span>{selected.pickup_location}</div>
                <div><span className="text-gray-400">Místo vrácení: </span>{selected.return_location}</div>
                <div><span className="text-gray-400">Délka: </span>{selected.duration_hours} hodin</div>
                <div><span className="text-gray-400">Km v ceně: </span>{Math.ceil(selected.duration_hours / 24) * 200} km</div>
                <div className="md:col-span-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 flex justify-between items-center">
                  <span className="text-gray-300">Uhrazená cena:</span>
                  <span className="text-yellow-400 font-black text-xl">{selected.total_price?.toLocaleString("cs-CZ")} Kč</span>
                </div>
              </div>
            </div>

            {/* Předávací protokol */}
            {handover && (
              <div className="bg-gray-900 border border-blue-800/40 rounded-2xl p-6">
                <h3 className="font-bold text-blue-400 mb-4">📋 Předávací protokol</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-400">Datum předání: </span>{handover.handover_datetime && new Date(handover.handover_datetime).toLocaleString("cs-CZ")}</div>
                  <div><span className="text-gray-400">Tachometr: </span>{handover.odometer_km} km</div>
                  <div><span className="text-gray-400">Palivo: </span>{handover.fuel_full ? "Plná nádrž ✓" : handover.fuel_note}</div>
                  {handover.exterior_notes && <div><span className="text-gray-400">Exteriér: </span>{handover.exterior_notes}</div>}
                  {handover.interior_notes && <div><span className="text-gray-400">Interiér: </span>{handover.interior_notes}</div>}
                  {handover.known_defects && <div className="col-span-2"><span className="text-gray-400">Vady při předání: </span>{handover.known_defects}</div>}
                </div>
              </div>
            )}

            {/* Návratový protokol */}
            {returnRep && (
              <div className="bg-gray-900 border border-green-800/40 rounded-2xl p-6">
                <h3 className="font-bold text-green-400 mb-4">📋 Návratový protokol</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-400">Datum vrácení: </span>{returnRep.return_datetime && new Date(returnRep.return_datetime).toLocaleString("cs-CZ")}</div>
                  <div><span className="text-gray-400">Tachometr: </span>{returnRep.odometer_km} km</div>
                  <div><span className="text-gray-400">Celkem najeto: </span>{returnRep.total_km} km</div>
                  <div><span className="text-gray-400">Nadlimitní km: </span><span className={returnRep.excess_km > 0 ? "text-red-400 font-bold" : "text-green-400"}>{returnRep.excess_km} km</span></div>
                  <div><span className="text-gray-400">Palivo: </span>{returnRep.fuel_full ? "Plná nádrž ✓" : "Chybějící palivo"}</div>
                  <div><span className="text-gray-400">Nové poškození: </span>{returnRep.new_damage ? <span className="text-red-400">Ano</span> : "Ne"}</div>
                </div>
              </div>
            )}

            {/* Doplatky */}
            {charges.length > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="font-bold text-yellow-400 mb-4">💰 Doplatky</h3>
                <div className="space-y-3">
                  {charges.map(c => (
                    <div key={c.id} className={`flex items-center justify-between py-3 px-4 rounded-xl border ${c.paid ? "border-gray-700 bg-gray-800/50" : "border-red-700/40 bg-red-900/10"}`}>
                      <div>
                        <div className="font-medium text-sm">{
                          {nadlimitni_km:"Nadlimitní km",chybejici_palivo:"Chybějící palivo",pokuta:"Pokuta",skoda:"Škoda",mimoradne_cisteni:"Mimořádné čištění",priplatek_predani:"Příplatek předání",jine:"Jiné"}[c.reason]
                        }</div>
                        {c.note && <div className="text-gray-500 text-xs">{c.note}</div>}
                        {c.due_date && !c.paid && <div className="text-amber-400 text-xs">Splatnost: {new Date(c.due_date).toLocaleDateString("cs-CZ")}</div>}
                      </div>
                      <div className="text-right">
                        <div className={`font-black ${c.paid ? "text-green-400" : "text-red-400"}`}>{c.amount?.toLocaleString("cs-CZ")} Kč</div>
                        <div className="text-xs text-gray-500">{c.paid ? "✓ Zaplaceno" : "Čeká na platbu"}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {charges.some(c => !c.paid) && (
                  <div className="mt-4 bg-amber-900/20 border border-amber-700/40 rounded-xl p-4 text-amber-300 text-sm">
                    ⚠️ Máte nezaplacené doplatky. Prosím uhraďte je do 3 dnů od oznámení. V případě dotazů nás kontaktujte.
                  </div>
                )}
              </div>
            )}

            {selected.admin_notes && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h3 className="font-bold text-yellow-400 mb-3">📌 Poznámka od pronajímatele</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{selected.admin_notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-6">Moje rezervace</h2>
            {bookings.length === 0 ? (
              <div className="text-center py-20 bg-gray-900 rounded-2xl border border-gray-800">
                <div className="text-6xl mb-6">🚗</div>
                <p className="text-gray-400 mb-6">Zatím nemáte žádné rezervace.</p>
                <button onClick={() => navigate("/rezervace")} className="bg-yellow-500 text-black font-bold px-8 py-3 rounded-xl hover:bg-yellow-400">Rezervovat vůz</button>
              </div>
            ) : bookings.map(b => (
              <div key={b.id} onClick={() => selectBooking(b)}
                className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-2xl p-5 cursor-pointer transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="font-bold text-yellow-400">{b.booking_number}</span>
                      <span className={`text-xs px-2 py-1 rounded-full border ${STATUS_LABELS[b.status]?.color}`}>{STATUS_LABELS[b.status]?.label}</span>
                    </div>
                    <div className="font-semibold mb-1">Mercedes-Benz C 220 d AMG</div>
                    <div className="text-gray-400 text-sm">
                      {b.start_datetime && new Date(b.start_datetime).toLocaleDateString("cs-CZ")} — {b.end_datetime && new Date(b.end_datetime).toLocaleDateString("cs-CZ")}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">{b.pickup_location}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-black text-lg">{b.total_price?.toLocaleString("cs-CZ")} Kč</div>
                    <div className="text-gray-500 text-xs group-hover:text-yellow-400 transition-colors">Detail →</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
