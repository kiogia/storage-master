declare module 'storage-master';

type Types = {
  string: string;
  number: number;
  boolean: boolean;
};

export interface StorageOptions {
  checkType?: boolean;
  spaces?: number;
  save?: {
    auto?: number;
    onExit?: boolean;
  };
}

export type StructureOptions = {
  [field: string]: {
    type: 'string' | 'number' | 'boolean';
    default?: string | number | boolean;
    rename?: string;
  };
};

type Output<Structure> = {
  id: number | string;
} & {
  // @ts-ignore
  [Key in keyof Structure]: Types[Structure[Key]['type']];
};

export type Input<Structure> = {
  // @ts-ignore
  [Key in keyof Structure]?: Types[Structure[Key]['type']];
};

export class Storage<Structure extends StructureOptions> {
  /**
   * @example
   * ```js
   * import { resolve } from 'path'
   * import { Storage } from 'storage-master'
   *
   * const path = resolve('storages', 'users.json')
   * const structure = {
   *   name: {
   *     type: 'string',
   *   },
   *   age: {
   *     type: 'number',
   *   },
   *   is_verified: {
   *     type: 'boolean',
   *     default: false,
   *   },
   * }
   *
   * const storage = new Storage(path, structure)
   *
   * const userID = 12345
   * storage.set(userID, {
   *   name: 'Kio Gia',
   *   age: 21,
   * })
   *
   * const user = storage.get(userID)
   * console.log(user)
   * ```
   */
  constructor(
    directory: string,
    structure: Structure,
    options?: StorageOptions
  );

  /**
   * @example
   * ```js
   * storage.save()
   * ```
   */
  save(): this;

  /**
   * @example
   * ```js
   * storage.clear()
   * ```
   * You can add a save right away.
   * ```js
   * storage.clear().save()
   * ```
   */
  clear(): this;

  /**
   * @example
   * ```js
   * const userID = 12345
   * storage.delete(userID)
   * ```
   */
  delete(id: number | string): this;

  /**
   * @example
   * ```js
   * const userID = 12345
   * storage.add(userID, {
   *   name: 'Kio'
   * })
   * ```
   */
  add(id: number | string, values?: Input<Structure>): this;

  /**
   * @example
   * ```js
   * const userID = 12345
   * storage.set(userID, {
   *   name: 'Kio'
   * })
   * ```
   */
  set(id: number | string, values?: Input<Structure>): this;

  /**
   * @example
   * ```js
   * const userID = 12345
   * const user = storage.get(userID)
   * console.log(user)
   * ```
   */
  get(
    value: number | string,
    field?: 'id' | keyof Structure
  ): Output<Structure>;

  /**
   * @example
   * ```js
   * const user = storage.getOne(21, 'age')
   * console.log(user)
   * ```
   */
  getOne(
    value: number | string,
    field?: 'id' | keyof Structure,
    array?: Array<Output<Structure>>
  ): Output<Structure>;

  /**
   * @example
   * ```js
   * const premiumUsers = storage.getFew(true, 'is_premium')
   * console.log(premiumUsers)
   * ```
   */
  getFew(
    value: number | string,
    field?: 'id' | keyof Structure,
    sort?: {
      field?: 'id' | keyof Structure;
      order?: 'ascending' | 'descending';
    },
    array?: Array<Output<Structure>>
  ): Array<Output<Structure>>;

  /**
   * @example
   * ```js
   * const seniorDevs = storage
   *   .find(true, 'is_developers')
   *   .find(true, 'is_senior)
   *   .findFew(false, 'is_retired')
   * console.log(seniorDevs)
   * ```
   */
  find(
    value: number | string,
    field?: 'id' | keyof Structure,
    array?: Array<Output<Structure>>
  ): {
    result: Array<Output<Structure>>;
    find: (
      value: number | string,
      field?: 'id' | keyof Structure
    ) => Storage<Structure>['find'];
    getOne: (
      value: number | string,
      field?: 'id' | keyof Structure
    ) => Output<Structure>;
    getFew: (
      value: number | string,
      field?: 'id' | keyof Structure
    ) => Array<Output<Structure>>;
  };

  /**
   * @example
   * ```js
   * const users = storage.getAll()
   * console.log(users)
   * ```
   * Sort:
   * ```js
   * const users = storage.getAll({
   *   field: 'age'
   * })
   * console.log(users)
   * ```
   */
  getAll(sort?: {
    field?: 'id' | keyof Structure;
    order?: 'ascending' | 'descending';
  }): Array<Output<Structure>>;

  /**
   * @example
   * ```js
   * storage.forEach((row) => {
   *   if (row.values.is_premium) {
   *     row.set({
   *       name: '💎 ' + row.values.name
   *     })
   *     console.log('Added premium user badge!')
   *   } else {
   *     console.log('This is not a premium user!')
   *   }
   * })
   * ```
   */
  forEach(
    callback: (row: {
      id: number;
      values: Output<Structure>;
      set: (values: Input<Structure>) => {};
      delete: () => {};
    }) => void
  ): void;
}

export class ObjectStorage<Structure extends StructureOptions> {
  /**
   * @example
   * ```js
   * import { resolve } from 'path'
   * import { KeyStorage } from 'storage-master'
   *
   * const path = resolve('storages', 'apples.json')
   * const storage = new ObjectStorage(path)
   *
   * const userID = 12345
   * storage.set(userID, 2 + 2).save()
   * const applesCount = storage.get(userID)
   * console.log(applesCount)
   * ```
   */
  constructor(
    directory: string,
    options: StorageOptions & {
      structure?: Structure;
    }
  );

  /**
   * @example
   * ```js
   * storage.save()
   * ```
   */
  save(): this;

  /**
   * @example
   * ```js
   * const userID = 12345
   * storage.set(userID, 2 + 2)
   * ```
   */
  set(key: string | number, value: string | number | boolean): this;

  /**
   * @example
   * ```js
   * const userID = 12345
   * const applesCount = storage.get(userID)
   * console.log(user)
   * ```
   */
  get(key: string | number): any;
}

export default Storage;
