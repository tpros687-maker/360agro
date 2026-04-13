import React from "react";
import subscripcionApi from "../api/subscripcionApi";
import { toast } from "react-hot-toast";

export default function ModalPago({ isOpen, onClose, plan, onSuccess }) {
    if (!isOpen) return null;

    const handleWhatsApp = async () => {
        try {
            // Registrar la solicitud en la DB antes de abrir WhatsApp
            await subscripcionApi.solicitar(plan.key);

            const mensaje = `Hola Agro - Market! Mi solicitud de activation para el plan ${plan.nombre.toUpperCase()} ha sido registrada. ¿Me podrían indicar los pasos para confirmar el pago ? `;
            window.open(`https://wa.me/59899000000?text=${encodeURIComponent(mensaje)}`, "_blank");

            if (onSuccess) onSuccess(plan.key);
            onClose();
        } catch (error) {
            console.error("Error al registrar solicitud:", error);
            toast.error(error.response?.data?.mensaje || "Error al conectar con la central de pagos");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-agro-midnight/90 backdrop-blur-xl">
            <div
                className="bg-agro-charcoal border border-white/10 rounded-[3rem] p-10 max-w-lg w-full shadow-teal-glow-lg relative overflow-hidden animate-fade-in-up"
            >
                {/* Glow Decorativo */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-agro-teal/10 rounded-full blur-3xl"></div>

                <header className="mb-8 text-center">
                    <span className="text-agro-teal font-black text-[10px] uppercase tracking-widest mb-2 block italic">Próximo Escalón</span>
                    <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-tight">
                        ACTIVA TU PLAN <span className="text-agro-teal not-italic">{plan.nombre}</span>
                    </h2>
                </header>

                <div className="space-y-6 mb-10 text-agro-cream/60">
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                        <h4 className="text-white text-[10px] font-black uppercase tracking-widest mb-4">Instrucciones de Pago</h4>
                        <p className="text-[11px] leading-relaxed mb-4">
                            Para formalizar tu suscripción de <span className="text-white font-bold">{plan.precio}</span>, por favor realiza una transferencia bancaria o contáctanos directamente.
                        </p>
                        <div className="space-y-2 text-[10px] font-mono bg-agro-midnight/50 p-4 rounded-xl border border-white/5">
                            <p>BANCO: SANTANDER</p>
                            <p>CUENTA: 123456789 - USD</p>
                            <p>TITULAR: AGRO-MARKET S.A.</p>
                            <p>REF: {plan.nombre.toUpperCase()}_ACTIVO</p>
                        </div>
                    </div>

                    <p className="text-[10px] text-center italic font-bold">
                        Una vez realizado el pago, envía el comprobante por WhatsApp para la activación inmediata.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={onClose}
                        className="py-5 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all"
                    >
                        VOLVER
                    </button>
                    <button
                        onClick={handleWhatsApp}
                        className="py-5 rounded-2xl bg-agro-teal text-agro-midnight font-black text-[10px] uppercase tracking-widest shadow-teal-glow hover:shadow-teal-glow-lg transition-all"
                    >
                        WHATSAPP <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
