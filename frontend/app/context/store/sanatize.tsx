// app/components/UtilityProvider.tsx
import { createContext, useContext, ReactNode } from "react";
import { ZodUtility } from "~/utils";

// Create the context to provide ZodUtility methods
const ZodUtilityContext = createContext<typeof ZodUtility | null>(null);

export const UtilityProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ZodUtilityContext.Provider value={ZodUtility}>
      {children}
    </ZodUtilityContext.Provider>
  );
};

// Hook to use the ZodUtility within components
export const useZodUtility = () => {
  const context = useContext(ZodUtilityContext);
  if (!context) {
    throw new Error("useZodUtility must be used within a UtilityProvider");
  }
  return context;
};
