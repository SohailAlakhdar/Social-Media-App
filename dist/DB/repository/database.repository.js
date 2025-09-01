"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseRepository = void 0;
class databaseRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    async findOne({ filter, select, options, }) {
        const dec = this.model.findOne(filter).select(select || "");
        if (options?.populate) {
            dec.populate(options.populate);
        }
        if (options?.lean) {
            dec.lean(options.lean);
        }
        return dec.exec();
    }
    async create({ data, options, }) {
        return await this.model.create(data, options);
    }
    async updateOne({ filter, update, options, }) {
        return await this.model.updateOne(filter, { ...update, $inc: { __v: 1 } }, options);
    }
}
exports.databaseRepository = databaseRepository;
