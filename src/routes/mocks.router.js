import { Router } from "express";
import { faker } from "@faker-js/faker";
import { generateMockUsers } from "../utils/mockingUsers.js";
import { UsersModel } from "../dao/models/users.model.js";
import { PetsModel } from "../dao/models/pets.model.js";

const router = Router();

// GET /api/mocks/mockingpets -> devuelve 50 pets mock (no inserta)
router.get("/mockingpets", async (req, res) => {
  try {
    const pets = [];
    for (let i = 0; i < 50; i++) {
      pets.push({
        _id: undefined,
        name: faker.person.firstName(),
        specie: faker.animal.type(),
        age: faker.number.int({ min: 1, max: 15 }),
      });
    }
    return res.send({ status: "success", payload: pets });
  } catch (error) {
    return res.status(500).send({ status: "error", message: error.message });
  }
});

// GET /api/mocks/mockingusers -> devuelve 50 usuarios mock (no inserta)
router.get("/mockingusers", (req, res) => {
  try {
    const users = generateMockUsers(50);
    return res.send({ status: "success", payload: users });
  } catch (error) {
    return res.status(500).send({ status: "error", message: error.message });
  }
});

// POST /api/mocks/generateData -> recibe { users: n, pets: m } e inserta en DB
router.post("/generateData", async (req, res) => {
  try {
    const { users = 0, pets = 0 } = req.body || {};

    const nUsers = parseInt(users) || 0;
    const nPets = parseInt(pets) || 0;

    if (nUsers <= 0 && nPets <= 0) {
      return res.status(400).send({ status: "error", message: "Debes indicar 'users' y/o 'pets' como números mayores a 0 en el body." });
    }

    const result = { insertedUsers: 0, insertedPets: 0 };

    if (nUsers > 0) {
      const generatedUsers = generateMockUsers(nUsers);
      const insertUsers = await UsersModel.insertMany(generatedUsers);
      result.insertedUsers = Array.isArray(insertUsers) ? insertUsers.length : 0;
    }

    if (nPets > 0) {
      const mockPets = [];
      for (let i = 0; i < nPets; i++) {
        mockPets.push({
          name: faker.person.firstName(),
          specie: faker.animal.type(),
          age: faker.number.int({ min: 1, max: 15 }),
          owner: null
        });
      }
      const insertPets = await PetsModel.insertMany(mockPets);
      result.insertedPets = Array.isArray(insertPets) ? insertPets.length : 0;
    }

    return res.send({ status: "success", message: "Datos generados e insertados correctamente", result });
  } catch (error) {
    return res.status(500).send({ status: "error", message: error.message });
  }
});

export default router;
