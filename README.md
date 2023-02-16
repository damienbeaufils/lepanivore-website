# README

| Build Status | Mutation testing coverage (only on back unit tests) | 
| ------------- |:-------------:|
| [![Build Status](https://api.travis-ci.com/damienbeaufils/lepanivore-website.svg?branch=master)](https://app.travis-ci.com/github/damienbeaufils/lepanivore-website) | [![Mutation Score](https://badge.stryker-mutator.io/github.com/damienbeaufils/lepanivore-website/master)](https://dashboard.stryker-mutator.io/reports/github.com/damienbeaufils/lepanivore-website/master) |

This is an online ordering website for [Boulangerie Le Panivore](https://www.lepanivore.com).

## Directory structure

### front
The frontend application built with [Nuxt.js](https://nuxtjs.org/).

#### API service
Methods to interact with REST Api are defined in `front/services/api.service.ts`.
This service is injected in Nuxt Context to be able to access it from components in `front/plugins/api-service.plugin.ts`.

### back
The backend application built with [NestJS](https://nestjs.com/). The application uses a **Clean Architecture pattern** (see below).

#### Clean Architecture
The `back` application is designed using a [Clean Architecture pattern](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) (also known as [Hexagonal Architecture](http://www.maximecolin.fr/uploads/2015/11/56570243d02c0_hexagonal-architecture.png)).
Therefore, [SOLID principles](https://en.wikipedia.org/wiki/SOLID_(object-oriented_design)) are used in code, especially the [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle) (do not mix up with the classic dependency injection in NestJS for example).

Concretely, there are 3 main packages: `domain`, `use_cases` and `infrastructure`. These packages have to respect these rules:
- `domain` contains the business code and its logic, and has no outward dependency: nor on frameworks (NestJS for example), nor on `use_cases` or `infrastructure` packages.
- `use_cases` is like a conductor. It will depend only on `domain` package to execute business logic. `use_cases` should not have any dependencies on `infrastructure`.
- `infrastructure` contains all the technical details, configuration, implementations (database, web services, etc.), and must not contain any business logic. `infrastructure` has dependencies on `domain`, `use_cases` and frameworks.  

## How-to
The `npm` commands are the same, whether you are on `back` or `front` application. 

### Requirements
- Node LTS 16.5

### Install
```
npm install
```

### Test
```
npm test
```

### Run
```
npm run start:dev
```

#### Database migrations

When running `back` for the first time, or after database deletion, you have to run migrations to create a local database:
```
npm run typeorm:migration:run
```

### Environment variables
See [INSTALL.md](INSTALL.md).
