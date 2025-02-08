// import { useState, useEffect, useContext, useRef } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { LitterContext } from "../../context/LitterContext";
// import LoadingAnimation from "../Misc/LoadingAnimation";
// import DeleteModal from "../Modals/DeleteModal";
// import SuccessModal from "../Modals/SuccessModal";
// import ErrorModal from "../Modals/ErrorModal";
// import Puppies from "../Puppy/Puppies";
//
// const LitterUpdate = () => {
//   const { id } = useParams();
//   const [litter, setLitter] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);
//   const [errorModal, setErrorModal] = useState({ show: false, message: "" });
//   const [previewUrl, setPreviewUrl] = useState(null);
//   const fileInputRef = useRef();
//   const [successMessage, setSuccessMessage] = useState("");
//
//   const { litters, updateLitter, deleteLitter, loading, preloadedImages } =
//     useContext(LitterContext);
//   const navigate = useNavigate();
//   const [newlyUploadedImage, setNewlyUploadedImage] = useState(false);
//
//   useEffect(() => {
//     const currentLitter = litters.find((l) => l._id === id);
//     if (currentLitter) {
//       setLitter({
//         ...currentLitter,
//         birthDate: currentLitter.birthDate?.split("T")[0] || "",
//         availableDate: currentLitter.availableDate?.split("T")[0] || "",
//       });
//       if (currentLitter.profilePicture && preloadedImages?.litters) {
//         setPreviewUrl(preloadedImages.litters[currentLitter.profilePicture]);
//       } else {
//         setPreviewUrl(null);
//       }
//     }
//   }, [id, litters, preloadedImages]);
//
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setPreviewUrl(URL.createObjectURL(file));
//       setNewlyUploadedImage(true);
//     }
//   };
//
//   const clearImage = () => {
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//     setNewlyUploadedImage(false);
//
//     if (litter?.profilePicture && preloadedImages?.litters) {
//       setPreviewUrl(preloadedImages.litters[litter.profilePicture]);
//     } else {
//       setPreviewUrl(null);
//     }
//   };
//
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//
//     try {
//       const formDataToSend = new FormData();
//
//       const updateData = {
//         name: litter.name?.trim(),
//         mother: litter.mother?.trim(),
//         father: litter.father?.trim(),
//         birthDate: litter.birthDate,
//         availableDate: litter.availableDate,
//       };
//
//       formDataToSend.append("data", JSON.stringify(updateData));
//
//       if (fileInputRef.current?.files[0]) {
//         formDataToSend.append("profilePicture", fileInputRef.current.files[0]);
//       }
//
//       await updateLitter(id, formDataToSend);
//       setSuccessMessage("Litter updated successfully!");
//       setShowSuccessModal(true);
//       setNewlyUploadedImage(false);
//       setTimeout(() => {
//         navigate("/breeder-dashboard");
//       }, 1500);
//     } catch (err) {
//       setErrorModal({
//         show: true,
//         message: err.message || "Failed to update litter. Please try again.",
//       });
//     }
//   };
//
//   const handleDelete = async () => {
//     try {
//       await deleteLitter(id);
//       setShowDeleteModal(false);
//       setSuccessMessage("Litter deleted successfully!");
//       setShowSuccessModal(true);
//       setTimeout(() => {
//         navigate("/breeder-dashboard");
//       }, 1500);
//     } catch (err) {
//       setErrorModal({
//         show: true,
//         message: err.message || "Failed to delete litter",
//       });
//     }
//   };
//
//   if (loading || !litter) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <LoadingAnimation containerClassName="scale-150" />
//       </div>
//     );
//   }
//
//   return (
//     <div className="mx-0 sm:mx-4 px-4 sm:px-0 py-8">
//       <form
//         onSubmit={handleSubmit}
//         className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-8 border border-slate-800/50 shadow-xl"
//       >
//         <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8">
//           Update Litter
//         </h2>
//
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
//           <div className="form-group">
//             <label className="block text-sm font-medium text-gray-300 mb-2">
//               Litter Name
//             </label>
//             <input
//               type="text"
//               name="name"
//               value={litter?.name}
//               onChange={(e) => setLitter({ ...litter, name: e.target.value })}
//               required
//               className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//
//           <div className="form-group">
//             <label className="block text-sm font-medium text-gray-300 mb-2">
//               Mother
//             </label>
//             <input
//               type="text"
//               name="mother"
//               value={litter?.mother}
//               onChange={(e) => setLitter({ ...litter, mother: e.target.value })}
//               required
//               className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//
//           <div className="form-group">
//             <label className="block text-sm font-medium text-gray-300 mb-2">
//               Father
//             </label>
//             <input
//               type="text"
//               name="father"
//               value={litter?.father}
//               onChange={(e) => setLitter({ ...litter, father: e.target.value })}
//               required
//               className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//
//           <div className="form-group">
//             <label className="block text-sm font-medium text-gray-300 mb-2">
//               Birth Date
//             </label>
//             <input
//               type="date"
//               name="birthDate"
//               value={litter?.birthDate}
//               onChange={(e) =>
//                 setLitter({ ...litter, birthDate: e.target.value })
//               }
//               required
//               className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//
//           <div className="form-group">
//             <label className="block text-sm font-medium text-gray-300 mb-2">
//               Available Date
//             </label>
//             <input
//               type="date"
//               name="availableDate"
//               value={litter?.availableDate}
//               onChange={(e) =>
//                 setLitter({ ...litter, availableDate: e.target.value })
//               }
//               required
//               className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//
//           <div className="form-group sm:col-span-2">
//             <label className="block text-sm font-medium text-gray-300 mb-2">
//               Litter Image
//             </label>
//             {previewUrl && (
//               <div className="mb-4 relative w-32 h-32">
//                 <img
//                   src={previewUrl}
//                   alt="Litter Preview"
//                   className="w-full h-full object-cover rounded-lg border border-slate-700"
//                 />
//                 {newlyUploadedImage && (
//                   <button
//                     type="button"
//                     onClick={clearImage}
//                     className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
//                   >
//                     x
//                   </button>
//                 )}
//               </div>
//             )}
//             <input
//               type="file"
//               name="profilePicture"
//               ref={fileInputRef}
//               onChange={handleFileChange}
//               accept="image/jpeg,image/png"
//               className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition-colors"
//             />
//           </div>
//         </div>
//
//         <div className="flex gap-4 mt-8">
//           <button
//             type="submit"
//             className="flex-1 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200"
//           >
//             Update Litter
//           </button>
//           <button
//             type="button"
//             onClick={() => setShowDeleteModal(true)}
//             className="px-8 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
//           >
//             Delete Litter
//           </button>
//         </div>
//       </form>
//
//       {litter && (
//         <Puppies litterId={id} existingPuppies={litter.puppies || []} />
//       )}
//
//       <DeleteModal
//         isOpen={showDeleteModal}
//         onClose={() => setShowDeleteModal(false)}
//         onDelete={() => {
//           handleDelete();
//           setShowDeleteModal(false);
//         }}
//         itemName={`litter "${litter?.name}"`}
//         message="This will permanently delete the litter and all associated puppies."
//       />
//
//       <SuccessModal
//         isOpen={showSuccessModal}
//         onClose={() => setShowSuccessModal(false)}
//         message={successMessage}
//         delay={1500}
//       />
//
//       <ErrorModal
//         isOpen={errorModal.show}
//         onClose={() => setErrorModal({ show: false, message: "" })}
//         message={errorModal.message}
//       />
//     </div>
//   );
// };
//
// export default LitterUpdate;
