export interface Puppy {
  id: string;
  litter_id: string;
  name: string;
  color: string;
  gender: "Male" | "Female";
  status: "Available" | "Reserved" | "Sold";
  profile_picture: string;
  image_ids?: string;
  description?: string;
}

export const mockPuppies: Puppy[] = [
  {
    id: "pup-1",
    litter_id: "litter-2",
    name: "Puppy 1",
    color: "Fawn",
    gender: "Male",
    status: "Available",
    profile_picture: "img-pup-1",
    description:
      "Generic description for Puppy 1. He is the biggest of the bunch, very brave, and loves to explore new toys.",
  },
  {
    id: "pup-2",
    litter_id: "litter-2",
    name: "Puppy 2",
    color: "Fawn",
    gender: "Male",
    status: "Available",
    profile_picture: "img-pup-2",
    description:
      "Generic description for Puppy 2. A gentle giant who loves cuddles and playing with his siblings.",
  },
  {
    id: "pup-3",
    litter_id: "litter-2",
    name: "Puppy 3",
    color: "Black",
    gender: "Female",
    status: "Reserved",
    profile_picture: "img-pup-3",
    description:
      "Generic description for Puppy 3. She is sleek, fast, and incredibly smart.",
  },
];
