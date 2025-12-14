export interface Waitlist {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  preferences: string;
}

export const mockWaitlist: Waitlist[] = [
  {
    id: "1",
    firstname: "Customer",
    lastname: "1",
    email: "customer@aprilslilpugs.com",
    phone: "(662) 555-0199",
    preferences: "I want a black male",
  },
  {
    id: "2",
    firstname: "Customer",
    lastname: "2",
    email: "customer@aprilslilpugs.com",
    phone: "(662) 555-0199",
    preferences: "I want a red female",
  },
  {
    id: "3",
    firstname: "Customer",
    lastname: "3",
    email: "customer@aprilslilpugs.com",
    phone: "(662) 555-0199",
    preferences: "I want a fawn male",
  },
];
