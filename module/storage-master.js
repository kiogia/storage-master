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
    if (save?.auto == 0) {
      return null;
    } else {
      if (typeof save?.auto == 'number') {
        setInterval(() => {
          this.save();
        }, save.auto * 1000);
      } else {
        setInterval(() => {
          this.save();
        }, 60 * 1000);
      }
    }
  }

  #saveOnExit() {
    const { save } = this.options;
    if (save?.onExit == false) {
      return null;
    }
    if (save?.onExit == true || save?.onExit == undefined) {
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

  #sort(array, field = 'id', order = 'ascending') {
    return array.sort((a, b) => {
      return order == 'ascending' ? a[field] - b[field] : b[field] - a[field];
    });
  }

  #generateID() {
    const random = Math.floor(Math.random() * (2147483648 - 0 + 1)) + 0;
    if (this.get(random)) {
      return this.#generateID();
    } else {
      return random;
    }
  }

  #createRow(values) {
    const fields = Object.keys(this.structure);
    return fields.reduce((previous, current) => {
      if (this.#isCorrectType(current, values[current])) {
        previous[current] = values[current];
      } else {
        previous[current] = this.structure[current].default ?? null;
      }
      return previous;
    }, {});
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

  add(id, values = {}) {
    if (!this.get(id)) {
      this.storage.push({
        id: id ?? this.#generateID(),
        ...this.#createRow(values),
      });
    }
    return this;
  }

  set(id, values = {}) {
    if (this.get(id)) {
      const index = this.storage.findIndex((row) => row.id == id);
      Object.entries(values).forEach(([field, value]) => {
        if (this.#isCorrectType(field, value)) {
          this.storage[index][field] = value;
        }
      });
    } else {
      this.storage.push({
        id: id ?? this.#generateID(),
        ...this.#createRow(values),
      });
    }
    return this;
  }

  get(id) {
    return this.storage.find((row) => row?.id == id);
  }

  getOne(value, field, array = this.storage) {
    return array.find((row) => row[field] == value);
  }

  getFew(value, field, sort = {}, array = this.storage) {
    const result = array.filter((row) => row[field] == value);
    if (sort) {
      return this.#sort(result, sort.field, sort.order);
    } else {
      return result;
    }
  }

  find(value, field, array = this.storage) {
    const result = array.filter((row) => row[field] == value);
    return {
      result: result,
      find: (findValue, findField) => this.find(findValue, findField, result),
      getOne: (findValue, findField) =>
        this.getOne(findValue, findField, result),
      getFew: (findValue, findField, sort) =>
        this.getFew(findValue, findField, sort, result),
    };
  }

  getAll(sort = {}) {
    return this.#sort(this.storage, sort.field, sort.order);
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

class ObjectStorage {
  constructor(directory, options = {}) {
    this.directory = directory;
    this.options = options;
    this.structure = options?.structure;

    this.#createFile();
    this.#saveAuto();
    this.#saveOnExit();
    this.storage = JSON.parse(fs.readFileSync(directory));
    this.#structure();
  }

  #createFile() {
    if (!fs.existsSync(this.directory)) {
      fs.writeFileSync(this.directory, JSON.stringify({}));
    }
  }

  #saveAuto() {
    const { save } = this.options;
    if (save?.auto == 0) {
      return null;
    } else {
      if (typeof save?.auto == 'number') {
        setInterval(() => {
          this.save();
        }, save.auto * 1000);
      } else {
        setInterval(() => {
          this.save();
        }, 60 * 1000);
      }
    }
  }

  #saveOnExit() {
    const { save } = this.options;
    if (save?.onExit == false) {
      return null;
    }
    if (save?.onExit == true || save?.onExit == undefined) {
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
    if (this.structure) {
      this.storage = Object.keys(this.structure).reduce((previous, current) => {
        const rename = this.structure[current].rename;
        if (rename) {
          previous[rename] = this.storage?.[current];
        } else {
          previous[current] = this.storage?.[current];
        }
        return previous;
      }, {});
    }
  }

  #isField(key) {
    return key in this.structure;
  }

  #isCorrectType(key, data) {
    if (this.options?.checkType == false) {
      return this.#isField(key);
    } else {
      const { type } = this.structure[key];
      return this.#isField(key) && typeof data == type;
    }
  }

  save() {
    const data = JSON.stringify(this.storage, null, this.options?.spaces ?? 0);
    fs.writeFileSync(this.directory, data);
    return this;
  }

  set(key, value) {
    if (this.structure) {
      if (this.#isCorrectType(key, value)) {
        this.storage[key] = value;
      }
    } else {
      this.storage[key] = value;
    }
    return this;
  }

  get(key) {
    return this.storage[key];
  }
}

module.exports = { default: Storage, Storage, ObjectStorage };
