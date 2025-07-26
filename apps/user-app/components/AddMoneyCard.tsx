"use client"
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Select } from "@repo/ui/Select";
import { useState } from "react";
import { TextInput } from "@repo/ui/TextInput";
import { createOnRampTransaction } from "../app/lib/actions/createOnRamptxn";
import { useRouter } from "next/navigation";


const SUPPORTED_BANKS = [{
    name: "HDFC Bank",
    bankurl: "https://localhost:3005/requesttoken",
    redirectUrl: "http://netbanking.hdfcbank.com"
}, {
    name: "Axis Bank",
    bankurl: "http://localhost:3005/requesttoken",
    redirectUrl: "https://www.axisbank.com/"
}, {
    name: "Dummy Bank",
    bankurl: "http://localhost:3005/requesttoken",
    redirectUrl: "http://localhost:3001"
}];

export const AddMoney = () => {
    const router = useRouter();
    const [redirectUrl, setRedirectUrl] = useState(SUPPORTED_BANKS[0]?.redirectUrl);
    const [provider, setProvider] = useState(SUPPORTED_BANKS[0]?.name || "");
    const [bankurl, setBankurl] = useState(SUPPORTED_BANKS[0]?.bankurl || "")
    const [value, setValue] = useState(0)
    return <Card title="Add Money">
        <div className="w-full">
            <TextInput label={"Amount"} placeholder={"Amount"} onChange={(val) => {
                setValue(Number(val))
            }} />
            <div className="py-4 text-left">
                Bank
            </div>
            <Select
                onSelect={(value) => {
                    const selectedBank = SUPPORTED_BANKS.find(x => x.name === value);
                    setRedirectUrl(selectedBank?.redirectUrl || "");
                    setProvider(selectedBank?.name || "");
                    setBankurl(selectedBank?.bankurl || "");
                }}
                options={SUPPORTED_BANKS.map(x => ({
                    key: x.name,
                    value: x.name
                }))}
            />

            <div className="flex justify-center pt-4">
                <Button onClick={async () => {
                   const res = await createOnRampTransaction(provider, value,bankurl);
                  
                   if(!res.success){
                    alert("Try again after sometime");
                    router.refresh();
                    return ;
                   }
                   const {token} = res;
                   window.location.href = `${redirectUrl}?token=${token}` || "";
                }}>
                    Add Money
                </Button>
            </div>
        </div>
    </Card>
}