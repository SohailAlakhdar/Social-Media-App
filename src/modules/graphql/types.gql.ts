import {
    GraphQLInt,
    GraphQLObjectType,
    GraphQLOutputType,
    GraphQLString,
} from "graphql";

export const GraphQLUniformResopnse = ({
    name,
    data,
}: {
    name: string;
    data: GraphQLOutputType;
}): GraphQLOutputType =>
    new GraphQLObjectType({
        name,
        fields: {
            message: { type: GraphQLString },
            statusCode: { type: GraphQLInt },
            data: { type: data },
        },
    });
