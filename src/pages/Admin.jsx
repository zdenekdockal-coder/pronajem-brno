import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Booking, AvailabilityBlock, HandoverReport, ReturnReport, ReportPhoto, AdditionalCharge, AdminSettings, Car } from "../api/entities";
import { useCurrentUser } from "../api/entities";

const STATUS_LABELS = {
  ceka_na_platbu: { label: "Čeká na platbu", color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  potvrzeno: { label: "Potvrzeno", color: "text-green-400 bg-green-400/10 border-green-400/30" },
  probiha: { label: "Probíhá", color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
  dokonceno: { label: "Dokončeno", color: "text-gray-400 bg-gray-400/10 border-gray-400/30" },
  zruseno: { label: "Zrušeno", color: "text-red-400 bg-red-400/10 border-red-400/30" },
  nedorazil: { label: "Nedorazil", color: "text-orange-400 bg-orange-400/10 border-orange-400/30" },
};

const CHARGE_LABELS = {
  nadlimitni_km: "Nadlimitní km",
  chybejici_palivo: "Chybějící palivo",
  pokuta: "Pokuta",
  skoda: "Škoda / spoluúčast",
  mimoradne_cisteni: "Mimořádné čištění",
  priplatek_predani: "Příplatek předání",
  jine: "Jiné",
};

export default function Admin() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const [tab, setTab] = useState("rezervace");
  const [bookings, setBookings] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [settings, setSettings] = useState([]);
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [handoverReports, setHandoverReports] = useState([]);
  const [returnReports, setReturnReports] = useState([]);
  const [showHandover, setShowHandover] = useState(false);
  const [showReturn, setShowReturn] = useState(false);
  const [showCharge, setShowCharge] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [filterStatus, setFilterStatus] = useState("vse");

  const [handoverForm, setHandoverForm] = useState({ handover_datetime: "", odometer_km: "", fuel_full: true, fuel_note: "", exterior_notes: "", interior_notes: "", known_defects: "", confirmed_by_admin: true, confirmed_by_customer: false });
  const [returnForm, setReturnForm] = useState({ return_datetime: "", odometer_km: "", fuel_full: true, fuel_missing_charge: 0, new_damage: false, damage_notes: "", extra_cleaning: false, extra_cleaning_charge: 0, notes: "" });
  const [chargeForm, setChargeForm] = useState({ reason: "jine", amount: "", due_date: "", note: "" });
  const [blockForm, setBlockForm] = useState({ start_datetime: "", end_datetime: "", reason: "" });
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState("");

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [b, bl, s, c, h, r] = await Promise.all([
        Booking.list(), AvailabilityBlock.list(), AdminSettings.list(),
        AdditionalCharge.list(), HandoverReport.list(), ReturnReport.list(),
      ]);
      setBookings(b.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
      setBlocks(bl);
      setSettings(s);
      setCharges(c);
      setHandoverReports(h);
      setReturnReports(r);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function updateBookingStatus(id, status) {
    await Booking.update(id, { status });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    if (selectedBooking?.id === id) setSelectedBooking(prev => ({ ...prev, status }));
  }

  async function saveNote(id) {
    await Booking.update(id, { admin_notes: noteText });
    setBookings(prev => prev.map(b => b.id === id ? { ...b, admin_notes: noteText } : b));
    if (selectedBooking?.id === id) setSelectedBooking(prev => ({ ...prev, admin_notes: noteText }));
  }

  async function saveHandover() {
    setSaving(true);
    try {
      const h = await HandoverReport.create({ ...handoverForm, booking_id: selectedBooking.id, odometer_km: parseFloat(handoverForm.odometer_km) });
      setHandoverReports(prev => [...prev, h]);
      await updateBookingStatus(selectedBooking.id, "probiha");
      setShowHandover(false);
    } catch (e) { alert("Chyba: " + e.message); }
    setSaving(false);
  }

  async function saveReturn() {
    setSaving(true);
    try {
      const handover = handoverReports.find(h => h.booking_id === selectedBooking.id);
      const startKm = handover?.odometer_km || 0;
      const endKm = parseFloat(returnForm.odometer_km) || 0;
      const totalKm = endKm - startKm;
      const includedKm = (selectedBooking.duration_hours / 24) * 200;
      const excessKm = Math.max(0, totalKm - includedKm);
      const excessCharge = excessKm * 8;
      const r = await ReturnReport.create({
        ...returnForm,
        booking_id: selectedBooking.id,
        odometer_km: endKm,
        odometer_start_km: startKm,
        total_km: totalKm,
        included_km: includedKm,
        excess_km: excessKm,
        excess_km_charge: excessCharge,
        fuel_missing_charge: parseFloat(returnForm.fuel_missing_charge) || 0,
        extra_cleaning_charge: parseFloat(returnForm.extra_cleaning_charge) || 0,
        confirmed_by_admin: true,
      });
      setReturnReports(prev => [...prev, r]);
      // Automaticky vytvoř doplatky
      if (excessKm > 0) await AdditionalCharge.create({ booking_id: selectedBooking.id, reason: "nadlimitni_km", amount: excessCharge, note: `${excessKm} km × 8 Kč`, paid: false, notified_customer: false });
      if (!returnForm.fuel_full && parseFloat(returnForm.fuel_missing_charge) > 0) await AdditionalCharge.create({ booking_id: selectedBooking.id, reason: "chybejici_palivo", amount: parseFloat(returnForm.fuel_missing_charge), paid: false, notified_customer: false });
      if (returnForm.extra_cleaning) await AdditionalCharge.create({ booking_id: selectedBooking.id, reason: "mimoradne_cisteni", amount: parseFloat(returnForm.extra_cleaning_charge) || 0, paid: false, notified_customer: false });
      await updateBookingStatus(selectedBooking.id, "dokonceno");
      setShowReturn(false);
      loadAll();
    } catch (e) { alert("Chyba: " + e.message); }
    setSaving(false);
  }

  async function saveCharge() {
    setSaving(true);
    try {
      await AdditionalCharge.create({ ...chargeForm, booking_id: selectedBooking.id, amount: parseFloat(chargeForm.amount), paid: false, notified_customer: false });
      setShowCharge(false);
      setChargeForm({ reason: "jine", amount: "", due_date: "", note: "" });
      loadAll();
    } catch (e) { alert("Chyba: " + e.message); }
    setSaving(false);
  }

  async function saveBlock() {
    setSaving(true);
    try {
      await AvailabilityBlock.create({ ...blockForm, created_by_admin: true });
      setShowBlock(false);
      setBlockForm({ start_datetime: "", end_datetime: "", reason: "" });
      loadAll();
    } catch (e) { alert("Chyba: " + e.message); }
    setSaving(false);
  }

  async function saveSetting(id, value) {
    await AdminSettings.update(id, { value });
    setSettings(prev => prev.map(s => s.id === id ? { ...s, value } : s));
  }

  async function toggleChargePaid(id, paid) {
    await AdditionalCharge.update(id, { paid, paid_at: paid ? new Date().toISOString() : null });
    setCharges(prev => prev.map(c => c.id === id ? { ...c, paid } : c));
  }

  const filteredBookings = filterStatus === "vse" ? bookings : bookings.filter(b => b.status === filterStatus);
  const todayBookings = bookings.filter(b => {
    const s = new Date(b.start_datetime), e = new Date(b.end_datetime), now = new Date();
    return (b.status === "potvrzeno" || b.status === "probiha") && s <= now && e >= now;
  });
  const upcomingBookings = bookings.filter(b => b.status === "potvrzeno" && new Date(b.start_datetime) > new Date());
  const unpaidCharges = charges.filter(c => !c.paid);

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white"><div className="text-center"><div className="text-4xl animate-spin mb-4">⌛</div><p className="text-gray-400">Načítám...</p></div></div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-black font-black text-sm">MB</div>
          <span className="font-bold text-white">Admin Panel</span>
        </div>
        <div className="flex items-center gap-3">
          {unpaidCharges.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{unpaidCharges.length} doplatků</span>
          )}
          <button onClick={() => navigate("/")} className="text-gray-400 text-sm hover:text-white">← Web</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 max-w-7xl mx-auto">
        {[
          { label: "Celkem rezervací", value: bookings.length, color: "text-white" },
          { label: "Aktuálně probíhá", value: todayBookings.length, color: "text-blue-400" },
          { label: "Nadcházející", value: upcomingBookings.length, color: "text-green-400" },
          { label: "Nezaplacené doplatky", value: unpaidCharges.length, color: "text-red-400" },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-gray-400 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-4 max-w-7xl mx-auto">
        <div className="flex gap-1 bg-gray-900 rounded-xl p-1 border border-gray-800 overflow-x-auto mb-6">
          {[
            ["rezervace", "📋 Rezervace"],
            ["kalendar", "📅 Kalendář"],
            ["doplatky", "💰 Doplatky"],
            ["nastaveni", "⚙️ Nastavení"],
          ].map(([k, v]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === k ? "bg-yellow-500 text-black" : "text-gray-400 hover:text-white"}`}>
              {v}
            </button>
          ))}
        </div>

        {/* TAB: Rezervace */}
        {tab === "rezervace" && (
          <div className="space-y-4 pb-10">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {[["vse", "Vše"], ...Object.entries(STATUS_LABELS).map(([k, v]) => [k, v.label])].map(([k, v]) => (
                  <button key={k} onClick={() => setFilterStatus(k)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${filterStatus === k ? "bg-yellow-500 border-yellow-500 text-black font-bold" : "border-gray-700 text-gray-400 hover:border-gray-500"}`}>
                    {v}
                  </button>
                ))}
              </div>
              <span className="text-gray-500 text-sm">{filteredBookings.length} rezervací</span>
            </div>

            {selectedBooking ? (
              <BookingDetail
                booking={selectedBooking}
                onBack={() => setSelectedBooking(null)}
                onStatusChange={updateBookingStatus}
                onHandover={() => { setShowHandover(true); setHandoverForm({ handover_datetime: new Date().toISOString().slice(0,16), odometer_km: "", fuel_full: true, fuel_note: "", exterior_notes: "", interior_notes: "", known_defects: "", confirmed_by_admin: true, confirmed_by_customer: false }); }}
                onReturn={() => { setShowReturn(true); setReturnForm({ return_datetime: new Date().toISOString().slice(0,16), odometer_km: "", fuel_full: true, fuel_missing_charge: 0, new_damage: false, damage_notes: "", extra_cleaning: false, extra_cleaning_charge: 0, notes: "" }); }}
                onCharge={() => setShowCharge(true)}
                handoverReport={handoverReports.find(h => h.booking_id === selectedBooking.id)}
                returnReport={returnReports.find(r => r.booking_id === selectedBooking.id)}
                charges={charges.filter(c => c.booking_id === selectedBooking.id)}
                onToggleChargePaid={toggleChargePaid}
                noteText={noteText || selectedBooking.admin_notes || ""}
                setNoteText={setNoteText}
                onSaveNote={() => saveNote(selectedBooking.id)}
              />
            ) : (
              <div className="space-y-3">
                {filteredBookings.map(b => (
                  <div key={b.id} onClick={() => { setSelectedBooking(b); setNoteText(b.admin_notes || ""); }}
                    className="bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-4 cursor-pointer transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="font-bold text-yellow-400">{b.booking_number}</span>
                          <span className={`text-xs px-2 py-1 rounded-full border ${STATUS_LABELS[b.status]?.color}`}>
                            {STATUS_LABELS[b.status]?.label}
                          </span>
                          {b.abroad_travel && <span className="text-xs bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-1 rounded-full">🌍 Zahraničí</span>}
                          {b.animal_transport && <span className="text-xs bg-purple-400/10 text-purple-400 border border-purple-400/20 px-2 py-1 rounded-full">🐾 Zvíře</span>}
                        </div>
                        <div className="font-semibold text-white">{b.customer_first_name} {b.customer_last_name}</div>
                        <div className="text-gray-400 text-sm">{b.customer_email} • {b.customer_phone}</div>
                        <div className="text-gray-500 text-xs mt-1">
                          {b.start_datetime && new Date(b.start_datetime).toLocaleString("cs-CZ")} → {b.end_datetime && new Date(b.end_datetime).toLocaleString("cs-CZ")}
                        </div>
                        <div className="text-gray-500 text-xs">{b.pickup_location} → {b.return_location}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-yellow-400 font-black text-lg">{b.total_price?.toLocaleString("cs-CZ")} Kč</div>
                        <div className="text-gray-500 text-xs">{b.paid_at ? "✓ Zaplaceno" : "Nezaplaceno"}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredBookings.length === 0 && (
                  <div className="text-center py-16 text-gray-500">Žádné rezervace v tomto filtru</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB: Kalendář */}
        {tab === "kalendar" && (
          <div className="pb-10 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Blokované termíny</h2>
              <button onClick={() => setShowBlock(true)}
                className="bg-yellow-500 text-black font-bold px-4 py-2 rounded-xl text-sm hover:bg-yellow-400">
                + Blokovat termín
              </button>
            </div>
            <div className="space-y-3">
              {blocks.map(bl => (
                <div key={bl.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-red-400">🚫 Blokováno</div>
                    <div className="text-gray-400 text-sm">{new Date(bl.start_datetime).toLocaleString("cs-CZ")} — {new Date(bl.end_datetime).toLocaleString("cs-CZ")}</div>
                    {bl.reason && <div className="text-gray-500 text-xs mt-1">{bl.reason}</div>}
                  </div>
                  <button onClick={async () => { await AvailabilityBlock.delete(bl.id); setBlocks(prev => prev.filter(b => b.id !== bl.id)); }}
                    className="text-red-400 hover:text-red-300 text-sm border border-red-400/20 px-3 py-1 rounded-lg">Smazat</button>
                </div>
              ))}
              {blocks.length === 0 && <div className="text-center py-10 text-gray-500">Žádné blokované termíny</div>}
            </div>
            <div>
              <h2 className="text-xl font-bold mb-4">Potvrzené rezervace</h2>
              <div className="space-y-3">
                {bookings.filter(b => b.status === "potvrzeno" || b.status === "probiha").map(b => (
                  <div key={b.id} className="bg-gray-900 border border-green-800/40 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-yellow-400">{b.booking_number}</span>
                        <span className="text-gray-300 ml-3">{b.customer_first_name} {b.customer_last_name}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border ${STATUS_LABELS[b.status]?.color}`}>{STATUS_LABELS[b.status]?.label}</span>
                    </div>
                    <div className="text-gray-400 text-sm mt-1">
                      {b.start_datetime && new Date(b.start_datetime).toLocaleString("cs-CZ")} → {b.end_datetime && new Date(b.end_datetime).toLocaleString("cs-CZ")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Doplatky */}
        {tab === "doplatky" && (
          <div className="pb-10 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Všechny doplatky</h2>
              <div className="text-sm text-gray-400">
                Nezaplaceno: <span className="text-red-400 font-bold">{unpaidCharges.reduce((s, c) => s + c.amount, 0).toLocaleString("cs-CZ")} Kč</span>
              </div>
            </div>
            {charges.map(c => {
              const booking = bookings.find(b => b.id === c.booking_id);
              return (
                <div key={c.id} className={`bg-gray-900 border rounded-xl p-4 ${c.paid ? "border-gray-800 opacity-60" : "border-red-800/40"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-white">{CHARGE_LABELS[c.reason] || c.reason}</div>
                      <div className="text-gray-400 text-sm">{booking?.booking_number} — {booking?.customer_first_name} {booking?.customer_last_name}</div>
                      {c.note && <div className="text-gray-500 text-xs mt-1">{c.note}</div>}
                      {c.due_date && <div className="text-gray-500 text-xs">Splatnost: {new Date(c.due_date).toLocaleDateString("cs-CZ")}</div>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`font-black text-lg ${c.paid ? "text-green-400" : "text-red-400"}`}>{c.amount?.toLocaleString("cs-CZ")} Kč</div>
                      <button onClick={() => toggleChargePaid(c.id, !c.paid)}
                        className={`text-xs mt-1 px-3 py-1 rounded-full border transition-colors ${c.paid ? "border-gray-600 text-gray-400 hover:border-red-400 hover:text-red-400" : "border-green-500 text-green-400 hover:bg-green-500 hover:text-black"}`}>
                        {c.paid ? "Označit jako nezaplacené" : "Označit jako zaplacené"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {charges.length === 0 && <div className="text-center py-16 text-gray-500">Žádné doplatky</div>}
          </div>
        )}

        {/* TAB: Nastavení */}
        {tab === "nastaveni" && (
          <div className="pb-10 space-y-4 max-w-2xl">
            <h2 className="text-xl font-bold mb-6">Nastavení aplikace</h2>
            <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-4 text-amber-300 text-sm mb-6">
              ⚠️ <strong>GDPR poznámka:</strong> Funkce nahrávání fotek dokladů (OP/ŘP) není standardně aktivní. Aktivujte ji pouze po správném nastavení GDPR souhlasů, zabezpečení úložiště a doby uchování dat dle GDPR.
            </div>
            {settings.map(s => (
              <div key={s.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <label className="block text-sm text-gray-400 mb-2">{s.label}</label>
                <div className="flex gap-3">
                  <input type="text" defaultValue={s.value} id={`setting-${s.id}`}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-yellow-500 outline-none text-sm" />
                  <button onClick={() => saveSetting(s.id, document.getElementById(`setting-${s.id}`).value)}
                    className="bg-yellow-500 text-black font-bold px-4 py-2 rounded-lg text-sm hover:bg-yellow-400">
                    Uložit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: Předávací protokol */}
      {showHandover && (
        <Modal title="Předávací protokol" onClose={() => setShowHandover(false)}>
          <div className="space-y-4">
            {[["handover_datetime","Datum a čas předání","datetime-local"],["odometer_km","Stav tachometru (km)","number"]].map(([k,l,t]) => (
              <div key={k}>
                <label className="block text-sm text-gray-400 mb-1">{l}</label>
                <input type={t} value={handoverForm[k]} onChange={e => setHandoverForm(f => ({...f,[k]:e.target.value}))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none" />
              </div>
            ))}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Stav paliva</label>
              <div className="flex gap-3">
                {[["true","Plná nádrž"],["false","Jiné"]].map(([v,l]) => (
                  <button key={v} onClick={() => setHandoverForm(f => ({...f,fuel_full:v==="true"}))}
                    className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-all ${String(handoverForm.fuel_full)===v?"border-yellow-500 bg-yellow-500/10 text-yellow-400":"border-gray-700 text-gray-400"}`}>{l}</button>
                ))}
              </div>
              {!handoverForm.fuel_full && <input type="text" placeholder="Poznámka k palivu" value={handoverForm.fuel_note} onChange={e => setHandoverForm(f=>({...f,fuel_note:e.target.value}))} className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none text-sm"/>}
            </div>
            {[["exterior_notes","Stav exteriéru"],["interior_notes","Stav interiéru"],["known_defects","Známé vady / poškození"]].map(([k,l]) => (
              <div key={k}>
                <label className="block text-sm text-gray-400 mb-1">{l}</label>
                <textarea rows={2} value={handoverForm[k]} onChange={e => setHandoverForm(f=>({...f,[k]:e.target.value}))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none text-sm resize-none"/>
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowHandover(false)} className="flex-1 border border-gray-700 py-3 rounded-xl text-gray-400">Zrušit</button>
              <button onClick={saveHandover} disabled={saving} className="flex-1 bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 disabled:opacity-50">{saving?"Ukládám...":"Uložit protokol"}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Návratový protokol */}
      {showReturn && (
        <Modal title="Návratový protokol" onClose={() => setShowReturn(false)}>
          <div className="space-y-4">
            {[["return_datetime","Datum a čas vrácení","datetime-local"],["odometer_km","Stav tachometru při vrácení (km)","number"]].map(([k,l,t]) => (
              <div key={k}>
                <label className="block text-sm text-gray-400 mb-1">{l}</label>
                <input type={t} value={returnForm[k]} onChange={e => setReturnForm(f=>({...f,[k]:e.target.value}))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none"/>
              </div>
            ))}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Stav paliva při vrácení</label>
              <div className="flex gap-3">
                {[["true","Plná nádrž"],["false","Chybí palivo"]].map(([v,l]) => (
                  <button key={v} onClick={() => setReturnForm(f=>({...f,fuel_full:v==="true"}))}
                    className={`flex-1 py-2 rounded-xl border text-sm font-semibold ${String(returnForm.fuel_full)===v?"border-yellow-500 bg-yellow-500/10 text-yellow-400":"border-gray-700 text-gray-400"}`}>{l}</button>
                ))}
              </div>
              {!returnForm.fuel_full && <input type="number" placeholder="Doplatek za palivo (Kč)" value={returnForm.fuel_missing_charge} onChange={e => setReturnForm(f=>({...f,fuel_missing_charge:e.target.value}))} className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none text-sm"/>}
            </div>
            {[["new_damage","Nové poškození"],["extra_cleaning","Mimořádné čištění"]].map(([k,l]) => (
              <div key={k} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
                <span className="text-sm">{l}</span>
                <div className="flex gap-2">
                  {["Ano","Ne"].map(v => (
                    <button key={v} onClick={() => setReturnForm(f=>({...f,[k]:v==="Ano"}))}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border ${returnForm[k]===(v==="Ano")?"border-yellow-500 bg-yellow-500/10 text-yellow-400":"border-gray-600 text-gray-400"}`}>{v}</button>
                  ))}
                </div>
              </div>
            ))}
            {returnForm.extra_cleaning && <input type="number" placeholder="Poplatek za čištění (Kč)" value={returnForm.extra_cleaning_charge} onChange={e => setReturnForm(f=>({...f,extra_cleaning_charge:e.target.value}))} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none text-sm"/>}
            {returnForm.new_damage && <textarea rows={2} placeholder="Popis poškození" value={returnForm.damage_notes} onChange={e => setReturnForm(f=>({...f,damage_notes:e.target.value}))} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none text-sm resize-none"/>}
            <textarea rows={2} placeholder="Poznámky" value={returnForm.notes} onChange={e => setReturnForm(f=>({...f,notes:e.target.value}))} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none text-sm resize-none"/>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowReturn(false)} className="flex-1 border border-gray-700 py-3 rounded-xl text-gray-400">Zrušit</button>
              <button onClick={saveReturn} disabled={saving} className="flex-1 bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 disabled:opacity-50">{saving?"Ukládám...":"Uložit protokol"}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Doplatek */}
      {showCharge && (
        <Modal title="Přidat doplatek" onClose={() => setShowCharge(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Důvod</label>
              <select value={chargeForm.reason} onChange={e => setChargeForm(f=>({...f,reason:e.target.value}))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none">
                {Object.entries(CHARGE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Částka (Kč)</label>
              <input type="number" value={chargeForm.amount} onChange={e => setChargeForm(f=>({...f,amount:e.target.value}))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none"/>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Splatnost</label>
              <input type="date" value={chargeForm.due_date} onChange={e => setChargeForm(f=>({...f,due_date:e.target.value}))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none"/>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Poznámka</label>
              <textarea rows={2} value={chargeForm.note} onChange={e => setChargeForm(f=>({...f,note:e.target.value}))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none text-sm resize-none"/>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowCharge(false)} className="flex-1 border border-gray-700 py-3 rounded-xl text-gray-400">Zrušit</button>
              <button onClick={saveCharge} disabled={saving||!chargeForm.amount} className="flex-1 bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 disabled:opacity-50">{saving?"Ukládám...":"Přidat doplatek"}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL: Blokovat termín */}
      {showBlock && (
        <Modal title="Blokovat termín" onClose={() => setShowBlock(false)}>
          <div className="space-y-4">
            {[["start_datetime","Začátek"],["end_datetime","Konec"]].map(([k,l]) => (
              <div key={k}>
                <label className="block text-sm text-gray-400 mb-1">{l}</label>
                <input type="datetime-local" value={blockForm[k]} onChange={e => setBlockForm(f=>({...f,[k]:e.target.value}))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none"/>
              </div>
            ))}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Důvod (volitelný)</label>
              <input type="text" placeholder="Servis, oprava, osobní použití..." value={blockForm.reason} onChange={e => setBlockForm(f=>({...f,reason:e.target.value}))}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none"/>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowBlock(false)} className="flex-1 border border-gray-700 py-3 rounded-xl text-gray-400">Zrušit</button>
              <button onClick={saveBlock} disabled={saving||!blockForm.start_datetime||!blockForm.end_datetime} className="flex-1 bg-yellow-500 text-black font-bold py-3 rounded-xl hover:bg-yellow-400 disabled:opacity-50">{saving?"Ukládám...":"Blokovat"}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-gray-900">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function BookingDetail({ booking, onBack, onStatusChange, onHandover, onReturn, onCharge, handoverReport, returnReport, charges, onToggleChargePaid, noteText, setNoteText, onSaveNote }) {
  const s = STATUS_LABELS[booking.status];
  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-gray-400 hover:text-white">← Zpět</button>
        <h2 className="text-xl font-bold">{booking.booking_number}</h2>
        <span className={`text-xs px-2 py-1 rounded-full border ${s?.color}`}>{s?.label}</span>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <h3 className="font-bold text-yellow-400">👤 Zákazník</h3>
          <div className="space-y-2 text-sm">
            <div><span className="text-gray-400">Jméno: </span>{booking.customer_first_name} {booking.customer_last_name}</div>
            <div><span className="text-gray-400">E-mail: </span>{booking.customer_email}</div>
            <div><span className="text-gray-400">Telefon: </span>{booking.customer_phone}</div>
            <div><span className="text-gray-400">Datum nar.: </span>{booking.customer_birth_date}</div>
            <div><span className="text-gray-400">Adresa: </span>{booking.customer_address}</div>
            <div><span className="text-gray-400">OP: </span><span className="font-mono">{booking.customer_id_card}</span></div>
            <div><span className="text-gray-400">ŘP: </span><span className="font-mono">{booking.customer_drivers_license}</span></div>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <h3 className="font-bold text-yellow-400">🚗 Rezervace</h3>
          <div className="space-y-2 text-sm">
            <div><span className="text-gray-400">Začátek: </span>{booking.start_datetime && new Date(booking.start_datetime).toLocaleString("cs-CZ")}</div>
            <div><span className="text-gray-400">Konec: </span>{booking.end_datetime && new Date(booking.end_datetime).toLocaleString("cs-CZ")}</div>
            <div><span className="text-gray-400">Délka: </span>{booking.duration_hours} hodin</div>
            <div><span className="text-gray-400">Předání: </span>{booking.pickup_location}</div>
            <div><span className="text-gray-400">Vrácení: </span>{booking.return_location}</div>
            <div><span className="text-gray-400">Cena: </span><span className="text-yellow-400 font-bold">{booking.total_price?.toLocaleString("cs-CZ")} Kč</span></div>
            <div><span className="text-gray-400">Zahraničí: </span>{booking.abroad_travel ? `ANO — ${booking.abroad_countries}` : "Ne"}</div>
            <div><span className="text-gray-400">Zvíře: </span>{booking.animal_transport ? `ANO — ${booking.animal_detail}` : "Ne"}</div>
          </div>
        </div>
      </div>

      {/* Akce */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="font-bold text-yellow-400 mb-4">⚡ Akce</h3>
        <div className="flex flex-wrap gap-3">
          {!handoverReport && booking.status === "potvrzeno" && (
            <button onClick={onHandover} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-sm">📋 Předávací protokol</button>
          )}
          {handoverReport && !returnReport && (booking.status === "probiha" || booking.status === "potvrzeno") && (
            <button onClick={onReturn} className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded-xl text-sm">📋 Návratový protokol</button>
          )}
          <button onClick={onCharge} className="bg-red-700 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-xl text-sm">💰 Přidat doplatek</button>
          <select onChange={e => onStatusChange(booking.id, e.target.value)} value={booking.status}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-yellow-500">
            {Object.entries(STATUS_LABELS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      {/* Předávací protokol */}
      {handoverReport && (
        <div className="bg-gray-900 border border-blue-800/40 rounded-xl p-5">
          <h3 className="font-bold text-blue-400 mb-3">📋 Předávací protokol</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-400">Datum: </span>{handoverReport.handover_datetime && new Date(handoverReport.handover_datetime).toLocaleString("cs-CZ")}</div>
            <div><span className="text-gray-400">Tachometr: </span>{handoverReport.odometer_km} km</div>
            <div><span className="text-gray-400">Palivo: </span>{handoverReport.fuel_full ? "Plná nádrž" : handoverReport.fuel_note}</div>
            <div><span className="text-gray-400">Exteriér: </span>{handoverReport.exterior_notes || "—"}</div>
            <div><span className="text-gray-400">Interiér: </span>{handoverReport.interior_notes || "—"}</div>
            <div><span className="text-gray-400">Vady: </span>{handoverReport.known_defects || "—"}</div>
          </div>
        </div>
      )}

      {/* Návratový protokol */}
      {returnReport && (
        <div className="bg-gray-900 border border-green-800/40 rounded-xl p-5">
          <h3 className="font-bold text-green-400 mb-3">📋 Návratový protokol</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-400">Datum: </span>{returnReport.return_datetime && new Date(returnReport.return_datetime).toLocaleString("cs-CZ")}</div>
            <div><span className="text-gray-400">Tachometr: </span>{returnReport.odometer_km} km</div>
            <div><span className="text-gray-400">Najeto: </span>{returnReport.total_km} km (zahrnuto: {returnReport.included_km} km)</div>
            <div><span className="text-gray-400">Nadlimit: </span><span className={returnReport.excess_km > 0 ? "text-red-400 font-bold" : ""}>{returnReport.excess_km} km = {returnReport.excess_km_charge} Kč</span></div>
            <div><span className="text-gray-400">Palivo: </span>{returnReport.fuel_full ? "Plná nádrž" : `Chybí — ${returnReport.fuel_missing_charge} Kč`}</div>
            <div><span className="text-gray-400">Poškození: </span>{returnReport.new_damage ? returnReport.damage_notes : "Ne"}</div>
          </div>
        </div>
      )}

      {/* Doplatky */}
      {charges.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-bold text-yellow-400 mb-3">💰 Doplatky</h3>
          <div className="space-y-2">
            {charges.map(c => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div>
                  <span className="text-sm font-medium">{CHARGE_LABELS[c.reason]}</span>
                  {c.note && <span className="text-gray-500 text-xs ml-2">— {c.note}</span>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${c.paid ? "text-green-400" : "text-red-400"}`}>{c.amount?.toLocaleString("cs-CZ")} Kč</span>
                  <button onClick={() => onToggleChargePaid(c.id, !c.paid)}
                    className={`text-xs px-2 py-1 rounded border ${c.paid ? "border-gray-600 text-gray-400" : "border-green-500 text-green-400"}`}>
                    {c.paid ? "Zaplaceno" : "Uhradit"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin poznámka */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="font-bold text-yellow-400 mb-3">📝 Interní poznámka</h3>
        <textarea rows={3} value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Interní poznámka viditelná pouze adminovi..."
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none text-sm resize-none mb-3"/>
        <button onClick={onSaveNote} className="bg-yellow-500 text-black font-bold px-6 py-2 rounded-xl text-sm hover:bg-yellow-400">Uložit poznámku</button>
      </div>
    </div>
  );
}
