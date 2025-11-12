"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLUniformResopnse = void 0;
const graphql_1 = require("graphql");
const GraphQLUniformResopnse = ({ name, data, }) => new graphql_1.GraphQLObjectType({
    name,
    fields: {
        message: { type: graphql_1.GraphQLString },
        statusCode: { type: graphql_1.GraphQLInt },
        data: { type: data },
    },
});
exports.GraphQLUniformResopnse = GraphQLUniformResopnse;
