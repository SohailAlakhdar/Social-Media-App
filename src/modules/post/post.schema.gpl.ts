import { PostResolver } from "./post.resolver";
import * as GQLTypes from "./post.types.gql";
import * as GQLArgs from "./post.args.gql";
export class PostGQLSchema {
    private postResolver: PostResolver = new PostResolver();
    constructor() {}
    rigisterQuery = () => {
        return {
            allPosts: {
                type: GQLTypes.allPosts,
                args: GQLArgs.allPosts,
                resolve: this.postResolver.allPosts,
            },
        };
    };
    registerMutation = () => {
        return {};
    };
}
export default new PostGQLSchema();
