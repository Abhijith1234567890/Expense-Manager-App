const config = {
    content: [
        "./app/**/*.{js,jsx}",
        "./components/**/*.{js,jsx}",
        "./lib/**/*.js",
        "./store/**/*.js"
    ],
    theme: {
        extend: {
            colors: {
                ink: "#162019",
                muted: "#637267",
                paper: "#fbfcf8",
                line: "#dbe3d8",
                forest: "#1d6b4f",
                mint: "#dff2e5",
                coral: "#d75f4a",
                gold: "#b78119",
                ocean: "#266f9d"
            },
            boxShadow: {
                soft: "0 16px 48px rgba(35, 47, 39, 0.08)"
            }
        }
    },
    plugins: []
};

export default config;

