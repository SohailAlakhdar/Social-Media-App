import { HPostDocument, HUserDocument } from "../../DB";
import { PostService } from "./post.service";
export class PostResolver {
    private postService: PostService = new PostService();
    constructor() {}
    allPosts = async (
        parent: unknown,
        args: { page: number; size: number },
        context: { user: HUserDocument }
    ): Promise<{
        docs?: HPostDocument[];
        totalDocs?: number;
        totalPages?: number;
        page?: number;
        size?: number;
    }> => {
        return await this.postService.allPosts(parent, args, context.user);
    };
}
