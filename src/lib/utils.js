export function formatDuration(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

export function formatMessageTime(date) {
    return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
}

export function getImageSrc(path) {
    if (!path) return "/avatar.png";

    // If we have an old absolute URL with localhost:5001, we strip it out
    // to force the relative proxy path
    if (path.includes("localhost:5001/uploads/")) {
        return path.replace(/^(http:\/\/|https:\/\/)localhost:5001/, "");
    }

    return path;
}
