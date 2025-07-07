import { Card } from "@repo/ui/card";

export const P2PTransactions = ({
  transactions,
  currentUserId,
}: {
  transactions: {
    timestamp: Date;
    amount: number;
    fromUserId: number;
    toUserId: number;
    fromUser: {
      name: string | null;
      number: string;
    };
    toUser: {
      name: string | null;
      number: string;
    };
  }[];
  currentUserId: number;
}) => {
  if (!transactions.length) {
    return (
      <Card title="Recent Transactions">
        <div className="text-center pb-8 pt-8">
          No recent transactions
        </div>
      </Card>
    );
  }

  return (
    <Card title="Recent Transactions">
      <div className="pt-2 space-y-4">
        {transactions.map((t, index) => {
          const isSent = t.fromUserId === currentUserId;
          const counterparty = isSent ? t.toUser : t.fromUser;
          const direction = isSent ? "Sent to" : "Received from";
          const amountPrefix = isSent ? "-" : "+";
          const amountColor = isSent ? "text-red-600" : "text-green-600";

          return (
            <div
              key={`${t.timestamp.toISOString()}-${t.amount}-${index}`}
              className="flex justify-between"
            >
              <div>
                <div className="text-sm">
                  {direction} {counterparty.name ?? counterparty.number}
                </div>
                <div className="text-slate-600 text-xs">
                  {t.timestamp.toDateString()}
                </div>
              </div>
              <div className={`flex flex-col justify-center text-right font-medium ${amountColor}`}>
                {amountPrefix} ₹{(t.amount / 100).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
