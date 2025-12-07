export interface Image {
  id: string;
  filename: string;
  description?: string;
}

export const mockImages: Image[] = [
  {
    id: "img-otis-main",
    filename: "otis_garden.jpg",
    description: "Otis looking regal in the garden",
  },
  {
    id: "img-luna-main",
    filename: "luna_sofa.jpg",
    description: "Luna resting on her favorite blanket",
  },
  {
    id: "img-daisy-main",
    filename: "daisy_play.jpg",
    description: "Daisy playing fetch",
  },
  {
    id: "img-litter-breakfast",
    filename: "breakfast_club_pile.jpg",
    description: "The Breakfast Club puppy pile",
  },
  {
    id: "img-litter-super",
    filename: "superheroes_basket.jpg",
    description: "Superheroes litter in the basket",
  },
  {
    id: "img-pup-thor",
    filename: "thor_hero_pose.jpg",
    description: "Thor standing tall",
  },
  {
    id: "img-pup-hulk",
    filename: "hulk_smash_toy.jpg",
    description: "Hulk chewing on a toy",
  },
  {
    id: "img-pup-widow",
    filename: "widow_sleeping.jpg",
    description: "Black Widow sleeping",
  },
  {
    id: "img-breeder-april",
    filename: "april_profile.jpg",
    description: "April with two puppies",
  },
];
