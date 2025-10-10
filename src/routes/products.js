import authorize from '../middlewares/authorization.js';
import { Router } from 'express';
import Product from '../daos/models/product.js';
import { parseQueryFilter, buildPageLink } from '../utils/http.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const sort  = req.query.sort === 'asc'
      ? { price: 1 }
      : req.query.sort === 'desc'
        ? { price: -1 }
        : {};
    const filter = parseQueryFilter(req.query.query);

    const options = { page, limit, sort, lean: true };
    const result  = await Product.paginate(filter, options);

    res.json({
      status:      'success',
      payload:     result.docs,
      totalPages:  result.totalPages,
      prevPage:    result.hasPrevPage ? result.page - 1 : null,
      nextPage:    result.hasNextPage ? result.page + 1 : null,
      page:        result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink:    result.hasPrevPage ? buildPageLink(req, result.page - 1) : null,
      nextLink:    result.hasNextPage ? buildPageLink(req, result.page + 1) : null
    });
  } catch (err) {
    console.error('[GET /api/products]', err);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

export default router;
