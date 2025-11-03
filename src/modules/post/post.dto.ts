import { z } from "zod";
import { likePost } from "./post.validtions";

export type LikePostQueryInputDto = z.infer<typeof likePost.query>;
