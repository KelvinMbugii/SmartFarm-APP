import React, { useState } from "react";
import { useParams } from "react-router-dom";

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) return setMsg("Passwords do not match");

    const res = await fetch(`/api/auth/reset-password/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setMsg(data.message || data.error);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto mt-20">
      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full border p-2 rounded"
      />
      <input
        type="password"
        placeholder="Confirm password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        className="w-full border p-2 rounded"
      />
      <button
        type="submit"
        className="w-full bg-agricultural-600 text-white py-2 rounded"
      >
        Reset Password
      </button>
      {msg && <p className="text-center mt-2">{msg}</p>}
    </form>
  );
}

export default ResetPassword;
