import { GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
import { GenderEnumType } from "./user.schema.gql";

// --------------------------
// QUERY
export const allUsers = {
    name: { type: new GraphQLNonNull(GraphQLString) },
    gender: { type: GenderEnumType },
};

export const searchUser = {
    email: { type: new GraphQLNonNull(GraphQLString) },
};

// MUTATION
export const addFollower = {
    userId: { type: GraphQLInt },
    friendId: { type: GraphQLInt },
};
