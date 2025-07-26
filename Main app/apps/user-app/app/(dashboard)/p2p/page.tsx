import { SendCard } from "../../../components/SendCard";
import { BalanceCard } from "../../../components/BalanceCard";
import { P2PTransactions } from "../../../components/p2ptxn";
import { prisma } from "@repo/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

async function getBalance(userId: number) {
  const balance = await prisma.balance.findFirst({
    where: { userId },
  });

  return {
    amount: balance?.amount || 0,
    locked: balance?.locked || 0,
  };
}

async function getTransactions(userId: number) {
  const transactions = await prisma.p2pTransfer.findMany({
    where: {
      OR: [{ fromUserId: userId }, { toUserId: userId }],
    },
    orderBy: {
      timestamp: "desc",
    },
    include: {
      fromUser: { select: { name: true, number: true } },
      toUser: { select: { name: true, number: true } },
    },
  });

  return transactions;
}

export default async function Page() {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);
  if (!userId) return <div>User not logged in</div>;

  const balance = await getBalance(userId);
  const transactions = await getTransactions(userId);

  return (
    <div className="w-screen">
      <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold text-center">
        Peer to Peer Transfer
      </div>

    
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
        <div>
          <SendCard />
        </div>

        <div>
          <BalanceCard amount={balance.amount} locked={balance.locked} />
          <div className="pt-4">
            <P2PTransactions transactions={transactions} currentUserId={userId} />
          </div>
        </div>
      </div>
    </div>
  );
}
