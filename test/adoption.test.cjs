const { expect } = require('chai');
const request = require('supertest');

let app;

before(async () => {
  const mod = await import('../app.js');
  app = mod.default;
});

describe('Adoption API - functional tests', () => {
  let createdId;

  it('POST /api/adoptions -> 201 and returns created item', async () => {
    const res = await request(app)
      .post('/api/adoptions')
      .send({ petName: 'Fido', adopterName: 'Alice' })
      .expect(201);

    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.have.property('id');
    expect(res.body.data.petName).to.equal('Fido');
    createdId = res.body.data.id;
  });

  it('GET /api/adoptions -> 200 and returns array including created', async () => {
    const res = await request(app).get('/api/adoptions').expect(200);
    expect(res.body).to.have.property('status', 'success');
    expect(res.body.data).to.be.an('array');
    const found = res.body.data.find(i => i.id === createdId);
    expect(found).to.exist;
  });

  it('GET /api/adoptions/:id -> 200 and returns the item', async () => {
    const res = await request(app).get(`/api/adoptions/${createdId}`).expect(200);
    expect(res.body.data).to.have.property('id', createdId);
  });

  it('PUT /api/adoptions/:id -> 200 and updates item', async () => {
    const res = await request(app)
      .put(`/api/adoptions/${createdId}`)
      .send({ adopterName: 'Bob' })
      .expect(200);
    expect(res.body.data.adopterName).to.equal('Bob');
  });

  it('DELETE /api/adoptions/:id -> 200 and removes item', async () => {
    await request(app).delete(`/api/adoptions/${createdId}`).expect(200);
    await request(app).get(`/api/adoptions/${createdId}`).expect(404);
  });

  it('POST /api/adoptions -> 400 when missing fields', async () => {
    await request(app).post('/api/adoptions').send({ petName: 'NoAdopter' }).expect(400);
  });
});
