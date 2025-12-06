import Navbar from "./navbar";

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 border-b bg-gray-50">
      <div className="flex items-center gap-2">
        <img src="/logo.jpg" alt="Logo" className="h-16 w-auto" />
        <span className="text-xl font-bold">April's Lil Pugs</span>
      </div>

      <Navbar />
    </header>
  );
}
