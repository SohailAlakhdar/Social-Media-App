"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLOneUserResponse = exports.GenderEnumType = void 0;
const graphql_1 = require("graphql");
const DB_1 = require("../../DB");
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
let users = [
    {
        id: 1,
        name: "sohail",
        email: "sohail@gmail.com",
        gender: DB_1.GenderEnum.male,
        password: "555789",
        followers: [],
    },
    {
        id: 2,
        name: "Ibrahim",
        email: "Ibrahim@gmail.com",
        gender: DB_1.GenderEnum.male,
        password: "555789",
        followers: [],
    },
    {
        id: 3,
        name: "Sara",
        email: "Sara@gmail.com",
        gender: DB_1.GenderEnum.female,
        password: "457892",
        followers: [],
    },
    {
        id: 4,
        name: "Adel",
        email: "Adel@gmail.com",
        gender: DB_1.GenderEnum.male,
        password: "555789",
        followers: [],
    },
];
class UserGQLSchema {
    constructor() { }
    registerQuery = () => {
        return {
            Welcome: {
                type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString),
                description: "this schema to say hello for you!!",
                resolve: (parent, args) => {
                    return "Hello World";
                },
            },
            checkBoolean: {
                type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLBoolean),
                resolve: (parent, args) => {
                    return true;
                },
            },
            allUsers: {
                type: new graphql_1.GraphQLList(exports.GraphQLOneUserResponse),
                resolve: (parent, args) => {
                    return users.filter((ele) => ele.name === args.name && ele.gender === args.gender);
                },
            },
            searchUser: {
                type: (0, types_gql_1.GraphQLUniformResopnse)({
                    name: "searchUser",
                    data: exports.GraphQLOneUserResponse,
                }),
                resolve: (parent, args) => {
                    const user = users.find((ele) => ele.email === args.email);
                    console.log({ user });
                    if (!user) {
                        throw new graphql_1.GraphQLError("User not found", {
                            extensions: { statusCode: 400 },
                        });
                    }
                    return {
                        message: "Done",
                        statusCode: 200,
                        data: user,
                    };
                },
            },
        };
    };
    registerMutation = () => {
        return {
            addFollower: {
                type: new graphql_1.GraphQLList(exports.GraphQLOneUserResponse),
                resolve: (parent, args) => {
                    users = users.map((ele) => {
                        if (ele.id === args.friendId) {
                            ele.followers.push(args.userId);
                        }
                        return ele;
                    });
                    return users;
                },
            },
        };
    };
}
exports.default = new UserGQLSchema();
