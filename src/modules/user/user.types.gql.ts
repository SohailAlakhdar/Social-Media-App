import {
    GraphQLBoolean,
    GraphQLList,
    GraphQLNonNull,
    GraphQLString,
} from "graphql";
import {  GraphQLUniformResopnse } from "../graphql/types.gql";
import { GraphQLOneUserResponse } from "./user.schema.gql";


// ---------------------------

// // QUERY
export const welcome = new GraphQLNonNull(GraphQLString);
export const checkBoolean = new GraphQLNonNull(GraphQLBoolean);
export const allUsers = new GraphQLList(GraphQLOneUserResponse);
export const searchUser = GraphQLUniformResopnse({
    name: "searchUser",
    data: GraphQLOneUserResponse,
});

// // MUTATION
export const addFollower = new GraphQLList(GraphQLOneUserResponse);
