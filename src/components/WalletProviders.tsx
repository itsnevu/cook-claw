"use client";

import { type ReactNode, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";

const wagmiConfig = createConfig({
    chains: [base, mainnet],
    connectors: [injected()],
    transports: {
        [base.id]: http(),
        [mainnet.id]: http(),
    },
});

export function WalletProviders({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </WagmiProvider>
    );
}

