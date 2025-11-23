import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { userGQLSchema } from "../user";
import { postGQLSchema } from "../post";

const query = new GraphQLObjectType({
    name: "RootSchemaQuery", // tracing error and unique identifier
    description: "Optional TExt",
    fields: {
        ...userGQLSchema.registerQuery(),
        ...postGQLSchema.rigisterQuery(),
    },
});

const mutation = new GraphQLObjectType({
    name: "RootSchemaMuation",
    fields: {
        ...userGQLSchema.registerMutation(),
        ...postGQLSchema.registerMutation(),
    },
});

// --------------------------------

export const schema = new GraphQLSchema({
    query,
    mutation,
});
