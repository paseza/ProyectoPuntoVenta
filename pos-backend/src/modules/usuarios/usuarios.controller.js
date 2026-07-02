// Controller de usuarios y autenticación.
// Traduce HTTP <-> dominio. No accede a Supabase directamente (eso vive en el service).
const jwt = require('jsonwebtoken');
const usuariosService = require('./usuarios.service');
const env = require('../../config/env');

// POST /api/usuarios
async function crear(req, res) {
  const usuario = await usuariosService.crearUsuario(req.body);
  res.status(201).json({ success: true, data: usuario });
}

// GET /api/usuarios
async function listar(req, res) {
  const usuarios = await usuariosService.listarUsuarios();
  res.status(200).json({ success: true, data: usuarios });
}

// POST /api/auth/login
async function login(req, res) {
  const { usuario, pin } = req.body;
  const usuarioValido = await usuariosService.verificarCredenciales(usuario, pin);

  const token = jwt.sign(
    {
      idUsuario: usuarioValido.id_usuario,
      usuario: usuarioValido.usuario,
      rol: usuarioValido.rol,
      ultimaActividad: Date.now(),
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiracionHoras }
  );

  res.status(200).json({
    success: true,
    data: {
      token,
      usuario: {
        idUsuario: usuarioValido.id_usuario,
        nombre: usuarioValido.nombre,
        usuario: usuarioValido.usuario,
        rol: usuarioValido.rol,
      },
    },
  });
}

// POST /api/auth/autorizar-supervisor
async function autorizarSupervisor(req, res) {
  const { usuario, pin } = req.body;
  const supervisor = await usuariosService.verificarAutorizacionSupervisor(usuario, pin);

  res.status(200).json({
    success: true,
    data: {
      idUsuario: supervisor.id_usuario,
      nombre: supervisor.nombre,
      rol: supervisor.rol,
    },
  });
}

module.exports = {
  crear,
  listar,
  login,
  autorizarSupervisor,
};
