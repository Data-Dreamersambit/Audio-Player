import React from "react";
import AllAudios from "../../features/audio/AllAudios";
function Home() {
  return (
    <div>
      {/* Audio Card Grid */}
      <div className="mt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <AllAudios />
        </div>
      </div>
    </div>
  );
}

export default Home;