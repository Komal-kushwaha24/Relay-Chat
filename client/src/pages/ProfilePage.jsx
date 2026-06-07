import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import ParticleCanvas from "../components/effects/ParticleCanvas";
import TiltCard from "../components/effects/TiltCard";

import FloatInput from "../components/auth/FloatInput";
import AvatarZone from "../components/profile/AvatarZone";
import InfoRow from "../components/profile/InfoRow";
import { getCurrentUser, getCloudinarySignature, updateCurrentUser } from "../services/api";

export default function ProfilePage({ mode = "page", onClose, onProfileUpdated }) {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    profilePicture: null,
  });
  const [draft, setDraft] = useState({
    name: "",
    email: "",
  });
  const [preview, setPreview] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const isOverlay = mode !== "page";
  const isMobileOverlay = mode === "modal";

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const res = await getCurrentUser();
        const user = res.data?.user ?? res.data?.data ?? res.data ?? null;
        if (!mounted || !user) return;

        const profileData = {
          name: user.fullName || "",
          email: user.email || "",
          profilePicture: user.profilePicture || null,
        };

        setProfile(profileData);
        setDraft({ name: profileData.name, email: profileData.email });
        setPreview(profileData.profilePicture);
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const validate = () => {
    const e = {};
    if (!draft.name.trim()) e.name = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email || "")) e.email = "Enter a valid email";
    setErrors(e);
    return e;
  };

  const getCloudinaryUrl = async (file) => {
    const signatureResponse = await getCloudinarySignature();
    const data = signatureResponse.data?.data ?? signatureResponse.data;
    if (!data) throw new Error("Invalid Cloudinary signature response");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", data.apiKey);
    formData.append("timestamp", String(data.timestamp));
    formData.append("signature", data.signature);
    formData.append("folder", data.folder);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`;
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Cloudinary upload failed: ${uploadRes.status} ${errText}`);
    }

    const uploadData = await uploadRes.json();
    return uploadData.secure_url || uploadData.url;
  };

  const handleFile = (file) => {
    if (!file) return;
    setPendingFile(file);
    setPreview(URL.createObjectURL(file));
    if (!editing) setEditing(true);
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) return;

    setSaving(true);
    try {
      let profilePicture = profile.profilePicture;
      if (pendingFile) {
        profilePicture = await getCloudinaryUrl(pendingFile);
      }

      const payload = {
        fullName: draft.name,
        email: draft.email,
        profilePicture,
      };

      const res = await updateCurrentUser(payload);
      const updated = res.data?.user ?? res.data?.data ?? res.data ?? null;
      if (updated) {
        const updatedProfile = {
          name: updated.fullName || draft.name,
          email: updated.email,
          profilePicture: updated.profilePicture || profilePicture,
        };
        setProfile(updatedProfile);
        setDraft({ name: updatedProfile.name, email: updatedProfile.email });
        setPreview(updatedProfile.profilePicture);
        setPendingFile(null);
        if (onProfileUpdated) onProfileUpdated(updated);
      }
      setSaved(true);
    } catch (error) {
      console.error("Failed to save profile", error);
    } finally {
      setSaving(false);
      setEditing(false);
      setTimeout(() => setSaved(false), 2200);
    }
  };

  const handleCancel = () => {
    setDraft({ name: profile.name, email: profile.email });
    setPreview(profile.profilePicture);
    setPendingFile(null);
    setEditing(false);
    setErrors({});
  };

  const setField = (key) => (event) => {
    setDraft((prev) => ({ ...prev, [key]: event.target.value }));
  };

  return (
    <>
      {!isOverlay && (
        <>
          <style>{`body{background:#040c1a}*{box-sizing:border-box}`}</style>
          <ParticleCanvas />
        </>
      )}

      <AnimatePresence>
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28 }}
            style={{
              position: "fixed",
              top: 20,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 200,
              padding: "10px 16px",
              borderRadius: 12,
              background: "rgba(7,18,40,0.95)",
              color: "#e6f6ff",
            }}
          >
            Profile updated
          </motion.div>
        )}
      </AnimatePresence>

      {isOverlay && (
        <div
          onClick={onClose}
          style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.45)" }}
        />
      )}

      <div
        onClick={isOverlay ? onClose : undefined}
        style={{
          position: isOverlay ? "fixed" : "relative",
          inset: isOverlay ? 0 : undefined,
          zIndex: isOverlay ? 50 : undefined,
          display: isOverlay ? "flex" : undefined,
          justifyContent: isOverlay ? (isMobileOverlay ? "center" : "flex-end") : undefined,
          alignItems: isOverlay ? (isMobileOverlay ? "flex-start" : "stretch") : undefined,
          padding: isOverlay ? (isMobileOverlay ? 16 : 28) : undefined,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: isMobileOverlay ? "100%" : 420,
            maxHeight: "100%",
            overflowY: "auto",
            borderRadius: isMobileOverlay ? 20 : 28,
            background: "rgba(7,18,40,0.98)",
            padding: 20,
            margin: isOverlay && isMobileOverlay ? "8px 0" : undefined,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10 }}>Back</button>
            <div style={{ color: "#fff", fontWeight: 700 }}>{isMobileOverlay ? "Profile" : "Your profile"}</div>
            <div style={{ width: 36 }} />
          </div>

          <TiltCard>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <div style={{ padding: 20 }}>
                <AvatarZone
                  name={profile.name}
                  preview={preview || profile.profilePicture}
                  onFile={handleFile}
                />

                {loading ? (
                  <div style={{ color: "#94a3b8", textAlign: "center" }}>Loading profile...</div>
                ) : editing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <FloatInput label="Full Name" id="name" value={draft.name} onChange={setField("name")} error={errors.name} />
                    <FloatInput label="Email" id="email" value={draft.email} onChange={setField("email")} error={errors.email} />

                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={handleCancel} style={{ flex: 1 }}>Cancel</button>
                      <button onClick={handleSave} disabled={saving} style={{ flex: 2 }}>
                        {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <InfoRow label="Full Name" value={profile.name} />
                    <InfoRow label="Email Address" value={profile.email} />

                    {profile.profilePicture && (
                      <div style={{ color: "#94a3b8", fontSize: 12 }}>
                        {/* Current avatar is loaded from Cloudinary. */}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        setDraft({ name: profile.name, email: profile.email });
                        setEditing(true);
                      }}
                      style={{ marginTop: 8 }}
                    >
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </TiltCard>
        </div>
      </div>
    </>
  );
}
