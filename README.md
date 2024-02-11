# storage-master module

## Introduction

A simple module for JSON storing and managing data.
Great for small projects, making coding easier and faster!

## Installation

Installation from `npm`

```bash
npm i storage-master
```

## Setup Example

This is a small example with which you can easily start using `storage-master`.

```js
import { resolve } from 'path';
import { Storage } from 'storage-master';

// Specify the path to the storage
const path = resolve('storages', 'users.json');

// Indicate the stored data, its types and default values
const structure = {
  name: {
    type: 'string',
  },
  age: {
    type: 'number',
  },
  is_verified: {
    type: 'boolean',
    default: false,
  },
};

// Create a class for further work with the repository
const storage = new Storage(path, structure);

const userID = 12345;
storage.set(userID, {
  name: 'Kio Gia',
  age: 21,
});

const user = storage.get(userID);
console.log(user);
```

To use **ES6**, add to `package.json`:

```json
"type": "module"
```

## Useful links

- `json-master`
  - [News channel][1]
  - [Discussion chat][2]

[1]: https://t.me/KioDev
[2]: https://t.me/KioDevChat
