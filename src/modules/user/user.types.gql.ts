import {
    GraphQLBoolean,
    GraphQLEnumType,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString,
} from "graphql";
import { GraphQLUniformResopnse } from "../graphql/types.gql";

export const GenderEnumType = new GraphQLEnumType({
    name: "GraphQLGenderEnum",
    values: {
        male: { value: "male" },
        female: { value: "female" },
    },
});

export const GraphQLOneUserResponse = new GraphQLObjectType({
    name: "OneUserResponse",
    fields: {
        id: { type: GraphQLID },
        name: {
            type: new GraphQLNonNull(GraphQLString),
        },
        email: {
            type: new GraphQLNonNull(GraphQLString),
        },
        gender: { type: new GraphQLNonNull(GenderEnumType) },
        followers: { type: new GraphQLList(GraphQLID) },
    },
});
// ---------------------------

// // QUERY
export const welcome = new GraphQLNonNull(GraphQLString);
export const checkBoolean = new GraphQLNonNull(GraphQLBoolean);
export const allUsers = new GraphQLList(GraphQLOneUserResponse);
export const searchUser = GraphQLUniformResopnse({
    name: "searchUser",
    data: GraphQLOneUserResponse,
});

// MUTATION
export const addFollower = new GraphQLList(GraphQLOneUserResponse);
