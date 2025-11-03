import {
    DeleteResult,
    FlattenMaps,
    HydratedDocument,
    Model,
    MongooseUpdateQueryOptions,
    PopulateOptions,
    ProjectionType,
    QueryOptions,
    RootFilterQuery,
    Types,
    UpdateQuery,
    UpdateWriteOpResult,
} from "mongoose";

import { CreateOptions } from "mongoose";

export type Lean<T> = HydratedDocument<FlattenMaps<T>>;

export abstract class DatabaseRepository<TDocument> {
    constructor(protected readonly model: Model<TDocument>) {}

    async find({
        filter,
        select,
        options,
    }: {
        filter?: RootFilterQuery<TDocument>;
        select?: ProjectionType<TDocument> | undefined;
        options?:
            | (QueryOptions<TDocument> & {
                  populate?: PopulateOptions[];
                  skip?: number;
                  limit?: number;
                  sort?: Record<string, 1 | -1>;
                  lean?: boolean;
                  cursor?: any;
              })
            | null;
    }): Promise<HydratedDocument<TDocument>[] | [] | Lean<TDocument>[]> {
        const dec = this.model.find(filter || {}).select(select || "");
        if (options?.populate) {
            dec.populate(options.populate as PopulateOptions[]);
        }
        if (options?.lean) {
            dec.lean(options.lean);
        }
        if (options?.skip) {
            dec.skip(options.skip);
        }
        if (options?.limit) {
            dec.limit(options.limit);
        }
        if (options?.sort) {
            dec.sort(options.sort);
        }
        return dec.exec();
    }
    async paginate({
        filter,
        select,
        options,
        page = 1,
        size = 5,
    }: {
        filter?: RootFilterQuery<TDocument>;
        select?: ProjectionType<TDocument> | undefined;
        options?: QueryOptions<TDocument> & {
            populate?: PopulateOptions[];
            sort?: Record<string, 1 | -1>;
            lean?: boolean;
        };
        page?: any;
        size?: any;
    }): Promise<{
        docs: HydratedDocument<TDocument>[] | Lean<TDocument>[];
        totalDocs: number;
        totalPages: number;
        page: number;
        size: number;
    }> {
        const skip = (page - 1) * size;
        const dec = this.model.find(filter || {}).select(select || "");
        if (options?.populate)
            dec.populate(options.populate as PopulateOptions[]);
        if (options?.lean) dec.lean(options.lean);
        if (options?.sort) dec.sort(options.sort);
        dec.skip(skip).limit(size);

        const [docs, totalDocs] = await Promise.all([
            dec.exec(),
            this.model.countDocuments(filter),
        ]);

        return {
            docs,
            totalDocs,
            totalPages: Math.ceil(totalDocs / size),
            page,
            size,
        };
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
        data: Partial<TDocument>[] | [];
        options?: CreateOptions;
    }): Promise<HydratedDocument<TDocument>[]> {
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
        console.log({ ...update });
        console.log({ update });
        if (Array.isArray(update)) {
            return await this.model.updateOne(filter || {}, update, options);
        }
        return await this.model.updateOne(
            filter || {},
            { ...update, $inc: { __v: 1 } },
            options
        );
    }
    async findOneAndUpdate({
        filter,
        update,
        options,
    }: {
        filter: RootFilterQuery<TDocument>;
        update: UpdateQuery<TDocument>;
        options?: QueryOptions<TDocument> | null;
    }): Promise<HydratedDocument<TDocument> | Lean<TDocument> | null> {
        return await this.model.findOneAndUpdate(
            filter,
            { ...update, $inc: { __v: 1 } },
            options
        );
        // Promise<HydratedDocument<UpdateWriteOpResult<TDocument>> | null>
    }
    async findByIdAndUpdate({
        id,
        update,
        options = { new: true },
    }: {
        id: Types.ObjectId;
        update: UpdateQuery<TDocument>;
        options?: QueryOptions<TDocument> | null;
    }): Promise<HydratedDocument<TDocument> | Lean<TDocument> | null> {
        return await this.model.findByIdAndUpdate(
            id,
            { ...update, $inc: { __v: 1 } },
            options
        );
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
