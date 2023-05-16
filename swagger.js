// eslint-disable-next-line @typescript-eslint/no-var-requires
const swaggerAutogen = require("swagger-autogen");

swaggerAutogen();

const doc = {
  // info: {
  //   version: "1.0.0", // by default: '1.0.0'
  //   title: "REST API", // by default: 'REST API'
  //   description: "" // by default: ''
  // },
  // host: "localhost:3000", // by default: 'localhost:3000'
  // basePath: "/", // by default: '/'
  // schemes: ["http"], // by default: ['http']
  // consumes: ["application/json"], // by default: ['application/json']
  // produces: ["application/json"], // by default: ['application/json']
  tags: [
    {
      name: "Index", // Tag name
      description: "index router" // Tag description
    },
    {
      name: "Manager",
      description: "manager router"
    },
    {
      name: "User",
      description: "user router"
    }
  ]
  // securityDefinitions: {}, // by default: empty object
  // definitions: {}, // by default: empty object (Swagger 2.0)
  // components: {} // by default: empty object (OpenAPI 3.x)
};

const outputFile = "./swagger.json";
const endpointsFiles = ["./src/app.ts"];

swaggerAutogen(outputFile, endpointsFiles, doc);
