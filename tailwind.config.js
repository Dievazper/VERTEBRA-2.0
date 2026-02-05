module.exports = {
    content: ["./views/**/*.ejs"],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            colors: {
                'brand-dark': '#0f172a',
                'brand-primary': '#6366f1',
                'brand-secondary': '#8b5cf6',
            }
        },
    },
    plugins: [],
}
