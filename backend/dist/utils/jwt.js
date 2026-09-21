"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAccess = signAccess;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
function signAccess(userId, role) {
    return jsonwebtoken_1.default.sign({ id: userId, role, type: 'access' }, config_1.config.jwtSecret, {
        expiresIn: config_1.config.accessTtl,
    });
}
function verifyToken(token) {
    try {
        const payload = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        return payload;
    }
    catch {
        return null;
    }
}
