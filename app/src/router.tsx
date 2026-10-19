import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export type RouterAuth = {
    user: { id: string } | null;
    loading: boolean;
};

export const router = createRouter({
    routeTree,
    context: {
        auth: undefined!,
    },
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}
