import {
    DeleteResult,
    HydratedDocument,
    Model,
    MongooseUpdateQueryOptions,
    PopulateOptions,
    ProjectionType,
    QueryOptions,
    RootFilterQuery,
    UpdateQuery,
    UpdateWriteOpResult,
} from "mongoose";
import { CreateOptions } from "mongoose";
import { Lean } from "./User.repository";

export abstract class DatabaseRepository<TDocument> {
    constructor(protected readonly model: Model<TDocument>) {}

    async find({
        filter,
        select,
        options,
    }: {
        filter?: RootFilterQuery<TDocument>;
        select?: ProjectionType<TDocument> | null;
        options?: QueryOptions<TDocument> | null;
    }): Promise<HydratedDocument<TDocument>[] | [] | Lean<TDocument>[]> {
        const dec = this.model.find(filter || {}).select(select || "");
        if (options?.populate) {
            dec.populate(options.populate as PopulateOptions[]);
        }
        if (options?.lean) {
            dec.lean(options.lean);
        }
        if (options?.skip) {
            dec.lean(options.skip);
        }
        if (options?.limit) {
            dec.lean(options.limit);
        }
        return dec.exec();
    }
    async findOne({
        filter,
        select,
        options,
    }: {
        filter?: RootFilterQuery<TDocument>;
        select?: ProjectionType<TDocument> | null;
        options?: QueryOptions<TDocument> | null;
    }): Promise<HydratedDocument<TDocument> | null | Lean<TDocument>> {
        const dec = this.model.findOne(filter).select(select || "");
        if (options?.populate) {
            dec.populate(options.populate as PopulateOptions[]);
        }
        if (options?.lean) {
            dec.lean();
        }

        return dec.exec();
    }

    async create({
        data,
        options,
    }: {
        data: Partial<TDocument>[];
        options?: CreateOptions;
    }): Promise<HydratedDocument<TDocument>[] | undefined> {
        return await this.model.create(data, options);
    }
    async insertMany({
        data,
    }: {
        data: Partial<TDocument>[];
    }): Promise<HydratedDocument<TDocument>[]> {
        return (await this.model.insertMany(
            data
        )) as HydratedDocument<TDocument>[];
    }

    async updateOne({
        filter,
        update,
        options,
    }: {
        filter: RootFilterQuery<TDocument>;
        update: UpdateQuery<TDocument>;
        // options?: QueryOptions<TDocument>;
        options?: MongooseUpdateQueryOptions<TDocument> | null;
    }): Promise<UpdateWriteOpResult> {
        return await this.model.updateOne(
            filter,
            { ...update, $inc: { __v: 1 } },
            options
        );
        // Promise<HydratedDocument<UpdateWriteOpResult<TDocument>> | null>
    }
    async findOneAndUpdate({
        filter,
        update,
        options,
    }: {
        filter: RootFilterQuery<TDocument>;
        update: UpdateQuery<TDocument>;
        options?: MongooseUpdateQueryOptions<TDocument> | null;
    }): Promise<HydratedDocument<TDocument> | null> {
        return await this.model.findOneAndUpdate(
            filter,
            { ...update, $inc: { __v: 1 } },
            options
        );
        // Promise<HydratedDocument<UpdateWriteOpResult<TDocument>> | null>
    }

    async deleteOne({
        filter,
    }: {
        filter: RootFilterQuery<TDocument>;
    }): Promise<DeleteResult> {
        return await this.model.deleteOne(filter);
    }

    async deleteMany({
        filter,
    }: {
        filter: RootFilterQuery<TDocument>;
    }): Promise<DeleteResult> {
        return await this.model.deleteMany(filter);
    }
}
