function getCanvasFilter(filterName) {
    switch (filterName) {
        case "bw": return "grayscale(100%)";
        case "sepia": return "sepia(90%)";
        case "contrast": return "contrast(160%)";
        case "brightness": return "brightness(120%)";
        case "saturation": return "saturate(160%)";
        case "hue-rotate": return "hue-rotate(90deg)";
        case "invert": return "invert(100%)";

        // Retro
        case "film": return "brightness(90%) contrast(120%) saturate(80%) sepia(30%)";
        case "vintage": return "sepia(40%) contrast(110%) brightness(95%)";
        case "washed": return "brightness(110%) saturate(60%) contrast(90%)";
        case "noir": return "grayscale(100%) contrast(130%) brightness(90%)";

        // Color pop
        case "lomo": return "contrast(140%) saturate(180%)";
        case "cyber": return "hue-rotate(200deg) saturate(200%) contrast(120%)";
        case "dream": return "brightness(130%) saturate(140%)";

        // Temperature
        case "cool": return "brightness(105%) saturate(120%) hue-rotate(200deg)";
        case "warm": return "brightness(110%) saturate(130%) sepia(20%)";

        // Stylized
        case "posterize": return "contrast(200%) saturate(200%) brightness(80%)";
        case "harsh": return "contrast(180%) brightness(80%)";
        case "flat": return "contrast(70%) saturate(80%)";

        // Instagram-ish
        case "kelvin": return "brightness(110%) saturate(150%) sepia(10%)";
        case "clarendon": return "contrast(120%) brightness(110%) saturate(120%)";
        case "gingham": return "brightness(105%) contrast(90%) sepia(10%)";
        case "moon": return "grayscale(100%) contrast(120%) brightness(110%)";
        case "slumber": return "brightness(110%) saturate(120%) contrast(90%)";

        case "custom":   return customValue || "none";  // <- accepts raw filter
        default:         return "none";
    }
}
