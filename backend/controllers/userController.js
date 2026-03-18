import User from "../models/userModel.js";
import generarToken from "../utils/generarToken.js";
import bcrypt from "bcryptjs";

// 🟢 REGISTRAR USUARIO
export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const existeUsuario = await User.findOne({ email });
    if (existeUsuario) {
      return res.status(400).json({ mensaje: "El usuario ya existe" });
    }

    const usuario = await User.create({ nombre, email, password });

    res.status(201).json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      plan: usuario.plan,
      token: generarToken(usuario._id),
    });

  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar usuario" });
  }
};

// 🟢 LOGIN
export const loginUsuario = async (req, res) => {
  const { email, password } = req.body;

  const usuario = await User.findOne({ email });

  if (!usuario) {
    return res.status(400).json({ mensaje: "Usuario no encontrado" });
  }

  const passwordCorrecto = await bcrypt.compare(password, usuario.password);

  if (!passwordCorrecto) {
    return res.status(400).json({ mensaje: "Contraseña incorrecta" });
  }

  res.json({
    _id: usuario._id,
    nombre: usuario.nombre,
    email: usuario.email,
    plan: usuario.plan,
    token: generarToken(usuario._id),
  });
};

// 🟢 OBTENER PERFIL
export const obtenerPerfil = async (req, res) => {
  try {
    const usuario = await User.findById(req.user._id).select("-password");

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json(usuario);

  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener perfil" });
  }
};

// 🟢 ACTUALIZAR PERFIL (nombre / email)
export const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, email } = req.body;

    const usuario = await User.findById(req.user._id);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    usuario.nombre = nombre || usuario.nombre;
    usuario.email = email || usuario.email;

    await usuario.save();

    res.json({
      mensaje: "Perfil actualizado correctamente",
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        plan: usuario.plan,
      },
    });

  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar el perfil" });
  }
};

// 🟢 ACTUALIZAR PLAN
export const actualizarPlan = async (req, res) => {
  try {
    const { plan } = req.body;

    const planesValidos = ["gratis", "basico", "pro", "empresa"];
    if (!planesValidos.includes(plan)) {
      return res.status(400).json({ mensaje: "Plan inválido" });
    }

    const usuario = await User.findByIdAndUpdate(
      req.user._id,
      { plan },
      { new: true }
    ).select("-password");

    res.status(200).json({
      mensaje: "Plan actualizado correctamente",
      usuario,
    });

  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar el plan",
      error: error.message,
    });
  }
};
