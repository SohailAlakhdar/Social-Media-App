import {
    Model,
    PopulateOptions,
    ProjectionType,
    RootFilterQuery,
} from "mongoose";
import { IChat as TDocument } from "../model/Chat.model";
import { DatabaseRepository, Lean } from "./database.repository";
import { HydratedDocument } from "mongoose";
import { QueryOptions } from "mongoose";

export class ChatRepository extends DatabaseRepository<TDocument> {
    constructor(protected override readonly model: Model<TDocument>) {
        super(model);
    }
    async findOneChat({
        filter,
        select,
        options,
        page = 1,
        size = 5,
    }: {
        filter?: RootFilterQuery<TDocument>;
        select?: ProjectionType<TDocument> | undefined;
        options?: QueryOptions<TDocument> | undefined;
        page?: any;
        size?: any;
    }): Promise<HydratedDocument<TDocument> | null | Lean<TDocument>> {
        page = Math.floor(!page || page < 1 ? 1 : page);
        size = Math.floor(!size || size < 1 ? 5 : size);
        const skip = page * size;
        const dec = this.model.findOne(filter, {
            messages: { $slice: [-skip, size] },
        });
        if (options?.populate)
            dec.populate(options.populate as PopulateOptions[]);
        if (options?.lean) dec.lean(options.lean);
        if (options?.sort) dec.sort(options.sort);
        return await dec.exec();
    }
    async findGroups({
        filter,
        select,
        options,
        page = 1,
        size = 5,
    }: {
        filter: RootFilterQuery<TDocument>;
        select?: ProjectionType<TDocument> | undefined;
        options?: QueryOptions<TDocument> | undefined;
        page?: any;
        size?: any;
    }): Promise<HydratedDocument<TDocument>[] | null | Lean<TDocument>> {
        page = Math.floor(!page || page < 1 ? 1 : page);
        size = Math.floor(!size || size < 1 ? 5 : size);
        const skip = page * size;
        const dec = this.model.find(filter, {
            messages: { $slice: [-skip, size] },
        });
        if (options?.populate)
            dec.populate(options.populate as PopulateOptions[]);
        if (options?.lean) dec.lean(options.lean);
        if (options?.sort) dec.sort(options.sort);
        return await dec.exec();
    }
}
