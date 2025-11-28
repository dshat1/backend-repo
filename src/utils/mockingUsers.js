import { faker } from "@faker-js/faker";
import mongoose from "mongoose";
import { hashPassword } from "./passwordHash.js";

export const generateMockUsers = (quantity = 1) => {
  const users = [];
  for (let i = 0; i < quantity; i++) {
    users.push({
      _id: new mongoose.Types.ObjectId(),
      first_name: faker.person.firstName(),
      last_name: faker.person.lastName(),
      email: faker.internet.email(),
      password: hashPassword("coder123"),
      role: faker.helpers.arrayElement(["user", "admin"]),
      pets: []
    });
  }
  return users;
};