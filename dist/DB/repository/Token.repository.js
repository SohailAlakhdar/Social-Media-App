"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenRepository = void 0;
const database_repository_1 = require("./database.repository");
class tokenRepository extends database_repository_1.databaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
}
exports.tokenRepository = tokenRepository;
