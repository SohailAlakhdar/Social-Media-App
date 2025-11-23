"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allPosts = exports.GraphOnePostResopnse = exports.GraphActionLikeEnum = exports.GraphAvailabilityEnum = exports.GraphAllowCommentsEnum = void 0;
const graphql_1 = require("graphql");
const DB_1 = require("../../DB");
const user_1 = require("../user");
exports.GraphAllowCommentsEnum = new graphql_1.GraphQLEnumType({
    name: "GraphQLAllowCommentEnum",
    values: {
        allow: { value: DB_1.AllowCommentsEnum.allow },
        deny: { value: DB_1.AllowCommentsEnum.deny },
    },
});
exports.GraphAvailabilityEnum = new graphql_1.GraphQLEnumType({
    name: "GraphAvailabilityEnum",
    values: {
        public: { value: DB_1.AvailabilityEnum.public },
        friends: { value: DB_1.AvailabilityEnum.friends },
        onlyMe: { value: DB_1.AvailabilityEnum.onlyMe },
    },
});
exports.GraphActionLikeEnum = new graphql_1.GraphQLEnumType({
    name: "GraphActionLikeEnum",
    values: {
        like: { value: DB_1.ActionLikeEnum.like },
        unlike: { value: DB_1.ActionLikeEnum.unlike },
    },
});
exports.GraphOnePostResopnse = new graphql_1.GraphQLObjectType({
    name: "OnePostResponse",
    fields: {
        _id: { type: graphql_1.GraphQLID },
        createdBy: { type: user_1.GraphQLOneUserResponse },
        content: { type: graphql_1.GraphQLString },
        attachments: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        removedAttachement: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        assetsFolderId: { type: graphql_1.GraphQLString },
        allowComments: { type: exports.GraphAllowCommentsEnum },
        availability: { type: exports.GraphAvailabilityEnum },
        tags: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        removedTags: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        likes: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        except: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        only: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        freezedBy: { type: graphql_1.GraphQLID },
        freezedAt: { type: graphql_1.GraphQLString },
        restoredBy: { type: graphql_1.GraphQLID },
        restoredAt: { type: graphql_1.GraphQLString },
        createdAt: { type: graphql_1.GraphQLString },
        updatedAt: { type: graphql_1.GraphQLString },
    },
});
exports.allPosts = new graphql_1.GraphQLObjectType({
    name: "allPosts",
    fields: {
        docs: { type: new graphql_1.GraphQLList(exports.GraphOnePostResopnse) },
        totalDocs: { type: graphql_1.GraphQLInt },
        totalPages: { type: graphql_1.GraphQLInt },
        page: { type: graphql_1.GraphQLInt },
        size: { type: graphql_1.GraphQLInt },
    },
});
