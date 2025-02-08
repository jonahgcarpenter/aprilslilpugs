import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getToken } from "../../utils/Auth";

// FETCH LITTERS
// GET /api/litters
export const fetchLitters = async () => {}:

// FETCH A LITTER
// GET /api/litters/:litterId
export const fetchLitter = async () => {}:

// CREATE LITTER
// POST /api/litters REQUIRES AUTH
export const createLitter = async () => {}:

// UPDATE LITTER
// PATCH /api/litters/:litterId REQUIRES AUTH
export const updateLitter = async () => {}:

// DELETE LITTER
// DELETE /api/litters/:litterId REQUIRES AUTH
export const deleteLitter = async () => {}:

// ADD PUPPIES
// POST /api/litters/:litterId/puppies REQUIRES AUTH
export const addPuppies = async () => {}:

// UPDATE PUPPY
// PATCH /api/litters/:litterId/puppies/:puppyId REQUIRES AUTH
export const updatePuppy = async () => {}:

// DELETE PUPPY
// DELETE /api/litters/:litterId/puppies/:puppyId REQUIRES AUTH
export const deletePuppy = async () => {}:

// HOOK FOR LITTERS
export const useLitter = () => {};
