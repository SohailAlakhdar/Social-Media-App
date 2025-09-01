import {
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

export abstract class databaseRepository<TDocument> {
    constructor(protected readonly model: Model<TDocument>) {}
    async findOne({
        filter,
        select,
        options,
    }: {
        filter?: RootFilterQuery<TDocument>;
        select?: ProjectionType<TDocument> | null;
        options?: QueryOptions<TDocument> | null;
    }): Promise<HydratedDocument<TDocument> | null> {
        const dec = this.model.findOne(filter).select(select || "");
        if (options?.populate) {
            dec.populate(options.populate as PopulateOptions[]);
        }
        if (options?.lean) {
            dec.lean(options.lean);
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
        // this returns an array of created documents
        return await this.model.create(data, options);
    }
    async updateOne({
        filter,
        update,
        options,
    }: {
        filter: RootFilterQuery<TDocument>;
        update: UpdateQuery<TDocument> ;
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
}
