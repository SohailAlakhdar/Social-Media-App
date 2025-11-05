"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = void 0;
const graphql_1 = require("graphql");
const user_1 = require("../user");
const query = new graphql_1.GraphQLObjectType({
    name: "RootSchemaQuery",
    description: "Optional TExt",
    fields: {
        ...user_1.userGQLSchema.registerQuery(),
    },
});
const mutation = new graphql_1.GraphQLObjectType({
    name: "RootSchemaMuation",
    fields: {
        ...user_1.userGQLSchema.registerMutation(),
    },
});
exports.schema = new graphql_1.GraphQLSchema({
    query,
    mutation,
});
