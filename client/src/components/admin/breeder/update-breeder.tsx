import { useState, useEffect, useRef } from "react";
import type { Breeder, UpdateBreederInput } from "../../../hooks/usebreeder";
import { FaSave, FaImage, FaSpinner, FaUserEdit, FaPen } from "react-icons/fa";

interface UpdateBreederProps {
  breeder: Breeder | null;
  onSave: (data: UpdateBreederInput) => Promise<boolean>;
}

const UpdateBreeder = ({ breeder, onSave }: UpdateBreederProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    location: "",
    story: "",
  });

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [profileFile, setProfileFile] = useState<File | null>(null);

  const [galleryPreview1, setGalleryPreview1] = useState<string | null>(null);
  const [galleryFile1, setGalleryFile1] = useState<File | null>(null);

  const [galleryPreview2, setGalleryPreview2] = useState<string | null>(null);
  const [galleryFile2, setGalleryFile2] = useState<File | null>(null);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const galleryInput1Ref = useRef<HTMLInputElement>(null);
  const galleryInput2Ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (breeder) {
      setFormData({
        firstName: breeder.firstName || "",
        lastName: breeder.lastName || "",
        email: breeder.email || "",
        phoneNumber: breeder.phone || "",
        location: breeder.location || "",
        story: breeder.description || "",
      });

      setProfilePreview(
        breeder.profilePicture ? breeder.profilePicture.url : null,
      );

      if (breeder.gallery && breeder.gallery.length > 0) {
        setGalleryPreview1(breeder.gallery[0]?.url || null);
        if (breeder.gallery.length > 1) {
          setGalleryPreview2(breeder.gallery[1]?.url || null);
        }
      }
    }
  }, [breeder]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileFile(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    slot: 1 | 2,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (slot === 1) {
        setGalleryFile1(file);
        setGalleryPreview1(URL.createObjectURL(file));
      } else {
        setGalleryFile2(file);
        setGalleryPreview2(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const galleryFiles: (File | null)[] = [
        galleryFile1 || null,
        galleryFile2 || null,
      ];

      await onSave({
        ...formData,
        profilePictureFile: profileFile || undefined,
        galleryFiles: galleryFiles,
      });

      setMessage({ type: "success", text: "Profile updated successfully!" });

      setProfileFile(null);
      setGalleryFile1(null);
      setGalleryFile2(null);

      if (profileInputRef.current) profileInputRef.current.value = "";
      if (galleryInput1Ref.current) galleryInput1Ref.current.value = "";
      if (galleryInput2Ref.current) galleryInput2Ref.current.value = "";
    } catch (err) {
      setMessage({
        type: "error",
        text: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
      <div className="flex items-center gap-4 mb-8 border-b border-white/10 pb-6">
        <div className="p-3 bg-blue-500/10 rounded-lg">
          <FaUserEdit className="text-3xl text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
            Edit Profile
          </h2>
          <p className="text-white/60 text-sm">
            Update your public information and images
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Profile Picture */}
          <div className="relative group flex-shrink-0">
            <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden border-2 border-white/10 shadow-xl bg-slate-800">
              {profilePreview ? (
                <img
                  src={profilePreview}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FaImage className="text-4xl text-slate-600" />
                </div>
              )}
              <div
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-10"
                onClick={() => profileInputRef.current?.click()}
              >
                <FaPen className="text-white text-3xl" />
              </div>
            </div>
            <input
              type="file"
              ref={profileInputRef}
              onChange={handleProfileChange}
              accept="image/*"
              className="hidden"
            />
            <p className="text-center text-xs text-white/50 mt-4 relative z-10">
              Tap to change
            </p>
          </div>

          {/* Name */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-400">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="First Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-400">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Last Name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-400 flex items-center gap-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="breeder@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-400 flex items-center gap-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-400 flex items-center gap-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="City, State"
              />
            </div>
          </div>
        </div>

        {/* Story */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-blue-400">
            Your Story
          </label>
          <textarea
            name="story"
            value={formData.story}
            onChange={handleInputChange}
            rows={6}
            className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
            placeholder="Share your passion for pugs..."
          />
        </div>

        {/* Gallery Section */}
        <div>
          <label className="text-sm font-medium text-blue-400 flex items-center gap-2 mb-4">
            Gallery Images
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Slot 1 */}
            <div className="relative group">
              <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden border-2 border-white/10 bg-slate-800 shadow-xl cursor-pointer">
                {galleryPreview1 ? (
                  <img
                    src={galleryPreview1}
                    alt="Gallery 1"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaImage className="text-4xl text-slate-600" />
                  </div>
                )}
                <div
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-10"
                  onClick={() => galleryInput1Ref.current?.click()}
                >
                  <FaPen className="text-white text-3xl" />
                </div>
              </div>
              <input
                type="file"
                ref={galleryInput1Ref}
                onChange={(e) => handleGalleryChange(e, 1)}
                accept="image/*"
                className="hidden"
              />
              <p className="text-center text-xs text-white/50 mt-4 relative z-10">
                Tap to change
              </p>
            </div>

            {/* Slot 2 */}
            <div className="relative group">
              <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden border-2 border-white/10 bg-slate-800 shadow-xl cursor-pointer">
                {galleryPreview2 ? (
                  <img
                    src={galleryPreview2}
                    alt="Gallery 2"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaImage className="text-4xl text-slate-600" />
                  </div>
                )}
                <div
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-10"
                  onClick={() => galleryInput2Ref.current?.click()}
                >
                  <FaPen className="text-white text-3xl" />
                </div>
              </div>
              <input
                type="file"
                ref={galleryInput2Ref}
                onChange={(e) => handleGalleryChange(e, 2)}
                accept="image/*"
                className="hidden"
              />
              <p className="text-center text-xs text-white/50 mt-4 relative z-10">
                Tap to change
              </p>
            </div>
          </div>
        </div>

        {/* Feedback & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-white/10">
          <div className="flex-1">
            {message && (
              <div
                className={`text-sm px-4 py-2 rounded-lg ${
                  message.type === "success"
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {message.text}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isSaving}
            className="cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <FaSpinner className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <FaSave /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateBreeder;
