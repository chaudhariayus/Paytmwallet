"use server";

import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import axios from "axios";

type BankTokenResponse = {
  success: boolean;
  token?: string;
  message?: string;
  error?: string;
};

export async function createOnRampTransaction(provider: string, amount: number, bankurl: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user?.id) {
    return {
      message: "Unauthenticated request",
    };
  }

  try {
    const userId = String(session.user.id);

    
    const response = await axios.post<BankTokenResponse>(bankurl, {
      userId,
      amount,
      provider,
    });

    
    if (!response.data.success || !response.data.token) {
      throw new Error(response.data.error || "Token generation failed at bank");
    }

    const token = response.data.token;

    await prisma.onRampTransaction.create({
      data: {
        provider,
        status: "Processing",
        startTime: new Date(),
        token,
        userId: Number(userId),
        amount: Number(amount)*100 ,
      },
    });

    return {
        success : true,
      message: "Transaction created with token from bank",
      token,
    };
  } catch (error: any) {
    console.error("Error creating transaction:", error?.response?.data || error.message);
    return {
        success:false,
      message: "Failed to create transaction",
      error: error?.response?.data || error.message,
    };
  }
}
