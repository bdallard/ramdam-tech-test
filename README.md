# Ramdam tech test 

Ramdam express tech test 

## Project structure  

```
src
├── app.ts
├── config
│   └── swagger.ts
├── middleware
│   └── logger.ts
├── routes
│   ├── analyzeRoutes.ts
│   ├── index.ts
│   └── testRoutes.ts
├── server.ts
├── services
│   ├── unsplashService.ts
│   └── visionService.ts
└── tests
    ├── mocks
    ├── routes
    │   ├── analyzeRoutes.test.ts
    │   └── testRoutes.test.ts
    ├── services
    └── setup.ts
```


## Tests and run the project  

First run the linter : 

```
npm run lint
```

Then run the server : 

```
make dev
```

And make a simple route test request or see the swagger doc at `http://localhost:3000/docs/` : 

```
make test-combined KEYWORD=city LABEL=building
```

Docker build and run with : 

```
make docker-dev
```



## TODO

- [X] basic features
- [X] connect api tiers 
- [X] dockerfile for the project
- [X] makefile 
- [X] typescript config 
- [X] fix typing / zod 🔥
- [X] validate server input/output 
- [X] clean logging --> middleware 
- [X] install eslint 
- [ ] write some git action ci mini file 
- [ ] implement proper vitest : https://vitest.dev/

