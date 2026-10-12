import { ArrowLeft, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { forgotPassword, resetPassword } from "../services/api";

/*
  Reset password with an OTP, all on one page:
    step "email" -> user types their email and presses "Send OTP"
    step "otp"   -> user types the 6-digit OTP from the email + a new password
    step "done"  -> success message, then redirect to the login page
*/
function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0); // seconds until "Resend OTP" is allowed

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const sendOtp = async (event) => {
    if (event) event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setStep("otp");
      setCooldown(60);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const submitReset = async (event) => {
    event.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("The two passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, otp, newPassword: password });
      setStep("done");
      window.setTimeout(() => navigate("/login"), 2500);
    } catch (e) {
      setError(e.message || "Could not reset the password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const errorBox = error && (
    <p role="alert" style={{ color: "#dc2626", fontSize: "0.9rem", margin: "0 0 12px" }}>
      {error}
    </p>
  );

  return (
    <div className="auth-page">
      <Navbar />

      <main className="auth-main">
        <section className="auth-card">
          <Link to="/login" className="auth-back">
            <ArrowLeft size={15} />
            Back to Login
          </Link>

          <div className="auth-icon">
            <KeyRound size={22} />
          </div>

          <span className="auth-eyebrow">FORGOT PASSWORD</span>

          <h1>Reset Password</h1>

          {step === "email" && (
            <>
              <p>Enter your email to receive a 6-digit OTP.</p>

              <form onSubmit={sendOtp}>
                <label>
                  Email
                  <input
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>

                {errorBox}

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </form>
            </>
          )}

          {step === "otp" && (
            <>
              <p>
                If an account exists for <strong>{email}</strong>, we sent a 6-digit OTP
                to it. It is valid for 10 minutes. Check your spam folder too.
              </p>

              <form onSubmit={submitReset}>
                <label>
                  OTP
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="6-digit code"
                    required
                    maxLength={6}
                    pattern="\d{6}"
                    title="Enter the 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                </label>

                <label>
                  New password
                  <input
                    type="password"
                    placeholder="Enter a new password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>

                <label>
                  Confirm new password
                  <input
                    type="password"
                    placeholder="Repeat the new password"
                    required
                    minLength={8}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </label>

                <small style={{ display: "block", margin: "-4px 0 12px", opacity: 0.7 }}>
                  At least 8 characters, with a letter and a number.
                </small>

                {errorBox}

                <button type="submit" className="auth-submit" disabled={loading}>
                  {loading ? "Saving..." : "Reset Password"}
                </button>
              </form>

              <div className="auth-switch">
                Did not get a code?
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={cooldown > 0 || loading}
                  style={{ background: "none", border: "none", cursor: cooldown > 0 ? "default" : "pointer", color: "inherit", font: "inherit", fontWeight: 600, marginLeft: 6 }}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                </button>
              </div>
            </>
          )}

          {step === "done" && (
            <div role="status">
              <p style={{ fontWeight: 600 }}>Password updated.</p>
              <p>Taking you to the login page...</p>
              <Link to="/login">Log in now</Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ForgotPassword;
