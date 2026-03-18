import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const tId = toast.loading("Sincronizando credenciales...");
    try {
      await login(email, password);
      toast.success("ACCESO AUTORIZADO", { id: tId });
      navigate("/panel-vendedor");
    } catch (error) {
      toast.error(error.response?.data?.mensaje || "Error de autenticación", { id: tId });
    }
  };

  return (
    <div className="bg-agro-midnight min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Luces ambientales de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-agro-teal/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-agro-teal/10 rounded-full blur-[150px]"></div>

      <div className="w-full max-w-md relative z-10 animate-reveal">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-4">
            360 <span className="text-agro-teal not-italic">AGRO</span>
          </h1>
          <p className="text-agro-cream/30 text-[10px] font-black uppercase tracking-[0.4em] italic">
            Terminal de Acceso Seguro
          </p>
        </header>

        <form onSubmit={handleSubmit} className="bg-agro-charcoal/30 border border-white/5 p-12 rounded-[3.5rem] backdrop-blur-xl shadow-2xl space-y-8">
          <div className="flex flex-col gap-3">
            <label className="text-[9px] text-agro-teal font-black uppercase tracking-widest ml-1">Email Corporativo</label>
            <input 
              type="email" 
              className="bg-agro-midnight p-5 rounded-2xl text-white outline-none border border-white/5 focus:border-agro-teal/30 transition-all font-bold text-sm shadow-inner"
              placeholder="usuario@redagro.com"
              required 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-[9px] text-agro-teal font-black uppercase tracking-widest ml-1">Contraseña</label>
            <input 
              type="password" 
              className="bg-agro-midnight p-5 rounded-2xl text-white outline-none border border-white/5 focus:border-agro-teal/30 transition-all font-bold text-sm shadow-inner"
              placeholder="••••••••"
              required 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <button type="submit" className="w-full bg-agro-teal py-6 rounded-2xl font-black text-agro-midnight hover:shadow-teal-glow transition-all uppercase tracking-[0.4em] text-[10px] mt-4 active:scale-95">
            AUTENTICAR ➔
          </button>
        </form>

        <footer className="mt-10 text-center space-y-4">
          <p className="text-agro-cream/20 text-[9px] font-black uppercase tracking-widest">
            ¿No posee una cuenta activa? 
            <Link to="/register" className="text-agro-teal ml-2 hover:text-agro-cream transition-colors">Solicitar Registro</Link>
          </p>
          <Link to="/" className="block text-agro-cream/10 text-[8px] font-black uppercase tracking-widest hover:text-agro-teal transition-colors italic">
            Regresar al Radar 360
          </Link>
        </footer>
      </div>
    </div>
  );
}