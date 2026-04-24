import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Cloud, Sun, Zap, Info, MapPin, ArrowRight } from "lucide-react";
import uruguayTopo from "../data/uruguay.json";
import api from "../api/axiosConfig";

/**
 * RadarNacional.jsx
 * Componente de visualización geográfica premium estilo Agro-Noir.
 * Utiliza react-simple-maps para precisión absoluta y datos TopoJSON.
 */
const RadarNacional = () => {
    const [departamentoActivo, setDepartamentoActivo] = useState("Montevideo");
    const [settings, setSettings] = useState({});
    const [mapaData, setMapaData] = useState({});
    const [loadingMapa, setLoadingMapa] = useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [settingsRes, statsRes] = await Promise.all([
                    api.get("/settings"),
                    api.get("/stats/por-departamento")
                ]);
                setSettings(settingsRes.data);
                setMapaData(statsRes.data);
            } catch (error) {
                console.error("Error al cargar datos del mapa:", error);
            } finally {
                setLoadingMapa(false);
            }
        };
        fetchData();
    }, []);

    const data = mapaData[departamentoActivo] || { lotes: 0, servicios: 0 };

    return (
        <section className="py-32 px-6 bg-background relative overflow-hidden border-y border-outline-variant/10">
            {/* Glow Effects Decorativos */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[200px] rounded-full opacity-40"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 blur-[150px] rounded-full opacity-30"></div>

            <div className="container mx-auto relative z-10 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">

                    {/* LADO IZQUIERDO: EL MAPA VECTORIAL */}
                    <div className="lg:col-span-7 bg-surface-container-high border border-outline-variant/15 p-10 rounded-[3rem] relative overflow-hidden min-h-[600px] flex items-center justify-center shadow-2xl group">
                        <div className="absolute top-10 left-10 flex flex-col gap-1 z-20">
                            <div className="flex items-center gap-4">
                                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-ping"></div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary italic glow-text">
                                    {settings.home_map_title || "Radar Nacional Sincronizado"}
                                </span>
                            </div>
                            <p className="text-[9px] text-on-surface-variant/40 font-medium uppercase tracking-widest ml-6 italic">
                                {settings.home_map_subtitle || "Monitoreo de infraestructura productiva"}
                            </p>
                        </div>

                        <ComposableMap
                            projection="geoMercator"
                            projectionConfig={{
                                scale: 5200,
                                center: [-56, -32.8]
                            }}
                            width={800}
                            height={700}
                            className="w-full h-auto drop-shadow-2xl"
                        >
                            <Geographies geography={uruguayTopo} parseGeographies={(geos) => geos}>
                                {({ geographies }) =>
                                    geographies.map((geo) => {
                                        const name = geo.properties.NAME_1;
                                        const isActivo = name === departamentoActivo;
                                        return (
                                            <Geography
                                                key={geo.rsmKey}
                                                geography={geo}
                                                onClick={() => setDepartamentoActivo(name)}
                                                className="transition-all duration-300 outline-none"
                                                style={{
                                                    default: {
                                                        fill: isActivo ? "rgba(63,111,118,0.3)" : "rgba(63,111,118,0.05)",
                                                        stroke: isActivo ? "#3F6F76" : "rgba(63,111,118,0.4)",
                                                        strokeWidth: isActivo ? 2.5 : 1.5,
                                                        outline: "none"
                                                    },
                                                    hover: {
                                                        fill: "rgba(63,111,118,0.4)",
                                                        stroke: "#3F6F76",
                                                        strokeWidth: 2,
                                                        outline: "none",
                                                        cursor: "pointer"
                                                    },
                                                    pressed: {
                                                        fill: "#3F6F76",
                                                        outline: "none"
                                                    }
                                                }}
                                            />
                                        );
                                    })
                                }
                            </Geographies>
                        </ComposableMap>
                    </div>

                    {/* LADO DERECHO: HUB DE DATOS SINCRONIZADO */}
                    <div className="lg:col-span-5 flex flex-col gap-10">

                        {/* PANEL PRINCIPAL DE ESTADO */}
                        <div className="bg-surface-container-high border border-outline-variant/15 p-12 rounded-[3rem] relative overflow-hidden flex-1 flex flex-col justify-center shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 machined-gradient opacity-10 rounded-bl-[10rem]"></div>

                            <div className="flex justify-between items-start mb-10 relative z-10">
                                <div>
                                    <h2 className="text-6xl md:text-7xl font-black text-on-surface italic tracking-tighter leading-none uppercase glow-text">
                                        {departamentoActivo}
                                    </h2>
                                    <div className="flex items-center gap-3 mt-6 text-on-surface-variant/40 text-[10px] font-bold uppercase tracking-[0.4em] italic leading-none">
                                        <span className="material-symbols-outlined text-sm text-primary">location_on</span>
                                        Geolocalizador
                                    </div>
                                </div>
                                <div className="bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/10 shadow-xl backdrop-blur-md">
                                    <span className="material-symbols-outlined text-4xl text-primary">location_on</span>
                                </div>
                            </div>

                            <div className="flex items-end gap-10 mb-10 mt-10 relative z-10">
                                <span className="text-[9rem] font-black text-on-surface italic tracking-tighter leading-none glow-text">
                                    {loadingMapa ? "—" : (data.lotes + data.servicios)}<span className="text-primary text-4xl">act</span>
                                </span>
                                <div className="mb-6">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-on-surface-variant/40 italic mb-2">Activos en zona</p>
                                    <p className="text-primary font-black text-2xl uppercase tracking-widest italic leading-tight">En plataforma</p>
                                </div>
                            </div>
                        </div>

                        {/* CUADRICULA DE INDICADORES */}
                        <div className="grid grid-cols-1 gap-6">

                            {/* CARD: COMPONENTES */}
                            <div className="bg-surface-container-high border border-outline-variant/10 p-8 rounded-[2rem] group hover:bg-surface-container-highest transition-all flex items-center justify-between shadow-xl">
                                <div className="flex gap-8 items-center">
                                    <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary border border-outline-variant/10 shadow-inner group-hover:bg-primary/5 transition-colors">
                                        <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">inventory_2</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-on-surface-variant/40 italic block mb-1">Lotes disponibles</span>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-5xl font-black text-on-surface italic tracking-tighter transition-all group-hover:text-primary leading-none">{data.lotes}</p>
                                            <span className="text-primary font-bold text-[8px] uppercase tracking-tighter"></span>
                                        </div>
                                    </div>
                                </div>
                                <Link to={`/lotes?depto=${departamentoActivo}`} className="w-14 h-14 machined-gradient rounded-2xl flex items-center justify-center text-on-tertiary-fixed shadow-lg hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </Link>
                            </div>

                            <div className="bg-surface-container-high border border-outline-variant/10 p-8 rounded-[2rem] group hover:bg-surface-container-highest transition-all flex items-center justify-between shadow-xl">
                                <div className="flex gap-8 items-center">
                                    <div className="w-16 h-16 bg-surface-container-low rounded-2xl flex items-center justify-center text-primary border border-outline-variant/10 shadow-inner group-hover:bg-primary/5 transition-colors">
                                        <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">hub</span>
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-on-surface-variant/40 italic block mb-1">Servicio</span>
                                        <div className="flex items-baseline gap-2">
                                            <p className="text-5xl font-black text-on-surface italic tracking-tighter transition-all group-hover:text-primary leading-none">{data.servicios}</p>
                                            <span className="text-primary font-bold text-[8px] uppercase tracking-tighter"></span>
                                        </div>
                                    </div>
                                </div>
                                <Link to={`/servicios?depto=${departamentoActivo}`} className="w-14 h-14 machined-gradient rounded-2xl flex items-center justify-center text-on-tertiary-fixed shadow-lg hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </Link>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default RadarNacional;
