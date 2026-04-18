export const PLANES = {
  observador: {
    nombre: "Observador",
    precio: { mensual: 0, trimestral: 0, anual: 0 },
    limites: {
      lotes: 0,
      servicios: 0,
      tienda: false,
      ia: false,
      metricas: false,
      destacado: false,
    }
  },
  productor: {
    nombre: "Productor",
    precio: { mensual: 4, trimestral: 10, anual: 36 },
    limites: {
      lotes: 3,
      servicios: 3,
      tienda: false,
      ia: true,
      metricas: "basico",
      destacado: false,
    }
  },
  pro: {
    nombre: "Pro",
    precio: { mensual: 9, trimestral: 23, anual: 81 },
    limites: {
      lotes: Infinity,
      servicios: Infinity,
      tienda: false,
      ia: true,
      metricas: "completo",
      destacado: true,
    }
  },
  empresa: {
    nombre: "Empresa",
    precio: { mensual: 19, trimestral: 49, anual: 169 },
    limites: {
      lotes: Infinity,
      servicios: Infinity,
      tienda: true,
      ia: true,
      metricas: "avanzado",
      destacado: true,
    }
  }
};

export const getPlan = (planKey) => {
  return PLANES[planKey?.toLowerCase()] || PLANES.observador;
};

export const puedePublicarLote = (planKey, lotesActuales) => {
  const plan = getPlan(planKey);
  return plan.limites.lotes === Infinity || lotesActuales < plan.limites.lotes;
};

export const puedePublicarServicio = (planKey, serviciosActuales) => {
  const plan = getPlan(planKey);
  return plan.limites.servicios === Infinity || serviciosActuales < plan.limites.servicios;
};

export const puedeTenerTienda = (planKey) => {
  return getPlan(planKey).limites.tienda;
};
