const Area = require('../models/Area');
const User = require('../models/User.model');
const InHouse = require('../models/InHouse');

// @desc    Crear nueva área
// @route   POST /api/areas
// @access  Private/Admin
exports.crearArea = async (req, res) => {
  try {
    const { nombre, descripcion, codigo, administrador } = req.body;

    // Verificar que el administrador existe y tiene rol admin_area
    const admin = await User.findById(administrador);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Usuario administrador no encontrado'
      });
    }

    // Verificar código único
    const areaExistente = await Area.findOne({ codigo });
    if (areaExistente) {
      return res.status(400).json({
        success: false,
        message: 'El código de área ya existe'
      });
    }

    const area = await Area.create({
      nombre,
      descripcion,
      codigo: codigo.toUpperCase(),
      administrador
    });

    // Actualizar rol del usuario a admin_area si no lo es
    if (admin.rol !== 'admin_area' && admin.rol !== 'admin') {
      admin.rol = 'admin_area';
      await admin.save();
    }

    res.status(201).json({
      success: true,
      message: 'Área creada exitosamente',
      area
    });
  } catch (error) {
    console.error('Error al crear área:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear área',
      error: error.message
    });
  }
};

// @desc    Obtener todas las áreas
// @route   GET /api/areas
// @access  Private/Admin/CEO
exports.obtenerAreas = async (req, res) => {
  try {
    const { activo } = req.query;
    const filtro = {};

    if (activo !== undefined) {
      filtro.activo = activo === 'true';
    }

    const areas = await Area.find(filtro)
      .populate('administrador', 'nombre apellidos correo')
      .sort({ nombre: 1 });

    res.json({
      success: true,
      total: areas.length,
      areas
    });
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener áreas',
      error: error.message
    });
  }
};

// @desc    Obtener área por ID
// @route   GET /api/areas/:id
// @access  Private
exports.obtenerAreaPorId = async (req, res) => {
  try {
    const area = await Area.findById(req.params.id)
      .populate('administrador', 'nombre apellidos correo celular');

    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'Área no encontrada'
      });
    }

    res.json({
      success: true,
      area
    });
  } catch (error) {
    console.error('Error al obtener área:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener área',
      error: error.message
    });
  }
};

// @desc    Actualizar área
// @route   PUT /api/areas/:id
// @access  Private/Admin
exports.actualizarArea = async (req, res) => {
  try {
    const { nombre, descripcion, codigo, administrador, activo } = req.body;

    const area = await Area.findById(req.params.id);
    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'Área no encontrada'
      });
    }

    // Actualizar campos
    if (nombre) area.nombre = nombre;
    if (descripcion) area.descripcion = descripcion;
    if (codigo) area.codigo = codigo.toUpperCase();
    if (administrador) area.administrador = administrador;
    if (activo !== undefined) area.activo = activo;

    await area.save();

    res.json({
      success: true,
      message: 'Área actualizada exitosamente',
      area
    });
  } catch (error) {
    console.error('Error al actualizar área:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar área',
      error: error.message
    });
  }
};

// @desc    Eliminar área
// @route   DELETE /api/areas/:id
// @access  Private/Admin
exports.eliminarArea = async (req, res) => {
  try {
    const area = await Area.findById(req.params.id);
    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'Área no encontrada'
      });
    }

    // Verificar si tiene In Houses asociados
    const inHouses = await InHouse.countDocuments({ area: area._id });
    if (inHouses > 0) {
      return res.status(400).json({
        success: false,
        message: `No se puede eliminar el área porque tiene ${inHouses} In House(s) asociado(s)`
      });
    }

    await area.deleteOne();

    res.json({
      success: true,
      message: 'Área eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar área:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar área',
      error: error.message
    });
  }
};

// @desc    Obtener estadísticas del área
// @route   GET /api/areas/:id/estadisticas
// @access  Private
exports.obtenerEstadisticasArea = async (req, res) => {
  try {
    const area = await Area.findById(req.params.id);
    if (!area) {
      return res.status(404).json({
        success: false,
        message: 'Área no encontrada'
      });
    }

    const estadisticas = await area.obtenerEstadisticas();

    res.json({
      success: true,
      estadisticas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// @desc    Obtener In Houses del área
// @route   GET /api/areas/:id/inhouses
// @access  Private
exports.obtenerInHousesArea = async (req, res) => {
  try {
    const inHouses = await InHouse.find({ area: req.params.id, activo: true })
      .populate('usuariosAsignados', 'nombre apellidos correo')
      .sort({ nombre: 1 });

    res.json({
      success: true,
      total: inHouses.length,
      inHouses
    });
  } catch (error) {
    console.error('Error al obtener In Houses:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener In Houses',
      error: error.message
    });
  }
};
