import { useState } from "react";
import { useRouter } from "next/router";
import { LoginForm } from "./LoginForm";

export const LoginPage = () => {
  const router = useRouter();

  const handleSubmit = async (email: string, password: string) => {
    // Call an API to authenticate the user
    const res = await fetch("/api/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      // Redirect the user to the home page
      router.push("/");
    } else {
      // Display an error message
      console.error("Failed to log in");
    }
  };

  return (
    <div>
      <h1>Log In</h1>
      <LoginForm onSubmit={handleSubmit} />
    </div>
  );
};
