import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import axios from "axios";
import cors from "cors";



const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.TXN_SECRET || "mysecret";
const BANK_WEBHOOK_URL = "http://localhost:3003/bank-webhook";

const TokenRequestSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  amount: z.number().positive("Amount must be positive"),
  provider: z.string().optional(),
});

const TokenVerifySchema = z.object({
  token: z.string().min(1, "Token is required"),
});

function generateJWT(userId: string, amount: number): string {
  const payload = { userId, amount };
  return jwt.sign(payload, SECRET);
}

app.post("/requesttoken", (req: Request, res: Response) => {
  const parsed = TokenRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: "Invalid request body",
      issues: parsed.error.errors,
    });
  } else {
    const { userId, amount } = req.body;
    const token = generateJWT(userId, amount);

    res.status(200).json({
      success: true,
      token,
      message: "JWT transaction token generated",
    });
  }
});

app.post("/initiatetransaction", async (req: Request, res: Response) => {
  const parsed = TokenVerifySchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: "Invalid token payload",
      issues: parsed.error.errors,
    });
  } else {
    const { token } = req.body;

    try {
      const decoded = jwt.verify(token, SECRET) as {
        userId: string;
        amount: number;
      };

    
     await axios.post(BANK_WEBHOOK_URL, {
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
    } catch (error) {
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

