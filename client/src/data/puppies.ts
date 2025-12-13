export interface Puppy {
  id: string;
  litter_id: string;
  name: string;
  color: string;
  gender: "M" | "F";
  status: "A" | "R" | "S";
  profile_picture: string;
  image_ids?: string;
  description?: string;
}

export const mockPuppies: Puppy[] = [
  {
    id: "pup-001-thor",
    litter_id: "litter-002-superheroes",
    name: "Thor",
    color: "Fawn",
    gender: "M",
    status: "A",
    profile_picture: "img-pup-thor",
    description:
      "The biggest of the bunch. Very brave and loves to explore new toys.",
  },
  {
    id: "pup-002-hulk",
    litter_id: "litter-002-superheroes",
    name: "Hulk",
    color: "Fawn",
    gender: "M",
    status: "A",
    profile_picture: "img-pup-hulk",
    description:
      "Don't let the name fool you, he's a gentle giant who loves cuddles.",
  },
  {
    id: "pup-003-widow",
    litter_id: "litter-002-superheroes",
    name: "Black Widow",
    color: "Black",
    gender: "F",
    status: "R",
    profile_picture: "img-pup-widow",
    description:
      "Sleek, fast, and incredibly smart. She's already learning to sit!",
  },
];
