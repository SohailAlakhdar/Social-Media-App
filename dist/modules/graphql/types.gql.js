"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLUniformResopnse = void 0;
const graphql_1 = require("graphql");
const user_schema_gql_1 = require("../user/user.schema.gql");
const GraphQLUniformResopnse = ({ name, data, }) => new graphql_1.GraphQLObjectType({
    name: "searchUser",
    fields: {
        message: { type: graphql_1.GraphQLString },
        statusCode: { type: graphql_1.GraphQLInt },
        data: { type: user_schema_gql_1.GraphQLOneUserResponse },
    },
});
exports.GraphQLUniformResopnse = GraphQLUniformResopnse;
