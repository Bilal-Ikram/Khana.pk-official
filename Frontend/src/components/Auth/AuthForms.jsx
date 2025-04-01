import React, { useState } from "react";
import { useAuth } from "./auth-context";

export const Login = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (!navigator.onLine) {
        setError("No internet connection. Please check your network.");
      } else {
        setError("Connection error. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email address"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
      >
        Sign in
      </button>
      <div className="text-center">
        <a href="#" className="text-pink-500 hover:text-pink-600">
          Forgot password?
        </a>
      </div>
    </form>
  );
};

export const Signup = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: ""
    }
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    // Validate password strength
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...signupData } = formData;
      
      const response = await fetch("http://localhost:3001/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });
      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Full name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
        <input
          type="email"
          name="email"
          placeholder="Email address"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm password"
          required
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone number"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
        <div className="space-y-2">
          <p className="text-sm text-gray-600 font-medium">Address</p>
          <input
            type="text"
            name="street"
            placeholder="Street address"
            required
            value={formData.address.street}
            onChange={(e) => setFormData({ 
              ...formData, 
              address: { ...formData.address, street: e.target.value } 
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            required
            value={formData.address.city}
            onChange={(e) => setFormData({ 
              ...formData, 
              address: { ...formData.address, city: e.target.value } 
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <input
            type="text"
            name="state"
            placeholder="State/Province"
            required
            value={formData.address.state}
            onChange={(e) => setFormData({ 
              ...formData, 
              address: { ...formData.address, state: e.target.value } 
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <input
            type="text"
            name="zipCode"
            placeholder="Zip/Postal code"
            required
            value={formData.address.zipCode}
            onChange={(e) => setFormData({ 
              ...formData, 
              address: { ...formData.address, zipCode: e.target.value } 
            })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-pink-500 text-white py-3 px-4 rounded-lg hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
      >
        Sign up
      </button>
    </form>
  );
};