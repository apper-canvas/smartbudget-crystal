import { motion } from "framer-motion";

const Loading = ({ type = "default" }) => {
  if (type === "dashboard") {
    return (
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card-premium p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
                <div className="h-8 bg-gray-300 rounded mb-2 w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-premium p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
              <div className="h-64 bg-gray-100 rounded"></div>
            </div>
          </div>
          <div className="card-premium p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
              <div className="h-64 bg-gray-100 rounded"></div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card-premium p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="card-premium p-4">
            <div className="animate-pulse flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "chart") {
    return (
      <div className="card-premium p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-6 w-1/3"></div>
          <div className="h-80 bg-gray-100 rounded flex items-center justify-center">
            <div className="text-gray-400">Loading chart...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full"
      ></motion.div>
    </div>
  );
};

export default Loading;