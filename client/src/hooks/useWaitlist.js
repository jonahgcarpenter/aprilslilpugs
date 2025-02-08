import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getToken } from "../../utils/Auth";

// POST WAITLIST
// POST /api/waitlist
export const postWaitlist = async () => {};

// GET WAITLIST
// GET /api/waitlist REQUIRES AUTH
export const fetchWaitlist = async () => {};

// UPDATE WAITLIST
// PATCH /api/waitlist/:id REQUIRES AUTH
export const updateWaitlist = async () => {};

// DELETE WAITLIST
// DELETE /api/waitlist/:id REQUIRES AUTH
export const deleteWaitlist = async () => {};

// HOOK FOR WAITLIST
export const useWaitlist = () => {};
