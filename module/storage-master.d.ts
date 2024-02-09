declare module 'storage-master';

interface StorageOptions {
  /** Check data type before adding to storage. */
  checkType?: boolean;
  /** The number of spaces when formatting the storage. */
  spaces?: number;
  /** Save automation options. */
  save?: {
    /** Automatic interval saving. */
    auto?: number;
    /** Saving when program ends. */
    onExit?: boolean;
  };
}

/**
 * Data types.
 */
type Types = {
  string: string;
  number: number;
  boolean: boolean;
};

/**
 * Structure of the stored data.
 */
type StructureOptions = {
  [field: string]: {
    /** Field value type. */
    type: 'string' | 'number' | 'boolean';
    /** Default value for the field. */
    default?: string | number | boolean;
    /** New field name. */
    rename?: string;
  };
};

type Output<Structure> = {
  id: number;
} & {
  // @ts-ignore
  [Key in keyof Structure]: Types[Structure[Key]['type']];
};

type Input<Structure> = {
  // @ts-ignore
  [Key in keyof Structure]?: Types[Structure[Key]['type']];
};

export class Storage<Structure extends StructureOptions> {
  /**
   * @description
   * Creating a storage.
   * @example
   * ```js
   * import { resolve } from 'path';
   * import { Storage } from 'storage-master';
   *
   * const path = resolve('storages', 'users.json');
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
   * };
   * const options = {
   *   spaces: 2,
   *   save: {
   *     onExit: true,
   *   },
   * };
   *
   * const storage = new Storage(path, structure, options);
   *
   * const userID = 12345;
   * storage.set(userID, {
   *   name: 'Kio Gia',
   *   age: 21,
   * });
   *
   * const user = storage.get(userID);
   * console.log(user);
   * ```
   */
  constructor(
    /** Path to the folder where the storage will be. */
    directory: string,
    /** Structure of the stored data. */
    structure: Structure,
    /** Additional options. */
    options?: StorageOptions
  );

  /**
   * @description
   * Saving storage.
   * @example
   * ```js
   * storage.save()
   * ```
   */
  save(): this;

  /**
   * @description
   * Clears the storage completely (without saving).
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
   * @description
   * Removes the specified ID from storage.
   * @example
   * ```js
   * const userID = 12345
   * storage.delete(userID)
   * ```
   */
  delete(
    /** The ID you need to obtain. */
    id: number | string
  ): this;

  /**
   * @description
   * Set the values ​​of the specified ID.
   * @example
   * ```js
   * const userID = 12345
   * storage.set(userID, {
   *   name: 'Kio'
   * })
   * ```
   */
  set(
    /** The ID whose value is to be set. */
    key: number | string,
    /** Values ​​to set for the ID. */
    values: Input<Structure>
  ): this;

  /**
   * @description
   * Retrieve the specified ID from the storage.
   * @example
   * ```js
   * const userID = 12345
   * const user = storage.get(userID)
   * console.log(user)
   * ```
   */
  get(
    /** The key you need to obtain. */
    id: number | string
  ): Output<Structure>;

  /**
   * @description
   * Get all values.
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
    /** The field by which to sort the values. */
    field?: keyof Structure;
    /** Sorting order. */
    order?: 'ascending' | 'descending';
  }): Array<Output<Structure>>;

  /**
   * @description
   * Loop through all array values.
   * @example
   * ```js
   * storage.forEach((row) => {
   *   if (row.value.is_premium) {
   *     row.set({
   *       name: '💎 ' + row.value.name
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
      /** Row ID. */
      id: number;
      /** Row values. */
      values: Output<Structure>;
      /** Sets the row values. */
      set: (values: Input<Structure>) => {};
      /** Removes a row from storage. */
      delete: () => {};
    }) => {}
  ): void;
}

export default Storage;
