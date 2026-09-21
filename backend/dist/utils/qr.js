"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEMBER_PREFIX = exports.BOOK_PREFIX = void 0;
exports.bookCode = bookCode;
exports.memberCode = memberCode;
exports.parseCode = parseCode;
exports.qrPngBuffer = qrPngBuffer;
const qrcode_1 = __importDefault(require("qrcode"));
exports.BOOK_PREFIX = 'pustaka:book:';
exports.MEMBER_PREFIX = 'pustaka:member:';
function bookCode(id) {
    return `${exports.BOOK_PREFIX}${id}`;
}
function memberCode(id) {
    return `${exports.MEMBER_PREFIX}${id}`;
}
function parseCode(text) {
    if (typeof text !== 'string')
        return null;
    const m = text.trim().match(/^pustaka:(book|member):(\d+)$/);
    if (!m)
        return null;
    return { type: m[1], id: Number(m[2]) };
}
async function qrPngBuffer(text) {
    return qrcode_1.default.toBuffer(text, { type: 'png', width: 400, margin: 1, errorCorrectionLevel: 'M' });
}
