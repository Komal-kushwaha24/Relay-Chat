import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import ParticleCanvas from "../components/effects/ParticleCanvas";
import TiltCard from "../components/effects/TiltCard";

import FloatInput from "../components/auth/FloatInput";
import AvatarZone from "../components/profile/AvatarZone";
import InfoRow from "../components/profile/InfoRow";
import { getCurrentUser, updateCurrentUser } from "../services/api";

export default function ProfilePage({ mode = "page", onClose, onProfileUpdated }) {
  const [profile, setProfile] = useState({
    name: "Komal Kushwaha",
    email: "komal@relaychat.app",
  });

  const [draft, setDraft] = useState({ ...profile });
  const [preview, setPreview] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isOverlay = mode !== "page";
  const isMobileOverlay = mode === "modal";

  const handleFile = (file) => {
    setPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e = {};
    if (!draft.name || !draft.name.trim()) e.name = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email || "")) e.email = "Enter a valid email";
    return e;
  };

  const handleSave = () => {
    const e = validate();
    if (Object.keys(e).length) return;
    setSaving(true);
    (async () => {
      try {
        const payload = { fullName: draft.name, email: draft.email };
        const res = await updateCurrentUser(payload);
        const updated = res.data?.user ?? res.data?.data ?? res.data ?? null;
        if (updated) {
          setProfile({ name: updated.fullName || updated.full_name || draft.name, email: updated.email });
          if (onProfileUpdated) onProfileUpdated(updated);
        }
        setSaved(true);
      } catch (err) {
        console.error('Failed to update profile', err);
      } finally {
        setSaving(false);
        setEditing(false);
        setTimeout(() => setSaved(false), 2200);
      }
    })();
  };

  const handleCancel = () => {
    setDraft({ ...profile });
    setPreview(null);
    setEditing(false);
  };

  const setField = (key) => (e) => setDraft((p) => ({ ...p, [key]: e.target.value }));

  useEffect(() => {
    const handler = (e) => {
      const user = e?.detail;
      if (!user) return;
      const name = user.fullName || user.full_name || user.name || profile.name;
      const email = user.email || profile.email;
      setProfile({ name, email });
      setDraft({ name, email });
    };

    window.addEventListener('relay:userLoaded', handler);
    return () => window.removeEventListener('relay:userLoaded', handler);
  }, []);

  return (
    <>
      {!isOverlay && (
        <>
          <style>{`body{background:#040c1a}*{box-sizing:border-box}`}</style>
          <ParticleCanvas />
        </>
      )}

      {/* load current user when mounted */}
      {/** fetch current user data on mount */}
      <ProfileLoader/>

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
                <AvatarZone name={profile.name} preview={preview} onFile={handleFile} />

                {editing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <FloatInput label="Full Name" id="name" value={draft.name} onChange={setField("name")} />
                    <FloatInput label="Email" id="email" value={draft.email} onChange={setField("email")} />

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

                    <button onClick={() => { setDraft({ ...profile }); setEditing(true); }} style={{ marginTop: 8 }}>
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

function ProfileLoader(){
  // lightweight component to fetch current user and populate ProfilePage via DOM-less approach
  // This avoids restructuring the main component; instead we trigger a custom event with the user data.
  useEffect(()=>{
    let mounted=true;
    (async()=>{
      try{
        const res = await getCurrentUser();
        if(!mounted) return;
        const user = res.data?.user ?? res.data?.data ?? res.data ?? null;
        // dispatch a window event with user payload
        window.dispatchEvent(new CustomEvent('relay:userLoaded',{detail:user}));
      }catch(e){
        console.error('Failed to load current user in ProfileLoader',e);
      }
    })();
    return ()=>{ mounted=false };
  },[]);
  return null;
}
