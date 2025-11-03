"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatRepository = void 0;
const database_repository_1 = require("./database.repository");
class ChatRepository extends database_repository_1.DatabaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
    async findOneChat({ filter, select, options, page = 1, size = 5, }) {
        page = Math.floor(!page || page < 1 ? 1 : page);
        size = Math.floor(!size || size < 1 ? 5 : size);
        const skip = page * size;
        const dec = this.model.findOne(filter, {
            messages: { $slice: [-skip, size] },
        });
        if (options?.populate)
            dec.populate(options.populate);
        if (options?.lean)
            dec.lean(options.lean);
        if (options?.sort)
            dec.sort(options.sort);
        return await dec.exec();
    }
    async findGroups({ filter, select, options, page = 1, size = 5, }) {
        page = Math.floor(!page || page < 1 ? 1 : page);
        size = Math.floor(!size || size < 1 ? 5 : size);
        const skip = page * size;
        const dec = this.model.find(filter, {
            messages: { $slice: [-skip, size] },
        });
        if (options?.populate)
            dec.populate(options.populate);
        if (options?.lean)
            dec.lean(options.lean);
        if (options?.sort)
            dec.sort(options.sort);
        return await dec.exec();
    }
}
exports.ChatRepository = ChatRepository;
