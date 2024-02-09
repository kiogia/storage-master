const fs = require('fs');

class Storage {
  constructor(directory, structure, options = {}) {
    this.directory = directory;
    this.options = options;
    this.structure = structure;

    this.#createFile();
    this.#saveAuto();
    this.#saveOnExit();
    this.storage = JSON.parse(fs.readFileSync(directory));
    this.#structure();
  }

  #createFile() {
    if (!fs.existsSync(this.directory)) {
      fs.writeFileSync(this.directory, JSON.stringify([]));
    }
  }

  #saveAuto() {
    const { save } = this.options;
    if (save?.auto && typeof save?.auto == 'number') {
      setInterval(() => {
        this.save();
      }, save.auto * 1000);
    }
  }

  #saveOnExit() {
    const { save } = this.options;
    if (save?.onExit) {
      process.on('exit', () => {
        this.save();
      });
      process.on('SIGINT', () => {
        this.save();
        process.exit(0);
      });
    }
  }

  #structure() {
    this.storage.forEach((row, index) => {
      const structured = Object.keys(this.structure).reduce(
        (previous, current) => {
          const rename = this.structure[current].rename;
          if (rename) {
            previous[rename] = this.storage[index]?.[current];
          } else {
            previous[current] = this.storage[index]?.[current];
          }
          return previous;
        },
        {}
      );
      this.storage[index] = { id: row.id, ...structured };
    });
  }

  #isField(field) {
    return field in this.structure;
  }

  #isCorrectType(field, data) {
    if (this.options?.checkType == false) {
      return this.#isField(field);
    } else {
      const { type } = this.structure[field];
      return this.#isField(field) && typeof data == type;
    }
  }

  #sort(array, field, order) {
    return array.sort((a, b) => {
      return order == 'ascending' ? a[field] - b[field] : b[field] - a[field];
    });
  }

  save() {
    const data = JSON.stringify(this.storage, null, this.options?.spaces ?? 0);
    fs.writeFileSync(this.directory, data);
    return this;
  }

  clear() {
    this.storage = [];
    return this;
  }

  delete(id) {
    this.storage = this.storage.filter((row) => row.id != id);
    return this;
  }

  set(id, values = {}) {
    const isExists = this.get(id);
    const fields = Object.keys(this.structure);
    if (isExists) {
      const index = this.storage.findIndex((row) => row.id == id);
      Object.entries(values).forEach(([field, value]) => {
        if (this.#isCorrectType(field, value)) {
          this.storage[index][field] = value;
        }
      });
    } else {
      this.storage.push({
        id: Number(id),
        ...fields.reduce((previous, current) => {
          previous[current] =
            values[current] ?? this.structure[current].default ?? null;
          return previous;
        }, {}),
      });
    }
    return this;
  }

  get(id) {
    return this.storage.find((row) => row.id == id);
  }

  getAll(sort = {}) {
    return this.#sort(
      this.storage,
      sort.field ?? 'id',
      sort.order ?? 'ascending'
    );
  }

  forEach(callback) {
    return this.storage.forEach((row) => {
      return callback({
        id: row.id,
        values: row,
        set: (values) => this.set(row.id, values),
        delete: () => this.delete(row.id),
      });
    });
  }
}

module.exports = { default: Storage, Storage };
