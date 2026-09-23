import "../css/app.css";
import "./bootstrap";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";

const pages = import.meta.glob("./Pages/**/*.jsx");

createInertiaApp({
    resolve: (name) => {
        return resolvePageComponent(
            "./Pages/" + name + ".jsx",
            pages
        );
    },

    setup({ el, App, props }) {
        createRoot(el).render(
            <App {...props} />
        );
    },
});