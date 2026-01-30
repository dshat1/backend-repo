const adoptions = [];
let idCounter = 1;

class AdoptionDAO {
  static async find() {
    return adoptions;
  }

  static async findById(id) {
    return adoptions.find(a => a.id === Number(id)) || null;
  }

  static async create(data) {
    const item = { id: idCounter++, ...data };
    adoptions.push(item);
    return item;
  }

  static async updateById(id, data) {
    const idx = adoptions.findIndex(a => a.id === Number(id));
    if (idx === -1) return null;
    adoptions[idx] = { ...adoptions[idx], ...data };
    return adoptions[idx];
  }

  static async deleteById(id) {
    const idx = adoptions.findIndex(a => a.id === Number(id));
    if (idx === -1) return null;
    const [removed] = adoptions.splice(idx, 1);
    return removed;
  }
}

export default AdoptionDAO;
