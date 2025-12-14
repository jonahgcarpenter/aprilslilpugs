export interface Pug {
  id: string;
  name: string;
  gender: "Male" | "Female";
  description?: string;
  profile_picture_id: string;
  image_ids?: string;
  birth_date: string;
}

export const mockPugs: Pug[] = [
  {
    id: "pug-1",
    name: "Pug 1",
    gender: "Male",
    description:
      "Generic description for Pug 1. He is the main stud with a classic fawn coat and a temperament that is both calm and playful.",
    profile_picture_id: "img-pug-1",
    image_ids: "img-pug-1",
    birth_date: "2019-05-15",
  },
  {
    id: "pug-2",
    name: "Pug 2",
    gender: "Female",
    description:
      "Generic description for Pug 2. She is an attentive and gentle mother who passes lovely traits to her puppies.",
    profile_picture_id: "img-pug-2",
    image_ids: "img-pug-2",
    birth_date: "2020-11-20",
  },
  {
    id: "pug-3",
    name: "Pug 3",
    gender: "Female",
    description:
      "Generic description for Pug 3. She is full of energy, spunk, and has a very big personality.",
    profile_picture_id: "img-pug-3",
    image_ids: "img-pug-3",
    birth_date: "2021-03-10",
  },
];
