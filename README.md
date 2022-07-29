<div align="center">

# Ecommerce API 🛒

### Clean code / architecture POC application

![Coverage Build](https://github.com/luizxsoto/ecommerce-api/actions/workflows/test-coveralls.yml/badge.svg)
![Coverage Status](https://coveralls.io/repos/github/luizxsoto/ecommerce-api/badge.svg?branch=master)
![Languages](https://img.shields.io/github/languages/count/luizxsoto/ecommerce-api)
![Known Vulnerabilities](https://snyk.io/test/github/luizxsoto/ecommerce-api/badge.svg)

[Technologies](#rocket-technologies)
&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
[How To Use](#information_source-how-to-use)

</div>

## :rocket: Technologies

- [Express](https://expressjs.com/)
- [Typescript](https://www.typescriptlang.org/)
- [Postgres](https://www.postgresql.org/) and [Knex](http://knexjs.org/)
- [Jest](https://jestjs.io/) and [Supertest](https://github.com/visionmedia/supertest/)
- [VS Code][vc] with [EditorConfig][vceditconfig], [ESLint][vceslint] and [Prettier][vcprettier]

[vc]: https://code.visualstudio.com/
[vceditconfig]: https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig
[vceslint]: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
[vcprettier]: https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode

## :information_source: How To Use

To clone and run this application, you'll need [Git](https://git-scm.com), [Node.js >= v16.13.x](https://nodejs.org/), [Docker and Compose](https://www.docker.com/) installed on your computer.

From your command line:

```bash
# Clone this repository
$ git clone git@github.com:luizxsoto/ecommerce-api.git

# Go into the repository
$ cd ecommerce-api

# Install dependencies
$ npm i

# Test the app
$ npm run test

# Run the app
$ docker-compose up
```
