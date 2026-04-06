import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import mercadoPagoApi from "../api/mercadoPagoApi";
import { toast } from "react-hot-toast";

export default function CheckoutSuscripcion({ isOpen, onClose, plan, onSuccess }) {
    const { usuario, setUsuario } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [paso, setPaso] = useState(1); // 1: Datos, 2: Procesando, 3: Éxito

    if (!isOpen) return null;

    const handleSuscribirse = async (e) => {
        e.preventDefault();
        setLoading(true);
        setPaso(2);

        try {
            // 1. Crear la intención en el backend
            const { data: pref } = await mercadoPagoApi.crearSuscripcion(plan.key);

            // 2. Simular el delay de la pasarela de pago (Mercado Pago)
            setTimeout(async () => {
                try {
                    // 3. Disparar el Webhook Simulado para activar el plan
                    const { data: result } = await mercadoPagoApi.simularWebhook({
                        suscripcionId: pref.suscripcionId,
                        usuarioId: usuario._id,
                        planKey: plan.key,
                        status: "approved"
                    });

                    // 4. Actualizar el contexto Global del usuario
                    const actualizado = {
                        ...usuario,
                        plan: result.plan,
                        proximaFechaCobro: result.proximoCobro,
                        estadoSuscripcion: "activa"
                    };
                    setUsuario(actualizado);
                    localStorage.setItem("usuario", JSON.stringify(actualizado));

                    setPaso(3);
                    if (onSuccess) onSuccess(plan.key);

                    setTimeout(() => {
                        onClose();
                        setPaso(1);
                    }, 3000);

                } catch (err) {
                    toast.error("Error en la señal de activación");
                    setPaso(1);
                } finally {
                    setLoading(false);
                }
            }, 2500);

        } catch (error) {
            toast.error("Error al iniciar checkout");
            setLoading(false);
            setPaso(1);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-agro-midnight/95 backdrop-blur-2xl">
            <div className="bg-agro-charcoal border border-white/10 rounded-[3rem] p-12 max-w-md w-full shadow-teal-glow-lg relative overflow-hidden">

                {paso === 1 && (
                    <div className="animate-fade-in">
                        <header className="mb-10 text-center">
                            <span className="text-agro-teal font-black text-[10px] uppercase tracking-widest mb-2 block italic">Checkout Seguro</span>
                            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">
                                SUSCRIPCIÓN <span className="text-agro-teal not-italic">{plan.nombre}</span>
                            </h2>
                            <p className="text-agro-cream/30 text-[10px] font-bold uppercase tracking-widest italic">
                                {plan.precio} / MES - ESTILO NETFLIX
                            </p>
                        </header>

                        <form onSubmit={handleSuscribirse} className="space-y-6">
                            <div className="space-y-4">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <label className="text-[9px] font-black text-white/40 uppercase mb-2 block">Número de Tarjeta</label>
                                    <input type="text" placeholder="**** **** **** 4242" className="bg-transparent w-full text-white font-mono text-sm focus:outline-none" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <label className="text-[9px] font-black text-white/40 uppercase mb-2 block">Vencimiento</label>
                                        <input type="text" placeholder="MM/YY" className="bg-transparent w-full text-white font-mono text-sm focus:outline-none" required />
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                        <label className="text-[9px] font-black text-white/40 uppercase mb-2 block">CVV</label>
                                        <input type="text" placeholder="123" className="bg-transparent w-full text-white font-mono text-sm focus:outline-none" required />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 space-y-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 bg-agro-teal text-agro-midnight font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-teal-glow hover:shadow-teal-glow-lg active:scale-95 transition-all"
                                >
                                    SUSCRIBIRME AHORA ➔
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full py-4 text-white/30 font-black text-[9px] uppercase tracking-widest hover:text-white transition-all"
                                >
                                    CANCELAR
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {paso === 2 && (
                    <div className="py-20 text-center animate-pulse">
                        <div className="w-16 h-16 border-4 border-agro-teal/20 border-t-agro-teal rounded-full animate-spin mx-auto mb-8"></div>
                        <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-4">Procesando Pago</h3>
                        <p className="text-agro-cream/30 text-[10px] font-bold uppercase tracking-widest italic">Conectando con la pasarela segura...</p>
                    </div>
                )}

                {paso === 3 && (
                    <div className="py-20 text-center animate-bounce-in">
                        <div className="w-20 h-20 bg-agro-teal text-agro-midnight rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-teal-glow">
                            ✓
                        </div>
                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">¡BIENVENIDO ELITE!</h3>
                        <p className="text-agro-teal text-[10px] font-black uppercase tracking-widest italic">Tu membresía ha sido activada al instante.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
