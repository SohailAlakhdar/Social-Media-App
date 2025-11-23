import { GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
import { GraphGenderEnum } from "./user.types.gql";

// --------------------------
// QUERY
export const allUsers = {
    gender: { type: GraphGenderEnum },
};

export const searchUser = {
    email: { type: new GraphQLNonNull(GraphQLString) },
};

// MUTATION
export const addFollower = {
    userId: { type: GraphQLInt },
    friendId: { type: GraphQLInt },
};
