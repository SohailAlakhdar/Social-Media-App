"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenRepository = void 0;
const Database_repository_1 = require("./Database.repository");
class TokenRepository extends Database_repository_1.DatabaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.TokenRepository = TokenRepository;
