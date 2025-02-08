import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getToken } from "../../utils/Auth";

// FETCH SETTINGS
// GET /api/settings
export const fetchSettings = async () => {};

// TOGGLE WAITLIST
// POST /api/settings/toggle-waitlist REQUIRES AUTH
export const toggleWaitlist = async () => {};

// TOGGLE LIVE
// POST /api/settings/toggle-live REQUIRES AUTH
export const toggleLive = async () => {};

// HOOK FOR SETTINGS
export const useSettings = () => {};
