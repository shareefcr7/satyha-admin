"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/admin/categories");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) return <div style={{ background: "#0f0f13", height: "100vh" }} />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      if (password.length < 3) {
        throw new Error("Password must be at least 3 characters");
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Get API URL at runtime (not module load time)
      const apiUrl = typeof window !== 'undefined' 
        ? (process.env.NEXT_PUBLIC_API_URL || 'https://clear-glass-backend.vercel.app/api')
        : 'https://clear-glass-backend.vercel.app/api';

      console.log("Attempting login with:", { email: normalizedEmail, apiUrl });

      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      console.log("Response status:", res.status);

      if (!res.ok) {
        const data = await res.json();
        console.error("Login error response:", data);
        setError(data.error || "Login failed"); // Display error to the user
        throw new Error(data.error || "Login failed");
      }

      const data = await res.json();
      console.log("Login response:", { success: data.success, hasToken: !!data.token });

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", email);
        console.log("Token saved successfully, redirecting to admin panel");
        router.push("/admin/categories");
      } else {
        throw new Error("No token received from server");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      console.error("Login error:", errorMessage, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "#0f0f13",
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <div style={{
        background: "#13131a",
        padding: "40px",
        borderRadius: "12px",
        border: "1px solid #1e1e2e",
        width: "100%",
        maxWidth: "400px"
      }}>
        <h1 style={{ color: "#fff", marginBottom: "24px", fontFamily: "'Syne', sans-serif", fontSize: "24px", textAlign: "center" }}>
          Clear Glass Admin
        </h1>

        {error && (
          <div style={{ background: "#ef444420", color: "#ef4444", padding: "12px", borderRadius: "8px", marginBottom: "20px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", color: "#555570", fontSize: "12px", marginBottom: "6px" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                background: "#0f0f13",
                border: "1px solid #1e1e2e",
                borderRadius: "8px",
                color: "#e8e8f0",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", color: "#555570", fontSize: "12px", marginBottom: "6px" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                background: "#0f0f13",
                border: "1px solid #1e1e2e",
                borderRadius: "8px",
                color: "#e8e8f0",
                fontSize: "14px",
                outline: "none"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "14px",
              background: "var(--brand)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "10px",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}