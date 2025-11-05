"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFollower = exports.searchUser = exports.allUsers = exports.checkBoolean = exports.welcome = void 0;
const graphql_1 = require("graphql");
const types_gql_1 = require("../graphql/types.gql");
const user_schema_gql_1 = require("./user.schema.gql");
exports.welcome = new graphql_1.GraphQLNonNull(graphql_1.GraphQLString);
exports.checkBoolean = new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean);
exports.allUsers = new graphql_1.GraphQLList(user_schema_gql_1.GraphQLOneUserResponse);
exports.searchUser = (0, types_gql_1.GraphQLUniformResopnse)({
    name: "searchUser",
    data: user_schema_gql_1.GraphQLOneUserResponse,
});
exports.addFollower = new graphql_1.GraphQLList(user_schema_gql_1.GraphQLOneUserResponse);
