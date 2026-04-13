import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function VerificarEmail() {
  const navigate = useNavigate();
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      toast.error("Sesión no encontrada. Registrate primero.");
      navigate("/register");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const tId = toast.loading("Verificando código...");

    try {
      await api.post("/users/verificar-email", { codigo });
      toast.success("EMAIL VERIFICADO", { id: tId });
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      const msg = err.response?.data?.mensaje || "Error al verificar el código";
      toast.error(msg, { id: tId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center px-6 py-32 relative overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* Luces de fondo */}
      <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-primary/5 rounded-full blur-[250px] pointer-events-none opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px] pointer-events-none opacity-30"></div>

      <div className="w-full max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 items-center">

          {/* COLUMNA DE MARCA */}
          <div className="lg:w-1/2 space-y-16">
            <header>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-0.5 machined-gradient shadow-[0_0_10px_rgba(63,111,118,0.4)]"></div>
                <span className="text-primary font-bold text-[12px] uppercase tracking-[0.8em] block italic">Verificación de Acceso</span>
              </div>
              <h1 className="text-7xl md:text-[9.5rem] font-black text-on-surface italic tracking-tighter leading-[0.8] uppercase glow-text">
                VALIDAR <br />
                <span className="text-primary not-italic">IDENTIDAD</span>
              </h1>
            </header>

            <p className="text-on-surface-variant text-2xl leading-relaxed italic border-l-4 border-primary/20 pl-10 max-w-2xl uppercase tracking-[0.1em] font-medium opacity-60">
              "REVISÁ TU EMAIL, TE ENVIAMOS UN CÓDIGO DE 6 DÍGITOS PARA CONFIRMAR TU TERMINAL."
            </p>

            <div className="grid grid-cols-1 gap-10 pt-8">
              {[
                { text: "Código válido por 15 minutos", icon: "timer" },
                { text: "Revisá también la carpeta de spam", icon: "mark_email_unread" },
                { text: "Un código por cuenta registrada", icon: "verified_user" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6 font-bold uppercase text-[10px] tracking-[0.4em] text-on-surface-variant/40 group cursor-default">
                  <div className="w-14 h-14 rounded-[1.5rem] bg-surface-container-high flex items-center justify-center text-primary border border-outline-variant/10 group-hover:border-primary/40 group-hover:bg-primary/5 transition-all duration-500 shadow-xl">
                    <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                  </div>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          {/* FORMULARIO */}
          <div className="lg:w-5/12 w-full lg:ml-auto">
            <div className="bg-surface-container-high border border-outline-variant/15 p-10 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-1.5 machined-gradient opacity-50"></div>

              <div className="mb-10 text-center">
                <div className="w-20 h-20 machined-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(63,111,118,0.4)]">
                  <span className="material-symbols-outlined text-3xl text-on-tertiary-fixed">mark_email_read</span>
                </div>
                <p className="text-on-surface-variant text-[11px] font-bold uppercase tracking-[0.4em] italic opacity-60">
                  Ingresá el código recibido en tu email
                </p>
                <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest mt-2">
                  Si no lo encontrás revisá tu carpeta de spam o correo no deseado
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] ml-6 italic opacity-80">Código de Verificación</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 text-xl">pin</span>
                    <input
                      type="text"
                      maxLength={6}
                      className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-6 pl-14 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 outline-none text-on-surface font-black transition-all shadow-inner text-2xl placeholder:text-on-surface-variant/10 tracking-[0.5em] text-center"
                      placeholder="000000"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || codigo.length !== 6}
                  className="machined-gradient w-full py-6 rounded-full font-black text-on-tertiary-fixed text-[11px] uppercase tracking-[0.5em] shadow-xl hover:scale-[1.03] transition-all active:scale-95 disabled:opacity-50 mt-4 italic"
                >
                  {loading ? "Verificando..." : <>CONFIRMAR CÓDIGO <span className="material-symbols-outlined text-sm">arrow_forward</span></>}
                </button>
              </form>

              <div className="mt-16 text-center pt-10 border-t border-outline-variant/10">
                <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest italic opacity-40">
                  ¿Ya verificaste tu cuenta? <br />
                  <Link to="/login" className="text-primary mt-4 inline-block hover:text-on-surface transition-all underline underline-offset-[10px] font-bold text-[11px]">Acceder al Nodo Central</Link>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
