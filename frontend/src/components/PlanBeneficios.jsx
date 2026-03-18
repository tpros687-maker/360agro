export default function PlanBeneficios({ plan }) {
    if (!plan) return null;
  
    const beneficios = {
      Gratis: [
        "No puedes publicar lotes",
        "Sin acceso a videos o destacados",
        "Ideal para explorar la plataforma",
      ],
      Básico: [
        "Publica hasta 5 lotes",
        "Fotos incluidas",
        "Sin opción de destacar",
      ],
      Pro: [
        "Publicaciones ilimitadas",
        "Opción de destacar lotes",
        "Mayor visibilidad en búsquedas",
      ],
      Empresas: [
        "Publicaciones ilimitadas",
        "Lotes destacados ilimitados",
        "Soporte prioritario y visibilidad premium",
      ],
    };
  
    return (
      <div className="mt-8 p-6 bg-green-50 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">
          Beneficios de tu plan {plan}
        </h2>
        <ul className="list-disc list-inside text-gray-700">
          {beneficios[plan]?.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>
    );
  }
  