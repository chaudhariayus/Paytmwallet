"use server"
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import {prisma }from "@repo/db";

export async function p2pTransfer(to: string, amount: number) {
    const session = await getServerSession(authOptions);
    const from = session?.user?.id;

    if (!from) {
        return {
            message: "Error while sending"
        };
    }

    const toUser = await prisma.user.findFirst({
        where: {
            number: to
        }
    });

    if (!toUser) {
        return {
            message: "User not found"
        };
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Sort user IDs to avoid deadlock
            const userIds = [Number(from), toUser.id].sort((a, b) => a - b);

            // Lock both sender and receiver rows in consistent order
            await tx.$queryRawUnsafe(
                `SELECT * FROM "Balance" WHERE "userId" IN (${userIds.join(",")}) FOR UPDATE`
            );

            // Check sender balance
            const fromBalance = await tx.balance.findUnique({
                where: { userId: Number(from) }
            });

            if (!fromBalance || fromBalance.amount < amount) {
                throw new Error('Insufficient funds');
            }

            // Deduct from sender
            await tx.balance.update({
                where: { userId: Number(from) },
                data: { amount: { decrement: amount } }
            });

            // Add to receiver
            await tx.balance.update({
                where: { userId: toUser.id },
                data: { amount: { increment: amount } }
            });

            // Log the transfer
            await tx.p2pTransfer.create({
                data: {
                    fromUserId: Number(from),
                    toUserId: toUser.id,
                    amount,
                    timestamp: new Date()
                }
            });
        });

        return { message: "Transfer successful" };
    } catch (error: any) {
        console.error("P2P transfer error:", error);
        return {
            message: error.message || "Transfer failed"
        };
    }
}