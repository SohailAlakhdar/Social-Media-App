"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const graphql_1 = require("graphql");
const user_service_1 = require("./user.service");
class UserResolver {
    userService = new user_service_1.UserService();
    constructor() { }
    welcome = (parent, args) => {
        return this.userService.welcome();
    };
    checkBoolean = (parent, args) => {
        return true;
    };
    allUsers = (parent, args) => {
        return this.userService.allUsers(parent, args);
    };
    searchUser = (parent, args) => {
        const user = user_service_1.users.find((ele) => ele.email === args.email);
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
    };
    addFollower = (parent, args) => {
        return this.userService.addFollower(args);
    };
}
exports.UserResolver = UserResolver;
