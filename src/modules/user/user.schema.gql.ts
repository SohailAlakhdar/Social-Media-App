import {
    GraphQLString,
    GraphQLNonNull,
    GraphQLList,
    GraphQLEnumType,
    GraphQLID,
    GraphQLObjectType,
    GraphQLBoolean,
    GraphQLError,
} from "graphql";
import { GenderEnum } from "../../DB";
import { GraphQLUniformResopnse } from "../graphql/types.gql";
// import * as GQLTypes from "./user.types.gql";

interface IUser {
    id: number;
    name: string;
    email: string;
    gender: GenderEnum;
    password: string;
    followers: number[];
}

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

let users: IUser[] = [
    {
        id: 1,
        name: "sohail",
        email: "sohail@gmail.com",
        gender: GenderEnum.male,
        password: "555789",
        followers: [],
    },
    {
        id: 2,
        name: "Ibrahim",
        email: "Ibrahim@gmail.com",
        gender: GenderEnum.male,
        password: "555789",
        followers: [],
    },
    {
        id: 3,
        name: "Sara",
        email: "Sara@gmail.com",
        gender: GenderEnum.female,
        password: "457892",
        followers: [],
    },
    {
        id: 4,
        name: "Adel",
        email: "Adel@gmail.com",
        gender: GenderEnum.male,
        password: "555789",
        followers: [],
    },
];

// ==========================================================
class UserGQLSchema {
    constructor() {}

    registerQuery = () => {
        return {
            Welcome: {
                // type: GQLTypes.welcome,
                type: new GraphQLNonNull(GraphQLString),
                description: "this schema to say hello for you!!",
                resolve: (parent: unknown, args: any) => {
                    return "Hello World";
                },
            },
            checkBoolean: {
                type: new GraphQLNonNull(GraphQLBoolean),
                // type: GQLTypes.checkBoolean,
                resolve: (parent: unknown, args: any): boolean => {
                    return true;
                },
            },

            allUsers: {
                // type: GQLTypes.allUsers,
                type: new GraphQLList(GraphQLOneUserResponse),
                // args: GQLArgs.allUsers,
                resolve: (
                    parent: unknown,
                    args: { name: string; gender: GenderEnum }
                ) => {
                    return users.filter(
                        (ele) =>
                            ele.name === args.name && ele.gender === args.gender
                    );
                },
            },
            searchUser: {
                // type: GQLTypes.searchUser,
                type: GraphQLUniformResopnse({
                    name: "searchUser",
                    data: GraphQLOneUserResponse,
                }),
                // args: GQLArgs.searchUser,
                resolve: (parent: unknown, args: { email: string }) => {
                    const user = users.find((ele) => ele.email === args.email);
                    console.log({ user });

                    if (!user) {
                        throw new GraphQLError("User not found", {
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
                // type: GQLTypes.addFollower,
                type: new GraphQLList(GraphQLOneUserResponse),
                // args: GQLArgs.addFollower,
                resolve: (parent: unknown, args: any) => {
                    users = users.map((ele: IUser) => {
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

export default new UserGQLSchema();
