import {
    GraphQLEnumType,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLObjectType,
    GraphQLString,
} from "graphql";
import { ActionLikeEnum, AllowCommentsEnum, AvailabilityEnum } from "../../DB";
import { GraphQLOneUserResponse } from "../user";

export const GraphAllowCommentsEnum = new GraphQLEnumType({
    name: "GraphQLAllowCommentEnum",
    values: {
        allow: { value: AllowCommentsEnum.allow },
        deny: { value: AllowCommentsEnum.deny },
    },
});
export const GraphAvailabilityEnum = new GraphQLEnumType({
    name: "GraphAvailabilityEnum",
    values: {
        public: { value: AvailabilityEnum.public },
        friends: { value: AvailabilityEnum.friends },
        onlyMe: { value: AvailabilityEnum.onlyMe },
    },
});
export const GraphActionLikeEnum = new GraphQLEnumType({
    name: "GraphActionLikeEnum",
    values: {
        like: { value: ActionLikeEnum.like },
        unlike: { value: ActionLikeEnum.unlike },
    },
});

export const GraphOnePostResopnse = new GraphQLObjectType({
    name: "OnePostResponse",
    fields: {
        _id: { type: GraphQLID },
        createdBy: { type: GraphQLOneUserResponse },

        content: { type: GraphQLString },
        attachments: { type: new GraphQLList(GraphQLString) },
        removedAttachement: { type: new GraphQLList(GraphQLString) },
        assetsFolderId: { type: GraphQLString },
        allowComments: { type: GraphAllowCommentsEnum },
        availability: { type: GraphAvailabilityEnum },

        tags: { type: new GraphQLList(GraphQLID) },
        removedTags: { type: new GraphQLList(GraphQLID) },
        likes: { type: new GraphQLList(GraphQLID) },
        except: { type: new GraphQLList(GraphQLID) },
        only: { type: new GraphQLList(GraphQLID) },

        freezedBy: { type: GraphQLID },
        freezedAt: { type: GraphQLString },

        restoredBy: { type: GraphQLID },
        restoredAt: { type: GraphQLString },

        createdAt: { type: GraphQLString },

        updatedAt: { type: GraphQLString },
    },
});

// ======================================
export const allPosts = new GraphQLObjectType({
    name: "allPosts",
    fields: {
        docs: { type: new GraphQLList(GraphOnePostResopnse) },
        totalDocs: { type: GraphQLInt },
        totalPages: { type: GraphQLInt },
        page: { type: GraphQLInt },
        size: { type: GraphQLInt },
    },
});
