// // import type { RecentLeadsTableProps } from '../../pages/partner_page/types';

// const RecentLeadsTable = ({ leads, onView, onEdit }: any) => {
//   const handleView = (leadId: string) => {
//     onView?.(leadId);
//   };

// //   const handleEdit = (leadId: string) => {
// //     onEdit?.(leadId);
// //   };

//   return (
//     <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-3 sm:p-4 border border-gray-100">
//       <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Recent Lead</h2>
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead>
//             <tr className="border-b-2 border-gray-200">
//               <th className="text-left py-2 px-4 sm:px-6 md:px-8 lg:px-10 text-xs sm:text-sm md:text-base font-bold text-gray-700">Lead id</th>
//               <th className="text-left py-2 px-4 sm:px-6 md:px-8 lg:px-10 text-xs sm:text-sm md:text-base font-bold text-gray-700">Lead name</th>
//               <th className="text-left py-2 px-4 sm:px-6 md:px-8 lg:px-10 text-xs sm:text-sm md:text-base font-bold text-gray-700">Type</th>
//               <th className="text-left py-2 px-4 sm:px-6 md:px-8 lg:px-10 text-xs sm:text-sm md:text-base font-bold text-gray-700">CreatedDates</th>
//               <th className="text-left py-2 px-4 sm:px-6 md:px-8 lg:px-10 text-xs sm:text-sm md:text-base font-bold text-gray-700">Status</th>
//               <th className="text-left py-2 px-4 sm:px-6 md:px-8 lg:px-10 text-xs sm:text-sm md:text-base font-bold text-gray-700">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {leads.map((lead:any, index:any) => (
//               <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
//                 <td className="py-2 px-4 sm:px-6 md:px-8 lg:px-10 text-xs sm:text-sm md:text-base text-gray-900 font-semibold">{lead.leadId}</td>
//                 <td className="py-2 px-4 sm:px-6 md:px-8 lg:px-10 text-xs sm:text-sm md:text-base text-gray-900 font-semibold">{lead.leadName}</td>
//                 <td className="py-2 px-4 sm:px-6 md:px-8 lg:px-10">
//                   <span 
//                     className="inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold"
//                     style={{ 
//                       backgroundColor: 'rgba(105, 56, 239, 0.2)',
//                       color: '#6938ef'
//                     }}
//                   >
//                     {lead.type}
//                   </span>
//                 </td>
//                 <td className="py-2 px-4 sm:px-6 md:px-8 lg:px-10 text-xs sm:text-sm md:text-base text-gray-600 font-medium">{lead.createdDate}</td>
//                 <td className="py-2 px-4 sm:px-6 md:px-8 lg:px-10">
//                   <span 
//                     className="inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold"
//                     style={{ 
//                       backgroundColor: 'rgba(34, 197, 94, 0.2)',
//                       color: '#22c55e'
//                     }}
//                   >
//                     {lead.status}
//                   </span>
//                 </td>
//                 <td className="py-2 px-4 sm:px-6 md:px-8 lg:px-10">
//                   <div className="flex items-center gap-2">
//                     <button 
//                       onClick={() => handleView(lead.leadId)}
//                       className="text-xs sm:text-sm md:text-base font-semibold px-3 py-1 rounded transition-colors hover:opacity-90"
//                       style={{ 
//                         backgroundColor: 'rgba(105, 56, 239, 0.7)',
//                         color: '#ffffff'
//                       }}
//                     >
//                       View
//                     </button>
//                     <span style={{ color: '#6938ef' }}>|</span>
//                     <button 
//                       onClick={() => handleEdit(lead.leadId)}
//                       className="text-xs sm:text-sm md:text-base font-semibold px-3 py-1 rounded transition-colors hover:opacity-90"
//                       style={{ 
//                         backgroundColor: 'rgba(105, 56, 239, 0.7)',
//                         color: '#ffffff'
//                       }}
//                     >
//                       Edit
//                     </button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// // export default RecentLeadsTable;
