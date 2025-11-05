import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { userGQLSchema } from "../user";

const query = new GraphQLObjectType({
    name: "RootSchemaQuery", // tracing error and unique identifier
    description: "Optional TExt",
    fields: {
        ...userGQLSchema.registerQuery(),
    },
});

const mutation = new GraphQLObjectType({
    name: "RootSchemaMuation",
    fields: {
        ...userGQLSchema.registerMutation(),
    },
});

// --------------------------------

export const schema = new GraphQLSchema({
    query,
    mutation,
});
