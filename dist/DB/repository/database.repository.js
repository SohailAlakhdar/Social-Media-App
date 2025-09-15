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
            dec.lean(options.skip);
        }
        if (options?.limit) {
            dec.lean(options.limit);
        }
        return dec.exec();
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
        return await this.model.updateOne(filter, { ...update, $inc: { __v: 1 } }, options);
    }
    async findOneAndUpdate({ filter, update, options, }) {
        return await this.model.findOneAndUpdate(filter, { ...update, $inc: { __v: 1 } }, options);
    }
    async deleteOne({ filter, }) {
        return await this.model.deleteOne(filter);
    }
    async deleteMany({ filter, }) {
        return await this.model.deleteMany(filter);
    }
}
exports.DatabaseRepository = DatabaseRepository;
