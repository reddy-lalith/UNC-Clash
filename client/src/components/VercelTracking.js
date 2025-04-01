import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

const VercelTracking = () => {
  return (
    <>
      <Analytics 
        beforeSend={(event) => {
          // Custom function to process events before sending
          return event;
        }}
        debug={false}
        mode="production"
        // Custom path to avoid AdBlock
        basePath="/aura-stats"
      />
      <SpeedInsights
        // Custom path to avoid AdBlock
        basePath="/aura-speed"
      />
    </>
  );
};

export default VercelTracking; 