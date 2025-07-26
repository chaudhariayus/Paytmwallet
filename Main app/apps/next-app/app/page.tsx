"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState("Enter netbanking details to continue...");

  useEffect(() => {
    // This runs only in the browser
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    setToken(tokenParam);
  }, []);

  const handlePay = async () => {
    if (!token) {
      setStatus("❌ Token missing in URL");
      return;
    }

    setStatus("🔁 Initiating transaction...");

    try {
      await axios.post("http://localhost:3005/initiatetransaction", {
        token,
      });

      setStatus("✅ Payment initiated! Redirecting...");
      setTimeout(() => {
        window.location.href = "http://localhost:3000/transfer";
      }, 3000);
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to initiate transaction.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Dummy NetBanking</h1>

      <div className="border p-6 rounded-md w-[300px] text-center space-y-4">
        <p>You're about to authorize payment</p>
        <p className="text-sm text-gray-600 break-all">Token: {token || "loading..."}</p>
        <button
          onClick={handlePay}
          disabled={!token}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Pay Now
        </button>
        <p className="text-gray-700 mt-4">{status}</p>
      </div>
    </div>
  );
}
