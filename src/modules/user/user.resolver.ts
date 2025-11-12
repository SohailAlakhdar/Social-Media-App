import { GraphQLError } from "graphql";
import { GenderEnum } from "../../DB";
import { users, UserService } from "./user.service";

// USER-RESOLVER
export class UserResolver {
    private userService: UserService = new UserService();
    constructor() {}

    // QUERY
    welcome = (parent: unknown, args: any): string => {
        return this.userService.welcome();
    };
    checkBoolean = (parent: unknown, args: any): boolean => {
        return true;
    };
    allUsers = (
        parent: unknown,
        args: { name: string; gender: GenderEnum }
    ) => {
        return this.userService.allUsers(parent, args);
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
