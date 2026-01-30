import { Router } from 'express';
import AdoptionDAO from '../daos/models/adoption.js';

const router = Router();

// GET /api/adoptions - list all
router.get('/', async (req, res, next) => {
  try {
    const items = await AdoptionDAO.find();
    res.json({ status: 'success', data: items });
  } catch (err) {
    next(err);
  }
});

// GET /api/adoptions/:id - get one
router.get('/:id', async (req, res, next) => {
  try {
    const item = await AdoptionDAO.findById(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: item });
  } catch (err) {
    next(err);
  }
});

// POST /api/adoptions - create
router.post('/', async (req, res, next) => {
  try {
    const { petName, adopterName, date } = req.body;
    if (!petName || !adopterName) return res.status(400).json({ status: 'error', message: 'Missing fields' });
    const created = await AdoptionDAO.create({ petName, adopterName, date: date || new Date().toISOString() });
    res.status(201).json({ status: 'success', data: created });
  } catch (err) {
    next(err);
  }
});

// PUT /api/adoptions/:id - update
router.put('/:id', async (req, res, next) => {
  try {
    const updated = await AdoptionDAO.updateById(req.params.id, req.body);
    if (!updated) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/adoptions/:id - delete
router.delete('/:id', async (req, res, next) => {
  try {
    const removed = await AdoptionDAO.deleteById(req.params.id);
    if (!removed) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json({ status: 'success', data: removed });
  } catch (err) {
    next(err);
  }
});

export default router;
