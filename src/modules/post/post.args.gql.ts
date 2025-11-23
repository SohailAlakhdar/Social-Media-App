import { GraphQLInt, GraphQLNonNull } from "graphql";

// --------------------------
// QUERY
export const allPosts = {
    page: { type: new GraphQLNonNull(GraphQLInt) },
    size: { type: new GraphQLNonNull(GraphQLInt) },
};

// MUTATION
