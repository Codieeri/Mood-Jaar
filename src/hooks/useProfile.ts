import { useCallback, useEffect, useState } from "react";
import { EMPTY_PROFILE, type Profile } from "../types";

const STORAGE_KEY = "moodjaar.profile.v1";

function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PROFILE;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return { ...EMPTY_PROFILE, ...parsed };
    }
  } catch {
    /* ignore */
  }
  return EMPTY_PROFILE;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(() => loadProfile());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      /* ignore */
    }
  }, [profile]);

  const save = useCallback((p: Profile) => setProfile(p), []);
  const clear = useCallback(() => setProfile(EMPTY_PROFILE), []);

  return { profile, save, clear };
}
