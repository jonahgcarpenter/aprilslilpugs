// import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

// interface BreederInfo {
//     firstName: string;
//     lastName: string;
//     city: string;
//     state: string;
//     experienceYears: number;
//     story: string;
//     phone: string;
//     email: string;
//     profile_image?: string;
// }

// const UpdateBreeder: React.FC = () => {
//     const [formData, setFormData] = useState<BreederInfo>({
//         firstName: '',
//         lastName: '',
//         city: '',
//         state: '',
//         experienceYears: 0,
//         story: '',
//         phone: '',
//         email: ''
//     });
    
//     const [imageFile, setImageFile] = useState<File | null>(null);
//     const [status, setStatus] = useState<string>('');

//     useEffect(() => {
//         fetchBreederInfo();
//     }, []);

//     const fetchBreederInfo = async () => {
//         try {
//             const response = await fetch('http://localhost:5000/api/breeder');
//             if (!response.ok) throw new Error('Failed to fetch');
//             const data = await response.json();
//             setFormData(data);
//         } catch (err) {
//             setStatus('Error loading data');
//         }
//     };

//     const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
//         if (e.target.files && e.target.files[0]) {
//             setImageFile(e.target.files[0]);
//         }
//     };

//     const handleImageUpload = async (imageFile: File): Promise<boolean> => {
//         const formData = new FormData();
//         formData.append('image', imageFile);
        
//         try {
//             console.log('Starting image upload...');
//             const response = await fetch('http://localhost:5000/api/breeder/image', {
//                 method: 'POST',
//                 credentials: 'include',
//                 body: formData,
//                 headers: {
//                     'Accept': 'application/json',
//                 }
//             });
            
//             console.log('Response status:', response.status);
//             if (!response.ok) {
//                 const error = await response.json();
//                 throw new Error(error.error || 'Upload failed');
//             }
            
//             return true;
//         } catch (error) {
//             console.error('Upload error details:', error);
//             throw error;
//         }
//     };

//     const handleSubmit = async (e: FormEvent) => {
//         e.preventDefault();
//         setStatus('Saving...');

//         try {
//             if (imageFile) {
//                 setStatus('Uploading image...');
//                 await handleImageUpload(imageFile);
//                 setStatus('Image uploaded, updating information...');
//             }

//             // Update breeder info with credentials
//             const response = await fetch('http://localhost:5000/api/breeder/update', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 credentials: 'include',
//                 mode: 'cors',
//                 body: JSON.stringify({
//                     ...formData,
//                     experienceYears: parseInt(formData.experienceYears.toString())
//                 })
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.error || 'Failed to update');
//             }

//             const result = await response.json();
//             setStatus('Successfully updated!');
            
//             // Refresh the data
//             await fetchBreederInfo();
            
//         } catch (err) {
//             console.error('Update error:', err);
//             setStatus(`Error: ${err instanceof Error ? err.message : 'Failed to update data'}`);
//         }
//     };

//     return (
//         <div className="p-8 max-w-4xl mx-auto">
//             <h1 className="text-3xl font-bold mb-6 text-blue-500">Update Breeder Information</h1>
            
//             <form onSubmit={handleSubmit} className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-300">First Name</label>
//                         <input
//                             type="text"
//                             name="firstName"
//                             value={formData.firstName}
//                             onChange={handleInputChange}
//                             className="mt-1 block w-full rounded border border-gray-600 bg-gray-700 text-white px-3 py-2"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-300">Last Name</label>
//                         <input
//                             type="text"
//                             name="lastName"
//                             value={formData.lastName}
//                             onChange={handleInputChange}
//                             className="mt-1 block w-full rounded border border-gray-600 bg-gray-700 text-white px-3 py-2"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-300">City</label>
//                         <input
//                             type="text"
//                             name="city"
//                             value={formData.city}
//                             onChange={handleInputChange}
//                             className="mt-1 block w-full rounded border border-gray-600 bg-gray-700 text-white px-3 py-2"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-300">State</label>
//                         <input
//                             type="text"
//                             name="state"
//                             value={formData.state}
//                             onChange={handleInputChange}
//                             className="mt-1 block w-full rounded border border-gray-600 bg-gray-700 text-white px-3 py-2"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-300">Years of Experience</label>
//                         <input
//                             type="number"
//                             name="experienceYears"
//                             value={formData.experienceYears}
//                             onChange={handleInputChange}
//                             className="mt-1 block w-full rounded border border-gray-600 bg-gray-700 text-white px-3 py-2"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-300">Phone</label>
//                         <input
//                             type="tel"
//                             name="phone"
//                             value={formData.phone}
//                             onChange={handleInputChange}
//                             className="mt-1 block w-full rounded border border-gray-600 bg-gray-700 text-white px-3 py-2"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-300">Email</label>
//                         <input
//                             type="email"
//                             name="email"
//                             value={formData.email}
//                             onChange={handleInputChange}
//                             className="mt-1 block w-full rounded border border-gray-600 bg-gray-700 text-white px-3 py-2"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-300">Profile Image</label>
//                         <input
//                             type="file"
//                             accept="image/*"
//                             onChange={handleImageChange}
//                             className="mt-1 block w-full text-gray-300"
//                         />
//                     </div>
//                 </div>
                
//                 <div>
//                     <label className="block text-sm font-medium text-gray-300">Story</label>
//                     <textarea
//                         name="story"
//                         value={formData.story}
//                         onChange={handleInputChange}
//                         rows={4}
//                         className="mt-1 block w-full rounded border border-gray-600 bg-gray-700 text-white px-3 py-2"
//                     />
//                 </div>

//                 {status && (
//                     <div className={`text-sm ${status.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
//                         {status}
//                     </div>
//                 )}

//                 <button
//                     type="submit"
//                     className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
//                 >
//                     Update Information
//                 </button>
//             </form>
//         </div>
//     );
// };

// export default UpdateBreeder;
