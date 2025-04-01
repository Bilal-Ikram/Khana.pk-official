import React, { useState } from "react";
import { useAuth } from "./auth-context";
import { Login, Signup } from "./AuthForms";

const AuthModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("login"); // 'login' or 'signup'
  const { login } = useAuth();

  // Expose methods to global window object
  if (typeof window !== "undefined") {
    window.authModal = {
      showLogin: () => {
        setMode("login");
        setIsOpen(true);
      },
      showSignup: () => {
        setMode("signup");
        setIsOpen(true);
      },
      close: () => setIsOpen(false),
    };
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-lg max-w-md w-full shadow-xl">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center text-pink-500">
            {mode === "login" ? "Welcome Back!" : "Create an Account"}
          </h2>
          {mode === "login" ? (
            <Login
              onSuccess={(userData) => {
                login(userData);
                setIsOpen(false);
              }}
            />
          ) : (
            <Signup
              onSuccess={() => {
                setMode("login");
              }}
            />
          )}
        </div>
        <div className="text-center pb-6">
          {mode === "login" ? (
            <p className="text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-pink-500 hover:text-pink-600 font-medium"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-pink-500 hover:text-pink-600 font-medium"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;