import api from "./axiosConfig";

const PlanAPI = {
  actualizarPlan: (plan) =>
    api.put("/users/plan", { plan }),
};

export default PlanAPI;
