function getCanvasFilter(filterName) {
    switch (filterName) {
        case "bw": return "grayscale(100%)";
        case "sepia": return "sepia(90%)";
        case "contrast": return "contrast(160%)";
        default: return "none";
    }
}
