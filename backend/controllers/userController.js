import User from "../models/userModel.js";
import generarToken from "../utils/generarToken.js";
import bcrypt from "bcryptjs";
import { enviarEmailVerificacion } from "../utils/emailService.js";

// 🟢 REGISTRAR USUARIO
export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, plan } = req.body;
    const emailLower = email.toLowerCase();

    const existeUsuario = await User.findOne({ email: emailLower });
    if (existeUsuario) {
      return res.status(400).json({ mensaje: "El usuario ya existe" });
    }

    const usuario = await User.create({ nombre, email: emailLower, password, plan: plan || "observador" });

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    usuario.codigoVerificacion = codigo;
    usuario.codigoExpira = new Date(Date.now() + 15 * 60 * 1000);
    await usuario.save();
    await enviarEmailVerificacion(usuario.email, usuario.nombre, codigo);

    res.status(201).json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      plan: usuario.plan,
      tipoUsuario: usuario.tipoUsuario,
      foto: usuario.foto || null,
      telefono: usuario.telefono || null,
      token: generarToken(usuario._id, usuario.tokenVersion),
    });

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ mensaje: "Error al registrar usuario", error: error.message });
  }
};

// 🟢 LOGIN
export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailLower = email.toLowerCase();

    const usuario = await User.findOne({ email: emailLower });

    if (!usuario) {
      return res.status(400).json({ mensaje: "Usuario no encontrado" });
    }

    const passwordCorrecto = await bcrypt.compare(password, usuario.password);

    if (!passwordCorrecto) {
      return res.status(400).json({ mensaje: "Contraseña incorrecta" });
    }

    if (usuario.twoFactorEnabled) {
      const codigo = Math.floor(100000 + Math.random() * 900000).toString();
      usuario.codigoVerificacion = codigo;
      usuario.codigoExpira = new Date(Date.now() + 15 * 60 * 1000);
      await usuario.save();
      await enviarEmailVerificacion(usuario.email, usuario.nombre, codigo);
      return res.json({ requires2FA: true });
    }

    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      plan: usuario.plan,
      tipoUsuario: usuario.tipoUsuario,
      foto: usuario.foto || null,
      telefono: usuario.telefono || null,
      emailVerificado: usuario.emailVerificado || false,
      token: generarToken(usuario._id, usuario.tokenVersion),
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al iniciar sesión" });
  }
};

// 🟢 VERIFICAR CÓDIGO 2FA
export const verify2FA = async (req, res) => {
  try {
    const { email, codigo } = req.body;
    const usuario = await User.findOne({ email: email.toLowerCase() });
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });
    if (usuario.codigoVerificacion !== codigo) return res.status(400).json({ mensaje: "Código incorrecto" });
    if (new Date() > usuario.codigoExpira) return res.status(400).json({ mensaje: "Código expirado" });

    usuario.codigoVerificacion = null;
    usuario.codigoExpira = null;
    await usuario.save();

    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      plan: usuario.plan,
      tipoUsuario: usuario.tipoUsuario,
      foto: usuario.foto || null,
      telefono: usuario.telefono || null,
      emailVerificado: usuario.emailVerificado || false,
      token: generarToken(usuario._id, usuario.tokenVersion),
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al verificar código 2FA" });
  }
};

// 🟢 ACTIVAR / DESACTIVAR 2FA
export const toggle2FA = async (req, res) => {
  try {
    const usuario = await User.findById(req.user._id);
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });
    usuario.twoFactorEnabled = !usuario.twoFactorEnabled;
    usuario.tokenVersion += 1;
    await usuario.save();
    res.json({
      twoFactorEnabled: usuario.twoFactorEnabled,
      mensaje: usuario.twoFactorEnabled ? "2FA activado" : "2FA desactivado",
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al cambiar configuración 2FA" });
  }
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
    const { nombre, email, telefono } = req.body;

    const usuario = await User.findById(req.user._id);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    usuario.nombre = nombre || usuario.nombre;
    usuario.email = email || usuario.email;
    usuario.telefono = telefono || usuario.telefono;

    await usuario.save();

    res.json({
      mensaje: "Perfil actualizado correctamente",
      usuario: {
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        plan: usuario.plan,
        tipoUsuario: usuario.tipoUsuario,
      },
    });

  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar el perfil" });
  }
};

// 🟢 VERIFICAR EMAIL
export const verificarEmail = async (req, res) => {
  try {
    const { codigo } = req.body;
    const usuario = await User.findById(req.user._id);
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });
    if (usuario.emailVerificado) return res.status(400).json({ mensaje: "Email ya verificado" });
    if (usuario.codigoVerificacion !== codigo) return res.status(400).json({ mensaje: "Código incorrecto" });
    if (new Date() > usuario.codigoExpira) return res.status(400).json({ mensaje: "Código expirado" });

    usuario.emailVerificado = true;
    usuario.codigoVerificacion = null;
    usuario.codigoExpira = null;
    await usuario.save();
    res.json({ mensaje: "Email verificado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al verificar email" });
  }
};

// 🟢 ACTUALIZAR PLAN
export const cambiarPassword = async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;
    const usuario = await User.findById(req.user._id);

    const correcto = await bcrypt.compare(passwordActual, usuario.password);
    if (!correcto) return res.status(400).json({ mensaje: "Contraseña actual incorrecta" });

    if (passwordNueva.length < 6) return res.status(400).json({
      mensaje: "La contraseña debe tener al menos 6 caracteres"
    });

    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(passwordNueva, salt);
    usuario.tokenVersion += 1;
    await usuario.save();

    res.json({ mensaje: "Contraseña actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al cambiar contraseña" });
  }
};

export const solicitarResetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const usuario = await User.findOne({ email: email.toLowerCase() });
    if (!usuario) return res.status(404).json({ mensaje: "No existe cuenta con ese email" });

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    usuario.codigoVerificacion = codigo;
    usuario.codigoExpira = new Date(Date.now() + 15 * 60 * 1000);
    await usuario.save();

    await enviarEmailVerificacion(usuario.email, usuario.nombre, codigo);
    res.json({ mensaje: "Código enviado al email" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al enviar código" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, codigo, passwordNueva } = req.body;
    const usuario = await User.findOne({ email: email.toLowerCase() });
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });
    if (usuario.codigoVerificacion !== codigo) return res.status(400).json({ mensaje: "Código incorrecto" });
    if (new Date() > usuario.codigoExpira) return res.status(400).json({ mensaje: "Código expirado" });
    if (passwordNueva.length < 6) return res.status(400).json({ mensaje: "La contraseña debe tener al menos 6 caracteres" });

    await User.findByIdAndUpdate(
      usuario._id,
      {
        password: await bcrypt.hash(passwordNueva, await bcrypt.genSalt(10)),
        codigoVerificacion: null,
        codigoExpira: null
      }
    );

    res.json({ mensaje: "Contraseña actualizada correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al resetear contraseña" });
  }
};

export const actualizarPlan = async (req, res) => {
  try {
    const { plan } = req.body;

    const planesValidos = ["observador", "productor", "pro", "empresa"];
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
