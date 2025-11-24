
const QP = {
  "A":"=41","B":"=42","C":"=43","D":"=44","E":"=45","F":"=46","G":"=47","H":"=48","I":"=49","J":"=4A","K":"=4B",
  "L":"=4C","M":"=4D","N":"=4E","O":"=4F","P":"=50","Q":"=51","R":"=52","S":"=53","T":"=54","U":"=55","V":"=56",
  "W":"=57","X":"=58","Y":"=59","Z":"=5A","a":"=61","b":"=62","c":"=63","d":"=64","e":"=65","f":"=66","g":"=67",
  "h":"=68","i":"=69","j":"=6A","k":"=6B","l":"=6C","m":"=6D","n":"=6E","o":"=6F","p":"=70","q":"=71","r":"=72",
  "s":"=73","t":"=74","u":"=75","v":"=76","w":"=77","x":"=78","y":"=79","z":"=7A","0":"=30","1":"=31","2":"=32",
  "3":"=33","4":"=34","5":"=35","6":"=36","7":"=37","8":"=38","9":"=39"," ":"=20"
};

const inputEl = document.getElementById('input');
const outputEl = document.getElementById('output');

function encodeText(text){
  let out = '';
  for(const ch of text){
    if(QP[ch]) { out += QP[ch]; continue; }
    const cp = ch.codePointAt(0);
    out += cp <= 0xFF ? `=${cp.toString(16).toUpperCase().padStart(2,'0')}` : `=?${cp.toString(16).toUpperCase()}?`;
  }
  return out;
}

function decodeText(s){
  return s.replace(/=(\?[0-9A-Fa-f]+\?)|=([0-9A-Fa-f]{2})/g, (m,p1,p2)=>{
    if(p2) return String.fromCharCode(parseInt(p2,16));
    if(p1){
      const hex = p1.slice(1,-1);
      return String.fromCodePoint(parseInt(hex,16));
    }
    return m;
  });
}

function cleanText(text){
  return text.replace(/(=\?[0-9A-Fa-f]+\?)|=[0-9A-Fa-f]{2}/g,'');
}

document.getElementById('encodeBtn').addEventListener('click', ()=>{
  outputEl.textContent = encodeText(inputEl.value);
});

document.getElementById('decodeBtn').addEventListener('click', ()=>{
  outputEl.textContent = decodeText(inputEl.value);
});

document.getElementById('cleanBtn').addEventListener('click', ()=>{
  inputEl.value = cleanText(inputEl.value);
  outputEl.textContent = '';
});

document.getElementById('copyOutBtn').addEventListener('click', ()=>{
  navigator.clipboard.writeText(outputEl.textContent);
});

document.getElementById('copyInBtn').addEventListener('click', ()=>{
  navigator.clipboard.writeText(inputEl.value);
});
