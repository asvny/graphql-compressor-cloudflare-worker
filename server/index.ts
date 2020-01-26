import * as express from "express";
import * as graphqlHTTP from "express-graphql";
import * as graphql from "graphql";
import * as faker from "faker";
import * as fakeResponse from "./responses";

const app = express();
const { buildSchema } = graphql;
const PORT = 8080;

const schema = buildSchema(`
  type Query {
    person: [Person]
  }
  
  type Person {
    id: String
    guid: String
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
  person: () => {
    let count = random(20, 25);
    let fakeFriends = fakeResponse.FRIENDS;

    let records = Array.from(Array(count)).map(i => {
      shuffle(fakeFriends);

      return {
        uuid: faker.random.uuid(),
        id: faker.random.number(),
        email: faker.internet.email(),
        friends: fakeFriends.slice(0, count)
      };
    });

    return records;
  }
};

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true
  })
);

app.listen(PORT, () => {
  console.log("GraphQL server listening on port ::: ", PORT);
});

/// Utils

function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

function shuffle(array: Array<any>) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}
