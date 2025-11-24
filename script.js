// ==================================
//  QUOTED PRINTABLE MAP (YOUR INPUT)
// ==================================
const QP = {
    "A": "=41","B": "=42","C": "=43","D": "=44","E": "=45","F": "=46","G": "=47","H": "=48","I": "=49","J": "=4A",
    "K": "=4B","L": "=4C","M": "=4D","N": "=4E","O": "=4F","P": "=50","Q": "=51","R": "=52","S": "=53","T": "=54",
    "U": "=55","V": "=56","W": "=57","X": "=58","Y": "=59","Z": "=5A","a": "=61","b": "=62","c": "=63","d": "=64",
    "e": "=65","f": "=66","g": "=67","h": "=68","i": "=69","j": "=6A","k": "=6B","l": "=6C","m": "=6D","n": "=6E",
    "o": "=6F","p": "=70","q": "=71","r": "=72","s": "=73","t": "=74","u": "=75","v": "=76","w": "=77","x": "=78",
    "y": "=79","z": "=7A","0": "=30","1": "=31","2": "=32","3": "=33","4": "=34","5": "=35","6": "=36","7": "=37",
    "8": "=38","9": "=39"," ": "=20","!": "=21","\"": "=22","#": "=23","$": "=24","%": "=25","&": "=26","'": "=27",
    "(": "=28",")": "=29","*": "=2A","+": "=2B",",": "=2C","-": "=2D",".": "=2E","/": "=2F",":": "=3A",";": "=3B",
    "<": "=3C","=": "=3D",">": "=3E","?": "=3F","@": "=40","[": "=5B","\\": "=5C","]": "=5D","^": "=5E","_": "=5F",
    "`": "=60","{": "=7B","|": "=7C","}": "=7D","~":"=7E"
};

// Build reverse dictionary for decoding
const QP_REVERSE = {};
for (const key in QP) {
    QP_REVERSE[QP[key]] = key;
}

// ==================================
//  ENCODE FUNCTION (Your Logic)
// ==================================
function encodeQP() {
    const input = document.getElementById("input").value;
    let encoded = "";

    for (let char of input) {
        if (QP[char]) {
            encoded += QP[char];
        } else {
            // fallback: auto hex encode
            const hex = char.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0");
            encoded += "=" + hex;
        }
    }

    // Wrap lines at 76 chars
    encoded = encoded.replace(/.{76}/g, "$&=\r\n");

    document.getElementById("output").value = encoded;
}

// ==================================
//  DECODE FUNCTION (Reverse Logic)
// ==================================
function decodeQP() {
    let input = document.getElementById("input").value.trim();

    // Remove soft line breaks
    input = input.replace(/=\r?\n/g, "");

    let decoded = input.replace(/=([A-Fa-f0-9]{2})/g, (match) => {
        if (QP_REVERSE[match]) {
            return QP_REVERSE[match];
        }

        // fallback: convert any HEX =XX to a char
        return String.fromCharCode(parseInt(match.substring(1), 16));
    });

    document.getElementById("output").value = decoded;
}

// ==================================
//  EXTRA FUNCTIONS
// ==================================
function clearText() {
    document.getElementById("input").value = "";
    document.getElementById("output").value = "";
}

function copyOutput() {
    const out = document.getElementById("output");
    out.select();
    document.execCommand("copy");
    alert("Output copied!");
}
