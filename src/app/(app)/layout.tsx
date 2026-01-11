import React from 'react';

// This layout is now just a pass-through. 
// The actual layout logic is handled by the ClientLayout in the root.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
