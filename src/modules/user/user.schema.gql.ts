import { UserResolver } from "./user.resolver";
import * as GQLTypes from "./user.types.gql";
import * as GQLArgs from "./user.args.gql";
import { GraphQLNonNull, GraphQLString } from "graphql";

// ==========================================================
class UserGQLSchema {
    private userResolver: UserResolver = new UserResolver();
    constructor() {}
    registerQuery = () => {
        return {
            Welcome: {
                type: GQLTypes.welcome,
                args: { name: { type: new GraphQLNonNull(GraphQLString) } },
                description: "this schema to say hello for you!!",
                resolve: this.userResolver.welcome,
            },
            checkBoolean: {
                type: GQLTypes.checkBoolean,
                resolve: this.userResolver.checkBoolean,
            },
            allUsers: {
                type: GQLTypes.allUsers,
                args: GQLArgs.allUsers,
                resolve: this.userResolver.allUsers,
            },
            searchUser: {
                type: GQLTypes.searchUser,
                args: GQLArgs.searchUser,
                resolve: this.userResolver.searchUser,
            },
        };
    };
    registerMutation = () => {
        return {
            addFollower: {
                type: GQLTypes.addFollower,
                args: GQLArgs.addFollower,
                resolve: this.userResolver.addFollower,
            },
        };
    };
}

export default new UserGQLSchema();
