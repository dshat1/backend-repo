import { Router } from 'express';
import User from '../daos/models/user.js';
import { hashPassword } from '../utils/auth.js';
import passport from '../passport/jwt.js';

const router = Router();

// Crear usuario
router.post('/', async (req, res, next) => {
  try {
    const { first_name, last_name, email, age, password, role } = req.body;
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Faltan datos' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ status: 'error', message: 'Email ya registrado' });
    }
    const user = await User.create({
      first_name,
      last_name,
      email,
      age,
      password: hashPassword(password),
      role
    });
    const u = user.toObject();
    delete u.password;
    res.status(201).json({ status: 'success', user: u });
  } catch (err) {
    next(err);
  }
});

// Listar todos (solo admin)
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }
    const users = await User.find().select('-password');
    res.json({ status: 'success', users });
  } catch (err) {
    next(err);
  }
});

// Ver un usuario (admin o dueño)
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'No encontrado' });
    }
    res.json({ status: 'success', user });
  } catch (err) {
    next(err);
  }
});

// Actualizar (admin o dueño)
router.put('/:id', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }
    const update = { ...req.body };
    if (update.password) update.password = hashPassword(update.password);
    const user = await User.findByIdAndUpdate(id, update, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'No encontrado' });
    }
    res.json({ status: 'success', user });
  } catch (err) {
    next(err);
  }
});

// Eliminar (solo admin)
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'No encontrado' });
    }
    res.json({ status: 'success', message: 'Usuario eliminado' });
  } catch (err) {
    next(err);
  }
});

export default router;
