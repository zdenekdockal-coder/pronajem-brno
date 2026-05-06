import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Booking } from "../api/entities";

export default function PlatbaUspesna() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const bookingId = params.get("booking_id");
  const sessionId = params.get("session_id");

  useEffect(() => {
    async function verify() {
      try {
        // Ověř platbu přes backend
        if (sessionId) {
          await fetch("/api/functions/verifyPayment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId, booking_id: bookingId }),
          });
        }
        if (bookingId) {
          const b = await Booking.get(bookingId);
          setBooking(b);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    verify();
  }, [bookingId, sessionId]);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
      <div className="text-center">
        <div className="text-4xl animate-spin mb-4">⌛</div>
        <p className="text-gray-400">Ověřuji platbu...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Success header */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">✓</div>
          <h1 className="text-3xl md:text-4xl font-black text-green-400 mb-3">Platba úspěšná!</h1>
          <p className="text-gray-400 text-lg">Vaše rezervace byla potvrzena. Brzy se vám ozveme.</p>
        </div>

        {booking && (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden mb-8">
            <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-6 py-4">
              <div className="flex items-center justify-between">
                <span className="text-yellow-400 font-bold">Číslo rezervace</span>
                <span className="font-black text-xl">{booking.booking_number}</span>
              </div>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-gray-400 text-xs mb-1">Začátek pronájmu</div>
                  <div className="font-semibold">{booking.start_datetime ? new Date(booking.start_datetime).toLocaleString("cs-CZ") : "—"}</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-gray-400 text-xs mb-1">Konec pronájmu</div>
                  <div className="font-semibold">{booking.end_datetime ? new Date(booking.end_datetime).toLocaleString("cs-CZ") : "—"}</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-gray-400 text-xs mb-1">Místo předání</div>
                  <div className="font-semibold">{booking.pickup_location}</div>
                </div>
                <div className="bg-gray-800 rounded-xl p-4">
                  <div className="text-gray-400 text-xs mb-1">Místo vrácení</div>
                  <div className="font-semibold">{booking.return_location}</div>
                </div>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center justify-between">
                <span className="text-gray-300">Uhrazená cena:</span>
                <span className="text-yellow-400 font-black text-2xl">{booking.total_price?.toLocaleString("cs-CZ")} Kč</span>
              </div>
            </div>
          </div>
        )}

        {/* Další kroky */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 mb-8">
          <h2 className="font-bold text-lg mb-5 text-yellow-400">📋 Další kroky</h2>
          <ol className="space-y-4">
            {[
              "Před předáním vás budeme kontaktovat pro upřesnění místa a času.",
              "Přineste platný občanský průkaz a řidičský průkaz.",
              "Auto bude předáno s plnou nádrží.",
              "Auto vraťte prosím s plnou nádrží.",
              "Při předání vytvoříme předávací protokol a fotodokumentaci.",
            ].map((s, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="w-7 h-7 bg-yellow-500/20 border border-yellow-500/40 rounded-full flex items-center justify-center text-yellow-400 text-sm font-bold flex-shrink-0 mt-0.5">{i+1}</div>
                <p className="text-gray-300 text-sm leading-relaxed">{s}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="text-center space-y-3">
          <p className="text-gray-400 text-sm">Potvrzení bylo odesláno na váš e-mail.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate("/muj-ucet")}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3 rounded-xl transition-colors">
              Zobrazit můj účet
            </button>
            <button onClick={() => navigate("/")}
              className="border border-gray-600 hover:border-gray-400 text-gray-300 font-semibold px-8 py-3 rounded-xl transition-colors">
              Zpět na úvod
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
