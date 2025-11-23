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
import { GenderEnum, HUserDocument, providerEnum, RoleEnum } from "../../DB";

// ENUM----------------------
export const GraphGenderEnum = new GraphQLEnumType({
    name: "GraphQLGenderEnum",
    values: {
        male: { value: GenderEnum.male },
        female: { value: GenderEnum.female },
    },
});
export const GraphProviderEnum = new GraphQLEnumType({
    name: "GraphQLProviderEnum",
    values: {
        google: { value: providerEnum.GOOGLE },
        system: { value: providerEnum.SYSTEM },
    },
});
export const GraphRoleEnum = new GraphQLEnumType({
    name: "GraphQLRoleEnum",
    values: {
        admin: { value: RoleEnum.admin },
        superAdmin: { value: RoleEnum.superAdmin },
        user: { value: RoleEnum.user },
    },
});

export const GraphQLOneUserResponse = new GraphQLObjectType({
    name: "OneUserResponse",
    fields: {
        _id: { type: GraphQLID },

        firstName: { type: new GraphQLNonNull(GraphQLString) },
        lastName: { type: GraphQLString },
        username: {
            type: GraphQLString,
            resolve: (parent: HUserDocument) => {
                return parent.gender === GenderEnum.male
                    ? `Mr:${parent.username}`
                    : `Mis:${parent.username}`;
            },
        },

        slug: { type: GraphQLString },
        email: { type: GraphQLString },
        confirmEmailOtp: { type: GraphQLString },
        confirmedAt: { type: GraphQLString },

        password: { type: GraphQLString },
        resetPasswordToken: { type: GraphQLString },
        verifyForgotPassword: { type: GraphQLString },
        changeCredentialsAt: { type: GraphQLString },

        phone: { type: GraphQLString },
        address: { type: GraphQLString },

        gender: { type: GraphGenderEnum },
        role: { type: GraphRoleEnum },
        provider: { type: GraphProviderEnum },

        profileImage: { type: GraphQLString },
        tempProfileImage: { type: GraphQLString },
        coverImage: { type: new GraphQLList(GraphQLID) },

        restoredBy: { type: GraphQLID },
        restoredAt: { type: GraphQLString },

        createdAt: { type: GraphQLString },
        friends: { type: new GraphQLList(GraphQLID) },

        freezedBy: { type: GraphQLID },
        freezedAt: { type: GraphQLString },

        updateAt: { type: GraphQLString },
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
