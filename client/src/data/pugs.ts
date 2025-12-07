export interface Pug {
  id: string;
  name: string;
  gender: "M" | "F";
  description?: string;
  profile_picture_id: string;
  image_ids?: string;
  birth_date: string;
}

export const mockPugs: Pug[] = [
  {
    id: "pug-001-otis",
    name: "Otis",
    gender: "M",
    description:
      "Our main stud and the king of the house. Otis has a classic fawn coat and a temperament that is both calm and playful. He loves cheese and belly scratches.",
    profile_picture_id: "img-otis-main",
    image_ids: "img-otis-main",
    birth_date: "2019-05-15",
  },
  {
    id: "pug-002-luna",
    name: "Luna",
    gender: "F",
    description:
      "Luna is the sweetest mother we've ever had. She is attentive, gentle, and passes her lovely black mask traits to her puppies.",
    profile_picture_id: "img-luna-main",
    image_ids: "img-luna-main",
    birth_date: "2020-11-20",
  },
  {
    id: "pug-003-daisy",
    name: "Daisy",
    gender: "F",
    description:
      "Daisy is full of energy and spunk. She's smaller than Luna but makes up for it with a big personality.",
    profile_picture_id: "img-daisy-main",
    image_ids: "img-daisy-main",
    birth_date: "2021-03-10",
  },
];
