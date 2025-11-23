"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allPosts = void 0;
const graphql_1 = require("graphql");
exports.allPosts = {
    page: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
    size: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) },
};
