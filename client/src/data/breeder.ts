export interface Breeder {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  description: string;
  profile_picture_id: string;
  image_ids?: string;
}

export const mockBreeder: Breeder = {
  id: "user-admin-april",
  firstname: "April",
  lastname: "Carpenter",
  email: "contact@aprilslilpugs.com",
  password: "hashed_password_placeholder",
  phone: "(662) 555-0199",
  location: "Tupelo,MS",
  description:
    "Welcome to April's Lil Pugs! Located in Tupelo, MS, we have been passionately raising happy, healthy pugs for over 15 years. All our dogs are AKC registered and raised right in our living room.",
  profile_picture_id: "img-breeder-april",
  image_ids: "img-otis-main,img-luna-main",
};
