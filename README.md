# dint

> Generate and verify directory integrity

<!--@shields('npm', 'travis')-->
[![npm version](https://img.shields.io/npm/v/dint.svg)](https://www.npmjs.com/package/dint) [![Build Status](https://img.shields.io/travis/zkochan/dint/master.svg)](https://travis-ci.org/zkochan/dint)
<!--/@-->

This package is mostly a copy/paste from [@zkat](https://github.com/zkat)'s [cadr](https://github.com/zkat/cadr) excluding the [cacache](https://github.com/zkat/cacache) usages.

**Important!** A directory is not considered modified if a file was added.
A directory is considered modified if a file was modified or removed.

## Installation

```sh
npm i -S dint
```

## API

### `from(dirname): Promise<DirectoryIntegrity>`

Returns a mapping of file names to file stats info and [Subresource Integrity](https://w3c.github.io/webappsec-subresource-integrity/) of each file.

E.g.:

```js
{
 'test/fixtures/4/lib/bar.js':
   { integrity: 'sha512-1B0QjibzjRrYeSf79Hcy9T1t8KNt4cFpz//88geXTN6lDnUzMo+4o/MJDESUs884XdZ5EX4RLdzsJA8qeEV3lg==',
     dev: 2052,
     mode: 33204,
     nlink: 1,
     uid: 1000,
     gid: 1000,
     rdev: 0,
     blksize: 4096,
     ino: 5952246,
     size: 198,
     blocks: 8,
     atime: 2017-06-11T23:13:53.802Z,
     mtime: 2017-06-11T23:13:07.903Z,
     ctime: 2017-06-11T23:13:07.903Z,
     birthtime: 2017-06-11T23:13:07.903Z },
  'test/index.js':
   { integrity: 'sha512-X6ypBcefaTDbDHHcR0J57E2dvDv6vAVi7tHAhfDImmDU8LBaYwdkdX+hVlqFdWNevJjRqsgZbXb/c+Ewq5t3tQ==',
     dev: 2052,
     mode: 33204,
     nlink: 1,
     uid: 1000,
     gid: 1000,
     rdev: 0,
     blksize: 4096,
     ino: 5923209,
     size: 939,
     blocks: 8,
     atime: 2017-06-11T23:13:53.610Z,
     mtime: 2017-06-11T23:13:51.994Z,
     ctime: 2017-06-11T23:13:51.994Z,
     birthtime: 2017-06-11T23:13:51.994Z } }
```

### `check(dirname, directoryIntegrity): Promise<Boolean>`

Verifies directory integrity against a `directoryIntegrity` argument.

## License

[MIT](./LICENSE) © [Zoltan Kochan](http://kochan.io)
