const generateTaskPrefix = (workspaceName) => {

    const cleanName = workspaceName.replace(/[^a-zA-Z0-9\s]/g, "").trim();

    let prefix = cleanName.split(/\s+/).map(word => word[0]).join('').substring(0, 4).toUpperCase();

    if (prefix.length === 1) {
        prefix = cleanName.substring(0, 3).toUpperCase();
    }

    return prefix;
}

module.exports = { generateTaskPrefix }