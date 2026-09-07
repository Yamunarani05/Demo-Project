// src/pages/Login/Unauthorized.tsx
const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-xl shadow-md px-8 py-6 text-center">
        <h1 className="text-xl font-bold text-slate-900 mb-2">
          Unauthorized
        </h1>
        <p className="text-sm text-slate-600 mb-4">
          You do not have permission to view this page.
        </p>
        <a
          href="/"
          className="inline-block bg-[#6938ef] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#5a2dd4] transition-colors"
        >
          Go to Login
        </a>
      </div>
    </div>
  );
};

export default Unauthorized;
