import {
  FaServer,
  FaMapMarkerAlt,
  FaHdd,
  FaShieldAlt,
  FaBoxOpen,
  FaNetworkWired,
  FaGlobe,
  FaWater,
  FaCube,
  FaCloud,
  FaMap,
} from "react-icons/fa";

const ResourceGrid = ({ statsData }) => {
  if (!statsData) {
    return (
      <div className="bg-gradient-to-br from-[#1c2538] to-[#121a2a] rounded-md shadow-lg p-4 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-2 text-gray-400 text-sm">Loading resources...</p>
        </div>
      </div>
    );
  }

  const resources = [
    { 
      name: "Servers", 
      count: statsData.totalVmsCount, 
      icon: <FaServer className="h-5 w-5" />,
      type: "server",
      description: "Virtual machines",
      color: "indigo"
    },
    { 
      name: "Primary IPs", 
      count: statsData.totalIpsCount, 
      icon: <FaMapMarkerAlt className="h-5 w-5" />,
      type: "ip",
      description: "IP addresses",
      color: "blue"
    },
    { 
      name: "Volumes", 
      count: Math.max(1, Math.round(statsData.totalDiskSizeGb / 100)), // At least 1 volume
      icon: <FaHdd className="h-5 w-5" />,
      type: "volume",
      description: "Storage volumes",
      color: "purple"
    },
    { 
      name: "Firewalls", 
      count: "Coming Soon", 
      icon: <FaShieldAlt className="h-5 w-5" />,
      type: "firewall",
      description: "Security rules",
      color: "yellow",
      isComingSoon: true
    },
  ];

  // Get color classes based on type
  const getColorClasses = (type, isComingSoon) => {
    if (isComingSoon) {
      return {
        bg: 'bg-gray-900/30',
        text: 'text-gray-400',
        iconBg: 'bg-gray-800',
        iconText: 'text-gray-400'
      };
    }
    
    const colors = {
      server: {
        bg: 'bg-indigo-900/20',
        text: 'text-indigo-300',
        iconBg: 'bg-indigo-900/30',
        iconText: 'text-indigo-400'
      },
      ip: {
        bg: 'bg-blue-900/20',
        text: 'text-blue-300',
        iconBg: 'bg-blue-900/30',
        iconText: 'text-blue-400'
      },
      volume: {
        bg: 'bg-purple-900/20',
        text: 'text-purple-300',
        iconBg: 'bg-purple-900/30',
        iconText: 'text-purple-400'
      },
      firewall: {
        bg: 'bg-yellow-900/20',
        text: 'text-yellow-300',
        iconBg: 'bg-yellow-900/30',
        iconText: 'text-yellow-400'
      }
    };
    
    return colors[type] || colors.server;
  };

  return (
    <div className="bg-gradient-to-br from-[#1c2538] to-[#121a2a] rounded-md shadow-lg p-4 h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">Resources Overview</h2>
          <p className="text-gray-400 text-sm">Your active infrastructure</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-indigo-900/30 text-indigo-300 px-2 py-1 rounded">
            {statsData.totalVmsCount + statsData.totalIpsCount} Total
          </span>
        </div>
      </div>
      
      {/* Resources Grid */}
      <div className="grid grid-cols-2 gap-4">
        {resources.map((res) => {
          const colors = getColorClasses(res.type, res.isComingSoon);
          
          return (
            <div 
              key={res.name} 
              className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                res.isComingSoon 
                  ? 'border-gray-700 hover:border-gray-600' 
                  : 'border-gray-800 hover:border-indigo-500/50'
              } ${colors.bg}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${colors.iconBg} ${colors.iconText}`}>
                  {res.icon}
                </div>
                <div className="flex-1">
                  <span className="text-gray-300 text-sm font-medium">{res.name}</span>
                </div>
              </div>
              <div className="mt-2">
                {res.isComingSoon ? (
                  <span className="text-sm text-gray-400 italic">{res.count}</span>
                ) : (
                  <span className="text-2xl font-bold text-white">{res.count}</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">{res.description}</p>
              
              {/* Additional Details */}
              {!res.isComingSoon && res.type === 'volume' && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Storage Used</span>
                    <span>{statsData.totalDiskSizeGb} GB</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-1.5 rounded-full" 
                      style={{ width: `${Math.min((statsData.totalDiskSizeGb / 1000) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {!res.isComingSoon && res.type === 'server' && statsData.vmNames && statsData.vmNames.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-1">Servers:</p>
                  <div className="flex flex-wrap gap-1">
                    {statsData.vmNames.slice(0, 2).map((name, idx) => (
                      <span key={idx} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                        {name.length > 10 ? `${name.substring(0, 10)}...` : name}
                      </span>
                    ))}
                    {statsData.vmNames.length > 2 && (
                      <span className="text-xs text-gray-400 px-1">
                        +{statsData.vmNames.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {!res.isComingSoon && res.type === 'ip' && statsData.ipAddresses && statsData.ipAddresses.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-1">IPs:</p>
                  <div className="flex flex-wrap gap-1">
                    {statsData.ipAddresses.slice(0, 2).map((ip, idx) => (
                      <span key={idx} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">
                        {ip}
                      </span>   
                    ))}
                    {statsData.ipAddresses.length > 2 && (
                      <span className="text-xs text-gray-400 px-1">
                        +{statsData.ipAddresses.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResourceGrid;