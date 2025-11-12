"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFollower = exports.searchUser = exports.allUsers = exports.checkBoolean = exports.welcome = exports.GraphQLOneUserResponse = exports.GenderEnumType = void 0;
const graphql_1 = require("graphql");
const types_gql_1 = require("../graphql/types.gql");
exports.GenderEnumType = new graphql_1.GraphQLEnumType({
    name: "GraphQLGenderEnum",
    values: {
        male: { value: "male" },
        female: { value: "female" },
    },
});
exports.GraphQLOneUserResponse = new graphql_1.GraphQLObjectType({
    name: "OneUserResponse",
    fields: {
        id: { type: graphql_1.GraphQLID },
        name: {
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
        },
        email: {
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
        },
        gender: { type: new graphql_1.GraphQLNonNull(exports.GenderEnumType) },
        followers: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
    },
});
exports.welcome = new graphql_1.GraphQLNonNull(graphql_1.GraphQLString);
exports.checkBoolean = new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean);
exports.allUsers = new graphql_1.GraphQLList(exports.GraphQLOneUserResponse);
exports.searchUser = (0, types_gql_1.GraphQLUniformResopnse)({
    name: "searchUser",
    data: exports.GraphQLOneUserResponse,
});
exports.addFollower = new graphql_1.GraphQLList(exports.GraphQLOneUserResponse);
