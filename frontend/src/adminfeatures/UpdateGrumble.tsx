// import React, { useState, useEffect } from "react";
// import axios from "axios";

// // Add color type
// type GrumbleColor = 'black' | 'fawn' | 'apricot';

// interface Grumble {
//   id: number;
//   breeder_id: number;
//   name: string;
//   gender: 'male' | 'female';
//   color: GrumbleColor;  // Update type
// }

// interface Breeder {
//   id: number;
//   firstName: string;
//   lastName: string;
// }

// interface GrumbleFormData {
//   breeder_id: number;
//   name: string;
//   gender: 'male' | 'female';
//   color: GrumbleColor;  // Update type
// }

// interface UserSession {
//   id: number;
//   email: string;
// }

// const UpdateGrumble: React.FC = () => {
//   const [grumbles, setGrumbles] = useState<Grumble[]>([]);
//   const [breeders, setBreeders] = useState<Breeder[]>([]);
//   const [editingGrumble, setEditingGrumble] = useState<Grumble | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [userSession, setUserSession] = useState<UserSession | null>(null);

//   const [formData, setFormData] = useState<GrumbleFormData>({
//     breeder_id: 0,
//     name: '',
//     gender: 'male',
//     color: 'black'  // Default value
//   });

//   useEffect(() => {
//     Promise.all([
//       axios.get('/api/grumbles'),
//       axios.get('/api/breeders'),
//       axios.get('/api/auth/session')
//     ]).then(([grumblesRes, breedersRes, sessionRes]) => {
//       setGrumbles(Array.isArray(grumblesRes.data) ? grumblesRes.data : []);
//       setBreeders(Array.isArray(breedersRes.data) ? breedersRes.data : []);
//       setUserSession(sessionRes.data);
//       setFormData(prev => ({
//         ...prev,
//         breeder_id: sessionRes.data.id
//       }));
//       setIsLoading(false);
//     }).catch(err => {
//       setError("Failed to fetch data");
//       setIsLoading(false);
//     });
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       if (editingGrumble) {
//         await axios.put(`/api/grumbles/${editingGrumble.id}`, formData);
//       } else {
//         await axios.post('/api/grumbles', formData);
//       }
      
//       const response = await axios.get('/api/grumbles');
//       setGrumbles(response.data);
//       resetForm();
//     } catch (err) {
//       setError("Failed to save grumble");
//     }
//   };

//   const handleEdit = (grumble: Grumble) => {
//     setEditingGrumble(grumble);
//     setFormData({
//       breeder_id: grumble.breeder_id,
//       name: grumble.name,
//       gender: grumble.gender,
//       color: grumble.color
//     });
//   };

//   const handleDelete = async (id: number) => {
//     if (!window.confirm("Are you sure you want to delete this grumble?")) return;
    
//     try {
//       await axios.delete(`/api/grumbles/${id}`);
//       setGrumbles(grumbles.filter(g => g.id !== id));
//     } catch (err) {
//       setError("Failed to delete grumble");
//     }
//   };

//   const resetForm = () => {
//     setEditingGrumble(null);
//     setFormData({
//       breeder_id: userSession ? userSession.id : 0,
//       name: '',
//       gender: 'male',
//       color: 'black'  // Default value
//     });
//   };

//   if (isLoading) return <div>Loading...</div>;
//   if (error) return <div className="text-red-500">{error}</div>;

//   return (
//     <div className="p-8 max-w-7xl mx-auto">
//       <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 rounded-lg shadow">
//         <h2 className="text-xl font-bold mb-4">
//           {editingGrumble ? 'Edit Grumble' : 'Add New Grumble Member'}
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block mb-2">Name</label>
//             <input
//               type="text"
//               value={formData.name}
//               onChange={e => setFormData({...formData, name: e.target.value})}
//               className="w-full p-2 border rounded"
//               required
//             />
//           </div>

//           <div>
//             <label className="block mb-2">Gender</label>
//             <select
//               value={formData.gender}
//               onChange={e => setFormData({...formData, gender: e.target.value as 'male' | 'female'})}
//               className="w-full p-2 border rounded"
//               required
//             >
//               <option value="male">Male</option>
//               <option value="female">Female</option>
//             </select>
//           </div>

//           <div>
//             <label className="block mb-2">Color</label>
//             <select
//               value={formData.color}
//               onChange={e => setFormData({...formData, color: e.target.value as GrumbleColor})}
//               className="w-full p-2 border rounded"
//               required
//             ></select>
//               <option value="">Select Color</option>
//               <option value="black">Black</option>
//               <option value="fawn">Fawn</option>
//               <option value="apricot">Apricot</option>
//             </select>
//           </div>
//         </div>

//         <div className="mt-4 flex gap-2">
//           <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
//             {editingGrumble ? 'Update' : 'Create'}
//           </button>
//           {editingGrumble && (
//             <button
//               type="button"
//               onClick={resetForm}
//               className="bg-gray-500 text-white px-4 py-2 rounded"
//             >
//               Cancel
//             </button>
//           )}
//         </div>
//       </form>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {grumbles.map(grumble => (
//           <div key={grumble.id} className="bg-white p-6 rounded-lg shadow">
//             <div className="flex justify-between items-start">
//               <h3 className="text-lg font-semibold">{grumble.name}</h3>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => handleEdit(grumble)}
//                   className="text-blue-500 hover:text-blue-700"
//                 >
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => handleDelete(grumble.id)}
//                   className="text-red-500 hover:text-red-700"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//             <p className="capitalize">Gender: {grumble.gender}</p>
//             <p>Color: {grumble.color}</p>
//             <p>Breeder: {
//               (() => {
//                 const breeder = breeders.find(b => b.id === grumble.breeder_id);
//                 return breeder ? `${breeder.firstName} ${breeder.lastName}` : 'Unknown';
//               })()
//             }</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default UpdateGrumble;
