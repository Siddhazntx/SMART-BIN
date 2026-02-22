// import React from "react";

// const NotificationAlert: React.FC = () => {
//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-transparent">
//       <div className="bg-sidebar-accent bg-opacity-90 rounded-xl shadow-xl p-10 max-w-md w-full border border-sidebar-accent-foreground">
//         <h1 className="text-3xl font-bold mb-4 text-sidebar-accent-foreground flex items-center gap-2">
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-sidebar-accent-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
//           Notification Alert
//         </h1>
//         <p className="text-sidebar-foreground mb-6">This is your notification alert page. You can display important messages, alerts, or updates here for your users.</p>
//         {/* Add more notification UI or logic here as needed */}
//       </div>
//     </div>
//   );
// };

// export default NotificationAlert;

// import { useState, useEffect } from "react";

// // Define the shape of your bin data
// interface BinStatus {
//   full: boolean;
//   distance: number;
//   timestamp: string;
// }

// const NotificationAlert = () => {
//   const [binStatus, setBinStatus] = useState<BinStatus | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // 🔁 Fetch data from your Node.js backend
//   const fetchBinStatus = async () => {
//     try {
//       // ⚠️ REPLACE WITH YOUR WINDOWS PC'S IP (e.g., 192.168.1.50)
//       const response = await fetch("http://172.168.5.99/bin");
      
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data: BinStatus = await response.json();
//       setBinStatus(data);
//       setError(null);
//     } catch (err) {
//       console.error("Failed to fetch bin status:", err);
//       setError("Unable to connect to sensor data");
//       setBinStatus(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 🔄 Fetch on mount + every 5 seconds
//   useEffect(() => {
//     fetchBinStatus(); // initial fetch
//     const interval = setInterval(fetchBinStatus, 5000);
//     return () => clearInterval(interval); // cleanup on unmount
//   }, []);

//   // 💡 Helper: Format timestamp
//   const formatTime = (isoString: string) => {
//     return new Date(isoString).toLocaleTimeString();
//   };

//   return (
//     <div className="p-6 max-w-2xl mx-auto">
//       <h1 className="text-2xl font-bold mb-6">Smart Bin Notification</h1>

//       {loading && <p className="text-muted-foreground">Loading bin status...</p>}

//       {error && (
//         <div className="bg-destructive/10 text-destructive p-4 rounded-md">
//           ⚠️ {error}
//         </div>
//       )}

//       {binStatus && !loading && !error && (
//         <div className="space-y-4">
//           <div
//             className={`p-6 rounded-lg border text-center ${
//               binStatus.full
//                 ? "bg-red-50 border-red-200"
//                 : "bg-green-50 border-green-200"
//             }`}
//           >
//             <h2 className="text-xl font-semibold">
//               {binStatus.full ? "🗑️ Bin is FULL!" : "✅ Bin is NOT full"}
//             </h2>
//             <p className="text-sm text-muted-foreground mt-2">
//               Distance: {binStatus.distance} cm
//             </p>
//             <p className="text-xs text-muted-foreground mt-1">
//               Last updated: {formatTime(binStatus.timestamp)}
//             </p>
//           </div>

//           {binStatus.full && (
//             <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
//               <p className="text-yellow-700">
//                 🚨 Action Required: Schedule waste collection immediately!
//               </p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationAlert;


import { useState, useEffect } from "react";

// Match the exact response from your Flask backend
interface BinStatus {
  distance: number;
  isOrganic: boolean;
  isFull: boolean;
  lastUpdate: string;
}

const NotificationAlert = () => {
  const [binStatus, setBinStatus] = useState<BinStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBinStatus = async () => {
    try {
      // Fetch from your Flask backend (port 5000)
      const response = await fetch("http://172.16.1.253:5000/api/bin-status");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BinStatus = await response.json();
      setBinStatus(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch bin status:", err);
      setError("Unable to connect to sensor data");
      setBinStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBinStatus();
    const interval = setInterval(fetchBinStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString();
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Smart Bin Notification</h1>

      {loading && <p className="text-muted-foreground">Loading bin status...</p>}

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          ⚠️ {error}
        </div>
      )}

      {binStatus && !loading && !error && (
        <div className="space-y-4">
          <div
            className={`p-6 rounded-lg border text-center ${
              binStatus.isFull
                ? "bg-red-50 border-red-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <h2 className="text-xl font-semibold">
              {binStatus.isFull ? "🗑️ Bin is FULL!" : "✅ Bin is NOT full"}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Waste Type: {binStatus.isOrganic ? "Organic" : "Non-Organic"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Distance: {binStatus.distance.toFixed(1)} cm
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated: {formatTime(binStatus.lastUpdate)}
            </p>
          </div>

          {binStatus.isFull && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-yellow-700">
                🚨 Action Required: Schedule waste collection immediately!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationAlert;