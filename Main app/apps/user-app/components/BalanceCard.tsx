import { Card } from "@repo/ui/card";

export const BalanceCard = ({
  amount,
  locked,
}: {
  amount: number;
  locked: number;
}) => {
  // Ensure consistent floating point rendering
  const formattedAmount = (amount / 100).toFixed(2);
  const formattedLocked = (locked / 100).toFixed(2);
  const formattedTotal = ((amount + locked) / 100).toFixed(2);

  return (
    <Card title="Balance">
      <div className="flex justify-between border-b border-slate-300 pb-2">
        <div>Unlocked Balance</div>
        <div>{formattedAmount} INR</div>
      </div>
      <div className="flex justify-between border-b border-slate-300 py-2">
        <div>Total Locked Balance</div>
        <div>{formattedLocked} INR</div>
      </div>
      <div className="flex justify-between border-b border-slate-300 py-2">
        <div>Total Balance</div>
        <div>{formattedTotal} INR</div>
      </div>
    </Card>
  );
};
