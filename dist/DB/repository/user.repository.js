"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const database_repository_1 = require("./database.repository");
const error_response_1 = require("../../utils/response/error.response");
class userRepository extends database_repository_1.databaseRepository {
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
exports.userRepository = userRepository;
