import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import AuthBackground from "../components/layout/AuthBackground.jsx";
import SignupForm from "../components/auth/SignupForm.jsx";
import SuccessCard from "../components/auth/SuccessCard.jsx";

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