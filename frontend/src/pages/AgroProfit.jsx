import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import lotApi from "../api/lotApi";
import costApi from "../api/costApi";
import {
    Calculator as CalcIcon,
    Save,
    RefreshCw,
    AlertCircle,
    TrendingUp,
    DollarSign,
    Scale,
    History,
    CheckCircle2
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function AgroProfit() {
    const { usuario } = useContext(AuthContext);
    const [lotes, setLotes] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        loteId: "",
        precioCompraPorAnimal: 0,
        costoAlimento: 0,
        costoMedicina: 0,
        costoManoObra: 0,
        costoCampo: 0,
        otrosGastos: 0
    });

    const [results, setResults] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resLotes, resHistorial] = await Promise.all([
                    lotApi.obtenerMisLotes(),
                    costApi.getMe()
                ]);

                const activos = resLotes.data.filter(l => l.estado === "Disponible");
                setLotes(activos);
                setHistorial(resHistorial.data.data);

                if (activos.length > 0) {
                    setFormData(prev => ({ ...prev, loteId: activos[0]._id }));
                }
            } catch (err) {
                setError("Error de sincronización con la red de activos.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "loteId" ? value : Number(value)
        }));
    };

    const handleCalculate = async (save = false) => {
        if (!formData.loteId) return toast.error("Seleccione un lote activo.");

        setIsCalculating(true);
        try {
            const { data } = await costApi.calculate({
                ...formData,
                saveRecord: save
            });

            setResults(data.data);

            if (save) {
                toast.success("ANÁLISIS GUARDADO EN LA RED SOBERANA");
                const resHistorial = await costApi.getMe();
                setHistorial(resHistorial.data.data);
            }
        } catch (err) {
            toast.error("Error en el procesamiento de costos.");
        } finally {
            setIsCalculating(false);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat("es-UY", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0
        }).format(val || 0);
    };

    if (loading) {
        return (
            <div className="bg-agro-midnight min-h-screen flex items-center justify-center">
                <RefreshCw className="w-12 h-12 text-agro-ocean animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-agro-midnight min-h-screen pt-40 pb-24 px-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[1000px] h-[800px] bg-agro-ocean/5 blur-[200px] rounded-full pointer-events-none"></div>

            <div className="container mx-auto max-w-7xl relative z-10">

                <header className="mb-20 reveal">
                    <div className="flex items-center gap-4 mb-6">
                        <span className="bg-agro-ocean/20 text-agro-sky px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-agro-ocean/30 italic">
                            Herramienta Premium 360
                        </span>
                    </div>
                    <h1 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-none mb-6">
                        AGRO <span className="text-agro-ocean not-italic">PROFIT</span>
                    </h1>
                    <p className="text-white/20 text-[11px] font-black uppercase tracking-[0.6em] italic border-t border-white/5 pt-6 inline-block">
                        Terminal de Cálculo e Inteligencia de Inversión
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* PANEL DE CONTROL (FORMULARIO) */}
                    <div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-[4rem] p-12 backdrop-blur-3xl shadow-blue-accent relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-agro-ocean to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>

                        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-12 flex items-center gap-4">
                            <CalcIcon className="text-agro-sky" /> PARÁMETROS DE OPERACIÓN
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="md:col-span-2 space-y-3">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-2 italic">ACTIVO DEL ECOSISTEMA</label>
                                <select
                                    name="loteId"
                                    className="w-full bg-agro-midnight/50 border border-white/10 px-8 py-5 rounded-2xl text-[12px] font-black text-white uppercase tracking-widest outline-none focus:border-agro-ocean transition-all"
                                    value={formData.loteId}
                                    onChange={handleInputChange}
                                >
                                    {lotes.length === 0 && <option value="">No posee lotes activos en el sistema</option>}
                                    {lotes.map(l => (
                                        <option key={l._id} value={l._id} className="bg-agro-midnight">{l.titulo} — {l.cantidad} CABEZAS</option>
                                    ))}
                                </select>
                            </div>

                            {[
                                { label: "PRECIO DE COMPRA (U$S/ANIMAL)", name: "precioCompraPorAnimal" },
                                { label: "COSTO NUTRICIÓN (TOTAL)", name: "costoAlimento" },
                                { label: "SANIDAD / MEDICINA", name: "costoMedicina" },
                                { label: "MANO DE OBRA / LOGÍSTICA", name: "costoManoObra" },
                                { label: "ARRENDAMIENTO / CAMPO", name: "costoCampo" },
                                { label: "OTROS GASTOS OPERATIVOS", name: "otrosGastos" }
                            ].map((field) => (
                                <div key={field.name} className="space-y-3">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] ml-2 italic">{field.label}</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name={field.name}
                                            className="w-full bg-agro-midnight/50 border border-white/10 px-8 py-5 rounded-2xl text-[14px] font-black text-white uppercase tracking-widest outline-none focus:border-agro-ocean transition-all"
                                            value={formData[field.name]}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                        />
                                        <DollarSign className="absolute right-6 top-1/2 -translate-y-1/2 text-white/10 w-4 h-4" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 mt-16 pt-10 border-t border-white/5">
                            <button
                                onClick={() => handleCalculate(false)}
                                disabled={isCalculating || lotes.length === 0}
                                className="flex-1 bg-white/5 border border-white/10 text-white font-black text-[11px] uppercase tracking-[0.4em] py-6 rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-4 italic"
                            >
                                <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
                                SIMULAR ESCENARIO
                            </button>
                            <button
                                onClick={() => handleCalculate(true)}
                                disabled={isCalculating || lotes.length === 0}
                                className="flex-1 bg-agro-ocean text-white font-black text-[11px] uppercase tracking-[0.4em] py-6 rounded-2xl hover:bg-agro-sky transition-all shadow-blue-accent flex items-center justify-center gap-4 italic"
                            >
                                <Save className="w-4 h-4" />
                                CALCULAR Y CERTIFICAR
                            </button>
                        </div>
                    </div>

                    {/* PANEL DE RESULTADOS (VISTA RÁPIDA) */}
                    <div className="lg:col-span-4 space-y-12">
                        <div className="bg-agro-charcoal border border-agro-ocean/30 rounded-[3rem] p-12 shadow-blue-accent-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-agro-ocean/10 rounded-full blur-[50px] -mr-16 -mt-16 group-hover:bg-agro-ocean/20 transition-colors"></div>

                            <h3 className="text-[11px] font-black text-agro-sky uppercase tracking-[0.5em] mb-12 italic border-b border-white/5 pb-6">INTELIGENCIA ACTIVA</h3>

                            {results ? (
                                <div className="space-y-12 reveal">
                                    <div>
                                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-3">INVERSIÓN TOTAL DE CAPITAL</p>
                                        <p className="text-5xl font-black text-white italic tracking-tighter text-glow-blue">{formatCurrency(results.inversionTotal)}</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-8">
                                        <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                                <TrendingUp className="w-3 h-3 text-agro-sky" /> COSTO/ANIMAL
                                            </p>
                                            <p className="text-2xl font-black text-white italic tracking-tighter">{formatCurrency(results.costoTotalPorAnimal)}</p>
                                        </div>

                                        {results.costoTotalPorKilo > 0 && (
                                            <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                                                <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
                                                    <Scale className="w-3 h-3 text-agro-sky" /> COSTO/KG PRODUCIDO
                                                </p>
                                                <p className="text-2xl font-black text-white italic tracking-tighter">{formatCurrency(results.costoTotalPorKilo)} <span className="text-[10px] text-white/20 not-italic ml-1">USD</span></p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-8 border-t border-white/5">
                                        <p className="text-[9px] text-white/10 uppercase font-bold italic leading-relaxed">
                                            "DATOS CALCULADOS EN BASE A LAS MÉTRICAS DE CARGA Y PESO REGISTRADAS EN LA TERMINAL CENTRAL."
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-white/10 text-center">
                                    <CalcIcon className="w-16 h-16 mb-6 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] italic leading-relaxed">Sincronice datos para<br />generar el reporte</p>
                                </div>
                            )}
                        </div>

                        {/* HISTORIAL RÁPIDO */}
                        <div className="bg-white/5 border border-white/5 rounded-[3rem] p-10 backdrop-blur-3xl">
                            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-8 flex items-center gap-3 italic">
                                <History className="w-4 h-4" /> REGISTROS RECIENTES
                            </h3>
                            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                                {historial.length === 0 ? (
                                    <p className="text-[9px] text-white/10 uppercase italic">Sin registros en la red</p>
                                ) : (
                                    historial.slice(0, 5).map(h => (
                                        <div key={h._id} className="bg-white/5 p-5 rounded-2xl border border-white/5 group hover:border-agro-ocean/30 transition-all">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[10px] font-black text-white/60 uppercase tracking-tighter truncate w-2/3">{h.lote?.titulo || "Lote Desconocido"}</span>
                                                <CheckCircle2 className="w-3 h-3 text-agro-sky opacity-20 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <span className="text-[12px] font-black text-white italic">{formatCurrency(h.inversionTotal)}</span>
                                                <span className="text-[8px] text-white/20 uppercase font-black">{new Date(h.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                <div className="mt-32 text-center">
                    <p className="text-[9px] font-black text-white/5 uppercase tracking-[1em] italic">
                        360 AGRO PROFIT — ENGINE DE PRECISIÓN ECONÓMICA AGROPECUARIA
                    </p>
                </div>
            </div>
        </div>
    );
}
