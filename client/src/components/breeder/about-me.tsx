import {
  FaHeart,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaFacebook,
} from "react-icons/fa";

// --- Hardcoded Test Data ---
const breeder = {
  firstName: "April",
  lastName: "Carpenter",
  profilePicture: "/logo.jpg",
  location: "Tupelo, MS",
  email: "contact@aprilslilpugs.com",
  phoneNumber: "(662) 555-0199",
  story: `My name is April Carpenter. I fell in love with pugs when I was 5. At 7 I finally talked my parents into getting a pug. Sugar was my faithful companion until just before my 21st birthday.

  I got married soon after that and my husband swore, we were never getting a pug. 20 years later I gave up and brought my baby Winston home. It didn't take long before we were both in love. Our love for pugs and the breed in general nudged us to start breeding quality companion pugs.`,
  images: ["/background.png", "/logo.jpg"],
};

const AboutMe = () => {
  return (
    <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
      <div className="relative mb-8">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Profile Picture Section */}
          <div className="relative w-48 h-48 md:w-64 md:h-64">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl transform rotate-6 opacity-20"></div>
            {breeder.profilePicture ? (
              <img
                src={breeder.profilePicture}
                alt={`${breeder.firstName} ${breeder.lastName}`}
                className="relative w-full h-full object-cover rounded-xl border-2 border-white/10 shadow-xl"
              />
            ) : (
              <div className="relative w-full h-full rounded-xl border-2 border-white/10 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <span className="text-4xl text-white/20">
                  {breeder.firstName?.[0]}
                  {breeder.lastName?.[0]}
                </span>
              </div>
            )}
          </div>

          {/* Name and Tagline */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-4">
              {breeder.firstName} {breeder.lastName}
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-4">
              <FaHeart className="text-blue-400" />
              <span className="text-white/90">Passionate Pug Breeder</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Links Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {breeder.location && (
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(breeder.location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col items-center justify-center gap-2"
          >
            <FaMapMarkerAlt className="text-2xl text-blue-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-white/80 text-sm text-center">
              {breeder.location}
            </span>
          </a>
        )}
        {breeder.email && (
          <a
            href={`mailto:${breeder.email}`}
            className="group bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col items-center justify-center gap-2"
          >
            <FaEnvelope className="text-2xl text-blue-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-white/80 text-sm text-center">Email Me</span>
          </a>
        )}
        {breeder.phoneNumber && (
          <a
            href={`tel:${breeder.phoneNumber}`}
            className="group bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col items-center justify-center gap-2"
          >
            <FaPhoneAlt className="text-2xl text-blue-400 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-white/80 text-sm text-center">Call Me</span>
          </a>
        )}
        <a
          href="https://www.facebook.com/AprilsLilPugs/"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 flex flex-col items-center justify-center gap-2"
        >
          <FaFacebook className="text-2xl text-blue-400 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-white/80 text-sm text-center">Facebook</span>
        </a>
      </div>

      {/* Story Section */}
      {breeder.story && (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6">
            My Journey with Pugs
          </h2>
          <div className="prose prose-invert max-w-none">
            <p className="text-white/90 whitespace-pre-line leading-relaxed text-base">
              {breeder.story}
            </p>
          </div>
        </div>
      )}

      {/* Gallery Section */}
      {breeder.images && breeder.images.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6">
            My Gallery
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {breeder.images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl transform rotate-3 opacity-20"></div>
                <img
                  src={imageUrl}
                  alt={`Breeder gallery ${index + 1}`}
                  className="relative w-full h-64 sm:h-80 md:h-96 object-cover rounded-xl border-2 border-white/10 shadow-xl"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutMe;
