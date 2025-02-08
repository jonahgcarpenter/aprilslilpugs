import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getToken } from "../../utils/Auth";

// FETCH GRUMBLES
// GET /api/grumble
export const fetchGrumbles = async () => {};

// FETCH A GRUMBLE
// GET /api/grumble/:id
export const fetchGrumble = async () => {};

// CREATE GRUMBLE
// POST /api/grumble REQUIRES AUTH
export const createGrumble = async () => {};

// UPDATE GRUMBLE
// PATCH /api/grumble/:id REQUIRES AUTH
export const updateGrumble = async () => {};

// DELETE GRUMBLE
// DELETE /api/grumble/:id REQUIRES AUTH
export const deleteGrumble = async () => {};

// HOOK FOR GRUMBLES
export const useGrumble = () => {};
