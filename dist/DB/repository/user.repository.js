"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const Database_repository_1 = require("./Database.repository");
const error_response_1 = require("../../utils/response/error.response");
class UserRepository extends Database_repository_1.DatabaseRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
    async createUser({ data, options, }) {
        const [user] = (await this.model.create(data, options)) || [];
        if (!user) {
            throw new error_response_1.BadRequestException("Error in creating user");
        }
        return user;
    }
}
exports.UserRepository = UserRepository;
