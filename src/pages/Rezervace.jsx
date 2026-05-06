import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Booking, AvailabilityBlock } from "../api/entities";
import { createClient } from "../api/base44Client";

const LOCATIONS = [
  "Brno – Zvonařka",
  "Brno – Kamechy / Bystrc",
  "Jiné místo v Brně (+500 Kč)",
  "Mimo Brno (+10 Kč/km)",
];

function calcPrice(startDt, endDt) {
  if (!startDt || !endDt) return { base: 0, total: 0, hours: 0, days: 0 };
  const ms = new Date(endDt) - new Date(startDt);
  const hours = ms / (1000 * 60 * 60);
  const days = Math.ceil(hours / 24);
  let base = 0;
  if (hours <= 0) return { base: 0, total: 0, hours: 0, days: 0 };
  if (hours <= 24) base = 1990;
  else if (hours <= 168) base = Math.min(7990, Math.ceil(hours / 24) * 1990);
  else base = 7990; // delší — individuálně (zobrazíme varování)
  const weekCount = Math.floor(hours / 168);
  const remainingDays = Math.ceil((hours - weekCount * 168) / 24);
  if (hours > 24 && hours <= 168) base = 7990;
  if (hours < 24 && hours > 0) base = 1990;
  return { base, total: base, hours: Math.round(hours), days };
}

function calcSurcharge(loc) {
  if (loc?.includes("Jiné místo v Brně")) return 500;
  if (loc?.includes("Mimo Brno")) return 0; // závisí na km — zobrazíme info
  return 0;
}

export default function Rezervace() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [blockedDates, setBlockedDates] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);

  const [form, setForm] = useState({
    start_datetime: params.get("start") || "",
    end_datetime: params.get("end") || "",
    first_name: "", last_name: "", email: "", phone: "",
    birth_date: "", address: "",
    id_card: "", drivers_license: "",
    pickup_location: "Brno – Zvonařka",
    pickup_location_detail: "",
    return_location: "Brno – Zvonařka",
    return_location_detail: "",
    abroad_travel: false, abroad_countries: "",
    animal_transport: false, animal_detail: "",
    terms: false, gdpr: false,
  });

  useEffect(() => {
    // Načti blokované a potvrzené termíny
    AvailabilityBlock.list().then(setBlockedDates).catch(() => {});
    Booking.filter({ status: "potvrzeno" }).then(setBookedDates).catch(() => {});
  }, []);

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const pricing = calcPrice(form.start_datetime, form.end_datetime);
  const pickupSurcharge = calcSurcharge(form.pickup_location);
  const returnSurcharge = calcSurcharge(form.return_location);
  const totalSurcharge = pickupSurcharge + returnSurcharge;
  const totalPrice = pricing.base + totalSurcharge;
  const isLongRental = pricing.hours > 168;

  // Kontrola 24h předem
  const now = new Date();
  const startDt = new Date(form.start_datetime);
  const tooSoon = form.start_datetime && (startDt - now) < 24 * 60 * 60 * 1000;

  // Kontrola konfliktu termínů
  function hasConflict() {
    if (!form.start_datetime || !form.end_datetime) return false;
    const s = new Date(form.start_datetime), e = new Date(form.end_datetime);
    for (const b of [...blockedDates, ...bookedDates]) {
      const bs = new Date(b.start_datetime), be = new Date(b.end_datetime);
      if (s < be && e > bs) return true;
    }
    return false;
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const bookingNumber = "RZ" + Date.now().toString().slice(-8);
      const booking = await Booking.create({
        booking_number: bookingNumber,
        customer_first_name: form.first_name,
        customer_last_name: form.last_name,
        customer_email: form.email,
        customer_phone: form.phone,
        customer_birth_date: form.birth_date,
        customer_address: form.address,
        customer_id_card: form.id_card,
        customer_drivers_license: form.drivers_license,
        start_datetime: form.start_datetime,
        end_datetime: form.end_datetime,
        duration_hours: pricing.hours,
        pickup_location: form.pickup_location,
        pickup_location_detail: form.pickup_location_detail,
        return_location: form.return_location,
        return_location_detail: form.return_location_detail,
        pickup_surcharge: pickupSurcharge,
        return_surcharge: returnSurcharge,
        base_price: pricing.base,
        total_price: totalPrice,
        currency: "CZK",
        status: "ceka_na_platbu",
        abroad_travel: form.abroad_travel,
        abroad_countries: form.abroad_countries,
        animal_transport: form.animal_transport,
        animal_detail: form.animal_detail,
        terms_accepted: form.terms,
        gdpr_accepted: form.gdpr,
        car_id: "mercedes-c220d",
      });

      // Vytvoř Stripe checkout session
      const appUrl = window.location.origin;
      const res = await fetch("/api/functions/createCheckoutSession", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: booking.id,
          amount_czk: totalPrice,
          description: `Pronájem Mercedes-Benz C 220 d — ${bookingNumber}`,
          customer_email: form.email,
          success_url: `${appUrl}/platba-uspesna?booking_id=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${appUrl}/rezervace?cancelled=1`,
        }),
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setError(data.error || "Nepodařilo se vytvořit platbu. Zkuste to znovu.");
      }
    } catch (e) {
      setError("Chyba: " + e.message);
    }
    setLoading(false);
  }

  const stepValid = {
    1: form.start_datetime && form.end_datetime && !tooSoon && !hasConflict() && pricing.hours > 0,
    2: form.first_name && form.last_name && form.email && form.phone && form.birth_date && form.address && form.id_card && form.drivers_license,
    3: form.terms && form.gdpr,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-black font-black text-sm">MB</div>
            <span className="font-bold text-white tracking-wide hidden sm:block">Pronájem Brno</span>
          </button>
          <span className="text-gray-600 hidden sm:block">›</span>
          <span className="text-gray-400 text-sm hidden sm:block">Rezervace</span>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black mb-2">Rezervace vozu</h1>
          <p className="text-gray-400">Mercedes-Benz C 220 d AMG Line</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center mb-10 gap-2">
          {["Termín", "Osobní údaje", "Shrnutí & Platba"].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${step > i+1 ? "cursor-pointer" : ""}`}
                onClick={() => step > i+1 && setStep(i+1)}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  step === i+1 ? "bg-yellow-500 border-yellow-500 text-black"
                  : step > i+1 ? "bg-green-600 border-green-600 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-500"
                }`}>{step > i+1 ? "✓" : i+1}</div>
                <span className={`text-sm hidden sm:block ${step === i+1 ? "text-yellow-400 font-semibold" : "text-gray-500"}`}>{s}</span>
              </div>
              {i < 2 && <div className={`w-8 h-px ${step > i+1 ? "bg-green-600" : "bg-gray-700"}`} />}
            </div>
          ))}
        </div>

        {params.get("cancelled") && (
          <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 mb-6 text-red-300 text-center">
            Platba byla zrušena. Vaše rezervace nebyla potvrzena. Termín je stále volný.
          </div>
        )}

        {/* STEP 1 — Termín */}
        {step === 1 && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-6">
            <h2 className="text-xl font-bold">Vyberte termín pronájmu</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Začátek pronájmu *</label>
                <input type="datetime-local" value={form.start_datetime} onChange={e => upd("start_datetime", e.target.value)}
                  min={new Date(Date.now() + 24*60*60*1000).toISOString().slice(0,16)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Konec pronájmu *</label>
                <input type="datetime-local" value={form.end_datetime} onChange={e => upd("end_datetime", e.target.value)}
                  min={form.start_datetime || new Date(Date.now() + 24*60*60*1000).toISOString().slice(0,16)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none" />
              </div>
            </div>

            {tooSoon && (
              <div className="bg-amber-900/30 border border-amber-700 rounded-xl p-4 text-amber-300 text-sm">
                ⚠️ <strong>Rezervace méně než 24 hodin před začátkem pronájmu řešíme telefonicky.</strong><br />
                Zavolejte nám prosím pro ověření dostupnosti: <strong>+420 XXX XXX XXX</strong>
              </div>
            )}

            {hasConflict() && (
              <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm">
                ❌ Zvolený termín není dostupný. Prosím vyberte jiný termín.
              </div>
            )}

            {isLongRental && pricing.hours > 0 && (
              <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4 text-blue-300 text-sm">
                ℹ️ Pro pronájem delší než 7 dní kontaktujte nás pro individuální cenovou nabídku.
              </div>
            )}

            {pricing.hours > 0 && !hasConflict() && !tooSoon && (
              <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                <h3 className="font-semibold mb-4 text-yellow-400">Přehled ceny</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Délka pronájmu:</span>
                    <span>{pricing.hours} hodin ({pricing.days} dní)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Km v ceně:</span>
                    <span>{pricing.days * 200} km</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-2 font-bold text-base">
                    <span>Cena pronájmu:</span>
                    <span className="text-yellow-400">{pricing.base.toLocaleString("cs-CZ")} Kč</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Místo předání *</label>
                <select value={form.pickup_location} onChange={e => upd("pickup_location", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none">
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                {(form.pickup_location.includes("Jiné") || form.pickup_location.includes("Mimo")) && (
                  <input type="text" placeholder="Upřesněte adresu / místo" value={form.pickup_location_detail}
                    onChange={e => upd("pickup_location_detail", e.target.value)}
                    className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none text-sm" />
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Místo vrácení *</label>
                <select value={form.return_location} onChange={e => upd("return_location", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none">
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                {(form.return_location.includes("Jiné") || form.return_location.includes("Mimo")) && (
                  <input type="text" placeholder="Upřesněte adresu / místo" value={form.return_location_detail}
                    onChange={e => upd("return_location_detail", e.target.value)}
                    className="w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none text-sm" />
                )}
              </div>
            </div>

            {totalSurcharge > 0 && (
              <div className="text-sm text-amber-400 bg-amber-900/20 rounded-lg px-4 py-2">
                💡 Příplatky za předání/vrácení: {totalSurcharge.toLocaleString("cs-CZ")} Kč
                {form.pickup_location.includes("Mimo") && " (cena za mimo-Brno závisí na vzdálenosti — upřesníme telefonicky)"}
              </div>
            )}

            <button onClick={() => setStep(2)} disabled={!stepValid[1]}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl text-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Pokračovat — Osobní údaje →
            </button>
          </div>
        )}

        {/* STEP 2 — Osobní údaje */}
        {step === 2 && (
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-6">
            <h2 className="text-xl font-bold">Osobní údaje</h2>
            <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-4 text-blue-300 text-sm">
              🔒 Vaše osobní údaje jsou zpracovávány v souladu s GDPR výhradně za účelem vyřízení rezervace a přípravy smlouvy o pronájmu.
              Číslo OP a ŘP zadáváte pro přípravu smlouvy — fyzická kontrola proběhne při předání vozidla.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ["first_name", "Jméno", "text", "Jan"],
                ["last_name", "Příjmení", "text", "Novák"],
                ["email", "E-mail", "email", "jan@example.com"],
                ["phone", "Telefon", "tel", "+420 xxx xxx xxx"],
                ["birth_date", "Datum narození", "date", ""],
                ["address", "Adresa bydliště", "text", "Ulice 1, 123 00 Město"],
              ].map(([k, lbl, type, ph]) => (
                <div key={k}>
                  <label className="block text-sm text-gray-400 mb-2">{lbl} *</label>
                  <input type={type} placeholder={ph} value={form[k]} onChange={e => upd(k, e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none" />
                </div>
              ))}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Číslo občanského průkazu *</label>
                <input type="text" placeholder="xxxxxxxxx" value={form.id_card} onChange={e => upd("id_card", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Číslo řidičského průkazu *</label>
                <input type="text" placeholder="xxxxxxxxxx" value={form.drivers_license} onChange={e => upd("drivers_license", e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none" />
              </div>
            </div>

            {/* Zahraničí */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-medium">Plánujete cestu do zahraničí?</label>
                <div className="flex gap-3">
                  {["Ano", "Ne"].map(v => (
                    <button key={v} onClick={() => upd("abroad_travel", v === "Ano")}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        form.abroad_travel === (v === "Ano") ? "border-yellow-500 bg-yellow-500/10 text-yellow-400" : "border-gray-600 text-gray-400"
                      }`}>{v}</button>
                  ))}
                </div>
              </div>
              {form.abroad_travel && (
                <input type="text" placeholder="Uveďte cílové země" value={form.abroad_countries}
                  onChange={e => upd("abroad_countries", e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none text-sm" />
              )}
            </div>

            {/* Zvíře */}
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-medium">Budete přepravovat malé zvíře v přepravce?</label>
                <div className="flex gap-3">
                  {["Ano", "Ne"].map(v => (
                    <button key={v} onClick={() => upd("animal_transport", v === "Ano")}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                        form.animal_transport === (v === "Ano") ? "border-yellow-500 bg-yellow-500/10 text-yellow-400" : "border-gray-600 text-gray-400"
                      }`}>{v}</button>
                  ))}
                </div>
              </div>
              {form.animal_transport && (
                <>
                  <input type="text" placeholder="Popište zvíře a velikost přepravky" value={form.animal_detail}
                    onChange={e => upd("animal_detail", e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-yellow-500 outline-none text-sm" />
                  <div className="text-amber-400 text-xs bg-amber-900/20 rounded-lg px-3 py-2">
                    ⚠️ Přeprava zvířat musí být předem schválena pronajímatelem. Po odeslání rezervace vás budeme kontaktovat.
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-between gap-4">
              <button onClick={() => setStep(1)} className="px-6 py-3 border border-gray-700 rounded-xl text-gray-400 hover:border-gray-500">← Zpět</button>
              <button onClick={() => setStep(3)} disabled={!stepValid[2]}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl transition-colors disabled:opacity-40">
                Pokračovat — Shrnutí →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Shrnutí & Platba */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-xl font-bold mb-6">Shrnutí rezervace</h2>
              <div className="space-y-4 text-sm">
                <div className="bg-gray-800 rounded-xl p-4 grid grid-cols-2 gap-3">
                  <div><span className="text-gray-400 block text-xs mb-1">Vozidlo</span>Mercedes-Benz C 220 d AMG</div>
                  <div><span className="text-gray-400 block text-xs mb-1">Délka</span>{pricing.hours} hodin</div>
                  <div><span className="text-gray-400 block text-xs mb-1">Začátek</span>{new Date(form.start_datetime).toLocaleString("cs-CZ")}</div>
                  <div><span className="text-gray-400 block text-xs mb-1">Konec</span>{new Date(form.end_datetime).toLocaleString("cs-CZ")}</div>
                  <div><span className="text-gray-400 block text-xs mb-1">Místo předání</span>{form.pickup_location}{form.pickup_location_detail ? " — " + form.pickup_location_detail : ""}</div>
                  <div><span className="text-gray-400 block text-xs mb-1">Místo vrácení</span>{form.return_location}{form.return_location_detail ? " — " + form.return_location_detail : ""}</div>
                  <div><span className="text-gray-400 block text-xs mb-1">Zákazník</span>{form.first_name} {form.last_name}</div>
                  <div><span className="text-gray-400 block text-xs mb-1">E-mail</span>{form.email}</div>
                </div>

                <div className="bg-gray-800 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between"><span className="text-gray-400">Pronájem:</span><span>{pricing.base.toLocaleString("cs-CZ")} Kč</span></div>
                  {pickupSurcharge > 0 && <div className="flex justify-between"><span className="text-gray-400">Příplatek předání:</span><span>{pickupSurcharge.toLocaleString("cs-CZ")} Kč</span></div>}
                  {returnSurcharge > 0 && <div className="flex justify-between"><span className="text-gray-400">Příplatek vrácení:</span><span>{returnSurcharge.toLocaleString("cs-CZ")} Kč</span></div>}
                  {form.pickup_location.includes("Mimo") && <div className="text-amber-400 text-xs">⚠️ Příplatek mimo Brno bude upřesněn telefonicky (10 Kč/km)</div>}
                  <div className="flex justify-between border-t border-gray-700 pt-2 font-bold text-lg">
                    <span>CELKEM K ÚHRADĚ:</span>
                    <span className="text-yellow-400">{totalPrice.toLocaleString("cs-CZ")} Kč</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.terms} onChange={e => upd("terms", e.target.checked)} className="mt-1 accent-yellow-500 w-4 h-4" />
                <span className="text-sm text-gray-300">
                  Souhlasím s <button onClick={() => window.open("/podmínky", "_blank")} className="text-yellow-400 underline">podmínkami pronájmu</button> *
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.gdpr} onChange={e => upd("gdpr", e.target.checked)} className="mt-1 accent-yellow-500 w-4 h-4" />
                <span className="text-sm text-gray-300">
                  Souhlasím se <button onClick={() => window.open("/gdpr", "_blank")} className="text-yellow-400 underline">zásadami ochrany osobních údajů</button> *
                </span>
              </label>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm">{error}</div>
            )}

            <div className="flex justify-between gap-4">
              <button onClick={() => setStep(2)} className="px-6 py-3 border border-gray-700 rounded-xl text-gray-400 hover:border-gray-500">← Zpět</button>
              <button onClick={handleSubmit} disabled={!stepValid[3] || loading}
                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-xl text-lg transition-colors disabled:opacity-40">
                {loading ? "Přesměrovávám na platbu..." : `💳 Zaplatit ${totalPrice.toLocaleString("cs-CZ")} Kč`}
              </button>
            </div>
            <p className="text-center text-gray-500 text-xs">Budete přesměrováni na zabezpečenou platební bránu Stripe. Vaše platební údaje nejsou ukládány.</p>
          </div>
        )}
      </div>
    </div>
  );
}
