// import { useState } from 'react';
// import PartnerSidebar from '../../components/PartnerSidebar/PartnerSidebar';
// import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';
// import LeadModal from '../../components/LeadModal/LeadModal';
// import { Search, Download, ArrowUpDown, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
// import { exportToExcel } from '../../utils/excelExport';

// interface Lead {
//   leadId: string;
//   leadName: string;
//   type: string;
//   createdDate: string;
//   editedDate: string;
//   status: string;
//   firstName?: string;
//   lastName?: string;
//   email?: string;
//   priority?: string;
//   contactNumber?: string;
//   address?: string;
//   eventType?: string;
//   leadSource?: string;
//   budget?: string;
//   eventDate?: string;
//   assignee?: string;
//   description?: string;
// }

// const ViewLeads = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
//   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
//   const itemsPerPage = 6;

//   const leads: Lead[] = [
//     { leadId: 'LD-104', leadName: 'Priya', type: 'Wedding', createdDate: 'March 26 2025', editedDate: 'March 29 2025', status: 'New' },
//     { leadId: 'LD-105', leadName: 'Priya', type: 'Wedding', createdDate: 'March 26 2025', editedDate: 'March 29 2025', status: 'Done' },
//     { leadId: 'LD-106', leadName: 'Priya', type: 'Wedding', createdDate: 'March 26 2025', editedDate: 'March 29 2025', status: 'Done' },
//     { leadId: 'LD-107', leadName: 'Priya', type: 'Wedding', createdDate: 'March 26 2025', editedDate: 'March 29 2025', status: 'Done' },
//     { leadId: 'LD-108', leadName: 'Priya', type: 'Birthday', createdDate: 'March 26 2025', editedDate: 'March 29 2025', status: 'Done' },
//     { leadId: 'LD-109', leadName: 'Priya', type: 'Photoshoot', createdDate: 'March 26 2025', editedDate: 'March 29 2025', status: 'Done' },
//     { leadId: 'LD-110', leadName: 'Priya', type: 'Wedding', createdDate: 'March 26 2025', editedDate: 'March 29 2025', status: 'New' },
//     { leadId: 'LD-111', leadName: 'Priya', type: 'Birthday', createdDate: 'March 26 2025', editedDate: 'March 29 2025', status: 'Done' },
//   ];

//   const sortByDate = (leads: Lead[]) => {
//     return [...leads].sort((a, b) => {
//       const dateA = new Date(a.createdDate).getTime();
//       const dateB = new Date(b.createdDate).getTime();
//       return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
//     });
//   };

//   const handleSortByDate = () => {
//     setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
//   };

//   const handleDownload = () => {
//     const sortedLeads = sortByDate(leads);
//     const excelData = sortedLeads.map(lead => ({
//       'Lead ID': lead.leadId,
//       'Lead Name': lead.leadName,
//       'Type': lead.type,
//       'Created Date': lead.createdDate,
//       'Edited Date': lead.editedDate,
//       'Status': lead.status,
//     }));
    
//     exportToExcel(excelData, 'view_leads', ['Lead ID', 'Lead Name', 'Type', 'Created Date', 'Edited Date', 'Status']);
//   };

//   const filteredLeads = sortByDate(leads).filter(lead =>
//     lead.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     lead.leadId.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

//   const handleView = (leadId: string) => {
//     const lead = leads.find(l => l.leadId === leadId);
//     if (lead) {
//       setSelectedLead(lead);
//       setShowModal(true);
//     }
//   };

//   const getStatusColor = (status: string) => {
//     if (status === 'New') {
//       return { bg: 'rgba(105, 56, 239, 0.2)', text: '#6938ef' };
//     } else if (status === 'Done') {
//       return { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' };
//     }
//     return { bg: 'rgba(105, 56, 239, 0.2)', text: '#6938ef' };
//   };

//   return (
//     <div 
//       className="fixed inset-0 w-full h-full bg-white flex overflow-hidden"
//       style={{
//         transform: 'scale(0.75)',
//         transformOrigin: 'top left',
//         width: '133.33%',
//         height: '133.33%'
//       }}
//     >
//       <PartnerSidebar />
      
//       <div className="flex-1 flex flex-col overflow-hidden w-full min-w-0">
//         <DashboardHeader title="VIEW LEADS" />
        
//         <main className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 lg:p-5 w-full">
         
//           <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
          
//             <div className="relative flex-1 w-full sm:w-auto">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search name,task"
//                 value={searchQuery}
//                 onChange={(e) => {
//                   setSearchQuery(e.target.value);
//                   setCurrentPage(1);
//                 }}
//                 className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6938ef] focus:border-transparent text-sm sm:text-base"
//                 style={{
//                   border: '1px solid rgba(0, 0, 0, 0.2)'
//                 }}
//               />
//             </div>

//             <div className="flex items-center gap-2 sm:gap-3">
//               <button 
//                 className="p-2 rounded-lg transition-colors hover:opacity-80"
//                 style={{ 
//                   backgroundColor: 'rgba(105, 56, 239, 0.7)',
//                   color: '#ffffff'
//                 }}
//               >
//                 <MoreVertical className="w-5 h-5" />
//               </button>
//               <button 
//                 onClick={handleSortByDate}
//                 className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#6938ef] text-white rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base font-medium"
//               >
//                 <ArrowUpDown className="w-4 h-4 sm:w-5 sm:h-5" />
//                 <span>Sort by date</span>
//               </button>
//               <button 
//                 onClick={handleDownload}
//                 className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#6938ef] text-white rounded-lg hover:opacity-90 transition-opacity text-sm sm:text-base font-medium"
//               >
//                 <Download className="w-4 h-4 sm:w-5 sm:h-5" />
//                 <span>Download</span>
//               </button>
//             </div>
//           </div>

       
//           <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="bg-gray-50 border-b-2 border-gray-200">
//                     <th className="text-left py-2 px-4 sm:px-6 md:px-8 lg:px-10 text-xs sm:text-sm md:text-base font-bold text-gray-700">Lead id</th>
//                     <th className="text-left py-2 px-4 sm:px-6 md:px-8 lg:px-10 text-xs sm:text-sm md:text-base font-bold text-gray-700">Lead name</th>
//                     <th className="text-left py-2 px-4 sm:px-6 md:px-8 lg:px-10 text-xs sm:text-sm md:text-base font-bold text-gray-700">Type</th>
//                     <th className="text-left py-2 px-4 sm:px-6 md:px-8 lg:px-10 text-xs sm:text-sm md:text-base font-bold text-gray-700">CreatedDates</th>
//                     <th className="text-left py-2 px-4 sm:px-6 md:px-8 lg:px-10 text-xs sm:text-sm md:text-base font-bold text-gray-700">EditedDates</th>
//                     <th className="text-left py-2 px-4 sm:px-6 md:px-8 lg:px-10 text-xs sm:text-sm md:text-base font-bold text-gray-700">Status</th>
//                     <th className="text-left py-2 px-4 sm:px-6 md:px-8 lg:px-10 text-xs sm:text-sm md:text-base font-bold text-gray-700">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginatedLeads.map((lead, index) => {
//                     const statusColors = getStatusColor(lead.status);
//                     return (
//                       <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
//                         <td className="py-2 px-4 sm:px-6 md:px-8 lg:px-10 text-xs sm:text-sm md:text-base text-gray-900 font-semibold">{lead.leadId}</td>
//                         <td className="py-2 px-4 sm:px-6 md:px-8 lg:px-10 text-xs sm:text-sm md:text-base text-gray-900 font-semibold">{lead.leadName}</td>
//                         <td className="py-2 px-4 sm:px-6 md:px-8 lg:px-10">
//                           <span 
//                             className="inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold"
//                             style={{ 
//                               backgroundColor: 'rgba(247, 245, 254, 0.7)',
//                               color: '#6938ef'
//                             }}
//                           >
//                             {lead.type}
//                           </span>
//                         </td>
//                         <td className="py-2 px-4 sm:px-6 md:px-8 lg:px-10 text-xs sm:text-sm md:text-base text-gray-600 font-medium">{lead.createdDate}</td>
//                         <td className="py-2 px-4 sm:px-6 md:px-8 lg:px-10 text-xs sm:text-sm md:text-base text-gray-600 font-medium">{lead.editedDate}</td>
//                         <td className="py-2 px-4 sm:px-6 md:px-8 lg:px-10">
//                           <span 
//                             className="inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-bold"
//                             style={{ 
//                               backgroundColor: statusColors.bg,
//                               color: statusColors.text
//                             }}
//                           >
//                             {lead.status}
//                           </span>
//                         </td>
//                         <td className="py-2 px-4 sm:px-6 md:px-8 lg:px-10">
//                           <button 
//                             onClick={() => handleView(lead.leadId)}
//                             className="px-3 py-1 rounded text-xs sm:text-sm md:text-base font-semibold transition-opacity hover:opacity-80"
//                             style={{ 
//                               backgroundColor: 'rgba(105, 56, 239, 0.7)',
//                               color: '#ffffff'
//                             }}
//                           >
//                             View
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setCurrentPage(1)}
//                   disabled={currentPage === 1}
//                   className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity flex items-center"
//                   style={{
//                     backgroundColor: 'rgba(105, 56, 239, 0.2)',
//                     border: '1px solid rgba(105, 56, 239, 0.3)',
//                     color: '#6938ef'
//                   }}
//                   title="First page"
//                 >
//                   <ChevronLeft className="w-4 h-4" />
//                   <ChevronLeft className="w-4 h-4 -ml-3" />
//                 </button>
//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//                   <button
//                     key={page}
//                     onClick={() => setCurrentPage(page)}
//                     className={`px-3 py-1 rounded text-sm sm:text-base font-medium transition-opacity hover:opacity-80 ${
//                       currentPage === page
//                         ? 'bg-[#6938ef] text-white'
//                         : ''
//                     }`}
//                     style={currentPage !== page ? {
//                       backgroundColor: 'rgba(105, 56, 239, 0.2)',
//                       border: '1px solid rgba(105, 56, 239, 0.3)',
//                       color: '#6938ef'
//                     } : {}}
//                   >
//                     {page}
//                   </button>
//                 ))}
//                 <button
//                   onClick={() => setCurrentPage(totalPages)}
//                   disabled={currentPage === totalPages}
//                   className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity flex items-center"
//                   style={{
//                     backgroundColor: 'rgba(105, 56, 239, 0.2)',
//                     border: '1px solid rgba(105, 56, 239, 0.3)',
//                     color: '#6938ef'
//                   }}
//                   title="Last page"
//                 >
//                   <ChevronRight className="w-4 h-4" />
//                   <ChevronRight className="w-4 h-4 -ml-3" />
//                 </button>
//               </div>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//                   disabled={currentPage === 1}
//                   className="px-4 py-2 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 text-sm sm:text-base font-medium"
//                   style={{
//                     backgroundColor: 'rgba(105, 56, 239, 0.2)',
//                     border: '1px solid rgba(105, 56, 239, 0.3)',
//                     color: '#6938ef'
//                   }}
//                 >
//                   Prev
//                 </button>
//                 <button
//                   onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
//                   disabled={currentPage === totalPages}
//                   className="px-4 py-2 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 text-sm sm:text-base font-medium"
//                   style={{
//                     backgroundColor: 'rgba(105, 56, 239, 0.2)',
//                     border: '1px solid rgba(105, 56, 239, 0.3)',
//                     color: '#6938ef'
//                   }}
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>

    
//       <LeadModal
//         isOpen={showModal}
//         onClose={() => {
//           setShowModal(false);
//           setSelectedLead(null);
//         }}
//         onSave={() => {}} 
//         leadData={selectedLead}
//         mode="view"
//       />
//     </div>
//   );
// };

// export default ViewLeads;
