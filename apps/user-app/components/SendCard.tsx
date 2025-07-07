"use client";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/TextInput";
import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { p2pTransfer } from "../app/lib/actions/p2pTransfer";

export function SendCard() {
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const router = useRouter(); 

  return (
    <div>
      <Card title="Send">
        <div className="w-full">
          <TextInput
            placeholder="Number"
            label="Number"
            onChange={(value) => setNumber(value)}
          />
          <TextInput
            placeholder="Amount"
            label="Amount"
            onChange={(value) => setAmount(value)}
          />
          <div className="pt-4 flex justify-center">
            <Button
              onClick={async () => {
                await p2pTransfer(number, Number(amount) * 100);
                router.refresh();
              }}
            >
              Send
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
