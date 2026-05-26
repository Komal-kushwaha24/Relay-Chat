import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import AuthBackground from "../components/layout/AuthBackground";
import SignupForm from "../components/auth/SignupForm";
import SuccessCard from "../components/auth/SuccessCard";

export default function Register() {
  const [done, setDone] = useState(false);

  return (
    <AuthBackground>
      <AnimatePresence mode="wait">
        {done ? (
          <SuccessCard />
        ) : (
          <SignupForm
            onSuccess={() => setDone(true)}
          />
        )}
      </AnimatePresence>
    </AuthBackground>
  );
}