function encodeQP() {
    let text = document.getElementById("input").value;
    let encoded = text.replace(/[\t\x20-\x7E]/g, function (c) {
        return c;
    }).replace(/[^\t\x20-\x7E]/g, function (c) {
        return "=" + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0");
    });

    document.getElementById("output").value = encoded;
}

function decodeQP() {
    let text = document.getElementById("input").value;
    let decoded = text.replace(/=([A-Fa-f0-9]{2})/g, function (match, hex) {
        return String.fromCharCode(parseInt(hex, 16));
    });

    document.getElementById("output").value = decoded;
}
