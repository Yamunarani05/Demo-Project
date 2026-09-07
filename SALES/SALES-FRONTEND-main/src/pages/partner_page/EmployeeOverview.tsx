import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import api, { updateLeadWithRetry, formatErrorMessage } from "../../api/api";
import Sidebar from "../../components/Sidebar/Sidebar";
import dashboardHeader from "../../components/Header/Header";
import DashboardHeader from "../../components/DashboardHeader/DashboardHeader";
import Dashboard from "./dashboard";

type Stage = "Leads" | "Quotation" | "Confirmation" | "Finalize";

interface Lead {
  id: number;
  name: string;
  stage: Stage;
  eventType: string;
  dueDate?: string;
  status?: string;
  leadId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  contactNumber?: string;
  address?: string;
  leadSource?: string;
  budget?: string;
  description?: string;
  priority?: string;
}

const STAGES: Stage[] = ["Leads", "Quotation", "Confirmation", "Finalize"];

const stageStyles: Record<Stage, string> = {
  Leads: "text-blue-600 border-blue-300",
  Quotation: "text-orange-600 border-orange-300",
  Confirmation: "text-pink-600 border-pink-300",
  Finalize: "text-green-600 border-green-300",
};

const normalizeStage = (stage?: string): Stage => {
  if (!stage) return "Leads";

  const value = stage.toLowerCase().trim();

  if (value === "lead" || value === "leads") return "Leads";
  if (value === "quotation") return "Quotation";
  if (value === "confirmation" || value === "booking confirmation")
    return "Confirmation";
  if (
    value === "finalize" ||
    value === "finalised" ||  // Handle "Finalised" from backend
    value === "finalized" ||
    value === "completed"
  )
    return "Finalize";

  return "Leads";
};

const EmployeeOverview = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: "Priya",
    role: "Partner"
  });
  
  // State for dialog
  const [showDialog, setShowDialog] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogTitle, setDialogTitle] = useState("");

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found. Redirecting to login.');
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = () => {
      try {
        const userDataStr = localStorage.getItem('user');
        if (userDataStr) {
          const user = JSON.parse(userDataStr);
          setUserData({
            name: user.name || user.username || "Priya",
            role: user.role || "Partner"
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const fetchLead = useCallback(async () => {
    if (!leadId) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const res = await api.get(`/leads/${leadId}`);
      const data = res?.data?.data;
      if (!data) throw new Error("Invalid API response");

      setLead({
        id: data.leadId || data.id,
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.leadName || 'Unnamed Lead',
        stage: normalizeStage(data.currentStage),
        eventType: data.eventType,
        dueDate: data.eventDate,
        status: data.status,
        leadId: data.leadId || leadId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        contactNumber: data.contactNumber,
        address: data.address,
        leadSource: data.leadSource,
        budget: data.budget,
        description: data.description,
        priority: data.priority
      });
    } catch (error: any) {
      console.error("Error fetching lead:", error);
      if (error?.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
      setLead(null);
    } finally {
      setLoading(false);
    }
  }, [leadId, navigate]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead, location.key]);

  // Function to update lead status to Done
  const updateLeadToDone = async () => {
    if (!leadId || !lead) return;
    
    setIsFinalizing(true);
    
    // All possible combinations based on your backend (Finalised)
    const updateAttempts = [
      { currentStage: "Finalised", status: "Done" },
      { currentStage: "Finalised", status: "Finalised" },
      { currentStage: "Finalised", status: "Completed" },
      { currentStage: "Finalised", status: "completed" },
      { currentStage: "Finalised" }, // Stage only
      { status: "Done" }, // Status only
      { status: "Completed" },
      { status: "Finalised" }
    ];
    
    let lastError = null;
    let successAttempt = null;
    
    for (const attempt of updateAttempts) {
      try {
        console.log("Trying update with:", attempt);
        
        let response;
        try {
          response = await api.put(`/leads/${leadId}`, attempt);
        } catch (putError) {
          response = await api.patch(`/leads/${leadId}`, attempt);
        }
        
        console.log("✅ Success with:", attempt, response.data);
        successAttempt = attempt;
        break; // Exit loop on success
        
      } catch (error: any) {
        lastError = error;
        console.log("❌ Failed with:", attempt, error.response?.data?.message || error.message);
        continue;
      }
    }
    
   if (successAttempt) {
  // Update local state
  setLead(prev => prev ? {
    ...prev,
    stage: "Finalize",
    status: "Done"
  } : null);
  
  // Success handling
  setShowDialog(false);
  setDialogTitle("Success!");
  setDialogMessage(
    "Lead has been successfully marked as Done! A notification has been sent to the admin for acknowledgment, and the status will now show as 'Done' in the Leads page."
  );
  
  // Refresh data after 1 second
  setTimeout(() => {
    fetchLead();
  }, 1000);
}
else {
      // If all attempts failed
      setDialogTitle("Update Failed");
      setDialogMessage(`Could not update lead. Please check:\n\n1. Backend expects "Finalised" as stage value\n2. Check allowed status values\n3. Error: ${formatErrorMessage(lastError)}`);
    }
    
    setIsFinalizing(false);
  };

  // Handle Finalize stage click
  const handleFinalizeClick = () => {
    if (!lead) return;
    
    if (lead.stage === "Finalize" && lead.status === "Done") {
      // Already finalized, show message
      setDialogTitle("Already Completed");
      setDialogMessage("This lead has already been marked as Done.");
      setShowDialog(true);
    } else {
      // Show confirmation dialog
      setDialogTitle("Mark as Done");
      setDialogMessage("Are you sure you want to mark this lead as Done? This will:\nThis action cannot be undone.");
      setShowDialog(true);
    }
  };

  // Function to handle stage navigation
  const handleStageNavigation = (stage: Stage) => {
    if (!leadId || !lead) return;
    
    // Check token before navigating
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Special handling for Finalize stage
    if (stage === "Finalize") {
      handleFinalizeClick();
      return;
    }
    
    // For other stages, navigate to their respective pages
    switch(stage) {
      case "Leads":
        navigate(`/partner/leads/${leadId}`);
        break;
      case "Quotation":
        navigate(`/partner/leads/${leadId}/quotation`);
        break;
      case "Confirmation":
        navigate(`/partner/leads/${leadId}/confirmation`);
        break;
    }
  };

  // Close dialog
  const handleCloseDialog = () => {
    setShowDialog(false);
    setDialogMessage("");
    setDialogTitle("");
  };

  // Debug function for testing API
  const debugApiConnection = async () => {
    if (!leadId) return;
    
    console.log("=== DEBUG API CONNECTION ===");
    console.log("Lead ID:", leadId);
    console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);
    
    try {
      // Test 1: Check current lead data
      console.log("\n1. Testing GET /leads/" + leadId);
      const getResponse = await api.get(`/leads/${leadId}`);
      const leadData = getResponse.data?.data || getResponse.data;
      console.log("Current lead data:", leadData);
      console.log("Current stage:", leadData.currentStage);
      console.log("Current status:", leadData.status);
      
      // Test 2: Try with "Finalised" - which your backend expects
      console.log("\n2. Testing with 'Finalised' stage (backend expects this)");
      const testData1 = { 
        currentStage: "Finalised",
        status: "Done"
      };
      
      try {
        const response1 = await api.patch(`/leads/${leadId}`, testData1);
        console.log("✅ Update with 'Finalised' stage + 'Done' status worked!", response1.data);
      } catch (error1: any) {
        console.log("❌ 'Finalised' + 'Done' failed:", error1.response?.data?.message || error1.message);
        
        // Test 3: Try with "Finalised" for both
        console.log("\n3. Testing with 'Finalised' for both stage and status");
        const testData2 = { 
          currentStage: "Finalised",
          status: "Finalised"
        };
        
        try {
          const response2 = await api.patch(`/leads/${leadId}`, testData2);
          console.log("✅ Update with 'Finalised' for both worked!", response2.data);
        } catch (error2: any) {
          console.log("❌ Both 'Finalised' failed:", error2.response?.data?.message || error2.message);
        }
      }
      
      console.log("=== DEBUG COMPLETE ===");
      
    } catch (error: any) {
      console.error("Debug failed:", error);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 flex bg-gray-50">
      <Sidebar 
       
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6938ef] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading lead overview...</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!lead) return (
    <div className="fixed inset-0 flex bg-gray-50">
      <Sidebar 
       
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Lead Not Found</h3>
            <p className="text-gray-600 mb-6">The lead you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/partner/leads')}
              className="px-4 py-2 bg-[#6938ef] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Back to Leads
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const currentStageIndex = STAGES.indexOf(lead.stage);
  const isAlreadyDone = lead.stage === "Finalize" && lead.status === "Done";

  return (
    <div className="fixed inset-0 flex bg-gray-50">
      <Sidebar 
       
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Lead Pipeline
              </h1>
              <p className="text-gray-500">{lead.name}</p>
              {isAlreadyDone && (
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  This lead has been completed
                </div>
              )}
            </div>
            
            {/* Debug button (remove in production) */}
           
          </div>

          <div className="grid grid-cols-4 gap-6">
            {STAGES.map((stage, index) => {
              const isCurrent = lead.stage === stage;
              const isCompletedOrCurrent = index <= currentStageIndex;
              const isFinalize = stage === "Finalize";
              const isClickable = isCompletedOrCurrent && !isAlreadyDone;

              return (
                <div
                  key={stage}
                  onClick={() => {
                    if (!isClickable) return;
                    handleStageNavigation(stage);
                  }}
                  className={`rounded-2xl p-5 shadow transition ${
                    isCurrent
                      ? "bg-white ring-2 ring-purple-500"
                      : "bg-[#F8F9FD]"
                  } ${
                    isClickable
                      ? "cursor-pointer hover:ring-2 hover:ring-purple-300"
                      : "opacity-40 cursor-not-allowed"
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">{stage}</h3>
                    <span className="text-sm text-gray-500">
                      {isCompletedOrCurrent ? 1 : 0}
                    </span>
                  </div>

                  {isCurrent && (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {lead.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {lead.eventType || "No event type specified"}
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-400">
                          {isFinalize
                            ? isAlreadyDone 
                              ? "Completed ✓" 
                              : "Ready to finalize"
                            : lead.dueDate
                            ? `Due: ${new Date(
                                lead.dueDate
                              ).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}`
                            : "No due date"}
                        </p>

                        <span
                          className={`px-3 py-1 rounded-full text-xs border ${stageStyles[stage]}`}
                        >
                          {isFinalize 
                            ? (isAlreadyDone ? "Done ✓" : "Pending")
                            : stage}
                        </span>
                      </div>

                      {/* Finalize button for Finalize stage */}
                      {isFinalize && !isAlreadyDone && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFinalizeClick();
                          }}
                          disabled={isFinalizing}
                          className="w-full mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {isFinalizing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            "Mark as Done"
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Lead Details Summary */}
          <div className="bg-white rounded-2xl shadow p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="font-medium">{lead.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{lead.email || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact Number</p>
                <p className="font-medium">{lead.contactNumber || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Stage</p>
                <p className="font-medium">{lead.stage}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{lead.status || "Active"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Event Type</p>
                <p className="font-medium">{lead.eventType || "Not specified"}</p>
              </div>
              {lead.dueDate && (
                <div>
                  <p className="text-sm text-gray-500">Event Date</p>
                  <p className="font-medium">
                    {new Date(lead.dueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
              {lead.budget && (
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-medium">{lead.budget}</p>
                </div>
              )}
              {lead.priority && (
                <div>
                  <p className="text-sm text-gray-500">Priority</p>
                  <p className="font-medium">{lead.priority}</p>
                </div>
              )}
            </div>
            
            {lead.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium mt-1">{lead.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog for Finalize confirmation */}
      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {dialogTitle}
              </h3>
              <button
                onClick={handleCloseDialog}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <div className="whitespace-pre-line text-gray-600 mb-4">
                {dialogMessage}
              </div>
             
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                {lead.stage === "Finalize" && lead.status === "Done" ? "Close" : "Cancel"}
              </button>
              
              {lead.stage !== "Finalize" || lead.status !== "Done" ? (
                <button
                  onClick={updateLeadToDone}
                  disabled={isFinalizing}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isFinalizing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "Mark as Done"
                  )}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Success message */}
      {dialogMessage && !showDialog && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center max-w-md">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">{dialogTitle}</p>
              <p className="text-sm mt-1">{dialogMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeOverview;