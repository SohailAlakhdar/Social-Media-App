"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFollower = exports.searchUser = exports.allUsers = void 0;
const graphql_1 = require("graphql");
const user_types_gql_1 = require("./user.types.gql");
exports.allUsers = {
    name: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
    gender: { type: user_types_gql_1.GenderEnumType },
};
exports.searchUser = {
    email: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
};
exports.addFollower = {
    userId: { type: graphql_1.GraphQLInt },
    friendId: { type: graphql_1.GraphQLInt },
};
