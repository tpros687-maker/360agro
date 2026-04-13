import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import mercadoPagoApi from "../api/mercadoPagoApi";
import { toast } from "react-hot-toast";

export default function CheckoutSuscripcion({ isOpen, onClose, plan, onSuccess }) {
    const { usuario, setUsuario } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [paso, setPaso] = useState(1); // 1: Datos, 2: Procesando, 3: Éxito
    const [periodo, setPeriodo] = useState("mensual");

    if (!isOpen) return null;

    const precioActual = plan
        ? { mensual: plan.precioMensual, trimestral: plan.precioTrimestral, anual: plan.precioAnual }[periodo]
        : 0;

    const handleSuscribirse = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPaso(2);

        try {
            const { data } = await mercadoPagoApi.crearSuscripcion(plan.key, periodo);
            window.location.href = data.init_point;
        } catch (error) {
            toast.error("Error al iniciar checkout");
            setLoading(false);
            setPaso(1);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-on-surface/60 backdrop-blur-2xl">
            <div className="bg-white border border-outline-variant/40 rounded-[3rem] p-12 max-w-md w-full shadow-2xl relative overflow-hidden">

                {paso === 1 && (
                    <div className="animate-fade-in">
                        <header className="mb-6 text-center">
                            <span className="text-primary font-black text-[10px] uppercase tracking-widest mb-2 block italic">Checkout Seguro</span>
                            <h2 className="text-3xl font-black text-on-surface italic tracking-tighter uppercase mb-2">
                                SUSCRIPCIÓN <span className="text-primary not-italic">{plan.nombre}</span>
                            </h2>
                            <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-4 text-center my-4">
                                <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest italic">
                                    USD {precioActual} / {periodo}
                                </p>
                            </div>
                        </header>

                        <div className="flex gap-2 mb-6 justify-center">
                            {[["mensual", "Mensual"], ["trimestral", "Trimestral"], ["anual", "Anual"]].map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setPeriodo(key)}
                                    className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${periodo === key
                                        ? "bg-primary text-on-tertiary-fixed border-primary"
                                        : "bg-surface-container text-on-surface-variant border-outline-variant/40 hover:border-primary"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSuscribirse} className="space-y-6">
                            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/40 text-center">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-relaxed">Serás redirigido a MercadoPago para completar el pago de forma segura.</p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 machined-gradient text-on-tertiary-fixed font-black text-[11px] uppercase tracking-widest rounded-full border border-primary/20 shadow-xl hover:shadow-xl active:scale-95 transition-all"
                                >
                                    SUSCRIBIRME AHORA <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full py-4 text-on-surface-variant/60 font-black text-[9px] uppercase tracking-widest hover:text-on-surface transition-all"
                                >
                                    CANCELAR
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {paso === 2 && (
                    <div className="py-20 text-center animate-pulse">
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-8"></div>
                        <h3 className="text-xl font-black text-on-surface italic tracking-tighter uppercase mb-4">Procesando Pago</h3>
                        <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest italic">Conectando con la pasarela segura...</p>
                    </div>
                )}

                {paso === 3 && (
                    <div className="py-20 text-center animate-bounce-in">
                        <div className="w-20 h-20 bg-primary text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-xl">
                            ✓
                        </div>
                        <h3 className="text-3xl font-black text-on-surface italic tracking-tighter uppercase mb-4">¡BIENVENIDO ELITE!</h3>
                        <p className="text-primary text-[10px] font-black uppercase tracking-widest italic">Tu membresía ha sido activada al instante.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
