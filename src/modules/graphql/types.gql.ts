import {
    GraphQLInt,
    GraphQLObjectType,
    GraphQLOutputType,
    GraphQLString,
} from "graphql";
import { GraphQLOneUserResponse } from "../user/user.schema.gql";

export const GraphQLUniformResopnse = ({
    name,
    data,
}: {
    name: string;
    data: GraphQLOutputType;
}): GraphQLOutputType =>
    new GraphQLObjectType({
        name: "searchUser",
        fields: {
            message: { type: GraphQLString },
            statusCode: { type: GraphQLInt },
            data: { type: GraphQLOneUserResponse },
        },
    });
