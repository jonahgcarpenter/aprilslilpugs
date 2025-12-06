import { NavLink } from "react-router-dom";

export default function Navbar() {
  const links = [
    { name: "Home", path: "/" },
    { name: "Our Adults", path: "/ouradults" },
    { name: "Nursery", path: "/nursery" },
    { name: "Live Puppy Cam", path: "/live" },
    { name: "Past Litters", path: "/pastlitters" },
    { name: "Gallery", path: "/gallery" },
  ];

  return (
    <nav className="flex gap-6">
      {links.map((link) => (
        <NavLink
          key={link.name}
          to={link.path}
          className={({ isActive }) =>
            isActive ? "font-bold underline" : "hover:underline"
          }
        >
          {link.name}
        </NavLink>
      ))}
    </nav>
  );
}
