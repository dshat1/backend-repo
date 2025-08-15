import mongoose from 'mongoose';

export const validateIds = (...params) => (req, res, next) => {
  for (const p of params) {
    if (!mongoose.isValidObjectId(req.params[p])) {
      return res
        .status(400)
        .json({ status: 'error', message: `${p} inválido` });
    }
  }
  next();
};
