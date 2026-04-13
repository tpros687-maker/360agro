import { useState } from "react";
import { Link } from "react-router-dom";

export default function BannerCookies() {
  const [visible, setVisible] = useState(() => {
    return localStorage.getItem("cookies_aceptadas") !== "true";
  });

  const aceptar = () => {
    localStorage.setItem("cookies_aceptadas", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[200] bg-surface-container-high/95 backdrop-blur-xl border-t border-outline-variant/20 px-6 py-5 shadow-2xl">
      <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-on-surface-variant text-[11px] font-bold uppercase tracking-widest leading-relaxed">
          Usamos cookies para mejorar tu experiencia. Al continuar navegando aceptás nuestra{" "}
          <Link to="/privacidad" className="text-primary hover:text-on-surface underline underline-offset-4 transition-colors">
            política de privacidad
          </Link>.
        </p>
        <button
          onClick={aceptar}
          className="shrink-0 px-8 py-3 machined-gradient text-on-tertiary-fixed font-black text-[10px] uppercase tracking-widest rounded-full shadow-lg hover:opacity-90 transition-opacity"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}
