import { IAuthGraph } from "./../graphql/schema.interface.gpl";
import { GraphQLError } from "graphql";
import { GenderEnum, HUserDocument } from "../../DB";
import { users, UserService } from "./user.service";
import { graphAuthorization } from "../../middlewares/authentication.middlewares";
import { endPoint } from "./user.endPoints";
import { graphValidation } from "../../middlewares/validation.middleware";
import * as validators from "./user.validation";
// USER-RESOLVER
export class UserResolver {
    private userService: UserService = new UserService();
    constructor() {}

    // QUERY
    welcome = async (
        parent: unknown,
        args: any,
        context: { user: HUserDocument }
    ): Promise<string> => {
        await graphValidation<{ name: string }>(validators.welcome, args);
        // authorization
        await graphAuthorization(endPoint.welcome, context.user.role);
        return this.userService.welcome(context.user);
    };
    checkBoolean = (parent: unknown, args: any): boolean => {
        return true;
    };
    allUsers = async (
        parent: unknown,
        args: { gender: GenderEnum },
        context: { user: HUserDocument }
    ): Promise<HUserDocument[]> => {
        console.log({ context });
        return await this.userService.allUsers(parent, args, context.user);
    };
    searchUser = (parent: unknown, args: { email: string }) => {
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
    };

    // MUTATION
    addFollower = (parent: unknown, args: any) => {
        return this.userService.addFollower(args);
    };
}
