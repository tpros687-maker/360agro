import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Mail, Lock, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import api from "../api/axiosConfig";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mostrarReset, setMostrarReset] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCodigo, setResetCodigo] = useState("");
  const [resetPassword, setResetPassword] = useState("");

  const handleSolicitarReset = async (e) => {
    e.preventDefault();
    const tId = toast.loading("Enviando código...");
    try {
      await api.post("/users/solicitar-reset", { email: resetEmail });
      toast.success("Código enviado al email", { id: tId });
      setResetStep(2);
    } catch (error) {
      toast.error(error.response?.data?.mensaje || "Error al enviar código", { id: tId });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const tId = toast.loading("Actualizando contraseña...");
    try {
      await api.post("/users/reset-password", {
        email: resetEmail,
        codigo: resetCodigo,
        passwordNueva: resetPassword,
      });
      toast.success("Contraseña actualizada", { id: tId });
      setResetStep(3);
    } catch (error) {
      toast.error(error.response?.data?.mensaje || "Error al resetear contraseña", { id: tId });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tId = toast.loading("Sincronizando credenciales...");
    try {
      await login(email.toLowerCase(), password);
      toast.success("ACCESO AUTORIZADO", { id: tId });
      navigate("/panel-vendedor");
    } catch (error) {
      toast.error(error.response?.data?.mensaje || "Error de autenticación", { id: tId });
    }
  };

  return (
    <div className="bg-background min-h-screen flex items-center justify-center px-6 relative overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* Luces ambientales de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-primary/10 rounded-full blur-[200px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-0.5 machined-gradient shadow-[0_0_10px_rgba(63,111,118,0.4)]"></div>
            <span className="text-primary font-bold text-[10px] uppercase tracking-[0.6em] italic">Ecosistema Soberano 360</span>
            <div className="w-10 h-0.5 machined-gradient shadow-[0_0_10px_rgba(63,111,118,0.4)]"></div>
          </div>
          <h1 className="text-7xl font-black text-on-surface italic tracking-tighter uppercase leading-none mb-6 glow-text">
            ACCESO <span className="text-primary not-italic">SEGURO</span>
          </h1>
          <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.5em] italic opacity-40">
            
          </p>
        </header>

        <form onSubmit={handleSubmit} className="bg-surface-container-high border border-outline-variant/60 p-10 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1.5 machined-gradient opacity-50"></div>

          <div className="space-y-10">
            <div className="flex flex-col gap-4">
              <label className="text-[10px] text-primary font-bold uppercase tracking-[0.4em] ml-6 italic opacity-80">Correo electronico</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 text-xl">account_circle</span>
                <input
                  type="email"
                  className="w-full bg-surface-container-lowest p-6 pl-14 rounded-2xl text-on-surface outline-none border border-outline-variant/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-base shadow-inner placeholder:text-on-surface-variant/10 italic uppercase tracking-wider"
                  placeholder="ID_OPERATIVO@360AGRO.COM"
                  required
                  onChange={(e) => setEmail(e.target.value.toLowerCase())}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-[10px] text-primary font-bold uppercase tracking-[0.4em] ml-6 italic opacity-80">Contraseña</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 text-xl">lock</span>
                <input
                  type="password"
                  className="w-full bg-surface-container-lowest p-6 pl-14 rounded-2xl text-on-surface outline-none border border-outline-variant/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-bold text-base shadow-inner placeholder:text-on-surface-variant/10"
                  placeholder="••••••••••••"
                  required
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="machined-gradient w-full py-6 rounded-full font-black text-on-tertiary-fixed hover:scale-[1.03] transition-all uppercase tracking-[0.5em] text-[11px] mt-4 active:scale-95 italic flex items-center justify-center gap-4 shadow-[0_0_20px_rgba(63,111,118,0.3)]">
              INGRESAR <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </form>

        <button
          onClick={() => setMostrarReset(true)}
          className="text-[11px] text-primary hover:underline mt-4 block text-center font-bold uppercase tracking-widest w-full"
        >
          ¿Olvidaste tu contraseña?
        </button>

        {mostrarReset && (
          <div className="mt-6 bg-surface-container-high border border-outline-variant/60 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 machined-gradient opacity-50"></div>

            {resetStep === 1 && (
              <form onSubmit={handleSolicitarReset} className="space-y-6">
                <h3 className="text-sm font-black text-on-surface uppercase tracking-widest mb-2">Recuperar contraseña</h3>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-primary font-bold uppercase tracking-[0.4em] ml-2 italic opacity-80">Email de la cuenta</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 text-xl">mail</span>
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="TU@EMAIL.COM"
                      className="w-full bg-surface-container-lowest p-6 pl-14 rounded-2xl text-on-surface outline-none border border-outline-variant/50 focus:border-primary/50 transition-all font-bold shadow-inner placeholder:text-on-surface-variant/10 italic uppercase tracking-wider"
                    />
                  </div>
                </div>
                <button type="submit" className="machined-gradient w-full py-5 rounded-full font-black text-on-tertiary-fixed uppercase tracking-[0.4em] text-[11px] flex items-center justify-center gap-3">
                  Enviar código <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </form>
            )}

            {resetStep === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <h3 className="text-sm font-black text-on-surface uppercase tracking-widest mb-2">Ingresá el código</h3>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-primary font-bold uppercase tracking-[0.4em] ml-2 italic opacity-80">Código recibido por email</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 text-xl">pin</span>
                    <input
                      type="text"
                      required
                      value={resetCodigo}
                      onChange={(e) => setResetCodigo(e.target.value)}
                      placeholder="000000"
                      className="w-full bg-surface-container-lowest p-6 pl-14 rounded-2xl text-on-surface outline-none border border-outline-variant/50 focus:border-primary/50 transition-all font-bold shadow-inner placeholder:text-on-surface-variant/10 tracking-[0.5em] text-center"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-primary font-bold uppercase tracking-[0.4em] ml-2 italic opacity-80">Nueva contraseña</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-primary/40 text-xl">lock_reset</span>
                    <input
                      type="password"
                      required
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-surface-container-lowest p-6 pl-14 rounded-2xl text-on-surface outline-none border border-outline-variant/50 focus:border-primary/50 transition-all font-bold shadow-inner placeholder:text-on-surface-variant/10"
                    />
                  </div>
                </div>
                <button type="submit" className="machined-gradient w-full py-5 rounded-full font-black text-on-tertiary-fixed uppercase tracking-[0.4em] text-[11px] flex items-center justify-center gap-3">
                  Cambiar contraseña <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </form>
            )}

            {resetStep === 3 && (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-5xl text-primary mb-4 block">check_circle</span>
                <p className="text-on-surface font-black uppercase tracking-widest text-sm mb-6">Contraseña actualizada</p>
                <button
                  onClick={() => { setMostrarReset(false); setResetStep(1); }}
                  className="machined-gradient px-10 py-4 rounded-full font-black text-on-tertiary-fixed uppercase tracking-widest text-[11px]"
                >
                  Ir al login
                </button>
              </div>
            )}

            {resetStep < 3 && (
              <button
                onClick={() => { setMostrarReset(false); setResetStep(1); }}
                className="mt-4 text-[10px] text-on-surface-variant/40 hover:text-primary transition-colors uppercase tracking-widest font-bold block text-center w-full"
              >
                Cancelar
              </button>
            )}
          </div>
        )}

        <footer className="mt-16 text-center space-y-8">
          <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest italic leading-relaxed opacity-40">
            ¿No posee una terminal activa en la red? <br />
            <Link to="/register" className="text-primary mt-4 inline-block hover:text-on-surface transition-all underline underline-offset-[10px] font-bold text-[11px]">Solicitar Alta de Socio</Link>
          </p>
          <div className="pt-10 border-t border-outline-variant/60 inline-block mx-auto min-w-[200px]">
            <Link to="/" className="flex items-center justify-center gap-3 text-on-surface-variant/30 text-[9px] font-bold uppercase tracking-widest hover:text-primary transition-all italic group">
              <span className="material-symbols-outlined text-sm group-hover:rotate-12 transition-transform">shield</span> Regresar al Portal
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
