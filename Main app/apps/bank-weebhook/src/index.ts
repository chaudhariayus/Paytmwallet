import express from "express";
import { prisma as db } from "@repo/db";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/bank-webhook", async (req, res) => {
  const paymentInformation: {
    token: string;
    userId: string;
    amount: number;
  } = {
    token: req.body.token,
    userId: req.body.userId,
    amount: req.body.amount,
  };

  console.log("Received payment:", paymentInformation);

  try {
    // Step 1: Fetch the transaction by token
    const transaction = await db.onRampTransaction.findUnique({
      where: {
        token: paymentInformation.token,
      },
    });

    // Step 2: Check if transaction exists and is still "Processing"
    if (!transaction || transaction.status !== "Processing") {
       res.status(400).json({
        message: "Invalid or already processed token",
      });
    }

    // Step 3: Process transaction in a DB transaction
    await db.$transaction([
      db.balance.updateMany({
        where: {
          userId: Number(paymentInformation.userId),
        },
        data: {
          amount: {
            increment: Number(paymentInformation.amount) * 100,
          },
        },
      }),
      db.onRampTransaction.updateMany({
        where: {
          token: paymentInformation.token,
        },
        data: {
          status: "Success",
        },
      }),
    ]);

     res.json({
      message: "Captured",
    });
  } catch (e) {
    console.error("Webhook error:", e);
     res.status(411).json({
      message: "Error while processing webhook",
    });
  }
});

app.listen(3003, () => {
  console.log("✅ Webhook server listening on http://localhost:3003");
});
