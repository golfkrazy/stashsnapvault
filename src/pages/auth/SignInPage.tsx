import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSession } from "../../context/SessionContext";
import supabase from "../../supabase";
import { GoogleOAuthButton, AuthFeedback } from "../../components";
import { BrandHeader, BrandFooter } from "../../components/BrandComponents";

const SignInPage = () => {
  // ==============================
  // If user is already logged in, redirect to home
  // This logic is being repeated in SignIn and SignUp..
  const { session } = useSession();
  if (session) return <Navigate to="/" />;
  // maybe we can create a wrapper component for these pages
  // just like the ./router/AuthProtectedRoute.tsx? up to you.
  // ==============================
  // ==============================
  const [status, setStatus] = useState("");
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });

  // ==============================
  // Per-Email Rate Limiting Logic
  // ==============================
  const [lockedOut, setLockedOut] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Check lockout status whenever email changes
  useEffect(() => {
    const email = formValues.email.trim().toLowerCase();
    if (!email) {
      setLockedOut(false);
      return;
    }

    const lockoutKey = `auth_lockout_until_${email}`;
    const lockoutStr = localStorage.getItem(lockoutKey);

    if (lockoutStr) {
      const lockoutTime = parseInt(lockoutStr, 10);
      if (Date.now() < lockoutTime) {
        setLockedOut(true);
        const minsLeft = Math.ceil((lockoutTime - Date.now()) / 60000);
        setStatus(`This account is locked for ${minsLeft} more minutes.`);
      } else {
        setLockedOut(false);
        localStorage.removeItem(lockoutKey);
        localStorage.removeItem(`auth_attempts_${email}`);
        setStatus("");
      }
    } else {
      setLockedOut(false);
    }
  }, [formValues.email]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = formValues.email.trim().toLowerCase();

    // 1. Check if locked out for THIS email
    const lockoutKey = `auth_lockout_until_${email}`;
    const lockoutStr = localStorage.getItem(lockoutKey);
    if (lockoutStr && Date.now() < parseInt(lockoutStr, 10)) {
      const minsRef = Math.ceil((parseInt(lockoutStr, 10) - Date.now()) / 60000);
      setStatus(`Account locked. Try again in ${minsRef} minutes.`);
      return;
    }

    setStatus("Logging in...");

    // 2. Attempt Login
    const { error } = await supabase.auth.signInWithPassword({
      email: formValues.email,
      password: formValues.password,
    });

    if (error) {
      // 3. Handle Failure & Increment Attempts for THIS email
      const attemptsKey = `auth_attempts_${email}`;
      const currentAttempts = parseInt(localStorage.getItem(attemptsKey) || "0", 10) + 1;
      localStorage.setItem(attemptsKey, currentAttempts.toString());

      if (currentAttempts >= 3) {
        const lockoutTime = Date.now() + 15 * 60 * 1000; // 15 minutes
        localStorage.setItem(lockoutKey, lockoutTime.toString());
        setLockedOut(true);
        setStatus("Maximum attempts reached. Access suspended for 15 minutes.");
      } else {
        setStatus(`Invalid credentials. Attempt ${currentAttempts}/3.`);
        if (currentAttempts === 2) {
          setStatus("One more failed attempt will lock your account for 15 minutes.");
        }
      }
    }
    // On success, SessionContext handles redirect
  };
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <BrandHeader />
      <form className="main-container" onSubmit={handleSubmit} style={{ flex: 1, margin: '2rem auto' }}>
        <h1 className="header-text">Sign In</h1>
        <GoogleOAuthButton />
        <div className="auth-divider">
          <span>OR</span>
        </div>
        <input
          name="email"
          onChange={handleInputChange}
          type="email"
          placeholder="Email"
          value={formValues.email}
        />
        <div className="password-container">
          <input
            name="password"
            onChange={handleInputChange}
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            disabled={lockedOut}
            value={formValues.password}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        <button type="submit" disabled={lockedOut}>
          {lockedOut ? "Locked Out" : "Login"}
        </button>

        {/* Branded Status/Error Feedback */}
        <AuthFeedback
          type={lockedOut ? 'error' : (status.includes('Invalid') || status.includes('Warning')) ? 'warning' : 'info'}
          message={status}
          onClear={() => setStatus('')}
        />

        <hr style={{ width: "100%", margin: "20px 0", opacity: 0.2 }} />

        <div style={{ textAlign: "center" }}>
          <p style={{ marginBottom: "5px", fontSize: "0.9em" }}>New to StashSnap?</p>
          <Link className="auth-link" to="/auth/sign-up" style={{ fontSize: "1.1em", textDecoration: "underline" }}>
            Create an Account
          </Link>
        </div>
      </form>
      <BrandFooter />
    </main>
  );
};

export default SignInPage;
