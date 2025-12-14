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
  status: "Planned" | "Available" | "Sold";
}

export const mockLitters: Litter[] = [
  {
    id: "litter-1",
    name: "Litter 1",
    mother_id: "pug-2",
    father_id: "pug-1",
    birth_date: "2023-10-01",
    available_date: "2023-12-01",
    profile_picture_id: "img-litter-1",
    status: "Sold",
  },
  {
    id: "litter-2",
    name: "Litter 2",
    mother_id: "pug-3",
    father_name: "External Stud",
    birth_date: "2024-02-15",
    available_date: "2024-04-15",
    profile_picture_id: "img-litter-2",
    image_ids: "img-litter-2,img-pup-1,img-pup-2",
    status: "Available",
  },
  {
    id: "litter-3",
    name: "Litter 3",
    mother_id: "pug-2",
    father_id: "pug-1",
    birth_date: "2024-05-20",
    available_date: "2024-07-20",
    profile_picture_id: "img-litter-3",
    status: "Planned",
  },
];
