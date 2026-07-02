// Servicio de usuarios.
// Contiene toda la lógica de negocio y el acceso a Supabase para la tabla `usuarios`.
// El PIN nunca se guarda en texto plano: siempre se almacena como hash bcrypt.
const bcrypt = require('bcryptjs');
const supabase = require('../../config/supabase.client');
const ErrorApp = require('../../lib/errorApp');

const RONDAS_BCRYPT = 10;

// Crea un nuevo usuario, hasheando el PIN antes de guardarlo
async function crearUsuario({ nombre, usuario, pin, rol }) {
  const pinHash = await bcrypt.hash(pin, RONDAS_BCRYPT);

  const { data, error } = await supabase
    .from('usuarios')
    .insert({
      nombre,
      usuario,
      pin_hash: pinHash,
      rol,
    })
    .select('id_usuario, nombre, usuario, rol, activo, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new ErrorApp('Ya existe un usuario con ese nombre de usuario', 409);
    }
    throw new ErrorApp('No se pudo crear el usuario', 500);
  }

  return data;
}

// Busca un usuario por su nombre de usuario (incluye pin_hash, uso interno para login)
async function obtenerUsuarioPorUsuario(usuario) {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id_usuario, nombre, usuario, pin_hash, rol, activo')
    .eq('usuario', usuario)
    .eq('activo', true)
    .maybeSingle();

  if (error) {
    // LOG DE DEBUG — muestra el error real de Supabase en la terminal del servidor
    console.error('>>> SUPABASE ERROR:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    throw new ErrorApp(`Error de base de datos: ${error.message}`, 500);
  }

  return data;
}

// Lista todos los usuarios activos (sin exponer pin_hash)
async function listarUsuarios() {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id_usuario, nombre, usuario, rol, activo, created_at')
    .order('nombre', { ascending: true });

  if (error) {
    console.error('>>> SUPABASE ERROR listarUsuarios:', error.message);
    throw new ErrorApp('No se pudo obtener la lista de usuarios', 500);
  }

  return data;
}

// Verifica que el PIN proporcionado corresponda al usuario, sin revelar
// si el problema fue "usuario no existe" o "PIN incorrecto" (mismo mensaje genérico)
async function verificarCredenciales(usuario, pin) {
  const usuarioEncontrado = await obtenerUsuarioPorUsuario(usuario);

  if (!usuarioEncontrado) {
    throw new ErrorApp('Usuario o PIN incorrectos', 401);
  }

  const pinValido = await bcrypt.compare(pin, usuarioEncontrado.pin_hash);

  if (!pinValido) {
    throw new ErrorApp('Usuario o PIN incorrectos', 401);
  }

  return usuarioEncontrado;
}

// Verifica credenciales y exige que el rol sea supervisor o admin.
// Usado para las operaciones que requieren re-autorización (descuentos, devoluciones, corte de caja).
async function verificarAutorizacionSupervisor(usuario, pin) {
  const usuarioEncontrado = await verificarCredenciales(usuario, pin);

  if (!['supervisor', 'admin'].includes(usuarioEncontrado.rol)) {
    throw new ErrorApp('El usuario no tiene permisos de supervisor', 403);
  }

  return usuarioEncontrado;
}

module.exports = {
  crearUsuario,
  obtenerUsuarioPorUsuario,
  listarUsuarios,
  verificarCredenciales,
  verificarAutorizacionSupervisor,
};
