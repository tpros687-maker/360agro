import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { BASE_URL } from "../api/axiosConfig";

export default function ProductoDetalle() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarProducto = async () => {
      try {
        const { data } = await api.get(`/productos/id/${id}`); // Ajusta según tu ruta de backend
        setProducto(data);
      } catch (error) {
        console.error("Error al cargar producto", error);
      } finally {
        setLoading(false);
      }
    };
    cargarProducto();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-agro-midnight text-agro-teal p-20 text-center font-black">CARGANDO ACTIVO...</div>;
  if (!producto) return <div className="min-h-screen bg-agro-midnight text-white p-20 text-center">PRODUCTO NO ENCONTRADO</div>;

  return (
    <div className="bg-agro-midnight min-h-screen pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-6xl bg-agro-charcoal/50 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* IMAGEN */}
          <div className="h-[500px] bg-agro-midnight">
            <img 
              src={`${BASE_URL}${producto.fotoPrincipal || producto.fotos[0]}`} 
              className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
              alt={producto.titulo}
            />
          </div>
          {/* INFO */}
          <div className="p-12 flex flex-col justify-center">
            <span className="text-agro-teal font-black text-xs uppercase tracking-[0.3em] mb-4">{producto.categoria}</span>
            <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-6 leading-none">{producto.titulo}</h1>
            <p className="text-agro-cream/40 text-lg mb-10 italic leading-relaxed">"{producto.descripcion}"</p>
            <div className="text-4xl font-black text-white italic mb-10">${producto.precio?.toLocaleString()} USD</div>
            
            <button className="btn-emerald w-full py-5 text-sm">AÑADIR A LA SOLICITUD ➔</button>
          </div>
        </div>
      </div>
    </div>
  );
}