"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const graphqlHTTP = require("express-graphql");
const graphql = require("graphql");
const faker = require("faker");
const cors = require("cors");
const fakeResponse = require("./responses");
const path = require("path");
const app = express();
const { buildSchema } = graphql;
const PORT = 8080;
const schema = buildSchema(`
  type Query {
    person(count: Int): [Person]
  }
  
  type Person {
    id: String
    name: String
    email: String
    friends: [Friend]
  }  

  type Friend {
    id: String
    email: String
    phone: String
    company: String
    name: String
    about: String
    age: Int
    gender: String
    favoriteFruit: String
  }
`);
const root = {
    person: ({ count: _count }) => {
        let count = _count || 25;
        let fakeFriends = fakeResponse.FRIENDS;
        let fakeCount = random(20, 25);
        let records = Array.from(Array(count)).map(i => {
            shuffle(fakeFriends);
            return {
                uuid: faker.random.uuid(),
                name: faker.name.firstName() + " " + faker.name.lastName(),
                id: faker.random.number(),
                email: faker.internet.email(),
                friends: fakeFriends.slice(0, fakeCount)
            };
        });
        return records;
    }
};
app.use("/", express.static(path.join(__dirname, "static")));
app.use(cors());
app.options("*", cors());
app.use("/graphql", graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true
}));
app.listen(PORT, () => {
    console.log("GraphQL server listening on port ::: ", PORT);
});
/// Utils
function random(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
