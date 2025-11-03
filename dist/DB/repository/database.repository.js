"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseRepository = void 0;
class DatabaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async find({ filter, select, options, }) {
        const dec = this.model.find(filter || {}).select(select || "");
        if (options?.populate) {
            dec.populate(options.populate);
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
    async paginate({ filter, select, options, page = 1, size = 5, }) {
        const skip = (page - 1) * size;
        const dec = this.model.find(filter || {}).select(select || "");
        if (options?.populate)
            dec.populate(options.populate);
        if (options?.lean)
            dec.lean(options.lean);
        if (options?.sort)
            dec.sort(options.sort);
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
    async findOne({ filter, select, options, }) {
        const dec = this.model.findOne(filter).select(select || "");
        if (options?.populate) {
            dec.populate(options.populate);
        }
        if (options?.lean) {
            dec.lean();
        }
        return dec.exec();
    }
    async create({ data, options, }) {
        return await this.model.create(data, options);
    }
    async insertMany({ data, }) {
        return (await this.model.insertMany(data));
    }
    async updateOne({ filter, update, options, }) {
        console.log({ ...update });
        console.log({ update });
        if (Array.isArray(update)) {
            return await this.model.updateOne(filter || {}, update, options);
        }
        return await this.model.updateOne(filter || {}, { ...update, $inc: { __v: 1 } }, options);
    }
    async findOneAndUpdate({ filter, update, options, }) {
        return await this.model.findOneAndUpdate(filter, { ...update, $inc: { __v: 1 } }, options);
    }
    async findByIdAndUpdate({ id, update, options = { new: true }, }) {
        return await this.model.findByIdAndUpdate(id, { ...update, $inc: { __v: 1 } }, options);
    }
    async deleteOne({ filter, }) {
        return await this.model.deleteOne(filter);
    }
    async deleteMany({ filter, }) {
        return await this.model.deleteMany(filter);
    }
}
exports.DatabaseRepository = DatabaseRepository;
