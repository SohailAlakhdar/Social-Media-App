"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFollower = exports.searchUser = exports.allUsers = exports.checkBoolean = exports.welcome = exports.GraphQLOneUserResponse = exports.GraphRoleEnum = exports.GraphProviderEnum = exports.GraphGenderEnum = void 0;
const graphql_1 = require("graphql");
const types_gql_1 = require("../graphql/types.gql");
const DB_1 = require("../../DB");
exports.GraphGenderEnum = new graphql_1.GraphQLEnumType({
    name: "GraphQLGenderEnum",
    values: {
        male: { value: DB_1.GenderEnum.male },
        female: { value: DB_1.GenderEnum.female },
    },
});
exports.GraphProviderEnum = new graphql_1.GraphQLEnumType({
    name: "GraphQLProviderEnum",
    values: {
        google: { value: DB_1.providerEnum.GOOGLE },
        system: { value: DB_1.providerEnum.SYSTEM },
    },
});
exports.GraphRoleEnum = new graphql_1.GraphQLEnumType({
    name: "GraphQLRoleEnum",
    values: {
        admin: { value: DB_1.RoleEnum.admin },
        superAdmin: { value: DB_1.RoleEnum.superAdmin },
        user: { value: DB_1.RoleEnum.user },
    },
});
exports.GraphQLOneUserResponse = new graphql_1.GraphQLObjectType({
    name: "OneUserResponse",
    fields: {
        _id: { type: graphql_1.GraphQLID },
        firstName: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        lastName: { type: graphql_1.GraphQLString },
        username: {
            type: graphql_1.GraphQLString,
            resolve: (parent) => {
                return parent.gender === DB_1.GenderEnum.male
                    ? `Mr:${parent.username}`
                    : `Mis:${parent.username}`;
            },
        },
        slug: { type: graphql_1.GraphQLString },
        email: { type: graphql_1.GraphQLString },
        confirmEmailOtp: { type: graphql_1.GraphQLString },
        confirmedAt: { type: graphql_1.GraphQLString },
        password: { type: graphql_1.GraphQLString },
        resetPasswordToken: { type: graphql_1.GraphQLString },
        verifyForgotPassword: { type: graphql_1.GraphQLString },
        changeCredentialsAt: { type: graphql_1.GraphQLString },
        phone: { type: graphql_1.GraphQLString },
        address: { type: graphql_1.GraphQLString },
        gender: { type: exports.GraphGenderEnum },
        role: { type: exports.GraphRoleEnum },
        provider: { type: exports.GraphProviderEnum },
        profileImage: { type: graphql_1.GraphQLString },
        tempProfileImage: { type: graphql_1.GraphQLString },
        coverImage: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        restoredBy: { type: graphql_1.GraphQLID },
        restoredAt: { type: graphql_1.GraphQLString },
        createdAt: { type: graphql_1.GraphQLString },
        friends: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        freezedBy: { type: graphql_1.GraphQLID },
        freezedAt: { type: graphql_1.GraphQLString },
        updateAt: { type: graphql_1.GraphQLString },
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
