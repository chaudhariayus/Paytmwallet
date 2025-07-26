"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const axios_1 = __importDefault(require("axios"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const SECRET = process.env.TXN_SECRET || "mysecret";
const BANK_WEBHOOK_URL = "http://localhost:3003/bank-webhook";
const TokenRequestSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1, "userId is required"),
    amount: zod_1.z.number().positive("Amount must be positive"),
    provider: zod_1.z.string().optional(),
});
const TokenVerifySchema = zod_1.z.object({
    token: zod_1.z.string().min(1, "Token is required"),
});
function generateJWT(userId, amount) {
    const payload = { userId, amount };
    return jsonwebtoken_1.default.sign(payload, SECRET);
}
app.post("/requesttoken", (req, res) => {
    const parsed = TokenRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({
            success: false,
            error: "Invalid request body",
            issues: parsed.error.errors,
        });
    }
    else {
        const { userId, amount } = req.body;
        const token = generateJWT(userId, amount);
        res.status(200).json({
            success: true,
            token,
            message: "JWT transaction token generated",
        });
    }
});
app.post("/initiatetransaction", async (req, res) => {
    const parsed = TokenVerifySchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({
            success: false,
            error: "Invalid token payload",
            issues: parsed.error.errors,
        });
    }
    else {
        const { token } = req.body;
        try {
            const decoded = jsonwebtoken_1.default.verify(token, SECRET);
            await axios_1.default.post(BANK_WEBHOOK_URL, {
                token,
                userId: decoded.userId,
                amount: decoded.amount,
            }).catch((err) => {
                console.error("Webhook request failed:", err.message);
            });
            res.status(200).json({
                success: true,
                message: "Transaction initiated",
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                error: "Invalid or expired token",
            });
        }
    }
});
app.listen(3005, () => {
    console.log(" Bank server listening on http://localhost:3005");
});
