export interface Litter {
  id: string;
  name: string;
  mother_id?: string;
  mother_name?: string;
  father_id?: string;
  father_name?: string;
  birth_date: string;
  available_date: string;
  profile_picture_id: string;
  image_ids?: string;
  status: "P" | "B" | "A" | "S";
}

export const mockLitters: Litter[] = [
  {
    id: "litter-001-breakfast",
    name: "The Breakfast Club",
    mother_id: "pug-002-luna",
    father_id: "pug-001-otis",
    birth_date: "2023-10-01",
    available_date: "2023-12-01",
    profile_picture_id: "img-litter-breakfast",
    status: "S",
  },
  {
    id: "litter-002-superheroes",
    name: "The Superheroes",
    mother_id: "pug-003-daisy",
    father_name: "Rocky (External Stud)",
    birth_date: "2024-02-15",
    available_date: "2024-04-15",
    profile_picture_id: "img-litter-super",
    image_ids: "img-litter-super,img-pup-thor,img-pup-hulk",
    status: "A",
  },
];
