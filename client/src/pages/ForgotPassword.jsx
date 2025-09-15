import React, { useState } from "react";

function ForgotPassword(){
    const [ email, setEmail] = useState("");
    const [msg, setMsg] = useState("");

    async function handleSubmit(e){
        e.preventDefault();
        const res = await fetch(
          "http://localhost:5000/api/auth/forgot-password",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          }
        );
        const data = await res.json();
        setMsg(data.message);
    }

    return (
      <form
        onSubmit={handleSubmit}
        className="space-y-6 max-w-md mx-auto mt-24 p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-lg"
      >
        <h2 className="text-center text-2xl font-semibold text-green-900 mb-4">
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-green-400 focus:border-green-700 rounded-md p-3 text-green-900 placeholder-green-600 transition-colors duration-300 shadow-sm focus:shadow-md"
        />

        <button
          type="submit"
          className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-md font-medium shadow-md transition-colors duration-300"
        >
          Send Reset Link
        </button>

        {msg && (
          <p className="text-center mt-3 text-green-800 font-semibold select-none">
            {msg}
          </p>
        )}
      </form>
    );
}

export default ForgotPassword;